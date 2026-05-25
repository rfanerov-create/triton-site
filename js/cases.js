/**
 * cases.js — Загрузка и отображение кейсов (реализованных проектов)
 * Данные загружаются из /data/cases.json
 * Рендерятся в элементы:
 *   #cases-preview   — на главной странице (3 карточки)
 *   #cases-full      — на странице «Наши работы» (все карточки)
 *   #cases-filters   — контейнер для кнопок фильтрации (если есть в DOM)
 */

document.addEventListener('DOMContentLoaded', () => {
    const casesPreview = document.getElementById('cases-preview');
    const casesFull = document.getElementById('cases-full');
    const filtersContainer = document.getElementById('cases-filters');

    if (!casesPreview && !casesFull) return;

    // SVG Icons
    const svgGear = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

    const svgCalendar = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

    const svgClock = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function createCaseCard(item) {
        return `
            <article class="case-card" data-tag="${item.tag}" data-category="${item.category}">
                <div class="case-card__image" style="background: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                    ${svgGear}
                </div>
                <div class="case-card__content">
                    <span class="case-card__tag">${item.tag}</span>
                    <h3 class="case-card__title">${item.title}</h3>
                    <p class="case-card__desc">${item.description}</p>
                    <div class="case-card__meta">
                        <span>${svgCalendar} ${formatDate(item.date)}</span>
                        <span>${svgClock} ${item.duration}</span>
                    </div>
                </div>
            </article>
        `;
    }

    function renderCases(cases, target, limit = 0) {
        if (!target) return;
        const dataToRender = limit > 0 ? cases.slice(0, limit) : cases;
        target.innerHTML = dataToRender.map(createCaseCard).join('');
    }

    function initFilters(cases, container, cardsWrapper) {
        if (!container || !cardsWrapper) return;
        
        const uniqueTags = ['Все', ...new Set(cases.map(c => c.tag))];
        
        // Вставляем базовые стили для кнопок фильтра (чтобы сразу выглядело аккуратно)
        const style = document.createElement('style');
        style.textContent = `
            .cases-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; justify-content: center; }
            .filter-btn { padding: 8px 16px; border: 1px solid var(--color-border); background: var(--color-white); border-radius: 20px; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
            .filter-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
            .filter-btn.active { background: var(--color-accent); color: var(--color-white); border-color: var(--color-accent); }
        `;
        document.head.appendChild(style);

        container.innerHTML = uniqueTags.map(tag => 
            `<button class="filter-btn ${tag === 'Все' ? 'active' : ''}" data-filter="${tag}">${tag}</button>`
        ).join('');

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const selectedTag = btn.dataset.filter;
            const cards = cardsWrapper.querySelectorAll('.case-card');
            
            cards.forEach(card => {
                if (selectedTag === 'Все' || card.dataset.tag === selectedTag) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Абсолютный путь к JSON (работает на любых подстраницах)
    fetch('/data/cases.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(cases => {
            // Главная: первые 3
            renderCases(cases, casesPreview, 3);
            // Страница работ: все
            renderCases(cases, casesFull);
            
            // Фильтры (только если контейнер есть в DOM)
            if (filtersContainer && casesFull) {
                initFilters(cases, filtersContainer, casesFull);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки кейсов:', error);
            const fallback = `<div style="grid-column: 1/-1; text-align:center; padding:2rem; color: var(--color-text-muted);">
                <p>📂 Данные кейсов временно недоступны.</p>
                <p>Попробуйте обновить страницу или свяжитесь с нами.</p>
            </div>`;
            if (casesPreview) casesPreview.innerHTML = fallback;
            if (casesFull) casesFull.innerHTML = fallback;
        });
});