// game.js - główna logika gry i inicjalizacja

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Stan gry
let gameMode = null; // 'tournament' or 'friendly'
let selectedTeam = null;

// Stan gry - usunięto efekty wizualne
let gameState = {
    playerScore: 0,
    botScore: 0,
    gameWon: false,
    gameStarted: false,
    ballInPlay: false,
    currentRound: 0,
    roundWon: false,
    ballRotation: 0,
    lastCollisionTime: 0  // Cooldown kolizji
};

// Gracz (Marian Włodarski) - szybkość 8
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

function drawPlayer(playerObj, name, isBot = false) {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = playerObj.x;
    const drawY = playerObj.y;

    // Skalowany promień gracza
    const scaledRadius = playerObj.radius * scale;

    // Cień gracza
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(drawX + 4, drawY + 4, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Koszulka
    ctx.fillStyle = playerObj.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Paski na koszulce - skalowane
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2 * scale;
    const stripeSpacing = 8 * scale;
    const stripeLength = 15 * scale;
    for(let i = -stripeLength; i <= stripeLength; i += stripeSpacing) {
        ctx.beginPath();
        ctx.moveTo(drawX + i, drawY - stripeLength);
        ctx.lineTo(drawX + i, drawY + stripeLength);
        ctx.stroke();
    }

    // Ręce - skalowane
    ctx.fillStyle = '#ffdbac';
    const armDistance = 12 * scale;
    const armRadius = 4 * scale;
    const armHeight = 8 * scale;
    ctx.beginPath();
    ctx.arc(drawX - armDistance, drawY - armHeight, armRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(drawX + armDistance, drawY - armHeight, armRadius, 0, Math.PI * 2);
    ctx.fill();

    // Nogi - skalowane
    ctx.fillStyle = playerObj.color;
    const legDistance = 6 * scale;
    const legRadius = 5 * scale;
    const legHeight = 15 * scale;
    ctx.beginPath();
    ctx.arc(drawX - legDistance, drawY + legHeight, legRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(drawX + legDistance, drawY + legHeight, legRadius, 0, Math.PI * 2);
    ctx.fill();

    // Buty - skalowane
    ctx.fillStyle = '#000000';
    const shoeRadius = 3 * scale;
    const shoeHeight = 18 * scale;
    ctx.beginPath();
    ctx.arc(drawX - legDistance, drawY + shoeHeight, shoeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(drawX + legDistance, drawY + shoeHeight, shoeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Głowa - skalowana
    ctx.fillStyle = '#ffdbac';
    const headRadius = 8 * scale;
    const headHeight = 12 * scale;
    ctx.beginPath();
    ctx.arc(drawX, drawY - headHeight, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Włosy - skalowane
    ctx.fillStyle = isBot ? '#8B4513' : '#FFD700';
    const hairRadius = 6 * scale;
    const hairHeight = 16 * scale;
    ctx.beginPath();
    ctx.arc(drawX, drawY - hairHeight, hairRadius, 0, Math.PI);
    ctx.fill();

    // Numer na koszulce - skalowany
    ctx.fillStyle = 'white';
    ctx.font = `bold ${14 * scale}px Orbitron`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3 * scale;
    const number = playerObj.number.toString();
    ctx.strokeText(number, drawX, drawY + 4 * scale);
    ctx.fillText(number, drawX, drawY + 4 * scale);

    // Nazwa gracza - skalowana
    const nameY = drawY + scaledRadius + 25 * scale;
    const nameWidth = 70 * scale;
    const nameHeight = 12 * scale;
        
    ctx.fillStyle = 'white';
    ctx.font = `bold ${8 * scale}px Orbitron`;
    ctx.fillText(name, drawX, nameY + 2 * scale);
}

function drawBall() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = ball.x;
    const drawY = ball.y;

    // Skalowany promień piłki
    const scaledRadius = ball.radius * scale;

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
    }
    
    requestAnimationFrame(gameLoop);
}

// Inicjalizacja
gameLoop();
