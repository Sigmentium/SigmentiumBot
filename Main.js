const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();

const Token = process.env.token;

const bot = new TelegramBot(Token, { polling: true });

const Names = ["Александ", "Алексей", "Игнат", "Максим", "Ашот", "Сергей", "Наталия", "Ольга", "Наиле", "Мирослав", "Денис", "Дарья", "Елисей", "Герасим", "Константин"];

function PlayerAttempt(chatId, messageId) {
    const State = BullsCowsState[chatId];

    if (!State) return;

    bot.sendMessage(chatId, 'Введите число (4 цифры)');

    bot.once('message', (msg) => {
        const Attempt = msg.text;

        if (Attempt.length > 4) {
            bot.sendMessage(chatId, 'Число не должно превышать более 4 цифр!');
            return;
        }
        else if (Attempt.length < 4) {
            bot.sendMessage(chatId, 'Число не должно быть менее 4 цифр!');
            return;
        }

        let Bulls = 0, Cows = 0;

        for (let A = 0; A < 4; A++) {
            if (Attempt[A] === State.OpponentNumber[A]) Bulls++;
            else if (State.OpponentNumber.includes(Attempt[A])) Cows++;
        }

        State.Attempts.push({ Attempt, Bulls, Cows });

        let TextAttempts = State.Attempts.map(a =>
            `${a.Attempt}: Быки - ${a.Bulls} | Коровы - ${a.Cows}`
        ).join("\n");

        bot.editMessageText(`<i><b>Быки - коровы</b></i>\n\nВаш противник: ${State.OpponentName}\nВаше число: ${State.PlayerNumber}\n\n<i><b>Попытки:</b></i>\n${TextAttempts}\n\n<b>Сделайте попытку</b>`, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: State.LastMessageId,
            reply_markup: { inline_keyboard: [[{ text: 'Сделать попытку', callback_data: 'Attemp' }]] }
        })
            .then(sent => {
                if (sent && sent.message_id) {
                    State.LastMessageId = sent.message_id;
                }
            })
            .catch(() => {
                bot.sendMessage(chatId, `<i><b>Быки - коровы</b></i>\n\nВаш противник: ${State.OpponentName}\nВаше число: ${State.PlayerNumber}\n\n<i><b>Попытки:</b></i>\n${TextAttempts}\n\n<b>Сделайте попытку</b>`, {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [[{ text: 'Сделать попытку', callback_data: 'Attemp' }]] }
                })
                    .then(sent => {
                        State.LastMessageId = sent.message_id;
                    });
            });

        if (Bulls === 4) {
            bot.sendMessage(chatId, '<b>Выигрыш!</b>', { parse_mode: 'HTML' });
            delete BullsCowsState[chatId];
        }
    });
}

bot.onText(/\/start/, (msg) => {
    const Functions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Каталог', callback_data: 'Katalog' }],
                [{ text: 'Документация', callback_data: 'Documentation' }],
                [{ text: 'Профиль', url: 'https://sigmentium.github.io/All/Profile/Main' }],
                [{ text: 'Подписки', url: 'https://sigmentium.github.io/All/Expansion/Main' }]
            ]
        }
    };

    bot.sendMessage(msg.chat.id, 'Привет!\nЯ официальный <b>бот от Sigmentium</b>. Через этого бота ты можешь <i><b>играть и становится авторитетом</b></i> прямо в <b>Telegram</b>.\n\n<b>Мои функции:</b>', { parse_mode: 'HTML', reply_markup: Functions.reply_markup });
});

// Games
bot.onText(/\/Tsu_E_Fa/, (msg) => {
    const Select = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Камень', callback_data: 'Stone' }],
                [{ text: 'Ножницы', callback_data: 'Scissors' }],
                [{ text: 'Бумага', callback_data: 'Paper' }]
            ]
        }
    };

    const OpponentName = Names[Math.floor(Math.random() * Names.length)];

    bot.sendMessage(msg.chat.id, `<i><b>Камень - ножницы - бумага</b></i>\n\nВаш противник: ${OpponentName}\nВаш выбор: -\n\n<b>Сделайте выбор:</b>`, { parse_mode: 'HTML', reply_markup: Select.reply_markup });
});

let BullsCowsState = {};

