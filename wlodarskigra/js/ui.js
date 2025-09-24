// ui.js - interfejs użytkownika, menu i ekrany

// W ui.js - dodaj na górze pliku, tuż po komentarzach:

// Parametry Włodarskiego dla różnych skal boisk
const wlodarskiParameters = {
    1.0: {
        radius: 20,
        speed: 5.1
    },
    0.75: {
        radius: 15,
        speed: 3.8
    },
    0.5: {
        radius: 10,
        speed: 2.6
    },
    0.25: {
        radius: 50,
        speed: 8.3
    }
};

// W funkcji resetMatch() zamień tę linię:
// player.radius = 20 * scale;

// Na:
function resetMatch() {
    gameState.playerScore = 0;
    gameState.botScore = 0;
    gameState.gameWon = false;
    gameState.gameStarted = false;
    gameState.ballInPlay = false;
    gameState.roundWon = false;
    gameState.ballRotation = 0;
    gameState.lastCollisionTime = 0; // Reset cooldown
    
    // Pobierz aktualną skalę boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Ustaw parametry Włodarskiego w zależności od skali boiska
    const playerParams = wlodarskiParameters[scale] || wlodarskiParameters[1.0];
    
    player.x = 100;
    player.y = canvas.height / 2;
    player.radius = playerParams.radius;
    player.speed = playerParams.speed;
    player.stunned = 0;
    player.pushbackX = 0;
    player.pushbackY = 0;
    
    // ... reszta bez zmian
}

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
    
    // Reset stanu gry
    resetGameState();
}

function showGame() {
    // Ukryj menu
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('teamSelection').style.display = 'none';
    
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
     radius: 20 * scale,
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
    radius: 20 * scale,
            vx: 0,
            vy: 0,
            startX: teamData.playerGoalkeeper.x,
            startY: teamData.playerGoalkeeper.y
        };
    } else {
        playerGoalkeeper = null;
    }
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
    
    // Pobierz aktualną skalę boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
     
       player.x = 100;
    player.y = canvas.height / 2;
    player.radius = 20 * scale;  // DODAJ TĘ LINIĘ
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
    ball.radius = 8 * scale;  // DODAJ TĘ LINIĘ
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
