import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, Download, Clock } from "lucide-react";
import { BuildResult } from "./CodeEditor";
import { toast } from "sonner";
import JSZip from "jszip";

interface HistoryItem {
  id: string;
  timestamp: number;
  result: BuildResult;
  language: string;
}

interface ProjectHistoryProps {
  onLoadProject: (result: BuildResult) => void;
}

export const ProjectHistory = ({ onLoadProject }: ProjectHistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('project-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  const saveToHistory = (result: BuildResult, language: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      result,
      language
    };
    const updated = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem('project-history', JSON.stringify(updated));
  };

  const deleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('project-history', JSON.stringify(updated));
    toast.success("Projekt aus Historie gelöscht");
  };

  const downloadProject = async (item: HistoryItem) => {
    try {
      const zip = new JSZip();
      item.result.files.forEach((file) => {
        zip.file(file.name, file.content);
      });
      if (item.result.packageJson) {
        zip.file("package.json", JSON.stringify(item.result.packageJson, null, 2));
      }
      zip.file("README.md", `# ${item.result.appName}\n\n${item.result.description}\n\n## Build Anleitung\n\n${item.result.buildInstructions}`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.result.appName.replace(/\s+/g, "-")}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Projekt heruntergeladen!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Fehler beim Download");
    }
  };

  if (history.length === 0) return null;

  return (
    <Card className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Projekt-Historie</h3>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="backdrop-blur-xl bg-card/40 border border-primary/10 rounded-lg p-4 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm mb-1">
                    {item.result.appName}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.result.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.timestamp).toLocaleString('de-DE')}</span>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLoadProject(item.result)}
                    className="h-7 text-xs"
                  >
                    Laden
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadProject(item)}
                    className="h-7 text-xs"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteItem(item.id)}
                    className="h-7 text-xs text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

// Export helper function to be used in CodeEditor
export const saveProjectToHistory = (result: BuildResult, language: string) => {
  const saved = localStorage.getItem('project-history') || '[]';
  const history = JSON.parse(saved);
  const newItem = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    result,
    language
  };
  const updated = [newItem, ...history].slice(0, 10);
  localStorage.setItem('project-history', JSON.stringify(updated));
};