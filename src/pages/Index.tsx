import { useState } from "react";
import { CodeEditor, BuildResult as BuildResultType } from "@/components/CodeEditor";
import { BuildResult } from "@/components/BuildResult";
import { Code2 } from "lucide-react";

const Index = () => {
  const [buildResult, setBuildResult] = useState<BuildResultType | null>(null);

  const handleBuild = (result: BuildResultType) => {
    setBuildResult(result);
  };

  const handleReset = () => {
    setBuildResult(null);
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
            <Code2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              CodeForge
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered Code-zu-App Builder. Gib Code-Fragmente ein und 
            erhalte eine vollständige, lauffähige App.
          </p>
        </header>

        {/* Main content */}
        <main className="mb-16">
          {!buildResult ? (
            <CodeEditor onBuild={handleBuild} />
          ) : (
            <BuildResult result={buildResult} onReset={handleReset} />
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t border-primary/10 pt-8">
          <p className="mb-2">
            Powered by AI • Unterstützt HTML, JavaScript, Python, Java und mehr
          </p>
          <p className="text-xs">
            Gib Code-Fragmente ein und erhalte vollständige, lauffähige Apps
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
