import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Download, Monitor } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

interface Props {
  code: string;
  language: string;
}

type Format =
  | "bat" | "cmd" | "ps1" | "vbs" | "reg" | "hta" | "inf" | "manifest"
  | "portable-zip" | "electron-project" | "tauri-project" | "pyinstaller-project" | "dotnet-project";

const FORMATS: { value: Format; label: string; desc: string }[] = [
  { value: "hta",                label: ".hta — HTML-App (läuft direkt!)",       desc: "Dein HTML/JS als native Windows-App. Doppelklick = öffnet." },
  { value: "bat",                label: ".bat — Batch-Skript",                    desc: "CMD-Skript. Direkt ausführbar." },
  { value: "cmd",                label: ".cmd — Command-Skript",                  desc: "Wie .bat, modernere Endung." },
  { value: "ps1",                label: ".ps1 — PowerShell",                      desc: "Mächtiges Admin-Skript." },
  { value: "vbs",                label: ".vbs — VBScript",                        desc: "Klassisches Windows-Skript." },
  { value: "reg",                label: ".reg — Registry-Datei",                  desc: "Registry-Einträge per Doppelklick importieren." },
  { value: "inf",                label: ".inf — Setup-Information",               desc: "Installationsbeschreibung." },
  { value: "manifest",           label: ".manifest — App-Manifest",               desc: "Metadaten / DPI / UAC." },
  { value: "portable-zip",       label: "Portable ZIP (HTML-App)",                desc: "Entpacken → run.bat starten." },
  { value: "electron-project",   label: "Electron-Projekt → .exe",                desc: "ZIP mit build.bat. Auf Windows: npm i && npm run dist → .exe" },
  { value: "tauri-project",      label: "Tauri-Projekt → kleine .exe",            desc: "Native Rust-EXE (~3 MB). build.bat liefert die EXE." },
  { value: "pyinstaller-project",label: "PyInstaller-Projekt → .exe",             desc: "Python → EXE über build.bat." },
  { value: "dotnet-project",     label: ".NET-Projekt → .exe",                    desc: "C#-Wrapper. dotnet publish liefert die EXE." },
];

