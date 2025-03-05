const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const checkBoxPatternCanvas = document.getElementById("checkBoxPatternCanvas");
const checkBoxPatternCanvasCtx = checkBoxPatternCanvas.getContext("2d");
ctx.imageSmoothingQuality = "high";
const setting_menu =  document.getElementsByClassName("setting_menu")[0];
const menu_container = document.getElementsByClassName("menu_container")[0];
const  game_over_menu = document.getElementsByClassName("game_over_menu")[0];
const currentScoreDisplay = document.getElementsByClassName("current_score_display")[0];
const soundPlay = document.getElementsByClassName("sound_play")[0];
const soundPause = document.getElementsByClassName("sound_pause")[0];
const maxRowCount = 20;
const maxColumnCount = 20;
let size = 50;
let currentRowCount , currentColumnCount; 
let fps = 7;
let interval = 1000 / fps;
let aid ;
let foodCount = 1;
let backgroundColor = {secondary : "hsl(120, 83%, 68%)", primary : "hsl(120, 55%, 48%)"};
let snake , food = [];
let currentScore = 0, highScore = 0;
const foodEatSound = new Audio("assets/sounds/Sound_crunch.wav");
const gameOverSound = new Audio("assets/sounds/game_over.wav");
let eventOccur = false;
let isAudioPlay = true;
function createImage(src){
    const tmpImg = new Image(size,size);
    tmpImg.src = src;
    return tmpImg;
}

const snakeHead_t = createImage("assets/images/snakeHead_t.png");
const snakeHead_r = createImage("assets/images/snakeHead_r.png");    
const snakeHead_l = createImage("assets/images/snakeHead_l.png");
const snakeHead_b = createImage("assets/images/snakeHead_b.png");
const snakeTail_t =  createImage("assets/images/snakeTail_t.png");  
const snakeTail_r = createImage("assets/images/snakeTail_r.png");
const snakeTail_l = createImage("assets/images/snakeTail_l.png");
const snakeTail_b = createImage("assets/images/snakeTail_b.png"); 
const snakeBody_h = createImage("assets/images/snakeBody_h.png");
const snakeBody_v = createImage("assets/images/snakeBody_v.png");
const snakeCornour_bl = createImage("assets/images/snakeCornour_bl.png");
const snakeCornour_lt = createImage("assets/images/snakeCornour_lt.png");
const snakeCornour_rt = createImage("assets/images/snakeCornour_rt.png");
const snakeCornour_tr = createImage("assets/images/snakeCornour_tr.png");

function loadData(){
    try{
        let data = localStorage.getItem("high_score");
        if(data != null){
            highScore = parseInt(data);
        }
    }catch{
        console.log("No data found");
    }
}
loadData();

