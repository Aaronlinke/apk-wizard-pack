import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Code2 } from "lucide-react";

interface CodePreviewProps {
  code: string;
  language: string;
}

export const CodePreview = ({ code, language }: CodePreviewProps) => {
  if (!code.trim()) return null;

  return (
    <Card className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Live-Vorschau</h3>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {language.toUpperCase()}
        </Badge>
      </div>
      <div className="rounded-lg overflow-hidden border border-primary/10">
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Code2 className="w-3 h-3" />
        <span>{code.split('\n').length} Zeilen • {code.length} Zeichen</span>
      </div>
    </Card>
  );
};