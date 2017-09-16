var OrignialSizeX = 1842;
var OrignialSizeY = 1014;
var setupDone = 0;
var D = [];

var R = new Image();
var I = new Image();

var R_Big_S = "./client/img/R_Big.png";
var R_Nor_S = "./client/img/R_Nor.png";
var R_Small_S = "./client/img/R_Small.png";

var I_Big_S = "./client/img/I_Big.png";
var I_Nor_S = "./client/img/I_Nor.png";
var I_Small_S = "./client/img/I_Small.png";

var images = [
  "./client/img/R_Big.png",
  "./client/img/R_Nor.png",
  "./client/img/R_Small.png",
  "./client/img/I_Big.png",
  "./client/img/I_Nor.png",
  "./client/img/I_Small.png"
];

var Player = function(initPack) {
  var self = {};
  self.id = initPack.id;
  self.xp = initPack.xp;
  self.name = initPack.name;
  self.lvl = initPack.lvl;
  self.team = initPack.team;
  self.cur = initPack.cur;
  self.x = initPack.x;
  self.y = initPack.y;
  self.admin = initPack.admin;

  self.ImageCursor = new Image();
  self.ImageCursor.src = "./client/img/" + self.cur + ".png";
  self.draw = function() {

    if (selfId != self.id) {
      if (self.cur != undefined) {

        ctx.drawImage(self.ImageCursor, self.x, self.y);

      }

    }
  }

  Player.list[self.id] = self;

  return self;
}

var selfId = null;
Player.list = {};

socket.on('init', function(data) {
  if (data.selfId)
    selfId = data.selfId;

  for (var i = 0; i < data.player.length; i++) {
    new Player(data.player[i]);
  }
});

socket.on('update', function(data) {

  for (var i = 0; i < data.player.length; i++) {
    var pack = data.player[i];
    var p = Player.list[pack.id];
    if (p) {

      if (pack.xp !== undefined)
        p.xp = pack.xp;
      if (pack.lvl !== undefined)
        p.lvl = pack.lvl;
      if (pack.team !== undefined)
        p.team = pack.team;
      if (pack.cur !== undefined)
        p.cur = pack.cur;
      if (pack.x !== undefined)
        p.x = pack.x;
      if (pack.y !== undefined)
        p.y = pack.y;
    }
  }
});

socket.on('remove', function(data) {
  for (var i = 0; i < data.player.length; i++) {
    delete Player.list[data.player[i]];
  }
});

var Degree = 0;

socket.on('roulette', function(data) {
  Degree = data;
});


$(window).resize(function() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  loadImage(images);
  SelectImages();
});





setInterval(function() {

  if (ready1 && ready2) {

    if (!selfId)
      return;

    ctx.clearRect(0, 0, $("#GameCanvas").width(), $("#GameCanvas").height());

    for (var i in Player.list)
      Player.list[i].draw();

    indicador(window.innerWidth / 2, window.innerHeight / 2, Degree);
    ctx.drawImage(R, window.innerWidth / 2 - R.width / 2 + 1, window.innerHeight / 2 - R.height / 2);
  }
}, 40);

//JO = Player.list[selfId]

document.addEventListener('mousemove', function(e) {

  if (ready1 && ready2) {
    //  Degree++;
    socket.emit("mouseMoved", {
      x: e.pageX,
      y: e.pageY
    });
  }
});
var indicador = function(x, y, degrees) {

  ctx.save();

  ctx.translate(x, y); //origen = centre pantalla

  ctx.rotate(degrees * Math.PI / 180); //Rotem tot el canvas uns degrees

  if (window.innerWidth >= D[0].width && window.innerHeight >= D[0].height) {
    //Big
    ctx.translate(0, -R.width / 2 + 1);

  } else if (window.innerWidth > D[1].width && window.innerHeight > D[1].height) {
    //medium
    ctx.translate(0, -R.width / 2 + 1);
  } else {
    //small
    ctx.translate(0, -R.width / 2 + 1);
  }

  rotateImageCenter(I, 0, 0, 0.5);
  ctx.restore();

}
var rotateImageCenter = function(image, Px, Py, degrees) {
  ctx.save();
  ctx.translate(Px, Py);
  ctx.rotate(degrees * Math.PI / 180);
  ctx.drawImage(image, -Px / 2, -Py / 2);
  //return to initial state
  ctx.restore();
  ctx.translate(-Px / 2, -Py / 2);
}
var SelectImages = function() {

  if (D[0] === undefined) {

    setTimeout(function() {

      loadImage(images);
      SelectImages();

    }, 100);
  } else {

    if (window.innerWidth >= D[0].width && window.innerHeight >= D[0].height) {
      //Big

      R.src = R_Big_S;
      I.src = I_Big_S;

    } else if (window.innerWidth > D[1].width && window.innerHeight > D[1].height) {
      //Normal

      R.src = R_Nor_S;
      I.src = I_Nor_S;

    } else {
      //small

      R.src = R_Small_S;
      I.src = I_Small_S;
    }
  }

}
window.addEventListener('load', function() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  loadImage(images);
  SelectImages();
}, false);

function loadImage(images) {

  if (!images.length) {
    ready2 = 1;
    return;
  }

  // Define a "worker" function that should eventually resolve or reject the deferred object.

  function deferLoading(deferred) {
    var url = images.shift();

    var image = new Image();

    // Set up event handlers to know when the image has loaded
    // or fails to load due to an error or abort.
    image.onload = loaded;
    image.onerror = errored; // URL returns 404, etc
    image.onabort = errored; // IE may call this if user clicks "Stop"

    // Setting the src property begins loading the image.
    image.src = url;

    function loaded() {
      unbindEvents();
      // Calling resolve means the image loaded sucessfully and is ready to use.
      deferred.resolve(image);
      deferred.done(function(image) {
        D.push(image);
      });
    }

    function errored() {
      unbindEvents();
      // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
      deferred.reject(image);
    }

    function unbindEvents() {
      // Ensures the event callbacks only get called once.
      image.onload = null;
      image.onerror = null;
      image.onabort = null;
    }
  };

  var Deferred = $.Deferred(deferLoading);
  loadImage(images);

  return Deferred;
};
