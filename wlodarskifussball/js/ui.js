// ui.js - interfejs użytkownika, menu i ekrany

// Funkcje menu
function startTournament() {
    gameMode = 'tournament';
    gameState.currentRound = 0;
    showGame();
    loadCurrentTeam();
}

function showTeamSelection() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('teamSelection').style.display = 'block';
}

function startFriendly(teamIndex) {
    gameMode = 'friendly';
    selectedTeam = teamIndex;
    showGame();
    loadFriendlyTeam(teamIndex);
}

function backToMenu() {
    // Ukryj wszystkie ekrany gry
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameControls').style.display = 'none';
    document.getElementById('roundInfo').classList.add('hidden');
    document.getElementById('scoreDisplay').classList.add('hidden');
    document.getElementById('teamSelection').style.display = 'none';
    
    // Pokaż menu główne
    document.getElementById('mainMenu').style.display = 'block';
    
    // Odtwórz muzykę menu
    AudioSystem.play('menu');
    
    // Reset stanu gry
    resetGameState();
}

function showGame() {
    // Ukryj menu
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('teamSelection').style.display = 'none';
    
    // Muzyka menu gra dalej podczas meczu
    
    // Pokaż grę
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('gameControls').style.display = 'block';
    document.getElementById('roundInfo').classList.remove('hidden');
    document.getElementById('scoreDisplay').classList.remove('hidden');
}

function loadCurrentTeam() {
    const currentTeamData = teams[gameState.currentRound];
    loadTeamData(currentTeamData);
    
    if (gameMode === 'tournament') {
        document.getElementById('roundInfo').textContent = 
            `RUNDE ${currentTeamData.number}: ${currentTeamData.playerTeam} vs ${currentTeamData.opponentTeam}`;
        document.getElementById('startTitle').textContent = `🚀 RUNDE ${currentTeamData.number} - DRÜCKEN SIE LEERTASTE! 🚀`;
    }
}

function loadFriendlyTeam(teamIndex) {
    const teamData = teams[teamIndex];
    loadTeamData(teamData);
    
    document.getElementById('roundInfo').textContent = 
        `FREUNDSCHAFTSSPIEL: ${teamData.playerTeam} vs ${teamData.opponentTeam}`;
    document.getElementById('startTitle').textContent = `🚀 FREUNDSCHAFTSSPIEL - DRÜCKEN SIE LEERTASTE! 🚀`;
}

function loadTeamData(teamData) {
    document.getElementById('playerTeam').textContent = teamData.playerTeam;
    document.getElementById('botTeam').textContent = teamData.opponentTeam;
    document.getElementById('startSubtitle').textContent = "*** SPIEL BEGINNT! ***";
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
    
    // Ładuj bramkarza gracza jeśli istnieje
    if (teamData.hasPlayerGoalkeeper && teamData.playerGoalkeeper) {
        playerGoalkeeper = {
            ...teamData.playerGoalkeeper,
            radius: Math.max(3, (teamData.playerGoalkeeper.radius || 20) * scale),
            vx: 0,
            vy: 0,
            startX: teamData.playerGoalkeeper.x,
            startY: teamData.playerGoalkeeper.y
        };
    } else {
        playerGoalkeeper = null;
    }
    
    // Załaduj parametry gracza z definicji drużyny
    player.radius = Math.max(3, teamData.playerRadius || 20);
    player.speed = teamData.playerSpeed || 5.1;
player.shootPower = teamData.playerShootPower || 1.5;
    
    // Załaduj parametry piłki z definicji drużyny
    ball.startSpeed = teamData.ballSpeed || 5.7;
    ball.maxSpeed = teamData.ballMaxSpeed || 11.5;
}

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
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    
    if (gameMode === 'tournament') {
        const isLastRound = gameState.currentRound >= teams.length - 1;
        
        document.getElementById('winnerMessage').innerHTML = `
            <div>🎉 RUNDE ${currentTeamData.number} GEWONNEN! 🎉</div>
            <div style="font-size: 14px; margin: 10px 0; color: #00ffff;">
                SV BABELSBERG 04 BESIEGT ${currentTeamData.opponentTeam}!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                ${isLastRound ? '*** TURNIER GEWONNEN! MEISTER! ***' : 'Bereit für die nächste Runde?'}
            </div>
        `;
        
        if (!isLastRound) {
            document.getElementById('nextRoundBtn').style.display = 'inline-block';
        }
    } else {
        document.getElementById('winnerMessage').innerHTML = `
            <div>🎉 FREUNDSCHAFTSSPIEL GEWONNEN! 🎉</div>
            <div style="font-size: 14px; margin: 10px 0; color: #00ffff;">
                SV BABELSBERG 04 BESIEGT ${currentTeamData.opponentTeam}!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Gut gespielt!
            </div>
        `;
    }
    
    document.getElementById('winnerMessage').style.display = 'block';
    document.getElementById('retryBtn').style.display = 'inline-block';
}

function showLoseMessage() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    
    if (gameMode === 'tournament') {
        document.getElementById('winnerMessage').innerHTML = `
            <div>💀 RUNDE ${currentTeamData.number} VERLOREN! 💀</div>
            <div style="font-size: 14px; margin: 10px 0; color: #ff4444;">
                ${currentTeamData.opponentTeam} GEWINNT!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Runde wiederholen?
            </div>
        `;
    } else {
        document.getElementById('winnerMessage').innerHTML = `
            <div>💀 FREUNDSCHAFTSSPIEL VERLOREN! 💀</div>
            <div style="font-size: 14px; margin: 10px 0; color: #ff4444;">
                ${currentTeamData.opponentTeam} GEWINNT!
            </div>
            <div style="font-size: 12px; color: #ffff00;">
                Nochmal versuchen?
            </div>
        `;
    }
    
    document.getElementById('winnerMessage').style.display = 'block';
    document.getElementById('retryBtn').style.display = 'inline-block';
    document.getElementById('nextRoundBtn').style.display = 'none';
}

function nextRound() {
    if (gameMode === 'tournament') {
        gameState.currentRound++;
        resetMatch();
        loadCurrentTeam();
        
        document.getElementById('nextRoundBtn').style.display = 'none';
    }
}

function retryMatch() {
    resetMatch();
    
    if (gameMode === 'tournament') {
        loadCurrentTeam();
    } else {
        loadFriendlyTeam(selectedTeam);
    }
    
    document.getElementById('retryBtn').style.display = 'none';
    document.getElementById('nextRoundBtn').style.display = 'none';
}

function resetMatch() {
    gameState.playerScore = 0;
    gameState.botScore = 0;
    gameState.gameWon = false;
    gameState.gameStarted = false;
    gameState.ballInPlay = false;
    gameState.roundWon = false;
    gameState.ballRotation = 0;
    gameState.lastCollisionTime = 0; // Reset cooldown

    // Resetuj tylko pozycję gracza, parametry są ładowane w loadTeamData()
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
    
    // Resetuj tylko pozycję piłki, rozmiar jest ustawiany w game.js
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
    gameState.currentRound = 0;
    resetMatch();
}

function startGame() {
    gameState.gameStarted = true;
    document.getElementById('startMessage').style.display = 'none';
    launchBall();
}
