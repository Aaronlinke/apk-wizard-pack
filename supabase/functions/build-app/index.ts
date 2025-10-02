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

    // AI prompt to analyze code and generate app structure
    const systemPrompt = `Du bist ein Code-Analyse-Experte. Analysiere den bereitgestellten Code und erstelle eine vollständige App-Struktur.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt in diesem exakten Format:
{
  "appName": "string",
  "description": "string",
  "files": [
    {
      "name": "string (z.B. index.html, main.js, style.css)",
      "content": "string (vollständiger Dateiinhalt)",
      "type": "string (html, javascript, css, json, etc.)"
    }
  ],
  "buildInstructions": "string (kurze Anleitung zum Ausführen)",
  "packageJson": null oder { "name": "...", "dependencies": {...} }
}

Regeln:
- Erstelle IMMER eine lauffähige, vollständige App
- Für HTML: Erstelle index.html mit vollständigem HTML5-Markup
- Für JavaScript: Erstelle alle nötigen Dateien (main.js, package.json wenn Node.js)
- Für Python: Erstelle main.py und requirements.txt
- Integriere den User-Code sinnvoll
- Füge fehlende Dependencies/Imports hinzu
- Erstelle einen funktionalen Starter`;

    const userPrompt = `Sprache: ${language}
    
Code:
\`\`\`${language}
${code}
\`\`\`

Erstelle eine vollständige, lauffähige App basierend auf diesem Code.`;

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
        temperature: 0.7,
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

    // Extract JSON from potential markdown code blocks
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    let buildResult;
    try {
      buildResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content:', jsonContent);
      throw new Error('Konnte AI-Antwort nicht verarbeiten');
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
