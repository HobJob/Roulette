//var mongojs = require("mongojs");
//var db = null;//mongojs('localhost:27017/myGame', ['account','progress']);


var mongoClient = require("mongojs");
var url = "mongodb://<goldworld>:<goldworld>@ds161042.mlab.com:61042/goldworld";
//var url = "mongodb://roulette:hn85YJZ9pNpaTbxiTGtMKodxJroA8JvyKlwzs8K764TdFRSUx7bMv0xupDCFMQ8wdSmAJy9WtNtSipiqoA2E1A==@roulette.documents.azure.com:10255/?ssl=true";
var db = mongoClient(url, ['accounts'], {
  authMechanism: 'ScramSHA1'
});

require('./Entity');


var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

SOCKET_LIST = {};

db.on('error', function(err) {
  console.log('database error', err)
})
db.runCommand({
  ping: 1
}, function(err, res) {
  if (!err && res.ok) console.log('we\'re up')
})

var isValidPassword = function(data, cb) {


  db.account.find({
    username: data.username,
    password: data.password
  }, function(err, res) {
    if (res.length > 0) {

      return cb(true);
    } else {
      return cb(false);
    }

  });

}

var isUsernameTaken = function(data, cb) {
  db.account.find({
    username: data.username
  }, function(err, res) {
    if (res.length > 0)
      cb(true);
    else
      cb(false);
  });
}

var addUser = function(data, cb) {
  db.account.insert({
    _id: data.email,
    email: data.email,
    username: data.username,
    password: data.password,
    color: data.color,
    age: data.age,
    xp: 0,
    team: "none",
    cur: ["cursorBasic"],
    lvl: 0
  }, function(err, doc) {
    return cb();
  });
}
var consultaInfo = function(socket, data) {
  console.log("Checking username & password");
  db.account.find({
    username: data.username,
    password: data.password
  }, function(err, res) {
    Player.onConnect(socket, res);
    console.log("User registered, going in!");
    socket.emit('signInResponse', {
      success: true
    });
  });
}


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on('signIn', function(data) {

    isValidPassword(data, function(res) {
      if (res) {
        consultaInfo(socket, data);
      } else {
        db.account.find({
          email: data.username,
          password: data.password
        }, function(err, res) {
          if (res.length > 0) {
            consultaInfo(socket, data);
          } else {
            socket.emit('signInResponse', {
              success: false
            });
          }
        });

      }

    });

  });

  socket.on('signUp', function(data) {
    isUsernameTaken(data, function(res) {
      if (res) {
        socket.emit('signUpResponse', {
          success: false
        });
      } else {
        addUser(data, function() {
          socket.emit('signUpResponse', {
            success: true
          });
        });
      }
    });
  });


  socket.on('disconnect', function() {

    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
});



setInterval(function() {
  var packs = Entity.getFrameUpdateDate();

  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('init', packs.initPack);
    socket.emit('update', packs.updatePack);
    socket.emit('remove', packs.removePack);
  }
}, 1000 / 25);
