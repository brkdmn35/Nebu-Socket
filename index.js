var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.use((socket, next) => {
    console.log('auth check', socket);
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        // find existing session
        const session = sessionStore.findSession(sessionID);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            return next();
        } else {
            socket.sessionID = sessionID;
            socket.userID = randomId();
            next();
        }
    } else {
        return next(new Error("invalid auth"));
    }
});


io.on('connection', (socket) => {
    console.log("Baglantı ok ", socket.userID)

    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });

});

http.listen(process.env.PORT || 5000, function () {
    console.log('listening on *:3000');
});