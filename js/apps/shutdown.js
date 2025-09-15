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
        }
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

// Screensaver 2: Pixel Football (Restart)
function showRestartScreensaver() {
    const screensaver = document.getElementById('screensaver');
    pipesCanvas = document.getElementById('pipes-canvas');
    pipesCtx = pipesCanvas.getContext('2d');
    
    pipesCanvas.width = window.innerWidth;
    pipesCanvas.height = window.innerHeight;
    
    screensaver.classList.add('active');
    screensaver.querySelector('.screensaver-text').textContent = 'Restart Windows 98\nPixel Football\nKliknij aby kontynuować';
    
    isScreensaverActive = true;
    initFootball();
    animateFootball();
    
    // Kliknięcie wyłącza (tak jak inne screensavery)
    screensaver.addEventListener('click', hideScreensaver);
    document.addEventListener('keydown', hideScreensaver);
}

function initFootball() {
    // Piłka
    ball = {
        x: pipesCanvas.width / 2,
        y: pipesCanvas.height / 2,
        vx: 3 + Math.random() * 2,
        vy: 2 + Math.random() * 2,
        size: 8
    };
    
    // Gracze
    players = [
        {
            x: 100,
            y: pipesCanvas.height / 2,
            targetY: pipesCanvas.height / 2,
            color: '#ffffff',
            size: 12,
            speed: 2
        },
        {
            x: pipesCanvas.width - 100,
            y: pipesCanvas.height / 2,
            targetY: pipesCanvas.height / 2,
            color: '#0080ff',
            size: 12,
            speed: 2
        }
    ];
}

function animateFootball() {
    if (!isScreensaverActive) return;
    
    // Boisko
    pipesCtx.fillStyle = '#00aa00';
    pipesCtx.fillRect(0, 0, pipesCanvas.width, pipesCanvas.height);
    
    // Linie boiska
    pipesCtx.strokeStyle = '#ffffff';
    pipesCtx.lineWidth = 3;
    
    // Środkowy krąg
    pipesCtx.beginPath();
    pipesCtx.arc(pipesCanvas.width/2, pipesCanvas.height/2, 60, 0, Math.PI * 2);
    pipesCtx.stroke();
    
    // Linia środkowa
    pipesCtx.beginPath();
    pipesCtx.moveTo(pipesCanvas.width/2, 0);
    pipesCtx.lineTo(pipesCanvas.width/2, pipesCanvas.height);
    pipesCtx.stroke();
    
    // Bramki
    pipesCtx.strokeRect(0, pipesCanvas.height/2 - 40, 20, 80);
    pipesCtx.strokeRect(pipesCanvas.width - 20, pipesCanvas.height/2 - 40, 20, 80);
    
    // Aktualizuj piłkę
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Odbicia od ścian
    if (ball.y <= ball.size || ball.y >= pipesCanvas.height - ball.size) {
        ball.vy = -ball.vy;
    }
    if (ball.x <= ball.size || ball.x >= pipesCanvas.width - ball.size) {
        ball.vx = -ball.vx;
    }
    
    // Aktualizuj graczy (podążają za piłką)
    players.forEach(player => {
        player.targetY = ball.y;
        if (Math.abs(player.y - player.targetY) > player.speed) {
            player.y += player.y < player.targetY ? player.speed : -player.speed;
        }
    });
    
    // Rysuj graczy
    players.forEach(player => {
        pipesCtx.fillStyle = player.color;
        pipesCtx.fillRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);
        pipesCtx.strokeStyle = '#000000';
        pipesCtx.lineWidth = 1;
        pipesCtx.strokeRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);
    });
    
    // Rysuj piłkę
    pipesCtx.fillStyle = '#ffffff';
    pipesCtx.beginPath();
    pipesCtx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    pipesCtx.fill();
    pipesCtx.strokeStyle = '#000000';
    pipesCtx.lineWidth = 2;
    pipesCtx.stroke();
    
    animationId = requestAnimationFrame(animateFootball);
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
