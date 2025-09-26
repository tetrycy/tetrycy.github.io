// pvp.js - moduł trybu wieloosobowego dla istniejącej gry

// Zmienne globalne dla trybu PvP
let pvpFieldScale = 1.0;
let pvpSelectedOpponent = null;

// Gracz 2 (niebieski) - dla trybu PvP
const player2 = {
    x: 700,  // ← ZMIEŃ
    y: 200,  // ← ZMIEŃ
    radius: 20,
    color: '#0000ff',
    vx: 0,
    vy: 0,
    number: 11,
    speed: 5.0,
    shootPower: 8,
    stunned: 0,
    pushbackX: 0,
    pushbackY: 0
};

// ============ FUNKCJE MENU PVP ============

// ZNAJDŹ te funkcje w js/pvp.js i ZASTĄP JE tym kodem:

function showPvPMenu() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('pvpMenu').classList.remove('hidden');
}

function showFieldSizeSelection() {
    document.getElementById('pvpMenu').classList.add('hidden');
    document.getElementById('fieldSizeSelection').classList.remove('hidden');
}

function showCoopSelection() {
    document.getElementById('pvpMenu').classList.add('hidden');
    document.getElementById('coopSelection').classList.remove('hidden');
}

function backToPvPMenu() {
    document.getElementById('fieldSizeSelection').classList.add('hidden');
    document.getElementById('coopSelection').classList.add('hidden');
    document.getElementById('pvpMenu').classList.remove('hidden');
}

// TAKŻE ZMODYFIKUJ funkcję showGame() w ui.js - DODAJ tę linię:
// Na końcu funkcji showGame() DODAJ:
// document.getElementById('pvpMenu').classList.add('hidden');
// document.getElementById('fieldSizeSelection').classList.add('hidden');
// document.getElementById('coopSelection').classList.add('hidden');

// ============ ŁADOWANIE TRYBÓW PVP ============

function loadPvP1v1Mode(scale) {
    // Wyczyść botów - w trybie 1v1 nie ma botów
    bots = [];
    playerGoalkeeper = null;
    
    // Ustaw parametry dla trybu 1v1
    player.radius = 20;
    player.speed = 5.0;
    player.shootPower = 8;
    
    player2.radius = 20;
    player2.speed = 5.0;
    player2.shootPower = 8;
    
    // Parametry piłki dla 1v1
    ball.startSpeed = 6.0;
    ball.maxSpeed = 12.0;
    
    // Ustaw nazwy drużyn i info
    document.getElementById('playerTeam').textContent = "GRACZ 1 (WSAD)";
    document.getElementById('botTeam').textContent = "GRACZ 2 (IJKL)";
    
    const sizeNames = {1.0: "NORMAL", 0.75: "KLEIN", 0.5: "SEHR KLEIN", 0.25: "MINI"};
    document.getElementById('roundInfo').textContent = `1 vs 1 DUELL - FELD: ${sizeNames[scale]}`;
    document.getElementById('startTitle').textContent = `🚀 1 vs 1 DUELL - DRÜCKEN SIE LEERTASTE! 🚀`;
    document.getElementById('startSubtitle').textContent = "*** GRACZ 1: WSAD | GRACZ 2: IJKL ***";
}

