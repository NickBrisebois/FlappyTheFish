function init() {
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update
  })
  
  var clouds = ["cloud1"];
  var dead = false;
  var clicks = 15;
  var gameStarted = false;
  var score = 0;
  var life, spriteGroup, gameLoop, scoreText, clicksText, 
  cloudemitter, logoImg, infoText, retry, randY, textStyle, 
  startupText, startbutton, grass, background, player;

  function preload() {

    this.preloadBar = this.add.sprite(300, 400, 'bird');
    this.load.setPreloadSprite(this.preloadBar);

    game.load.image('logo', 'images/logo.png');
    game.load.image('info', 'images/info.png');
    game.load.atlasJSONHash('bird', 'images/birdAnim.png', 'images/bird.json');
    game.load.image('retry', 'images/retry.png');
    game.load.image('backgroundGradient', 'images/BackgroundGradient.png');
    game.load.image('startbtn', 'images/start.png');
    game.load.image('background', 'images/background.png');
    game.load.image('clicks', 'images/heart.png');
    game.load.image('cloud1', 'images/cloud1.png');
    game.load.image('poof', 'images/poof.png');
    game.load.image('grass', 'images/grass.png');
  }

  function startGame() {
    startbutton.destroy();
    infoText.destroy();
    logoImg.destroy();

    if (gameStarted == false) {
      player = game.add.sprite(10, 10, 'bird');
      player.animations.add('fly');
      player.animations.play('fly', 15, true);
      player.body.gravity.y = 800;
      player.body.velocity.x = 300;
      player.body.collideWorldBounds = true;
      spriteGroup = game.add.group();
      game.camera.follow(player);
      game.input.onDown.add(goUp, this);
      gameStarted = true;
      clicksText.setText("Clicks LeFt: " + clicks)
      scoreText.setText("Score: " + score)
    }


    //Does some basic functions such as removing clicks and adding clouds/powerups
    clicksLoop = setInterval(function() {
      if (dead == false && game.paused == false) {
        //Adds heart powerup to game
        setTimeout(function() {

          if (randY > 300) {
            this.heartY = randY - 100;
          } else {
            this.heartY = randY + 200;
          }
          life = spriteGroup.create(player.body.x + 700, this.heartY, 'clicks');
          life.name = "clicks";
          life.body.allowGravity = false;
          life.body.customSeparateX = true;
          life.body.customSeparateY = true;
        }, 100 * Math.random());
      }
    }, 6000)

    gameLoop = setInterval(function() {
      if (dead == false && game.paused == false) {
        randY = 400 * Math.random();
        score += 1;
        scoreText.setText("Score: " + score);
        //Clears out clouds and adds new ones
        setTimeout(function() {
          cloud = spriteGroup.create(player.body.x + 700, randY, 'cloud1');
          cloud.name = "cloud";
          cloud.body.setRectangle(100, 40, 0, 0);
          cloud.body.allowGravity = false;
          cloud.body.immovable = true;

          if (spriteGroup.length >= 30 && spriteGroup.getFirstAlive().body.x <= player.body.x - 500) {
            firstAlive = spriteGroup.getFirstAlive();
            firstAlive.destroy();
          }

        }, 500 * Math.random());
      }
    }, 1000)
  }

  function restart() {
    dead = false;
    spriteGroup.removeAll();
    retry.destroy();
    player = game.add.sprite(10, 10, 'bird');
    player.animations.add('fly');
    player.animations.play('fly', 15, true);
    player.body.gravity.y = 800;
    player.body.velocity.x = 300;
    player.body.collideWorldBounds = true;
    game.camera.follow(player);
    clicks = 15;
    clicksText.setText("Clicks Left: " + clicks);
    score = 0;
    scoreText.setText("Score: " + score);
  }

  function create() {

    textStyle = {
      font: "30px '04b_19regular'",
      fill: "green",
      align: "center",
      stroke: "#aaa",
      strokeThickness: 2
    }

    game.stage.backgroundColor = "#4A92F7";
    game.world.setBounds(0, 0, 100000, 0);
    game.physics.gravity.y = 800;
    backgroundGradient = game.add.tileSprite(0, 0, game.world.bounds.width, game.cache.getImage('backgroundGradient').height, 'backgroundGradient');
    backgroundGradient.body.allowGravity = false;
    background = game.add.tileSprite(0, 50, game.world.bounds.width, game.cache.getImage('background').height, 'background');
    background.body.allowGravity = false;
    grass = game.add.tileSprite(0, 540, game.world.bounds.width, 'grass'.height, 'grass');
    grass.body.allowGravity = false;

    logoImg = game.add.sprite(200, 100, 'logo');
    logoImg.body.allowGravity = false;

    infoText = game.add.sprite(200, 350, 'info');
    infoText.body.allowGravity = false;

    startbutton = game.add.button(400, 300, 'startbtn', startGame, this, 2, 1, 0);
    startbutton.body.allowGravity = false;
    startbutton.anchor.setTo(0.5, 0.5)

    clicksText = game.add.text(0, 0, "", textStyle);
    clicksText.fixedToCamera = true;
    clicksText.cameraOffset.setTo(20, 20);

    scoreText = game.add.text(0, 0, "", textStyle);
    scoreText.fixedToCamera = true;
    scoreText.cameraOffset.setTo(20, 50);

  }

  function goUp() {
    if (clicks > 0 && !dead) {
      clicks -= 1;
      clicksText.setText("Clicks LeFt: " + clicks);
      player.body.velocity.y = -600;
    }
  }

  function die() {
    retry = game.add.button(player.body.x - 100, 250, 'retry', restart, this, 2, 1, 0);
    retry.body.allowGravity = false;
    dead = true;
    emitter = game.add.emitter(0, 0, 700);
    emitter.x = player.body.x + 30;
    emitter.y = player.body.y + 30;
    player.destroy();
    emitter.makeParticles('bird');
    emitter.gravity = 1000;
    emitter.start(true, 1000, null, 1);
  }

  function update() {

    if (gameStarted) {
      if (player.body.velocity.y < 0 && player.angle > -16) {
        player.angle -= 1;
      } else if (player.angle < 16) {
        player.angle += 1;
      }

      if (player.body.y >= 500 && !dead) {
        die();
      }

      game.physics.overlap(player, spriteGroup, collisionHandler);
    }
  }

  function collisionHandler(obj1, obj2) {
    if (obj2.name == "clicks") {
      obj2.destroy();
      clicks += 8;
      clicksText.setText("Clicks LeFt: " + clicks);
      player.body.velocity.x = 300;
    } else if (obj2.name = "cloud") {
      cloudemitter = game.add.emitter(obj2.body.x + 30, obj2.body.y + 30, 250);
      cloudemitter.makeParticles('poof');
      cloudemitter.minParticleSpeed.setTo(-200, -200);
      cloudemitter.maxParticleSpeed.setTo(200, 200);
      cloudemitter.maxParticleScale = 0.3;
      cloudemitter.minParticleScale = 0.1;
      cloudemitter.gravity = -800;
      cloudemitter.start(true, 500, false, 100);
      obj2.destroy();
      die();
    }
    player.body.velocity.x = 300;
  }

}