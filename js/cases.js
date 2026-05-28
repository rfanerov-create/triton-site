/**
 * cases.js — Полноценная система отображения и фильтрации кейсов
 * Данные хранятся локально в массиве CASES_DATA.
 * Рендерит карточки на главной (3 последних) и на странице работ (все + фильтры).
 * Vanilla JS, без внешних зависимостей.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ===== КОНФИГУРАЦИЯ =====
    const TELEGRAM_LINK = 'https://t.me/+79315388610'; // Замените на ваш Telegram-ник, если нужно
    const MAX_PREVIEW = 3;

    // ===== ДАННЫЕ КЕЙСОВ =====
    const CASES_DATA = [
        {
            id: 1,
            tag: "Ремонт",
            title: "Восстановление цилиндров экскаватора CAT 320",
            description: "Полный ремонт 4 гидроцилиндров рукояти и ковша. Замена штоков, хонингование гильз, установка уплотнений Trelleborg.",
            date: "2025-11-15",
            duration: "5 рабочих дней",
            image: "images/cases/cat-320.jpg"
        },
        {
            id: 2,
            tag: "Изготовление",
            title: "Серия из 12 цилиндров для пресс-линии",
            description: "Изготовление партии из 12 гидроцилиндров двустороннего действия Ø160×1200 мм. Рабочее давление 250 бар, стендовые испытания.",
            date: "2025-09-22",
            duration: "14 рабочих дней",
            image: "images/cases/press-line.jpg"
        },
        {
            id: 3,
            tag: "Реверс-инжиниринг",
            title: "Копирование цилиндра подъёма стрелы Liebherr",
            description: "По образцу повреждённого цилиндра создана полная КД и изготовлен идентичный цилиндр с улучшенными уплотнениями.",
            date: "2025-07-08",
            duration: "21 рабочий день",
            image: "images/cases/liebherr.jpg"
        },
        {
            id: 4,
            tag: "Ремонт",
            title: "Ремонт гидроцилиндров руля судна",
            description: "Восстановление 2 цилиндров рулевого управления морского буксира. Защита от коррозии, замена сальников, окраска по стандартам флота.",
            date: "2025-12-05",
            duration: "7 рабочих дней",
            image: "images/cases/ship-rudder.jpg"
        },
        {
            id: 5,
            tag: "Изготовление",
            title: "Цилиндры навесного оборудования комбайна",
            description: "Производство комплекта из 8 усиленных цилиндров для жатки. Защита от пыли, перепадов температур, давление 180 бар.",
            date: "2025-08-14",
            duration: "10 рабочих дней",
            image: "images/cases/combine.jpg"
        },
        {
            id: 6,
            tag: "Изготовление",
            title: "Телескопические цилиндры автокрана 50т",
            description: "Изготовление 3-секционных телескопических цилиндров выдвижения стрелы. Хонингование, хромирование, испытания под нагрузкой.",
            date: "2026-01-20",
            duration: "18 рабочих дней",
            image: "images/cases/crane-50t.jpg"
        }
    ];

    // ===== SVG ИКОНКИ =====
    const SVG_GEAR = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    const SVG_CALENDAR = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const SVG_CLOCK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

    // ===== УТИЛИТЫ =====
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function createCaseCard(item) {
        const imageStyle = item.image 
            ? `background-image: url('${item.image}'); background-size: cover; background-position: center;` 
            : `background: var(--color-primary); display: flex; align-items: center; justify-content: center;`;
        
        return `
            <article class="case-card" data-tag="${item.tag}">
                <div class="case-card__image" style="${imageStyle}">
                    ${!item.image ? SVG_GEAR : ''}
                </div>
                <div class="case-card__content">
                    <span class="case-card__tag">${item.tag}</span>
                    <h3 class="case-card__title">${item.title}</h3>
                    <p class="case-card__desc">${item.description}</p>
                    <div class="case-card__meta">
                        <span>${SVG_CALENDAR} ${formatDate(item.date)}</span>
                        <span>${SVG_CLOCK} ${item.duration}</span>
                    </div>
                    <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener noreferrer" class="case-card__tg-btn">
                        💬 Обсудить похожий проект в Telegram
                    </a>
                </div>
            </article>
        `;
    }

    // ===== ИНИЦИАЛИЗАЦИЯ СТИЛЕЙ (динамически, чтобы не править style.css) =====
    function injectStyles() {
        if (document.getElementById('cases-dynamic-styles')) return;
        const style = document.createElement('style');
        style.id = 'cases-dynamic-styles';
        style.textContent = `
            .cases-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; justify-content: center; }
            .filter-btn { padding: 8px 16px; border: 1px solid var(--color-border); background: var(--color-white); border-radius: 20px; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
            .filter-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
            .filter-btn.active { background: var(--color-accent); color: var(--color-white); border-color: var(--color-accent); }
            
            .case-card__tg-btn {
                display: inline-block; margin-top: 15px; padding: 10px 18px;
                background: #229ED9; color: #fff; border-radius: var(--radius-md);
                font-size: 0.85rem; font-weight: 500; text-decoration: none;
                transition: background 0.2s, transform 0.2s;
            }
            .case-card__tg-btn:hover { background: #1b7db5; transform: translateY(-2px); }
        `;
        document.head.appendChild(style);
    }

    // ===== ФИЛЬТРЫ =====
    function initFilters(container, cardsWrapper) {
        if (!container || !cardsWrapper) return;
        
        const uniqueTags = ['Все', ...new Set(CASES_DATA.map(c => c.tag))];
        
        container.innerHTML = uniqueTags.map(tag => 
            `<button class="filter-btn ${tag === 'Все' ? 'active' : ''}" data-filter="${tag}">${tag}</button>`
        ).join('');

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const selectedTag = btn.dataset.filter;
            cardsWrapper.querySelectorAll('.case-card').forEach(card => {
                card.style.display = (selectedTag === 'Все' || card.dataset.tag === selectedTag) ? '' : 'none';
            });
        });
    }

    // ===== ЗАПУСК =====
    function init() {
        injectStyles();
        
        const preview = document.getElementById('cases-preview');
        const full = document.getElementById('cases-full');
        const filtersContainer = document.getElementById('cases-filters');

        // Сортировка по дате (новые сверху)
        const sortedCases = [...CASES_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (preview) {
            preview.innerHTML = sortedCases.slice(0, MAX_PREVIEW).map(createCaseCard).join('');
        }

        if (full) {
            full.innerHTML = sortedCases.map(createCaseCard).join('');
            if (filtersContainer) {
                initFilters(filtersContainer, full);
            }
        }
    }

    init();
});