function loadPvPCoopMode(opponentIndex) {
    // Mapowanie przeciwników na istniejące drużyny
    const opponentMapping = {0: 0, 1: 1}; // 0=Duisburg, 1=Mannheim
    const teamData = teams[opponentMapping[opponentIndex]];
    
    // Załaduj botów przeciwnika
    const scale = teamData.fieldScale || 1.0;
    bots = teamData.bots.map(botData => ({
        ...botData,
        radius: Math.max(3, (botData.radius || 20) * scale),
        vx: 0,
        vy: 0,
        shootPower: botData.shootPower || 1.2,
        reactionSpeed: 0.2,
        startY: botData.y,
        canCrossHalf: botData.canCrossHalf !== undefined ? botData.canCrossHalf : true,
        isGoalkeeper: botData.isGoalkeeper || false,
        role: botData.role || "midfielder",
        preferredY: botData.preferredY || botData.y
    }));
    
    // Brak bramkarza gracza w trybie coop
    playerGoalkeeper = null;
    
    // Ustaw parametry graczy
    player.radius = Math.max(3, teamData.playerRadius || 20);
    player.speed = teamData.playerSpeed || 5.1;
    player.shootPower = teamData.playerShootPower || 1.5;
    
    player2.radius = Math.max(3, teamData.playerRadius || 20);
    player2.speed = teamData.playerSpeed || 5.1;
    player2.shootPower = teamData.playerShootPower || 1.5;
    
    // Pozycjonuj gracza 2 jako partnera
    player2.x = 150;
    player2.y = canvas.height / 2 + 50;
    
    // Parametry piłki
    ball.startSpeed = teamData.ballSpeed || 5.7;
    ball.maxSpeed = teamData.ballMaxSpeed || 11.5;
    
    // Ustaw nazwy drużyn i info
    document.getElementById('playerTeam').textContent = "GRACZ 1 & 2";
    document.getElementById('botTeam').textContent = teamData.opponentTeam;
    
    document.getElementById('roundInfo').textContent = `CO-OP vs ${teamData.opponentTeam}`;
    document.getElementById('startTitle').textContent = `🚀 CO-OP MATCH - DRÜCKEN SIE LEERTASTE! 🚀`;
    document.getElementById('startSubtitle').textContent = "*** GRACZ 1: WSAD | GRACZ 2: IJKL ***";
}

// ============ AKTUALIZACJA GRACZY W TRYBIE PVP ============

function updatePlayersPvP() {
    if (gameMode === 'pvp_1v1' || gameMode === 'pvp_coop') {
        updatePlayer1PvP();
        updatePlayer2PvP();
    }
}

function updatePlayer1PvP() {
    if (player.stunned > 0) {
        player.stunned--;
        player.x += player.pushbackX;
        player.y += player.pushbackY;
        player.pushbackX *= 0.8;
        player.pushbackY *= 0.8;
        return;
    }

    const speed = player.speed || 5.0;
    player.vx = 0;
    player.vy = 0;
    
    if (keys['w']) player.vy = -speed;
    if (keys['s']) player.vy = speed;
    if (keys['a']) player.vx = -speed;
    if (keys['d']) player.vx = speed;

    player.x += player.vx;
    player.y += player.vy;

    applyFieldBoundariesPvP(player);
}

function updatePlayer2PvP() {
    if (player2.stunned > 0) {
        player2.stunned--;
        player2.x += player2.pushbackX;
        player2.y += player2.pushbackY;
        player2.pushbackX *= 0.8;
        player2.pushbackY *= 0.8;
        return;
    }

    const speed = player2.speed || 5.0;
    player2.vx = 0;
    player2.vy = 0;
    
    if (keys['i']) player2.vy = -speed;
    if (keys['k']) player2.vy = speed;
    if (keys['j']) player2.vx = -speed;
    if (keys['l']) player2.vx = speed;

    player2.x += player2.vx;
    player2.y += player2.vy;

    applyFieldBoundariesPvP(player2);
}

function applyFieldBoundariesPvP(entity) {
    const scale = gameMode === 'pvp_1v1' ? pvpFieldScale : 1.0;
    const border = 15 * scale;
    
    entity.x = Math.max(entity.radius + border, Math.min(canvas.width - entity.radius - border, entity.x));
    entity.y = Math.max(entity.radius + border, Math.min(canvas.height - entity.radius - border, entity.y));
}

// ============ OBSŁUGA WYNIKU W TRYBIE PVP ============

function updateScorePvP() {
    if (gameMode === 'pvp_1v1') {
        document.getElementById('playerScore').textContent = gameState.player1Score;
        document.getElementById('botScore').textContent = gameState.player2Score;

        if (gameState.player1Score >= 5) {
            gameState.gameWon = true;
            showPvPWinMessage("GRACZ 1 (ROT)");
        } else if (gameState.player2Score >= 5) {
            gameState.gameWon = true;
            showPvPWinMessage("GRACZ 2 (BLAU)");
        }
    } else if (gameMode === 'pvp_coop') {
        document.getElementById('playerScore').textContent = gameState.playerScore;
        document.getElementById('botScore').textContent = gameState.botScore;

        if (gameState.playerScore >= 5) {
            gameState.gameWon = true;
            showPvPWinMessage("SPIELER TEAM");
        } else if (gameState.botScore >= 5) {
            gameState.gameWon = true;
            showPvPWinMessage("KI TEAM");
        }
    }
}

