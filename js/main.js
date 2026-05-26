/**
 * main.js — Основной JS для сайта ООО «Тритон»
 * Функции: мобильное меню, плавный скролл, кнопка «наверх», валидация формы, отправка через Formspree
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

    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (e) => {
        if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
            closeNav();
        }
    });

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
    scrollTopBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
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

    // ====== ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ КОНТАКТОВ ======
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    // Простая валидация телефона: минимум 10 цифр
    function validatePhone(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = this.querySelector('#name')?.value.trim();
            const company = this.querySelector('#company')?.value.trim();
            const phone = this.querySelector('#phone')?.value.trim();
            const email = this.querySelector('#email')?.value.trim();
            const message = this.querySelector('#message')?.value.trim();

            // Валидация обязательных полей
            if (!name || !phone || !message) {
                alert('Пожалуйста, заполните все обязательные поля.');
                return;
            }

            // Валидация телефона
            if (!validatePhone(phone)) {
                alert('Пожалуйста, введите корректный номер телефона (минимум 10 цифр).');
                return;
            }

            // Блокируем кнопку, чтобы избежать повторных отправок
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';

            // 🔧 ЗАМЕНИ 'YOUR_FORM_ID' НА РЕАЛЬНЫЙ ID ПОСЛЕ РЕГИСТРАЦИИ НА FORMSPREE.IO
            const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        company,
                        phone,
                        email,
                        message,
                        _subject: `Новая заявка с сайта: ${name}`
                    })
                });

                if (response.ok) {
                    // Успех: скрываем форму, показываем сообщение
                    contactForm.style.display = 'none';
                    if (formSuccess) formSuccess.style.display = 'block';
                    contactForm.reset();
                } else {
                    throw new Error('Formspree response not ok');
                }
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                alert('Ошибка отправки. Позвоните нам по телефону.');
            } finally {
                // Разблокируем кнопку в любом случае
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
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
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
            } else {
                header.style.boxShadow = 'var(--shadow-sm)';
            }
        });
    }

    console.log('ООО «Тритон» — сайт загружен успешно.');
});