function download(name: string, content: string | Blob, mime = "text/plain") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function esc(s: string) { return s.replace(/`/g, "\\`").replace(/\$/g, "\\$"); }

export const WindowsExport = ({ code, language }: Props) => {
  const [format, setFormat] = useState<Format>("hta");
  const [appName, setAppName] = useState("MeineApp");

  const current = FORMATS.find(f => f.value === format)!;

  const generate = async () => {
    const safe = (appName || "MeineApp").replace(/[^a-zA-Z0-9_-]/g, "_");
    try {
      switch (format) {
        case "hta": {
          const html = code.includes("<html") ? code :
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safe}</title></head><body>${code}</body></html>`;
          const hta = `<html><head><HTA:APPLICATION ID="${safe}" APPLICATIONNAME="${safe}" BORDER="thin" INNERBORDER="no" SCROLL="auto" SINGLEINSTANCE="yes" WINDOWSTATE="normal" /><title>${safe}</title></head><body>${html.replace(/^[\s\S]*?<body[^>]*>/i,"").replace(/<\/body>[\s\S]*$/i,"")}</body></html>`;
          download(`${safe}.hta`, hta, "application/hta");
          break;
        }
        case "bat":
        case "cmd": {
          const content = `@echo off\r\nREM ${safe}\r\nsetlocal\r\n${language === "bash" ? code.replace(/\n/g,"\r\n") : `echo Generated from ${language}\r\nREM --- Original Code ---\r\n${code.split("\n").map(l=>`REM ${l}`).join("\r\n")}`}\r\npause\r\n`;
          download(`${safe}.${format}`, content);
          break;
        }
        case "ps1": {
          const content = `# ${safe}\r\n# Generated PowerShell Script\r\n${language === "powershell" || language === "bash" ? code : code.split("\n").map(l=>`# ${l}`).join("\r\n")}\r\nWrite-Host "Fertig" -ForegroundColor Green\r\n`;
          download(`${safe}.ps1`, content);
          break;
        }
        case "vbs": {
          const content = `' ${safe}\r\nDim msg\r\nmsg = "${safe} läuft"\r\nMsgBox msg, 64, "${safe}"\r\n`;
          download(`${safe}.vbs`, content);
          break;
        }
        case "reg": {
          const content = `Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\${safe}]\r\n"Version"="1.0"\r\n"InstalledBy"="CodeForge"\r\n`;
          download(`${safe}.reg`, content);
          break;
        }
        case "inf": {
          const content = `[Version]\r\nSignature="$Windows NT$"\r\nClass=Application\r\nProvider=%Provider%\r\n\r\n[Strings]\r\nProvider="CodeForge"\r\nAppName="${safe}"\r\n`;
          download(`${safe}.inf`, content);
          break;
        }
        case "manifest": {
          const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">\r\n  <assemblyIdentity version="1.0.0.0" name="${safe}"/>\r\n  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">\r\n    <security><requestedPrivileges><requestedExecutionLevel level="asInvoker" uiAccess="false"/></requestedPrivileges></security>\r\n  </trustInfo>\r\n  <application xmlns="urn:schemas-microsoft-com:asm.v3">\r\n    <windowsSettings><dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true</dpiAware></windowsSettings>\r\n  </application>\r\n</assembly>\r\n`;
          download(`${safe}.manifest`, content);
          break;
        }
        case "portable-zip": {
          const zip = new JSZip();
          const html = code.includes("<html") ? code : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safe}</title></head><body>${code}</body></html>`;
          zip.file("index.html", html);
          zip.file("run.bat", `@echo off\r\nstart "" "%~dp0index.html"\r\n`);
          zip.file("README.txt", `${safe}\r\n\r\nDoppelklick auf run.bat zum Starten.\r\nPortable - keine Installation nötig.\r\n`);
          download(`${safe}-portable.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
          break;
        }
        case "electron-project": {
          const zip = new JSZip();
          const html = code.includes("<html") ? code : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safe}</title></head><body>${code}</body></html>`;
          zip.file("index.html", html);
          zip.file("main.js", `const { app, BrowserWindow } = require('electron');\nfunction create(){ const w = new BrowserWindow({width:1024,height:768,webPreferences:{contextIsolation:true}}); w.loadFile('index.html'); }\napp.whenReady().then(create);\napp.on('window-all-closed', () => app.quit());\n`);
          zip.file("package.json", JSON.stringify({
            name: safe.toLowerCase(), version: "1.0.0", main: "main.js",
            scripts: { start: "electron .", dist: "electron-builder --win" },
            devDependencies: { electron: "^28.0.0", "electron-builder": "^24.0.0" },
            build: { appId: `com.codeforge.${safe.toLowerCase()}`, win: { target: "nsis" } }
          }, null, 2));
          zip.file("build.bat", `@echo off\r\necho [1/2] Installiere Abhaengigkeiten...\r\ncall npm install\r\necho [2/2] Baue Windows EXE...\r\ncall npm run dist\r\necho Fertig! Siehe Ordner dist\\\r\npause\r\n`);
          zip.file("README.md", `# ${safe} (Electron)\n\nAuf Windows:\n1. Node.js installieren (https://nodejs.org)\n2. Doppelklick auf build.bat\n3. EXE liegt in dist/\n`);
          download(`${safe}-electron.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
          break;
        }
        case "tauri-project": {
          const zip = new JSZip();
          const html = code.includes("<html") ? code : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safe}</title></head><body>${code}</body></html>`;
          zip.file("dist/index.html", html);
          zip.file("src-tauri/tauri.conf.json", JSON.stringify({
            build: { distDir: "../dist", devPath: "../dist" },
            package: { productName: safe, version: "1.0.0" },
            tauri: { bundle: { active: true, identifier: `com.codeforge.${safe.toLowerCase()}`, targets: ["msi","nsis"] }, windows: [{ title: safe, width: 1024, height: 768 }] }
          }, null, 2));
          zip.file("src-tauri/Cargo.toml", `[package]\nname = "${safe.toLowerCase()}"\nversion = "1.0.0"\nedition = "2021"\n\n[build-dependencies]\ntauri-build = { version = "1", features = [] }\n\n[dependencies]\ntauri = { version = "1", features = [] }\n`);
          zip.file("src-tauri/src/main.rs", `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]\nfn main() { tauri::Builder::default().run(tauri::generate_context!()).expect("error"); }\n`);
          zip.file("build.bat", `@echo off\r\ncargo install tauri-cli\r\ncargo tauri build\r\npause\r\n`);
          zip.file("README.md", `# ${safe} (Tauri)\n\nBraucht Rust + WebView2. build.bat ausführen.\nErgebnis: src-tauri/target/release/bundle/\n`);
          download(`${safe}-tauri.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
          break;
        }
        case "pyinstaller-project": {
          const zip = new JSZip();
          const py = language === "python" ? code : `# Generated wrapper\nimport webbrowser, os\nhtml = """${esc(code.includes("<html")?code:`<!DOCTYPE html><html><body>${code}</body></html>`)}"""\np = os.path.join(os.path.dirname(__file__), "app.html")\nopen(p,"w",encoding="utf-8").write(html)\nwebbrowser.open(p)\n`;
          zip.file("main.py", py);
          zip.file("requirements.txt", "pyinstaller\n");
          zip.file("build.bat", `@echo off\r\npip install -r requirements.txt\r\npyinstaller --onefile --name ${safe} main.py\r\necho EXE liegt in dist\\${safe}.exe\r\npause\r\n`);
          zip.file("README.md", `# ${safe} (PyInstaller)\n\nbuild.bat liefert dist/${safe}.exe\n`);
          download(`${safe}-pyinstaller.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
          break;
        }
        case "dotnet-project": {
          const zip = new JSZip();
          zip.file(`${safe}.csproj`, `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>WinExe</OutputType>\n    <TargetFramework>net8.0-windows</TargetFramework>\n    <UseWindowsForms>true</UseWindowsForms>\n    <PublishSingleFile>true</PublishSingleFile>\n    <SelfContained>true</SelfContained>\n    <RuntimeIdentifier>win-x64</RuntimeIdentifier>\n  </PropertyGroup>\n</Project>\n`);
          const html = code.includes("<html") ? code : `<!DOCTYPE html><html><body>${code}</body></html>`;
          zip.file("app.html", html);
          zip.file("Program.cs", `using System.Diagnostics;\nusing System.IO;\nvar path = Path.Combine(AppContext.BaseDirectory, "app.html");\nProcess.Start(new ProcessStartInfo(path){UseShellExecute=true});\n`);
          zip.file("build.bat", `@echo off\r\ndotnet publish -c Release -r win-x64\r\necho EXE: bin\\Release\\net8.0-windows\\win-x64\\publish\\${safe}.exe\r\npause\r\n`);
          download(`${safe}-dotnet.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
          break;
        }
      }
      toast.success(`${current.label.split(" — ")[0]} erstellt!`);
    } catch (e: any) {
      toast.error("Fehler: " + e.message);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-card/40 backdrop-blur-xl p-3 sm:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm sm:text-base">Windows Export</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Echte Windows-Dateien aus deinem Code. .hta/.bat/.ps1/.reg laufen direkt — für .exe gibt's ein Projekt + build.bat.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <Input
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="App-Name"
          className="h-9 bg-background/50 border-primary/30 text-sm"
        />
        <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
          <SelectTrigger className="h-9 bg-background/50 border-primary/30 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {FORMATS.map(f => (
              <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[11px] text-muted-foreground italic">{current.desc}</p>
      <Button onClick={generate} className="w-full h-9 bg-gradient-to-r from-blue-600 to-cyan-500 text-sm">
        <Download className="w-4 h-4 mr-2" /> Herunterladen
      </Button>
    </div>
  );
};
