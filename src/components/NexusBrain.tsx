import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Sparkles, Copy, Code2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Round {
  role: "beta" | "alpha" | "gamma" | "omega";
  name: string;
  content: string;
}

const roleStyle: Record<string, string> = {
  beta: "border-blue-500/40 bg-blue-500/5",
  alpha: "border-red-500/40 bg-red-500/5",
  gamma: "border-green-500/40 bg-green-500/5",
  omega: "border-primary/50 bg-primary/10",
};

interface Props {
  code?: string;
  onUseAsCode?: (text: string) => void;
}

export const NexusBrain = ({ code, onUseAsCode }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [useCode, setUseCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);

  const run = async () => {
    if (!prompt.trim()) {
      toast.error("Bitte Frage / Anforderung eingeben");
      return;
    }
    setLoading(true);
    setRounds([]);
    try {
      const { data, error } = await supabase.functions.invoke("nexus-brain", {
        body: {
          prompt,
          extraContext: useCode && code ? code.slice(0, 4000) : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRounds(data.rounds || []);
      toast.success("Nexus-Brain Debatte abgeschlossen");
    } catch (e: any) {
      toast.error(e.message || "Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-4 sm:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Nexus-Brain</h3>
        <Badge variant="outline" className="ml-auto border-primary/30 text-primary text-xs">
          4 Bots debattieren
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        BETA entwirft → ALPHA kritisiert → GAMMA löst → OMEGA synthetisiert.
      </p>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Was soll das Gehirn entwerfen / lösen?"
        className="bg-background/50 border-primary/30 min-h-[90px] text-sm"
      />

      <div className="flex flex-wrap gap-2 items-center">
        {code && (
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={useCode}
              onChange={(e) => setUseCode(e.target.checked)}
              className="accent-primary"
            />
            Aktuellen Code als Kontext
          </label>
        )}
        <Button
          onClick={run}
          disabled={loading || !prompt.trim()}
          className="ml-auto bg-gradient-to-r from-primary to-secondary h-9"
          size="sm"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
          Debatte starten
        </Button>
      </div>

      {rounds.length > 0 && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {rounds.map((r) => (
            <Card key={r.role} className={`p-3 border ${roleStyle[r.role]}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold uppercase tracking-wide">{r.name}</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(r.content);
                      toast.success("Kopiert");
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  {onUseAsCode && r.role === "omega" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => {
                        onUseAsCode(r.content);
                        toast.success("In Editor übernommen");
                      }}
                    >
                      <Code2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                {r.content}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
