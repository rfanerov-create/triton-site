/**
 * cases.js — Загрузка и отображение кейсов
 * Приоритет: 1) localStorage (из admin.html), 2) /data/cases.json
 * Рендерит в: #cases-preview (3 шт), #cases-full (все), #cases-filters (кнопки)
 */
(function () {
    'use strict';

    // ===== SVG ИКОНКИ =====
    var svgGear = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    var svgCalendar = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    var svgClock = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

    // ===== УТИЛИТЫ =====
    function formatDate(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getTag(item) {
        // Поддержка обоих полей: tag (из JSON) и category (из admin.html)
        return item.tag || item.category || 'Кейс';
    }

    function getImageHtml(item) {
        if (item.image) {
            return '<div class="case-card__image" style="background-image:url(\'' + escapeHtml(item.image) + '\');background-size:cover;background-position:center"></div>';
        }
        return '<div class="case-card__image" style="background:var(--color-primary);display:flex;align-items:center;justify-content:center">' + svgGear + '</div>';
    }

    // ===== СОЗДАНИЕ КАРТОЧКИ =====
    function createCaseCard(item) {
        var tag = getTag(item);
        var imageHtml = getImageHtml(item);
        var caseId = item.id || '';

        return '<article class="case-card" data-tag="' + escapeHtml(tag) + '" data-id="' + caseId + '" style="cursor:pointer">' +
            imageHtml +
            '<div class="case-card__content">' +
            '<span class="case-card__tag">' + escapeHtml(tag) + '</span>' +
            '<h3 class="case-card__title">' + escapeHtml(item.title) + '</h3>' +
            '<p class="case-card__desc">' + escapeHtml(item.description) + '</p>' +
            '<div class="case-card__meta">' +
            '<span>' + svgCalendar + ' ' + formatDate(item.date) + '</span>' +
            '<span>' + svgClock + ' ' + (item.duration || '') + '</span>' +
            '</div></div></article>';
    }

    // ===== РЕНДЕР КЕЙСОВ =====
    function renderCases(cases, target, limit) {
        if (!target || !cases || cases.length === 0) return;

        limit = limit || 0;
        var data = limit > 0 ? cases.slice(0, limit) : cases;
        target.innerHTML = data.map(createCaseCard).join('');

        // Делаем карточки кликабельными (переход на case.html?id=N)
        var cards = target.querySelectorAll('.case-card');
        for (var i = 0; i < cards.length; i++) {
            (function (card) {
                card.addEventListener('click', function (e) {
                    if (e.target.closest('a')) return;
                    var id = card.getAttribute('data-id');
                    if (id) window.location.href = 'case.html?id=' + id;
                });
            })(cards[i]);
        }
    }

    // ===== ФИЛЬТРЫ =====
    function initFilters(cases, container, wrapper) {
        if (!container || !wrapper || !cases) return;

        // Собираем уникальные теги
        var seen = {};
        var tags = ['Все'];
        for (var i = 0; i < cases.length; i++) {
            var t = getTag(cases[i]);
            if (!seen[t]) { seen[t] = true; tags.push(t); }
        }

        // Динамические стили для кнопок
        var style = document.createElement('style');
        style.textContent = '.cases-filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;justify-content:center}.filter-btn{padding:8px 16px;border:1px solid var(--color-border);background:var(--color-white);border-radius:20px;cursor:pointer;font-size:0.875rem;font-weight:500;transition:all 0.2s}.filter-btn:hover{border-color:var(--color-accent);color:var(--color-accent)}.filter-btn.active{background:var(--color-accent);color:var(--color-white);border-color:var(--color-accent)}';
        document.head.appendChild(style);

        // Рендер кнопок
        var buttonsHtml = '';
        for (var j = 0; j < tags.length; j++) {
            var tag = tags[j];
            buttonsHtml += '<button class="filter-btn' + (tag === 'Все' ? ' active' : '') + '" data-filter="' + escapeHtml(tag) + '">' + escapeHtml(tag) + '</button>';
        }
        container.innerHTML = buttonsHtml;

        // Обработчик кликов по фильтрам
        container.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-btn');
            if (!btn) return;

            var allBtns = container.querySelectorAll('.filter-btn');
            for (var k = 0; k < allBtns.length; k++) allBtns[k].classList.remove('active');
            btn.classList.add('active');

            var filter = btn.getAttribute('data-filter');
            var cards = wrapper.querySelectorAll('.case-card');
            for (var m = 0; m < cards.length; m++) {
                var cardTag = cards[m].getAttribute('data-tag');
                cards[m].style.display = (filter === 'Все' || cardTag === filter) ? '' : 'none';
            }
        });
    }

    // ===== ЗАГРУЗКА ДАННЫХ =====
    function loadCases() {
        var casesPreview = document.getElementById('cases-preview');
        var casesFull = document.getElementById('cases-full');
        var filtersContainer = document.getElementById('cases-filters');

        if (!casesPreview && !casesFull) return;

        // 1. Пробуем взять кейсы из localStorage (из admin.html)
        var stored = localStorage.getItem('tritonCases');
        if (stored) {
            try {
                var localCases = JSON.parse(stored);
                if (Array.isArray(localCases) && localCases.length > 0) {
                    // Сортируем: новые сверху
                    localCases.sort(function (a, b) {
                        return new Date(b.date || 0) - new Date(a.date || 0);
                    });
                    renderCases(localCases, casesPreview, 3);
                    renderCases(localCases, casesFull);
                    if (filtersContainer && casesFull) initFilters(localCases, filtersContainer, casesFull);
                    return;
                }
            } catch (e) {
                console.warn('cases.js: ошибка парсинга localStorage', e);
            }
        }

        // 2. Если localStorage пуст — загружаем из JSON-файла
        fetch('/data/cases.json')
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (cases) {
                if (!Array.isArray(cases)) throw new Error('Invalid data format');
                cases.sort(function (a, b) {
                    return new Date(b.date || 0) - new Date(a.date || 0);
                });
                renderCases(cases, casesPreview, 3);
                renderCases(cases, casesFull);
                if (filtersContainer && casesFull) initFilters(cases, filtersContainer, casesFull);
            })
            .catch(function (err) {
                console.error('cases.js: ошибка загрузки кейсов', err);
                var msg = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--color-text-muted)"><p>Данные кейсов недоступны</p><p>Обновите страницу или свяжитесь с нами</p></div>';
                if (casesPreview) casesPreview.innerHTML = msg;
                if (casesFull) casesFull.innerHTML = msg;
            });
    }

    // ===== ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadCases);
    } else {
        loadCases();
    }
})();