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

    // Radius jest już przeskalowany w ui.js - nie skaluj ponownie
    const radius = playerObj.radius;

    // Cień gracza
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(drawX + 2 * scale, drawY + 2 * scale, radius, 0, Math.PI * 2);
    ctx.fill();

    // Główne kółko gracza (koszulka)
    ctx.fillStyle = playerObj.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Obramowanie gracza
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Numer na koszulce - skalowany
    ctx.fillStyle = 'white';
    ctx.font = `bold ${12 * scale}px Press Start 2P`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 * scale;
    const number = playerObj.number.toString();
    ctx.strokeText(number, drawX, drawY);
    ctx.fillText(number, drawX, drawY);

    // Nazwa gracza pod kółkiem - skalowana
    ctx.fillStyle = 'white';
    ctx.font = `bold ${6 * scale}px Press Start 2P`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 * scale;
    const nameY = drawY + radius + 12 * scale;
    ctx.strokeText(name, drawX, nameY);
    ctx.fillText(name, drawX, nameY);
}

function drawBall() {
    // Zawsze skaluj piłkę zgodnie z obecnym boiskiem
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const drawX = ball.x;
    const drawY = ball.y;
    const radius = Math.max(2, 8 * scale);

    // Cień piłki - skalowany
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(drawX + 2 * scale, drawY + 2 * scale, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Piłka - migająca gdy nie w grze
    if (!gameState.ballInPlay && gameState.gameStarted && !gameState.gameWon) {
        if (Math.floor(Date.now() / 300) % 2) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
        } else {
            ctx.fillStyle = ball.color;
        }
    } else {
        ctx.fillStyle = ball.color;
    }
    
    ctx.beginPath();
    ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Obramowanie piłki
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Połysk - skalowany
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(drawX - radius * 0.3, drawY - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
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
        
        drawPlayer(player, 'WŁODARSKI', false);
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
