import { useState } from "react";
import { CodeInput } from "@/components/CodeInput";
import { FileList } from "@/components/FileList";
import { FileData } from "@/components/FileCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

// Mock data - in production this would come from a backend
const mockFiles: Record<string, FileData[]> = {
  "DEMO-123456": [
    {
      id: "1",
      name: "MyApp_v2.5.apk",
      type: "apk",
      size: "45.2 MB",
      url: "#",
      description: "Neueste Version der MyApp mit verbesserter Performance und neuen Features",
    },
    {
      id: "2",
      name: "app-icon.png",
      type: "image",
      size: "128 KB",
      url: "#",
      description: "Hochauflösendes App Icon für verschiedene Plattformen",
    },
    {
      id: "3",
      name: "changelog.pdf",
      type: "file",
      size: "2.1 MB",
      url: "#",
      description: "Vollständige Änderungshistorie und Release Notes",
    },
  ],
  "TEST-ABCDEF": [
    {
      id: "4",
      name: "TestApp_beta.apk",
      type: "apk",
      size: "32.8 MB",
      url: "#",
      description: "Beta-Version für Testzwecke",
    },
    {
      id: "5",
      name: "screenshots.zip",
      type: "file",
      size: "15.4 MB",
      url: "#",
      description: "Sammlung von App Screenshots",
    },
  ],
};

const Index = () => {
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeSubmit = (code: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const foundFiles = mockFiles[code] || [];
      
      if (foundFiles.length > 0) {
        setFiles(foundFiles);
        setCurrentCode(code);
        toast.success("Code erfolgreich verifiziert!");
      } else {
        toast.error("Ungültiger Code. Bitte versuche es erneut.");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setCurrentCode(null);
    setFiles([]);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 backdrop-blur-xl border border-primary/20">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              CodeDrop
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sichere Dateiverteilung mit Code-basiertem Zugriff. 
            APKs, Bilder und Dateien einfach herunterladen.
          </p>
        </header>

        {/* Main content */}
        <main className="mb-16">
          {!currentCode ? (
            <CodeInput onCodeSubmit={handleCodeSubmit} isLoading={isLoading} />
          ) : (
            <div className="space-y-8">
              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Neuen Code eingeben
                </Button>
              </div>
              <FileList files={files} code={currentCode} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t border-primary/10 pt-8">
          <p className="mb-2">
            Sichere Dateiverwaltung für Entwickler und Teams
          </p>
          <p className="text-xs">
            Alle Downloads sind verschlüsselt und durch eindeutige Codes geschützt
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
