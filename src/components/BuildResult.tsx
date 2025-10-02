import { BuildResult as BuildResultType } from "./CodeEditor";
import { Button } from "@/components/ui/button";
import { Download, FileCode, Package, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

interface BuildResultProps {
  result: BuildResultType;
  onReset: () => void;
}

export const BuildResult = ({ result, onReset }: BuildResultProps) => {
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filename} heruntergeladen`);
  };

  const downloadAllAsZip = async () => {
    try {
      const zip = new JSZip();
      
      result.files.forEach((file) => {
        zip.file(file.name, file.content);
      });

      if (result.packageJson) {
        zip.file("package.json", JSON.stringify(result.packageJson, null, 2));
      }

      zip.file("README.md", `# ${result.appName}\n\n${result.description}\n\n## Build Anleitung\n\n${result.buildInstructions}`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result.appName.replace(/\s+/g, "-")}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("ZIP-Datei heruntergeladen!");
    } catch (error) {
      console.error("ZIP error:", error);
      toast.error("Fehler beim Erstellen der ZIP-Datei");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button
          onClick={onReset}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Editor
        </Button>
        <Button
          onClick={downloadAllAsZip}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-background"
        >
          <Package className="mr-2 h-4 w-4" />
          Alles als ZIP herunterladen
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full" />
        <div className="relative backdrop-blur-xl bg-card/40 border border-primary/20 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {result.appName}
            </h2>
            <p className="text-muted-foreground">{result.description}</p>
          </div>

          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-background/20 border border-primary/10 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                Build Anleitung
              </h3>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap code-font">
                {result.buildInstructions}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Generierte Dateien ({result.files.length})
              </h3>
              <div className="grid gap-3">
                {result.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="group backdrop-blur-xl bg-card/20 border border-primary/10 rounded-xl p-4 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-primary" />
                        <span className="font-medium code-font text-sm">{file.name}</span>
                        <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {file.type}
                        </span>
                      </div>
                      <Button
                        onClick={() => downloadFile(file.name, file.content)}
                        size="sm"
                        variant="outline"
                        className="border-primary/30 hover:border-primary hover:bg-primary/10"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                    <pre className="text-xs text-muted-foreground bg-background/50 rounded p-3 overflow-x-auto code-font max-h-40">
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
