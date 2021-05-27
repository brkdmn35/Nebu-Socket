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
    answers: ['saat kulesi', 'penguen', 'kış', 'türk kahvesi', 'mars'],
    images: [
      'https://www.kulturportali.gov.tr/repoKulturPortali/small/PetekIcon/ikons_20190913135404372.jpg',
      'https://i.pinimg.com/originals/7d/02/4c/7d024c4abab058d14edc24d29f8c5578.jpg',
      'https://blog.obilet.com/wp-content/uploads/2019/09/Courchevel-Kayak-Merkezi-Fransa.jpg',
      'https://im.haberturk.com/2020/02/07/ver1581060495/2575804_620x410.jpg',
      'https://i.sozcu.com.tr/wp-content/uploads/2021/05/17/iecrop/mars-shutterstock_16_9_1621241346-880x495.jpg'
    ],
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
