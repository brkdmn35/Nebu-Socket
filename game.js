const { shuffleArray } = require('./utils');

module.exports = {
  initGame,
  gameLoop
}

function initGame() {
  const state = createGameState()
  return state;
}

function createGameState() {
  return {
    players: [
      { score: 0 },
      { score: 0 },
    ],
    step: 0,
    stepCounter: 5,
    openCardIndex: 0,
    answers: ['saat kulesi', 'saat kulesi2', 'saat kulesi3', 'saat kulesi4', 'saat kulesi5'],
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
    if (state.stepCounter >= 5) {
      response['card'] = state.openedCards[state.openCardIndex];
      return response;
    } else {
      return {};
    }
  }
}
