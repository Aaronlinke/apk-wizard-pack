import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();
    console.log('Building app from code:', { language, codeLength: code?.length });

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: 'Code und Sprache sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY nicht konfiguriert');
    }

    // Simplified, focused system prompt for reliable JSON output
    const systemPrompt = `Du bist ein Code-zu-Web-App-Konverter. Wandle den gegebenen Code in ein vollständiges Vite + React + TypeScript Projekt um.

WICHTIG: Antworte NUR mit einem JSON-Objekt, KEIN Text davor oder danach!

Das JSON muss exakt dieses Format haben:
{
  "appName": "app-name-kebab-case",
  "description": "Kurze Beschreibung der App",
  "files": [
    {"name": "package.json", "content": "...", "type": "json"},
    {"name": "vite.config.ts", "content": "...", "type": "typescript"},
    {"name": "tsconfig.json", "content": "...", "type": "json"},
    {"name": "index.html", "content": "...", "type": "html"},
    {"name": "src/main.tsx", "content": "...", "type": "typescript"},
    {"name": "src/App.tsx", "content": "...", "type": "typescript"},
    {"name": "src/index.css", "content": "...", "type": "css"},
    {"name": "tailwind.config.js", "content": "...", "type": "javascript"},
    {"name": "postcss.config.js", "content": "...", "type": "javascript"}
  ],
  "buildInstructions": "Markdown Build-Anleitung",
  "packageJson": { "name": "...", "version": "1.0.0", ... }
}

PFLICHT-DATEIEN:
1. package.json - mit react, react-dom, vite, typescript, tailwindcss
2. vite.config.ts - Vite + React Plugin
3. tsconfig.json - TypeScript Config
4. index.html - Root HTML mit <div id="root">
5. src/main.tsx - React Entry Point
6. src/App.tsx - Hauptkomponente mit dem umgewandelten Code
7. src/index.css - Tailwind CSS Imports + Styles
8. tailwind.config.js - Tailwind Konfiguration
9. postcss.config.js - PostCSS für Tailwind

REGELN:
- Wandle den User-Code intelligent in React/TypeScript um
- Nutze Tailwind CSS für modernes Styling
- Füge sinnvolle UI-Verbesserungen hinzu
- Der Code muss FEHLER-FREI und lauffähig sein
- Escape alle Strings korrekt für JSON (\\n, \\", etc.)`;

    const userPrompt = `Sprache: ${language}

Code:
${code}

Erstelle ein vollständiges Vite + React + TypeScript Projekt. Antworte NUR mit dem JSON-Objekt!`;

    console.log('Calling AI to analyze code...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate-Limit erreicht. Bitte versuche es in ein paar Minuten erneut.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Keine Antwort von AI erhalten');
    }

    console.log('Raw AI content length:', content.length);

    // Extract JSON from response
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.includes('```')) {
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    }
    
    // Find JSON object boundaries
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }

    let buildResult;
    try {
      buildResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content preview (first 1000 chars):', jsonContent.substring(0, 1000));
      
      // Try to fix common JSON issues
      try {
        // Fix unescaped newlines in strings
        const fixedContent = jsonContent
          .replace(/:\s*"([^"]*(?:[^\\]"[^"]*)*?)"/g, (_match: string, content: string) => {
            const fixed = content.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            return `: "${fixed}"`;
          });
        buildResult = JSON.parse(fixedContent);
        console.log('Fixed JSON parse successful');
      } catch (fixError) {
        console.error('Fixed JSON also failed:', fixError);
        
        return new Response(
          JSON.stringify({ 
            error: 'Die AI-Antwort konnte nicht verarbeitet werden. Bitte versuche es erneut mit einem einfacheren Code.',
            details: parseError instanceof Error ? parseError.message : 'JSON Parse Error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Validate the result has required fields
    if (!buildResult.appName || !buildResult.files || !Array.isArray(buildResult.files)) {
      console.error('Invalid build result structure:', Object.keys(buildResult));
      return new Response(
        JSON.stringify({ 
          error: 'Die generierte App-Struktur ist unvollständig. Bitte versuche es erneut.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Build result:', { 
      appName: buildResult.appName, 
      filesCount: buildResult.files?.length 
    });

    return new Response(
      JSON.stringify(buildResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in build-app function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler beim App-Build'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
