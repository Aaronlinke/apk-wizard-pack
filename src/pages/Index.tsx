import { useState } from "react";
import { CodeEditor, BuildResult as BuildResultType } from "@/components/CodeEditor";
import { BuildResult } from "@/components/BuildResult";
import { ProjectHistory } from "@/components/ProjectHistory";
import { Code2, Zap, CheckCircle2 } from "lucide-react";

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

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-3 sm:mb-6 backdrop-blur-xl border border-primary/20">
            <Code2 className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              CodeForge
            </span>
            <Zap className="w-7 h-7 sm:w-12 sm:h-12 text-primary animate-pulse" />
          </h1>
          <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            200+ vorgefertigte Bot-Apps. Von Code-Snippets zu Mobile-Apps in Sekunden.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center mt-3 sm:mt-6 text-[11px] sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              200 Bot-Apps
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              Live Preview
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              Mobile-ready
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mb-8 sm:mb-16">
          {!buildResult ? (
            <div className="space-y-8">
              <ProjectHistory onLoadProject={handleBuild} />
              <CodeEditor onBuild={handleBuild} />
            </div>
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
