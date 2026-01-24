import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Vite Template - kein AI nötig für einfache Projekte!
const createViteProject = (code: string, lang: string) => {
  const appName = `my-${lang}-app`;
  
  // Einfache HTML/JS/CSS Extraktion
  let htmlContent = '';
  let cssContent = '';
  let jsContent = '';
  
  if (lang === 'html') {
    // HTML direkt verwenden
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    
    cssContent = styleMatch ? styleMatch[1].trim() : '';
    jsContent = scriptMatch ? scriptMatch[1].trim() : '';
    htmlContent = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').trim() : code;
  } else if (lang === 'css') {
    cssContent = code;
    htmlContent = '<div class="app">CSS Styles angewendet</div>';
  } else if (lang === 'javascript' || lang === 'typescript') {
    jsContent = code;
    htmlContent = '<div id="output"></div>';
  } else {
    // Python, Java etc. - zeige als Code-Display
    htmlContent = `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  }

  const files = [
    {
      name: 'package.json',
      content: JSON.stringify({
        name: appName,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        devDependencies: {
          vite: '^5.0.0'
        }
      }, null, 2),
      type: 'json'
    },
    {
      name: 'vite.config.js',
      content: `export default { server: { open: true } }`,
      type: 'javascript'
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  ${htmlContent}
  <script type="module" src="/main.js"></script>
</body>
</html>`,
      type: 'html'
    },
    {
      name: 'style.css',
      content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: system-ui, sans-serif; 
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 2rem;
}
.app { max-width: 800px; margin: 0 auto; }
pre { background: #0d1117; padding: 1rem; border-radius: 8px; overflow-x: auto; }
code { font-family: 'Fira Code', monospace; }
${cssContent}`,
      type: 'css'
    },
    {
      name: 'main.js',
      content: `// Dein Code
${jsContent || '// Keine JavaScript-Logik gefunden'}

console.log('App gestartet!');`,
      type: 'javascript'
    }
  ];

  return {
    appName,
    description: `Vite-Projekt aus ${lang.toUpperCase()} Code`,
    files,
    buildInstructions: `## Schnellstart

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build für Produktion
\`\`\`bash
npm run build
\`\`\`

Die fertigen Dateien sind dann im \`dist\` Ordner.`,
    packageJson: JSON.parse(files[0].content)
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, useAI } = await req.json();
    console.log('Building app:', { language, codeLength: code?.length, useAI });

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: 'Code und Sprache sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SCHNELL: Ohne AI - direktes Template
    if (!useAI) {
      const result = createViteProject(code, language);
      console.log('Quick build done:', result.appName);
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MIT AI: Nur wenn explizit gewünscht
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      // Fallback auf Template
      const result = createViteProject(code, language);
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Kurzer, effizienter Prompt
    const prompt = `Wandle diesen ${language} Code in eine moderne Web-App um. Gib NUR JSON zurück:
{"appName":"name","description":"text","files":[{"name":"index.html","content":"...","type":"html"},{"name":"style.css","content":"...","type":"css"},{"name":"main.js","content":"...","type":"javascript"}],"buildInstructions":"..."}

Code:
${code.substring(0, 2000)}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite', // Schnellstes & günstigstes Modell!
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000, // Weniger Tokens = schneller & billiger
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429 || aiResponse.status === 402) {
        // Bei Rate-Limit: Fallback auf Template
        const result = createViteProject(code, language);
        return new Response(
          JSON.stringify(result),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // JSON extrahieren
    let jsonContent = content.trim();
    if (jsonContent.includes('```')) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonContent = match[1].trim();
    }
    
    const start = jsonContent.indexOf('{');
    const end = jsonContent.lastIndexOf('}');
    if (start !== -1 && end > start) {
      jsonContent = jsonContent.substring(start, end + 1);
    }

    try {
      const result = JSON.parse(jsonContent);
      if (result.appName && result.files) {
        return new Response(
          JSON.stringify(result),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      // JSON Parse fehlgeschlagen - Fallback
    }

    // Fallback auf Template
    const result = createViteProject(code, language);
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Build error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Fehler beim Build' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
