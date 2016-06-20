


var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Game = require('./lib/game.js');
var game = new Game(io)

app.get('/start/countdown/:startNumber?', function(req, res){
  countdown(req.params.startNumber)
  res.send({status:"ok", startNumber:req.params.startNumber})
});

app.get('/start/:reason?/:color?', function(req, res){
  game.startGame((reason) => {
    res.send(reason)
  },req.params.reason, req.params.color)
});
app.get('/stop/:reason?/:color?', function(req, res){
  game.stopGame((reason) => {
    res.send(reason)
  },req.params.reason, req.params.color)
});


function countdown(startNumber) {
  game.stopGame((reason) => {},startNumber, "green")
  var startNumber = startNumber || 3
  var countdown = setInterval(function () {
    if (startNumber <= 0) {
      game.startGame((reason) => {},"Loos", "green")
      clearInterval(countdown);
    } else {
      game.stopGame((reason) => {},startNumber, "green")
    }
    startNumber--;
  }, 1000)
}


http.listen(9001, function(){
  console.log('listening on *:9001');
});
