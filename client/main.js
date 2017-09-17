var OrignialSizeX = 1842;
var OrignialSizeY = 1014;
var setupDone = 0;
var D = [];


var images = [
  "./client/img/R_Big.png",
  "./client/img/R_Nor.png",
  "./client/img/R_Small.png",
  "./client/img/I_Big.png",
  "./client/img/I_Nor.png",
  "./client/img/I_Small.png",
  "./client/img/S_Big.png",
  "./client/img/S_Nor.png",
  "./client/img/S_Small.png"

];

var Player = function(initPack) {
  var self = {};
  self.id = initPack.id;
  self.xp = initPack.xp;
  self.name = initPack.name;
  self.lvl = initPack.lvl;
  self.pasta = initPack.pasta;
  self.cur = initPack.cur;
  self.x = initPack.x;
  self.y = initPack.y;
  self.admin = initPack.admin;
  self.selection = 16;

  self.ImageCursor = new Image();
  self.ImageCursor.src = "./client/img/" + self.cur + ".png";

  self.draw = function() {

    if (selfId != self.id) { // Si eres tu, no pintes nada en tu display. Si otra persona pasa por el bucle draw, si que vera el tema.
      if (self.cur != undefined) {

        ctx.drawImage(self.ImageCursor, self.x, self.y);

      }

    } else { // 100 % private data
      if (self.selection !== 16) {
        indicador(D[WindowSize + imagesPackNumber * 2], window.innerWidth / 2, window.innerHeight / 2, self.selection);
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
      if (pack.pasta !== undefined)
        p.pasta = pack.pasta;
      if (pack.cur !== undefined)
        p.cur = pack.cur;
      if (pack.x !== undefined)
        p.x = pack.x;
      if (pack.y !== undefined)
        p.y = pack.y;
      if (pack.selection !== undefined)
        p.selection = pack.selection;
    }
  }
});

socket.on('remove', function(data) {
  for (var i = 0; i < data.player.length; i++) {
    delete Player.list[data.player[i]];
  }
});

var Degree = 0;

var imagesPackNumber = 3; //NOmbre de images repetides amb diferents sizes
var WindowSize = 1; //0 = small 2 big
var rolling = true;

var lastMillis = 0;
var timeLeft = 0;
socket.on('roulette', function(data) {
  Degree = data;
});

socket.on('SectorWinner', function(data) {
  console.log("Ganador = " + data);
  rolling = false;
  lastMillis = millis();
  //7500
});

var millis = function() {
  var d = new Date();
  var n = d.getTime();
  return n;
}

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



    indicarTiempo(window.innerWidth / 2 - D[WindowSize].width, window.innerHeight / 2);

    for (var i in Player.list)
      Player.list[i].draw();

    indicador(D[WindowSize + imagesPackNumber], window.innerWidth / 2, window.innerHeight / 2, Degree);
    ctx.drawImage(D[WindowSize], window.innerWidth / 2 - D[WindowSize].width / 2 + 1, window.innerHeight / 2 - D[WindowSize].height / 2);
  }
}, 40);

//JO = Player.list[selfId]


var indicarTiempo = function(x, y) {
  if (rolling === false) {


    timeLeft = Math.round(Map(millis() - lastMillis, 100, 7000, 7, 0));


    switch (WindowSize) {
      case 0:
        ctx.font = "180px Segoe UI";
        y += 90;
        break;
      case 1:
        ctx.font = "90px Segoe UI";
        y += 45;
        break;
      case 2:
        ctx.font = "65px Segoe UI";
        y += 32.5;
        break;
    }
    if (timeLeft == 0) {
      ctx.fillStyle = "#F05941";
    } else {
      ctx.fillStyle = "#31BE5E";
    }

    var tempSize = ctx.measureText(timeLeft).width;
    x += tempSize;

    ctx.fillText(timeLeft, x, y);
    switch (WindowSize) {
      case 0:
        ctx.font = "80px Segoe UI";
        break;
      case 1:
        ctx.font = "40px Segoe UI";
        break;
      case 2:
        ctx.font = "28px Segoe UI";
        break;
    }

    ctx.fillText("s", x + tempSize, y);

    if (millis() - lastMillis >= 7000) {
      rolling = true;
    }
    //$("TimeLeft").style
  } else {
    switch (WindowSize) {
      case 0:
        ctx.font = "180px Segoe UI";
        y += 90;
        break;
      case 1:
        ctx.font = "90px Segoe UI";
        y += 45;
        break;
      case 2:
        ctx.font = "65px Segoe UI";
        y += 32.5;
        break;
    }
    ctx.fillStyle = "#F05941";
    var tempSize = ctx.measureText(0).width;
    x += tempSize;

    ctx.fillText(0, x, y);
    switch (WindowSize) {
      case 0:
        ctx.font = "80px Segoe UI";
        break;
      case 1:
        ctx.font = "40px Segoe UI";
        break;
      case 2:
        ctx.font = "28px Segoe UI";
        break;
    }

    ctx.fillText("s", x + tempSize, y);
  }
}
document.addEventListener('mousemove', function(e) {
  if (ready1 && ready2) {
    var radi = [];

    switch (WindowSize) {
      case 0:
        radi[0] = D[WindowSize].width / 2;
        radi[1] = D[WindowSize].width / 2 - 70;
        break;
      case 1:
        radi[0] = D[WindowSize].width / 2 - 35;
        radi[0] = D[WindowSize].width / 2;
        break;
      case 2:
        radi[0] = D[WindowSize].width / 2 - 26;
        radi[0] = D[WindowSize].width / 2;
        break;
    }
    socket.emit("mouseMoved", {
      x: e.pageX,
      y: e.pageY,
      cx: window.innerWidth / 2,
      cy: window.innerHeight / 2,
      r: radi
    });
  }
});

document.addEventListener('mousedown', function(e) {
  if (ready1 && ready2) {
    socket.emit("press", {
      x: e.pageX,
      y: e.pageY
    });
  }
});
var indicador = function(Ims, x, y, degrees) {

  ctx.save();

  ctx.translate(x, y); //origen = centre pantalla

  ctx.rotate(degrees * Math.PI / 180); //Rotem tot el canvas uns degrees


  ctx.translate(0, -D[WindowSize].width / 2 + 1);

  rotateImageCenter(Ims, 0, 0, 0.5);

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
      WindowSize = 0;

    } else if (window.innerWidth > D[1].width && window.innerHeight > D[1].height) {
      //Normal
      WindowSize = 1;

    } else if (window.innerWidth > D[2].width && window.innerHeight > D[2].height) {
      //small
      WindowSize = 2;

    } else {
      //SUPER SMALL
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
