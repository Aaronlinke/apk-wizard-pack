import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Library } from "lucide-react";
import { botTemplates, categories } from "@/data/botTemplates";
import { toast } from "sonner";

interface Props {
  onSelect: (code: string, language: string) => void;
}

export const BotLibrary = ({ onSelect }: Props) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Alle");

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return botTemplates.filter(t =>
      (cat === "Alle" || t.category === cat) &&
      (!ql || t.name.toLowerCase().includes(ql) || t.description.toLowerCase().includes(ql))
    );
  }, [q, cat]);

  const handle = (t: typeof botTemplates[0]) => {
    onSelect(t.code, "html");
    toast.success(`${t.emoji} ${t.name} geladen`);
  };

  return (
    <div className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Library className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Bot-Bibliothek</h3>
        <Badge variant="outline" className="ml-auto border-primary/30 text-primary text-xs">
          {botTemplates.length} Apps
        </Badge>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suchen..."
          className="pl-9 bg-background/50 border-primary/30 h-9"
        />
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {categories.map(c => (
          <Button
            key={c}
            size="sm"
            variant={cat === c ? "default" : "outline"}
            onClick={() => setCat(c)}
            className="h-7 px-3 text-xs whitespace-nowrap shrink-0"
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        {filtered.length} Treffer
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map(t => (
          <Card
            key={t.id}
            onClick={() => handle(t)}
            className="bg-card/40 border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer p-2.5"
          >
            <div className="text-2xl mb-1">{t.emoji}</div>
            <div className="font-semibold text-xs leading-tight mb-0.5 truncate">{t.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{t.description}</div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-8">
            Nichts gefunden
          </div>
        )}
      </div>
    </div>
  );
};
