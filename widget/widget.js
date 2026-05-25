/**
 * widget.js — AI-виджет чат-бота для сайта ООО «Тритон»
 * 
 * TODO: Интеграция с Claude API (Anthropic)
 * 
 * Архитектура:
 *   1. Всплывающая кнопка в правом нижнем углу экрана
 *   2. При клике открывается окно чата
 *   3. Сообщения пользователя отправляются на серверный прокси
 *   4. Прокси вызывает Claude API (через бэкенд, чтобы не светить API-ключ)
 *   5. Ответ отображается в чате
 * 
 * Требования к бэкенду:
 *   POST /api/claude/chat
 *   Body: { messages: [{ role: "user", content: "..." }] }
 *   Response: { content: "..." }
 * 
 * Системный промпт для Claude:
 *   "Вы — технический консультант компании ООО «Тритон». 
 *    Помогаете клиентам с вопросами по ремонту и изготовлению 
 *    гидравлических цилиндров. Отвечайте профессионально, 
 *    кратко и по делу. Если вопрос требует расчёта или 
 *    уточнения — предложите оставить заявку на сайте."
 */

document.addEventListener('DOMContentLoaded', () => {

    console.log('AI-виджет: инициализация (пока отключён)');

    // Раскомментируйте и настройте после подключения бэкенда:
    /*
    const WIDGET_API_URL = '/api/claude/chat';
    const SYSTEM_PROMPT = 'Вы — технический консультант компании ООО «Тритон»...';

    const widgetBtn = document.createElement('button');
    widgetBtn.className = 'ai-widget-btn';
    widgetBtn.innerHTML = '💬';
    widgetBtn.style.cssText = 'position:fixed;bottom:80px;right:20px;width:56px;height:56px;border-radius:50%;background:#FF6B2B;color:#fff;border:none;font-size:1.5rem;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:998;';

    document.body.appendChild(widgetBtn);

    widgetBtn.addEventListener('click', () => {
        // TODO: Открыть окно чата
        console.log('Чат открыт');
    });
    */
});