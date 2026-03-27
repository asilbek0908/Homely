const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

// In-memory store for user language preferences { chatId -> 'uz'|'ru'|'en' }
const userLanguages = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const safeSend = async (chatId, text, opts = {}) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }
};

// ─── Language selection keyboard ──────────────────────────────────────────────

const langKeyboard = {
  inline_keyboard: [
    [{ text: "🇺🇿 O'zbek",   callback_data: 'lang_uz' }],
    [{ text: '🇷🇺 Русский',   callback_data: 'lang_ru' }],
    [{ text: '🇬🇧 English',   callback_data: 'lang_en' }],
  ],
};

// ─── Role keyboards (per language) ────────────────────────────────────────────

const roleKeyboard = {
  uz: {
    inline_keyboard: [
      [{ text: '🏡 Menga xizmat kerak', callback_data: 'need_service' }],
      [{ text: '👷 Men ustaman',         callback_data: 'am_worker'    }],
      [
        { text: 'ℹ️ Homely haqida', callback_data: 'about' },
        { text: '❓ Yordam',         callback_data: 'help'  },
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [{ text: '🏡 Мне нужна услуга', callback_data: 'need_service' }],
      [{ text: '👷 Я мастер',          callback_data: 'am_worker'    }],
      [
        { text: 'ℹ️ О Homely', callback_data: 'about' },
        { text: '❓ Помощь',   callback_data: 'help'  },
      ],
    ],
  },
  en: {
    inline_keyboard: [
      [{ text: '🏡 I need services', callback_data: 'need_service' }],
      [{ text: '👷 I am a worker',   callback_data: 'am_worker'    }],
      [
        { text: 'ℹ️ About Homely', callback_data: 'about' },
        { text: '❓ Help',          callback_data: 'help'  },
      ],
    ],
  },
};

// ─── Back-to-menu keyboard ─────────────────────────────────────────────────────

const backKeyboard = (lang) => ({
  inline_keyboard: [
    [{ text: lang === 'uz' ? '🌐 Usta topish' : lang === 'ru' ? '🌐 Найти мастера' : '🌐 Find a Worker',
       callback_data: 'website' }],
    [{ text: lang === 'uz' ? '🔑 Chat ID ni ulash' : lang === 'ru' ? '🔑 Подключить Chat ID' : '🔑 Connect Chat ID',
       callback_data: 'chatid_help' }],
    [{ text: lang === 'uz' ? '🏠 Bosh menyu' : lang === 'ru' ? '🏠 Главное меню' : '🏠 Main Menu',
       callback_data: 'main_menu' }],
  ],
});

const workerBackKeyboard = (lang) => ({
  inline_keyboard: [
    [{ text: lang === 'uz' ? '🌐 Usta bo\'lish' : lang === 'ru' ? '🌐 Стать мастером' : '🌐 Register as Worker',
       callback_data: 'website' }],
    [{ text: lang === 'uz' ? '🔑 Chat ID ni ulash' : lang === 'ru' ? '🔑 Подключить Chat ID' : '🔑 Connect Chat ID',
       callback_data: 'chatid_help' }],
    [{ text: lang === 'uz' ? '🏠 Bosh menyu' : lang === 'ru' ? '🏠 Главное меню' : '🏠 Main Menu',
       callback_data: 'main_menu' }],
  ],
});

// ─── Welcome messages ──────────────────────────────────────────────────────────

const welcomeMsg = {
  uz: (firstName, chatId) =>
`🏠 *HOMELY'GA XO'SH KELIBSIZ!*
━━━━━━━━━━━━━━━━━━━━━━━

Assalomu alaykum, *${firstName}*! 👋

Homely — O'zbekistondagi birinchi
ishonchli uy xizmatlari platformasi.

Tekshirilgan ustalar bilan
bog'laning, xavfsiz to'lang va
sifatli xizmat oling!

*Nima uchun Homely?*
✅ Barcha ustalar tekshirilgan
💰 Shaffof narxlar
⭐ Haqiqiy mijoz sharhlari
🔒 Xavfsiz buyurtma tizimi
🔔 Darhol Telegram bildirishnomalar

━━━━━━━━━━━━━━━━━━━━━━━
🔑 *Sizning Chat ID'ingiz:*
\`${chatId}\`

📋 *Bu ID nima uchun kerak?*
http://localhost:5173 ga kiring →
Sozlamalar → Telegram →
Ushbu ID ni joylashtiring.

Shundan so'ng barcha buyurtmalar
va yangiliklar haqida darhol
xabar olasiz! 🔔
━━━━━━━━━━━━━━━━━━━━━━━
_Uyingiz ishonchli qo'llarda._ 🏠`,

  ru: (firstName, chatId) =>
`🏠 *ДОБРО ПОЖАЛОВАТЬ В HOMELY!*
━━━━━━━━━━━━━━━━━━━━━━━

Здравствуйте, *${firstName}*! 👋

Homely — первый надёжный
маркетплейс домашних услуг
в Узбекистане.

Находите проверенных мастеров,
платите безопасно и получайте
качественный сервис!

*Почему Homely?*
✅ Все мастера проверены
💰 Прозрачные цены
⭐ Настоящие отзывы клиентов
🔒 Безопасная система заказов
🔔 Мгновенные Telegram уведомления

━━━━━━━━━━━━━━━━━━━━━━━
🔑 *Ваш Chat ID:*
\`${chatId}\`

📋 *Зачем нужен этот ID?*
Войдите на http://localhost:5173 →
Настройки → Telegram →
Вставьте этот ID.

После этого вы будете получать
мгновенные уведомления о всех
заказах и обновлениях! 🔔
━━━━━━━━━━━━━━━━━━━━━━━
_Ваш дом в надёжных руках._ 🏠`,

  en: (firstName, chatId) =>
`🏠 *WELCOME TO HOMELY!*
━━━━━━━━━━━━━━━━━━━━━━━

Hello, *${firstName}*! 👋

Homely is Uzbekistan's first trusted
home services marketplace connecting
homeowners with verified local
service workers.

*Why Homely?*
✅ All workers are verified
💰 Transparent pricing
⭐ Real customer reviews
🔒 Secure booking system
🔔 Instant Telegram notifications

━━━━━━━━━━━━━━━━━━━━━━━
🔑 *Your Chat ID:*
\`${chatId}\`

📋 *Why do you need this ID?*
Login to http://localhost:5173 →
Settings → Telegram →
Paste this ID.

After connecting you will receive
instant notifications about all
bookings and updates! 🔔
━━━━━━━━━━━━━━━━━━━━━━━
_Your Home, In Safe Hands._ 🏠`,
};

// ─── Role prompt messages ──────────────────────────────────────────────────────

const rolePrompt = {
  uz: '👇 *Siz kim sifatida foydalanasiz?*\n━━━━━━━━━━━━━━━━━━━━━━━',
  ru: '👇 *Кто вы на платформе?*\n━━━━━━━━━━━━━━━━━━━━━━━',
  en: '👇 *Who are you on the platform?*\n━━━━━━━━━━━━━━━━━━━━━━━',
};

// ─── Customer info messages ────────────────────────────────────────────────────

const customerMsg = {
  uz:
`🏡 *UY EGASI UCHUN*
━━━━━━━━━━━━━━━━━━━━━━━

Homely orqali xizmat olish
juda oson!

*Qanday ishlaydi:*
1️⃣ http://localhost:5173/register da ro'yxatdan o'ting
2️⃣ Kerakli xizmatni tanlang
3️⃣ Tekshirilgan ustani tanlang
4️⃣ Buyurtma bering
5️⃣ Ish bajarilgandan keyin to'lang

*Mavjud xizmatlar:*
🔧 Santexnika  ⚡ Elektrik  ❄️ Konditsioner

━━━━━━━━━━━━━━━━━━━━━━━
🔔 Buyurtma tasdiqlanganda
shu yerda darhol xabar olasiz!
━━━━━━━━━━━━━━━━━━━━━━━`,

  ru:
`🏡 *ДЛЯ ВЛАДЕЛЬЦЕВ ДОМОВ*
━━━━━━━━━━━━━━━━━━━━━━━

Получить услугу через Homely
очень просто!

*Как это работает:*
1️⃣ Зарегистрируйтесь на http://localhost:5173/register
2️⃣ Выберите нужную услугу
3️⃣ Выберите проверенного мастера
4️⃣ Оформите заказ
5️⃣ Оплатите после выполнения

*Доступные услуги:*
🔧 Сантехника  ⚡ Электрика  ❄️ Кондиционер

━━━━━━━━━━━━━━━━━━━━━━━
🔔 Вы получите уведомление
когда ваш заказ подтверждён!
━━━━━━━━━━━━━━━━━━━━━━━`,

  en:
`🏡 *FOR HOMEOWNERS*
━━━━━━━━━━━━━━━━━━━━━━━

Getting a service through Homely
is quick and easy!

*How it works:*
1️⃣ Register on http://localhost:5173/register
2️⃣ Choose the service you need
3️⃣ Select a verified worker
4️⃣ Make your booking
5️⃣ Pay after job is done

*Available services:*
🔧 Plumbing    ⚡ Electrical  ❄️ AC Repair

━━━━━━━━━━━━━━━━━━━━━━━
🔔 You will get notified here
when your booking is confirmed!
━━━━━━━━━━━━━━━━━━━━━━━`,
};

// ─── Worker info messages ──────────────────────────────────────────────────────

const workerMsg = {
  uz:
`👷 *USTA UCHUN*
━━━━━━━━━━━━━━━━━━━━━━━

Homely orqali ko'proq
mijoz toping!

*Qanday ishlaydi:*
1️⃣ http://localhost:5173/register da usta sifatida
   ro'yxatdan o'ting
2️⃣ Profilingizni to'ldiring
3️⃣ Hujjatlarni yuklang
4️⃣ Admin tasdiqlashini kuting
5️⃣ Ish buyurtmalarini qabul qiling
6️⃣ Pul ishlang 💰

*Nima uchun Homely?*
✅ Bepul ro'yxatdan o'tish
📱 Darhol Telegram bildirishnomalar
⭐ Reyting va sharh tizimi
💰 Xavfsiz to'lovlar
🏆 Keng mijozlar bazasi

━━━━━━━━━━━━━━━━━━━━━━━
💡 Chat ID ni ulab, birorta
ish so'rovini o'tkazib
yubormang! 🔔
━━━━━━━━━━━━━━━━━━━━━━━`,

  ru:
`👷 *ДЛЯ МАСТЕРОВ*
━━━━━━━━━━━━━━━━━━━━━━━

Находите больше клиентов
через Homely!

*Как это работает:*
1️⃣ Зарегистрируйтесь на http://localhost:5173/register
   как мастер
2️⃣ Заполните профиль полностью
3️⃣ Загрузите документы
4️⃣ Дождитесь одобрения админа
5️⃣ Получайте заказы
6️⃣ Зарабатывайте деньги 💰

*Почему Homely?*
✅ Бесплатная регистрация
📱 Мгновенные Telegram уведомления
⭐ Система рейтингов и отзывов
💰 Безопасные платежи
🏆 Широкая база клиентов

━━━━━━━━━━━━━━━━━━━━━━━
💡 Подключите Chat ID и
никогда не пропускайте
запросы на работу! 🔔
━━━━━━━━━━━━━━━━━━━━━━━`,

  en:
`👷 *FOR WORKERS*
━━━━━━━━━━━━━━━━━━━━━━━

Find more customers through
Homely!

*How it works:*
1️⃣ Register on http://localhost:5173/register
   as a service worker
2️⃣ Complete your profile fully
3️⃣ Upload your documents
4️⃣ Wait for admin approval
5️⃣ Receive job requests
6️⃣ Earn money 💰

*Why Homely?*
✅ Free registration
📱 Instant Telegram notifications
⭐ Rating and review system
💰 Secure payments
🏆 Growing customer base

━━━━━━━━━━━━━━━━━━━━━━━
💡 Connect your Chat ID and
never miss a single
job request! 🔔
━━━━━━━━━━━━━━━━━━━━━━━`,
};

// ─── Main Menu prompt ──────────────────────────────────────────────────────────

const mainMenuPrompt = {
  uz: '👇 *Bosh menyu*\n━━━━━━━━━━━━━━━━━━━━━━━',
  ru: '👇 *Главное меню*\n━━━━━━━━━━━━━━━━━━━━━━━',
  en: '👇 *Main Menu*\n━━━━━━━━━━━━━━━━━━━━━━━',
};

// ─── Chat ID help message ──────────────────────────────────────────────────────

const chatIdHelpMsg = {
  uz: (chatId) => `🔑 *Sizning Chat ID'ingiz:*\n\`${chatId}\`\n\nhttp://localhost:5173/telegram-connect → ID ni joylashtiring.`,
  ru: (chatId) => `🔑 *Ваш Chat ID:*\n\`${chatId}\`\n\nhttp://localhost:5173/telegram-connect → Вставьте ID.`,
  en: (chatId) => `🔑 *Your Chat ID:*\n\`${chatId}\`\n\nhttp://localhost:5173/telegram-connect → Paste this ID.`,
};

// ─── About message ─────────────────────────────────────────────────────────────

const aboutMsg = {
  uz:
`ℹ️ *HOMELY HAQIDA*
━━━━━━━━━━━━━━━━━━━━━━━

Homely — O'zbekistondagi uy
xizmatlari uchun №1 platforma.

Toshkentdagi uy egalari va
ishonchli ustalarni bog'laymiz.

🌐 http://localhost:5173
📧 info@homely.uz
📞 +998 91 977 9202
━━━━━━━━━━━━━━━━━━━━━━━`,

  ru:
`ℹ️ *О HOMELY*
━━━━━━━━━━━━━━━━━━━━━━━

Homely — платформа №1 для
домашних услуг в Узбекистане.

Связываем владельцев жилья
с надёжными мастерами Ташкента.

🌐 http://localhost:5173
📧 info@homely.uz
📞 +998 91 977 9202
━━━━━━━━━━━━━━━━━━━━━━━`,

  en:
`ℹ️ *ABOUT HOMELY*
━━━━━━━━━━━━━━━━━━━━━━━

Homely is Uzbekistan's #1 platform
for home services.

We connect Tashkent homeowners
with trusted local workers.

🌐 http://localhost:5173
📧 info@homely.uz
📞 +998 91 977 9202
━━━━━━━━━━━━━━━━━━━━━━━`,
};

// ─── Help message ──────────────────────────────────────────────────────────────

const helpMsg = {
  uz:
`❓ *YORDAM*
━━━━━━━━━━━━━━━━━━━━━━━

Muammo yuzaga keldimi?

📧 info@homely.uz ga yozing
📞 +998 91 977 9202 ga qo'ng'iroq qiling

Bot buyruqlari:
/start — Bosh menyuga qaytish
━━━━━━━━━━━━━━━━━━━━━━━`,

  ru:
`❓ *ПОМОЩЬ*
━━━━━━━━━━━━━━━━━━━━━━━

Возникла проблема?

📧 Напишите: info@homely.uz
📞 Позвоните: +998 91 977 9202

Команды бота:
/start — Вернуться в главное меню
━━━━━━━━━━━━━━━━━━━━━━━`,

  en:
`❓ *HELP*
━━━━━━━━━━━━━━━━━━━━━━━

Having an issue?

📧 Email: info@homely.uz
📞 Call: +998 91 977 9202

Bot commands:
/start — Return to main menu
━━━━━━━━━━━━━━━━━━━━━━━`,
};

// ─── Bot initialization ────────────────────────────────────────────────────────

if (token) {
  try {
    bot = new TelegramBot(token, { polling: true });

    // /start — send logo then language picker
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;

      // If user has already chosen a language, skip logo and go straight to lang selection
      await safeSend(chatId, '🏠 *HOMELY — Your Home, In Safe Hands.*');

      await delay(1000);

      await safeSend(
        chatId,
        '🌐 *Choose your language*\n━━━━━━━━━━━━━━━━━━━━━━━\nTilni tanlang | Выберите язык\nSelect your language\n━━━━━━━━━━━━━━━━━━━━━━━',
        { reply_markup: langKeyboard }
      );
    });

    // ── Callback query handler ───────────────────────────────────────────────
    bot.on('callback_query', async (query) => {
      const chatId  = query.message.chat.id;
      const data    = query.data;
      const firstName = query.from.first_name || 'there';

      // Always acknowledge the button press
      bot.answerCallbackQuery(query.id).catch(() => {});

      // ── Language selection ─────────────────────────────────────────────────
      if (['lang_uz', 'lang_ru', 'lang_en'].includes(data)) {
        const lang = data.replace('lang_', '');
        userLanguages.set(chatId, lang);

        await safeSend(chatId, welcomeMsg[lang](firstName, chatId));
        await delay(1000);
        await safeSend(chatId, rolePrompt[lang], { reply_markup: roleKeyboard[lang] });
        return;
      }

      const lang = userLanguages.get(chatId) || 'en';

      // ── Role callbacks ─────────────────────────────────────────────────────
      if (data === 'need_service') {
        await safeSend(chatId, customerMsg[lang], { reply_markup: backKeyboard(lang) });
        return;
      }

      if (data === 'am_worker') {
        await safeSend(chatId, workerMsg[lang], { reply_markup: workerBackKeyboard(lang) });
        return;
      }

      // ── Navigation callbacks ───────────────────────────────────────────────
      if (data === 'main_menu') {
        await safeSend(chatId, mainMenuPrompt[lang], { reply_markup: roleKeyboard[lang] });
        return;
      }

      if (data === 'chatid_help') {
        await safeSend(chatId, chatIdHelpMsg[lang](chatId));
        return;
      }

      if (data === 'about') {
        await safeSend(chatId, aboutMsg[lang], {
          reply_markup: { inline_keyboard: [[{ text: lang === 'uz' ? '🏠 Bosh menyu' : lang === 'ru' ? '🏠 Главное меню' : '🏠 Main Menu', callback_data: 'main_menu' }]] },
        });
        return;
      }

      if (data === 'help') {
        await safeSend(chatId, helpMsg[lang], {
          reply_markup: { inline_keyboard: [[{ text: lang === 'uz' ? '🏠 Bosh menyu' : lang === 'ru' ? '🏠 Главное меню' : '🏠 Main Menu', callback_data: 'main_menu' }]] },
        });
        return;
      }

      if (data === 'website') {
        await safeSend(chatId, '🌐 http://localhost:5173');
        return;
      }
    });

    console.log('Telegram bot started');
  } catch (err) {
    console.error('Telegram bot init error:', err.message);
  }
}

