'use strict';

const SAT = require('sat')
//const Entity = require('./entity.js');
//const Player = require('./player.js')
//const Debri = require('./debri.js')
//const Scrab = require('./scrap.js')
//const Npc = require('./npc.js')
//const Shot = require('./shot.js')
const Response = SAT.Response
const Vector = SAT.Vector
const Poly = SAT.Polygon
const shortid = require('shortid');
const gameloop = require('node-gameloop');

module.exports = class Game {
  constructor(io) {
    this.io = io
    this.socketHandler()
    this.fps = 60;
    this.objects={}
    this.cache = {
      playerUpdate:{},
      deletePlayer:[]
    }
    this.pause = {state:true, reason:"Warte auf Admin...", color:"red"}
    this.map = {
      width:4000,
      height:4000
    }
  }

  socketHandler() {
    this.io.on('connection', (socket) => {
      console.log("Connected",socket.id.split("/#")[1]);
      socket.on('playerUpdate', (data) => {//{id, pos, av, dv, exists, hitpoints, mass, entity}
        this.cache.playerUpdate[data.id] = data
      })
      socket.on('joinRequest', (data) => {
        //this.startGame()
        socket.emit('joinRequestAnswer', {
          map:this.map,
          pause:this.pause
        })
      })
      socket.on('disconnect', () => {
        console.log("DISCONNECT",socket.id.split("/#")[1]);
        this.cache.deletePlayer.push(socket.id.split("/#")[1])
      })
    })
  }

  startGame(cb, reason, color) {
    if (this.pause.state) {
      this.physicLoop()
      this.pause.state = false;
      this.pause.reason = reason || "NO REASON";
      this.pause.color = color || "red";
      this.io.emit('pause', this.pause)
      try {cb(this.pause)} catch (e) {}
    } else {
      this.pause.reason = reason || this.pause.reason;
      this.pause.color = color || this.pause.color;
      this.io.emit('pause', this.pause)
      try {cb(this.pause)} catch (e) {}
    }
  }
  stopGame(cb, reason, color) {
    if (!this.pause.state) {
      gameloop.clearGameLoop(this.gameloop)
      this.pause.state = true;
      this.pause.reason = reason || "NO REASON";
      this.pause.color = color || "red";
      this.io.emit('pause', this.pause)
      try {cb(this.pause)} catch (e) {}
    } else {
      this.pause.reason = reason || this.pause.reason;
      this.pause.color = color || this.pause.color;
      this.io.emit('pause', this.pause)
      try {cb(this.pause)} catch (e) {}
    }
  }


  physicLoop() {
    this.frameCount = 0;
    this.gameloop = gameloop.setGameLoop((delta) => {
      this.frameCount++;
      console.log('Hi there! (frame=%s, delta=%s)', this.frameCount, delta);
      for (var key in this.cache.playerUpdate) {
        this.objects[key] = this.cache.playerUpdate[key]
      }
      for (var key in this.cache.deletePlayer) {
        console.log("Delete");
        delete this.objects[this.cache.deletePlayer[key]]
        delete this.cache.playerUpdate[this.cache.deletePlayer[key]]
      }
      this.cache.deletePlayer = []
    //  console.log(this.objects);
    //  console.log("----------------------------------");





      this.io.emit('drawObjects', this.objects)
    }, 1000 / this.fps);
  }

}
