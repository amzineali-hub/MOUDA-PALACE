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
    '#mp-assist-bubble{width:88px;height:88px;border-radius:50%;flex-shrink:0;' +
    'background:' + TEAL + ';border:none;cursor:pointer;' +
    'box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;' +
    'transition:transform .15s ease;}' +
    '#mp-assist-bubble:hover{transform:scale(1.06);}' +
    '#mp-assist-bubble-logo{width:68px;height:auto;display:block;' +
    'filter:brightness(0) invert(1);}' +
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
    '@media (max-width:420px){#mp-assist-panel{right:16px;bottom:88px;}#mp-assist-launcher{right:16px;}}' +
    '#mp-wa-bubble{position:fixed;bottom:20px;left:20px;width:64px;height:64px;border-radius:50%;' +
    'background:#25D366;display:flex;align-items:center;justify-content:center;z-index:999999;' +
    'box-shadow:0 4px 16px rgba(0,0,0,.25);transition:transform .15s ease;}' +
    '#mp-wa-bubble:hover{transform:scale(1.06);}' +
    '#mp-wa-bubble svg{width:34px;height:34px;}' +
    '@media (max-width:420px){#mp-wa-bubble{left:16px;width:56px;height:56px;}#mp-wa-bubble svg{width:30px;height:30px;}}' +
    '#mp-music-toggle{position:fixed;top:20px;left:20px;width:48px;height:48px;border-radius:50%;' +
    'background:' + TEAL + ';border:none;cursor:pointer;z-index:999999;display:flex;align-items:center;' +
    'justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.22);transition:transform .15s ease;}' +
    '#mp-music-toggle:hover{transform:scale(1.08);}' +
    '#mp-music-toggle{font-size:20px;line-height:1;}' +
    '@media (max-width:420px){#mp-music-toggle{top:16px;left:16px;width:42px;height:42px;font-size:17px;}}';
  document.head.appendChild(style);

  var launcher = document.createElement('div');
  launcher.id = 'mp-assist-launcher';

  var label = document.createElement('div');
  label.id = 'mp-assist-label';
  label.textContent = 'Assistant IA';

  var bubble = document.createElement('button');
  bubble.id = 'mp-assist-bubble';
  bubble.setAttribute('aria-label', 'Assistant IA Mouda Palace');
  var bubbleLogo = document.createElement('img');
  bubbleLogo.id = 'mp-assist-bubble-logo';
  bubbleLogo.src = 'https://mouda-palace.vercel.app/mouda-1-1-1.png';
  bubbleLogo.alt = '';
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

  var waBubble = document.createElement('a');
  waBubble.id = 'mp-wa-bubble';
  waBubble.href = 'https://wa.me/212661357191';
  waBubble.target = '_blank';
  waBubble.rel = 'noopener noreferrer';
  waBubble.setAttribute('aria-label', 'Contacter Mouda Palace sur WhatsApp');
  waBubble.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.486 2 2.01 6.476 2.01 11.994c0 2.114.654 4.075 1.769 5.689L2 22l4.432-1.74a9.96 9.96 0 0 0 5.572 1.724h.005c5.517 0 9.993-4.476 9.993-9.994C21.997 6.476 17.521 2 12.004 2zm0 18.18h-.004a8.18 8.18 0 0 1-4.168-1.14l-.299-.177-3.097 1.213.84-3.1-.195-.318a8.164 8.164 0 0 1-1.254-4.364c0-4.512 3.672-8.18 8.182-8.18 2.187 0 4.242.852 5.788 2.4a8.13 8.13 0 0 1 2.396 5.787c0 4.512-3.672 8.18-8.19 8.18z"/></svg>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);
  document.body.appendChild(waBubble);

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

  // Musique de fond — reprise entre pages (navigation classique, rechargement complet à chaque
  // lien) via sessionStorage : position + état lu/pause sauvegardés en continu, puis restaurés au
  // chargement suivant. Les navigateurs bloquent le son automatique avant toute interaction ; si la
  // première tentative échoue, on retente au premier clic/touche/touche-clavier de la page, une
  // seule fois — ensuite, Chrome/Firefox autorisent la suite sans redemander pour le reste de la
  // visite. Jamais de boucle : le morceau s'arrête naturellement à la fin (demande du gérant).
  var MUSIC_URL = 'https://moudapalace.com/wp-content/uploads/2026/10/chanson-mouda-palace.mp3';
  var TIME_KEY = 'mp-music-time';
  var PLAYING_KEY = 'mp-music-playing';

  var audio = document.createElement('audio');
  audio.id = 'mp-music-audio';
  audio.src = MUSIC_URL;
  audio.preload = 'auto';
  document.body.appendChild(audio);

  var musicBtn = document.createElement('button');
  musicBtn.id = 'mp-music-toggle';
  musicBtn.setAttribute('aria-label', 'Activer/couper la musique');
  var ICON_NOTE = '🎵';
  var ICON_MUTED = '🔇';
  musicBtn.textContent = ICON_NOTE;
  document.body.appendChild(musicBtn);

  function savePosition() {
    try { sessionStorage.setItem(TIME_KEY, String(audio.currentTime)); } catch (e) {}
  }

  var resumeTime = 0;
  try { resumeTime = parseFloat(sessionStorage.getItem(TIME_KEY) || '0') || 0; } catch (e) {}
  audio.addEventListener('loadedmetadata', function () {
    if (resumeTime > 0 && resumeTime < audio.duration) audio.currentTime = resumeTime;
  });

  var wantsPlaying = true;
  try { wantsPlaying = sessionStorage.getItem(PLAYING_KEY) !== 'false'; } catch (e) {}

  function markPlaying(isPlaying) {
    musicBtn.innerHTML = isPlaying ? ICON_NOTE : ICON_MUTED;
    try { sessionStorage.setItem(PLAYING_KEY, isPlaying ? 'true' : 'false'); } catch (e) {}
  }

  function attemptPlay() {
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () { markPlaying(true); }).catch(function () {
        markPlaying(false);
        var onFirstGesture = function () {
          document.removeEventListener('click', onFirstGesture);
          document.removeEventListener('touchstart', onFirstGesture);
          document.removeEventListener('keydown', onFirstGesture);
          if (wantsPlaying) audio.play().then(function () { markPlaying(true); }).catch(function () {});
        };
        document.addEventListener('click', onFirstGesture);
        document.addEventListener('touchstart', onFirstGesture);
        document.addEventListener('keydown', onFirstGesture);
      });
    }
  }

  if (wantsPlaying) {
    attemptPlay();
  } else {
    markPlaying(false);
  }

  musicBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().then(function () { markPlaying(true); }).catch(function () {});
    } else {
      audio.pause();
      markPlaying(false);
    }
  });

  var lastSaved = 0;
  audio.addEventListener('timeupdate', function () {
    var now = Date.now();
    if (now - lastSaved > 2000) { lastSaved = now; savePosition(); }
  });
  window.addEventListener('beforeunload', function () {
    savePosition();
    try { sessionStorage.setItem(PLAYING_KEY, audio.paused ? 'false' : 'true'); } catch (e) {}
  });
  audio.addEventListener('ended', function () {
    try { sessionStorage.removeItem(TIME_KEY); sessionStorage.removeItem(PLAYING_KEY); } catch (e) {}
    markPlaying(false);
  });
})();
