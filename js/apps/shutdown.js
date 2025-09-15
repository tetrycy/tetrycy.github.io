// System zamknięcia Windows 98 + 3 Screensavery
let pipesCanvas = null;
let pipesCtx = null;
let animationId = null;
let pipes = [];
let toasters = [];
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
        }
    }
}

// Klasa Toaster (Flying Toasters)
class Toaster {
    constructor() {
        this.x = -100;
        this.y = Math.random() * (pipesCanvas?.height - 100) || 300;
        this.speed = 2 + Math.random() * 3;
        this.wingFlap = 0;
        this.size = 30 + Math.random() * 20;
    }
    
    update() {
        this.x += this.speed;
        this.wingFlap += 0.3;
        
        if (this.x > pipesCanvas.width + 100) {
            this.x = -100;
            this.y = Math.random() * (pipesCanvas.height - 100);
        }
    }
    
    draw() {
        pipesCtx.save();
        pipesCtx.translate(this.x, this.y);
        
        // Toster
        pipesCtx.fillStyle = '#c0c0c0';
        pipesCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        pipesCtx.strokeStyle = '#404040';
        pipesCtx.lineWidth = 2;
        pipesCtx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Skrzydła
        const wingOffset = Math.sin(this.wingFlap) * 10;
        pipesCtx.fillStyle = '#ffff80';
        
        pipesCtx.beginPath();
        pipesCtx.ellipse(-this.size/2 - 15, wingOffset, 15, 8, 0, 0, Math.PI * 2);
        pipesCtx.fill();
        pipesCtx.stroke();
        
        pipesCtx.beginPath();
        pipesCtx.ellipse(this.size/2 + 15, wingOffset, 15, 8, 0, 0, Math.PI * 2);
        pipesCtx.fill();
        pipesCtx.stroke();
        
        // Grzanka
        if (Math.random() < 0.1) {
            pipesCtx.fillStyle = '#deb887';
            pipesCtx.fillRect(-5, -this.size/2 - 15, 10, 10);
            pipesCtx.strokeRect(-5, -this.size/2 - 15, 10, 10);
        }
        
        pipesCtx.restore();
    }
}

// Klasa Star (Starfield)
class Star {
    constructor() {
        this.x = Math.random() * pipesCanvas?.width - (pipesCanvas?.width/2) || 0;
        this.y = Math.random() * pipesCanvas?.height - (pipesCanvas?.height/2) || 0;
        this.z = Math.random() * 1000;
        this.prevX = this.x;
        this.prevY = this.y;
    }
    
    update() {
        this.prevX = this.x / this.z * 500 + pipesCanvas.width/2;
        this.prevY = this.y / this.z * 500 + pipesCanvas.height/2;
        
        this.z -= 10;
        
        if (this.z <= 0) {
            this.x = Math.random() * pipesCanvas.width - pipesCanvas.width/2;
            this.y = Math.random() * pipesCanvas.height - pipesCanvas.height/2;
            this.z = 1000;
        }
    }
    
    draw() {
        const x = this.x / this.z * 500 + pipesCanvas.width/2;
        const y = this.y / this.z * 500 + pipesCanvas.height/2;
        
        const size = (1 - this.z / 1000) * 3;
        const opacity = 1 - this.z / 1000;
        
        pipesCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        pipesCtx.lineWidth = size;
        pipesCtx.beginPath();
        pipesCtx.moveTo(this.prevX, this.prevY);
        pipesCtx.lineTo(x, y);
        pipesCtx.stroke();
    }
}

// Inicjalizacja systemu
function initShutdown() {
    document.addEventListener('click', handleShutdownClick);
}

function handleShutdownClick(e) {
    if (e.target.id === 'shutdown-ok') {
        const selectedOption = document.querySelector('input[name="shutdown-type"]:checked');
        
        if (selectedOption) {
            const action = selectedOption.value;
            
            switch(action) {
                case 'shutdown':
                    startShutdownSequence();
                    break;
                case 'restart':
                    startRestartSequence();
                    break;
                case 'standby':
                    startStandbySequence();
                    break;
            }
        }
        
        closeWindow('shutdown-dialog');
    }
    
    if (e.target.id === 'shutdown-cancel') {
        closeWindow('shutdown-dialog');
    }
}

// Sekwencje zamknięcia
function startShutdownSequence() {
    document.querySelectorAll('.window.show').forEach(window => {
        window.classList.remove('show');
    });
    
    document.querySelector('.taskbar').style.display = 'none';
    document.querySelector('.desktop').style.display = 'none';
    
    setTimeout(() => {
        showScreensaver();
    }, 1000);
}

function startRestartSequence() {
    document.querySelectorAll('.window.show').forEach(window => {
        window.classList.remove('show');
    });
    
    document.querySelector('.taskbar').style.display = 'none';
    document.querySelector('.desktop').style.display = 'none';
    
    setTimeout(() => {
        showRestartScreensaver();
    }, 1000);
}

