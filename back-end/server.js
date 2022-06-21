const { initGame, gameLoop, getUpdareVelocity } = require("./game");
const { FRAME_RATE } = require("./constans");
const makeId = require("./utils");

const state = {};
const clientRooms = {};

const io = require("socket.io")("", {
  cors: {
    origin: "https://prismatic-dragon-121dce.netlify.app",
    credentials: true,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

io.on("connection", (client) => {
  client.on("keyDown", keyDownHandler);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  function handleJoinGame(gameCode) {
    let room = io.sockets.adapter.rooms.get(gameCode);
    const id = [...room][0];

    let numClients;
    if (room) {
      numClients = io.sockets.adapter.rooms.get(id).size;
    }

    if (numClients === 0) {
      client.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      client.emit("fullGame");
      return;
    }

    clientRooms[client.id] = gameCode;
    client.join(gameCode);
    client.number = 2;
    client.emit("init", 2);
    console.log("new session");
    startGmaeInterval(gameCode);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);
    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  function keyDownHandler(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
    }

    const vel = getUpdareVelocity(
      keyCode,
      state[roomName].players[client.number - 1]
    );

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGmaeInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
      io.socketsLeave(roomName);
    }
  }, 1000 / FRAME_RATE);

  function emitGameState(roomName, gameState) {
    io.sockets.in(roomName).emit("gameState", JSON.stringify(gameState));
  }

  function emitGameOver(roomName, winner) {
    io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
  }
}

io.listen(process.env.PORT || 3000);
