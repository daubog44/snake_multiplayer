const BG_COLOR = "#231f20";
const SNAKE_COLOUR = "#c2c2c2";
const FOOD_COLOUR = "#e66916";

const socket = io("http://127.0.0.1:3000");
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("fullGame", handleFullGame);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const startButton = document.getElementById("newGameButton");
const joinGameButton = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCode = document.getElementById("gameCodeDisplay");

startButton.addEventListener("click", newGame);
joinGameButton.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

let canvas,
  ctx,
  playerNumber,
  gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keyDownHandler);
  gameActive = true;
}

function keyDownHandler(e) {
  console.log(e.keyCode);
  socket.emit("keyDown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { gridsize } = state;
  const food = state.players[0].food;
  size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.X * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, "red");
}

function paintPlayer(playerState, size, SNAKE_COLOUR) {
  const { snake } = playerState;

  ctx.fillStyle = SNAKE_COLOUR;
  for (let cell of snake) {
    ctx.fillRect(cell.X * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) return;
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) return;
  data = JSON.parse(data);
  if (data.winner === playerNumber) {
    alert("YOU WIN!");
  } else {
    alert("YOU LOSE!");
  }
  gameActive = false;
}

function handleGameCode(code) {
  gameCode.innerText = code;
}

function handleUnknownGame() {
  reset();
  alert("UNKNOWN GAME CODE!");
}

function handleFullGame() {
  reset();
  alert("FULL GAME!");
}

function reset() {
  playerNumber = null;
  gameCode.innerText = "";
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
