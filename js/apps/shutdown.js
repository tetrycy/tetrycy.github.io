// System zamknięcia Windows 98 + 3 Screensavery
let pipesCanvas = null;
let pipesCtx = null;
let animationId = null;
let pipes = [];
let players = [];
let ball = {};
let stars = [];
let isScreensaverActive = false;

// Kolory rur (klasyczne z Windows 98)
const pipeColors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#ffffff', '#ffa500'
];

// Klasa Pipe (3D Pipes)
class Pipe {
    constructor() {
        this.x = Math.random() * 800;
        this.y = Math.random() * 600;
        this.z = Math.random() * 1000;
        this.direction = Math.floor(Math.random() * 6);
        this.color = pipeColors[Math.floor(Math.random() * pipeColors.length)];
        this.segments = [];
        this.maxSegments = 50;
        this.speed = 2 + Math.random() * 3;
        this.thickness = 8 + Math.random() * 12;
        this.turns = 0;
        this.maxTurns = 3 + Math.floor(Math.random() * 5);
    }
    
    update() {
        this.segments.push({
            x: this.x,
            y: this.y,
            z: this.z,
            direction: this.direction
        });
        
        if (this.segments.length > this.maxSegments) {
            this.segments.shift();
        }
        
        switch(this.direction) {
            case 0: this.x += this.speed; break;
            case 1: this.x -= this.speed; break;
            case 2: this.y += this.speed; break;
            case 3: this.y -= this.speed; break;
            case 4: this.z += this.speed; break;
            case 5: this.z -= this.speed; break;
        }
        
        if (Math.random() < 0.02 && this.turns < this.maxTurns) {
            this.direction = Math.floor(Math.random() * 6);
            this.turns++;
        }
        
        if (this.x < -100 || this.x > pipesCanvas.width + 100 ||
            this.y < -100 || this.y > pipesCanvas.height + 100 ||
            this.z < -100 || this.z > 1100) {
            this.reset();
        }
    }
    
    reset() {
        this.x = Math.random() * pipesCanvas.width;
        this.y = Math.random() * pipesCanvas.height;
        this.z = Math.random() * 1000;
        this.direction = Math.floor(Math.random() * 6);
        this.color = pipeColors[Math.floor(Math.random() * pipeColors.length)];
        this.segments = [];
        this.turns = 0;
    }
    
    draw() {
        pipesCtx.strokeStyle = this.color;
        pipesCtx.fillStyle = this.color;
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const nextSegment = this.segments[i + 1];
            
            const scale = 1000 / (1000 + segment.z);
            const x = segment.x * scale;
            const y = segment.y * scale;
            const thickness = this.thickness * scale;
            
            pipesCtx.lineWidth = thickness;
            pipesCtx.lineCap = 'round';
            
            if (nextSegment) {
                const nextScale = 1000 / (1000 + nextSegment.z);
                const nextX = nextSegment.x * nextScale;
                const nextY = nextSegment.y * nextScale;
                
                pipesCtx.beginPath();
                pipesCtx.moveTo(x, y);
                pipesCtx.lineTo(nextX, nextY);
                pipesCtx.stroke();
            }
            
            pipesCtx.beginPath();
            pipesCtx.arc(x, y, thickness / 2, 0, Math.PI * 2);
            pipesCtx.fill();
