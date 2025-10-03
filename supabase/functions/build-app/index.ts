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
    const systemPrompt = `Du bist ein Elite-Experte für Production-Ready Mobile-App-Entwicklung mit Capacitor, React, TypeScript und Progressive Web Apps.

Analysiere den Code und erstelle eine VOLLSTÄNDIGE, PROFESSIONELLE, PRODUCTION-READY Mobile-App mit ALLEN notwendigen Dateien.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt in diesem exakten Format:
{
  "appName": "string (kebab-case, z.B. my-awesome-app)",
  "description": "string (detaillierte Beschreibung der App)",
  "files": [
    {
      "name": "string (exakter Dateipfad)",
      "content": "string (vollständiger, fehlerfreier Code)",
      "type": "string (typescript, json, html, css, markdown, etc.)"
    }
  ],
  "buildInstructions": "string (detaillierte Markdown-formatierte Anleitung)",
  "packageJson": {
    "name": "string",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "@capacitor/core": "^6.1.0",
      "@capacitor/android": "^6.1.0",
      "@capacitor/ios": "^6.1.0",
      "@capacitor/app": "^6.0.0",
      "@capacitor/splash-screen": "^6.0.0",
      "@capacitor/status-bar": "^6.0.0"
    },
    "devDependencies": {
      "@capacitor/cli": "^6.1.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.2.0",
      "typescript": "^5.3.0",
      "vite": "^5.0.0"
    },
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "cap:sync": "cap sync",
      "cap:android": "cap open android",
      "cap:ios": "cap open ios",
      "cap:build": "npm run build && cap sync",
      "cap:run:android": "npm run build && cap sync && cap run android",
      "cap:run:ios": "npm run build && cap sync && cap run ios"
    }
  }
}

🔴 PFLICHT-DATEIEN (ALLE MÜSSEN ERSTELLT WERDEN):

1. **capacitor.config.ts** - Vollständige Capacitor-Konfiguration
   - App-ID: com.example.[appname]
   - App-Name: [Benutzerfreundlicher Name]
   - webDir: "dist"
   - Plugins: SplashScreen, StatusBar konfigurieren
   - Android & iOS Build-Settings

2. **package.json** - Vollständiges npm-Package
   - Alle Dependencies mit korrekten Versionen
   - Alle Scripts für dev, build, cap:sync, cap:run
   - Type: "module" für ES6

3. **tsconfig.json** - TypeScript-Konfiguration
   - Strict mode aktiviert
   - React JSX support
   - Moderne ES-Features

4. **vite.config.ts** - Vite Build-Konfiguration
   - React Plugin
   - Build-Optimierungen
   - PWA-Support

5. **index.html** - Vollständiges HTML5-Dokument
   - Meta-Tags (viewport, theme-color, mobile-web-app-capable)
   - <link rel="manifest" href="/manifest.json">
   - <div id="root"></div>
   - <script type="module" src="/src/main.tsx"></script>

6. **public/manifest.json** - PWA Web-Manifest
   - name, short_name, description
   - start_url, display: "standalone"
   - theme_color, background_color
   - icons: 192x192 und 512x512 (SVG-Platzhalter)

7. **src/main.tsx** - React Entry-Point
   - import React
   - import ReactDOM
   - import App
   - import './index.css'
   - ReactDOM.createRoot(document.getElementById('root')!)

8. **src/App.tsx** - Haupt-React-Komponente
   - TypeScript mit korrekten Types
   - Moderne React (Hooks, Functional Components)
   - Integriert den User-Code sinnvoll
   - Mobile-optimiert
   - Responsive Design

9. **src/index.css** - Modernes CSS
   - CSS Reset / Normalize
   - CSS Variables für Theming
   - Responsive Breakpoints
   - Mobile-First Design
   - Dark Mode Support

10. **src/vite-env.d.ts** - Vite TypeScript Definitions
    - /// <reference types="vite/client" />

11. **README.md** - Vollständige Dokumentation
    - App-Beschreibung
    - Features
    - Installation & Setup
    - APK-Build-Anleitung (Schritt-für-Schritt)
    - Deployment
    - Troubleshooting

12. **.gitignore** - Git Ignore-Datei
    - node_modules/
    - dist/
    - android/
    - ios/
    - .env

13. **android/res/values/strings.xml** (optional aber empfohlen)
    - Android App-Name
    - Android Theme-Farben

📱 BUILD-ANLEITUNG MUSS ENTHALTEN:

# 🚀 APK Build-Anleitung

## Voraussetzungen
- Node.js 18+ installiert
- Android Studio installiert
- JDK 17+ installiert
- Git installiert

## Schritt 1: Projekt einrichten
\`\`\`bash
# ZIP-Datei entpacken
unzip [app-name].zip
cd [app-name]

# Dependencies installieren
npm install
\`\`\`

## Schritt 2: Android-Projekt initialisieren
\`\`\`bash
# Android-Plattform hinzufügen (nur beim ersten Mal)
npx cap add android

# Projekt bauen und synchronisieren
npm run build
npx cap sync
\`\`\`

## Schritt 3: Android Studio öffnen
\`\`\`bash
# Android Studio öffnen
npx cap open android
\`\`\`

## Schritt 4: APK erstellen in Android Studio
1. Warte bis Gradle-Build abgeschlossen ist
2. Menü: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Warte auf "BUILD SUCCESSFUL"
4. Klicke auf "locate" im Popup

## Schritt 5: APK finden
Die APK befindet sich in:
\`android/app/build/outputs/apk/debug/app-debug.apk\`

## Schritt 6: APK installieren
- Auf Android-Gerät übertragen und installieren
- Oder: **Run** → **Run 'app'** in Android Studio

## Troubleshooting
- **Gradle-Fehler**: \`./gradlew clean\` im android-Ordner
- **Sync-Fehler**: \`npx cap sync android --force\`
- **Build-Fehler**: SDK-Version in \`android/app/build.gradle\` prüfen

## Optional: Release APK erstellen
\`\`\`bash
# In Android Studio: Build → Generate Signed Bundle/APK
# Keystore erstellen und APK signieren
\`\`\`

🎯 QUALITÄTS-ANFORDERUNGEN:

1. **Fehlerfreier Code** - Keine Syntax-Fehler, alle Imports korrekt
2. **TypeScript-Ready** - Korrekte Types, Interfaces
3. **Mobile-Optimiert** - Touch-freundlich, responsive
4. **Production-Ready** - Keine TODOs, keine Platzhalter
5. **Moderne Best-Practices** - React 18, Hooks, Functional Components
6. **PWA-Fähig** - Service Worker, Manifest, Icons
7. **Native-Features** - Capacitor Plugins integriert
8. **Dokumentiert** - README mit allen Infos

Erstelle eine VOLLSTÄNDIGE, PROFESSIONELLE App die sofort als APK kompiliert werden kann!`;

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
