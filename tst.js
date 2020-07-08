//jshint esversion:6
const TelegramBot = require('node-telegram-bot-api');
const https = require("https");
const bodyParser = require("body-parser");

const token = '1242747798:AAFSfYmjZ5Ja9cV1r00nwD8V8UqYjN-IZYA';

let gameData = {
  //number: 0,
  word: null,
  isStarted: false,
  isFinished: false,
  wrongLetters: [],
  triedLetters: [],
  playerHasWon: null,
  answerArray: [],
};

//GAME SCRIPT----------------------------------------------------
function getRandomWord(chatId, gameData) {
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
      gameData.word = synonymsArray[randomSynonymNumber];
      hangmanGame(chatId, gameData);
      return;
    });
  });
}
// Main game function
function hangmanGame(chatId, gameData) {
  gameData.isStarted = true;
  gameData.isFinished = false;
  gameData.wrongLetters = [];
  gameData.triedLetters = [];
  gameData.playerHasWon = null;
  gameData.answerArray = [];

  let word = gameData.word;

  for (let i = 0; i < word.length; i++) {
    gameData.answerArray[i] = `_`;
    if (word[i] == ` `) {
      gameData.answerArray[i] = ` `;
    } else {
      gameData.answerArray[i] = `_`;
    }
  }
  /////
  bot.sendMessage(chatId, `Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`);
  bot.sendMessage(chatId, `${gameData.answerArray.join(` `)} , неподошедшие буквы: [${gameData.wrongLetters.join(`,`)}] Попыток осталось: ${10 - gameData.wrongLetters.length}`);
  bot.on('message', (msg) => {
    let guess = msg.text.toLowerCase();
    if (gameData.isStarted && !gameData.isFinished) {
      if (guess == null) {
        //break;
      } else if (guess == `стоп`) {
        bot.sendMessage(chatId, `Игра завершена. Чтобы начать заново, напиши "/game"`);
        //gameData.isStarted = false;
        gameData.isFinished = true;
        //break;
      } else if (guess.length > 1) {
        if (guess == word) {
          bot.sendMessage(chatId, `Вау, ты угадал слово целиком!`);
          gameData.isFinished = true;
          //gameData.isStarted = false;
          gameData.playerHasWon = `yes`;
        } else {
          bot.sendMessage(chatId, `Неверно! Попробуй еще или напиши одну букву`);
        }
      } else {
        let isAlreadyTried = false;
        for (let letter of gameData.triedLetters) {
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
              gameData.answerArray[j] = guess;
              // console.log(gameData.answerArray);
              // console.log(guess);
              gameData.triedLetters.push(guess);
              if (gameData.answerArray.join(``) == word) {
                gameData.isFinished = true;
                gameData.playerHasWon = `yes`;
              }
            }
          }
          if (!letterIsRight) {
            gameData.wrongLetters.push(guess);
            gameData.triedLetters.push(guess);
            if (gameData.wrongLetters.length == 10) {
              gameData.isFinished = true;
              //gameData.isStarted = false;
              gameData.playerHasWon = `no`;
            }
          }
        }
        bot.sendMessage(chatId, `${gameData.answerArray.join(` `)} , неподошедшие буквы: [${gameData.wrongLetters.join(`,`)}] Попыток осталось: ${10 - gameData.wrongLetters.length}`);
      }

      //let guess = prompt(`Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`).toLowerCase();
      //bot.sendMessage(chatId, `Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`);
    }
    if (gameData.isFinished && gameData.isStarted) {
      // gameData.isStarted = false;
      // gameData.isFinished = false;
      if (gameData.playerHasWon == `yes`) {
        bot.sendMessage(chatId, `Поздравляю с победой! Игра окончена :)`);
        bot.sendMessage(chatId, `Игра завершена. Чтобы начать заново, напиши "/game"`);
      } else if (gameData.playerHasWon == `no`) {
        bot.sendMessage(chatId, `Попытки кончились :( Загаданное слово: ${word}`);
        bot.sendMessage(chatId, `Игра завершена. Чтобы начать заново, напиши "/game"`);
      }
      console.log(`finished`);
      // delete gameData.isStarted;
      // delete gameData.isFinished;
      // delete gameData.wrongLetters;
      // delete gameData.triedLetters;
      // delete gameData.playerHasWon;
      // delete gameData.answerArray;
      gameData = {};
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
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Привет! Я – бот для игры в виселицу. Для начала игры нажми /game`);
});

// Game command
bot.onText(/\/game/, (msg, match) => {

  const chatId = msg.chat.id;

  bot.sendMessage(chatId, `Начнем!`);
  let newGame = Object.assign({}, gameData);
  var kek = false;
  getRandomWord(chatId, newGame);
  console.log(`ooooo`);
  // Object.freeze(newGame);
  return;
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  // if (msg.text.toLowerCase() != `/start` && msg.text.toLowerCase() != `/game` && !kek) {
  //   bot.sendMessage(chatId, `Может, сыграем? Для начала новой игры напиши /game`);
  // }
  // send a message to the chat acknowledging receipt of their message
  //bot.sendMessage(chatId, 'Received your message');

});

bot.on("polling_error", (err) => console.log(err));
