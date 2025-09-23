// game.js - główna logika gry i inicjalizacja

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

// Efekty cząsteczkowe
function createParticles(x, y, color, count) {
    for(let i = 0; i < count; i++) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            maxLife: 30,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

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

function drawPlayer(playerObj, name, isBot = false) {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Bez shake effect
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
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(drawX - nameWidth/2, nameY - nameHeight/2, nameWidth, nameHeight);
    
    ctx.strokeStyle = isBot ? playerObj.color : '#ff0000';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(drawX - nameWidth/2, nameY - nameHeight/2, nameWidth, nameHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${8 * scale}px Orbitron`;
    ctx.fillText(name, drawX, nameY + 2 * scale);
}

function drawBall() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Bez shake effect
    const drawX = ball.x;
    const drawY = ball.y;

    // Skalowany promień piłki
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
