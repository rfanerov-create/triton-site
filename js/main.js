/**
 * js/main.js — основной JavaScript сайта ООО «Тритон»
 *
 * Функции:
 * - мобильное меню;
 * - плавный скролл;
 * - кнопка "наверх";
 * - маска телефона;
 * - отправка формы заявки через /api/contact.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initScrollTopButton();
    initPhoneMask();
    initContactForm();
  });

  /**
   * Мобильное меню
   */
  function initMobileMenu() {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    var navClose = document.getElementById('navClose');
    var navLinks = document.querySelectorAll('.nav__link');

    if (!burger || !nav) return;

    function openNav() {
      nav.classList.add('open');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      nav.classList.remove('open');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.setAttribute('aria-expanded', 'false');

    burger.addEventListener('click', function (event) {
      event.stopPropagation();

      if (nav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navClose) {
      navClose.addEventListener('click', function (event) {
        event.stopPropagation();
        closeNav();
      });
    }

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', closeNav);
    }

    document.addEventListener('click', function (event) {
      if (
        nav.classList.contains('open') &&
        !nav.contains(event.target) &&
        !burger.contains(event.target)
      ) {
        closeNav();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeNav();
      }
    });
  }

  /**
   * Плавный скролл для якорных ссылок
   */
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (event) {
        var href = this.getAttribute('href');

        if (!href || href === '#') return;

        var target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        var headerOffset = 80;
        var elementPosition = target.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Кнопка "наверх"
   */
  function initScrollTopButton() {
    if (document.querySelector('.scroll-top')) return;

    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.type = 'button';
    scrollTopBtn.setAttribute('aria-label', 'Наверх');
    scrollTopBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';

    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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
  }

  /**
   * Маска телефона для поля #phone
   */
  function initPhoneMask() {
    var phoneInput = document.getElementById('phone');

    if (!phoneInput) return;

    phoneInput.addEventListener('input', function () {
      var digits = this.value.replace(/\D/g, '');

      if (digits.length === 0) {
        this.value = '';
        return;
      }

      if (digits[0] === '8') {
        digits = '7' + digits.slice(1);
      }

      if (digits[0] !== '7') {
        digits = '7' + digits;
      }

      digits = digits.slice(0, 11);

      var formatted = '+7';

      if (digits.length > 1) {
        formatted += ' (' + digits.slice(1, 4);
      }

      if (digits.length >= 4) {
        formatted += ') ' + digits.slice(4, 7);
      }

      if (digits.length >= 7) {
        formatted += '-' + digits.slice(7, 9);
      }

      if (digits.length >= 9) {
        formatted += '-' + digits.slice(9, 11);
      }

      this.value = formatted;
    });
  }

  /**
   * Форма контактов
   */
  function initContactForm() {
    var contactForm = document.getElementById('contactForm');
    var formSuccess = document.getElementById('formSuccess');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      var formData = getContactFormData(contactForm);
      var validationError = validateContactForm(formData);

      if (validationError) {
        showFormError(validationError);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Отправка...';
      }

      try {
        var response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(formData)
        });

        var result = await response.json().catch(function () {
          return {};
        });

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Ошибка отправки заявки.');
        }

        contactForm.reset();

        if (formSuccess) {
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';
        } else {
          showFormError('Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        }
      } catch (error) {
        console.error('Ошибка отправки формы:', error);
        showFormError(
          error.message ||
            'Не удалось отправить заявку. Позвоните нам по телефону +7 931 538-86-10.'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  function getContactFormData(form) {
    return {
      name: getFieldValue(form, '#name'),
      company: getFieldValue(form, '#company'),
      phone: getFieldValue(form, '#phone'),
      email: getFieldValue(form, '#email'),
      message: getFieldValue(form, '#message'),
      page: window.location.pathname,
      createdAt: new Date().toISOString()
    };
  }

  function getFieldValue(form, selector) {
    var field = form.querySelector(selector);
    return field ? field.value.trim() : '';
  }

  function validateContactForm(data) {
    if (!data.name) {
      return 'Пожалуйста, укажите ваше имя.';
    }

    if (!data.phone) {
      return 'Пожалуйста, укажите телефон.';
    }

    if (data.phone.replace(/\D/g, '').length < 10) {
      return 'Пожалуйста, введите корректный номер телефона.';
    }

    if (data.email && !isValidEmail(data.email)) {
      return 'Пожалуйста, введите корректный email или оставьте поле пустым.';
    }

    if (!data.message) {
      return 'Пожалуйста, опишите задачу.';
    }

    return '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFormError(message) {
    alert(message);
  }
})();