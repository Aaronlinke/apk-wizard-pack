import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Loader2, Rocket, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";
import { TemplateSelector } from "./TemplateSelector";
import { CodePreview } from "./CodePreview";
import { CodeValidator } from "./CodeValidator";
import { saveProjectToHistory } from "./ProjectHistory";

interface CodeEditorProps {
  onBuild: (result: BuildResult) => void;
}

export interface BuildResult {
  appName: string;
  description: string;
  files: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  buildInstructions: string;
  packageJson?: any;
}

const languages = [
  { value: "html", label: "HTML" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
];

const exampleCode = {
  html: `<!DOCTYPE html>
<html>
  <body>
    <h1>Hello World</h1>
    <button onclick="alert('Hi!')">Click me</button>
  </body>
</html>`,
  javascript: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');`,
  python: `def greet(name):
    print(f"Hello, {name}!")

greet("World")`,
};

// Lokale Projekt-Generierung ohne Backend
function createLocalProject(code: string, language: string): BuildResult {
  const timestamp = Date.now();
  const appName = `app-${timestamp}`;
  
  // HTML/CSS/JS extrahieren
  const htmlMatch = code.match(/<html[\s\S]*<\/html>/i) || code.match(/<body[\s\S]*<\/body>/i) || code.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
  const cssMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const jsMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  
  let htmlContent = htmlMatch ? htmlMatch[0] : '';
  let cssContent = cssMatch ? cssMatch[1] : '';
  let jsContent = jsMatch ? jsMatch[1] : '';
  
  // Wenn kein HTML gefunden, basierend auf Sprache erstellen
  if (!htmlContent) {
    if (language === 'html') {
      htmlContent = code;
    } else if (language === 'javascript' || language === 'typescript') {
      jsContent = code;
      htmlContent = '<div id="app"></div>';
    } else if (language === 'css') {
      cssContent = code;
      htmlContent = '<div class="container"><h1>Styled Content</h1></div>';
    } else {
      htmlContent = `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    }
  }
  
  return {
    appName,
    description: `Generiert aus ${language.toUpperCase()} Code`,
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${htmlContent}
  <script src="main.js"></script>
</body>
</html>`,
        type: "text/html"
      },
      {
        name: "style.css",
        content: cssContent || `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; padding: 2rem; background: #0f0f0f; color: #fff; }
h1 { margin-bottom: 1rem; }
button { padding: 0.5rem 1rem; cursor: pointer; }`,
        type: "text/css"
      },
      {
        name: "main.js",
        content: jsContent || `console.log("App gestartet");`,
        type: "application/javascript"
      }
    ],
    buildInstructions: "Öffne index.html im Browser oder starte mit einem lokalen Server.",
    packageJson: {
      name: appName,
      version: "1.0.0",
      scripts: { dev: "npx serve ." }
    }
  };
}

export const CodeEditor = ({ onBuild }: CodeEditorProps) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("html");
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = async (withAI = false) => {
    if (!code.trim()) {
      toast.error("Bitte gib Code ein");
      return;
    }

    setIsBuilding(true);

    try {
      if (withAI) {
        // Mit AI = Backend-Aufruf
        toast.loading("AI generiert App...");
        const { data, error } = await import("@/integrations/supabase/client").then(
          (m) => m.supabase.functions.invoke("build-app", {
            body: { code, language, useAI: true }
          })
        );
        if (error) throw error;
        toast.dismiss();
        toast.success("AI-Projekt erstellt!");
        saveProjectToHistory(data as BuildResult, language);
        onBuild(data as BuildResult);
      } else {
        // Schnell = Komplett lokal, kein Backend
        const result = createLocalProject(code, language);
        toast.success("Projekt erstellt! ⚡");
        saveProjectToHistory(result, language);
        onBuild(result);
      }
    } catch (error: any) {
      console.error("Build error:", error);
      toast.dismiss();
      toast.error(error.message || "Fehler beim Erstellen");
    } finally {
      setIsBuilding(false);
    }
  };

  const loadExample = () => {
    const example = exampleCode[language as keyof typeof exampleCode] || exampleCode.html;
    setCode(example);
    toast.success("Beispiel-Code geladen");
  };

  const handleFileLoad = (content: string, filename: string) => {
    setCode(content);
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'html': 'html', 'js': 'javascript', 'ts': 'typescript',
      'py': 'python', 'java': 'java', 'css': 'css', 'json': 'json'
    };
    if (ext && langMap[ext]) {
      setLanguage(langMap[ext]);
    }
  };

  const handleTemplateSelect = (templateCode: string, templateLanguage: string) => {
    setCode(templateCode);
    setLanguage(templateLanguage);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full" />
        <div className="relative backdrop-blur-xl bg-card/40 border border-primary/20 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Code Editor
              </h2>
              <p className="text-muted-foreground text-sm">
                Gib deinen Code ein und lass die AI eine App daraus erstellen
              </p>
            </div>
          </div>

          <Tabs defaultValue="code" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-background/50">
              <TabsTrigger value="code" className="data-[state=active]:bg-primary/20">
                <Code2 className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="template" className="data-[state=active]:bg-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Vorlagen
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Programmiersprache
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-background/50 border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={loadExample}
                    variant="outline"
                    className="border-primary/30 hover:border-primary hover:bg-primary/10"
                  >
                    Beispiel laden
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Dein Code
                </label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Gib hier deinen ${language.toUpperCase()}-Code ein...\n// Die AI wird daraus eine vollständige App erstellen`}
                  className="code-font min-h-[400px] bg-background/50 border-primary/30 focus:border-primary font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="template">
              <TemplateSelector onSelectTemplate={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="upload">
              <FileUpload onFileLoad={handleFileLoad} />
            </TabsContent>
          </Tabs>

          {code.trim() && (
            <div className="mt-6 space-y-4">
              <CodeValidator code={code} language={language} />
              <CodePreview code={code} language={language} />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => handleBuild(false)}
              disabled={isBuilding || !code.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 font-semibold"
            >
              {isBuilding ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-5 w-5" />
              )}
              Schnell erstellen (kostenlos)
            </Button>
            <Button
              onClick={() => handleBuild(true)}
              disabled={isBuilding || !code.trim()}
              variant="outline"
              className="h-12 border-primary/30 hover:bg-primary/10"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Mit AI
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="text-green-500">⚡</div>
                <div>
                  <strong className="text-foreground">Schnell = Sofort</strong>
                  <p>Direktes Vite-Projekt, keine AI, kostenlos</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-primary">✨</div>
                <div>
                  <strong className="text-foreground">Mit AI = Smarter</strong>
                  <p>AI verbessert & optimiert (kostet Credits)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