function detectDevic(){
    if(/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)){
        console.log("on mobile");
        size = 40;
    }
}
detectDevic();
class Snake{
    constructor(x , y){
        this.x = x+1,
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.body = [{x : this.x-1, y : this.y},{x : this.x, y : this.y}];
        this.length =  this.body.length;
        this.direction = "right";
    }
    draw() {
        for (let i = 0; i < this.body.length; i++) {
            let x = this.body[i].x * size;
            let y = this.body[i].y * size;
            
            if (i === this.body.length - 1) { 
                switch (this.direction) {
                    case "up": ctx.drawImage(snakeHead_t, x, y, size, size); break;
                    case "down": ctx.drawImage(snakeHead_b, x, y, size, size); break;
                    case "left": ctx.drawImage(snakeHead_l, x, y, size, size); break;
                    case "right": ctx.drawImage(snakeHead_r, x, y, size, size); break;
                }
            } else if (i === 0) { 
                let next = this.body[i + 1];
                let tailDirection = (next.x > this.body[i].x) ? "left" :
                                    (next.x < this.body[i].x) ? "right" :
                                    (next.y > this.body[i].y) ? "up" : "down";
                switch (tailDirection) {
                    case "up": ctx.drawImage(snakeTail_b, x, y, size, size); break;
                    case "down": ctx.drawImage(snakeTail_t, x, y, size, size); break;
                    case "left": ctx.drawImage(snakeTail_r, x, y, size, size); break;
                    case "right": ctx.drawImage(snakeTail_l, x, y, size, size); break;
                }
            } else { 
                let prev = this.body[i - 1];
                let next = this.body[i + 1];
                
                if (prev.x === next.x) {
                    ctx.drawImage(snakeBody_v, x, y, size, size);
                } else if (prev.y === next.y) {
                    ctx.drawImage(snakeBody_h, x, y, size, size);
                } else { 
                    let cornerType = "";
                    if ((prev.x < this.body[i].x && next.y < this.body[i].y) || (next.x < this.body[i].x && prev.y < this.body[i].y)) {
                        cornerType = snakeCornour_lt;
                    } else if ((prev.y < this.body[i].y && next.x > this.body[i].x) || (next.y < this.body[i].y && prev.x > this.body[i].x)) {
                        cornerType = snakeCornour_rt;
                    } else if ((prev.y > this.body[i].y && next.x < this.body[i].x) || (next.y > this.body[i].y && prev.x < this.body[i].x)) {
                        cornerType = snakeCornour_bl;
                    } else {
                        cornerType = snakeCornour_tr;
                    }
                    ctx.drawImage(cornerType, x, y, size, size);
                }
            }
        }
    }
    update(){
        
        if (this.nextDirection) {
            this.dx = this.nextDirection.dx;
            this.dy = this.nextDirection.dy;
            this.direction = this.nextDirection.direction;
            this.nextDirection = null;
        }
        this.x += this.dx;
        this.y += this.dy;
        this.body.push({x : this.x, y : this.y});
        
        if(this.body.length > this.length){
            this.body.shift();
        }
        
        this.colison();
        this.draw()
    }
    changeDirection(dx,dy,direction){
        if(
            (this.dx === 1 && dx === -1) || (this.dx === -1 && dx === 1) ||
            (this.dy === 1 && dy === -1) || (this.dy === -1 && dy === 1)
        ){
            return;
        }
        eventOccur = true;
        //this.nextDirection = { dx, dy, direction };
        this.dx = dx;
        this.dy = dy;
        this.direction = direction;
    }
    colison(){
        
        if(this.x < 0 || this.x >= currentColumnCount || this.y < 0 || this.y >= currentRowCount)
        {
            gameOver();
        }   
        
        for(let i = 0; i < this.body.length-2; i++){
            if(this.body[i].x == this.x && this.body[i].y == this.y){
                gameOver();
            }
        }
    }
    grow(){
        this.length++;
    }
}



class Food{
    constructor(){
        this.img = new Image(size , size);
        this.img.src = "assets/images/food_animation.png";
        this.randomize();
        this.frameCount = 0;
        this.frameSize = 740 * 4;
    }
    randomize(){
        this.x = Math.floor(Math.random() * currentColumnCount);
        
        this.y = Math.floor(Math.random() * currentRowCount);
    }
    draw(){

        
        ctx.drawImage(
            this.img,
            this.frameSize * this.frameCount,
            0,
            this.frameSize,
            this.frameSize,
            this.x * size,
            this.y * size,
            size,
            size
        );
        this.frameCount++;
        if(this.frameCount >= 5){
            this.frameCount = 0;
        }
        this.checkSnakeEat();
    }
    checkSnakeEat(){
        if(this.x === snake.x && this.y === snake.y){
            this.randomize();
            snake.grow();
            currentScore++;
            currentScoreDisplay.innerText = currentScore;
            if(isAudioPlay){
                foodEatSound.currentTime = 0;
                foodEatSound.play();
            }
        }
    }
}



function gameOver(){
    if(isAudioPlay){
        gameOverSound.currentTime = 0;
        gameOverSound.play();
    }
    clearInterval(aid);
    document.getElementsByClassName("game_over_score")[0].innerText = currentScore;
    document.getElementsByClassName("high_score")[0].innerText = (highScore == 0 || currentScore > highScore ? currentScore : highScore);
    game_over_menu.classList.add("show");
    menu_container.classList.remove("hide");
    if(currentScore > highScore){
        localStorage.setItem("high_score" , currentScore);
        highScore = currentScore;
    }
}
function setCanvasSize(){
    currentRowCount = Math.min(Math.ceil(window.innerHeight / size) - 4,maxColumnCount) ;
    currentColumnCount = Math.min(Math.ceil(window.innerWidth / size) - 1 , maxRowCount) ;
    //const scaleFactor = window.devicePixelRatioo || 2;
    const scaleFactor =  3;
    canvas.height = currentRowCount * scaleFactor * size;
    canvas.width = currentColumnCount * scaleFactor * size;
    checkBoxPatternCanvas.height = currentRowCount * scaleFactor * size;
    checkBoxPatternCanvas.width = currentColumnCount * scaleFactor * size;

    
    document.getElementsByClassName("game")[0].style.width = (currentColumnCount*size) + "px";
    document.getElementsByClassName("canvas")[0].style.height = (currentRowCount*size) + "px";

    ctx.scale(scaleFactor, scaleFactor);
    checkBoxPatternCanvasCtx.scale(scaleFactor,scaleFactor);
    generateCheckBoxPattern();
}
setCanvasSize();
function generateCheckBoxPattern(){
    checkBoxPatternCanvasCtx.fillStyle = backgroundColor.secondary;
    checkBoxPatternCanvas.style.background = backgroundColor.primary;
    for(let i = 0; i <= currentColumnCount; i++){
        for(let j = 0; j <=  currentRowCount; j++){
            if((i+j) % 2 == 0){
                checkBoxPatternCanvasCtx.fillRect(i*size, j*size, size, size);
            }
        }
    }
}
function intit(){
    interval = 1000 / fps
    snake = new Snake(0,0);
    food = [];
    currentScore = 0;
    eventOccur = false;
    currentScoreDisplay.innerText = currentScore;
    for(let i = 0; i < foodCount; i++){
        food.push(new Food());
    }
    aid = setInterval(()=>{
        requestAnimationFrame(animate);
    } , interval);
}
function animate(currentTime){
     
    ctx.clearRect(0,0,currentColumnCount*size,currentRowCount*size);
    for(let i = 0; i < food.length; i++){
        food[i].draw();
    }
    if(eventOccur){
        snake.update();
    }else{
        snake.draw();
    }
}



