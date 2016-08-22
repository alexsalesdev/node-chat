var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendfile('index.html');
});

var clients = {};
var created_rooms = {};
var sh = require("shorthash");



io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('login', function(username){
        clients[socket.id] = {"username" : username, "socket": socket};
        io.emit('login.success', JSON.stringify({"id": socket.id, "username": username}));
        io.emit('chat message', username + " has logged in.");
    });

    socket.on('create', function(){
        console.log("create room");
        var roomId = sh.unique(socket.id);
        created_rooms[roomId] = socket.id;
        console.log("roomId: " + roomId);
        io.emit('create.success', roomId);
        io.emit('chat message', clients[socket.id].username + " created a room - " + roomId);
    });

    socket.on('join', function(roomId){
        console.log("joining roomId: " + roomId);
        var serverSocketId = created_rooms[roomId];
        var serverSocket = clients[serverSocketId].socket;
        serverSocket.emit('join.success',  {"id": serverSocketId, "username": clients[serverSocketId].username});
        io.emit('chat message', clients[socket.id].username + " has joined a room - " + clients[serverSocketId].username);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        if (clients[socket.id]) {
            var username = clients[socket.id].username;
            delete clients[socket.id];
            io.emit('chat message', username + " has been disconnected.");
        }
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

    socket.on('chat privately', function(str_data){
        var data = JSON.parse(str_data);
        var client = clients[data.socketId];
        var username;
        if (clients[socket.id].username) {
            username = clients[socket.id].username;
        } else {
            username = "anonymous";
        }

        client.socket.emit('chat message', "[private: " + username + "]: " + msg);
    });
});

http.listen(3000,"0.0.0.0", function(){
    console.log('listening on *:3000');
});
