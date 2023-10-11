var game = {};

game.canvas = document.getElementById("canvas");
game.ctx = game.canvas.getContext("2d");

// Define a general class used to specify game objects

class GameObject {
  constructor(x, y, width, height, color) {
    // define position
    this.x = x;
    this.y = y;

    // define size
    this.width = width;
    this.height = height;

    // define color
    this.color = color;
  }

  // draw on canvas
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  //update position of object
  update(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  //check for collisions
  collidesWith(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }
}

// bullet object
class Bullet extends GameObject {
  constructor(x, y, width, height, color, dy) {
    super(x, y, width, height, color);
    this.dy = dy;
  }

  update(dx, dy) {
    this.y += this.dy;
  }
}

class SpaceShip extends GameObject {
  constructor(x, y, width, height, color, canvasHeight) {
    super(x, y, width, height, color);
    this.canvasHeight = canvasHeight;
    this.bulletWidth = 4;
    this.bulletHeight = 8;
    this.bulletColor = "#ff7800";
    this.bullets = [];
  }

  // draw method override that allows to draw bullets
  draw(ctx) {
    super.draw(ctx);
    // draws bullets
    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].draw(ctx);
      this.bullets[i].update(0, 0);
      // checks/removes bullets that are out of bounds
      if (this.bullets[i].y < 0 || this.bullets[i].y > this.canvasHeight) {
        this.bullets.splice(i, 1);
      }
    }
  }
  shoot(dy) {
    this.bullets.push(
      new Bullet(
        this.x + this.width / 2 - this.bulletWidth / 2,
        this.y - this.bulletHeight,
        this.bulletWidth,
        this.bulletHeight,
        this.bulletColor,
        dy
      )
    );
  }
}

class Player extends SpaceShip {
  constructor(x, y, width, height, color, canvasHeight, canvasWidth) {
    super(x, y, width, height, color, canvasHeight);
    this.canvasWidth;
  }

  update(dx, dy) {
    super.update(dx, dy);

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }
}

class Asteroid {
  constructor(x, y, width, height, color, noParts) {
    this.parts = [];

    for (var i = 0; i < noParts; i++) {
      for (var j = 0; j < noParts; j++) {
        this.parts.push(
          new GameObject(x + i * width, y + j * height, width, height, color)
        );
      }
    }
  }

  // Draw another asteroid
  draw(ctx) {
    for (var i = 0; i < this.parts.length; i++) {
      this.parts[i].draw(ctx);
    }
  }

  //check for collisions
  collidesWith(obj) {
    for (var i = 0; i < this.parts.length; i++) {
      if (this.parts[i].collidesWith(obj)) {
        return true;
      }
    }
    return false;
  }
  //remove sub object on collision
  removeOnCollide(obj) {
    for (var i = 0; i < this.parts.length; i++) {
      if (this.parts[i].collidesWith(obj)) {
        this.parts.splice(i, 1);
        break;
      }
    }
  }
}

// in the future, let's try and make this a starfield
game.backgroundColor = "#000000";

// The number of parts an asteroid is made of
game.asteroidsParts = 8;
// Number of asteroids spawned in the canvas
game.noOfAsteroids = 8;
// The space between each asteroid
game.asteroidsSpace = 85;

// The number of enemies spawned on each line
game.enemiesEachLine = 20;
// The number of enemy lines
game.enemyLines = 8;
// The space between each enemy
game.enemySpace = 30;
// The time between each enemy shot
game.enemyFireRate = 1000;
// Enemy shooting timer
game.enemyFireTimer = 0;
// Enemies' direction on the x axis
game.enemyDirection = 1;
// The number of steps an enemy takes down
// on the y axis when one of the sides is reached.
game.enemyStep = 5;

