const { initGame, gameLoop } = require('./game');
const { makeid } = require('./utils');


var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let gameRooms = [];
var users = {};
const clientRooms = {};
const state = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.use((socket, next) => {
    const header = socket.handshake.headers.authorization;
    console.log('auth', socket.id, socket.handshake.headers.name);
    if (header) {
        console.log(users[socket.id], socket.handshake.headers.name)
        if (users[socket.id] && users[socket.id].name != socket.handshake.headers.name) {
            console.log('varmış', users);
            next(new Error("unknown user"));
        } else {
            console.log('geldi');
            next();
        }

    } else {
        console.log('varmış', users);
        next(new Error("unknown user"));
    }

});

io.on('connection', function (socket) {
    console.log('a user connected', socket.id);
    console.log('odalar', socket.id, io.sockets.adapter.rooms);
    socket.leave(socket.id)
    console.log('bağlı socketler', Object.keys(io.sockets.sockets));

    socket.type = 'user';
    users[socket.id] = {
        name: socket.handshake.headers.name ? socket.handshake.headers.name : '',
        token: socket.handshake.headers.authorization ? socket.handshake.headers.authorization : ''
    }
    //If the user left
    socket.on('disconnect', function () {
        delete users[socket.id];
        console.log(' disconnected');
    });

    socket.on('message', receivedMessage);

    socket.on('search-game', function () {
        console.log('user list', users);
        const rooms = io.sockets.adapter.rooms;
        let gameId = '';
        let socketId = '';
        socket.name = users[socket.id].name;
        console.log('user came', socket.name);

        if (rooms) {
            console.log('odalar', rooms);
            for (var room in rooms) {
                console.log('kontrol oda', room, rooms[room], rooms[room].length, (rooms[room].length == 1));
                if (rooms[room].length == 1) {
                    console.log('room kontrol', room, clientRooms);
                    gameId = room;
                    break;
                }
            }
            console.log('connecting to', gameId);
        }

        if (gameId) {
            joinGame(gameId);
        } else {
            createGame();
        }
    });

    function createGame() {
        let gameId = makeid(5);
        clientRooms[socket.id] = gameId;
        socket.emit('gameCode', gameId);

        state[gameId] = initGame();

        socket.join(gameId);
        socket.number = 1;
        socket.emit('init', 1);

        socket.on('leave-game', function () {
            console.log('game deleted', gameId);
            io.of('/').in(gameId).clients((error, socketIds) => {
                if (error) throw error;

                socketIds.forEach(socketId => { io.sockets.sockets[socketId].leave(gameId) });

            });
            delete state[gameId];
            delete clientRooms[socket.id]
        });
    }

    function joinGame(gameId) {
        const room = io.sockets.adapter.rooms[gameId];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        console.log('joining', numClients);
        if (numClients === 0) {
            socket.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            socket.emit('tooManyPlayers');
            return;
        }

        clientRooms[socket.id] = gameId;

        socket.join(gameId);
        socket.number = 2;
        socket.emit('init', 2);
        socket.in(gameId).emit('init', 2);

        console.log('trying', room)

        startGameInterval(gameId);
    }

    function startGameInterval(gameId) {

        const intervalId = setInterval(() => {
            const winner = gameLoop(state[gameId]);

            if (!state[gameId]) {
                clearInterval(intervalId);
                return;
            }

            state[gameId].time -= 1;

            emitGameState(gameId, state[gameId])

            if (!winner) {

            } else {
                emitGameOver(gameId, winner);
                state[gameId] = null;
                clearInterval(intervalId);
            }
        }, 1000);
    }

    function receivedMessage(message) {
        // Send this event to everyone in the gameId.
        const gameId = clientRooms[socket.id];
        if (!gameId || !message) {
            return;
        }
        const gameState = state[gameId];


        if (message) {
            if (gameState.answers[gameState.step] == message) {
                console.log('doğru cevap a.qqq');
                state[gameId].messages.push({ user: socket.name, text: message, status: 'win' })
                nextRound(gameId);
            } else {
                state[gameId].messages.push({ user: socket.name, text: message, status: null })
            }
        }
        io.sockets.in(gameId)
            .emit('messageReceived', state[gameId].messages);
    }

    function nextRound(gameId) {

        state[gameId].step += 1;
        state[gameId].players[(socket.number - 1)].score += 1;

        io.sockets.in(gameId)
            .emit('nextRound', {
                players: state[gameId].players
            });
    }

    function emitGameState(gameId, gameState) {
        // Send this event to everyone in the gameId.
        io.sockets.in(gameId)
            .emit('gameState', {
                time: gameState.time
            });
    }

    function emitGameState(gameId, gameState) {
        // Send this event to everyone in the gameId.
        io.sockets.in(gameId)
            .emit('gameState', {
                time: gameState.time
            });
    }

    function emitGameOver(gameId, winner) {
        io.sockets.in(gameId)
            .emit('gameOver', JSON.stringify({ winner }));
    }

});
var server_port = 3000;

http.listen(server_port, function () {
    console.log('listen nebu socket *:', server_port);
});