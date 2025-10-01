import { Download, FileText, ImageIcon, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface FileData {
  id: string;
  name: string;
  type: "apk" | "image" | "file";
  size: string;
  url: string;
  description?: string;
}

interface FileCardProps {
  file: FileData;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "apk":
      return <Smartphone className="w-8 h-8 text-primary" />;
    case "image":
      return <ImageIcon className="w-8 h-8 text-secondary" />;
    default:
      return <FileText className="w-8 h-8 text-accent" />;
  }
};

const getFileTypeLabel = (type: string) => {
  switch (type) {
    case "apk":
      return "Android App";
    case "image":
      return "Bild";
    default:
      return "Datei";
  }
};

export const FileCard = ({ file }: FileCardProps) => {
  const handleDownload = () => {
    toast.success(`Download gestartet: ${file.name}`);
    // Simulate download - in production, this would actually download the file
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      <div className="relative backdrop-blur-xl bg-card/40 border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-110 transition-transform duration-300">
            {getFileIcon(file.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate text-lg">
                  {file.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {getFileTypeLabel(file.type)}
                  </span>
                  <span className="text-sm text-muted-foreground code-font">
                    {file.size}
                  </span>
                </div>
              </div>
            </div>
            
            {file.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {file.description}
              </p>
            )}

            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-background"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
