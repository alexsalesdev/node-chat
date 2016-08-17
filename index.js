var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendfile('index.html');
});

var clients = {};

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('login', function(username){
        clients[socket.id] = username;
        io.emit('login.success', JSON.stringify({"id": socket.id, "name": username}));
        io.emit('chat message', username + " has logged in.");
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        var username = clients[socket.id];
        clients[socket.id] = undefined;
        io.emit('chat message', username + " has been disconnected.");
    });

    socket.on('chat message', function(msg){
        var username;
        if (clients[socket.id]) {
            username = clients[socket.id];
        } else {
            username = "anonymous";
        }

        io.emit('chat message', username + ": " + msg);
    });
});

http.listen(3000,"0.0.0.0", function(){
    console.log('listening on *:3000');
});
