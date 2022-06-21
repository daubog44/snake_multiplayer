const { GRID_SIZE } = require("./constans");

module.exports = { initGame, gameLoop, getUpdareVelocity };

function initGame() {
  const state = createGameSTate();
  randomFood(state);
  return state;
}

function createGameSTate() {
  return {
    players: [
      {
        pos: {
          X: 3,
          y: 10,
        },
        vel: {
          X: 1,
          y: 0,
        },
        snake: [
          { X: 1, y: 10 },
          { X: 2, y: 10 },
          { X: 3, y: 10 },
        ],
        food: {
          X: 7,
          y: 7,
        },
      },
      {
        pos: {
          X: 18,
          y: 10,
        },
        vel: {
          X: 0,
          y: 0,
        },
        snake: [
          { X: 20, y: 10 },
          { X: 19, y: 10 },
          { X: 18, y: 10 },
        ],
        food: {},
      },
    ],
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  // fa muovere il serpente
  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.pos.X += playerOne.vel.X;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.X += playerTwo.vel.X;
  playerTwo.pos.y += playerTwo.vel.y;

  // verifica se il serpente colpisce i lati del canvas
  if (
    playerOne.pos.X < 0 ||
    playerOne.pos.X >= state.gridsize ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y >= state.gridsize
  ) {
    return 2;
  }

  for (let cell of playerOne.snake) {
    if (playerTwo.pos.X === cell.X && playerTwo.pos.y === cell.y) {
      return 1;
    }
  }

  for (let cell of playerTwo.snake) {
    if (playerOne.pos.X === cell.X && playerOne.pos.y === cell.y) {
      return 2;
    }
  }

  if (
    playerTwo.pos.X < 0 ||
    playerTwo.pos.X >= state.gridsize ||
    playerTwo.pos.y < 0 ||
    playerTwo.pos.y >= state.gridsize
  ) {
    return 1;
  }

  // verifica se il serpente ha mangiato
  if (
    playerOne.pos.X === playerOne.food.X &&
    playerOne.pos.y === playerOne.food.y
  ) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.X += playerOne.vel.X;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
  }

  if (
    playerTwo.pos.X === playerOne.food.X &&
    playerTwo.pos.y === playerOne.food.y
  ) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.X += playerTwo.vel.X;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
  }

  // verifica se il serpente colpisce il proprio corpo
  if (playerOne.vel.X || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      if (cell.X === playerOne.pos.X && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    // crea il movimento del player
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.X || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.X === playerTwo.pos.X && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    // crea il movimento del player
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
}

function randomFood(state) {
  let food = {
    X: Math.floor(Math.random() * state.gridsize),
    y: Math.floor(Math.random() * state.gridsize),
  };

  for (let cell of state.players[0].snake) {
    if (cell.X === food.X && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.X === food.X && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.players[0].food = food;
}

function getUpdareVelocity(keyCode, state) {
  switch (keyCode) {
    case 37: {
      // left
      if (state.vel.X === 1 && state.vel.y === 0) return;

      return { X: -1, y: 0 };
    }
    case 38: {
      // down

      if (state.vel.X === 0 && state.vel.y === 1) return;
      return { X: 0, y: -1 };
    }
    case 39: {
      // right
      if (state.vel.X === -1 && state.vel.y === 0) return;
      return { X: 1, y: 0 };
    }
    case 40: {
      // up
      if (state.vel.X === 0 && state.vel.y === -1) return;
      return { X: 0, y: 1 };
    }
  }
}
