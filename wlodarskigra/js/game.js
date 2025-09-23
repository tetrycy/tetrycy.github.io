// game.js - główna logika gry i inicjalizacja (bezpieczne poprawki)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Stan gry
let gameMode = null; // 'tournament' or 'friendly'
let selectedTeam = null;

// Stan gry z efektami
let gameState = {
    playerScore: 0,
    botScore: 0,
    gameWon: false,
    gameStarted: false,
    ballInPlay: false,
    currentRound: 0,
    roundWon: false,
    particles: [],
    ballRotation: 0,
    screenShake: 0,
    lastCollisionTime: 0  // Cooldown kolizji
};

// Gracz (Włodarski) - szybkość 8
const player = {
    x: 100,
    y: canvas.height / 2,
    radius: 20,
    color: '#ff0000',
    vx: 0,
    vy: 0,
    number: 10
};

// Boty - będą ładowane z definicji drużyn
let bots = [];

// Bramkarz gracza (opcjonalny)
let playerGoalkeeper = null;

// Piłka - prędkość zmniejszona o 15%
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    vx: 0,
    vy: 0,
    color: '#ffffff',
    maxSpeed: 11.5,
    startSpeed: 5.7
};

// Sterowanie
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameState.gameStarted) {
            startGame();
        } else if (!gameState.ballInPlay && !gameState.gameWon) {
            launchBall();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// TYLKO efekty bramkowe - usunięto createParticles
function createGoalEffect(x, y) {
    for(let i = 0; i < 20; i++) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            life: 60,
            maxLife: 60,
            color: '#ffff00',
            size: Math.random() * 8 + 4
        });
    }
    gameState.screenShake = 8;
}

function updateParticles() {
    for(let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        particle.life--;
        
        if(particle.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    gameState.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(255,255,0,${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateEffects() {
    updateParticles();
    if(gameState.screenShake > 0) {
        gameState.screenShake *= 0.9;
        if(gameState.screenShake < 0.1) gameState.screenShake = 0;
    }
}

// UPROSZCZONA funkcja gracza - tylko kulka + numer + nazwa
function drawPlayer(playerObj, name, isBot = false) {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = playerObj.x;
    const drawY = playerObj.y;
    const scaledRadius = playerObj.radius * scale;

    // Cień gracza
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(drawX + 4, drawY + 4, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Główna kulka gracza
    ctx.fillStyle = playerObj.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Obramowanie
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Numer na koszulce
    const minNumberSize = 12;
    const numberSize = Math.max(minNumberSize, 16 * scale);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${numberSize}px 'Press Start 2P'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Kontur numeru
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(2, 3 * scale);
    const number = playerObj.number.toString();
    ctx.strokeText(number, drawX, drawY);
    ctx.fillText(number, drawX, drawY);

    // Nazwa gracza - zawsze czytelna
    const nameY = drawY + scaledRadius + (30 * Math.max(0.6, scale));
    const minNameWidth = 120;
    const minNameHeight = 16;
    const minFontSize = 6;
    
    const nameWidth = Math.max(minNameWidth, 70 * scale);
    const nameHeight = Math.max(minNameHeight, 12 * scale);
    const fontSize = Math.max(minFontSize, 8 * scale);
    
    // Tło nazwiska
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(drawX - nameWidth/2, nameY - nameHeight/2, nameWidth, nameHeight);
    
    // Ramka nazwiska
    ctx.strokeStyle = isBot ? playerObj.color : '#ff0000';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.strokeRect(drawX - nameWidth/2, nameY - nameHeight/2, nameWidth, nameHeight);
    
    // Tekst nazwiska
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px 'Press Start 2P'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Kontur nazwiska
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.strokeText(name, drawX, nameY);
    ctx.fillText(name, drawX, nameY);
    
    // WAŻNE: Przywróć domyślne ustawienia canvas
    ctx.textBaseline = 'alphabetic';
}

function drawBall() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = ball.x;
    const drawY = ball.y;
    const scaledRadius = ball.radius * scale;

    // Ślady za piłką - skalowane
    if (gameState.ballInPlay && (Math.abs(ball.vx) > 2 || Math.abs(ball.vy) > 2)) {
        for(let i = 1; i <= 3; i++) {
            const alpha = 0.3 - (i * 0.1);
            const trailX = drawX - (ball.vx * i * 2);
            const trailY = drawY - (ball.vy * i * 2);
            
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, (scaledRadius - i) * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Cień piłki - skalowany
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(drawX + 3, drawY + 3, scaledRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Piłka
    if (!gameState.ballInPlay && gameState.gameStarted && !gameState.gameWon) {
        if (Math.floor(Date.now() / 200) % 2) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
        } else {
            ctx.fillStyle = ball.color;
        }
    } else {
        ctx.fillStyle = ball.color;
    }
    
    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Wzór piłki z rotacją - skalowany
    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(gameState.ballRotation);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5 * scale;
    
    // Pentagramy - skalowane
    ctx.beginPath();
    for(let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5);
        const x = Math.cos(angle) * scaledRadius * 0.6;
        const y = Math.sin(angle) * scaledRadius * 0.6;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    // Połysk - skalowany
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(drawX - scaledRadius * 0.3, drawY - scaledRadius * 0.3, scaledRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Główna pętla gry
function gameLoop() {
    if (gameMode) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawField();
        
        if (gameState.gameStarted) {
            updatePlayer();
            updateBots();
            updateBall();
        }
        
        drawPlayer(player, 'MARIAN WŁODARSKI', false);
        if (playerGoalkeeper) {
            drawPlayer(playerGoalkeeper, playerGoalkeeper.name, false);
        }
        bots.forEach(bot => {
            drawPlayer(bot, bot.name, true);
        });
        drawBall();
        
        updateEffects();
        drawParticles();
    }
    
    requestAnimationFrame(gameLoop);
}

// Inicjalizacja
gameLoop();
