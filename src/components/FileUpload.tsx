import { useCallback } from "react";
import { Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
}

export const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileLoad(content, file.name);
      toast.success(`${file.name} hochgeladen`);
    };
    reader.onerror = () => {
      toast.error("Fehler beim Laden der Datei");
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  return (
    <div className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
          <File className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">
            Code-Datei hochladen
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unterstützt: .html, .js, .ts, .py, .java, .css
          </p>
        </div>
        <label htmlFor="file-upload">
          <Button
            variant="outline"
            className="border-primary/30 hover:border-primary hover:bg-primary/10 cursor-pointer"
            asChild
          >
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Datei auswählen
            </span>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".html,.js,.ts,.py,.java,.css,.json,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};