// ─── Notification functions (used by booking controller) ──────────────────────

const sendNewBookingNotification = async (booking, workerUser, customer) => {
  if (!workerUser?.telegramChatId) return;
  const lang = userLanguages.get(Number(workerUser.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');

  const msgs = {
    uz: `🔔 *Yangi buyurtma!*\n\n👤 Mijoz: ${customer.name}\n📞 Tel: ${customer.phone}\n🔧 Xizmat: ${booking.service}\n📅 Sana: ${date} soat ${booking.scheduledTime}\n📍 Manzil: ${booking.address}\n💰 Narx: ${booking.price.toLocaleString()} UZS\n\nHomely'ga kiring va qabul qiling!`,
    ru:  `🔔 *Новый заказ!*\n\n👤 Клиент: ${customer.name}\n📞 Тел: ${customer.phone}\n🔧 Услуга: ${booking.service}\n📅 Дата: ${date} в ${booking.scheduledTime}\n📍 Адрес: ${booking.address}\n💰 Цена: ${booking.price.toLocaleString()} UZS\n\nВойдите в Homely и примите заказ!`,
    en:  `🔔 *New Booking Request!*\n\n👤 Customer: ${customer.name}\n📞 Phone: ${customer.phone}\n🔧 Service: ${booking.service}\n📅 Date: ${date} at ${booking.scheduledTime}\n📍 Address: ${booking.address}\n💰 Price: ${booking.price.toLocaleString()} UZS\n\nLog in to Homely to accept or decline.`,
  };
  await safeSend(workerUser.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingConfirmedNotification = async (booking, workerUser, customer) => {
  if (!customer?.telegramChatId) return;
  const lang = userLanguages.get(Number(customer.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');

  const msgs = {
    uz: `✅ *Buyurtma tasdiqlandi!*\n\n👷 Usta: ${workerUser.name}\n📞 Tel: ${workerUser.phone}\n🔧 Xizmat: ${booking.service}\n📅 Sana: ${date} soat ${booking.scheduledTime}\n📍 Manzil: ${booking.address}\n\nUsta belgilangan vaqtda keladi. 🏠`,
    ru: `✅ *Заказ подтверждён!*\n\n👷 Мастер: ${workerUser.name}\n📞 Тел: ${workerUser.phone}\n🔧 Услуга: ${booking.service}\n📅 Дата: ${date} в ${booking.scheduledTime}\n📍 Адрес: ${booking.address}\n\nМастер прибудет в назначенное время. 🏠`,
    en: `✅ *Booking Confirmed!*\n\n👷 Worker: ${workerUser.name}\n📞 Phone: ${workerUser.phone}\n🔧 Service: ${booking.service}\n📅 Date: ${date} at ${booking.scheduledTime}\n📍 Address: ${booking.address}\n\nThe worker will arrive at the scheduled time. 🏠`,
  };
  await safeSend(customer.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingCancelledNotification = async (booking, recipientUser, cancelledBy) => {
  if (!recipientUser?.telegramChatId) return;
  const lang = userLanguages.get(Number(recipientUser.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');

  const by = { uz: cancelledBy === 'customer' ? 'mijoz' : 'usta', ru: cancelledBy === 'customer' ? 'клиентом' : 'мастером', en: cancelledBy };
  const msgs = {
    uz: `❌ *Buyurtma bekor qilindi*\n\n${by.uz} tomonidan bekor qilindi.\n\n🔧 Xizmat: ${booking.service}\n📅 Sana: ${date} soat ${booking.scheduledTime}\n\nHomely'da boshqa usta toping! 🔍`,
    ru: `❌ *Заказ отменён*\n\nОтменён ${by.ru}.\n\n🔧 Услуга: ${booking.service}\n📅 Дата: ${date} в ${booking.scheduledTime}\n\nНайдите другого мастера на Homely! 🔍`,
    en: `❌ *Booking Cancelled*\n\nCancelled by the ${by.en}.\n\n🔧 Service: ${booking.service}\n📅 Date: ${date} at ${booking.scheduledTime}\n\nFind another worker on Homely! 🔍`,
  };
  await safeSend(recipientUser.telegramChatId, msgs[lang] || msgs.en);
};

const sendWelcomeMessage = async (chatId, name) => {
  const lang = userLanguages.get(Number(chatId)) || 'en';
  const msgs = {
    uz: `🎉 *Homely'ga ulandi!*\n\nSalom ${name}! Endi barcha buyurtmalar haqida shu yerda xabar olasiz.\n\n🏠 *Homely* — Uyingiz ishonchli qo'llarda.`,
    ru: `🎉 *Подключено к Homely!*\n\nПривет ${name}! Теперь вы будете получать уведомления здесь.\n\n🏠 *Homely* — Ваш дом в надёжных руках.`,
    en: `🎉 *Connected to Homely!*\n\nHi ${name}! You will now receive booking notifications here.\n\n🏠 *Homely* — Your Home, In Safe Hands.`,
  };
  await safeSend(chatId, msgs[lang] || msgs.en);
};

module.exports = {
  sendNewBookingNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendWelcomeMessage,
};
