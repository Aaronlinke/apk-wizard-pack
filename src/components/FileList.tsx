import { FileCard, FileData } from "./FileCard";
import { Package } from "lucide-react";

interface FileListProps {
  files: FileData[];
  code: string;
}

export const FileList = ({ files, code }: FileListProps) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Keine Dateien gefunden</h3>
        <p className="text-muted-foreground">
          Für den Code <span className="code-font text-primary">{code}</span> wurden keine Dateien gefunden.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Verfügbare Downloads
        </h2>
        <p className="text-muted-foreground">
          Code: <span className="code-font text-primary">{code}</span> • {files.length} {files.length === 1 ? "Datei" : "Dateien"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {files.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};
