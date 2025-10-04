import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

interface CodeValidatorProps {
  code: string;
  language: string;
}

export const CodeValidator = ({ code, language }: CodeValidatorProps) => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  useEffect(() => {
    if (!code.trim()) {
      setIssues([]);
      return;
    }

    const validationIssues: ValidationIssue[] = [];

    // Basic validation rules
    if (code.length < 10) {
      validationIssues.push({
        type: 'warning',
        message: 'Code ist sehr kurz - mehr Details könnten zu besseren Ergebnissen führen'
      });
    }

    if (language === 'html' && !code.includes('<!DOCTYPE')) {
      validationIssues.push({
        type: 'info',
        message: 'Kein DOCTYPE gefunden - wird automatisch ergänzt'
      });
    }

    if (language === 'html' && !code.includes('<body')) {
      validationIssues.push({
        type: 'info',
        message: 'Kein body-Tag - wird automatisch ergänzt'
      });
    }

    // Check for common syntax issues
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      validationIssues.push({
        type: 'error',
        message: `Geschweifte Klammern nicht ausgeglichen (${openBraces} öffnend, ${closeBraces} schließend)`
      });
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      validationIssues.push({
        type: 'error',
        message: `Runde Klammern nicht ausgeglichen (${openParens} öffnend, ${closeParens} schließend)`
      });
    }

    if (language === 'html') {
      const openTags = (code.match(/<(?!\/)[a-z]+/gi) || []).length;
      const closeTags = (code.match(/<\/[a-z]+>/gi) || []).length;
      if (Math.abs(openTags - closeTags) > 5) {
        validationIssues.push({
          type: 'warning',
          message: 'Möglicherweise nicht geschlossene HTML-Tags'
        });
      }
    }

    // Positive feedback
    if (validationIssues.filter(i => i.type === 'error').length === 0) {
      validationIssues.push({
        type: 'info',
        message: 'Code sieht gut aus! Bereit zur Generierung.'
      });
    }

    setIssues(validationIssues);
  }, [code, language]);

  if (issues.length === 0) return null;

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return (
    <Card className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Code-Analyse</h3>
        </div>
        <div className="flex gap-2">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} Fehler
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
              {warningCount} Warnungen
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {issues.map((issue, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 p-2 rounded-lg ${
              issue.type === 'error' 
                ? 'bg-destructive/10 border border-destructive/20' 
                : issue.type === 'warning'
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-primary/10 border border-primary/20'
            }`}
          >
            {issue.type === 'error' && <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />}
            {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />}
            {issue.type === 'info' && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
            <p className="text-xs text-foreground">{issue.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};