bot.onText(/\/Bulls_Cows/, (msg) => {
    const chatId = msg.chat.id;
    const OpponentName = Names[Math.floor(Math.random() * Names.length)];

    bot.sendMessage(chatId, `<i><b>Быки - коровы</b></i>\n\nВаш противник: ${OpponentName}\nВаше число: -\n\n<b>Введите ваше число</b>`, { parse_mode: 'HTML' });

    bot.once('message', (msg) => {
        const PlayerNumber = Number(msg.text);

        if (PlayerNumber.length > 4) {
            bot.sendMessage(chatId, 'Число не должно превышать более 4 цифр!');
            return;
        }
        else if (PlayerNumber.length < 4) {
            bot.sendMessage(chatId, 'Число не должно быть менее 4 цифр!');
            return;
        }

        const OpponentNumber = String(Math.floor(1000 + Math.random() * 9000));

        BullsCowsState[chatId] = {
            OpponentName,
            PlayerNumber,
            OpponentNumber,
            LastMessageId: null,
            Attempts: []
        };

        bot.sendMessage(chatId, `<i><b>Быки - коровы</b></i>\n\nВаш противник: ${OpponentName}\nВаше число: ${PlayerNumber}\n\n<i><b>Попытки:</b></i>\n-\n\n<b>Сделайте попытку</b>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Сделать попытку', callback_data: 'Attemp' }]]} })
            .then(sentMessage => BullsCowsState[chatId].LastMessageId = sentMessage.message_id);
    });
});

// Documentation
bot.onText(/\/Doc_Tsu_E_Fa/, (msg) => {
    bot.sendMessage(msg.chat.id,
        'Камень - ножницы - бумага — одна из самых древних игр в мире. Камень побеждает ножницы. Ножницы побеждают бумагу. Бумага побеждает камень, и так по кругу.'
    );
});
bot.onText(/\/Doc_Bulls_Cows/, (msg) => {
    bot.sendMessage(msg.chat.id,
        'Быки - коровы — игра, где нужно угадать 4-значное число противника. Бык — цифра угадана и стоит на своём месте. Корова — цифра есть в числе, но не на своём месте. Первая цифра не может быть нулём.'
    );
});

// Callback
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    switch (query.data) {
        case 'Katalog':
            bot.editMessageText('<b>Отлично!\nЗагружаем данные...</b>', { parse_mode: 'HTML', chat_id: chatId, message_id: messageId });

            setTimeout(() => {
                bot.editMessageText('<i><b>Каталог игр</b></i>\n\n<b>Играй на авторитет!</b>\nДокументацию по играм можно посмотреть <a href="https://sigmentium.github.io/All/Documentation">тут</a>\n\n<b>Выберите игру:</b>\n<b>Камень - ножницы - бумага</b>: <i>/Tsu_E_Fa</i>\n<b>Быки - коровы</b>: <i>/Bulls_Cows</i>', { parse_mode: 'HTML', chat_id: chatId, message_id: messageId });
            }, 1500);
            break;
        case 'Documentation':
            bot.editMessageText('<b>Отлично!\nЗагружаем данные...</b>', { parse_mode: 'HTML', chat_id: chatId, message_id: messageId });

            setTimeout(() => {
                bot.editMessageText('<i><b>Документация</b></i>\n<b>Играй на авторитет!</b>\n\n<b>Выберите раздел:</b>\n<b>Камень - ножницы - бумага</b>: <i>/Doc_Tsu_E_Fa</i>\n<b>Быки - коровы</b>: <i>/Doc_Bulls_Cows</i>', { parse_mode: 'HTML', chat_id: chatId, message_id: messageId });
            }, 1500);
            break;

        // Tsu-E-Fa
        case 'Stone':
        case 'Scissors':
        case 'Paper':
            const Player = query.data === 'Stone' ? 'Камень'
                         : query.data === 'Scissors' ? 'Ножницы'
                         : 'Бумага';

            const RandOpponent = ["Камень", "Ножницы", "Бумага"][Math.floor(Math.random() * 3)];
            const OpponentName = Names[Math.floor(Math.random() * Names.length)];

            let Result;

            if (Player === RandOpponent) Result = 'ничья';
            else if (
                (Player === 'Камень' && RandOpponent === 'Ножницы') ||
                (Player === 'Ножницы' && RandOpponent === 'Бумага') ||
                (Player === 'Бумага' && RandOpponent === 'Камень')
            ) Result = 'выигрыш';
            else Result = 'проигрыш';

            bot.editMessageText(`<i><b>Камень - ножницы - бумага</b></i>\n\nВаш противник: ${OpponentName}\nВы - ${Player}\n${OpponentName} - ${RandOpponent}\n\n<i><b>Результат: ${Result}</b></i>`, { parse_mode: 'HTML', chat_id: chatId, message_id: messageId });
            break;

        // Bulls-Cows
        case 'Attemp':
            PlayerAttempt(chatId, messageId);
            break;
    }
});

console.log('> Successful start');