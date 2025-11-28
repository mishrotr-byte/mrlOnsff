const tg = window.Telegram.WebApp; tg.ready(); tg.expand();
const auth = document.getElementById('auth');
const main = document.getElementById('main');
const messages = document.getElementById('messages');
const prompt = document.getElementById('prompt');
let mode = null;
let chats = JSON.parse(localStorage.getItem('mrlOnsf_2025') || '[]');
let currentChatId = null;

// Вход
document.querySelectorAll('.auth-btn').forEach(b => b.onclick = () => {
  auth.style.opacity = '0';
  setTimeout(() => { auth.style.display = 'none'; main.style.display = 'grid'; loadLastChat(); }, 400);
});

// Чаты
function createChat() {
  const id = Date.now();
  chats.push({ id, title: 'Новая беседа', messages: [] });
  localStorage.setItem('mrlOnsf_2025', JSON.stringify(chats));
  openChat(id);
}
function openChat(id) {
  currentChatId = id;
  messages.innerHTML = '';
  const chat = chats.find(c => c.id === id);
  chat.messages.forEach(m => addMessage(m.text, m.role));
  renderChatList();
}
function renderChatList() {
  document.getElementById('chat-list').innerHTML = chats.map(c =>
    `<div class="chat-item ${c.id===currentChatId?'active':''}" onclick="openChat(${c.id})">${c.title}</div>`
  ).join('');
}
function loadLastChat() {
  if (chats.length) openChat(chats[chats.length-1].id);
  else createChat();
}
document.getElementById('new-chat').onclick = createChat;

// Сообщения
function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Отправка (вставь сюда свой API — GPT, Grok, Claude и т.д.)
async function send() {
  const text = prompt.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  prompt.value = '';
  addMessage('mrlOnsf думает...', 'bot');

  // ← ТУТ ТВОЯ ГЕНИАЛЬНОСТЬ: подключай любой ИИ
  setTimeout(() => {
    messages.lastChild.remove();
    let reply = `Ты написал: "${text}"<br><br>Я — mrlOnsf. Готов к любым задачам.`;
    if (mode === 'image') reply = `<img src="https://picsum.photos/800/1200?random=${Date.now()}" style="width:100%;border-radius:16px"><br>Генерация Flux + SD3`;
    if (mode === 'video') reply = `Видео по запросу "${text}" уже в пути...`;
    addMessage(reply, 'bot');

    const chat = chats.find(c => c.id === currentChatId);
    chat.messages.push({role:'user', text}, {role:'bot', text: reply});
    if (chat.messages.length === 2) chat.title = text.slice(0,30);
    localStorage.setItem('mrlOnsf_2025', JSON.stringify(chats));
    renderChatList();
  }, 1500);
}
document.getElementById('send-btn').onclick = send;
prompt.addEventListener('keydown', e => e.key === 'Enter' && send());

// Меню
document.getElementById('plus-btn').onclick = () => {
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

// Автозагрузка
if (chats.length) { auth.style.display = 'none'; main.style.display = 'grid'; loadLastChat(); }
renderChatList();