// game loop function
game.update = function () {
  game.ctx.fillStyle = game.backgroundColor;
  game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  //creates player
  game.player.draw(game.ctx);

  //draw asteroids
  for (var i = 0; i < game.asteroids.length; i++) {
    game.asteroids[i].draw(game.ctx);
  }

  //draw enemies
  for (var i = 0; i < game.enemies.length; i++) {
    game.enemies[i].draw(game.ctx);
    game.enemies[i].update(game.enemyDirection, 0);
  }

  // check if player has destoyed all enemies
  if (game.enemies.length == 0) {
    game.restart();
  }

  //check if enemies are out of bounds
  if (game.enemyDirection == 1) {
    var closestToRightSideEnemy = game.enemies[0];
    for (var i = 1; i < game.enemies.length; i++) {
      if (game.enemies[i].x > closestToRightSideEnemy.x) {
        closestToRightSideEnemy = game.enemies[i];
      }
    }

    if (
      closestToRightSideEnemy.x + closestToRightSideEnemy.width >
      game.canvas.width
    ) {
      game.enemyDirection = -1;

      for (var i = 0; i < game.enemies.length; i++) {
        game.enemies[i].update(0, game.enemyStep);
      }
    }
  } else if (game.enemyDirection == -1) {
    var closestToLeftSideEnemy = game.enemies[0];
    for (var i = 1; i < game.enemies.length; i++) {
      if (game.enemies[i].x < closestToLeftSideEnemy.x) {
        closestToLeftSideEnemy = game.enemies[i];
      }
    }

    if (closestToLeftSideEnemy.x < 0) {
      game.enemyDirection = 1;
      for (var i = 0; i < game.enemies.length; i++) {
        game.enemies[i].update(0, game.enemyStep);
      }
    }
  }

  //enemy fire counter
  game.enemyFireTimer += Math.random() * 10;
  if (game.enemyFireTimer > game.enemyFireRate) {
    game.enemyFireTimer = 0;
    //fire bullet
    game.enemies[Math.floor(Math.random() * game.enemies.length)].shoot(5);
  }

  //check for player bullet collision
  for (var i = 0; i < game.player.bullets.length; i++) {
    for (var j = 0; j < game.asteroids.length; j++) {
      if (game.asteroids[j].removeOnCollide(game.player.bullets[i])) {
        game.player.bullets.splice(i, 1);
        break;
      }
    }
  }

  //check if enemy bullet collides with asteroid
  for (var i = 0; i < game.enemies.length; i++) {
    for (var j = 0; j < game.enemies[i].bullets.length; j++) {
      for (var k = 0; k < game.asteroids.length; k++) {
        if (game.asteroids[k].collidesWith(game.enemies[i].bullets[j])) {
          game.asteroids[k].removeOnCollide(game.enemies[i].bullets[j]);
          game.enemies[i].bullets.splice(j, 1);
          break;
        }
      }
    }
  }

  //check if player bullet collides with enemy
  for (var i = 0; i < game.player.bullets.length; i++) {
    for (var j = 0; j < game.enemies.length; j++) {
      if (game.enemies[j].collidesWith(game.player.bullets[i])) {
        game.enemies.splice(j, 1);
        game.player.bullets.splice(i, 1);
        break;
      }
    }
  }

  // Check if enemy bullet collides with player
  for (var i = 0; i < game.enemies.length; i++) {
    for (var j = 0; j < game.enemies[i].bullets.length; j++) {
      if (game.player.collidesWith(game.enemies[i].bullets[j])) {
        // Reset the game
        game.restart();
        break;
      }
    }
  }

  // Check if an enemy has reached the player's y position.
  for (var i = 0; i < game.enemies.length; i++) {
    if (game.enemies[i].y + game.enemies[i].height > game.player.y) {
      game.restart();
      break;
    }
  }
};

//  key events
game.keydown = function (e) {
  if (e.which == 37) {
    game.player.update(-5, 0);
  } else if (e.which == 39) {
    game.player.update(5, 0);
  } else if (e.which == 32) {
    game.player.shoot(-5);
  }
};
// inital event
game.init = function () {
  //game loop
  game.interval = setInterval(game.update, 1000 / 60);

  //player
  game.player = new Player(
    game.canvas.width / 2 - 50,
    game.canvas.height - 50,
    20,
    20,
    "#0099CC",
    game.canvas.width
  );

  //setup asteroids
  game.asteroids = [];
  for (var i = 0; i < game.noOfAsteroids; i++) {
    game.asteroids.push(
      new Asteroid(
        game.asteroidsSpace + i * game.asteroidsSpace,
        game.canvas.height - 180,
        5,
        5,
        "#ffffff",
        game.asteroidsParts
      )
    );
  }

  //setup enemies
  game.enemies = [];
  for (var i = 0; i < game.enemyLines; i++) {
    for (var j = 0; j < game.enemiesEachLine; j++) {
      game.enemies.push(
        new SpaceShip(
          game.enemySpace + j * game.enemySpace,
          game.enemySpace + i * game.enemySpace,
          20,
          20,
          "#FF0000"
        )
      );
    }
  }
};

// ends the game
game.stop = function () {
  clearInverval(game.interval);
};

// restarts the game
game.restart = function () {
  game.stop();
  game.init();
};

// Start the game on window load
window.onload = game.init;

//detect key events
window.onkeydown = game.keydown;
