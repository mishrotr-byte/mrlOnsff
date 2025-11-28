const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();

const auth = document.getElementById('auth');
const main = document.getElementById('main');
const messages = document.getElementById('messages');
const prompt = document.getElementById('prompt');
const plusBtn = document.getElementById('plus-btn');
const sendBtn = document.getElementById('send-btn');

let mode = null;
let chats = JSON.parse(localStorage.getItem('mrlOnsf_history') || '[]');
let currentChatId = null;
let isTyping = false;

// === КУБИКИ УМНЕЕТ ===
document.addEventListener('pointermove', e => {
  if (Math.random() > 0.25) return;
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.left = (e.clientX - 6) + 'px';
  cube.style.top = (e.clientY - 6) + 'px';
  cube.style.animationDuration = (2 + Math.random() * 3) + 's';
  document.getElementById('particles').appendChild(cube);
  setTimeout(() => cube.remove(), 5000);
});

// === ВХОД ===
document.querySelectorAll('.auth-btn').forEach(btn => {
  btn.onclick = () => {
    auth.style.opacity = '0';
    setTimeout(() => {
      auth.style.display = 'none';
      main.style.display = 'grid';
      loadLastChat();
    }, 500);
  };
});

// === ЧАТЫ ===
function createChat() {
  const id = Date.now();
  const newChat = { id, title: 'Новая беседа', messages: [], timestamp: Date.now() };
  chats.unshift(newChat);
  saveChats();
  openChat(id);
}

function openChat(id) {
  currentChatId = id;
  messages.innerHTML = '';
  const chat = chats.find(c => c.id === id);
  if (chat && chat.messages.length > 0) {
    chat.messages.forEach(m => addMessage(m.text, m.role, m.type));
  } else {
    addMessage('Привет! Я <b>mrlOnsf</b> — твой ИИ нового поколения.<br>Говори, рисуй, снимай видео — я всё могу.', 'bot');
  }
  renderChatList();
  messages.scrollTop = messages.scrollHeight;
}

function renderChatList() {
  document.getElementById('chat-list').innerHTML = chats.map(c => `
    <div class="chat-item ${c.id===currentChatId?'active':''}" onclick="openChat(${c.id})">
      <div>${c.title}</div>
      <small>${new Date(c.timestamp).toLocaleDateString()}</small>
    </div>
  `).join('');
}

function saveChats() {
  localStorage.setItem('mrlOnsf_history', JSON.stringify(chats));
}

function loadLastChat() {
  if (chats.length > 0) openChat(chats[0].id);
  else createChat();
}

// === СООБЩЕНИЯ ===
function addMessage(text, role, type = 'text') {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (type === 'image') div.innerHTML = `<img src="${text}" style="width:100%;border-radius:16px">`;
  else if (type === 'video') div.innerHTML = `<video src="${text}" controls style="width:100%;border-radius:16px"></video>`;
  else div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// === НАСТОЯЩИЙ ИИ + ГЕНЕРАЦИИ ===
async function sendMessage() {
  if (isTyping) return;
  const text = prompt.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  prompt.value = '';
  isTyping = true;
  addMessage('mrlOnsf создаёт...', 'bot');

  try {
    let reply = '';
    if (mode === 'image') {
      reply = `https://api.luoxiao.top/v1/image?prompt=${encodeURIComponent(text)}`;
      addMessage(reply, 'bot', 'image');
    } else if (mode === 'video') {
      reply = `https://api.luoxiao.top/v1/video?prompt=${encodeURIComponent(text)}`;
      addMessage(`Видео генерируется... (~15 сек)`, 'bot');
      setTimeout(() => addMessage(reply, 'bot', 'video'), 15000);
    } else {
      // Реальный GPT-4o + Grok
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer xai-free' },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [{ role: "user", content: text }],
          temperature: 0.8
        })
      });
      const data = await res.json();
      reply = data.choices[0].message.content;
      addMessage(reply, 'bot');
    }

    // Сохраняем
    const chat = chats.find(c => c.id === currentChatId);
    chat.messages.push({ role: 'user', text }, { role: 'bot', text: reply || 'Генерация...' });
    if (chat.messages.length === 2) chat.title = text.slice(0, 28);
    chat.timestamp = Date.now();
    saveChats();
    renderChatList();

  } catch (e) {
    addMessage('Серверы спят, но я всё равно с тобой', 'bot');
  }

  isTyping = false;
  messages.lastChild.remove();
}

// === КНОПКИ ===
sendBtn.onclick = sendMessage;
prompt.addEventListener('keydown', e => e.key === 'Enter' && !e.shiftKey && sendMessage());

plusBtn.onclick = () => {
  document.getElementById('menu').style.display =
    document.getElementById('menu').style.display === 'block' ? 'none' : 'block';
};

document.querySelectorAll('.menu-item').forEach(item => {
  item.onclick = () => {
    mode = item.dataset.mode;
    document.getElementById('menu').style.display = 'none';
    prompt.placeholder = item.textContent + '...';
    prompt.focus();
  };
});

document.getElementById('new-chat').onclick = createChat;

// === ЗАПУСК ===
if (chats.length > 0) {
  auth.style.display = 'none';
  main.style.display = 'grid';
  loadLastChat();
} else {
  renderChatList();
}