document.getElementsByClassName("sound")[0].addEventListener("click" , ()=>{
    if(soundPlay.classList.contains("hide")){
        soundPlay.classList.remove("hide");
        soundPause.classList.add("hide");
        isAudioPlay = true;
    }else{
        soundPlay.classList.add("hide");
        soundPause.classList.remove("hide");
        isAudioPlay = false;
    }
});
document.getElementsByClassName("setting_button")[0].addEventListener("click" , ()=>{
  setting_menu.classList.add("show");
});
document.getElementsByClassName("goto_menu")[0].addEventListener("click" , ()=>{
    setting_menu.classList.remove("show");
});
[...document.getElementsByClassName("play")].forEach((e) => {
    e.addEventListener("click" , ()=>{
        playGame();
         
    });
});
document.getElementsByClassName("menu_button")[0].addEventListener("click" , ()=>{
    game_over_menu.classList.remove("show");
});
document.getElementsByClassName("reset")[0].addEventListener("click" , ()=>{
    document.forms[0].food_count[0].checked = true;
    document.forms[0].color[0].checked = true;
    document.forms[0].speed[1].checked = true;
});
function playGame(){
    [...document.forms[0].food_count].forEach((e) => e.checked == true ? foodCount = parseInt(e.value) : null);
    [...document.forms[0].speed].forEach((e) => e.checked ? fps = parseInt(e.value) : null);
    [...document.forms[0].color].forEach((e) => e.checked ? backgroundColor = JSON.parse(e.value) : null);
    if(backgroundColor.primary != "hsl(120, 55%, 48%)"){
        generateCheckBoxPattern();
    }
    menu_container.classList.add("hide");
    intit();
}



let lastX = 0, lastY = 0;
const THRESHOLD = 30; 

window.addEventListener("touchend", () => {
    lastX = 0;
    lastY = 0;
});

window.addEventListener("touchmove", (e) => {
    e.preventDefault(); 

    let touch = e.touches[0]; 

    if (lastX === 0 && lastY === 0) {
        lastX = touch.screenX;
        lastY = touch.screenY;
        return; 
    }

    let xDiff = touch.screenX - lastX;
    let yDiff = touch.screenY - lastY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {

        if (Math.abs(xDiff) >= THRESHOLD && Math.abs(yDiff) < THRESHOLD) {
            if (xDiff > 0) {
                snake.changeDirection(1, 0, "right");
            } else {
                snake.changeDirection(-1, 0, "left");
            }
            lastX = touch.screenX;
            lastY = touch.screenY; 
        }
    } else {

        if (Math.abs(yDiff) >= THRESHOLD && Math.abs(xDiff) < THRESHOLD) {
            if (yDiff > 0) {
                snake.changeDirection(0, 1, "down");
            } else {
                snake.changeDirection(0, -1, "up");
            }
            lastX = touch.screenX;
            lastY = touch.screenY; 
        }
    }
});

window.addEventListener("resize" , setCanvasSize);
window.addEventListener("keydown", function(e){

    
    if(e.key == "ArrowUp"){
        snake.changeDirection(0,-1,"up");
    }else if(e.key == "ArrowDown"){
        snake.changeDirection(0,1,"down");
    }else if(e.key == "ArrowLeft"){
        snake.changeDirection(-1,0,"left");
    }else if(e.key == "ArrowRight"){
        snake.changeDirection(1,0,"right");
    }
});