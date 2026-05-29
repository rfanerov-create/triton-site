/**
 * server.js — Backend для сайта ООО «Тритон»
 *
 * Функции:
 * - раздача статического сайта;
 * - прокси к DeepSeek API;
 * - приём заявок с формы контактов;
 * - сохранение заявок в private/leads.json;
 * - опциональная отправка заявок в Telegram, если заданы переменные .env.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

const PORT = process.env.PORT || 3000;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const PRIVATE_DIR = path.join(__dirname, 'private');
const LEADS_FILE = path.join(PRIVATE_DIR, 'leads.json');

const DEFAULT_SYSTEM_PROMPT = `
Вы — инженер-консультант компании ООО «Тритон».

Компания занимается ремонтом, изготовлением, диагностикой и обслуживанием гидравлических цилиндров для промышленности, спецтехники, строительной, сельскохозяйственной и производственной техники.

Стиль общения:
- профессионально;
- спокойно;
- вежливо;
- кратко, но по делу;
- без давления на клиента.

Ваша задача:
1. Понять, что требуется клиенту: ремонт, изготовление, диагностика, восстановление, обслуживание или консультация.
2. Уточнить важные технические данные:
   - тип техники или оборудования;
   - где установлен цилиндр;
   - диаметр штока;
   - диаметр гильзы;
   - ход штока;
   - рабочее давление;
   - характер неисправности;
   - есть ли фото, чертёж или образец;
   - где территориально находится цилиндр.
3. Если данных мало — задавайте 1–3 уточняющих вопроса, не перегружайте клиента.
4. Не называйте точную цену без дефектовки, фото, чертежа или осмотра.
5. Если вопрос требует расчёта — предложите оставить телефон или email для связи с инженером.
6. Если клиент готов — мягко предложите оставить заявку.

Запрещено:
- выдумывать цены;
- обещать невозможные сроки;
- давать технические гарантии без осмотра;
- говорить, что вы человек;
- спорить с клиентом.

Если клиент спрашивает стоимость, отвечайте так:
"Точную стоимость можно сказать после дефектовки или хотя бы по фото/чертежу. Пришлите, пожалуйста, фото цилиндра и укажите тип техники — инженер сможет предварительно сориентировать по ремонту или изготовлению."

Отвечайте только на русском языке.
`.trim();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/**
 * Защита служебных файлов и папок от прямого открытия через браузер.
 * Важно, потому что сайт раздаётся из корня проекта.
 */
app.use((req, res, next) => {
  const blockedPaths = [
    '/.env',
    '/private',
    '/node_modules',
    '/package-lock.json'
  ];

  if (blockedPaths.some((blockedPath) => req.path.startsWith(blockedPath))) {
    return res.status(403).send('Forbidden');
  }

  next();
});

/**
 * Простая проверка статуса сервера.
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'triton-site',
    time: new Date().toISOString()
  });
});

/**
 * API: DeepSeek Proxy
 */
app.post('/api/deepseek', async (req, res) => {
  try {
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.startsWith('sk-xxx')) {
      return res.status(500).json({
        error: 'API-ключ DeepSeek не настроен.'
      });
    }

    const { messages, systemPrompt } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Пустое сообщение.'
      });
    }

    const safeMessages = messages
      .filter((message) => message && typeof message.content === 'string')
      .slice(-12)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content.trim().slice(0, 3000)
      }))
      .filter((message) => message.content.length > 0);

    if (safeMessages.length === 0) {
      return res.status(400).json({
        error: 'Нет корректных сообщений.'
      });
    }

    const finalSystemPrompt =
      typeof systemPrompt === 'string' && systemPrompt.trim().length > 10
        ? systemPrompt.trim().slice(0, 6000)
        : DEFAULT_SYSTEM_PROMPT;

    const deepseekMessages = [
      {
        role: 'system',
        content: finalSystemPrompt
      },
      ...safeMessages
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: deepseekMessages,
        temperature: 0.3,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('DeepSeek API error:', response.status, errorText);

      return res.status(502).json({
        error: 'Ошибка ответа от AI-сервиса.'
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({
        error: 'Пустой ответ от AI.'
      });
    }

    res.json({
      success: true,
      reply
    });
  } catch (err) {
    console.error('server.js /api/deepseek error:', err);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера.'
    });
  }
});

/**
 * API: Contact Form
 */
app.post('/api/contact', async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const company = normalizeText(req.body.company);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email);
    const message = normalizeText(req.body.message);
    const page = normalizeText(req.body.page);

    if (!name || !phone || !message) {
      return res.status(400).json({
        error: 'Заполните обязательные поля: имя, телефон и описание задачи.'
      });
    }

    const phoneDigits = phone.replace(/\D/g, '');

    if (phoneDigits.length < 10) {
      return res.status(400).json({
        error: 'Введите корректный номер телефона.'
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        error: 'Введите корректный email или оставьте поле пустым.'
      });
    }

    const lead = {
      id: Date.now(),
      name,
      company: company || '',
      phone,
      email: email || '',
      message,
      page: page || '',
      createdAt: new Date().toISOString(),
      userAgent: req.get('user-agent') || '',
      ip: getClientIp(req)
    };

    await saveLead(lead);
    await sendLeadToTelegram(lead);

    console.log('[TRITON LEAD]', lead);

    res.json({
      success: true,
      message: 'Заявка успешно отправлена.'
    });
  } catch (err) {
    console.error('server.js /api/contact error:', err);
    res.status(500).json({
      error: 'Ошибка обработки заявки. Попробуйте позже или позвоните нам.'
    });
  }
});

/**
 * Раздача статических файлов сайта.
 */
app.use(
  express.static(path.join(__dirname), {
    dotfiles: 'deny',
    extensions: ['html']
  })
);

/**
 * Главная страница по умолчанию.
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * 404 для неизвестных маршрутов.
 */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сайт доступен: http://localhost:${PORT}/`);
  console.log('AI API: POST /api/deepseek');
  console.log('Contact API: POST /api/contact');
});

/**
 * Utils
 */

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, 3000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || '';
}

async function saveLead(lead) {
  await fs.mkdir(PRIVATE_DIR, { recursive: true });

  let leads = [];

  try {
    const fileContent = await fs.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(fileContent);

    if (Array.isArray(parsed)) {
      leads = parsed;
    }
  } catch (err) {
    leads = [];
  }

  leads.unshift(lead);

  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

async function sendLeadToTelegram(lead) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const text = [
    'Новая заявка с сайта ООО «Тритон»',
    '',
    `Имя: ${lead.name}`,
    `Компания: ${lead.company || '-'}`,
    `Телефон: ${lead.phone}`,
    `Email: ${lead.email || '-'}`,
    `Страница: ${lead.page || '-'}`,
    '',
    `Задача: ${lead.message}`,
    '',
    `Дата: ${lead.createdAt}`
  ].join('\n');

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Telegram send error:', response.status, errorText);
    }
  } catch (err) {
    console.error('Telegram send exception:', err.message);
  }
}