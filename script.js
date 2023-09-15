window.addEventListener('load', function(){
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 146*3;
    canvas.height = 248*3;


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
            Tags list to create groups of Actors
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
            this.tags = [];
        }
        // Draws the sprite with the info of the actor, gets called every frame
        draw(context){
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
        // Adds tag to tag list for grouping
        addTag(tag){
            this.tags.push(tag);
        }
        // returns index of passed in tag within the tag list
        // will return -1 if it does not exist with the list
        hasTag(tag){
            return this.tags.indexOf(tag);
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
            this.lives = 3;
            this.inventory = 0;
        }
        update(scene){
            this.speedX = 0;
            this.speedY = 0;

            if(scene.keys.includes('w')) this.speedY += -this.maxSpeed;
            if(scene.keys.includes('a')) this.speedX += -this.maxSpeed;
            if(scene.keys.includes('s')) this.speedY += this.maxSpeed;
            if(scene.keys.includes('d')) this.speedX += this.maxSpeed;
            
            this.y += this.speedY;
            this.x += this.speedX;

            if(this.x > canvas.width - 15) this.x = canvas.width - 15;
            else if(this.x < 0) this.x = 0;

        }
    }

    /*
        Trash class inherits from actor and is used for the trash object seen in game
        Objects of this class will slowly fall down the scene, then delete themsekves once they get to the bottom 
    */
    class Trash extends Actor{
        constructor(x,y,sprite){
            super(x,y,sprite);
        }
        update(scene){
            this.y += 1;
            if(this.y > 700){
                this.markedForDeletion = true;
                console.log("Removed");
            }
        }
    }

    /*
        Class containing all Actor in the world during runtime, aswell as trigging their logic and draw calls
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

    }
    
    // Declaration and initialization of constant game objects
    const level1 = new Scene(canvas.width,canvas.height);
    const player = new Player(100,100,document.getElementById("playertexture"));

    level1.addActor(player);

    var intervalId = setInterval(function() {
        console.log("Called");
        level1.addActor(new Trash(200,20,document.getElementById("trashtexture")).addTag("Trash"));    
    }, 5000);


    // main game loop
    function game(){
        // Graphics
        ctx.clearRect(0,0,canvas.width,canvas.height);
        level1.update();
        level1.draw(ctx);

        // Detect Player collision with trash
        level1.actors.forEach(actor =>{
            if(actor.hasTag("Trash")){
                if(actor.isColliding(player) && player.inventory < 10){
                    actor.markedForDeletion = true;
                    player.inventory++;
                }
            }
        });

        requestAnimationFrame(game);
    }
    game();
});
