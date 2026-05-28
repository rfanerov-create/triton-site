
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  background-color: white; /* Ensure the iframe has a white background */
                }

                
              </style>
                        </head>
                        <body>
                            

              <script>
                              /**
 * widget.js — AI-консультант ООО «Тритон» (Frontend MVP v2)
 * Динамический сценарий консультации инженера.
 * Чистый Vanilla JS, без backend, без фреймворков.
 */
(function () {
    'use strict';

    // ===== КОНФИГУРАЦИЯ =====
    const CONFIG = {
        telegramUser: 'triton_manager',
        containerId: 'ai-widget-container',
        colors: {
            primary: '#0A2540',
            primaryLight: '#0f3460',
            accent: '#FF6B2B',
            accentHover: '#e55a1b',
            text: '#1a1a2e',
            textLight: '#4a4a68',
            bg: '#ffffff',
            bgLight: '#f5f7fa',
            border: '#e0e6ed',
            white: '#ffffff'
        }
    };

    // ===== СОСТОЯНИЕ =====
    let state = {
        isOpen: false,
        stepIndex: 0,
        isFirst: true,
        answers: {},
        stepQueue: [],
        isComplete: false
    };

    let elements = {};

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    function init() {
        const container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.warn('AI Widget: контейнер #' + CONFIG.containerId + ' не найден');
            return;
        }

        injectStyles();
        renderWidget(container);
        bindEvents();
    }

    // ===== ВНЕДРЕНИЕ СТИЛЕЙ =====
    function injectStyles() {
        if (document.getElementById('triton-widget-styles')) return;

        const style = document.createElement('style');
        style.id = 'triton-widget-styles';
        style.textContent = `
            #triton-widget { position: fixed; bottom: 20px; right: 20px; z-index: 1100; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.5; }
            .widget-toggle { width: 56px; height: 56px; border-radius: 50%; background: ${CONFIG.colors.accent}; color: ${CONFIG.colors.white}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform 0.2s, background 0.2s; padding: 0; }
            .widget-toggle:hover { background: ${CONFIG.colors.accentHover}; transform: scale(1.05); }
            .widget-toggle svg { width: 24px; height: 24px; }
            .widget-chat { position: absolute; bottom: 70px; right: 0; width: 380px; max-height: 520px; background: ${CONFIG.colors.white}; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; border: 1px solid ${CONFIG.colors.border}; }
            .widget-chat.open { display: flex; }
            .widget-header { padding: 16px 20px; background: linear-gradient(135deg, ${CONFIG.colors.primary}, ${CONFIG.colors.primaryLight}); color: ${CONFIG.colors.white}; }
            .widget-header__title { font-size: 1.1rem; font-weight: 700; margin: 0 0 4px 0; }
            .widget-header__subtitle { font-size: 0.85rem; opacity: 0.9; margin: 0; }
            .widget-messages { flex: 1; padding: 16px 20px; overflow-y: auto; background: ${CONFIG.colors.bgLight}; display: flex; flex-direction: column; gap: 12px; }
            .msg-bot { align-self: flex-start; background: ${CONFIG.colors.white}; border: 1px solid ${CONFIG.colors.border}; border-radius: 12px 12px 12px 4px; padding: 12px 16px; max-width: 85%; color: ${CONFIG.colors.text}; }
            .msg-bot__text { margin: 0 0 8px 0; font-size: 0.95rem; }
            .msg-bot__options { display: flex; flex-wrap: wrap; gap: 8px; }
            .opt-btn { padding: 8px 14px; background: ${CONFIG.colors.white}; border: 1px solid ${CONFIG.colors.border}; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; color: ${CONFIG.colors.text}; }
            .opt-btn:hover { border-color: ${CONFIG.colors.accent}; color: ${CONFIG.colors.accent}; background: ${CONFIG.colors.bgLight}; }
            .msg-bot__input { width: 100%; padding: 10px 14px; border: 1px solid ${CONFIG.colors.border}; border-radius: 8px; font-size: 0.95rem; font-family: inherit; outline: none; transition: border-color 0.2s; }
            .msg-bot__input:focus { border-color: ${CONFIG.colors.accent}; }
            .msg-user { align-self: flex-end; background: ${CONFIG.colors.primary}; color: ${CONFIG.colors.white}; border-radius: 12px 12px 4px 12px; padding: 12px 16px; max-width: 85%; font-size: 0.95rem; }
            .msg-final { text-align: center; padding: 8px 0; }
            .msg-final__text { margin: 0 0 16px 0; color: ${CONFIG.colors.text}; font-size: 0.95rem; }
            .tg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: #229ED9; color: white; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: background 0.2s; }
            .tg-btn:hover { background: #1b7db5; }
            .tg-btn svg { width: 18px; height: 18px; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .msg-animate { animation: slideUp 0.2s ease; }
            @media (max-width: 480px) { .widget-chat { width: calc(100vw - 40px); max-height: calc(100vh - 140px); bottom: 70px; right: 0; } .widget-toggle { width: 52px; height: 52px; } }
        `;
        document.head.appendChild(style);
    }

    // ===== РЕНДЕР ВИДЖЕТА =====
    function renderWidget(container) {
        container.innerHTML = `
            <div id="triton-widget">
                <button class="widget-toggle" id="widgetToggle" aria-label="Открыть чат">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </button>
                <div class="widget-chat" id="widgetChat">
                    <div class="widget-header">
                        <h3 class="widget-header__title">Инженер-консультант Тритон</h3>
                        <p class="widget-header__subtitle">Помогу собрать первичную заявку по гидроцилиндру</p>
                    </div>
                    <div class="widget-messages" id="widgetMessages"></div>
                </div>
            </div>
        `;

        elements = {
            toggle: document.getElementById('widgetToggle'),
            chat: document.getElementById('widgetChat'),
            messages: document.getElementById('widgetMessages')
        };
    }

    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    function bindEvents() {
        elements.toggle.addEventListener('click', toggleChat);
        document.addEventListener('click', (e) => {
            if (state.isOpen && !e.target.closest('#triton-widget')) closeChat();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) closeChat();
        });
    }

    function toggleChat() {
        state.isOpen = !state.isOpen;
        elements.chat.classList.toggle('open', state.isOpen);
        if (state.isOpen && state.isFirst && !state.isComplete) {
            startConversation();
        }
    }

    function closeChat() {
        state.isOpen = false;
        elements.chat.classList.remove('open');
    }

    // ===== ЛОГИКА ДИАЛОГА =====
    function startConversation() {
        state.stepIndex = 0;
        state.answers = {};
        state.stepQueue = [];
        state.isFirst = true;
        state.isComplete = false;
        elements.messages.innerHTML = '';
        
        // Первый шаг: тип задачи
        addBotMessage('Здравствуйте. Чтобы быстро сориентировать вас по гидроцилиндру, уточните тип задачи:', ['Ремонт гидроцилиндра', 'Изготовление нового', 'Диагностика', 'Срочный вопрос']);
    }

    function buildNextSteps(type) {
        state.stepQueue = [];
        // Ветвление после выбора типа
        if (type === 'Ремонт гидроцилиндра') {
            state.stepQueue.push({ id: 'problem', text: 'Понял. Что именно беспокоит в работе цилиндра?', options: ['Течь масла', 'Повреждён шток', 'Не держит давление', 'Люфт / износ', 'Другое'] });
        } else if (type === 'Изготовление нового') {
            state.stepQueue.push({ id: 'docs', text: 'Есть ли у вас чертёж, старый образец или базовые размеры для расчёта?', options: ['Есть чертёж', 'Есть старый цилиндр', 'Есть размеры', 'Пока нет данных'] });
        }

        // Общие шаги консультации
        state.stepQueue.push({ id: 'equipment', text: 'Для какой техники или оборудования этот цилиндр будет работать?', placeholder: 'Например: экскаватор, пресс, погрузчик, сельхозтехника, станок, спецтехника...' });
        state.stepQueue.push({ id: 'location', text: 'Где физически находится цилиндр или оборудование сейчас?', placeholder: 'Город или регион' });
        state.stepQueue.push({ id: 'urgency', text: 'Какие сроки для вас приоритетны?', options: ['Сегодня / завтра', 'В течение недели', 'Планово', 'Пока консультируюсь'] });
        state.stepQueue.push({ id: 'photo', text: 'Для точной оценки инженеру пригодятся фото цилиндра или шильдика. Сможете приложить?', options: ['Фото есть, отправлю в Telegram', 'Фото нет', 'Нужно уточнить у механика'] });
        state.stepQueue.push({ id: 'contact', text: 'Оставьте телефон или Telegram, чтобы менеджер мог отправить предварительный расчёт или согласовать детали.', placeholder: 'Телефон или ник в Telegram' });
    }

    function askNextStep() {
        if (state.stepIndex >= state.stepQueue.length) {
            showFinalMessage();
            return;
        }
        const step = state.stepQueue[state.stepIndex];
        addBotMessage(step.text, step.options, step.placeholder);
    }

    function onUserAnswer(answer) {
        if (state.isFirst) {
            state.answers.type = answer;
            state.isFirst = false;
            addUserMessage(answer);
            buildNextSteps(answer);
            setTimeout(askNextStep, 400);
            return;
        }

        const step = state.stepQueue[state.stepIndex];
        state.answers[step.id] = answer;
        addUserMessage(answer);
        state.stepIndex++;
        setTimeout(askNextStep, 400);
    }

    function addBotMessage(text, options, placeholder) {
        const msg = document.createElement('div');
        msg.className = 'msg-bot msg-animate';
        
        let inputHtml = '';
        if (options && options.length) {
            inputHtml = `<div class="msg-bot__options">
                ${options.map(opt => `<button class="opt-btn" data-answer="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join('')}
            </div>`;
        } else if (placeholder) {
            inputHtml = `<input type="text" class="msg-bot__input" placeholder="${escapeHtml(placeholder)}" autofocus>`;
        }

        msg.innerHTML = `<p class="msg-bot__text">${escapeHtml(text)}</p>${inputHtml}`;
        elements.messages.appendChild(msg);
        scrollToBottom();

        msg.querySelectorAll('.opt-btn').forEach(btn => {
            btn.addEventListener('click', () => onUserAnswer(btn.dataset.answer));
        });

        const input = msg.querySelector('.msg-bot__input');
        if (input) {
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    onUserAnswer(input.value.trim());
                }
            });
        }
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'msg-user msg-animate';
        msg.textContent = text;
        elements.messages.appendChild(msg);
        scrollToBottom();
    }

    function showFinalMessage() {
        state.isComplete = true;
        const msg = document.createElement('div');
        msg.className = 'msg-final msg-animate';
        msg.innerHTML = `
            <p class="msg-final__text">
                Спасибо, я собрал первичную информацию. По гидроцилиндрам точную оценку дают после осмотра, дефектовки или анализа фото/чертежа. 
                Нажмите кнопку ниже — заявка откроется в Telegram, и менеджер сможет продолжить диалог.
            </p>
            <a href="#" class="tg-btn" id="tgSendBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                Передать заявку в Telegram
            </a>
        `;
        elements.messages.appendChild(msg);
        scrollToBottom();

        document.getElementById('tgSendBtn').addEventListener('click', (e) => {
            e.preventDefault();
            sendToTelegram();
        });
    }

    // ===== ОТПРАВКА В TELEGRAM =====
    function sendToTelegram() {
        const now = new Date().toLocaleString('ru-RU');
        const pageUrl = window.location.href;

        // Структурируем данные для менеджера
        const taskOrProblem = state.answers.problem || state.answers.docs || 'Уточняется';
        
        const lines = [
            '📋 Заявка с сайта ООО «Тритон»',
            '',
            `🔹 Тип обращения: ${state.answers.type}`,
            `🔹 Проблема / задача: ${taskOrProblem}`,
            `🔹 Техника / оборудование: ${state.answers.equipment || '-'}`,
            `🔹 Город / регион: ${state.answers.location || '-'}`,
            `🔹 Срочность: ${state.answers.urgency || '-'}`,
            `🔹 Фото / чертёж: ${state.answers.photo || '-'}`,
            `🔹 Контакт: ${state.answers.contact || '-'}`,
            '',
            `🌐 Страница сайта: ${pageUrl}`,
            `🕐 Дата: ${now}`
        ];

        const text = lines.join('\n');
        const url = `https://t.me/${CONFIG.telegramUser}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    // ===== УТИЛИТЫ =====
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function scrollToBottom() {
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }

    // ===== ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


              </script>
                        </body>
                        </html>
                    