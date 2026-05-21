import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, FileCode } from "lucide-react";

interface LivePreviewProps {
  code: string;
  language: string;
}

// Sprachen die live im iframe ausgeführt werden können
const RUNNABLE = ["html", "javascript", "typescript", "css"];

function buildHtmlDoc(code: string, language: string): string {
  const lang = language.toLowerCase();

  // Bereits vollständiges HTML
  if (lang === "html" && /<html[\s\S]*<\/html>/i.test(code)) {
    return code;
  }

  if (lang === "html") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui;padding:1rem;color:#fff;background:#0f0f0f}</style></head><body>${code}</body></html>`;
  }

  if (lang === "css") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${code}</style></head><body><div class="container"><h1>CSS Vorschau</h1><p>Beispieltext</p><button>Button</button></div></body></html>`;
  }

  if (lang === "javascript" || lang === "typescript") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui;padding:1rem;color:#fff;background:#0f0f0f}#__log{white-space:pre-wrap;background:#000;padding:.5rem;border-radius:6px;margin-top:1rem;min-height:60px}</style></head><body><div id="app"></div><div id="__log"></div><script>
      (function(){
        const log=document.getElementById('__log');
        const orig=console.log;
        console.log=(...a)=>{log.textContent+=a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')+'\\n';orig.apply(console,a);};
        window.onerror=(m)=>{log.textContent+='Error: '+m+'\\n';};
        try{${code}}catch(e){log.textContent+='Error: '+e.message;}
      })();
    </script></body></html>`;
  }

  return "";
}

export const LivePreview = ({ code, language }: LivePreviewProps) => {
  if (!code.trim()) return null;

  const lang = language.toLowerCase();
  const runnable = RUNNABLE.includes(lang);

  const srcDoc = useMemo(() => (runnable ? buildHtmlDoc(code, lang) : ""), [code, lang, runnable]);

  return (
    <Card className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {runnable ? <Play className="w-4 h-4 text-green-500" /> : <FileCode className="w-4 h-4 text-primary" />}
          <h3 className="font-semibold text-foreground text-sm">
            {runnable ? "Live HTML Viewer" : "Code Viewer"}
          </h3>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {language.toUpperCase()}
        </Badge>
      </div>

      {runnable ? (
        <iframe
          title="Live Vorschau"
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-modals"
          className="w-full h-[400px] rounded-lg border border-primary/10 bg-white"
        />
      ) : (
        <div className="rounded-lg border border-primary/10 bg-background/60 p-3 text-xs text-muted-foreground">
          <p className="mb-2">
            <strong className="text-foreground">{language.toUpperCase()}</strong> kann nicht direkt im Browser ausgeführt werden.
          </p>
          <p>
            Nutze den <strong>"Mit AI"</strong> Button, um den Code in eine lauffähige Web-App zu wandeln,
            oder kopiere ihn in eine lokale {lang === "java" ? "JDK" : lang === "cpp" || lang === "c++" ? "C++ Compiler" : "Entwicklungs"}-Umgebung.
          </p>
        </div>
      )}
    </Card>
  );
};
