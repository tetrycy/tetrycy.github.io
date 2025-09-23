// game.js - główny silnik gry napisany od zera

// Globalne zmienne
let canvas, ctx;
let gameState = {
    ballInPlay: false,
    frameCount: 0,
    gameRunning: false,
    gameEnded: false
};

let gameMode = '1v1';
let selectedTeam = 0;
let currentTeam = null;

// Obiekty gry
let player = {
    x: 100,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 15,
    color: "#cc0000"
};

let ball = {
    x: 400,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 8,
    color: "#ffffff"
};

let bots = [];
let playerGoalkeeper = null;

// Input
let keys = {};

// Wyniki
let playerScore = 0;
let botScore = 0;
const maxScore = 5;

// Inicjalizacja gry
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        if (e.code === 'Space') {
            e.preventDefault();
            if (!gameState.ballInPlay && !gameState.gameEnded) {
                startBall();
            } else if (gameState.gameEnded) {
                resetGame();
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    // Ukryj menu i pokaż interface gry
    hideAllMenus();
}

// Menu functions
function show1v1Selection() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('oneVsOneSelection').classList.remove('hidden');
}

function showBundesligaSelection() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('bundesligaSelection').classList.remove('hidden');
}

function backToMenuFromSelection() {
    document.getElementById('oneVsOneSelection').classList.add('hidden');
    document.getElementById('bundesligaSelection').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}

function backToMenu() {
    hideAllMenus();
    document.getElementById('mainMenu').classList.remove('hidden');
    stopGame();
}

function hideAllMenus() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('oneVsOneSelection').classList.add('hidden');
    document.getElementById('bundesligaSelection').classList.add('hidden');
    document.getElementById('roundInfo').classList.remove('hidden');
    document.getElementById('scoreDisplay').classList.remove('hidden');
    document.getElementById('gameControls').classList.remove('hidden');
}

// Start functions
function start1v1(teamIndex) {
    gameMode = '1v1';
    selectedTeam = teamIndex;
    currentTeam = oneVsOneTeams[teamIndex];
    
    setupGame();
    initGame();
    startGameLoop();
}

function startBundesliga(teamIndex) {
    gameMode = 'bundesliga';
    selectedTeam = teamIndex;
    currentTeam = bundesligaTeams[teamIndex];
    
    setupGame();
    initGame();
    startGameLoop();
}

// Setup game objects
function setupGame() {
    // Reset scores
    playerScore = 0;
    botScore = 0;
    
    // Setup player
    player.x = 100;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
    
    // Setup ball
    resetBallPosition();
    
    // Setup bots from team data
    bots = [];
    if (currentTeam && currentTeam.bots) {
        currentTeam.bots.forEach(botData => {
            const bot = {
                name: botData.name,
                x: botData.x || 650,
                y: botData.y || 200,
                vx: 0,
                vy: 0,
                startX: botData.x || 650,
                startY: botData.y || 200,
                color: botData.color || "#0066ff",
                radius: botData.radius || 20,
                maxSpeed: botData.maxSpeed || 3.5,
                role: botData.role || "defender",
                preferredY: botData.preferredY || 200,
                canCrossHalf: botData.canCrossHalf || false,
                isGoalkeeper: botData.isGoalkeeper || false,
                number: botData.number || 1
            };
            bots.push(bot);
        });
    }
    
    // Setup player goalkeeper if needed
    if (currentTeam && currentTeam.playerGoalkeeper) {
        const gkData = currentTeam.playerGoalkeeper;
        playerGoalkeeper = {
            name: gkData.name,
            x: gkData.x || 50,
            y: gkData.y || 200,
            vx: 0,
            vy: 0,
            startX: gkData.x || 50,
            startY: gkData.y || 200,
            color: gkData.color || "#cc0000",
            radius: 18,
            maxSpeed: gkData.maxSpeed || 2.0
        };
    } else {
        playerGoalkeeper = null;
    }
    
    // Update UI
    updateUI();
    
    // Reset game state
    gameState.ballInPlay = false;
    gameState.gameRunning = true;
    gameState.gameEnded = false;
    gameState.frameCount = 0;
}

function resetBallPosition() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
}

function startBall() {
    gameState.ballInPlay = true;
    ball.vx = (Math.random() - 0.5) * 4;
    ball.vy = (Math.random() - 0.5) * 4;
    document.getElementById('startMessage').style.display = 'none';
}

// Main game loop
function startGameLoop() {
    if (gameState.gameRunning) {
        gameLoop();
    }
}

function gameLoop() {
    if (!gameState.gameRunning) return;
    
    gameState.frameCount++;
    
    // Update game objects
    if (gameState.ballInPlay) {
        updatePlayer();
        updateBots();
        updateBall();
        checkCollisions();
        checkGoals();
    }
    
    // Render everything
    render();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

function stopGame() {
    gameState.gameRunning = false;
}

// Ball physics
function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Friction
    ball.vx *= 0.995;
    ball.vy *= 0.995;
    
    // Wall bounces (top/bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.vy *= -0.8;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Side walls (left/right) - except goal areas
    const goalTop = canvas.height * 0.35;
    const goalBottom = canvas.height * 0.65;
    
    // Left side
    if (ball.x - ball.radius < 0) {
        if (ball.y < goalTop || ball.y > goalBottom) {
            ball.vx *= -0.8;
            ball.x = ball.radius;
        }
    }
    
    // Right side  
    if (ball.x + ball.radius > canvas.width) {
        if (ball.y < goalTop || ball.y > goalBottom) {
            ball.vx *= -0.8;
            ball.x = canvas.width - ball.radius;
        }
    }
}