function showPvPWinMessage(winner) {
    let scoreText = '';
    if (gameMode === 'pvp_1v1') {
        scoreText = `${gameState.player1Score} : ${gameState.player2Score}`;
    } else {
        scoreText = `${gameState.playerScore} : ${gameState.botScore}`;
    }
    
    document.getElementById('winnerMessage').innerHTML = `
        <div>🎉 ${winner} GEWINNT! 🎉</div>
        <div style="font-size: 14px; margin: 10px 0; color: #00ffff;">
            Endstand: ${scoreText}
        </div>
        <div style="font-size: 12px; color: #ffff00;">
            Nochmal spielen?
        </div>
    `;
    
    document.getElementById('winnerMessage').style.display = 'block';
    document.getElementById('retryBtn').style.display = 'inline-block';
    document.getElementById('nextRoundBtn').style.display = 'none';
}

// ============ RESET I INICJALIZACJA PVP ============

function resetMatchPvP() {
    if (gameMode === 'pvp_1v1') {
        gameState.player1Score = 0;
        gameState.player2Score = 0;
    } else if (gameMode === 'pvp_coop') {
        gameState.playerScore = 0;
        gameState.botScore = 0;
    }
    
    gameState.gameWon = false;
    gameState.gameStarted = false;
    gameState.ballInPlay = false;
    gameState.roundWon = false;
    gameState.ballRotation = 0;
    gameState.lastCollisionTime = 0;

    // Reset gracza 1
    player.x = 100;
    player.y = canvas.height / 2;
    player.stunned = 0;
    player.pushbackX = 0;
    player.pushbackY = 0;
    
    // Reset gracza 2
    if (gameMode === 'pvp_1v1') {
        player2.x = canvas.width - 100;
        player2.y = canvas.height / 2;
    } else {
        player2.x = 150;
        player2.y = canvas.height / 2 + 50;
    }
    player2.stunned = 0;
    player2.pushbackX = 0;
    player2.pushbackY = 0;
    
    // Reset piłki
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    
    // Reset botów (w trybie coop)
    bots.forEach(bot => {
        bot.x = 700;
        bot.y = bot.startY;
        bot.vx = 0;
        bot.vy = 0;
    });
    
    updateScorePvP();
    document.getElementById('winnerMessage').style.display = 'none';
    document.getElementById('startMessage').style.display = 'block';
}

function resetBallAfterGoalPvP() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    gameState.ballInPlay = false;
    
    // Reset pozycji graczy
    player.x = 100;
    player.y = canvas.height / 2;
    player.stunned = 0;
    player.pushbackX = 0;
    player.pushbackY = 0;
    
    if (gameMode === 'pvp_1v1') {
        player2.x = canvas.width - 100;
        player2.y = canvas.height / 2;
    } else {
        player2.x = 150;
        player2.y = canvas.height / 2 + 50;
    }
    player2.stunned = 0;
    player2.pushbackX = 0;
    player2.pushbackY = 0;
    
    // Reset botów
    bots.forEach(bot => {
        bot.x = 700;
        bot.y = bot.startY;
        bot.vx = 0;
        bot.vy = 0;
    });
}

// ============ RYSOWANIE W TRYBIE PVP ============

function drawPlayersPvP() {
    if (gameMode === 'pvp_1v1' || gameMode === 'pvp_coop') {
        drawPlayer(player, 'GRACZ 1', false);
        drawPlayer(player2, 'GRACZ 2', false);
    }
}

// ============ SPRAWDZANIE CZY TRYB PVP ============

function isPvPMode() {
    return gameMode === 'pvp_1v1' || gameMode === 'pvp_coop';
}

function getCurrentFieldScalePvP() {
    if (gameMode === 'pvp_1v1') {
        return pvpFieldScale;
    } else if (gameMode === 'pvp_coop') {
        const opponentMapping = {0: 0, 1: 1};
        const teamData = teams[opponentMapping[pvpSelectedOpponent]];
        return teamData.fieldScale || 1.0;
    }
    return 1.0;
}
