/**
 * cases.js — Загрузка и отображение кейсов (реализованных проектов)
 * 
 * Данные загружаются из data/cases.json
 * Рендерятся в элементы:
 *   #cases-preview   — на главной странице (3 карточки)
 *   #cases-full      — на странице «Наши работы» (все карточки)
 * 
 * TODO: Подключить реальный API или CMS для управления кейсами.
 * Сейчас используется fetch из локального JSON-файла.
 */

document.addEventListener('DOMContentLoaded', () => {

    const casesPreview = document.getElementById('cases-preview');
    const casesFull = document.getElementById('cases-full');

    // Если ни один контейнер не найден — выходим
    if (!casesPreview && !casesFull) return;

    // Форматирование даты
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Создание HTML-карточки кейса
    function createCaseCard(item) {
        return `
            <article class="case-card">
                <div class="case-card__image">
                    ${item.imagePlaceholder || '🔧'}
                </div>
                <div class="case-card__content">
                    <span class="case-card__tag">${item.tag}</span>
                    <h3 class="case-card__title">${item.title}</h3>
                    <p class="case-card__desc">${item.description}</p>
                    <div class="case-card__meta">
                        <span>📅 ${formatDate(item.date)}</span>
                        <span>⏱ ${item.duration}</span>
                    </div>
                </div>
            </article>
        `;
    }

    // Загрузка данных из JSON
    fetch('data/cases.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(cases => {
            // На главной — первые 3
            if (casesPreview) {
                const previewCases = cases.slice(0, 3);
                casesPreview.innerHTML = previewCases.map(createCaseCard).join('');
            }

            // На странице «Наши работы» — все
            if (casesFull) {
                casesFull.innerHTML = cases.map(createCaseCard).join('');
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки кейсов:', error);

            // Фоллбэк: показать заглушку
            const fallbackHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:2rem; color: var(--color-text-muted);">
                    <p>📂 Данные кейсов временно недоступны.</p>
                    <p>Попробуйте обновить страницу или свяжитесь с нами.</p>
                </div>
            `;
            if (casesPreview) casesPreview.innerHTML = fallbackHTML;
            if (casesFull) casesFull.innerHTML = fallbackHTML;
        });
});