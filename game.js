const { shuffleArray } = require('./utils');
const axios = require('axios').default;

module.exports = {
  initGame,
  gameLoop
}


async function initGame(initialUser) {
  const gameResult = await axios.get('https://nebu-api.yazilimhayati.com/api/v1/question/list');
  const gameDatas = gameResult.data.data;

  let selecteds = shuffleArray(gameDatas).slice(0, 10);
  let state = await createGameState(selecteds);
  state[initialUser] = 1;
  
  return state;
}

async function createGameState(selecteds) {
  return {
    players: [
      { score: 0 },
      { score: 0 },
    ],
    step: 0,
    stepCounter: 5,
    openCardIndex: 0,
    gameCards: selecteds,
    time: 125,
    openedCards: shuffleArray([...Array(25).keys()]),
    messages: [],
  };
}

function gameLoop(state) {
  if (!state) {
    return {};
  } else {
    let response = {};
    console.log('control', state.stepCounter);
    if (state.stepCounter >= 3) {
      response['card'] = state.openedCards[state.openCardIndex];
    }
    if (state.time <= 0) {
      const players = state.players;
      if (players[0].score == players[1]) {
        response['winner'] = 2;
      } else {
        response['winner'] = players[0].score > players[1].score ? 0 : 1;
      }
    }
    return response;
  }
}
