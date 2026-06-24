import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Library, Combine, X, Check } from "lucide-react";
import { botTemplates, categories, BotTemplate } from "@/data/botTemplates";
import { toast } from "sonner";

interface Props {
  onSelect: (code: string, language: string) => void;
}

// Fusioniert mehrere Bot-HTMLs in eine Tab-App
function fuseBots(bots: BotTemplate[]): string {
  const tabs = bots.map((b, i) => ({
    id: `tab-${i}`,
    name: `${b.emoji} ${b.name}`,
    // Extract body of each bot to embed as iframe (sandboxed = isolation)
    srcdoc: b.code.replace(/"/g, '&quot;'),
  }));

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fusion App (${bots.length} Bots)</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0a0a14,#1a1a2e);color:#fff;min-height:100vh}
.header{padding:1rem;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border-bottom:1px solid rgba(168,85,247,.3);position:sticky;top:0;z-index:10}
.header h1{font-size:1.2rem;background:linear-gradient(90deg,#a855f7,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.tabs{display:flex;gap:.3rem;overflow-x:auto;padding:.7rem 1rem;background:rgba(0,0,0,.3)}
.tab{padding:.5rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;cursor:pointer;white-space:nowrap;font-size:.85rem;color:#fff}
.tab.active{background:linear-gradient(90deg,#a855f7,#3b82f6);border-color:transparent}
.frame{width:100%;height:calc(100vh - 110px);border:0;background:#0f0f1e}
</style></head>
<body>
<div class="header"><h1>⚡ Fusion App · ${bots.length} Bots vereint</h1></div>
<div class="tabs">${tabs.map((t,i)=>`<button class="tab${i===0?' active':''}" data-i="${i}">${t.name}</button>`).join('')}</div>
<iframe id="frame" class="frame" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
<script>
const sources=${JSON.stringify(bots.map(b => b.code))};
const frame=document.getElementById('frame');
function load(i){frame.srcdoc=sources[i];document.querySelectorAll('.tab').forEach((t,j)=>t.classList.toggle('active',i===j))}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>load(+t.dataset.i)));
load(0);
</script>
</body></html>`;
}

export const BotLibrary = ({ onSelect }: Props) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Alle");
  const [fusionMode, setFusionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return botTemplates.filter(t =>
      (cat === "Alle" || t.category === cat) &&
      (!ql || t.name.toLowerCase().includes(ql) || t.description.toLowerCase().includes(ql))
    );
  }, [q, cat]);

  const handleClick = (t: BotTemplate) => {
    if (fusionMode) {
      const next = new Set(selected);
      next.has(t.id) ? next.delete(t.id) : next.add(t.id);
      setSelected(next);
    } else {
      onSelect(t.code, "html");
      toast.success(`${t.emoji} ${t.name} geladen`);
    }
  };

  const doFuse = () => {
    if (selected.size < 2) {
      toast.error("Mindestens 2 Bots auswählen");
      return;
    }
    const bots = botTemplates.filter(b => selected.has(b.id));
    const fused = fuseBots(bots);
    onSelect(fused, "html");
    toast.success(`⚡ ${bots.length} Bots fusioniert!`);
    setSelected(new Set());
    setFusionMode(false);
  };

  return (
    <div className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Library className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Bot-Bibliothek</h3>
        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
          {botTemplates.length} Apps
        </Badge>
        <div className="ml-auto flex gap-1.5">
          {fusionMode && selected.size > 0 && (
            <Button size="sm" onClick={doFuse} className="h-7 bg-gradient-to-r from-primary to-secondary text-xs">
              <Combine className="w-3.5 h-3.5 mr-1" /> Fusionieren ({selected.size})
            </Button>
          )}
          <Button
            size="sm"
            variant={fusionMode ? "destructive" : "outline"}
            onClick={() => { setFusionMode(!fusionMode); setSelected(new Set()); }}
            className="h-7 px-2 text-xs"
          >
            {fusionMode ? <><X className="w-3.5 h-3.5 mr-1" />Abbrechen</> : <><Combine className="w-3.5 h-3.5 mr-1" />Fusion</>}
          </Button>
        </div>
      </div>

      {fusionMode && (
        <div className="mb-3 p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-xs">
          🧬 <b>Fusions-Modus aktiv</b> – Wähle mehrere Bots aus, sie werden zu einer App mit Tabs vereint.
        </div>
      )}

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
        {filtered.length} Treffer{fusionMode && ` · ${selected.size} ausgewählt`}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map(t => {
          const isSel = selected.has(t.id);
          return (
            <Card
              key={t.id}
              onClick={() => handleClick(t)}
              className={`relative bg-card/40 border transition-all cursor-pointer p-2.5 ${
                isSel
                  ? "border-primary bg-primary/20 ring-2 ring-primary"
                  : "border-primary/10 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {fusionMode && isSel && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="text-2xl mb-1">{t.emoji}</div>
              <div className="font-semibold text-xs leading-tight mb-0.5 truncate">{t.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{t.description}</div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-8">
            Nichts gefunden
          </div>
        )}
      </div>
    </div>
  );
};