// Collision detection
function checkCollisions() {
    // Player-ball collision (handled in player.js)
    
    // Bot-ball collisions
    bots.forEach(bot => {
        const dx = ball.x - bot.x;
        const dy = ball.y - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = ball.radius + bot.radius;
        
        if (distance < minDistance && distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Separate ball from bot
            ball.x = bot.x + nx * minDistance;
            ball.y = bot.y + ny * minDistance;
            
            // Transfer velocity
            const kickPower = Math.max(3, Math.sqrt(bot.vx * bot.vx + bot.vy * bot.vy) + 2);
            ball.vx = nx * kickPower;
            ball.vy = ny * kickPower;
        }
    });
    
    // Player goalkeeper collision
    if (playerGoalkeeper) {
        const dx = ball.x - playerGoalkeeper.x;
        const dy = ball.y - playerGoalkeeper.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = ball.radius + playerGoalkeeper.radius;
        
        if (distance < minDistance && distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            
            ball.x = playerGoalkeeper.x + nx * minDistance;
            ball.y = playerGoalkeeper.y + ny * minDistance;
            
            const kickPower = 4;
            ball.vx = nx * kickPower;
            ball.vy = ny * kickPower;
        }
    }
}

// Goal detection
function checkGoals() {
    const goalTop = canvas.height * 0.35;
    const goalBottom = canvas.height * 0.65;
    
    // Left goal (player scores)
    if (ball.x < 0 && ball.y > goalTop && ball.y < goalBottom) {
        playerScore++;
        goalScored('player');
    }
    
    // Right goal (bot scores)  
    if (ball.x > canvas.width && ball.y > goalTop && ball.y < goalBottom) {
        botScore++;
        goalScored('bot');
    }
}

function goalScored(scorer) {
    gameState.ballInPlay = false;
    resetBallPosition();
    updateUI();
    
    // Check win condition
    if (playerScore >= maxScore || botScore >= maxScore) {
        endGame();
    } else {
        document.getElementById('startMessage').style.display = 'block';
    }
}

function endGame() {
    gameState.gameEnded = true;
    gameState.ballInPlay = false;
    
    const winner = playerScore >= maxScore ? 'MARIAN WŁODARSKI' : (currentTeam ? currentTeam.opponentTeam : 'GEGNER');
    
    const winnerMsg = document.getElementById('winnerMessage');
    winnerMsg.innerHTML = `🏆 ${winner} GEWINNT! 🏆<br>DRÜCKEN SIE LEERTASTE FÜR NEUSTART`;
    winnerMsg.style.display = 'block';
    
    document.getElementById('retryBtn').style.display = 'inline-block';
}

function resetGame() {
    document.getElementById('winnerMessage').style.display = 'none';
    document.getElementById('retryBtn').style.display = 'none';
    setupGame();
}

function retryMatch() {
    resetGame();
}

// UI updates
function updateUI() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('botScore').textContent = botScore;
    
    if (currentTeam) {
        document.getElementById('playerTeam').textContent = currentTeam.playerTeam || 'MARIAN WŁODARSKI';
        document.getElementById('botTeam').textContent = currentTeam.opponentTeam || 'GEGNER';
        
        const roundInfo = document.getElementById('roundInfo');
        roundInfo.textContent = `${gameMode.toUpperCase()}: ${currentTeam.playerTeam || 'MARIAN WŁODARSKI'} vs ${currentTeam.opponentTeam || 'GEGNER'}`;
    }
}

// Rendering
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw field
    drawField();
    
    // Draw game objects
    drawPlayer();
    drawBots();
    drawBall();
    
    if (playerGoalkeeper) {
        drawPlayerGoalkeeper();
    }
}

function drawField() {
    // Green background
    ctx.fillStyle = '#2d5a2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Goals
    const goalTop = canvas.height * 0.35;
    const goalBottom = canvas.height * 0.65;
    
    // Left goal
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, goalTop);
    ctx.lineTo(-10, goalTop);
    ctx.lineTo(-10, goalBottom);
    ctx.lineTo(0, goalBottom);
    ctx.stroke();
    
    // Right goal
    ctx.beginPath();
    ctx.moveTo(canvas.width, goalTop);
    ctx.lineTo(canvas.width + 10, goalTop);
    ctx.lineTo(canvas.width + 10, goalBottom);
    ctx.lineTo(canvas.width, goalBottom);
    ctx.stroke();
    
    // Goal areas
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, goalTop, 50, goalBottom - goalTop);
    ctx.strokeRect(canvas.width - 50, goalTop, 50, goalBottom - goalTop);
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Player number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MW', player.x, player.y + 3);
}

function drawBots() {
    bots.forEach(bot => {
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bot number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bot.number || '?', bot.x, bot.y + 3);
    });
}

function drawPlayerGoalkeeper() {
    ctx.fillStyle = playerGoalkeeper.color;
    ctx.beginPath();
    ctx.arc(playerGoalkeeper.x, playerGoalkeeper.y, playerGoalkeeper.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GK', playerGoalkeeper.x, playerGoalkeeper.y + 3);
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball highlight
    ctx.fillStyle = '#cccccc';
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Initialize when page loads
window.addEventListener('load', () => {
    // Game is ready, waiting for user to select team
    console.log('Game loaded, waiting for team selection');
});
