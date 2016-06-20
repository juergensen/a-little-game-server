'use strict';
const SAT = require('sat')
const Poly = SAT.Polygon;
const Response = SAT.Response;
const Vector = SAT.Vector;
const shortid = require('shortid');

module.exports = class Entity {
  constructor(game) {
    this.game = game;
    this.id = null;
    this.pos = new Vector(Math.random()*this.game.map.width,Math.random()*this.game.map.height);
    this.dv = new Vector(0,0); // direction Vector
    this.av = new Vector(0,1);  // acceleration Vector Wohin das das raumschif guckt
    this.hitpoints = 1;
    this.mass = 1
    this.exists = true
    this.collisionDelay = 0
    this.name = 'ENTITY'

    this.hitbox = new Poly(this.pos, [
      new Vector(this.pos.x-this.game.defaultHitbox.width,this.pos.y-this.game.defaultHitbox.height),
      new Vector(this.pos.x+this.game.defaultHitbox.width,this.pos.y-this.game.defaultHitbox.height),
      new Vector(this.pos.x+this.game.defaultHitbox.width,this.pos.y+this.game.defaultHitbox.height),
      new Vector(this.pos.x-this.game.defaultHitbox.width,this.pos.y+this.game.defaultHitbox.height)
    ]);
  }
  deleteEntity() {
    if (this.hitpoints <= 0) {
      console.log(this.game.objects[this.id].constructor.name);
      if(this.game.objects[this.id].constructor.name == 'Npc') {
        this.game.soundManager("explosion")//new Audio("./sound/explosion.wav").play()
        this.game.genDebri(this.id)


        delete this.game.objects[this.id];

        var index = this.game.npcIDs.indexOf(this.id)
        if (index > -1) {
          this.game.npcIDs.splice(index, 1);
        }

      } else if (this.game.objects[this.id].constructor.name == 'Shot') {

        delete this.game.objects[this.id];

        var index = this.game.shotIDs.indexOf(this.id)
        if (index > -1) {
          this.game.shotIDs.splice(index, 1);
        }
      }
    }
  }
  update() {
    this.deleteEntity();
    if(this.exists) {
      this.pos.add(this.dv);
      this.dv.scale(0.99,0.99)
      this.hitbox.pos = this.pos;
      this.hitbox.setPoints([
        new Vector(this.pos.x-this.game.defaultHitbox.width,this.pos.y-this.game.defaultHitbox.height),
        new Vector(this.pos.x+this.game.defaultHitbox.width,this.pos.y-this.game.defaultHitbox.height),
        new Vector(this.pos.x+this.game.defaultHitbox.width,this.pos.y+this.game.defaultHitbox.height),
        new Vector(this.pos.x-this.game.defaultHitbox.width,this.pos.y+this.game.defaultHitbox.height)
      ]);
      this.hitbox.translate(-this.pos.x, -this.pos.y)
      this.hitbox.rotate(Math.atan2(this.av.y,this.av.x));
      this.hitbox.translate(this.pos.x, this.pos.y)
      if (this.pos.x < 0) {this.pos.x = 0; this.dv.x *= -1;this.av.x *= -1;}
      if (this.pos.y < 0) {this.pos.y = 0; this.dv.y *= -1;this.av.y *= -1;}
      if (this.pos.y > this.game.map.height) {this.pos.y = this.game.map.height; this.dv.y *= -1;this.av.y *= -1;}
      if (this.pos.x > this.game.map.width) {this.pos.x = this.game.map.width; this.dv.x *= -1;this.av.x *= -1;}
      this.collisionDelay--;
      if(this.collisionDelay <= 0){this.collisionDelay = 0};
    }
  }
  draw() {
    if(this.exists) {
      this.game.ctx.lineWidth="1";
      this.game.ctx.strokeStyle="black";
      this.game.ctx.translate(this.pos.x, this.pos.y);
      this.game.ctx.rotate(Math.atan2(this.av.y,this.av.x));
      this.game.ctx.drawImage(this.skin, -this.skin.width/2, -this.skin.height/2);
      if(this.showOverlay){ this.game.ctx.drawImage(this.skinOverlay, -this.skinOverlay.width/2, -this.skinOverlay.height/2);};
      this.game.ctx.rotate(-Math.atan2(this.av.y,this.av.x));
      this.game.ctx.translate(-this.pos.x, -this.pos.y);
    }
  }
}
