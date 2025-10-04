import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, ShoppingCart, Calendar, MessageSquare, Gamepad2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  code: string;
  language: string;
}

const templates: Template[] = [
  {
    id: "todo-app",
    name: "Todo App",
    description: "Einfache Aufgabenverwaltung",
    icon: Calendar,
    language: "html",
    code: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
</head>
<body>
  <div id="app">
    <h1>Meine Aufgaben</h1>
    <input type="text" id="taskInput" placeholder="Neue Aufgabe...">
    <button onclick="addTask()">Hinzufügen</button>
    <ul id="taskList"></ul>
  </div>
  <script>
    let tasks = [];
    function addTask() {
      const input = document.getElementById('taskInput');
      if (input.value.trim()) {
        tasks.push({ text: input.value, done: false });
        input.value = '';
        renderTasks();
      }
    }
    function renderTasks() {
      const list = document.getElementById('taskList');
      list.innerHTML = tasks.map((task, i) => 
        \`<li onclick="toggleTask(\${i})" style="text-decoration: \${task.done ? 'line-through' : 'none'}">
          \${task.text}
        </li>\`
      ).join('');
    }
    function toggleTask(index) {
      tasks[index].done = !tasks[index].done;
      renderTasks();
    }
  </script>
</body>
</html>`
  },
  {
    id: "chat-app",
    name: "Chat App",
    description: "Messenger-Interface",
    icon: MessageSquare,
    language: "html",
    code: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat App</title>
</head>
<body>
  <div id="app">
    <div id="chatBox"></div>
    <div id="inputArea">
      <input type="text" id="messageInput" placeholder="Nachricht eingeben...">
      <button onclick="sendMessage()">Senden</button>
    </div>
  </div>
  <script>
    let messages = [];
    function sendMessage() {
      const input = document.getElementById('messageInput');
      if (input.value.trim()) {
        messages.push({
          text: input.value,
          sender: 'Ich',
          time: new Date().toLocaleTimeString()
        });
        input.value = '';
        renderMessages();
      }
    }
    function renderMessages() {
      const box = document.getElementById('chatBox');
      box.innerHTML = messages.map(msg => 
        \`<div class="message">
          <strong>\${msg.sender}</strong> <span>\${msg.time}</span>
          <p>\${msg.text}</p>
        </div>\`
      ).join('');
      box.scrollTop = box.scrollHeight;
    }
  </script>
</body>
</html>`
  },
  {
    id: "shop-app",
    name: "Shop App",
    description: "E-Commerce Interface",
    icon: ShoppingCart,
    language: "html",
    code: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop App</title>
</head>
<body>
  <div id="app">
    <h1>Mein Shop</h1>
    <div id="products"></div>
    <div id="cart">
      <h2>Warenkorb</h2>
      <div id="cartItems"></div>
      <p>Gesamt: <span id="total">0</span>€</p>
    </div>
  </div>
  <script>
    const products = [
      { id: 1, name: 'Produkt A', price: 19.99 },
      { id: 2, name: 'Produkt B', price: 29.99 },
      { id: 3, name: 'Produkt C', price: 39.99 }
    ];
    let cart = [];
    
    function renderProducts() {
      document.getElementById('products').innerHTML = products.map(p => 
        \`<div>
          <h3>\${p.name}</h3>
          <p>\${p.price}€</p>
          <button onclick="addToCart(\${p.id})">In den Warenkorb</button>
        </div>\`
      ).join('');
    }
    
    function addToCart(id) {
      const product = products.find(p => p.id === id);
      cart.push(product);
      updateCart();
    }
    
    function updateCart() {
      document.getElementById('cartItems').innerHTML = cart.map(item => 
        \`<p>\${item.name} - \${item.price}€</p>\`
      ).join('');
      document.getElementById('total').textContent = 
        cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    }
    
    renderProducts();
  </script>
</body>
</html>`
  },
  {
    id: "game-app",
    name: "Mini Game",
    description: "Einfaches Browser-Spiel",
    icon: Gamepad2,
    language: "html",
    code: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Game</title>
</head>
<body>
  <div id="app">
    <h1>Klick-Spiel</h1>
    <p>Score: <span id="score">0</span></p>
    <p>Zeit: <span id="timer">30</span>s</p>
    <button id="target" onclick="hit()">Klick mich!</button>
  </div>
  <script>
    let score = 0;
    let timeLeft = 30;
    
    function hit() {
      score++;
      document.getElementById('score').textContent = score;
      moveTarget();
    }
    
    function moveTarget() {
      const btn = document.getElementById('target');
      const maxX = window.innerWidth - 150;
      const maxY = window.innerHeight - 150;
      btn.style.position = 'absolute';
      btn.style.left = Math.random() * maxX + 'px';
      btn.style.top = Math.random() * maxY + 'px';
    }
    
    const countdown = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(countdown);
        alert(\`Spiel vorbei! Dein Score: \${score}\`);
      }
    }, 1000);
    
    moveTarget();
  </script>
</body>
</html>`
  }
];

interface TemplateSelectorProps {
  onSelectTemplate: (code: string, language: string) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const handleSelect = (template: Template) => {
    onSelectTemplate(template.code, template.language);
    toast.success(`Vorlage "${template.name}" geladen`);
  };

  return (
    <div className="backdrop-blur-xl bg-card/20 border border-primary/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">App-Vorlagen</h3>
          <p className="text-sm text-muted-foreground">
            Starte mit einer vorgefertigten Vorlage
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="backdrop-blur-xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer p-4 group"
              onClick={() => handleSelect(template)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};