function startStandbySequence() {
    document.querySelectorAll('.window.show').forEach(window => {
        window.classList.remove('show');
    });
    
    document.querySelector('.taskbar').style.display = 'none';
    document.querySelector('.desktop').style.display = 'none';
    
    setTimeout(() => {
        showStandbyScreensaver();
    }, 1000);
}

// Screensaver 1: 3D Pipes (Shutdown)
function showScreensaver() {
    const screensaver = document.getElementById('screensaver');
    pipesCanvas = document.getElementById('pipes-canvas');
    
    if (!pipesCanvas) return;
    
    pipesCtx = pipesCanvas.getContext('2d');
    pipesCanvas.width = window.innerWidth;
    pipesCanvas.height = window.innerHeight;
    
    screensaver.classList.add('active');
    screensaver.querySelector('.screensaver-text').textContent = 'Windows 98\nWygaszacz ekranu: 3D Pipes';
    
    isScreensaverActive = true;
    
    pipes = [];
    for (let i = 0; i < 5; i++) {
        pipes.push(new Pipe());
    }
    
    animatePipes();
    
    screensaver.addEventListener('click', hideScreensaver);
    document.addEventListener('keydown', hideScreensaver);
}

function animatePipes() {
    if (!isScreensaverActive) return;
    
    pipesCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    pipesCtx.fillRect(0, 0, pipesCanvas.width, pipesCanvas.height);
    
    pipes.forEach(pipe => {
        pipe.update();
        pipe.draw();
    });
    
    animationId = requestAnimationFrame(animatePipes);
}

// Screensaver 2: Flying Toasters (Restart)
function showRestartScreensaver() {
    const screensaver = document.getElementById('screensaver');
    pipesCanvas = document.getElementById('pipes-canvas');
    pipesCtx = pipesCanvas.getContext('2d');
    
    pipesCanvas.width = window.innerWidth;
    pipesCanvas.height = window.innerHeight;
    
    screensaver.classList.add('active');
    screensaver.querySelector('.screensaver-text').textContent = 'Restartowanie systemu...\nFlying Toasters';
    
    isScreensaverActive = true;
    initToasters();
    animateToasters();
    
    setTimeout(() => {
        location.reload();
    }, 4000);
}

function initToasters() {
    toasters = [];
    for (let i = 0; i < 8; i++) {
        const toaster = new Toaster();
        toaster.x = -100 - (i * 150);
        toasters.push(toaster);
    }
}

function animateToasters() {
    if (!isScreensaverActive) return;
    
    pipesCtx.fillStyle = '#0080ff';
    pipesCtx.fillRect(0, 0, pipesCanvas.width, pipesCanvas.height);
    
    // Chmury
    pipesCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        const x = (Date.now() * 0.1 + i * 200) % (pipesCanvas.width + 100);
        const y = 100 + i * 50;
        pipesCtx.beginPath();
        pipesCtx.ellipse(x, y, 50, 25, 0, 0, Math.PI * 2);
        pipesCtx.fill();
    }
    
    toasters.forEach(toaster => {
        toaster.update();
        toaster.draw();
    });
    
    animationId = requestAnimationFrame(animateToasters);
}

// Screensaver 3: Starfield (Standby)
function showStandbyScreensaver() {
    const screensaver = document.getElementById('screensaver');
    pipesCanvas = document.getElementById('pipes-canvas');
    pipesCtx = pipesCanvas.getContext('2d');
    
    pipesCanvas.width = window.innerWidth;
    pipesCanvas.height = window.innerHeight;
    
    screensaver.classList.add('active');
    screensaver.querySelector('.screensaver-text').textContent = 'Tryb oczekiwania\nStarfield';
    
    isScreensaverActive = true;
    initStarfield();
    animateStarfield();
    
    screensaver.addEventListener('click', hideScreensaver);
    document.addEventListener('keydown', hideScreensaver);
}

function initStarfield() {
    stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push(new Star());
    }
}

function animateStarfield() {
    if (!isScreensaverActive) return;
    
    pipesCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    pipesCtx.fillRect(0, 0, pipesCanvas.width, pipesCanvas.height);
    
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    
    animationId = requestAnimationFrame(animateStarfield);
}

// Ukryj screensaver
function hideScreensaver() {
    isScreensaverActive = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    const screensaver = document.getElementById('screensaver');
    screensaver.classList.remove('active');
    
    document.querySelector('.taskbar').style.display = 'flex';
    document.querySelector('.desktop').style.display = 'block';
    
    screensaver.removeEventListener('click', hideScreensaver);
    document.removeEventListener('keydown', hideScreensaver);
}

// Inicjalizuj system zamknięcia
setTimeout(initShutdown, 200);
