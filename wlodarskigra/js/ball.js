// ball.js - fizyka piłki i kolizje - POPRAWIONE KOLIZJE + BRAMKI

/**
 * Oblicza skalowane granice bramki
 */
function getGoalBounds() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Bardzo łagodne skalowanie bramek - minimum 60% oryginalnej wysokości
    // Na skali 0.25: 0.6 + 0.4 * 0.25 = 0.7, więc bramka będzie 21% 
    // Na skali 1.0: 0.6 + 0.4 * 1.0 = 1.0, więc bramka będzie 30% (bez zmian)
    const goalScaling = 0.6 + 0.4 * scale;
    const goalAreaHeight = 0.3 * goalScaling;
    
    const goalTop = 0.5 - goalAreaHeight/2;
    const goalBottom = 0.5 + goalAreaHeight/2;
    
    return {
        top: canvas.height * goalTop,
        bottom: canvas.height * goalBottom
    };
}

/**
 * Pobiera prędkości piłki dla aktualnej drużyny
 */
function getBallSpeeds() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    return {
        startSpeed: currentTeamData.ballSpeed || ball.startSpeed,
        maxSpeed: currentTeamData.ballMaxSpeed || ball.maxSpeed
    };
}

/**
 * Pobiera aktualną skalę boiska
 */
function getCurrentFieldScale() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    return currentTeamData.fieldScale || 1.0;
}

function updateBall() {
    if (!gameState.ballInPlay || gameState.gameWon) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Rotacja piłki
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    gameState.ballRotation += speed * 0.05;

    const scale = getCurrentFieldScale();

    // Odbicia od ścian - bez efektów
    if (ball.y <= ball.radius + 15 * scale || ball.y >= canvas.height - ball.radius - 15 * scale) {
        ball.vy = -ball.vy;
        ball.y = ball.y <= ball.radius + 15 * scale ? ball.radius + 15 * scale : canvas.height - ball.radius - 15 * scale;
    }

    // Sprawdzenie goli z bramkarzem gracza - wcześniejsza detekcja
    if (ball.x <= 60 * scale && ball.vx < 0) {
        const goalBounds = getGoalBounds();
        if (ball.y > goalBounds.top && ball.y < goalBounds.bottom) {
            // Sprawdź czy bramkarz gracza może zablokować
            if (playerGoalkeeper) {
                const distanceToGoalkeeper = Math.sqrt((ball.x - playerGoalkeeper.x) ** 2 + (ball.y - playerGoalkeeper.y) ** 2);
                if (distanceToGoalkeeper < ball.radius + playerGoalkeeper.radius) {
                    // Bramkarz odbija piłkę ZAWSZE od bramki (w prawo)
                    ball.vx = Math.abs(ball.vx) * 1.5; // Mocniejsze odbicie
                    ball.vy = ball.vy * 0.7 + (Math.random() - 0.5) * 6 * scale; // Losowy kierunek w pionie - skalowany
                    
                    // Upewnij się że piłka leci od bramki - skalowane
                    const minSpeed = 4 * scale;
                    if (ball.vx < minSpeed) ball.vx = minSpeed;
                }
            }
        }
    }

    if (ball.x <= 15 * scale) {
        const goalBounds = getGoalBounds();
        if (ball.y > goalBounds.top && ball.y < goalBounds.bottom) {
            // Jeśli dotarło tutaj, to gol (bramkarz nie złapał wcześniej)
            gameState.botScore++;
            updateScore();
            resetBallAfterGoal();
        } else {
            ball.vx = -ball.vx;
            ball.x = ball.radius + 15 * scale;
        }
    }

    if (ball.x >= canvas.width - 15 * scale) {
        const goalBounds = getGoalBounds();
        if (ball.y > goalBounds.top && ball.y < goalBounds.bottom) {
            gameState.playerScore++;
            updateScore();
            resetBallAfterGoal();
        } else {
            ball.vx = -ball.vx;
            ball.x = canvas.width - ball.radius - 15 * scale;
        }
    }

    // Kolizje z graczami - POPRAWIONE SKALOWANIE
    const currentTime = Date.now();
    const allPlayers = [player, ...bots];
    if (playerGoalkeeper) {
        allPlayers.push(playerGoalkeeper);
    }
    
    allPlayers.forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + p.radius) {
            // POPRAWIONY COOLDOWN - proporcjonalny do skali boiska
            const cooldownTime = 300 * scale; // Na 0.25 będzie 75ms, na 0.5 będzie 150ms
            if (currentTime - gameState.lastCollisionTime < cooldownTime) {
                return; // Pomiń kolizję jeśli za wcześnie
            }
            
            const nx = dx / distance;
            const ny = dy / distance;

            // POPRAWIONE ROZDZIELENIE - proporcjonalne do promienia gracza
            const overlap = ball.radius + p.radius - distance;
            const separationBuffer = Math.max(p.radius * 0.15, 1); // 15% promienia gracza, min 1 piksel
            const separationDistance = overlap + separationBuffer;
            ball.x += nx * separationDistance;
            ball.y += ny * separationDistance;

            // Sprawdź czy piłka była praktycznie nieruchoma
            const ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const wasStationary = ballSpeed < 1 * scale;

            const dotProduct = ball.vx * nx + ball.vy * ny;
            
            if (p !== player) {
                const goalCenterY = canvas.height / 2;
                
                // Określ docelową bramkę w zależności od drużyny bota
                let targetGoalX;
                if (p.team === "player") {
                    targetGoalX = canvas.width - 15 * scale; // Drużyna gracza strzela w prawo
                } else {
                    targetGoalX = 15 * scale; // Drużyna przeciwnika strzela w lewo
                }
                
                const shootAngle = Math.atan2(goalCenterY - ball.y, targetGoalX - ball.x);
                
                const shootPowerX = Math.cos(shootAngle) * (p.shootPower || 1.2) * 6 * scale;
                const shootPowerY = Math.sin(shootAngle) * (p.shootPower || 1.2) * 6 * scale;
                
                ball.vx = (ball.vx - 2 * dotProduct * nx) * 0.3 + shootPowerX + p.vx * 0.2;
                ball.vy = (ball.vy - 2 * dotProduct * ny) * 0.3 + shootPowerY + p.vy * 0.2;
            } else {
                // Dla gracza - specjalne zachowanie w zależności od stanu piłki + odrzut
                if (wasStationary) {
                    // Piłka była nieruchoma - mocne kopnięcie w kierunku ruchu gracza
                    const playerSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    if (playerSpeed > 0) {
                        const kickPower = (player.shootPower || 8) * scale; // SKALOWANE kopnięcie
                        ball.vx = (p.vx / playerSpeed) * kickPower;
                        ball.vy = (p.vy / playerSpeed) * kickPower;
                    } else {
                        // Gracz stoi - delikatne odbicie - SKALOWANE
                        ball.vx = nx * 3 * scale;
                        ball.vy = ny * 3 * scale;
                    }
                } else {
                    // Piłka się toczyła - normalne odbicie z minimalnym wpływem gracza
                    ball.vx = ball.vx - 2 * dotProduct * nx + p.vx * 0.1; // Bardzo mały wpływ
                    ball.vy = ball.vy - 2 * dotProduct * ny + p.vy * 0.1;
                }
                
                // KLUCZOWE: Odepchnij gracza od piłki - SKALOWANE
                if (p === player) {
                    const pushPower = 3 * scale;
                    player.pushbackX = -nx * pushPower;  // Przeciwny kierunek do piłki
                    player.pushbackY = -ny * pushPower;
                    player.stunned = Math.max(4, 8 * scale);  // Skalowany czas ogłuszenia
                }
            }

            // Zapewnij minimalną prędkość piłki po kolizji - SKALOWANE
            const ballSpeeds = getBallSpeeds();
            const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const minSpeed = 2 * scale;
            
            if (newSpeed < minSpeed) {
                // Jeśli piłka za wolna, nadaj jej minimalną prędkość
                ball.vx = nx * minSpeed;
                ball.vy = ny * minSpeed;
            } else if (newSpeed > ballSpeeds.maxSpeed) {
                // Użyj maksymalnej prędkości z definicji drużyny
                ball.vx = (ball.vx / newSpeed) * ballSpeeds.maxSpeed;
                ball.vy = (ball.vy / newSpeed) * ballSpeeds.maxSpeed;
            }
            
            // Ustaw cooldown
            gameState.lastCollisionTime = currentTime;
        }
    });

    // Tarcie
    ball.vx *= 0.998;
    ball.vy *= 0.998;

    // SKALOWANE progi zatrzymania piłki
    const stopThreshold = 0.05 * scale;
    if (Math.abs(ball.vx) < stopThreshold && Math.abs(ball.vy) < stopThreshold) {
        ball.vx = 0;
        ball.vy = 0;
        gameState.ballInPlay = false;
    }
}

