//jshint esversion:6
const https = require("https");
const bodyParser = require("body-parser");

let wordsArray = [
  `house`, `cat`, `hat`, `backpack`, `car`, `stool`, `shirt`, `wardrobe`, `pillow`, `blanket`, `freedom`
];

function getRandomWord() {
  const randomNumber = Math.floor(Math.random() * wordsArray.length);
  const initialWord = wordsArray[randomNumber];
  const url = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20200705T154052Z.d247ab4b4f1f7584.52e72b4b03ab1519037d82a7c979b1872f4d3b93&lang=en-ru&text=${initialWord}`;
  https.get(url, function(response) {
    response.on("data", function(data) {
      const wordData = JSON.parse(data);
      const synonymsObjects = wordData.def[0].tr[0].syn;
      let synonymsArray = [];
      for (let index of synonymsObjects) {
        synonymsArray.push(index[`text`]);
      }
      const randomSynonymNumber = Math.floor(Math.random() * synonymsArray.length);
      const guessedWord = synonymsArray[randomSynonymNumber];
      return guessedWord;
    });
  });

}
/////
let word = getRandomWord().toLowerCase();
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
// let remainingLetters = word.length;
let wrongLetters = [];
let triedLetters = [];
let isWin = false;
let isGameFinished = false;
/////
while (!isGameFinished) {
  window.alert(`${answerArray.join(` `)} , неподошедшие буквы: [${wrongLetters.join(`,`)}] Попыток осталось: ${10 - wrongLetters.length}`);
  let guess = prompt(`Напиши букву или слово целиком! Если хочешь закончить игру, напиши "стоп"`).toLowerCase();
  if (guess == null) {
    break;
  } else if (guess == `стоп`) {
    isGameFinished = true;
    break;
  } else if (guess.length > 1) {
    if (guess == word) {
      window.alert(`Вау, ты угадал слово целиком! Поздравляю с победой! Игра окончена :)`);
    } else {
      window.alert(`Неверно! Попробуй еще`);
    }
  } else {
    let isAlreadyTried = false;
    for (let letter of triedLetters) {
      if (letter == guess) {
        isAlreadyTried = true;
        window.alert(`"Внимательнее! Эта буква уже была"`);
      }
    }
    if (!isAlreadyTried) {
      let letterIsRight = false;
      for (let j = 0; j < word.length; j++) {
        if (word[j] === guess) {
          letterIsRight = true;
          answerArray[j] = guess;
          triedLetters.push(guess);
        }
      }
      if (!letterIsRight) {
        wrongLetters.push(guess);
        triedLetters.push(guess);
        if (wrongLetters.length == 10) {
          isGameFinished = true;
          isWin = false;
        }
      }
    }
  }
}
/////
if (isWin) {
  window.alert(`Поздравляю с победой! Игра окончена :)`);
} else if (!isWin) {
  window.alert(`Попытки кончились :(
    Загаданное слово: ${word}`);
}
