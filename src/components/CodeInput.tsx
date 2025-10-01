import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { toast } from "sonner";

interface CodeInputProps {
  onCodeSubmit: (code: string) => void;
  isLoading?: boolean;
}

export const CodeInput = ({ onCodeSubmit, isLoading }: CodeInputProps) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Bitte gib einen Code ein");
      return;
    }
    onCodeSubmit(code.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full" />
        <div className="relative backdrop-blur-xl bg-card/40 border border-primary/20 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Download-Code eingeben
              </h2>
              <p className="text-muted-foreground text-sm">
                Gib deinen Code ein, um auf die Dateien zuzugreifen
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX-XXXXXX"
                className="code-font text-lg h-14 bg-background/50 border-primary/30 focus:border-primary text-center tracking-wider"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-background"
            >
              <Download className="mr-2 h-5 w-5" />
              {isLoading ? "Wird geladen..." : "Dateien freischalten"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary/10">
            <p className="text-xs text-muted-foreground text-center">
              Demo-Codes: <span className="code-font text-primary">DEMO-123456</span> oder{" "}
              <span className="code-font text-primary">TEST-ABCDEF</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
