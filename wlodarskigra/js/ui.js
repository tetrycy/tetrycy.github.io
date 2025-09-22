// ui.js - interfejs użytkownika, menu i ekrany

// Funkcje menu głównego
function show1v1Selection() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('oneVsOneSelection').style.display = 'block';
}

function showBundesligaSelection() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('bundesligaSelection').style.display = 'block';
}

// Funkcje startowania trybów
function start1v1(opponentIndex) {
    gameMode = '1v1';
    selectedTeam = opponentIndex;
    showGame();
    load1v1Team(opponentIndex);
}

function startBundesliga(teamIndex) {
    gameMode = 'bundesliga';
    selectedTeam = teamIndex;
    showGame();
    loadBundesligaTeam(teamIndex);
}

// Funkcje nawigacji wstecznej
function backToMenu() {
    // Ukryj wszystkie ekrany gry
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameControls').style.display = 'none';
    document.getElementById('roundInfo').classList.add('hidden');
    document.getElementById('scoreDisplay').classList.add('hidden');
    
    // Ukryj wszystkie menu wyboru
    document.getElementById('oneVsOneSelection').style.display = 'none';
    document.getElementById('bundesligaSelection').style.display = 'none';
    
    // Pokaż menu główne
    document.getElementById('mainMenu').style.display = 'block';
    
    // Reset stanu gry
    resetGameState();
}

function backToMenuFromSelection() {
    // Ukryj wszystkie menu wyboru
    document.getElementById('oneVsOneSelection').style.display = 'none';
    document.getElementById('bundesligaSelection').style.display = 'none';
    
    // Pokaż menu główne
    document.getElementById('mainMenu').style.display = 'block';
}

// Funkcje wyświetlania gry
function showGame() {
    // Ukryj wszystkie menu
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('oneVsOneSelection').style.display = 'none';
    document.getElementById('bundesligaSelection').style.display = 'none';
    
    // Pokaż grę
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('gameControls').style.display = 'block';
    document.getElementById('roundInfo').classList.remove('hidden');
    document.getElementById('scoreDisplay').classList.remove('hidden');
}

// Funkcje ładowania drużyn dla różnych trybów
function load1v1Team(opponentIndex) {
    const teamData = oneVsOneTeams[opponentIndex];
    loadTeamData(teamData);
    
    document.getElementById('roundInfo').textContent = 
        `1 vs 1 DUELL: ${teamData.playerTeam} vs ${teamData.opponentTeam}`;
    document.getElementById('startTitle').textContent = `⚔️ 1vs1 KAMPF - DRÜCKEN SIE LEERTASTE! ⚔️`;
}

function loadBundesligaTeam(teamIndex) {
    const teamData = bundesligaTeams[teamIndex];
    loadTeamData(teamData);
    
    document.getElementById('roundInfo').textContent = 
        `ZWEITE BUNDESLIGA: ${teamData.playerTeam} vs ${teamData.opponentTeam}`;
    document.getElementById('startTitle').textContent = `🏟️ BUNDESLIGA MATCH - DRÜCKEN SIE LEERTASTE! 🏟️`;
}

