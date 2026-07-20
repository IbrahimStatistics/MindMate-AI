// MindMate — chat.js
// Renders the chat UI and talks directly to the n8n Chat Trigger webhook.

// TODO: replace with your n8n Chat Trigger production webhook URL
const WEBHOOK_URL = 'https://respective-ext-evident-geology.trycloudflare.com/webhook/5377f6ae-00ef-4eb5-b2f2-154ff33ff646/chat';

document.addEventListener('DOMContentLoaded', () => {
  const messagesEl = document.getElementById('messages');
  let introEl = document.getElementById('intro');
  const inputEl = document.getElementById('msg-input');
  const sendBtn = document.getElementById('send-btn');
  const errorNote = document.getElementById('error-note');

  const sessionId = 'mindmate-' + Math.random().toString(36).slice(2) + '-' + Date.now();
  let sending = false;

  if (!WEBHOOK_URL || WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') {
    const note = document.createElement('p');
    note.className = 'setup-note';
    note.textContent = "Chat isn't wired up yet — set WEBHOOK_URL at the top of js/chat.js to your n8n Chat Trigger's production webhook URL.";
    messagesEl.appendChild(note);
  }

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
  }
  inputEl.addEventListener('input', autoResize);

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(text, who) {
    if (introEl) { introEl.remove(); introEl = null; }
    const row = document.createElement('div');
    row.className = 'row ' + who;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function addTyping() {
    const row = document.createElement('div');
    row.className = 'row bot';
    row.id = 'typing-row';
    row.innerHTML = '<div class="bubble typing-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typing-row');
    if (el) el.remove();
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || sending) return;

    errorNote.style.display = 'none';
    addBubble(text, 'user');
    inputEl.value = '';
    autoResize();
    sending = true;
    sendBtn.disabled = true;
    addTyping();

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: sessionId,
          chatInput: text,
        }),
      });

      if (!res.ok) throw new Error('Request failed with status ' + res.status);

      const data = await res.json();
      const reply = data.output ?? data.text ?? data.message ?? (typeof data === 'string' ? data : null);

      removeTyping();
      addBubble(reply || "I didn't get a readable reply from the workflow — check the response format in n8n.", 'bot');
    } catch (err) {
      removeTyping();
      errorNote.textContent = 'Message failed to send. Check that the webhook URL is correct, the workflow is active, and CORS allows this domain.';
      errorNote.style.display = 'block';
    } finally {
      sending = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});