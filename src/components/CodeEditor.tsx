import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";

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

export const CodeEditor = ({ onBuild }: CodeEditorProps) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("html");
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = async () => {
    if (!code.trim()) {
      toast.error("Bitte gib Code ein");
      return;
    }

    setIsBuilding(true);
    toast.loading("Analysiere Code und generiere App...");

    try {
      const { data, error } = await import("@/integrations/supabase/client").then(
        (m) => m.supabase.functions.invoke("build-app", {
          body: { code, language }
        })
      );

      if (error) throw error;
      
      toast.dismiss();
      toast.success("App erfolgreich generiert!");
      onBuild(data as BuildResult);
    } catch (error: any) {
      console.error("Build error:", error);
      toast.dismiss();
      toast.error(error.message || "Fehler beim Generieren der App");
    } finally {
      setIsBuilding(false);
    }
  };

  const loadExample = () => {
    const example = exampleCode[language as keyof typeof exampleCode] || exampleCode.html;
    setCode(example);
    toast.success("Beispiel-Code geladen");
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

          <div className="space-y-4">
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

            <Button
              onClick={handleBuild}
              disabled={isBuilding || !code.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-background"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generiere App...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  App generieren
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-primary/10">
            <p className="text-xs text-muted-foreground">
              💡 Die AI analysiert deinen Code, ergänzt fehlende Teile und erstellt eine vollständige, lauffähige App
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