function launchBall() {
    gameState.ballInPlay = true;
    const angle = (Math.random() - 0.5) * Math.PI * 0.4;
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    // Użyj prędkości startowej z definicji drużyny
    const ballSpeeds = getBallSpeeds();
    
    ball.vx = Math.cos(angle) * ballSpeeds.startSpeed * direction;
    ball.vy = Math.sin(angle) * ballSpeeds.startSpeed;
}

function resetBallAfterGoal() {
    // Reset piłki
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    gameState.ballInPlay = false;
    
    // PROSTE ROZWIĄZANIE - używaj tej samej logiki co przed meczem
    const scale = getCurrentFieldScale();
    
    bots.forEach(bot => {
        const isPlayerTeam = bot.team === "player";
        
        if (bot.isGoalkeeper) {
            // Bramkarze - pozycje przy bramkach
            bot.x = isPlayerTeam ? 40 * scale : canvas.width - 40 * scale;
            bot.y = canvas.height / 2;
        } else {
            // Boty polowe - pozycje przy środkowej linii (jak przed meczem)
            bot.x = isPlayerTeam ? canvas.width / 2 - 80 * scale : canvas.width / 2 + 80 * scale;
            bot.y = bot.startY || canvas.height / 2;
        }
        
        // Wyzeruj prędkości
        bot.vx = 0;
        bot.vy = 0;
    });
    
    // Reset bramkarza gracza jeśli istnieje
    if (playerGoalkeeper) {
        playerGoalkeeper.x = playerGoalkeeper.startX;
        playerGoalkeeper.y = playerGoalkeeper.startY;
        playerGoalkeeper.vx = 0;
        playerGoalkeeper.vy = 0;
    }
    
    // Reset gracza na pozycję startową
    player.x = 100;
    player.y = canvas.height / 2;
    player.vx = 0;
    player.vy = 0;
}
