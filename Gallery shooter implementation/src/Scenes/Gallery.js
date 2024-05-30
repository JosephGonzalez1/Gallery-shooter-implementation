class Gallery extends Phaser.Scene {
    graphics;
    curve;
    path;

    constructor() {
        super("Gallery");
        this.my = {sprite: {}};  

    this.aKey = null;
    this.dKey = null;
    this.sKey = null;
    this.spaceKey = null;

    this.my.sprite.bullets = [];
    this.maxBullets = 2;
    this.HealthPoints = 5;

    this.myScore = 0;

    this.bulletActive = false;
    this.bomberActive = false;
    this.normalfighterActive = false;
    this.gameOn = false;

    this.enemiesPath = [13, 191,
        34, 743,
        70, 742,
        147, 205,
        203, 207,
        233, 734,
        303, 732,
        365, 213,
        434, 213,
        414, 720,
        469, 720,
        562, 208,
        623, 211,
        602, 713,
        676, 709,
        729, 206,
        791, 206,
        801, 716,
        872, 709,
        972, 207,
        ]
    this.curve = new Phaser.Curves.Spline(this.enemiesPath);
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        this.load.setPath("./assets/");

        // player plane
        this.load.image("playerPlane", "ship_0002.png");

        // player bullet
        this.load.image("playerBullet", "tile_0000.png");

        // bomber
        this.load.image("bomber", "ship_0001.png");

        // fighter
        this.load.image("fighter","ship_0009.png");

        // game over screen
        this.load.image("screen","tile_0010.png")

        // audio for game
        this.load.audio("shot", "footstep_carpet_001.ogg");
        this.load.audio("deadEnemy", "impactPlate_medium_004.ogg");
        this.load.audio("playerDamage", "footstep_snow_000.ogg");
        this.load.audio("gameOver", "footstep_snow_000.ogg");
    }

    create() {
        let my = this.my;   // create an alias to this.my for readability

        // player plane that can shoot and move left and right
        my.sprite.playerPlane = this.add.sprite(game.config.width/2, game.config.height - 60, "playerPlane");
        my.sprite.playerPlane.setScale(3)

        // keys being used by player
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // enemy bomber with diamond like path
        my.sprite.bomber = this.add.follower(this.curve, 10, 10, "bomber");
        my.sprite.bomber.setScale(3);
        my.sprite.bomber.visible = false

        //fighter that randomly appears at different horizontal areas and falls down towards the player
        my.sprite.normalfighter = this.add.follower(this.curve, 10, 10, "fighter")
        my.sprite.normalfighter.setScale(3);
        my.sprite.normalfighter.visible = false

        // speeds for player and bullets
        this.playerSpeed = 5
        this.bulletSpeed = 30

        // end game over screen that that shows up when the player loses all of their Health
        my.sprite.endscreen = this.add.sprite(game.config.width/2, game.config.height/2, "screen")
        my.sprite.endscreen.setScale(10)
        my.sprite.endscreen.visible = false

        document.getElementById('description').innerHTML = '<h2>To start the game press "S".<h2>';
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability

        // parameters for the paths for the enemies
        var param = {
            from: 0,
            to: 1,
            delay: 0,
            duration: 10000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: false,
            rotateToPath: false,
            rotationOffset: 0
        };

        // if gameOn is false, create the s button to allow the player to start the game. when the s button is pressed set gameOn to true
        if (this.sKey.isDown) {
            if (this.gameOn == false) { 
                my.sprite.playerPlane.visible = true              
                this.myScore = 0;
                this.HealthPoints = 5;
                my.sprite.bomber.visible = true
                my.sprite.normalfighter.visible = true
                my.sprite.endscreen.visible = false
                document.getElementById('description').innerHTML = '<h2 style="display: inline;">Shoot at the bombers and the fighters to destroy them. Avoid getting hit by the fighters.</h2>' + '<h1 style="display: inline;"> Health: ' + this.HealthPoints + '</h1>' + '<h1 style="display: inline;"> Score: ' + this.myScore + '</h1>' + '<br style="display: inline;">A: left | D: right | Space: fire</br>';
                this.gameOn = true;
            }  
        } 

        if (this.gameOn == true){
            // a makes the plane move left
            if (this.aKey.isDown) {
                if (my.sprite.playerPlane.x > (my.sprite.playerPlane.displayWidth/2)) {
                    my.sprite.playerPlane.x -= this.playerSpeed;
                }  
            } 

            // d makes the plane move right
            if (this.dKey.isDown) {
                if (my.sprite.playerPlane.x < (game.config.width - (my.sprite.playerPlane.displayWidth/2))) {
                    my.sprite.playerPlane.x += this.playerSpeed;
                } 
            }

            // the makes it to where the player can only shoot one shot at a time
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                if (my.sprite.bullets.length < this.maxBullets) {
                    this.sound.play("shot", {
                        volume: 1   
                    });
                    my.sprite.bullets.push(this.add.sprite(
                        my.sprite.playerPlane.x, my.sprite.playerPlane.y-(my.sprite.playerPlane.displayHeight/2), "playerBullet")
                    );
                }
            }

            // bullets will be removed when they leave the screen or hit a plane as well as clean out the array fof the bullets
            my.sprite.bullets = my.sprite.bullets.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

            

            // enemy that goes up and down trying to dodge player bullets
            if (this.bomberActive == false) {
                my.sprite.bomber.x = Math.random()*this.enemiesPath[0];
                my.sprite.bomber.y = Math.random()*this.enemiesPath[1];
                my.sprite.bomber.startFollow(param);
                my.sprite.bomber.visible = true;
                this.bomberActive =true;
            }

            // enemy that goes up and down trying to hit the player
            if (this.normalfighterActive == false) {
                my.sprite.normalfighter.x = this.enemiesPath[0];
                my.sprite.normalfighter.y = this.enemiesPath[1];
                my.sprite.normalfighter.startFollow(param);
                my.sprite.normalfighter.visible = true;
                this.normalfighterActive = true;
            }

            

            // collisions done by using a for loop that will check all bullets when they overlap with a bomber or fighter
            for (let bullet of my.sprite.bullets) {
                if (this.collides(my.sprite.normalfighter, bullet)) {
                    bullet.y = -120;
                    this.myScore += 100;
                    this.sound.play("deadEnemy", {
                        volume: 1  
                    });
                    document.getElementById('description').innerHTML = '<h2 style="display: inline;">Shoot at the bombers and the fighters to destroy them. Avoid getting hit by the fighters.</h2>' + '<h1 style="display: inline;"> Health: ' + this.HealthPoints + '</h1>' + '<h1 style="display: inline;"> Score: ' + this.myScore + '</h1>' + '<br style="display: inline;">A: left | D: right | Space: fire</br>';
                    my.sprite.normalfighter.visible = false;
                    this.normalfighterActive = false
                }
                if (this.collides(my.sprite.bomber, bullet)) {
                    bullet.y = -120;
                    this.myScore += 300;
                    this.sound.play("deadEnemy", {
                        volume: 1  
                    });
                    document.getElementById('description').innerHTML = '<h2 style="display: inline;">Shoot at the bombers and the fighters to destroy them. Avoid getting hit by the fighters.</h2>' + '<h1 style="display: inline;"> Health: ' + this.HealthPoints + '</h1>' + '<h1 style="display: inline;"> Score: ' + this.myScore + '</h1>' + '<br style="display: inline;">A: left | D: right | Space: fire</br>';
                    my.sprite.bomber.visible = false;
                    this.bomberActive = false
                }
            }

            if (this.collides(my.sprite.playerPlane, my.sprite.normalfighter)) {
                this.sound.play("playerDamage", {
                    volume: 1 
                });
                my.sprite.normalfighter.visible = false;
                this.normalfighterActive = false
                this.HealthPoints -= 1
                document.getElementById('description').innerHTML = '<h2 style="display: inline;">Shoot at the bombers and the fighters to destroy them. Avoid getting hit by the fighters.</h2>' + '<h1 style="display: inline;"> Health: ' + this.HealthPoints + '</h1>' + '<h1 style="display: inline;"> Score: ' + this.myScore + '</h1>' + '<br style="display: inline;">A: left | D: right | Space: fire</br>';
            }

            for (let bullet of my.sprite.bullets) {
                bullet.y -= this.bulletSpeed;
            }
        }
        // when player loses make only the end game screen show up and display their score and end game message
        if (this.HealthPoints == 0) {
            for (let bullet of my.sprite.bullets) {
                bullet.y = -120;};
            this.gameOn = false;
            this.bomberActive = false;
            this.normalfighterActive = false;
            my.sprite.bomber.stopFollow();
            my.sprite.playerPlane.visible = false
            my.sprite.bomber.visible = false
            my.sprite.normalfighter.visible = false
            my.sprite.endscreen.visible = true
            document.getElementById('description').innerHTML = '<h2>You died. To restart the game press S.</h2><h1 style="display: inline;">Score:'+ this.myScore +'</h1>'
        }
            
        
    }


    // the collision check is AABB center-radius
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}

