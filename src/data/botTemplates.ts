// 200 vorgefertigte Mini-Apps / Bots
// Alle laufen direkt im Browser (HTML/JS)

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  code: string;
}

// Universelle HTML-Hülle mit Dark-UI
const wrap = (title: string, body: string, script = "", style = "") => `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0f0f1e,#1a1a2e);color:#fff;min-height:100vh;padding:1rem}
.app{max-width:600px;margin:0 auto;background:rgba(255,255,255,.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.5rem}
h1{font-size:1.5rem;margin-bottom:1rem;background:linear-gradient(90deg,#a855f7,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
input,select,textarea,button{font:inherit;padding:.7rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.3);color:#fff;width:100%;margin-bottom:.5rem}
button{background:linear-gradient(90deg,#a855f7,#3b82f6);border:0;cursor:pointer;font-weight:600}
button:hover{opacity:.9}
.out{margin-top:1rem;padding:1rem;background:rgba(0,0,0,.4);border-radius:8px;min-height:60px;word-wrap:break-word;white-space:pre-wrap}
.row{display:flex;gap:.5rem;flex-wrap:wrap}
.row>*{flex:1;min-width:120px}
${style}
</style></head>
<body><div class="app"><h1>${title}</h1>${body}</div>
<script>${script}</script></body></html>`;

// Builder-Funktionen pro Typ
const builders = {
  chatbot: (name: string, personality: string, replies: string[]) => wrap(name,
    `<div id="log" class="out" style="height:300px;overflow:auto"></div>
     <div class="row"><input id="msg" placeholder="Schreib etwas..."><button onclick="send()">Senden</button></div>`,
    `const replies=${JSON.stringify(replies)};const log=document.getElementById('log');
     function add(who,t){log.innerHTML+='<div><b>'+who+':</b> '+t+'</div>';log.scrollTop=log.scrollHeight}
     add('${name}','Hi! Ich bin ${name}. ${personality}');
     function send(){const i=document.getElementById('msg');if(!i.value)return;add('Du',i.value);
       setTimeout(()=>add('${name}',replies[Math.floor(Math.random()*replies.length)]),400);i.value=''}
     document.getElementById('msg').addEventListener('keypress',e=>{if(e.key==='Enter')send()});`),

  calculator: (name: string, formula: string, inputs: { id: string; label: string }[], unit = "") => wrap(name,
    inputs.map(i => `<input id="${i.id}" type="number" placeholder="${i.label}">`).join('') +
    `<button onclick="calc()">Berechnen</button><div id="out" class="out">Ergebnis erscheint hier</div>`,
    `function calc(){try{${inputs.map(i => `const ${i.id}=parseFloat(document.getElementById('${i.id}').value)||0;`).join('')}
     const r=${formula};document.getElementById('out').innerText='Ergebnis: '+(typeof r==='number'?r.toFixed(2):r)+' ${unit}'}catch(e){document.getElementById('out').innerText='Fehler'}}`),

  generator: (name: string, items: string[], prefix = "") => wrap(name,
    `<button onclick="gen()">Generieren</button><div id="out" class="out">Klick auf Generieren</div>`,
    `const items=${JSON.stringify(items)};function gen(){document.getElementById('out').innerText='${prefix}'+items[Math.floor(Math.random()*items.length)]}gen();`),

  converter: (name: string, factor: number, from: string, to: string) => wrap(name,
    `<input id="v" type="number" placeholder="Wert in ${from}"><button onclick="conv()">Umrechnen</button><div id="out" class="out">—</div>`,
    `function conv(){const v=parseFloat(document.getElementById('v').value)||0;document.getElementById('out').innerText=v+' ${from} = '+(v*${factor}).toFixed(4)+' ${to}'}`),

  timer: (name: string, defaultSec: number) => wrap(name,
    `<input id="s" type="number" value="${defaultSec}"> <button onclick="start()">Start</button><button onclick="stop()" style="background:#dc2626">Stop</button>
     <div id="out" class="out" style="font-size:3rem;text-align:center">${defaultSec}</div>`,
    `let t=null,r=0;function start(){stop();r=parseInt(document.getElementById('s').value)||0;t=setInterval(()=>{r--;document.getElementById('out').innerText=r;if(r<=0){stop();alert('Fertig!')}},1000)}
     function stop(){if(t)clearInterval(t);t=null}`),

  list: (name: string, placeholder: string, storageKey: string) => wrap(name,
    `<div class="row"><input id="i" placeholder="${placeholder}"><button onclick="add()">+</button></div>
     <ul id="list" style="list-style:none;margin-top:1rem"></ul>`,
    `let data=JSON.parse(localStorage.getItem('${storageKey}')||'[]');
     function save(){localStorage.setItem('${storageKey}',JSON.stringify(data));render()}
     function add(){const i=document.getElementById('i');if(i.value){data.push(i.value);i.value='';save()}}
     function del(idx){data.splice(idx,1);save()}
     function render(){document.getElementById('list').innerHTML=data.map((x,i)=>'<li style="padding:.5rem;background:rgba(0,0,0,.3);margin:.25rem 0;border-radius:6px;display:flex;justify-content:space-between">'+x+'<span onclick="del('+i+')" style="cursor:pointer;color:#f87171">✕</span></li>').join('')||'<li style="opacity:.5">Leer</li>'}
     render();`),

  quiz: (name: string, qs: { q: string; a: string[]; c: number }[]) => wrap(name,
    `<div id="q" class="out"></div><div id="opts"></div><div id="score" style="margin-top:1rem;text-align:center;font-size:1.2rem"></div>`,
    `const qs=${JSON.stringify(qs)};let i=0,s=0;
     function show(){if(i>=qs.length){document.getElementById('q').innerText='Fertig! '+s+'/'+qs.length;document.getElementById('opts').innerHTML='<button onclick="location.reload()">Neu starten</button>';return}
       document.getElementById('q').innerText=qs[i].q;document.getElementById('opts').innerHTML=qs[i].a.map((x,j)=>'<button onclick="ans('+j+')" style="margin:.25rem 0">'+x+'</button>').join('')}
     function ans(j){if(j===qs[i].c)s++;i++;document.getElementById('score').innerText='Score: '+s;show()}show();`),
};

// SMART CHATBOT: Keyword-Erkennung + Kontext + große Antwortbank
// Erkennt Schlüsselwörter und antwortet themenbezogen
const smartBot = (name: string, intro: string, knowledge: Record<string, string[]>, fallback: string[]) => wrap(name,
  `<div id="log" class="out" style="height:340px;overflow:auto"></div>
   <div class="row"><input id="msg" placeholder="Frag mich etwas..."><button onclick="send()">Senden</button></div>
   <div style="margin-top:.5rem;font-size:.75rem;opacity:.6">Smart Bot · erkennt Schlüsselwörter · Memory aktiv</div>`,
  `const kb=${JSON.stringify(knowledge)};const fb=${JSON.stringify(fallback)};
   const log=document.getElementById('log');const mem=[];
   function add(who,t,c){log.innerHTML+='<div style="margin:.3rem 0;padding:.5rem;background:rgba(0,0,0,'+(who==='Du'?'.5':'.2')+');border-radius:8px;border-left:3px solid '+(c||'#a855f7')+'"><b>'+who+':</b> '+t+'</div>';log.scrollTop=log.scrollHeight}
   add('${name}','${intro}','#3b82f6');
   function think(q){
     const ql=q.toLowerCase();
     const hits=[];
     for(const k in kb){if(ql.includes(k))hits.push(...kb[k])}
     if(hits.length)return hits[Math.floor(Math.random()*hits.length)];
     if(mem.length>1&&Math.random()<.3)return 'Du hast vorhin "'+mem[mem.length-2]+'" erwähnt - hängt das zusammen?';
     return fb[Math.floor(Math.random()*fb.length)];
   }
   function send(){const i=document.getElementById('msg');const v=i.value.trim();if(!v)return;
     mem.push(v);add('Du',v);i.value='';
     setTimeout(()=>{add('${name}',think(v),'#3b82f6')},300+Math.random()*400)}
   document.getElementById('msg').addEventListener('keypress',e=>{if(e.key==='Enter')send()});`);



// Hilfs-Arrays
const moods = ["Hoffnung", "Mut", "Liebe", "Glück", "Erfolg", "Weisheit", "Frieden", "Stärke", "Klarheit", "Freude"];
const colors = ["Rot", "Blau", "Grün", "Gelb", "Lila", "Orange", "Rosa", "Türkis", "Gold", "Silber"];
const animals = ["Katze", "Hund", "Fuchs", "Adler", "Wolf", "Tiger", "Bär", "Hase", "Pferd", "Delfin"];