// Uniwersalna funkcja ładowania danych drużyny
function loadTeamData(teamData) {
    document.getElementById('playerTeam').textContent = teamData.playerTeam;
    document.getElementById('botTeam').textContent = teamData.opponentTeam;
    document.getElementById('startSubtitle').textContent = "*** SPIEL BEGINNT! ***";
    
    bots = teamData.bots.map(botData => ({
        ...botData,
        radius: 20,
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
    
    // Ładuj bramkarza gracza jeśli istnieje
    if (teamData.hasPlayerGoalkeeper && teamData.playerGoalkeeper) {
        playerGoalkeeper = {
            ...teamData.playerGoalkeeper,
            radius: 20,
            vx: 0,
            vy: 0,
            startX: teamData.playerGoalkeeper.x,
            startY: teamData.playerGoalkeeper.y
        };
    } else {
        playerGoalkeeper = null;
    }
}

// Funkcje zarządzania wynikami
function updateScore() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('botScore').textContent = gameState.botScore;

    if (gameState.playerScore >= 5) {
        gameState.gameWon = true;
        gameState.roundWon = true;
        showWinMessage();
    } else if (gameState.botScore >= 5) {
        gameState.gameWon = true;
        gameState.roundWon = false;
        showLoseMessage();
    }
}

function showWinMessage() {
    let currentTeamData;
    
    if (gameMode === '1v1') {
        currentTeamData = oneVsOneTeams[selectedTeam];
        document.getElementById('winnerMessage').innerHTML = `
            <div>⚔️ 1vs1 DUELL GEWONNEN! ⚔️</div>
            <div style="font-size: 14px; margin: 10px 0; color: #00ffff;">
                ${currentTeamData.playerTeam} BESIEGT ${currentTeamData.opponentTeam}!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Überlegene Technik!
            </div>
        `;
    } else if (gameMode === 'bundesliga') {
        currentTeamData = bundesligaTeams[selectedTeam];
        document.getElementById('winnerMessage').innerHTML = `
            <div>🏟️ BUNDESLIGA SIEG! 🏟️</div>
            <div style="font-size: 14px; margin: 10px 0; color: #00ffff;">
                ${currentTeamData.playerTeam} BESIEGT ${currentTeamData.opponentTeam}!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Professionell gespielt!
            </div>
        `;
    }
    
    document.getElementById('winnerMessage').style.display = 'block';
    document.getElementById('retryBtn').style.display = 'inline-block';
}

function showLoseMessage() {
    let currentTeamData;
    
    if (gameMode === '1v1') {
        currentTeamData = oneVsOneTeams[selectedTeam];
        document.getElementById('winnerMessage').innerHTML = `
            <div>⚔️ 1vs1 DUELL VERLOREN! ⚔️</div>
            <div style="font-size: 14px; margin: 10px 0; color: #ff4444;">
                ${currentTeamData.opponentTeam} GEWINNT!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Mehr Training nötig!
            </div>
        `;
    } else if (gameMode === 'bundesliga') {
        currentTeamData = bundesligaTeams[selectedTeam];
        document.getElementById('winnerMessage').innerHTML = `
            <div>🏟️ BUNDESLIGA NIEDERLAGE! 🏟️</div>
            <div style="font-size: 14px; margin: 10px 0; color: #ff4444;">
                ${currentTeamData.opponentTeam} GEWINNT!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Die Profis waren stärker!
            </div>
        `;
    }
    
    document.getElementById('winnerMessage').style.display = 'block';
    document.getElementById('retryBtn').style.display = 'inline-block';
}

// Funkcje zarządzania meczami
function retryMatch() {
    resetMatch();
    
    if (gameMode === '1v1') {
        load1v1Team(selectedTeam);
    } else if (gameMode === 'bundesliga') {
        loadBundesligaTeam(selectedTeam);
    }
    
    document.getElementById('retryBtn').style.display = 'none';
}

// Funkcje resetowania
function resetMatch() {
    gameState.playerScore = 0;
    gameState.botScore = 0;
    gameState.gameWon = false;
    gameState.gameStarted = false;
    gameState.ballInPlay = false;
    gameState.roundWon = false;
    gameState.particles = [];
    gameState.ballRotation = 0;
    gameState.screenShake = 0;
    gameState.lastCollisionTime = 0;
    
    player.x = 100;
    player.y = canvas.height / 2;
    player.stunned = 0;
    player.pushbackX = 0;
    player.pushbackY = 0;
    
    // Reset bramkarza gracza jeśli istnieje
    if (playerGoalkeeper) {
        playerGoalkeeper.x = playerGoalkeeper.startX;
        playerGoalkeeper.y = playerGoalkeeper.startY;
        playerGoalkeeper.vx = 0;
        playerGoalkeeper.vy = 0;
    }
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    
    updateScore();
    document.getElementById('winnerMessage').style.display = 'none';
    document.getElementById('startMessage').style.display = 'block';
}

function resetGameState() {
    gameMode = null;
    selectedTeam = null;
    resetMatch();
}

function startGame() {
    gameState.gameStarted = true;
    document.getElementById('startMessage').style.display = 'none';
    launchBall();
}
