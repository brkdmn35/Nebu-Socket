var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });
  
io.on('connection', function(socket){
    console.log('a user connected');
    //Taking username
    socket.on('joined',function (name) {
        this.name = name;
        socket.broadcast.emit('broadcast',name +' joined to Room!');
    });
    //If the user left
    socket.on('disconnect', function(){
        console.log(' disconnected');
        socket.broadcast.emit('broadcast',this.name +' left the Room!');
    });
    //Taking message
    socket.on('chat message', function(data){
        console.log(data);
        console.log(data.username +' : ' + data.message);
        io.emit('chat message', data.username +' : ' + data.message);
    });
    socket.on('typing',function (name) {
        console.log(name);
        console.log("typing");
        socket.broadcast.emit('typing',name +' is typing!');
    })
});

http.listen(process.env.PORT || 5000, function(){
    console.log('listening on *:3000');
});