const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);



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
    }else {
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



server.listen(3000,() => {
    console.log('listening on *:300');
  });