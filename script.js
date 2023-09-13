
window.addEventListener('load', function(){
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 146*3;
    canvas.height = 248*3;

    class InputHandler {
        constructor(scene){
            this.scene = scene;
            window.addEventListener('keydown', event => {
                console.log(event.key);
                if(( (event.key === 'w') ||
                     (event.key === 'a') ||
                     (event.key === 's') ||
                     (event.key === 'd')
                ) && this.scene.keys.indexOf(event.key) === -1){
                    this.scene.keys.push(event.key);
                } else if (event.key === ' '){
                    this.scene.player.shootTop();
                }

            });
            window.addEventListener('keyup', event =>{
                if(this.scene.keys.indexOf(event.key) > -1){
                    this.scene.keys.splice(this.scene.keys.indexOf(event.key),1);
                }
            });
        }

    }

    class Projectile {
        constructor(scene,x,y){
            this.scene = scene;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if(this.x > this.scene.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'yellow';
            context.fillRect(this.x,this.y,this.width,this.height);
        }

    }

    class Actor{
        constructor(x,y,sprite){
            this.x = x;
            this.y = y;
            this.width = 32;
            this.height = 32;
            this.sprite = sprite;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.markedForDeletion = false;
        }
        draw(context){
            //NOT WORKING
            context.drawImage(sprite,this.x,this.y,this.width,this.height);
        }
        update(){
            this.x += this.speedX;
            this.y += this.speedY;
        }
    }

    class Player extends Actor{
        constructor(x,y,sprite){
            super(x,y,sprite);
            this.height = 28;
            this.width = 12;
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

    class Trash extends Actor{
        constructor(x,y,sprite){
            super(x,y,sprite);
        }
        update(scene){
            this.y += 1;
        }
    }


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
    
    const level1 = new Scene(canvas.width,canvas.height);
    const player = new Player(100,100,null);
    const randomTrash = new Trash(250,0,null);

    level1.addActor(player);
    level1.addActor(randomTrash);


    // main animation loop
    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        level1.update();
        level1.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();
});
