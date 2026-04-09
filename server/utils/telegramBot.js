const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

// In-memory store for user language preferences { chatId -> 'uz'|'ru'|'en' }
const userLanguages = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeSend = async (chatId, text, opts = {}) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }
};

const t = (lang, uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);

// ─── Keyboards ────────────────────────────────────────────────────────────────

const langKeyboard = {
  inline_keyboard: [
    [
      { text: "🇺🇿 O'zbek", callback_data: 'lang_uz' },
      { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
      { text: '🇬🇧 English', callback_data: 'lang_en' },
    ],
  ],
};

// Persistent bottom keyboard (always visible)
const replyKeyboard = (lang) => ({
  keyboard: [
    [
      { text: t(lang, '🏡 Mijozman', '🏡 Я клиент', '🏡 I need help') },
      { text: t(lang, '👷 Ustaman', '👷 Я мастер', '👷 I am a worker') },
    ],
    [
      { text: t(lang, '🔑 Chat ID', '🔑 Chat ID', '🔑 Chat ID') },
      { text: t(lang, '❓ Yordam', '❓ Помощь', '❓ Help') },
    ],
  ],
  resize_keyboard: true,
  persistent: true,
});

// Inline keyboard for cards/detail screens
const mainKeyboard = (lang) => ({
  inline_keyboard: [
    [
      { text: t(lang, '🏡 Mijozman', '🏡 Я клиент', '🏡 I need help'), callback_data: 'need_service' },
      { text: t(lang, '👷 Ustaman', '👷 Я мастер', '👷 I am a worker'), callback_data: 'am_worker' },
    ],
    [
      { text: t(lang, '🔑 Chat ID', '🔑 Chat ID', '🔑 Chat ID'), callback_data: 'chatid_help' },
      { text: t(lang, '❓ Yordam', '❓ Помощь', '❓ Help'), callback_data: 'help' },
    ],
  ],
});

const backKeyboard = (lang) => ({
  inline_keyboard: [
    [{ text: t(lang, '🏠 Orqaga', '🏠 Назад', '🏠 Back'), callback_data: 'main_menu' }],
  ],
});

// ─── Messages ─────────────────────────────────────────────────────────────────

const welcomeMsg = (lang, firstName, chatId) => {
  const lines = {
    uz: `👋 Salom, *${firstName}*! Homely botiga xush kelibsiz.

🔑 *Sizning Chat ID'ingiz:*
\`${chatId}\`

Bu ID'ni [Homely saytidagi Sozlamalar → Telegram](https://homely-alpha.vercel.app/telegram-connect) bo'limiga joylashtiring — shundan so'ng buyurtmalar haqida darhol xabar olasiz. 🔔`,

    ru: `👋 Привет, *${firstName}*! Добро пожаловать в бот Homely.

🔑 *Ваш Chat ID:*
\`${chatId}\`

Вставьте этот ID в [Настройки → Telegram](https://homely-alpha.vercel.app/telegram-connect) на сайте Homely — и получайте мгновенные уведомления о заказах. 🔔`,

    en: `👋 Hello, *${firstName}*! Welcome to the Homely bot.

🔑 *Your Chat ID:*
\`${chatId}\`

Paste this ID in [Settings → Telegram](https://homely-alpha.vercel.app/telegram-connect) on the Homely site to receive instant booking notifications. 🔔`,
  };
  return lines[lang];
};

const customerMsg = (lang) => {
  const lines = {
    uz: `🏡 *Uy egasi uchun*

1️⃣ [Saytga kiring va ro'yxatdan o'ting](https://homely-alpha.vercel.app/register)
2️⃣ Xizmatni tanlang va usta buyurtma qiling
3️⃣ Ish tugagandan so'ng to'lang

🔧 Santexnika · ⚡ Elektrik · ❄️ Konditsioner`,

    ru: `🏡 *Для клиентов*

1️⃣ [Зарегистрируйтесь на сайте](https://homely-alpha.vercel.app/register)
2️⃣ Выберите услугу и закажите мастера
3️⃣ Оплатите после выполнения работы

🔧 Сантехника · ⚡ Электрика · ❄️ Кондиционер`,

    en: `🏡 *For Homeowners*

1️⃣ [Register on the website](https://homely-alpha.vercel.app/register)
2️⃣ Choose a service and book a worker
3️⃣ Pay only after the job is done

🔧 Plumbing · ⚡ Electrical · ❄️ AC Repair`,
  };
  return lines[lang];
};

const workerMsg = (lang) => {
  const lines = {
    uz: `👷 *Usta uchun*

1️⃣ [Saytga kiring va ro'yxatdan o'ting](https://homely-alpha.vercel.app/register)
2️⃣ Profilingizni to'ldiring va hujjat yuklang
3️⃣ Admin tasdiqlashini kuting
4️⃣ Buyurtmalarni qabul qiling va pul ishlang 💰`,

    ru: `👷 *Для мастеров*

1️⃣ [Зарегистрируйтесь на сайте](https://homely-alpha.vercel.app/register)
2️⃣ Заполните профиль и загрузите документы
3️⃣ Дождитесь одобрения администратора
4️⃣ Принимайте заказы и зарабатывайте 💰`,

    en: `👷 *For Workers*

1️⃣ [Register on the website](https://homely-alpha.vercel.app/register)
2️⃣ Fill in your profile and upload documents
3️⃣ Wait for admin approval
4️⃣ Accept job requests and earn money 💰`,
  };
  return lines[lang];
};

const chatIdMsg = (lang, chatId) => {
  const lines = {
    uz: `🔑 *Sizning Chat ID'ingiz:*\n\`${chatId}\`\n\nBu ID'ni [Sozlamalar → Telegram](https://homely-alpha.vercel.app/telegram-connect) bo'limiga joylashtiring.`,
    ru: `🔑 *Ваш Chat ID:*\n\`${chatId}\`\n\nВставьте этот ID в [Настройки → Telegram](https://homely-alpha.vercel.app/telegram-connect).`,
    en: `🔑 *Your Chat ID:*\n\`${chatId}\`\n\nPaste this ID in [Settings → Telegram](https://homely-alpha.vercel.app/telegram-connect).`,
  };
  return lines[lang];
};

const helpMsg = (lang) => {
  const lines = {
    uz: `❓ *Yordam*\n\n📧 info@homely.uz\n📞 +998 91 977 9202\n\n/start — Bosh menyuga qaytish`,
    ru: `❓ *Помощь*\n\n📧 info@homely.uz\n📞 +998 91 977 9202\n\n/start — Вернуться в главное меню`,
    en: `❓ *Help*\n\n📧 info@homely.uz\n📞 +998 91 977 9202\n\n/start — Return to main menu`,
  };
  return lines[lang];
};

// ─── Bot initialization ────────────────────────────────────────────────────────

if (token && process.env.NODE_ENV !== 'development') {
  try {
    bot = new TelegramBot(token, { polling: true });

    // Register /start so Telegram shows it as a tappable command button
    bot.setMyCommands([
      { command: 'start', description: 'Open main menu' },
    ]).catch(() => {});

    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      await safeSend(
        chatId,
        '🌐 Tilni tanlang | Выберите язык | Choose language',
        { reply_markup: langKeyboard }
      );
    });

    bot.on('callback_query', async (query) => {
      const chatId    = query.message.chat.id;
      const data      = query.data;
      const firstName = query.from.first_name || 'there';

      bot.answerCallbackQuery(query.id).catch(() => {});

      if (['lang_uz', 'lang_ru', 'lang_en'].includes(data)) {
        const lang = data.replace('lang_', '');
        userLanguages.set(chatId, lang);
        // Show persistent bottom buttons first, then the welcome card
        await safeSend(chatId, t(lang, '✅ Til tanlandi', '✅ Язык выбран', '✅ Language selected'), { reply_markup: replyKeyboard(lang) });
        await safeSend(chatId, welcomeMsg(lang, firstName, chatId), { reply_markup: mainKeyboard(lang) });
        return;
      }

      const lang = userLanguages.get(chatId) || 'en';

      if (data === 'main_menu') {
        await safeSend(chatId, t(lang, '👇 Bosh menyu', '👇 Главное меню', '👇 Main Menu'), { reply_markup: mainKeyboard(lang) });
        return;
      }

      if (data === 'need_service') {
        await safeSend(chatId, customerMsg(lang), { reply_markup: backKeyboard(lang) });
        return;
      }

      if (data === 'am_worker') {
        await safeSend(chatId, workerMsg(lang), { reply_markup: backKeyboard(lang) });
        return;
      }

      if (data === 'chatid_help') {
        await safeSend(chatId, chatIdMsg(lang, chatId), { reply_markup: backKeyboard(lang) });
        return;
      }

      if (data === 'help') {
        await safeSend(chatId, helpMsg(lang), { reply_markup: backKeyboard(lang) });
        return;
      }
    });

    // Handle persistent reply keyboard button presses (text messages)
    bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      const chatId = msg.chat.id;
      const text   = msg.text;
      const lang   = userLanguages.get(chatId) || 'en';

      const isBtn = (uz, ru, en) => text === uz || text === ru || text === en;

      if (isBtn('🏡 Mijozman', '🏡 Я клиент', '🏡 I need help')) {
        await safeSend(chatId, customerMsg(lang), { reply_markup: backKeyboard(lang) });
      } else if (isBtn('👷 Ustaman', '👷 Я мастер', '👷 I am a worker')) {
        await safeSend(chatId, workerMsg(lang), { reply_markup: backKeyboard(lang) });
      } else if (isBtn('🔑 Chat ID', '🔑 Chat ID', '🔑 Chat ID')) {
        await safeSend(chatId, chatIdMsg(lang, chatId));
      } else if (isBtn('❓ Yordam', '❓ Помощь', '❓ Help')) {
        await safeSend(chatId, helpMsg(lang));
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
    uz: `🔔 *Yangi buyurtma!*\n\n👤 ${customer.name} · 📞 ${customer.phone}\n🔧 ${booking.service}\n📅 ${date} soat ${booking.scheduledTime}\n📍 ${booking.address}\n💰 ${booking.price.toLocaleString()} UZS`,
    ru: `🔔 *Новый заказ!*\n\n👤 ${customer.name} · 📞 ${customer.phone}\n🔧 ${booking.service}\n📅 ${date} в ${booking.scheduledTime}\n📍 ${booking.address}\n💰 ${booking.price.toLocaleString()} UZS`,
    en: `🔔 *New Booking!*\n\n👤 ${customer.name} · 📞 ${customer.phone}\n🔧 ${booking.service}\n📅 ${date} at ${booking.scheduledTime}\n📍 ${booking.address}\n💰 ${booking.price.toLocaleString()} UZS`,
  };
  await safeSend(workerUser.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingConfirmedNotification = async (booking, workerUser, customer) => {
  if (!customer?.telegramChatId) return;
  const lang = userLanguages.get(Number(customer.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');

  const msgs = {
    uz: `✅ *Buyurtma tasdiqlandi!*\n\n👷 ${workerUser.name} · 📞 ${workerUser.phone}\n🔧 ${booking.service}\n📅 ${date} soat ${booking.scheduledTime}\n📍 ${booking.address}`,
    ru: `✅ *Заказ подтверждён!*\n\n👷 ${workerUser.name} · 📞 ${workerUser.phone}\n🔧 ${booking.service}\n📅 ${date} в ${booking.scheduledTime}\n📍 ${booking.address}`,
    en: `✅ *Booking Confirmed!*\n\n👷 ${workerUser.name} · 📞 ${workerUser.phone}\n🔧 ${booking.service}\n📅 ${date} at ${booking.scheduledTime}\n📍 ${booking.address}`,
  };
  await safeSend(customer.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingCancelledNotification = async (booking, recipientUser, cancelledBy) => {
  if (!recipientUser?.telegramChatId) return;
  const lang = userLanguages.get(Number(recipientUser.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');

  const by = { uz: cancelledBy === 'customer' ? 'mijoz' : 'usta', ru: cancelledBy === 'customer' ? 'клиентом' : 'мастером', en: cancelledBy };
  const msgs = {
    uz: `❌ *Buyurtma bekor qilindi* (${by.uz})\n\n🔧 ${booking.service} · 📅 ${date} soat ${booking.scheduledTime}`,
    ru: `❌ *Заказ отменён* (${by.ru})\n\n🔧 ${booking.service} · 📅 ${date} в ${booking.scheduledTime}`,
    en: `❌ *Booking Cancelled* (by ${by.en})\n\n🔧 ${booking.service} · 📅 ${date} at ${booking.scheduledTime}`,
  };
  await safeSend(recipientUser.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingInProgressNotification = async (booking, workerUser, customer) => {
  if (!customer?.telegramChatId) return;
  const lang = userLanguages.get(Number(customer.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');
  const msgs = {
    uz: `🔧 *Usta ishni boshladi!*\n\n👷 ${workerUser?.name}\n🔧 ${booking.service}\n📅 ${date} soat ${booking.scheduledTime}\n📍 ${booking.address}`,
    ru: `🔧 *Мастер приступил к работе!*\n\n👷 ${workerUser?.name}\n🔧 ${booking.service}\n📅 ${date} в ${booking.scheduledTime}\n📍 ${booking.address}`,
    en: `🔧 *Worker started the job!*\n\n👷 ${workerUser?.name}\n🔧 ${booking.service}\n📅 ${date} at ${booking.scheduledTime}\n📍 ${booking.address}`,
  };
  await safeSend(customer.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingCompletedNotification = async (booking, workerUser, customer) => {
  if (!customer?.telegramChatId) return;
  const lang = userLanguages.get(Number(customer.telegramChatId)) || 'en';
  const finalAmt = (booking.finalPrice ?? booking.price ?? 0).toLocaleString();
  const msgs = {
    uz: `🎉 *Ish bajarildi!*\n\n👷 ${workerUser?.name}\n🔧 ${booking.service}\n💰 To'lov: ${finalAmt} UZS\n\nIltimos, izoh qoldiring! ⭐`,
    ru: `🎉 *Работа выполнена!*\n\n👷 ${workerUser?.name}\n🔧 ${booking.service}\n💰 Итоговая сумма: ${finalAmt} UZS\n\nОставьте отзыв! ⭐`,
    en: `🎉 *Job Completed!*\n\n👷 ${workerUser?.name}\n🔧 ${booking.service}\n💰 Final amount: ${finalAmt} UZS\n\nPlease leave a review! ⭐`,
  };
  await safeSend(customer.telegramChatId, msgs[lang] || msgs.en);
};

const sendBookingRescheduledNotification = async (booking, workerUser, customer) => {
  if (!workerUser?.telegramChatId) return;
  const lang = userLanguages.get(Number(workerUser.telegramChatId)) || 'en';
  const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB');
  const msgs = {
    uz: `🗓 *Buyurtma qayta rejalashtirildi!*\n\n👤 ${customer?.name}\n🔧 ${booking.service}\n📅 Yangi vaqt: ${date} soat ${booking.scheduledTime}`,
    ru: `🗓 *Заказ перенесён!*\n\n👤 ${customer?.name}\n🔧 ${booking.service}\n📅 Новое время: ${date} в ${booking.scheduledTime}`,
    en: `🗓 *Booking Rescheduled!*\n\n👤 ${customer?.name}\n🔧 ${booking.service}\n📅 New time: ${date} at ${booking.scheduledTime}`,
  };
  await safeSend(workerUser.telegramChatId, msgs[lang] || msgs.en);
};

const sendWelcomeMessage = async (chatId, name) => {
  const lang = userLanguages.get(Number(chatId)) || 'en';
  const msgs = {
    uz: `🎉 *Ulandi!* Salom ${name}! Endi buyurtmalar haqida shu yerda xabar olasiz. 🏠`,
    ru: `🎉 *Подключено!* Привет ${name}! Теперь вы будете получать уведомления здесь. 🏠`,
    en: `🎉 *Connected!* Hi ${name}! You'll now receive booking notifications here. 🏠`,
  };
  await safeSend(chatId, msgs[lang] || msgs.en);
};

module.exports = {
  sendNewBookingNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendBookingInProgressNotification,
  sendBookingCompletedNotification,
  sendBookingRescheduledNotification,
  sendWelcomeMessage,
};
