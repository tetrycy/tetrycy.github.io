// ball.js - zoptymalizowana fizyka piłki i kolizje

function updateBall() {
    if (!gameState.ballInPlay || gameState.gameWon) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Uproszczona rotacja piłki
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    gameState.ballRotation += speed * 0.03;

    // Odbicia od ścian
    if (ball.y <= ball.radius + 15 || ball.y >= canvas.height - ball.radius - 15) {
        ball.vy = -ball.vy * 0.8; // Lekkie tłumienie
        ball.y = ball.y <= ball.radius + 15 ? ball.radius + 15 : canvas.height - ball.radius - 15;
    }

    // Wcześniejsza detekcja goli z bramkarzem gracza
    if (ball.x <= 60 && ball.vx < 0) {
        if (ball.y > canvas.height * 0.35 && ball.y < canvas.height * 0.65) {
            if (playerGoalkeeper) {
                const dx = ball.x - playerGoalkeeper.x;
                const dy = ball.y - playerGoalkeeper.y;
                const distance = dx * dx + dy * dy; // Bez Math.sqrt - szybsze
                const minDistanceSquared = (ball.radius + playerGoalkeeper.radius) ** 2;
                
                if (distance < minDistanceSquared) {
                    ball.vx = Math.abs(ball.vx) * 1.3;
                    ball.vy = ball.vy * 0.7 + (Math.random() - 0.5) * 4;
                    if (ball.vx < 3) ball.vx = 3;
                }
            }
        }
    }

    // Sprawdzenie goli
    if (ball.x <= 15) {
        if (ball.y > canvas.height * 0.35 && ball.y < canvas.height * 0.65) {
            gameState.botScore++;
            updateScore();
            resetBallAfterGoal();
        } else {
            ball.vx = -ball.vx * 0.8;
            ball.x = ball.radius + 15;
        }
    }

    if (ball.x >= canvas.width - 15) {
        if (ball.y > canvas.height * 0.35 && ball.y < canvas.height * 0.65) {
            gameState.playerScore++;
            updateScore();
            resetBallAfterGoal();
        } else {
            ball.vx = -ball.vx * 0.8;
            ball.x = canvas.width - ball.radius - 15;
        }
    }

    // Zoptymalizowane kolizje z graczami
    const currentTime = Date.now();
    if (currentTime - gameState.lastCollisionTime > 100) { // Skrócony cooldown z 300ms na 100ms
        const allPlayers = [player, ...bots];
        if (playerGoalkeeper) {
            allPlayers.push(playerGoalkeeper);
        }
        
        for (let i = 0; i < allPlayers.length; i++) {
            const p = allPlayers[i];
            const dx = ball.x - p.x;
            const dy = ball.y - p.y;
            const distanceSquared = dx * dx + dy * dy; // Bez Math.sqrt
            const minDistanceSquared = (ball.radius + p.radius) ** 2;

            if (distanceSquared < minDistanceSquared) {
                const distance = Math.sqrt(distanceSquared); // Tylko gdy potrzeba
                const nx = dx / distance;
                const ny = dy / distance;

                // Rozdzielenie obiektów
                const overlap = ball.radius + p.radius - distance;
                ball.x += nx * (overlap + 3);
                ball.y += ny * (overlap + 3);

                const ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                const dotProduct = ball.vx * nx + ball.vy * ny;
                
                // Minimalne efekty cząsteczkowe
                createParticles(ball.x, ball.y, p.color, 2);
                
                if (p !== player) {
                    // AI strzela w kierunku bramki - siła zależy od shootPower bota
                    const goalCenterY = canvas.height / 2;
                    const shootAngle = Math.atan2(goalCenterY - ball.y, 15 - ball.x);
                    
                    const basePower = 5;
                    const shootPowerX = Math.cos(shootAngle) * basePower * (p.shootPower || 1.0);
                    const shootPowerY = Math.sin(shootAngle) * basePower * (p.shootPower || 1.0);
                    
                    ball.vx = (ball.vx - 1.5 * dotProduct * nx) * 0.4 + shootPowerX;
                    ball.vy = (ball.vy - 1.5 * dotProduct * ny) * 0.4 + shootPowerY;
                    
                    // Większe boty dają piłce więcej prędkości
                    const sizeMultiplier = (p.radius || 20) / 20;
                    ball.vx *= sizeMultiplier;
                    ball.vy *= sizeMultiplier;
                } else {
                    // Gracz kopie piłkę
                    if (ballSpeed < 1) {
                        // Piłka nieruchoma - mocne kopnięcie
                        const playerSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                        if (playerSpeed > 0) {
                            ball.vx = (p.vx / playerSpeed) * 7;
                            ball.vy = (p.vy / playerSpeed) * 7;
                        } else {
                            ball.vx = nx * 4;
                            ball.vy = ny * 4;
                        }
                    } else {
                        // Piłka w ruchu - odbicie
                        ball.vx = ball.vx - 1.8 * dotProduct * nx + p.vx * 0.1;
                        ball.vy = ball.vy - 1.8 * dotProduct * ny + p.vy * 0.1;
                    }
                }

                // Zapewnij minimalną prędkość
                const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                if (newSpeed < 1.5) {
                    ball.vx = nx * 1.5;
                    ball.vy = ny * 1.5;
                } else if (newSpeed > ball.maxSpeed) {
                    ball.vx = (ball.vx / newSpeed) * ball.maxSpeed;
                    ball.vy = (ball.vy / newSpeed) * ball.maxSpeed;
                }
                
                gameState.lastCollisionTime = currentTime;
                break; // Tylko jedna kolizja na raz
            }
        }
    }

    // Tarcie - zmniejszone
    ball.vx *= 0.999;
    ball.vy *= 0.999;

    // Zatrzymanie piłki
    if (Math.abs(ball.vx) < 0.03 && Math.abs(ball.vy) < 0.03) {
        ball.vx = 0;
        ball.vy = 0;
        gameState.ballInPlay = false;
    }
}

function launchBall() {
    gameState.ballInPlay = true;
    const angle = (Math.random() - 0.5) * Math.PI * 0.3;
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    ball.vx = Math.cos(angle) * ball.startSpeed * direction;
    ball.vy = Math.sin(angle) * ball.startSpeed;
}

function resetBallAfterGoal() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    gameState.ballInPlay = false;
}
