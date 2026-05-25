/**
 * main.js — Основной JS для сайта ООО «Тритон»
 * Функции: мобильное меню, плавный скролл, кнопка «наверх», валидация формы
 */

document.addEventListener('DOMContentLoaded', () => {

    // ====== МОБИЛЬНОЕ МЕНЮ ======
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navClose = document.getElementById('navClose');
    const navLinks = document.querySelectorAll('.nav__link');

    function openNav() {
        if (nav) nav.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        if (nav) nav.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (burger) burger.addEventListener('click', openNav);
    if (navClose) navClose.addEventListener('click', closeNav);

    // Закрытие при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
        if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
            closeNav();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
            closeNav();
        }
    });

    // ====== ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ====== КНОПКА «НАВЕРХ» ======
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.setAttribute('aria-label', 'Наверх');
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function toggleScrollTop() {
        if (window.pageYOffset > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleScrollTop);
    toggleScrollTop();

    // ====== ВАЛИДАЦИЯ ФОРМЫ КОНТАКТОВ ======
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = this.querySelector('#name').value.trim();
            const phone = this.querySelector('#phone').value.trim();
            const message = this.querySelector('#message').value.trim();

            if (!name || !phone || !message) {
                alert('Пожалуйста, заполните все обязательные поля.');
                return;
            }

            // Имитация отправки
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';

            console.log('Форма отправлена:', {
                name,
                company: this.querySelector('#company').value.trim(),
                phone,
                email: this.querySelector('#email').value.trim(),
                message
            });
        });
    }

    // ====== МАСКА ТЕЛЕФОНА ======
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '');
            if (val.length > 0) {
                if (val[0] === '7' || val[0] === '8') {
                    val = val.substring(1);
                }
                let formatted = '+7';
                if (val.length > 0) formatted += ' (' + val.substring(0, 3);
                if (val.length >= 3) formatted += ') ' + val.substring(3, 6);
                if (val.length >= 6) formatted += '-' + val.substring(6, 8);
                if (val.length >= 8) formatted += '-' + val.substring(8, 10);
                this.value = formatted;
            }
        });
    }

    // ====== ХЕДЕР ПРИ СКРОЛЛЕ ======
    const header = document.querySelector('.header');
    if (header) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
            } else {
                header.style.boxShadow = 'var(--shadow-sm)';
            }
            lastScroll = currentScroll;
        });
    }

    console.log('ООО «Тритон» — сайт загружен успешно.');
});