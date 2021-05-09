
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
      {score:0},
      {score:0},
    ],
    step: 0,
    answers: ['saat kulesi', 'saat kulesi2', 'saat kulesi3', 'saat kulesi4', 'saat kulesi5'],
    time: 125,
    openedCards: [],
    messages: [],
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }
  return;
}