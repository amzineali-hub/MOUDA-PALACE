/**
 * Widget de chat IA Mouda Palace — à coller une seule fois sur moudapalace.com :
 *   <script src="https://mouda-palace.vercel.app/mouda-assistant.js" defer></script>
 * Autonome (CSS injecté, pas de dépendance), appelle /api/site-assistant (Vercel, Gemini) en
 * cross-origin. Conversation gardée en mémoire le temps de la page, jamais persistée.
 */
(function () {
  var API_URL = 'https://mouda-palace.vercel.app/api/site-assistant';
  var TEAL = '#265C6D';
  var GOLD = '#F4C75B';

  var history = [];
  var sending = false;

  var style = document.createElement('style');
  style.textContent =
    '#mp-assist-launcher{position:fixed;bottom:20px;right:20px;z-index:999999;display:flex;' +
    'align-items:center;gap:10px;}' +
    '#mp-assist-label{background:#fff;color:' + TEAL + ';font-family:-apple-system,BlinkMacSystemFont,' +
    'Segoe UI,Arial,sans-serif;font-size:13px;font-weight:600;padding:8px 14px;border-radius:20px;' +
    'box-shadow:0 4px 14px rgba(0,0,0,.18);white-space:nowrap;transition:opacity .15s ease,transform .15s ease;}' +
    '#mp-assist-label.hidden{opacity:0;pointer-events:none;transform:translateX(6px);}' +
    '#mp-assist-bubble{width:60px;height:60px;border-radius:50%;flex-shrink:0;' +
    'background:' + TEAL + ';border:none;cursor:pointer;' +
    'box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;' +
    'transition:transform .15s ease;}' +
    '#mp-assist-bubble:hover{transform:scale(1.06);}' +
    '#mp-assist-bubble-logo{width:30px;height:34px;background:' + GOLD + ';' +
    'mask-image:url(https://mouda-palace.vercel.app/mouda-1-1-1.png);mask-size:contain;' +
    'mask-repeat:no-repeat;mask-position:center;-webkit-mask-image:url(https://mouda-palace.vercel.app/mouda-1-1-1.png);' +
    '-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;}' +
    '#mp-assist-panel{position:fixed;bottom:92px;right:20px;width:min(360px,calc(100vw - 32px));' +
    'height:min(480px,calc(100vh - 140px));background:#fff;border-radius:16px;overflow:hidden;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.3);z-index:999999;display:none;flex-direction:column;' +
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;}' +
    '#mp-assist-panel.open{display:flex;}' +
    '#mp-assist-head{background:' + TEAL + ';color:#fff;padding:14px 16px;display:flex;' +
    'justify-content:space-between;align-items:center;flex-shrink:0;}' +
    '#mp-assist-head strong{font-family:Georgia,serif;font-size:16px;letter-spacing:.02em;}' +
    '#mp-assist-head span{display:block;font-size:11px;color:' + GOLD + ';margin-top:2px;}' +
    '#mp-assist-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;' +
    'line-height:1;padding:4px;}' +
    '#mp-assist-msgs{flex:1;overflow-y:auto;padding:14px;background:#FAF8F5;display:flex;' +
    'flex-direction:column;gap:10px;}' +
    '.mp-msg{max-width:82%;padding:9px 13px;border-radius:14px;font-size:14px;line-height:1.45;' +
    'white-space:pre-wrap;word-wrap:break-word;}' +
    '.mp-msg.user{align-self:flex-end;background:' + TEAL + ';color:#fff;border-bottom-right-radius:4px;}' +
    '.mp-msg.bot{align-self:flex-start;background:#fff;color:#1A1A1A;border:1px solid #eee;' +
    'border-bottom-left-radius:4px;}' +
    '.mp-msg.typing{align-self:flex-start;background:#fff;border:1px solid #eee;color:#999;' +
    'font-style:italic;border-bottom-left-radius:4px;}' +
    '#mp-assist-form{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;flex-shrink:0;' +
    'background:#fff;}' +
    '#mp-assist-input{flex:1;border:1px solid #ddd;border-radius:20px;padding:9px 14px;' +
    'font-size:14px;outline:none;font-family:inherit;}' +
    '#mp-assist-input:focus{border-color:' + GOLD + ';}' +
    '#mp-assist-send{background:' + GOLD + ';color:#1A1A1A;border:none;border-radius:20px;' +
    'padding:0 16px;font-weight:600;cursor:pointer;font-size:14px;}' +
    '#mp-assist-send:disabled{opacity:.5;cursor:default;}' +
    '@media (max-width:420px){#mp-assist-panel{right:16px;bottom:88px;}#mp-assist-launcher{right:16px;}}';
  document.head.appendChild(style);

  var launcher = document.createElement('div');
  launcher.id = 'mp-assist-launcher';

  var label = document.createElement('div');
  label.id = 'mp-assist-label';
  label.textContent = 'Assistant IA';

  var bubble = document.createElement('button');
  bubble.id = 'mp-assist-bubble';
  bubble.setAttribute('aria-label', 'Assistant IA Mouda Palace');
  var bubbleLogo = document.createElement('div');
  bubbleLogo.id = 'mp-assist-bubble-logo';
  bubble.appendChild(bubbleLogo);

  launcher.appendChild(label);
  launcher.appendChild(bubble);

  var panel = document.createElement('div');
  panel.id = 'mp-assist-panel';
  panel.innerHTML =
    '<div id="mp-assist-head"><div><strong>Mouda Palace</strong><span>Posez-nous votre question</span></div>' +
    '<button id="mp-assist-close" aria-label="Fermer">×</button></div>' +
    '<div id="mp-assist-msgs"></div>' +
    '<form id="mp-assist-form"><input id="mp-assist-input" type="text" placeholder="Écrivez votre message…" autocomplete="off" />' +
    '<button id="mp-assist-send" type="submit">Envoyer</button></form>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var msgsEl = panel.querySelector('#mp-assist-msgs');
  var formEl = panel.querySelector('#mp-assist-form');
  var inputEl = panel.querySelector('#mp-assist-input');
  var sendEl = panel.querySelector('#mp-assist-send');
  var closeEl = panel.querySelector('#mp-assist-close');

  // Repère les liens Markdown [texte](url) et les URL nues (http/https uniquement) pour les
  // rendre cliquables, sans jamais passer le texte généré par l'IA à innerHTML : chaque segment
  // est ajouté soit en noeud texte (createTextNode), soit en vraie balise <a> construite à la
  // main (createElement + textContent) — impossible d'y injecter du HTML/script.
  var LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>"')]+)/g;

  function addMessage(role, text) {
    var el = document.createElement('div');
    el.className = 'mp-msg ' + (role === 'user' ? 'user' : 'bot');

    var lastIndex = 0;
    var match;
    LINK_RE.lastIndex = 0;
    while ((match = LINK_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        el.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      var linkText = match[1] || match[3];
      var rawUrl = match[2] || match[3];
      // Ponctuation de fin de phrase accidentellement capturée dans une URL nue (ex: "...menu/.")
      var trailing = '';
      var urlMatch = rawUrl.match(/^(.*[^.,;:!?)])([.,;:!?)]+)$/);
      if (urlMatch) { rawUrl = urlMatch[1]; trailing = urlMatch[2]; if (!match[1]) linkText = rawUrl; }

      var a = document.createElement('a');
      a.href = rawUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.color = role === 'user' ? '#fff' : TEAL;
      a.style.textDecoration = 'underline';
      a.textContent = linkText;
      el.appendChild(a);
      if (trailing) el.appendChild(document.createTextNode(trailing));

      lastIndex = LINK_RE.lastIndex;
    }
    if (lastIndex < text.length) {
      el.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  var opened = false;
  bubble.addEventListener('click', function () {
    panel.classList.toggle('open');
    label.classList.toggle('hidden', panel.classList.contains('open'));
    if (!opened) {
      opened = true;
      addMessage('bot', "Bienvenue au Mouda Palace ! Je suis là pour répondre à vos questions sur le restaurant, les espaces, la carte ou les réservations.");
    }
  });
  closeEl.addEventListener('click', function () {
    panel.classList.remove('open');
    label.classList.remove('hidden');
  });

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text || sending) return;

    addMessage('user', text);
    history.push({ role: 'user', text: text });
    inputEl.value = '';
    sending = true;
    sendEl.disabled = true;

    var typingEl = document.createElement('div');
    typingEl.className = 'mp-msg typing';
    typingEl.textContent = '…';
    msgsEl.appendChild(typingEl);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-10) })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typingEl.remove();
        var reply = (data && data.reply) || "Désolé, je n'ai pas pu répondre — vous pouvez nous joindre au +212 661-357191.";
        addMessage('bot', reply);
        history.push({ role: 'assistant', text: reply });
      })
      .catch(function () {
        typingEl.remove();
        addMessage('bot', "Connexion impossible pour le moment — vous pouvez nous joindre directement au +212 661-357191.");
      })
      .finally(function () {
        sending = false;
        sendEl.disabled = false;
        inputEl.focus();
      });
  });
})();
