/**
 * widget.js — AI-консультант ООО «Тритон»
 */
(function () {
  'use strict';

  if (window.__TRITON_WIDGET_LOADED__) return;
  window.__TRITON_WIDGET_LOADED__ = true;

  var CONFIG = {
    apiEndpoint: '/api/deepseek',
    containerId: 'ai-widget-container',
    storageKey: 'tritonAiSystemPrompt'
  };

  var state = {
    isOpen: false,
    isTyping: false,
    messages: [],
    prompt: ''
  };

  var elements = {};

  function init() {
    var container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    loadSystemPrompt();
    injectStyles();
    renderWidget(container);
    bindEvents();
  }

  function loadSystemPrompt() {
    try {
      var stored = localStorage.getItem(CONFIG.storageKey);
      state.prompt = stored && stored.trim().length > 10 ? stored.trim() : '';
    } catch (e) {
      state.prompt = '';
    }
  }

  function injectStyles() {
    if (document.getElementById('triton-widget-styles')) return;

    var style = document.createElement('style');
    style.id = 'triton-widget-styles';
    style.textContent =
      '#triton-widget{position:fixed;right:20px;bottom:20px;z-index:1100;font-family:Segoe UI,system-ui,sans-serif}' +
      '.widget-toggle{width:56px;height:56px;border-radius:50%;border:0;background:#FF6B2B;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(0,0,0,.22);transition:.2s}' +
      '.widget-toggle:hover{background:#e55a1b;transform:scale(1.05)}' +
      '.widget-toggle svg{width:25px;height:25px}' +
      '.widget-chat{position:absolute;right:0;bottom:72px;width:380px;height:520px;max-height:calc(100vh - 120px);background:#fff;border:1px solid #e0e6ed;border-radius:16px;box-shadow:0 14px 48px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden}' +
      '.widget-chat.open{display:flex}' +
      '.widget-header{padding:16px 18px;background:linear-gradient(135deg,#0A2540,#0f3460);color:#fff;display:flex;align-items:center;justify-content:space-between}' +
      '.widget-header__title{margin:0;font-size:1.05rem;font-weight:700}' +
      '.widget-header__close{border:0;background:transparent;color:#fff;font-size:1.6rem;cursor:pointer;line-height:1;opacity:.85}' +
      '.widget-header__close:hover{opacity:1}' +
      '.widget-messages{flex:1;padding:16px;background:#f5f7fa;overflow-y:auto;display:flex;flex-direction:column;gap:12px}' +
      '.msg-bot,.msg-user{max-width:86%;padding:11px 14px;font-size:.95rem;line-height:1.45;white-space:pre-wrap}' +
      '.msg-bot{align-self:flex-start;background:#fff;color:#1a1a2e;border:1px solid #e0e6ed;border-radius:12px 12px 12px 4px}' +
      '.msg-user{align-self:flex-end;background:#0A2540;color:#fff;border-radius:12px 12px 4px 12px}' +
      '.msg-bot__text{margin:0}' +
      '.msg-typing{align-self:flex-start;background:#fff;border:1px solid #e0e6ed;border-radius:12px;padding:11px 14px;color:#4a4a68;font-size:.9rem}' +
      '.msg-typing:after{content:"";animation:tritonTyping 1.2s infinite}' +
      '@keyframes tritonTyping{0%{content:"Печатает"}33%{content:"Печатает."}66%{content:"Печатает.."}100%{content:"Печатает..."}}' +
      '.msg-input-wrapper{padding:12px;border-top:1px solid #e0e6ed;display:flex;gap:8px;background:#fff}' +
      '.msg-input{flex:1;border:1px solid #e0e6ed;border-radius:8px;padding:10px 12px;font:inherit;outline:0}' +
      '.msg-input:focus{border-color:#FF6B2B}' +
      '.msg-send{border:0;border-radius:8px;background:#FF6B2B;color:#fff;font-weight:600;padding:10px 14px;cursor:pointer}' +
      '.msg-send:hover{background:#e55a1b}' +
      '.msg-send:disabled,.msg-input:disabled{opacity:.6;cursor:not-allowed}' +
      '.widget-direct-link{color:#FF6B2B;font-weight:600;text-decoration:none}' +
      '.msg-animate{animation:tritonSlide .18s ease}' +
      '@keyframes tritonSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}' +
      '@media(max-width:480px){#triton-widget{right:14px;bottom:14px}.widget-chat{width:calc(100vw - 28px);height:calc(100vh - 110px);right:0}.widget-toggle{width:52px;height:52px}.msg-input-wrapper{padding:10px}.msg-send{padding:10px 12px}}';

    document.head.appendChild(style);
  }

  function renderWidget(container) {
    container.innerHTML =
      '<div id="triton-widget">' +
        '<button class="widget-toggle" id="widgetToggle" type="button" aria-label="Открыть AI-консультанта">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '</button>' +
        '<div class="widget-chat" id="widgetChat" role="dialog" aria-label="AI-консультант Тритон">' +
          '<div class="widget-header">' +
            '<h3 class="widget-header__title">AI-консультант Тритон</h3>' +
            '<button class="widget-header__close" id="widgetClose" type="button" aria-label="Закрыть">&times;</button>' +
          '</div>' +
          '<div class="widget-messages" id="widgetMessages"></div>' +
          '<div class="msg-input-wrapper">' +
            '<input type="text" class="msg-input" id="msgInput" placeholder="Ваш вопрос..." autocomplete="off">' +
            '<button class="msg-send" id="msgSend" type="button">Отправить</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    elements = {
      toggle: document.getElementById('widgetToggle'),
      close: document.getElementById('widgetClose'),
      chat: document.getElementById('widgetChat'),
      messages: document.getElementById('widgetMessages'),
      input: document.getElementById('msgInput'),
      send: document.getElementById('msgSend')
    };

    addBotMessage('Здравствуйте! Я консультант ООО «Тритон». Помогу с ремонтом, изготовлением или диагностикой гидроцилиндра. Опишите задачу или укажите тип техники.');
  }

  function bindEvents() {
    elements.toggle.addEventListener('click', toggleChat);
    elements.close.addEventListener('click', closeChat);
    elements.send.addEventListener('click', sendMessage);

    elements.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });

    document.addEventListener('click', function (e) {
      if (state.isOpen && !e.target.closest('#triton-widget')) closeChat();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.isOpen) closeChat();
    });
  }

  function toggleChat() {
    state.isOpen = !state.isOpen;
    elements.chat.classList.toggle('open', state.isOpen);
    elements.toggle.setAttribute('aria-expanded', state.isOpen ? 'true' : 'false');

    if (state.isOpen) {
      setTimeout(function () {
        elements.input.focus();
      }, 50);
    }
  }

  function closeChat() {
    state.isOpen = false;
    elements.chat.classList.remove('open');
    elements.toggle.setAttribute('aria-expanded', 'false');
  }

  function sendMessage() {
    var text = elements.input.value.trim();

    if (!text || state.isTyping) return;

    addUserMessage(text);
    elements.input.value = '';
    setFormDisabled(true);
    showTyping();

    sendToBackend(text)
      .then(function (reply) {
        hideTyping();
        addBotMessage(reply || 'Не удалось получить ответ. Позвоните нам: +7 931 538-86-10.');
      })
      .catch(function (err) {
        hideTyping();
        console.error('widget.js:', err);
        addBotMessage(
          'Сейчас не удалось связаться с AI-консультантом.\n\n' +
          'Вы можете написать напрямую в Telegram или позвонить: +7 931 538-86-10.\n\n' +
          '<a class="widget-direct-link" href="https://t.me/triton_hydraulics" target="_blank" rel="noopener">Открыть Telegram</a>',
          true
        );
      })
      .finally(function () {
        setFormDisabled(false);
        elements.input.focus();
      });
  }

  function sendToBackend(userMessage) {
    state.messages.push({
      role: 'user',
      content: userMessage
    });

    state.messages = state.messages.slice(-12);

    return fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        messages: state.messages,
        systemPrompt: state.prompt
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            throw new Error(data.error || 'Ошибка API');
          }
          return data;
        });
      })
      .then(function (data) {
        var reply = data.reply || '';
        state.messages.push({
          role: 'assistant',
          content: reply
        });
        state.messages = state.messages.slice(-12);
        return reply;
      });
  }

  function addBotMessage(text, allowHtml) {
    var msg = document.createElement('div');
    msg.className = 'msg-bot msg-animate';

    if (allowHtml) {
      msg.innerHTML = '<p class="msg-bot__text">' + text + '</p>';
    } else {
      msg.innerHTML = '<p class="msg-bot__text">' + escapeHtml(text) + '</p>';
    }

    elements.messages.appendChild(msg);
    scrollToBottom();
  }

  function addUserMessage(text) {
    var msg = document.createElement('div');
    msg.className = 'msg-user msg-animate';
    msg.textContent = text;
    elements.messages.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    state.isTyping = true;

    var indicator = document.createElement('div');
    indicator.className = 'msg-typing msg-animate';
    indicator.id = 'typingIndicator';
    elements.messages.appendChild(indicator);

    scrollToBottom();
  }

  function hideTyping() {
    state.isTyping = false;

    var indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  function setFormDisabled(disabled) {
    elements.input.disabled = disabled;
    elements.send.disabled = disabled;
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  }

  function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  window.TritonWidget = window.TritonWidget || {};

  window.TritonWidget.updatePrompt = function (newPrompt) {
    if (!newPrompt || newPrompt.trim().length <= 10) return false;

    try {
      localStorage.setItem(CONFIG.storageKey, newPrompt.trim());
      state.prompt = newPrompt.trim();
      return true;
    } catch (e) {
      console.error('widget.js: ошибка сохранения промпта', e);
      return false;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();