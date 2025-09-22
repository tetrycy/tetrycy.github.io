// game.js - główna logika gry i inicjalizacja

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Stan gry
let gameMode = null; // '1v1' or 'bundesliga'
let selectedTeam = null;

// Stan gry z efektami
let gameState = {
    playerScore: 0,
    botScore: 0,
    gameWon: false,
    gameStarted: false,
    ballInPlay: false,
    particles: [],
    ballRotation: 0,
    screenShake: 0,
    lastCollisionTime: 0,  // Cooldown kolizji
    frameCount: 0
};

// Gracz (Marian Włodarski)
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

// Piłka
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

// Uproszczona funkcja rysowania gracza - tylko kółko + numer
function drawPlayer(playerObj, name, isBot = false) {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === '1v1' ? oneVsOneTeams[selectedTeam] : bundesligaTeams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = playerObj.x;
    const drawY = playerObj.y;
    const scaledRadius = playerObj.radius * scale;

    // Cień gracza
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(drawX + 2, drawY + 2, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Główny kolor gracza
    ctx.fillStyle = playerObj.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Numer na środku
    ctx.fillStyle = 'white';
    ctx.font = `bold ${16 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 * scale;
    const number = playerObj.number.toString();
    ctx.strokeText(number, drawX, drawY + 5 * scale);
    ctx.fillText(number, drawX, drawY + 5 * scale);

    // Nazwa gracza pod kółkiem
    ctx.fillStyle = 'white';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3 * scale;
    ctx.strokeText(name, drawX, drawY + scaledRadius + 15 * scale);
    ctx.fillText(name, drawX, drawY + scaledRadius + 15 * scale);
}

function drawBall() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === '1v1' ? oneVsOneTeams[selectedTeam] : bundesligaTeams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = ball.x;
    const drawY = ball.y;
    const scaledRadius = ball.radius * scale;

    // Cień piłki
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(drawX + 2, drawY + 2, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Piłka - miganie gdy nie w grze
    if (!gameState.ballInPlay && gameState.gameStarted && !gameState.gameWon) {
        if (Math.floor(Date.now() / 300) % 2) {
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

    // Prosta czarna linia na piłce
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(drawX - scaledRadius * 0.7, drawY);
    ctx.lineTo(drawX + scaledRadius * 0.7, drawY);
    ctx.stroke();
}

// Minimalne efekty cząsteczkowe
function createParticles(x, y, color, count) {
    for(let i = 0; i < Math.min(count, 3); i++) { // Max 3 cząsteczki
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 20, // Krótszy czas życia
            maxLife: 20,
            color: color,
            size: 3
        });
    }
}

function updateParticles() {
    for(let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.9;
        particle.vy *= 0.9;
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
    if(gameState.particles.length > 0) {
        updateParticles();
    }
    if(gameState.screenShake > 0) {
        gameState.screenShake *= 0.8;
        if(gameState.screenShake < 0.1) gameState.screenShake = 0;
    }
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
        
        drawPlayer(player, 'WŁODARSKI', false);
        if (playerGoalkeeper) {
            drawPlayer(playerGoalkeeper, playerGoalkeeper.name, false);
        }
        bots.forEach(bot => {
            drawPlayer(bot, bot.name, true);
        });
        drawBall();
        
        updateEffects();
        if(gameState.particles.length > 0) {
            drawParticles();
        }
    }
    
    gameState.frameCount++;
    requestAnimationFrame(gameLoop);
}

// Inicjalizacja
gameLoop();
