// System zamknięcia Windows 98 + 3D Pipes Screensaver
let pipesCanvas = null;
let pipesCtx = null;
let animationId = null;
let pipes = [];
let isScreensaverActive = false;

// Kolory rur (klasyczne z Windows 98)
const pipeColors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#ffffff', '#ffa500'
];

class Pipe {
    constructor() {
        this.x = Math.random() * 800;
        this.y = Math.random() * 600;
        this.z = Math.random() * 1000;
        this.direction = Math.floor(Math.random() * 6); // 6 kierunków (x+,x-,y+,y-,z+,z-)
        this.color = pipeColors[Math.floor(Math.random() * pipeColors.length)];
        this.segments = [];
        this.maxSegments = 50;
        this.speed = 2 + Math.random() * 3;
        this.thickness = 8 + Math.random() * 12;
        this.turns = 0;
        this.maxTurns = 3 + Math.floor(Math.random() * 5);
    }
    
    update() {
        // Dodaj nowy segment
        this.segments.push({
            x: this.x,
            y: this.y,
            z: this.z,
            direction: this.direction
        });
        
        // Ogranicz liczbę segmentów
        if (this.segments.length > this.maxSegments) {
            this.segments.shift();
        }
        
        // Ruch w aktualnym kierunku
        switch(this.direction) {
            case 0: this.x += this.speed; break; // prawo
            case 1: this.x -= this.speed; break; // lewo
            case 2: this.y += this.speed; break; // dół
            case 3: this.y -= this.speed; break; // góra
            case 4: this.z += this.speed; break; // głębia
            case 5: this.z -= this.speed; break; // przód
        }
        
        // Losowe skręty
        if (Math.random() < 0.02 && this.turns < this.maxTurns) {
            this.direction = Math.floor(Math.random() * 6);
            this.turns++;
        }
        
        // Reset gdy rura wyjdzie poza ekran
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
            
            // Perspektywa 3D (prosty efekt)
            const scale = 1000 / (1000 + segment.z);
            const x = segment.x * scale;
            const y = segment.y * scale;
            const thickness = this.thickness * scale;
            
            // Narysuj segment jako prostokąt
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
            
            // Węzeł na końcu segmentu
            pipesCtx.beginPath();
            pipesCtx.arc(x, y, thickness / 2, 0, Math.PI * 2);
            pipesCtx.fill();
        }
    }
}

function initShutdown() {
    // Event listenery dla dialogu zamknięcia
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

function startShutdownSequence() {
    // Zamknij wszystkie okna
    document.querySelectorAll('.window.show').forEach(window => {
        window.classList.remove('show');
    });
    
    // Ukryj pasek zadań i pulpit
    document.querySelector('.taskbar').style.display = 'none';
    document.querySelector('.desktop').style.display = 'none';
    
    // Pokaż screensaver z opóźnieniem
    setTimeout(() => {
        showScreensaver();
    }, 1000);
}

function startRestartSequence() {
    alert('Symulacja restartu - odśwież stronę aby "uruchomić ponownie" system');
}

function startStandbySequence() {
    alert('Tryb oczekiwania - kliknij OK aby "obudzić" system');
}

function showScreensaver() {
    const screensaver = document.getElementById('screensaver');
    pipesCanvas = document.getElementById('pipes-canvas');
    
    if (!pipesCanvas) return;
    
    pipesCtx = pipesCanvas.getContext('2d');
    
    // Ustaw rozmiar canvas na pełny ekran
    pipesCanvas.width = window.innerWidth;
    pipesCanvas.height = window.innerHeight;
    
    screensaver.classList.add('active');
    isScreensaverActive = true;
    
    // Inicjalizuj rury
    pipes = [];
    for (let i = 0; i < 5; i++) {
        pipes.push(new Pipe());
    }
    
    // Rozpocznij animację
    animatePipes();
    
    // Kliknięcie wyłącza screensaver
    screensaver.addEventListener('click', hideScreensaver);
    document.addEventListener('keydown', hideScreensaver);
}

function animatePipes() {
    if (!isScreensaverActive) return;
    
    // Wyczyść canvas z efektem śladu
    pipesCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    pipesCtx.fillRect(0, 0, pipesCanvas.width, pipesCanvas.height);
    
    // Aktualizuj i rysuj rury
    pipes.forEach(pipe => {
        pipe.update();
        pipe.draw();
    });
    
    animationId = requestAnimationFrame(animatePipes);
}

function hideScreensaver() {
    isScreensaverActive = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    const screensaver = document.getElementById('screensaver');
    screensaver.classList.remove('active');
    
    // Przywróć pulpit i pasek zadań
    document.querySelector('.taskbar').style.display = 'flex';
    document.querySelector('.desktop').style.display = 'block';
    
    // Usuń event listenery
    screensaver.removeEventListener('click', hideScreensaver);
    document.removeEventListener('keydown', hideScreensaver);
}

// Inicjalizuj system zamknięcia
setTimeout(initShutdown, 200);
