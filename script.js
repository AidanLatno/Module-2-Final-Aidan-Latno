window.addEventListener('load', function(){
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 146*3;
    canvas.height = 248*3;
    let lives = 3;


    /*
        This class detects and logs input
        Every Scene will have an instance of an InputHandler
        The InputHandler will log any key presses and log them in their Scene's "keys" list and remove them on key up
    */
    class InputHandler {
        constructor(scene){
            this.scene = scene;
            window.addEventListener('keydown', event => {
                if(this.scene.keys.indexOf(event.key) === -1){
                    this.scene.keys.push(event.key);
                }
            });
            window.addEventListener('keyup', event =>{
                if(this.scene.keys.indexOf(event.key) > -1){
                    this.scene.keys.splice(this.scene.keys.indexOf(event.key),1);
                }
            });
        }

    }

    /*
        Base class for any object that exists within the scene(game)
        Contains:
            Methods to detect for collision with other Actors
            Position, Height, Width, Speed
            Deletion flag that tells the scene to delete the Actor from itself when set to true
    */
    class Actor{
        constructor(x,y,sprite){
            this.x = x;
            this.y = y;
            this.width = 96;
            this.height = 96;
            this.sprite = sprite;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.markedForDeletion = false;
        }
        // Draws the sprite with the info of the actor, gets called every frame
        draw(context){
            if(this.sprite != null)
                context.drawImage(this.sprite,this.x,this.y,this.width,this.height);
        }
        // contains logic for Actor, should be overriden, gets called every frame
        update(){
            this.x += this.speedX;
            this.y += this.speedY;
        }
        // Returns true if the actor passed in is colliding with this
        isColliding(actor){
            return !(
                ((this.y + this.height) < (actor.y)) ||
                (this.y > (actor.y + actor.height)) ||
                ((this.x + this.width) < actor.x) ||
                (this.x > (actor.x + actor.width))
            );
        }
    }

    /*
        Main Player class, inherits from Actor
        Contains movement/input logic for the player
    */
    class Player extends Actor{
        constructor(x,y,sprite){
            super(x,y,sprite);
            this.height = 84;
            this.width = 36;
            this.score = 0;
            this.inventory = 0;
        }
        update(scene){
            this.speedX = 0;
            this.speedY = 0;

            if(lives <= 0) return; // Freezes game when you lose

            if(scene.keys.includes('w')) this.speedY += -this.maxSpeed;
            if(scene.keys.includes('a')) this.speedX += -this.maxSpeed;
            if(scene.keys.includes('s')) this.speedY += this.maxSpeed;
            if(scene.keys.includes('d')) this.speedX += this.maxSpeed;
            if(scene.keys.includes('i')){
                console.log(this.x);
                console.log(this.y);
            }
            
            this.y += this.speedY;
            this.x += this.speedX;

            if(this.x > canvas.width - 35) this.x = canvas.width - 35;
            else if(this.x < 0) this.x = 0;
        }
        updateSprite(){
            switch(this.inventory){
                case 0:
                    this.sprite = document.getElementById("playertexture1");
                    break;
                case 1:
                case 2:
                case 3:
                    this.sprite = document.getElementById("playertexture2");
                    break;
                case 4:
                case 5:
                case 6:
                    this.sprite = document.getElementById("playertexture3");
                    break;
                case 7:
                case 8:
                case 9:
                    this.sprite = document.getElementById("playertexture4");
                    break;
                case 10:
                    this.sprite = document.getElementById("playertexture5");
                    break;
            }
        }
    }

    /*
        Trash class inherits from actor and is used for the trash object seen in game
        Objects of this class will slowly fall down the scene, then delete themselves once they get to the bottom and take 1 life away
    */
    class Trash extends Actor{
        constructor(x,y,sprite){
            super(x,y,sprite);
        }
        update(scene){
            if(lives <= 0) return; // Freezes game when you lose

            this.y++;
            if(this.y > 700){
                this.markedForDeletion = true;
                lives--;
            }
        }
    }

    /*
        Fish class inherits from actor and is used for the fish object seen in game
        Objects of this class will slowly fall down the scene, then delete themselves once they get to the bottom
        When the player collides with a fish, it will knock all trash out of their boat back into the water
    */
    class Fish extends Actor{
        constructor(x,y,sprite){
            super(x,y,sprite);
            this.width /= 2;
        }
        update(scene){
            if(lives <= 0) return; // Freezes game when you lose

            this.y += 2;
            if(this.y > 700){
                this.markedForDeletion = true;
            }
        }
    }

    /*
        Class containing all Actor in the world during runtime, as well as trigging their logic and draw calls
        Also contains input que and methods to remove/add Actors into the scene
    */
    class Scene {
        constructor(width,height){
            this.width = width;
            this.height = height;
            this.actors = [];
            this.input = new InputHandler(this);
            this.keys = [];
        }
        update(){
            this.actors.forEach(actor =>{
                actor.update(this);
                if(actor.markedForDeletion === true){
                    var index = this.actors.indexOf(actor);
                    this.actors.splice(index,1);
                }
            });
        }
        draw(context){
            this.actors.forEach(actor =>{
                actor.draw(context);
            });
        }
        addActor(actor){
            this.actors.push(actor);
        }
        // Takes info from an actor and makes a new one based on that
        addNewActor(actor){
            this.actors.push(new Actor(actor.x, actor.y, actor.sprite));
        }
        addNewTrash(actor){
            this.actors.push(new Trash(actor.x, actor.y, actor.sprite));
        }
        addNewFish(actor){
            this.actors.push(new Fish(actor.x, actor.y, actor.sprite));
        }
    }

    // Declaration and initialization of constant game objects
    let level1 = new Scene(canvas.width,canvas.height);
    let player = new Player(100,100,document.getElementById("playertexture1"));
    let bin = new Actor(400,600,null);
    let trash = new Trash(200,20,document.getElementById("trashtexture1"));
    let fish = new Fish(200,20,this.document.getElementById("fishtexture1"));
    let heart1 = new Actor((canvas.width/2)-60,20,document.getElementById("fullhearttexture"));
    let heart2 = new Actor((canvas.width/2)-20,20,document.getElementById("fullhearttexture"));
    let heart3 = new Actor((canvas.width/2)+20,20,document.getElementById("fullhearttexture"));
    let loseMessage = new Actor((canvas.width/2)-150,canvas.height/2-150,document.getElementById("losetexture"));
    loseMessage.height = 300;
    loseMessage.width = 300;
    heart1.height = 40;
    heart1.width = 40;
    heart2.height = 40;
    heart2.width = 40;
    heart3.height = 40;
    heart3.width = 40;

    level1.addActor(player);
    level1.addActor(bin);
    level1.addActor(heart1);
    level1.addActor(heart2);
    level1.addActor(heart3);

    // Spawn trash periodically
    var trashSpawnID = setInterval(function() {
        trash.x = Math.floor(Math.random() * 370);
        
        if(Math.floor(Math.random() * 2) === 1) trash.sprite = document.getElementById("trashtexture1");
        else trash.sprite = document.getElementById("trashtexture2");

        level1.addNewTrash(trash);
    }, 1500);

    // Spawn fish periodically
    var trashSpawnID = setInterval(function() {
        fish.x = Math.floor(Math.random() * 370);
        
        if(Math.floor(Math.random() * 2) === 1) fish.sprite = document.getElementById("fishtexture1");
        else fish.sprite = document.getElementById("fishtexture2");

        level1.addNewFish(fish);
    }, 1500);

    // Empty Trash when near bin periodically
    var trashDepositID = setInterval(function() {
        // Player and bin collision
        if(player.isColliding(bin) && player.inventory > 0){
            player.score += 10;
            player.inventory--;
            player.updateSprite();
        }
    }, 200);

    // main game loop
    function game(){
        // Canvas Graphics
        ctx.clearRect(0,0,canvas.width,canvas.height);
        level1.update();
        level1.draw(ctx);

        // Detect Player collision with trash
        level1.actors.forEach(actor =>{
            if(actor instanceof Trash){
                if(actor.isColliding(player) && player.inventory < 10){
                    actor.markedForDeletion = true;
                    player.inventory++;
                    player.updateSprite();
                }
            }
        });

        // Update sprites for hearts to display number of lives
        switch(lives){
            case 0:
                heart3.sprite = document.getElementById("emptyhearttexture");
            case 1:
                heart2.sprite = document.getElementById("emptyhearttexture");
            case 2:
                heart1.sprite = document.getElementById("emptyhearttexture");
        }

        // Echo score to html tags
        document.getElementById('score').innerHTML = player.score;

        if(lives <= 0 && !level1.actors.includes(loseMessage)){
            level1.addActor(loseMessage);
            clearInterval(trashSpawnID);
            clearInterval(trashDepositID);
        }


        requestAnimationFrame(game);
    }
    game();
});