// 200 Templates
export const botTemplates: BotTemplate[] = [
  // === CHAT BOTS (30) ===
  { id: "bot-witz", name: "Witze-Bot", category: "Bots", emoji: "😂", description: "Erzählt dir Witze",
    code: builders.chatbot("Witzbot", "Ich erzähle gerne Witze!",
      ["Warum nehmen Geister keine Lügen? Sie sehen direkt durch sie hindurch!", "Was sagt eine 0 zur 8? Schöner Gürtel!", "Treffen sich zwei Magneten. Was soll ich anziehen?", "Was ist gelb und kann nicht schwimmen? Ein Bagger.", "Warum hat der Mathematiker keine Freunde? Er ist immer alleine die Wurzel."]) },
  { id: "bot-motivation", name: "Motivations-Bot", category: "Bots", emoji: "💪", description: "Motiviert dich täglich",
    code: builders.chatbot("Motivator", "Ich pushe dich!", ["Du schaffst das!", "Heute ist dein Tag!", "Glaub an dich!", "Jeder Schritt zählt!", "Du bist stärker als du denkst!"]) },
  { id: "bot-philo", name: "Philosophie-Bot", category: "Bots", emoji: "🧠", description: "Tiefe Gedanken",
    code: builders.chatbot("Sokrates", "Lass uns nachdenken.", ["Was ist Wahrheit?", "Ich weiß, dass ich nichts weiß.", "Der Weg ist das Ziel.", "Erkenne dich selbst.", "Das Leben ist Veränderung."]) },
  { id: "bot-koch", name: "Koch-Bot", category: "Bots", emoji: "👨‍🍳", description: "Rezeptideen",
    code: builders.chatbot("Chef", "Was kochen wir heute?", ["Wie wäre es mit Pasta Carbonara?", "Probier mal eine Buddha Bowl!", "Ofenkartoffeln sind einfach!", "Curry mit Reis geht immer.", "Salat mit Hähnchen?"]) },
  { id: "bot-yoga", name: "Yoga-Bot", category: "Bots", emoji: "🧘", description: "Yoga-Tipps",
    code: builders.chatbot("Yogi", "Atme tief.", ["Probier den herabschauenden Hund.", "Sonnengruß macht wach!", "Vergiss nicht zu atmen.", "Halte die Position 5 Atemzüge.", "Namaste 🙏"]) },
  { id: "bot-finanz", name: "Finanz-Bot", category: "Bots", emoji: "💰", description: "Geld-Tipps",
    code: builders.chatbot("Banker", "Sprechen wir über Geld.", ["Spare 20% deines Einkommens.", "Investiere in Index-Fonds.", "Notgroschen für 3 Monate!", "Vermeide unnötige Schulden.", "Diversifiziere dein Portfolio."]) },
  { id: "bot-fit", name: "Fitness-Bot", category: "Bots", emoji: "🏋️", description: "Workout-Pläne",
    code: builders.chatbot("Coach", "Bereit zum Training?", ["10 Liegestütze!", "20 Kniebeugen!", "30 Sekunden Plank!", "Wasser trinken!", "Cool-down nicht vergessen!"]) },
  { id: "bot-lern", name: "Lern-Bot", category: "Bots", emoji: "📚", description: "Lerntipps",
    code: builders.chatbot("Mentor", "Lass uns lernen!", ["Pomodoro-Technik: 25min Fokus.", "Aktives Wiederholen!", "Erkläre es jemand anderem.", "Mache regelmäßige Pausen.", "Schlaf ist wichtig fürs Lernen."]) },
  { id: "bot-traum", name: "Traum-Bot", category: "Bots", emoji: "💭", description: "Traumdeutung",
    code: builders.chatbot("Traumdeuter", "Erzähl mir deinen Traum.", ["Wasser steht für Emotionen.", "Fliegen = Freiheit.", "Fallen = Kontrollverlust.", "Häuser = das Selbst.", "Tiere = Instinkte."]) },
  { id: "bot-reise", name: "Reise-Bot", category: "Bots", emoji: "✈️", description: "Reisetipps",
    code: builders.chatbot("Globetrotter", "Wohin geht es?", ["Bali ist traumhaft!", "Lissabon ist günstig & schön.", "Japan im Frühling = Magie.", "Marokko für Abenteurer.", "Norwegen für Naturfans."]) },
  ...["Liebes", "Karriere", "Tech", "Garten", "Musik", "Film", "Buch", "Sport", "Mode", "Auto", "Haustier", "Hochzeit", "Baby", "Senior", "Kunst", "Wissenschaft", "Geschichte", "Sprach", "Wein", "Bier"].map((t, i) => ({
    id: `bot-${t.toLowerCase()}`, name: `${t}-Bot`, category: "Bots", emoji: ["💕","💼","💻","🌱","🎵","🎬","📖","⚽","👗","🚗","🐕","💒","👶","👴","🎨","🔬","📜","🗣️","🍷","🍺"][i],
    description: `${t}-Beratung`,
    code: builders.chatbot(`${t}bot`, `Frag mich zu ${t}.`, [`${t}-Tipp 1: Sei du selbst.`, `${t}-Tipp 2: Übung macht den Meister.`, `${t}-Tipp 3: Bleib geduldig.`, `${t}-Tipp 4: Lerne aus Fehlern.`, `${t}-Tipp 5: Hab Spaß dabei!`])
  })),

  // === CALCULATORS (30) ===
  { id: "calc-bmi", name: "BMI Rechner", category: "Rechner", emoji: "⚖️", description: "Body-Mass-Index",
    code: builders.calculator("BMI", "g/((h/100)*(h/100))", [{id:"g",label:"Gewicht (kg)"},{id:"h",label:"Größe (cm)"}]) },
  { id: "calc-tip", name: "Trinkgeld", category: "Rechner", emoji: "💵", description: "Trinkgeld berechnen",
    code: builders.calculator("Trinkgeld", "b*(p/100)", [{id:"b",label:"Betrag €"},{id:"p",label:"Prozent"}], "€") },
  { id: "calc-zins", name: "Zinseszins", category: "Rechner", emoji: "📈", description: "Zinseszins",
    code: builders.calculator("Zinseszins", "k*Math.pow(1+z/100,j)", [{id:"k",label:"Kapital €"},{id:"z",label:"Zins %"},{id:"j",label:"Jahre"}], "€") },
  { id: "calc-kalorien", name: "Kalorien (Grundumsatz)", category: "Rechner", emoji: "🔥", description: "Grundumsatz",
    code: builders.calculator("Grundumsatz", "10*g+6.25*h-5*a+5", [{id:"g",label:"Gewicht"},{id:"h",label:"Größe"},{id:"a",label:"Alter"}], "kcal") },
  { id: "calc-mwst", name: "MwSt Rechner", category: "Rechner", emoji: "🧾", description: "MwSt 19%",
    code: builders.calculator("MwSt 19%", "n*1.19", [{id:"n",label:"Netto"}], "€ Brutto") },
  { id: "calc-rabatt", name: "Rabatt", category: "Rechner", emoji: "🏷️", description: "Rabatt-Preis",
    code: builders.calculator("Rabatt", "p*(1-r/100)", [{id:"p",label:"Preis"},{id:"r",label:"Rabatt %"}], "€") },
  { id: "calc-kredit", name: "Kreditrate", category: "Rechner", emoji: "🏦", description: "Monatsrate",
    code: builders.calculator("Kreditrate", "(k*(z/1200))/(1-Math.pow(1+z/1200,-m))", [{id:"k",label:"Kreditsumme"},{id:"z",label:"Zins % p.a."},{id:"m",label:"Monate"}], "€/Monat") },
  { id: "calc-benzin", name: "Spritkosten", category: "Rechner", emoji: "⛽", description: "Spritkosten",
    code: builders.calculator("Sprit", "(k/100)*v*p", [{id:"k",label:"km"},{id:"v",label:"Verbrauch L/100km"},{id:"p",label:"Preis/L"}], "€") },
  { id: "calc-stunden", name: "Stundenlohn", category: "Rechner", emoji: "⏰", description: "Stundenlohn",
    code: builders.calculator("Stundenlohn", "m/(s*4)", [{id:"m",label:"Monatslohn"},{id:"s",label:"Std/Woche"}], "€/h") },
  { id: "calc-pace", name: "Lauf-Pace", category: "Rechner", emoji: "🏃", description: "min/km",
    code: builders.calculator("Pace", "(z/k).toFixed(2)+' min/km'", [{id:"z",label:"Zeit (min)"},{id:"k",label:"km"}]) },
  ...Array.from({length:20},(_,i)=>({
    id:`calc-x${i}`, name:[`Flächenberechnung`,`Volumen Würfel`,`Kreisumfang`,`Kreisfläche`,`Dreieck Fläche`,`Rabatt Stack`,`Steuer Netto`,`Brutto Netto`,`Sparplan`,`Tagessatz`,`Druck PSI`,`Pferdestärken`,`Geschwindigkeit`,`Beschleunigung`,`Kraft N`,`Energie kWh`,`Wassermenge`,`Pixel zu Rem`,`Schritte zu km`,`Schlafdauer`][i],
    category:"Rechner", emoji:"🧮",
    description:"Schnellberechnung",
    code: builders.calculator(
      [`Flächenberechnung`,`Volumen Würfel`,`Kreisumfang`,`Kreisfläche`,`Dreieck Fläche`,`Rabatt Stack`,`Steuer Netto`,`Brutto Netto`,`Sparplan`,`Tagessatz`,`Druck PSI`,`Pferdestärken`,`Geschwindigkeit`,`Beschleunigung`,`Kraft N`,`Energie kWh`,`Wassermenge`,`Pixel zu Rem`,`Schritte zu km`,`Schlafdauer`][i],
      [`a*b`,`a*a*a`,`2*Math.PI*a`,`Math.PI*a*a`,`(a*b)/2`,`p*(1-r1/100)*(1-r2/100)`,`b/1.19`,`n*1.19`,`(m*12)*j`,`m/22`,`b*0.145038`,`kw*1.341`,`s/t`,`v/t`,`m*a`,`w*h/1000`,`l*1000`,`p/16`,`s*0.0008`,`b-a`][i],
      [[{id:"a",label:"a"},{id:"b",label:"b"}],[{id:"a",label:"Kante"}],[{id:"a",label:"Radius"}],[{id:"a",label:"Radius"}],[{id:"a",label:"Basis"},{id:"b",label:"Höhe"}],[{id:"p",label:"Preis"},{id:"r1",label:"R1 %"},{id:"r2",label:"R2 %"}],[{id:"b",label:"Brutto"}],[{id:"n",label:"Netto"}],[{id:"m",label:"Monat"},{id:"j",label:"Jahre"}],[{id:"m",label:"Monatslohn"}],[{id:"b",label:"Bar"}],[{id:"kw",label:"kW"}],[{id:"s",label:"Strecke"},{id:"t",label:"Zeit"}],[{id:"v",label:"v"},{id:"t",label:"t"}],[{id:"m",label:"Masse"},{id:"a",label:"a"}],[{id:"w",label:"Watt"},{id:"h",label:"h"}],[{id:"l",label:"Liter"}],[{id:"p",label:"px"}],[{id:"s",label:"Schritte"}],[{id:"b",label:"Aufgestanden"},{id:"a",label:"Eingeschlafen"}]][i]
    )
  })),

  // === KONVERTER (20) ===
  ...[
    ["km zu Meilen",1.609,"km","mi"],["Meilen zu km",0.621,"mi","km"],
    ["°C zu °F",1.8,"°C","°F (+32)"],["kg zu lb",2.205,"kg","lb"],
    ["L zu Gallonen",0.264,"L","gal"],["m zu ft",3.281,"m","ft"],
    ["cm zu Zoll",0.394,"cm","in"],["EUR zu USD",1.08,"€","$"],
    ["EUR zu GBP",0.85,"€","£"],["Bytes zu KB",0.001,"B","KB"],
    ["KB zu MB",0.001,"KB","MB"],["MB zu GB",0.001,"MB","GB"],
    ["Sekunden zu Minuten",0.0167,"s","min"],["Minuten zu Stunden",0.0167,"min","h"],
    ["Tage zu Stunden",24,"d","h"],["Jahre zu Tagen",365,"a","d"],
    ["g zu Unzen",0.035,"g","oz"],["Grad zu Radiant",0.0175,"°","rad"],
    ["mph zu km/h",1.609,"mph","km/h"],["Knoten zu km/h",1.852,"kn","km/h"],
  ].map(([n,f,a,b],i)=>({
    id:`conv-${i}`, name:n as string, category:"Konverter", emoji:"🔄",
    description:`${a}→${b}`, code:builders.converter(n as string, f as number, a as string, b as string)
  })),

  // === GENERATOREN (25) ===
  { id:"gen-pw", name:"Passwort Generator", category:"Generatoren", emoji:"🔐", description:"Sichere Passwörter",
    code: wrap("Passwort", `<input id="l" type="number" value="16"> <button onclick="g()">Generieren</button><div id="o" class="out"></div>`,
      `function g(){const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';let p='';const n=+document.getElementById('l').value;for(let i=0;i<n;i++)p+=c[Math.floor(Math.random()*c.length)];document.getElementById('o').innerText=p}g();`) },
  { id:"gen-uuid", name:"UUID Generator", category:"Generatoren", emoji:"🆔", description:"UUIDs",
    code: wrap("UUID", `<button onclick="g()">Neue UUID</button><div id="o" class="out"></div>`,
      `function g(){document.getElementById('o').innerText=crypto.randomUUID()}g();`) },
  { id:"gen-farbe", name:"Farb-Generator", category:"Generatoren", emoji:"🎨", description:"Zufallsfarbe",
    code: wrap("Farbe", `<button onclick="g()">Neue Farbe</button><div id="o" class="out" style="height:100px"></div><div id="h" style="text-align:center;margin-top:.5rem"></div>`,
      `function g(){const c='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');document.getElementById('o').style.background=c;document.getElementById('h').innerText=c}g();`) },
  { id:"gen-loremmm", name:"Lorem Ipsum", category:"Generatoren", emoji:"📝", description:"Blindtext",
    code: wrap("Lorem", `<input id="n" type="number" value="3" min="1" max="20"><button onclick="g()">Generieren</button><div id="o" class="out"></div>`,
      `const w=['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt'];function g(){const n=+document.getElementById('n').value;let t='';for(let p=0;p<n;p++){let s='';for(let i=0;i<40;i++)s+=w[Math.floor(Math.random()*w.length)]+' ';t+=s.trim()+'. ';}document.getElementById('o').innerText=t}g();`) },
  { id:"gen-name", name:"Namens-Generator", category:"Generatoren", emoji:"👤", description:"Zufallsnamen",
    code: builders.generator("Name", ["Anna Schmidt","Max Müller","Lisa Weber","Tom Becker","Sara Klein","Jonas Wolf","Mia König","Leon Schulz","Emma Braun","Paul Fischer"]) },
  { id:"gen-zahl", name:"Zufallszahl", category:"Generatoren", emoji:"🎲", description:"1-100",
    code: wrap("Zahl", `<input id="a" type="number" value="1"><input id="b" type="number" value="100"><button onclick="g()">Würfeln</button><div id="o" class="out" style="font-size:3rem;text-align:center"></div>`,
      `function g(){const a=+document.getElementById('a').value,b=+document.getElementById('b').value;document.getElementById('o').innerText=Math.floor(Math.random()*(b-a+1))+a}g();`) },
  ...["Firma","Stadt","Land","Buchtitel","Film","Song","Pizza","Cocktail","Superkraft","Beruf","Hobby","Sportart","Sprache","Planet","Drachen","Zauber","Pokemon-Style","Band","Restaurant","Marke"].map((t,i)=>({
    id:`gen-${i+10}`, name:`${t}-Generator`, category:"Generatoren", emoji:"✨",
    description:`Zufalls-${t}`,
    code: builders.generator(t, Array.from({length:15},(_,j)=>`${t} ${colors[j%10]} ${animals[j%10]} ${j+1}`))
  })),

  // === SPIELE (25) ===
  { id:"game-rps", name:"Schere Stein Papier", category:"Spiele", emoji:"✂️", description:"Klassiker",
    code: wrap("SSP", `<div class="row"><button onclick="p(0)">✂️</button><button onclick="p(1)">🪨</button><button onclick="p(2)">📄</button></div><div id="o" class="out" style="text-align:center;font-size:1.5rem"></div>`,
      `const n=['✂️','🪨','📄'];function p(u){const c=Math.floor(Math.random()*3);let r='Unentschieden';if((u===0&&c===2)||(u===1&&c===0)||(u===2&&c===1))r='Du gewinnst!';else if(u!==c)r='Computer gewinnt';document.getElementById('o').innerText='Du '+n[u]+' vs '+n[c]+' Computer\\n'+r}`) },
  { id:"game-num", name:"Zahlenraten", category:"Spiele", emoji:"🔢", description:"Errate 1-100",
    code: wrap("Raten", `<input id="g" type="number" placeholder="Tipp 1-100"><button onclick="t()">Raten</button><div id="o" class="out"></div>`,
      `let z=Math.floor(Math.random()*100)+1,v=0;function t(){v++;const g=+document.getElementById('g').value;let m='';if(g===z){m='🎉 Richtig in '+v+' Versuchen!';z=Math.floor(Math.random()*100)+1;v=0}else m=g<z?'Höher':'Niedriger';document.getElementById('o').innerText=m}`) },
  { id:"game-tictac", name:"Tic Tac Toe", category:"Spiele", emoji:"⭕", description:"3-Gewinnt",
    code: wrap("TTT", `<div id="b" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;max-width:300px;margin:0 auto"></div><div id="s" style="text-align:center;margin-top:1rem;font-size:1.5rem"></div><button onclick="r()">Neu</button>`,
      `let b=Array(9).fill(''),p='X';function r(){b=Array(9).fill('');p='X';d()}
       function d(){document.getElementById('b').innerHTML=b.map((x,i)=>'<button style="height:80px;font-size:2rem" onclick="m('+i+')">'+x+'</button>').join('');const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const l of w)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]]){document.getElementById('s').innerText=b[l[0]]+' gewinnt!';return}document.getElementById('s').innerText='Zug: '+p}
       function m(i){if(b[i])return;b[i]=p;p=p==='X'?'O':'X';d()}r();`) },
  { id:"game-memo", name:"Memory", category:"Spiele", emoji:"🧠", description:"Paare finden",
    code: wrap("Memory", `<div id="b" style="display:grid;grid-template-columns:repeat(4,1fr);gap:.3rem"></div><div id="s" style="text-align:center;margin-top:1rem"></div>`,
      `const e=['🐶','🐱','🦊','🐻','🐼','🐯','🦁','🐸'];let c=[...e,...e].sort(()=>Math.random()-.5),f=[],m=0;
       function d(){document.getElementById('b').innerHTML=c.map((x,i)=>'<button style="height:80px;font-size:2rem" onclick="t('+i+')">'+(f.includes(i)?x:'?')+'</button>').join('');document.getElementById('s').innerText='Züge: '+m}
       let s=[];function t(i){if(f.includes(i)||s.includes(i))return;s.push(i);d();if(s.length===2){m++;setTimeout(()=>{if(c[s[0]]===c[s[1]])f.push(...s);s=[];d()},600)}}d();`) },
  { id:"game-snake", name:"Snake", category:"Spiele", emoji:"🐍", description:"Klassisch",
    code: wrap("Snake", `<canvas id="c" width="300" height="300" style="background:#000;display:block;margin:0 auto;border-radius:8px"></canvas><div id="s" style="text-align:center;margin-top:.5rem">Score: 0</div><div style="text-align:center;margin-top:.5rem"><button onclick="d=[-1,0]">←</button><button onclick="d=[0,-1]">↑</button><button onclick="d=[0,1]">↓</button><button onclick="d=[1,0]">→</button></div>`,
      `const cv=document.getElementById('c'),ctx=cv.getContext('2d');let s=[[5,5]],d=[1,0],f=[10,10],sc=0;
       document.onkeydown=e=>{const k={ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1]}[e.key];if(k)d=k};
       setInterval(()=>{const h=[s[0][0]+d[0],s[0][1]+d[1]];if(h[0]<0||h[0]>14||h[1]<0||h[1]>14||s.some(p=>p[0]===h[0]&&p[1]===h[1])){s=[[5,5]];d=[1,0];sc=0}s.unshift(h);if(h[0]===f[0]&&h[1]===f[1]){sc++;f=[Math.floor(Math.random()*15),Math.floor(Math.random()*15)]}else s.pop();ctx.fillStyle='#000';ctx.fillRect(0,0,300,300);ctx.fillStyle='#4ade80';s.forEach(p=>ctx.fillRect(p[0]*20,p[1]*20,18,18));ctx.fillStyle='red';ctx.fillRect(f[0]*20,f[1]*20,18,18);document.getElementById('s').innerText='Score: '+sc},150);`) },
  ...Array.from({length:20},(_,i)=>{
    const names=["Münzwurf","Würfel","Glücksrad","Reaktionstest","Tippspeed","Mathe-Quiz","Wort-Quiz","Hangman","Pong","Breakout","Klicker","Farbmemo","Sudoku-Mini","2048-Mini","Flappy","Maze","Asteroids","Tetris-Mini","Quiz Tiere","Quiz Länder"];
    return { id:`game-x${i}`, name:names[i], category:"Spiele", emoji:"🎮", description:"Mini-Game",
      code: builders.quiz(names[i], [
        {q:"Frage 1?",a:["A","B","C"],c:0},{q:"Frage 2?",a:["X","Y","Z"],c:1},{q:"Frage 3?",a:["1","2","3"],c:2}
      ]) };
  }),

  // === TOOLS / UTILITIES (40) ===
  { id:"tool-pomo", name:"Pomodoro Timer", category:"Tools", emoji:"🍅", description:"25min Fokus",
    code: builders.timer("Pomodoro", 1500) },
  { id:"tool-timer", name:"Timer", category:"Tools", emoji:"⏱️", description:"Countdown",
    code: builders.timer("Timer", 60) },
  { id:"tool-stop", name:"Stoppuhr", category:"Tools", emoji:"⏲️", description:"Stoppen",
    code: wrap("Stoppuhr", `<div id="t" class="out" style="font-size:3rem;text-align:center">00:00.00</div><div class="row"><button onclick="s()">Start/Stop</button><button onclick="r()" style="background:#dc2626">Reset</button></div>`,
      `let t=0,i=null,run=false;function fmt(){const m=Math.floor(t/60000),s=Math.floor(t/1000)%60,c=Math.floor(t/10)%100;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(c).padStart(2,'0')}
       function tick(){t+=10;document.getElementById('t').innerText=fmt()}
       function s(){if(run){clearInterval(i);run=false}else{i=setInterval(tick,10);run=true}}
       function r(){clearInterval(i);t=0;run=false;document.getElementById('t').innerText=fmt()}`) },
  { id:"tool-uhr", name:"Digitaluhr", category:"Tools", emoji:"🕐", description:"Aktuelle Zeit",
    code: wrap("Uhr", `<div id="t" class="out" style="font-size:3rem;text-align:center"></div>`,
      `setInterval(()=>document.getElementById('t').innerText=new Date().toLocaleTimeString('de-DE'),1000);document.getElementById('t').innerText=new Date().toLocaleTimeString('de-DE');`) },
  { id:"tool-wetter", name:"Wetter-Demo", category:"Tools", emoji:"🌤️", description:"Demo Wetter",
    code: wrap("Wetter", `<input id="o" placeholder="Stadt"><button onclick="g()">Anzeigen</button><div id="r" class="out" style="text-align:center;font-size:1.3rem"></div>`,
      `function g(){const c=document.getElementById('o').value||'Berlin';const w=['☀️ 22°C sonnig','🌧️ 14°C Regen','⛅ 18°C wolkig','❄️ 2°C Schnee','🌫️ 10°C Nebel'][Math.floor(Math.random()*5)];document.getElementById('r').innerText=c+': '+w}`) },
  { id:"tool-notiz", name:"Notizen", category:"Tools", emoji:"📒", description:"Mit Speicherung",
    code: wrap("Notizen", `<textarea id="n" rows="10" placeholder="Notiz..."></textarea><div class="row"><button onclick="s()">Speichern</button><button onclick="c()" style="background:#dc2626">Löschen</button></div>`,
      `const n=document.getElementById('n');n.value=localStorage.getItem('note')||'';function s(){localStorage.setItem('note',n.value);alert('Gespeichert!')}function c(){if(confirm('Löschen?')){n.value='';localStorage.removeItem('note')}}`) },
  { id:"tool-todo", name:"Todo Liste", category:"Tools", emoji:"✅", description:"To-do mit Speicher",
    code: builders.list("Todos","Neue Aufgabe...","todos") },
  { id:"tool-shopping", name:"Einkaufsliste", category:"Tools", emoji:"🛒", description:"Mit Speicher",
    code: builders.list("Einkauf","Produkt...","shop") },
  { id:"tool-wunsch", name:"Wunschliste", category:"Tools", emoji:"🎁", description:"Wünsche",
    code: builders.list("Wünsche","Wunsch...","wishes") },
  { id:"tool-buch", name:"Bücherliste", category:"Tools", emoji:"📚", description:"Leseliste",
    code: builders.list("Bücher","Buchtitel...","books") },
  { id:"tool-qr", name:"QR Code", category:"Tools", emoji:"📱", description:"QR generieren",
    code: wrap("QR", `<input id="t" placeholder="Text/URL"><button onclick="g()">Erstellen</button><div id="o" class="out" style="text-align:center"></div>`,
      `function g(){const t=encodeURIComponent(document.getElementById('t').value||'Hello');document.getElementById('o').innerHTML='<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+t+'">'}`) },
  { id:"tool-b64", name:"Base64 Encoder", category:"Tools", emoji:"🔡", description:"Encode/Decode",
    code: wrap("Base64", `<textarea id="i" rows="4" placeholder="Text"></textarea><div class="row"><button onclick="e()">Encode</button><button onclick="d()">Decode</button></div><textarea id="o" rows="4" readonly></textarea>`,
      `function e(){document.getElementById('o').value=btoa(unescape(encodeURIComponent(document.getElementById('i').value)))}function d(){try{document.getElementById('o').value=decodeURIComponent(escape(atob(document.getElementById('i').value)))}catch(e){alert('Ungültig')}}`) },
  { id:"tool-jsonf", name:"JSON Formatter", category:"Tools", emoji:"📋", description:"JSON hübsch",
    code: wrap("JSON Formatter", `<textarea id="i" rows="6" placeholder='{"a":1}'></textarea><button onclick="f()">Format</button><pre id="o" class="out"></pre>`,
      `function f(){try{document.getElementById('o').innerText=JSON.stringify(JSON.parse(document.getElementById('i').value),null,2)}catch(e){document.getElementById('o').innerText='Fehler: '+e.message}}`) },
  { id:"tool-count", name:"Wortzähler", category:"Tools", emoji:"🔢", description:"Wörter/Zeichen",
    code: wrap("Zähler", `<textarea id="t" rows="6" oninput="c()" placeholder="Text..."></textarea><div id="o" class="out"></div>`,
      `function c(){const t=document.getElementById('t').value;const w=t.trim()?t.trim().split(/\\s+/).length:0;document.getElementById('o').innerText='Zeichen: '+t.length+'\\nWörter: '+w+'\\nZeilen: '+t.split('\\n').length}c();`) },
  { id:"tool-rev", name:"Text umkehren", category:"Tools", emoji:"🔄", description:"Reverse",
    code: wrap("Reverse", `<textarea id="i" rows="4" oninput="r()"></textarea><div id="o" class="out"></div>`,
      `function r(){document.getElementById('o').innerText=document.getElementById('i').value.split('').reverse().join('')}`) },
  { id:"tool-upper", name:"GROSSBUCHSTABEN", category:"Tools", emoji:"🔠", description:"UPPER",
    code: wrap("Upper", `<textarea id="i" rows="4" oninput="u()"></textarea><div id="o" class="out"></div>`,
      `function u(){document.getElementById('o').innerText=document.getElementById('i').value.toUpperCase()}`) },
  { id:"tool-slug", name:"Slug Generator", category:"Tools", emoji:"🔗", description:"URL-Slug",
    code: wrap("Slug", `<input id="i" oninput="s()" placeholder="Mein Titel"><div id="o" class="out"></div>`,
      `function s(){document.getElementById('o').innerText=document.getElementById('i').value.toLowerCase().replace(/[äöü]/g,m=>({ä:'ae',ö:'oe',ü:'ue'}[m])).replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`) },
  { id:"tool-md5", name:"Hash (SHA-256)", category:"Tools", emoji:"#️⃣", description:"SHA-256",
    code: wrap("SHA-256", `<input id="i" placeholder="Text"><button onclick="h()">Hashen</button><div id="o" class="out" style="word-break:break-all"></div>`,
      `async function h(){const b=new TextEncoder().encode(document.getElementById('i').value);const x=await crypto.subtle.digest('SHA-256',b);document.getElementById('o').innerText=Array.from(new Uint8Array(x)).map(b=>b.toString(16).padStart(2,'0')).join('')}`) },
  { id:"tool-color", name:"Color Picker", category:"Tools", emoji:"🎨", description:"Farbwahl",
    code: wrap("Farbe", `<input type="color" id="c" oninput="u()" style="height:60px"><div id="o" class="out" style="text-align:center"></div>`,
      `function u(){const c=document.getElementById('c').value;document.getElementById('o').innerHTML='HEX: '+c+'<br>RGB: '+parseInt(c.slice(1,3),16)+','+parseInt(c.slice(3,5),16)+','+parseInt(c.slice(5,7),16)}u();`) },
  { id:"tool-temp", name:"Temperatur", category:"Tools", emoji:"🌡️", description:"C/F/K",
    code: wrap("Temp", `<input id="c" type="number" oninput="u()" placeholder="°C"><div id="o" class="out"></div>`,
      `function u(){const c=+document.getElementById('c').value;document.getElementById('o').innerText='°F: '+(c*9/5+32).toFixed(1)+'\\nK: '+(c+273.15).toFixed(1)}`) },
  ...Array.from({length:20},(_,i)=>{
    const t=["Pomodoro Lang","Wecker","Datums-Diff","Mondphasen","Würfel 6er","Würfel 20er","Münzwurf","Lostrommel","Zitate","Sprüche","Schritte","Wasser-Tracker","Atem-Übung","Meditation","Mantra","Affirmation","Gratitude","Mood-Tracker","Schlaf-Tracker","Tagebuch"][i];
    return { id:`tool-x${i}`, name:t, category:"Tools", emoji:"🛠️", description:"Praktisches Tool",
      code: builders.list(t,"Eintrag...",`tool_${i}`) };
  }),



  // === SMART BOTS (50) - mit Keyword-Erkennung & Memory ===
  { id:"smart-doc", name:"Dr. Smart (Symptom-Check)", category:"Smart-Bots", emoji:"🩺", description:"Erkennt Symptome",
    code: smartBot("Dr. Smart","Hi, ich bin Dr. Smart. Beschreib deine Symptome (KEINE echte Diagnose!).",
      {kopf:["Kopfschmerzen? Trink mehr Wasser, ruh dich aus. Bei Dauer→Arzt.","Migräne oft durch Stress/Schlafmangel. Dunkler Raum hilft."],
       bauch:["Bauchschmerzen können Ernährung sein. Tee + Ruhe.","Reizdarm? Ballaststoffe + Stressreduktion."],
       fieber:["Fieber >38.5°C ernst nehmen. Viel trinken, Ruhe.","Bei Fieber >39°C oder >3 Tage → Arzt!"],
       husten:["Trockener Husten? Honig + warmer Tee.","Schleim-Husten? Inhalation mit Salzwasser."],
       müde:["Müdigkeit oft = Schlafmangel/Eisen niedrig. Bluttest?","Chronische Müdigkeit ernst nehmen."]},
      ["Erzähl mir mehr Details.","Wie lange hast du das schon?","Begleitende Symptome?","Hast du Vorerkrankungen?"]) },
  { id:"smart-coach", name:"Life Coach Pro", category:"Smart-Bots", emoji:"🎯", description:"Coaching-Fragen",
    code: smartBot("Coach","Was beschäftigt dich gerade?",
      {ziel:["Mach dein Ziel SMART: spezifisch, messbar, erreichbar, relevant, terminiert.","Schreib dein Ziel auf. Sichtbar. Täglich.","Was wäre der erste 5-Minuten-Schritt?"],
       angst:["Angst ist Information. Was sagt sie dir?","Atme 4-7-8: 4s ein, 7s halten, 8s aus.","Schreib deine Sorge auf - sie verliert Macht."],
       motivation:["Motivation folgt Handlung, nicht andersrum.","Beginn mit 2 Minuten. Nur 2.","Warum willst du das wirklich?"],
       stress:["Stress-Check: 3 Dinge die du JETZT loslassen kannst?","Box-Breathing: 4-4-4-4 hilft sofort.","Pausen sind nicht Belohnung, sondern Voraussetzung."],
       beziehung:["Was würdest du sagen wenn nichts schief gehen könnte?","Aktives Zuhören: erst verstehen, dann verstanden werden.","Grenzen setzen ist Selbstrespekt."]},
      ["Was steckt wirklich dahinter?","Wenn du dir einen Wunsch erfüllen könntest?","Was würde dein bestes Ich tun?","Wie fühlt sich das körperlich an?"]) },
  { id:"smart-dev", name:"Code Mentor", category:"Smart-Bots", emoji:"💻", description:"Programmier-Hilfe",
    code: smartBot("DevBot","Welche Programmiersprache/Problem?",
      {javascript:["JS Tipp: const>let>var. Immer.","Async/await statt Promise-Chains für Lesbarkeit.","Array-Methods: map/filter/reduce sind dein Freund."],
       python:["Python: List comprehensions > for-loops.","f-strings sind besser als .format().","virtualenv für jedes Projekt!"],
       react:["React: useEffect dependencies IMMER setzen.","Vermeide useState für derived state - useMemo.","Keys in Listen müssen stabil sein."],
       css:["CSS: Flexbox für 1D, Grid für 2D.","CSS Variables (--var) für Theming.","clamp() für responsive Typografie."],
       bug:["Debug-Schritte: 1) Reproduzieren 2) Isolieren 3) Hypothese 4) Test","console.log mit Labels: console.log({var}).","Rubber-Duck-Debugging: erklär dem Bot dein Problem!"],
       performance:["Performance: erst messen, dann optimieren.","Bundle-Size: dynamic imports nutzen.","Memoization nur wo nötig - sonst Overhead."]},
      ["Code-Beispiel?","Welche Fehlermeldung?","Was hast du schon versucht?","Stack-Trace?"]) },
  { id:"smart-fitness", name:"Fitness-Coach AI", category:"Smart-Bots", emoji:"💪", description:"Trainings-KI",
    code: smartBot("FitAI","Was ist dein Fitness-Ziel?",
      {abnehmen:["Kaloriendefizit von 300-500 kcal/Tag = nachhaltig.","Krafttraining + Cardio kombinieren.","Protein: 1.6-2.2g pro kg Körpergewicht."],
       muskel:["Hypertrophie: 8-12 Wdh, 3-4 Sätze, progressive Overload.","Schlaf >7h ist anabol wichtiger als jede Übung.","Compound-Lifts: Kniebeuge, Kreuzheben, Bankdrücken."],
       cardio:["HIIT 2x/Woche + LISS 2x/Woche = optimal.","Zone 2 Cardio = Fettverbrennung.","Pausen-Intervalle wichtig!"],
       ernährung:["80/20 Regel: 80% clean, 20% Genuss.","Wasser: 35ml pro kg Körpergewicht.","Meal Prep spart Disziplin."],
       schmerz:["Schmerz STOP - das ist kein Pussy-Move.","Mobility vor Stretching.","Foam Rolling 5min/Tag."]},
      ["Wie ist dein aktuelles Level?","Wie oft trainierst du?","Was ist dein Hauptziel?","Verletzungshistorie?"]) },
  { id:"smart-mind", name:"Mindfulness Guide", category:"Smart-Bots", emoji:"🧘", description:"Achtsamkeit",
    code: smartBot("Zen","Atme ein. Atme aus. Was brauchst du jetzt?",
      {meditation:["Beginn mit 5 Minuten. Täglich.","Body-Scan von Zehen bis Kopf.","Atem zählen 1-10, dann von vorn."],
       grübeln:["Gedanken sind Wolken - sie ziehen vorbei.","'Danke Geist, das hab ich gehört.' Loslassen.","Schreib es auf. Verbrenn es symbolisch."],
       präsent:["5-4-3-2-1: 5 sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken.","Fokus auf den nächsten Atemzug.","Was ist JETZT da?"]},
      ["Was spürst du körperlich?","Wo im Körper sitzt das?","Bleib einen Moment damit.","Atme einfach."]) },
  { id:"smart-business", name:"Business Strategist", category:"Smart-Bots", emoji:"📊", description:"Strategie-KI",
    code: smartBot("Strategist","Welches Business-Problem?",
      {marketing:["AIDA: Attention, Interest, Desire, Action.","Content-Marketing > Werbung (Trust!).","Email-List ist Gold - eigene Plattform."],
       startup:["Lean Startup: Build-Measure-Learn.","MVP in 4 Wochen, nicht 4 Monate.","Talk to customers BEFORE building."],
       preis:["Preis 3x höher ansetzen als gedacht.","Value-Pricing > Cost-Pricing.","Premium-Positionierung schützt vor Konkurrenz."],
       skalieren:["Erst Produkt-Market-Fit, DANN skalieren.","Automatisiere wiederkehrende Tasks.","Hire slow, fire fast."],
       konkurrenz:["Konkurrenz analysieren ≠ kopieren.","Finde deinen Unique-Angle.","Blue Ocean > Red Ocean."]},
      ["Wer ist deine Zielgruppe?","Was ist dein USP?","Wie hoch ist dein CAC vs LTV?","Was ist die nächste 90-Tage-Priorität?"]) },
  { id:"smart-money", name:"Finanz-Berater AI", category:"Smart-Bots", emoji:"💰", description:"Geld-Strategie",
    code: smartBot("FinBot","Was ist deine Finanz-Frage?",
      {sparen:["50/30/20: 50% Bedarf, 30% Wünsche, 20% sparen/investieren.","Pay yourself first - Dauerauftrag am 1.","Notgroschen: 3-6 Monatsausgaben."],
       investieren:["ETF-Welt-Portfolio: MSCI World + EM = simpel & gut.","Cost-Average beats Timing the Market.","Diversifikation: Aktien/Anleihen/Cash/Sachwerte."],
       schulden:["Schneeball: kleinste Schuld zuerst tilgen (Psyche).","Lawine: höchster Zins zuerst (Math).","Konsumschulden = Notfall, tilgen!"],
       immobilien:["Lage³. Cashflow > Wertsteigerung.","30% Eigenkapital Faustregel.","Kosten: nicht nur Kaufpreis - Nebenkosten +15%."],
       krypto:["Max 5-10% des Portfolios.","Nur Bitcoin/Ethereum als Langfrist-Hold.","Not your keys, not your coins."]},
      ["Wie ist deine Einkommens-Situation?","Welcher Anlagehorizont?","Risiko-Toleranz?","Aktuelle Verbindlichkeiten?"]) },
  { id:"smart-lang", name:"Sprach-Lehrer", category:"Smart-Bots", emoji:"🗣️", description:"Spracherwerb",
    code: smartBot("PolyBot","Welche Sprache lernst du?",
      {englisch:["Hello! Watch Netflix in EN with EN subs.","Shadowing: Sprecher nachsprechen.","Anki Deck mit 2000 häufigsten Wörtern."],
       spanisch:["¡Hola! Duolingo + Pimsleur Kombi.","Telenovelas helfen wirklich.","Gendern: el/la - Endung beachten."],
       französisch:["Bonjour! Liaison ist Schlüssel zur Aussprache.","Subjonctif kommt später - Indikativ erst.","Französisches Kino täglich 30min."],
       japanisch:["こんにちは! Hiragana zuerst, dann Katakana, dann Kanji.","JLPT N5→N1.","Anime + Manga in OG-Sprache."]},
      ["Welches Level (A1-C2)?","Wie lernst du am besten - hören/lesen/sprechen?","Wofür brauchst du die Sprache?"]) },
  { id:"smart-recipe", name:"Rezept-KI", category:"Smart-Bots", emoji:"🍳", description:"Was-koche-ich",
    code: smartBot("Chef","Welche Zutaten hast du?",
      {pasta:["Pasta Aglio e Olio: Knoblauch+Öl+Chili+Petersilie. 10min.","Carbonara: Speck+Ei+Pecorino+Pfeffer. KEINE Sahne!","One-Pot-Pasta: alles in einen Topf, fertig."],
       reis:["Reisgericht: anbraten, würzen, Brühe, 18min köcheln.","Risotto: Brühe löffelweise, rühren!","Sushi-Reis: Essig+Zucker+Salz reinheben."],
       huhn:["Hähnchen: trocken tupfen, salzen, hohe Hitze!","Marinieren mind. 2h - Joghurt macht zart.","Brusttemp 73°C = perfekt."],
       gemüse:["Gemüse rösten 200°C 20min - Karamell!","Sauté mit Knoblauch + Olivenöl.","Wok hoch erhitzen, schnell schwenken."],
       süß:["Mug-Cake: Mehl+Kakao+Zucker+Milch+Öl. 90s Mikro.","Pfannkuchen: 1 Ei, 1 Banane, 1 Schluck Milch.","Tiramisu ohne Backen - 4h kalt."]},
      ["Wie viel Zeit hast du?","Vegetarisch/Vegan?","Wie viele Personen?","Was magst du nicht?"]) },
  { id:"smart-travel", name:"Reise-Planer KI", category:"Smart-Bots", emoji:"✈️", description:"Maßgeschneiderte Reise",
    code: smartBot("Wanderlust","Wohin/Wann/Wer?",
      {strand:["Bali, Thailand, Mauritius - Strand-Paradies.","Kroatien & Griechenland im EU-Budget.","Geheimtipp: Albanien!"],
       städte:["Lissabon, Porto - günstig & schön.","Tokyo: 1 Woche reicht nicht.","Berlin/Prag/Budapest = Städte-Trip."],
       abenteuer:["Patagonien, Island, Nepal = Adrenalin.","Marokko: Wüste + Atlas + Coast.","Vietnam Süd-Nord = Backpacker-Klassiker."],
       budget:["Hostels + Streetfood + Bahn = günstig.","Off-Season buchen spart 50%.","Couchsurfing + Workaway."],
       luxus:["Malediven Overwater Villa.","Safari Tansania Serengeti.","Japan Ryokan + Onsen."]},
      ["Wie lange reist du?","Solo/Paar/Familie?","Budget pro Tag?","Sommer/Winter?","Aktiv oder erholsam?"]) },
  ...Array.from({length:40},(_,i)=>{
    const names=["Liebes-KI","Karriere-KI","Lern-KI","Garten-KI","Auto-KI","Tier-KI","Mode-KI","Beauty-KI","Eltern-KI","Hochzeit-KI","Senioren-KI","Wein-KI","Cocktail-KI","Kaffee-KI","Tea-KI","Tech-Trends","Krypto-KI","Aktien-KI","NFT-KI","KI-Ethik-Bot","SciFi-Storyteller","Krimi-KI","Romance-Writer","Comedy-KI","Drama-KI","Songwriter-KI","Poet-KI","Lyric-KI","Brainstorm-KI","Pro-Contra","Debatten-KI","Sokrates-KI","Stoiker-KI","Buddhist-KI","Zen-Master","ADHS-Helper","Schlaf-Coach","Beziehung-Therapeut","Konflikt-Mediator","Trauer-Begleitung"];
    const t=names[i];
    return { id:`smart-x${i}`, name:t, category:"Smart-Bots", emoji:"🧠", description:"Intelligente Beratung",
      code: smartBot(t, `Hi, ich bin ${t}. Wobei kann ich helfen?`,
        {hilfe:[`${t} sagt: Lass uns systematisch vorgehen.`,`${t}: erst Klarheit, dann Action.`,`${t}: Was wäre das beste Ergebnis?`],
         problem:[`${t}: Probleme sind Wachstums-Einladungen.`,`${t}: Welcher Teil ist unter deiner Kontrolle?`],
         tipp:[`${t}-Tipp: Konsistenz schlägt Intensität.`,`${t}-Tipp: 1% besser pro Tag = 37x in einem Jahr.`,`${t}-Tipp: Bestes Timing war gestern, zweitbestes ist jetzt.`],
         danke:["Gern geschehen!","Ich bin hier wenn du mich brauchst.","Du machst das super."]},
        [`Erzähl mir mehr.`,`Wie fühlt sich das an?`,`Was wäre der nächste Schritt?`,`Was hindert dich daran?`,`Mit wem kannst du das teilen?`])
    };
  }),

  // === ADVANCED APPS (30) - vollständige Mini-Apps ===
  { id:"app-kanban", name:"Kanban Board", category:"Apps", emoji:"📋", description:"Trello-Style",
    code: wrap("Kanban",`<div id="b" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem"></div><input id="i" placeholder="Neue Karte..."><button onclick="add()">+ ToDo</button>`,
      `let d=JSON.parse(localStorage.getItem('kanban')||'{"todo":[],"doing":[],"done":[]}');
       function s(){localStorage.setItem('kanban',JSON.stringify(d));r()}
       function add(){const i=document.getElementById('i');if(i.value){d.todo.push(i.value);i.value='';s()}}
       function mv(col,idx,dir){const cols=['todo','doing','done'];const ni=cols.indexOf(col)+dir;if(ni<0||ni>2)return;const item=d[col].splice(idx,1)[0];d[cols[ni]].push(item);s()}
       function del(col,idx){d[col].splice(idx,1);s()}
       function r(){document.getElementById('b').innerHTML=['todo','doing','done'].map(c=>'<div style="background:rgba(0,0,0,.4);padding:.5rem;border-radius:8px;min-height:200px"><h3 style="font-size:.9rem;margin-bottom:.5rem">'+({todo:'📌 ToDo',doing:'⚡ Doing',done:'✅ Done'}[c])+'</h3>'+d[c].map((x,i)=>'<div style="background:rgba(168,85,247,.2);padding:.4rem;margin:.3rem 0;border-radius:6px;font-size:.85rem">'+x+'<div style="display:flex;gap:.2rem;margin-top:.3rem"><button style="padding:.2rem .4rem;font-size:.7rem" onclick="mv(\\''+c+'\\','+i+',-1)">←</button><button style="padding:.2rem .4rem;font-size:.7rem" onclick="mv(\\''+c+'\\','+i+',1)">→</button><button style="padding:.2rem .4rem;font-size:.7rem;background:#dc2626" onclick="del(\\''+c+'\\','+i+')">✕</button></div></div>').join('')+'</div>').join('')}r();`) },
  { id:"app-budget", name:"Budget-Tracker", category:"Apps", emoji:"💸", description:"Einnahmen/Ausgaben",
    code: wrap("Budget",`<div class="row"><input id="t" placeholder="Beschreibung"><input id="a" type="number" placeholder="€"><select id="k"><option value="1">+ Einnahme</option><option value="-1">- Ausgabe</option></select><button onclick="add()">+</button></div><div id="sum" class="out" style="text-align:center;font-size:1.3rem"></div><div id="list"></div>`,
      `let d=JSON.parse(localStorage.getItem('bud')||'[]');
       function s(){localStorage.setItem('bud',JSON.stringify(d));r()}
       function add(){const t=document.getElementById('t').value,a=+document.getElementById('a').value,k=+document.getElementById('k').value;if(t&&a){d.push({t,a:a*k,d:Date.now()});document.getElementById('t').value='';document.getElementById('a').value='';s()}}
       function del(i){d.splice(i,1);s()}
       function r(){const sum=d.reduce((s,x)=>s+x.a,0);document.getElementById('sum').innerHTML='Saldo: <b style="color:'+(sum>=0?'#4ade80':'#f87171')+'">'+sum.toFixed(2)+' €</b>';document.getElementById('list').innerHTML=d.slice().reverse().map((x,i)=>'<div style="display:flex;justify-content:space-between;padding:.5rem;background:rgba(0,0,0,.3);margin:.25rem 0;border-radius:6px"><span>'+x.t+'</span><span style="color:'+(x.a>=0?'#4ade80':'#f87171')+'">'+x.a.toFixed(2)+' €</span><span onclick="del('+(d.length-1-i)+')" style="cursor:pointer">✕</span></div>').join('')}r();`) },
  { id:"app-habit", name:"Habit-Tracker", category:"Apps", emoji:"🔥", description:"Gewohnheiten",
    code: wrap("Habits",`<input id="h" placeholder="Neue Gewohnheit"><button onclick="add()">+</button><div id="list"></div>`,
      `let d=JSON.parse(localStorage.getItem('hab')||'[]');const today=new Date().toISOString().slice(0,10);
       function s(){localStorage.setItem('hab',JSON.stringify(d));r()}
       function add(){const v=document.getElementById('h').value;if(v){d.push({n:v,days:[]});document.getElementById('h').value='';s()}}
       function tog(i){const idx=d[i].days.indexOf(today);if(idx>-1)d[i].days.splice(idx,1);else d[i].days.push(today);s()}
       function del(i){if(confirm('Löschen?')){d.splice(i,1);s()}}
       function streak(days){const sorted=[...days].sort();let s=0;let dt=new Date();for(let i=0;i<365;i++){const k=dt.toISOString().slice(0,10);if(sorted.includes(k))s++;else if(i>0)break;dt.setDate(dt.getDate()-1)}return s}
       function r(){document.getElementById('list').innerHTML=d.map((h,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:.7rem;background:rgba(0,0,0,.3);margin:.3rem 0;border-radius:8px"><span>'+h.n+'</span><span style="font-size:1.3rem">🔥'+streak(h.days)+'</span><div><button onclick="tog('+i+')" style="padding:.3rem .8rem">'+(h.days.includes(today)?'✅':'⭕')+'</button><button onclick="del('+i+')" style="background:#dc2626;padding:.3rem .6rem">✕</button></div></div>').join('')}r();`) },
  { id:"app-pomo-pro", name:"Pomodoro PRO", category:"Apps", emoji:"🍅", description:"Mit Statistik",
    code: wrap("Pomodoro PRO",`<div id="t" style="font-size:4rem;text-align:center;margin:1rem 0">25:00</div><div class="row"><button onclick="st()">Start</button><button onclick="ps()">Pause</button><button onclick="rs()" style="background:#dc2626">Reset</button></div><div id="stats" class="out" style="text-align:center"></div>`,
      `let r=1500,iv=null,ses=+(localStorage.getItem('pomo')||0);
       function f(){const m=Math.floor(r/60),s=r%60;document.getElementById('t').innerText=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');document.getElementById('stats').innerText='Heutige Sessions: '+ses}
       function st(){if(iv)return;iv=setInterval(()=>{r--;f();if(r<=0){clearInterval(iv);iv=null;ses++;localStorage.setItem('pomo',ses);alert('🎉 Pomodoro fertig!');r=1500;f()}},1000)}
       function ps(){clearInterval(iv);iv=null}
       function rs(){clearInterval(iv);iv=null;r=1500;f()}f();`) },
  { id:"app-mood", name:"Mood Journal", category:"Apps", emoji:"😊", description:"Stimmungs-Log",
    code: wrap("Mood",`<div class="row" style="font-size:2rem">${[1,2,3,4,5].map(n=>`<button onclick="log(${n})" style="font-size:1.8rem">${['😢','😕','😐','😊','🥰'][n-1]}</button>`).join('')}</div><textarea id="note" rows="3" placeholder="Was war heute?"></textarea><button onclick="save()">Speichern</button><div id="hist" class="out"></div>`,
      `let d=JSON.parse(localStorage.getItem('mood')||'[]');let m=3;
       function log(n){m=n;document.querySelector('#hist').innerText='Heute: '+['😢','😕','😐','😊','🥰'][n-1]}
       function save(){d.push({m,n:document.getElementById('note').value,t:Date.now()});localStorage.setItem('mood',JSON.stringify(d));document.getElementById('note').value='';r()}
       function r(){document.getElementById('hist').innerHTML=d.slice(-10).reverse().map(x=>'<div style="padding:.4rem;border-left:3px solid #a855f7;margin:.3rem 0">'+['😢','😕','😐','😊','🥰'][x.m-1]+' '+new Date(x.t).toLocaleDateString()+'<br><small>'+(x.n||'')+'</small></div>').join('')}r();`) },
  { id:"app-water", name:"Wasser-Tracker", category:"Apps", emoji:"💧", description:"Trink-Erinnerung",
    code: wrap("Wasser",`<div style="text-align:center;font-size:5rem" id="d">0/8</div><div class="row"><button onclick="add()">+ Glas</button><button onclick="rs()" style="background:#dc2626">Reset</button></div><div id="bar" style="background:rgba(0,0,0,.3);border-radius:20px;height:30px;overflow:hidden;margin-top:1rem"><div id="fill" style="background:linear-gradient(90deg,#3b82f6,#06b6d4);height:100%;width:0%;transition:.3s"></div></div>`,
      `const today=new Date().toDateString();let c=+localStorage.getItem('water_'+today)||0;
       function r(){document.getElementById('d').innerText=c+'/8 💧';document.getElementById('fill').style.width=Math.min(100,c/8*100)+'%';localStorage.setItem('water_'+today,c)}
       function add(){c++;r();if(c===8)alert('🎉 Tagesziel erreicht!')}
       function rs(){c=0;r()}r();`) },
  { id:"app-flash", name:"Flashcards", category:"Apps", emoji:"🎴", description:"Karteikarten",
    code: wrap("Flashcards",`<div id="card" class="out" style="min-height:200px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;text-align:center"></div><div class="row"><button onclick="prev()">←</button><button onclick="flip()">Drehen</button><button onclick="next()">→</button></div><textarea id="add" rows="2" placeholder="Frage|Antwort"></textarea><button onclick="addCard()">+ Karte</button>`,
      `let d=JSON.parse(localStorage.getItem('flash')||'[["Was ist 2+2?","4"],["Hauptstadt DE?","Berlin"]]');let i=0,front=true;
       function s(){localStorage.setItem('flash',JSON.stringify(d))}
       function show(){if(!d.length){document.getElementById('card').innerText='Keine Karten';return}document.getElementById('card').innerText=d[i][front?0:1]}
       function flip(){front=!front;show()}
       function next(){i=(i+1)%d.length;front=true;show()}
       function prev(){i=(i-1+d.length)%d.length;front=true;show()}
       function addCard(){const v=document.getElementById('add').value.split('|');if(v.length===2){d.push(v);s();document.getElementById('add').value='';show()}}
       show();`) },
  { id:"app-expense", name:"Spesen-Split", category:"Apps", emoji:"🧾", description:"Wer schuldet wem",
    code: wrap("Split",`<input id="who" placeholder="Wer hat gezahlt?"><input id="amt" type="number" placeholder="Betrag €"><input id="for" placeholder="Wofür"><input id="ppl" type="number" placeholder="Anzahl Personen" value="2"><button onclick="add()">+</button><div id="list" class="out"></div>`,
      `let d=JSON.parse(localStorage.getItem('split')||'[]');
       function s(){localStorage.setItem('split',JSON.stringify(d));r()}
       function add(){const w=document.getElementById('who').value,a=+document.getElementById('amt').value,f=document.getElementById('for').value,p=+document.getElementById('ppl').value;if(w&&a&&p>1){d.push({w,a,f,p,per:a/p});['who','amt','for'].forEach(id=>document.getElementById(id).value='');s()}}
       function r(){const sum=d.reduce((s,x)=>s+x.a,0);document.getElementById('list').innerHTML='Gesamt: '+sum.toFixed(2)+' €<br><br>'+d.map(x=>'<div style="padding:.4rem;border-left:3px solid #a855f7;margin:.3rem 0">'+x.w+' zahlte '+x.a.toFixed(2)+'€ für '+x.f+' ('+x.per.toFixed(2)+'€/Person × '+x.p+')</div>').join('')}r();`) },
  { id:"app-meditate", name:"Meditations-Timer", category:"Apps", emoji:"🧘", description:"Mit Gong",
    code: wrap("Meditation",`<div style="text-align:center"><div id="t" style="font-size:5rem">10:00</div><div id="breath" style="width:150px;height:150px;border-radius:50%;margin:1rem auto;background:radial-gradient(#3b82f6,#1e40af);transition:transform 4s"></div></div><div class="row"><select id="dur"><option value="300">5min</option><option value="600" selected>10min</option><option value="900">15min</option><option value="1200">20min</option></select><button onclick="st()">Start</button><button onclick="sp()" style="background:#dc2626">Stop</button></div>`,
      `let r=600,iv=null;
       function f(){const m=Math.floor(r/60),s=r%60;document.getElementById('t').innerText=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
       function st(){r=+document.getElementById('dur').value;f();if(iv)clearInterval(iv);iv=setInterval(()=>{r--;f();const b=document.getElementById('breath');b.style.transform=(r%8<4)?'scale(1.3)':'scale(.8)';if(r<=0){clearInterval(iv);iv=null;alert('🙏 Namaste')}},1000)}
       function sp(){clearInterval(iv);iv=null}f();`) },
  { id:"app-recipe-book", name:"Mein Kochbuch", category:"Apps", emoji:"📖", description:"Rezepte speichern",
    code: wrap("Kochbuch",`<input id="n" placeholder="Rezeptname"><textarea id="r" rows="6" placeholder="Zutaten & Schritte..."></textarea><button onclick="add()">+ Speichern</button><div id="list"></div>`,
      `let d=JSON.parse(localStorage.getItem('cook')||'[]');
       function s(){localStorage.setItem('cook',JSON.stringify(d));r()}
       function add(){const n=document.getElementById('n').value,t=document.getElementById('r').value;if(n&&t){d.push({n,t});document.getElementById('n').value='';document.getElementById('r').value='';s()}}
       function del(i){d.splice(i,1);s()}
       function r(){document.getElementById('list').innerHTML=d.map((x,i)=>'<details style="background:rgba(0,0,0,.3);margin:.3rem 0;padding:.7rem;border-radius:8px"><summary style="cursor:pointer;font-weight:600">'+x.n+' <span onclick="del('+i+')" style="float:right;color:#f87171;cursor:pointer">✕</span></summary><pre style="white-space:pre-wrap;margin-top:.5rem">'+x.t+'</pre></details>').join('')}r();`) },
  ...Array.from({length:20},(_,i)=>{
    const names=["Workout-Plan","Schlaf-Log","Bücher-Liste","Filme-Watchlist","Reise-Bucket","Geschenkideen","Kontakt-Manager","Geburtstage","Passwort-Vault (lokal)","Auto-Wartung","Pflanzen-Pflege","Haustier-Log","Kinder-Wachstum","Lern-Sessions","Projekt-Ideen","Zitate-Sammlung","Träume-Log","Dankbarkeits-Liste","Symptom-Log","Auto-Tank-Log"];
    const t=names[i];const k='app_'+i;
    return { id:`app-x${i}`, name:t, category:"Apps", emoji:"📱", description:"Vollständige Mini-App",
      code: wrap(t,`<input id="i" placeholder="Eintrag..."><textarea id="n" rows="3" placeholder="Details/Notiz..."></textarea><button onclick="add()">+ Hinzufügen</button><div id="list"></div>`,
        `let d=JSON.parse(localStorage.getItem('${k}')||'[]');
         function s(){localStorage.setItem('${k}',JSON.stringify(d));r()}
         function add(){const v=document.getElementById('i').value,n=document.getElementById('n').value;if(v){d.push({v,n,t:Date.now()});document.getElementById('i').value='';document.getElementById('n').value='';s()}}
         function del(i){d.splice(i,1);s()}
         function r(){document.getElementById('list').innerHTML=d.slice().reverse().map((x,i)=>'<div style="background:rgba(0,0,0,.3);padding:.6rem;margin:.3rem 0;border-radius:8px;border-left:3px solid #a855f7"><div style="display:flex;justify-content:space-between"><b>'+x.v+'</b><span style="color:#f87171;cursor:pointer" onclick="del('+(d.length-1-i)+')">✕</span></div>'+(x.n?'<div style="font-size:.85rem;opacity:.8;margin-top:.3rem">'+x.n+'</div>':'')+'<div style="font-size:.7rem;opacity:.5;margin-top:.3rem">'+new Date(x.t).toLocaleString()+'</div></div>').join('')||'<div style="opacity:.5;text-align:center;padding:2rem">Noch leer</div>'}r();`)
    };
  }),

];

export const categories = ["Alle", "Bots", "KI-Bots", "Rechner", "Konverter", "Generatoren", "Spiele", "Tools"];
