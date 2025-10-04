import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Download, FileCode, Package, Smartphone, FolderTree, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BuildResultProps {
  result: {
    appName: string;
    description: string;
    files: Array<{
      name: string;
      content: string;
      type: string;
    }>;
    buildInstructions: string;
    packageJson?: any;
  };
  onReset: () => void;
}

export const BuildResult = ({ result, onReset }: BuildResultProps) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);

  const downloadAsZip = async () => {
    try {
      const zip = new JSZip();
      
      result.files.forEach(file => {
        zip.file(file.name, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.appName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('ZIP-Datei erfolgreich heruntergeladen!');
    } catch (error) {
      console.error('ZIP download error:', error);
      toast.error('Fehler beim Erstellen der ZIP-Datei');
    }
  };

  const compileToApk = async () => {
    setIsCompiling(true);
    setCompilationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('compile-apk', {
        body: {
          appName: result.appName,
          files: result.files,
          packageJson: result.packageJson
        }
      });

      if (error) throw error;

      setCompilationResult(data);
      
      if (data.status === 'instructions') {
        toast.info('APK-Build-Anleitung generiert', {
          description: 'Folge den Schritten um deine APK zu erstellen'
        });
      } else if (data.apkUrl) {
        toast.success('APK erfolgreich kompiliert!');
      }
    } catch (error) {
      console.error('APK compilation error:', error);
      toast.error('Fehler bei der APK-Kompilierung');
    } finally {
      setIsCompiling(false);
    }
  };

  const getLanguageFromType = (type: string) => {
    const map: Record<string, string> = {
      typescript: 'typescript',
      javascript: 'javascript',
      json: 'json',
      html: 'html',
      css: 'css',
      markdown: 'markdown',
    };
    return map[type] || 'text';
  };

  const filesByFolder = result.files.reduce((acc, file) => {
    const folder = file.name.includes('/') 
      ? file.name.split('/')[0] 
      : 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(file);
    return acc;
  }, {} as Record<string, typeof result.files>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button onClick={onReset} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Neues Projekt starten
      </Button>

      {/* App Info Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                {result.appName}
              </CardTitle>
              <CardDescription className="text-base">
                {result.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Generiert
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={downloadAsZip} className="gap-2">
              <Download className="h-4 w-4" />
              Als ZIP herunterladen
            </Button>
            <Button 
              onClick={compileToApk} 
              variant="secondary"
              disabled={isCompiling}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              {isCompiling ? 'Kompiliere...' : 'APK kompilieren'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compilation Result */}
      {compilationResult && (
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {compilationResult.status === 'instructions' ? (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Build-Anleitung
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  APK bereit
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {compilationResult.instructions || compilationResult.message}
              </pre>
            </ScrollArea>
            {compilationResult.apkUrl && (
              <Button asChild className="mt-4">
                <a href={compilationResult.apkUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  APK herunterladen
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Files Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Generierte Dateien ({result.files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tree" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tree">Dateibaum</TabsTrigger>
              <TabsTrigger value="files">Alle Dateien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tree" className="space-y-4">
              {Object.entries(filesByFolder).map(([folder, files]) => (
                <div key={folder} className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-primary" />
                    {folder}
                  </h4>
                  <div className="pl-6 space-y-1">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileCode className="h-3 w-3" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="files">
              <Tabs defaultValue={result.files[0]?.name} className="w-full">
                <ScrollArea className="h-[60px] w-full">
                  <TabsList className="inline-flex w-max">
                    {result.files.map((file, idx) => (
                      <TabsTrigger key={idx} value={file.name} className="text-xs">
                        {file.name.split('/').pop()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
                
                {result.files.map((file, idx) => (
                  <TabsContent key={idx} value={file.name}>
                    <ScrollArea className="h-[500px] w-full rounded-md border">
                      <SyntaxHighlighter
                        language={getLanguageFromType(file.type)}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                        showLineNumbers
                      >
                        {file.content}
                      </SyntaxHighlighter>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Build Instructions */}
      {result.buildInstructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Build-Anleitung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm">
                  {result.buildInstructions}
                </pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
