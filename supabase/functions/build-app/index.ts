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

    // AI prompt to analyze code and generate mobile-ready app structure
    const systemPrompt = `Du bist ein Experte für Mobile-App-Entwicklung mit Capacitor. Analysiere den Code und erstelle eine vollständige, mobile-fähige App-Struktur.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt in diesem exakten Format:
{
  "appName": "string",
  "description": "string",
  "files": [
    {
      "name": "string (z.B. src/App.tsx, public/manifest.json, capacitor.config.ts)",
      "content": "string (vollständiger Dateiinhalt)",
      "type": "string (typescript, json, html, css, etc.)"
    }
  ],
  "buildInstructions": "string (Schritt-für-Schritt APK-Build-Anleitung)",
  "packageJson": {
    "name": "string",
    "version": "0.1.0",
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "@capacitor/core": "^6.0.0",
      "@capacitor/android": "^6.0.0",
      "@capacitor/ios": "^6.0.0"
    },
    "devDependencies": {
      "@capacitor/cli": "^6.0.0",
      "vite": "^5.0.0"
    },
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "cap:sync": "cap sync",
      "cap:android": "cap open android",
      "cap:build": "npm run build && cap sync"
    }
  }
}

PFLICHT-DATEIEN die du erstellen MUSST:
1. capacitor.config.ts - Mit App-ID (com.example.appname), Name, webDir: "dist"
2. public/manifest.json - PWA Manifest mit Icons, Theme-Farben
3. index.html - Muss <link rel="manifest"> enthalten
4. vite.config.ts - Vite Konfiguration
5. src/App.tsx oder src/main.js - Haupt-App-Code
6. src/index.css - Basis-Styling

BUILD-ANLEITUNG muss enthalten:
1. npm install
2. npm run build
3. npx cap add android (beim ersten Mal)
4. npx cap sync
5. npx cap open android
6. In Android Studio: Build → Build Bundle(s)/APK(s) → Build APK(s)
7. APK befindet sich in android/app/build/outputs/apk/debug/

Erstelle eine moderne React-App die sowohl als PWA als auch als native Mobile-App funktioniert!`;

    const userPrompt = `Sprache: ${language}
    
Code:
\`\`\`${language}
${code}
\`\`\`

Erstelle eine vollständige MOBILE-FÄHIGE Capacitor-App basierend auf diesem Code.
Die App muss als APK kompilierbar sein und auch als PWA funktionieren.`;

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
