//jshint esversion:6
const TelegramBot = require('node-telegram-bot-api');
const https = require("https");
const bodyParser = require("body-parser");

const token = '1242747798:AAFSfYmjZ5Ja9cV1r00nwD8V8UqYjN-IZYA';

let isGameStarted = false;
let isGameFinished = false;
//GAME SCRIPT----------------------------------------------------
function getRandomWord(chatId) {
  let wordsArray = [
    `house`, `cat`, `hat`, `backpack`, `car`, `stool`, `shirt`, `wardrobe`, `pillow`, `blanket`, `freedom`
  ];
  const randomNumber = Math.floor(Math.random() * wordsArray.length);
  const initialWord = wordsArray[randomNumber];
  const url = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20200705T154052Z.d247ab4b4f1f7584.52e72b4b03ab1519037d82a7c979b1872f4d3b93&lang=en-ru&text=${initialWord}`;
  https.get(url, function(response) {
    console.log(response.statusCode);
    response.on("data", function(data) {
      const wordData = JSON.parse(data);
      const synonymsObjects = wordData.def[0].tr[0].syn;
      let synonymsArray = [];
      for (let index of synonymsObjects) {
        synonymsArray.push(index[`text`]);
      }
      const randomSynonymNumber = Math.floor(Math.random() * synonymsArray.length);
      const guessedWord = synonymsArray[randomSynonymNumber];
      hangmanGame(chatId, guessedWord);
      return;
    });
  });
}
// Main game function
function hangmanGame(chatId, word) {
  isGameStarted = true;
  isGameFinished = false;

  let wrongLetters = [];
  let triedLetters = [];
  let playerHasWon;
  let answerArray = [];
  for (let i = 0; i < word.length; i++) {
    answerArray[i] = `_`;
    if (word[i] == ` `) {
      answerArray[i] = ` `;
    } else {
      answerArray[i] = `_`;
    }
  }
  /////
  bot.sendMessage(chatId, `Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`);
  bot.sendMessage(chatId, `${answerArray.join(` `)} , неподошедшие буквы: [${wrongLetters.join(`,`)}] Попыток осталось: ${10 - wrongLetters.length}`);
  bot.on('message', (msg) => {
    let guess = msg.text.toLowerCase();
    if (isGameStarted && !isGameFinished) {
      if (guess == null) {
        //break;
      } else if (guess == `стоп`) {
        isGameFinished = true;
        //isGameStarted = false;
        bot.sendMessage(chatId, `Игра завершена. Чтобы начать заново, напиши "/game"`);
        //break;
      } else if (guess.length > 1) {
        if (guess == word) {
          bot.sendMessage(chatId, `Вау, ты угадал слово целиком!`);
          isGameFinished = true;
          //isGameStarted = false;
          playerHasWon = `yes`;
        } else {
          bot.sendMessage(chatId, `Неверно! Попробуй еще или напиши одну букву`);
        }
      } else {
        let isAlreadyTried = false;
        for (let letter of triedLetters) {
          if (letter == guess) {
            isAlreadyTried = true;
            bot.sendMessage(chatId, `Внимательнее! Эта буква уже была`);
          }
        }
        if (!isAlreadyTried) {
          let letterIsRight = false;
          for (let j = 0; j < word.length; j++) {
            if (word[j] === guess) {
              letterIsRight = true;
              answerArray[j] = guess;
              // console.log(answerArray);
              // console.log(guess);
              triedLetters.push(guess);
              if (answerArray.join(``) == word) {
                isGameFinished = true;
                playerHasWon = `yes`;
              }
            }
          }
          if (!letterIsRight) {
            wrongLetters.push(guess);
            triedLetters.push(guess);
            if (wrongLetters.length == 10) {
              isGameFinished = true;
              //isGameStarted = false;
              playerHasWon = `no`;
            }
          }
        }
        bot.sendMessage(chatId, `${answerArray.join(` `)} , неподошедшие буквы: [${wrongLetters.join(`,`)}] Попыток осталось: ${10 - wrongLetters.length}`);
      }

      //let guess = prompt(`Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`).toLowerCase();
      //bot.sendMessage(chatId, `Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`);
    }
    if (isGameFinished && isGameStarted) {
      isGameStarted = false;
      if (playerHasWon == `yes`) {
        bot.sendMessage(chatId, `Поздравляю с победой! Игра окончена :)`);
      } else if (playerHasWon == `no`) {
        bot.sendMessage(chatId, `Попытки кончились :( Загаданное слово: ${word}`);
      }
      console.log(`finished`);
      return;
    }
  });

}
//GAME SCRIPT END----------------------------------------------------

//BOT
const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/start/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  console.log(match);

  const chatId = msg.chat.id;
  //   const resp = match[1]; // the captured "whatever"
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, `Привет! Я – бот для игры в виселицу. Для начала игры нажми /game`);
});

// Game command
bot.onText(/\/game/, (msg, match) => {

  const chatId = msg.chat.id;

  bot.sendMessage(chatId, `Начнем!`);
  getRandomWord(chatId);
  console.log(`ooooo`);
  return;
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (msg.text.toLowerCase() != `/start` && msg.text.toLowerCase() != `/game` && !isGameStarted) {
    bot.sendMessage(chatId, `Может, сыграем? Для начала новой игры напиши /game`);
  }
  // send a message to the chat acknowledging receipt of their message
  //bot.sendMessage(chatId, 'Received your message');

});

bot.on("polling_error", (err) => console.log(err));
