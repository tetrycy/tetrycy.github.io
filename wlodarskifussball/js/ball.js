// ball.js - fizyka piłki i kolizje - Z RĘCZNYMI PRĘDKOŚCIAMI

/**
 * Oblicza skalowane granice bramki
 */
function getGoalBounds() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    const goalAreaHeight = 0.3 * scale;
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

function updateBall() {
    if (!gameState.ballInPlay || gameState.gameWon) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Rotacja piłki
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    gameState.ballRotation += speed * 0.05;

    // Odbicia od ścian - bez efektów
    if (ball.y <= ball.radius + 15 || ball.y >= canvas.height - ball.radius - 15) {
        ball.vy = -ball.vy;
        ball.y = ball.y <= ball.radius + 15 ? ball.radius + 15 : canvas.height - ball.radius - 15;
    }

    // Sprawdzenie goli z bramkarzem gracza - wcześniejsza detekcja
    if (ball.x <= 60 && ball.vx < 0) {
        const goalBounds = getGoalBounds();
        if (ball.y > goalBounds.top && ball.y < goalBounds.bottom) {
            // Sprawdź czy bramkarz gracza może zablokować
            if (playerGoalkeeper) {
                const distanceToGoalkeeper = Math.sqrt((ball.x - playerGoalkeeper.x) ** 2 + (ball.y - playerGoalkeeper.y) ** 2);
                if (distanceToGoalkeeper < ball.radius + playerGoalkeeper.radius) {
                    // Bramkarz odbija piłkę ZAWSZE od bramki (w prawo)
                    ball.vx = Math.abs(ball.vx) * 1.5; // Mocniejsze odbicie
                    ball.vy = ball.vy * 0.7 + (Math.random() - 0.5) * 6; // Losowy kierunek w pionie
                    
                    // Upewnij się że piłka leci od bramki
                    if (ball.vx < 4) ball.vx = 4; // Minimalna prędkość w prawo
                }
            }
        }
    }

    if (ball.x <= 15) {
        const goalBounds = getGoalBounds();
   if (ball.y > goalBounds.top && ball.y < goalBounds.bottom) {
            // Jeśli dotarło tutaj, to gol (bramkarz nie złapał wcześniej)
            gameState.botScore++;
            AudioSystem.play('goalConceded');
            updateScore();
            resetBallAfterGoal();
        } else {
            ball.vx = -ball.vx;
            ball.x = ball.radius + 15;
        }
    }

    if (ball.x >= canvas.width - 15) {
        const goalBounds = getGoalBounds();
 if (ball.y > goalBounds.top && ball.y < goalBounds.bottom) {
          gameState.playerScore++;
AudioSystem.playRandom(['goalScored', 'goalScored2']);
            updateScore();
            resetBallAfterGoal();
        } else {
            ball.vx = -ball.vx;
            ball.x = canvas.width - ball.radius - 15;
        }
    }

    // Kolizje z graczami - ulepszona wersja anty-chaos
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
            // Dłuższy cooldown kolizji - zapobiega wielokrotnym kolizjom
            if (currentTime - gameState.lastCollisionTime < 300) {
                return; // Pomiń kolizję jeśli za wcześnie (zwiększone z 150ms)
            }
            
            const nx = dx / distance;
            const ny = dy / distance;

            // Znacznie większe rozdzielenie obiektów
            const overlap = ball.radius + p.radius - distance;
            const separationDistance = overlap + 8; // Zwiększone z 2 do 8 pikseli bufora
            ball.x += nx * separationDistance;
            ball.y += ny * separationDistance;

            // Sprawdź czy piłka była praktycznie nieruchoma
            const ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const wasStationary = ballSpeed < 1;

            const dotProduct = ball.vx * nx + ball.vy * ny;
            
            if (p !== player) {
                const goalCenterY = canvas.height / 2;
                
                // Określ docelową bramkę w zależności od drużyny bota
                let targetGoalX;
                if (p.team === "player") {
                    targetGoalX = canvas.width - 15; // Drużyna gracza strzela w prawo
                } else {
                    targetGoalX = 15; // Drużyna przeciwnika strzela w lewo
                }
                
                const shootAngle = Math.atan2(goalCenterY - ball.y, targetGoalX - ball.x);
                
                const shootPowerX = Math.cos(shootAngle) * (p.shootPower || 1.2) * 6;
                const shootPowerY = Math.sin(shootAngle) * (p.shootPower || 1.2) * 6;
                
                ball.vx = (ball.vx - 2 * dotProduct * nx) * 0.3 + shootPowerX + p.vx * 0.2;
                ball.vy = (ball.vy - 2 * dotProduct * ny) * 0.3 + shootPowerY + p.vy * 0.2;
            } else {
                // Dla gracza - specjalne zachowanie w zależności od stanu piłki + odrzut
                if (wasStationary) {
                    // Piłka była nieruchoma - mocne kopnięcie w kierunku ruchu gracza
                    const playerSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    if (playerSpeed > 0) {
                     const kickPower = (player.shootPower || 8) ; // Użyj shootPower gracza
                        ball.vx = (p.vx / playerSpeed) * kickPower;
                        ball.vy = (p.vy / playerSpeed) * kickPower;
                    } else {
                        // Gracz stoi - delikatne odbicie
                        ball.vx = nx * 3;
                        ball.vy = ny * 3;
                    }
                } else {
                    // Piłka się toczyła - normalne odbicie z minimalnym wpływem gracza
                    ball.vx = ball.vx - 2 * dotProduct * nx + p.vx * 0.1; // Bardzo mały wpływ
                    ball.vy = ball.vy - 2 * dotProduct * ny + p.vy * 0.1;
                }
                
                // KLUCZOWE: Odepchnij gracza od piłki
                if (p === player) {
                    const pushPower = 3;
                    player.pushbackX = -nx * pushPower;  // Przeciwny kierunek do piłki
                    player.pushbackY = -ny * pushPower;
                    player.stunned = 8;  // 8 klatek ograniczonej responsywności
                }
            }

            // Zapewnij minimalną prędkość piłki po kolizji - używaj prędkości z drużyny
            const ballSpeeds = getBallSpeeds();
            const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (newSpeed < 2) {
                // Jeśli piłka za wolna, nadaj jej minimalną prędkość
                ball.vx = nx * 2;
                ball.vy = ny * 2;
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

    if (Math.abs(ball.vx) < 0.05 && Math.abs(ball.vy) < 0.05) {
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
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    gameState.ballInPlay = false;
}
