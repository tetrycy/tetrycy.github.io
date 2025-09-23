// player.js - logika gracza i AI botów

// Sterowanie graczem + natychmiastowa kolizja - prędkość zmniejszona o 15%
function updatePlayer() {
    const speed = 5.1;

    player.vx = 0;
    player.vy = 0;
    
    if (keys['w']) player.vy = -speed;
    if (keys['s']) player.vy = speed;
    if (keys['a']) player.vx = -speed;
    if (keys['d']) player.vx = speed;

    player.x += player.vx;
    player.y += player.vy;

    // NATYCHMIAST po ruchu gracza sprawdź kolizję z piłką
    checkPlayerBallCollision();

    // Ograniczenia boiska
    if (gameMode === 'tournament' && gameState.currentRound === 0) {
        player.x = Math.max(player.radius + 15, Math.min(canvas.width / 2 - 10, player.x));
    } else {
        player.x = Math.max(player.radius + 15, Math.min(canvas.width - player.radius - 15, player.x));
    }
    
    player.y = Math.max(player.radius + 15, Math.min(canvas.height - player.radius - 15, player.y));
}

function checkPlayerBallCollision() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ball.radius + player.radius;

    if (distance < minDistance && distance > 0) {
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Ustaw piłkę dokładnie na krawędzi gracza
        ball.x = player.x + nx * minDistance;
        ball.y = player.y + ny * minDistance;
        
        // Nadaj piłce prędkość - MINIMUM 7 px/frame (zmniejszone o 15%)
        const kickPower = Math.max(7, Math.sqrt(player.vx * player.vx + player.vy * player.vy) + 4);
        ball.vx = nx * kickPower;
        ball.vy = ny * kickPower;
    }
}

// AI Botów + bramkarz gracza
function updateBots() {
    bots.forEach(bot => {
        if (!gameState.ballInPlay && !bot.isGoalkeeper) {
            const readyX = bot.isGoalkeeper ? canvas.width - 40 : canvas.width / 2 + 80;
            const readyY = bot.isGoalkeeper ? canvas.height / 2 : bot.startY || canvas.height / 2;
            
            bot.vx = (readyX - bot.x) * 0.1;
            bot.vy = (readyY - bot.y) * 0.1;
            
            bot.x += bot.vx;
            bot.y += bot.vy;
            return;
        }

        if (bot.isGoalkeeper) {
            updateGoalkeeper(bot);
        } else {
            updateFieldBot(bot);
        }
    });
    
    // Aktualizuj bramkarza gracza jeśli istnieje
    if (playerGoalkeeper) {
        updatePlayerGoalkeeper();
    }
}

function updatePlayerGoalkeeper() {
    if (!gameState.ballInPlay) {
        // Wróć do pozycji startowej
        playerGoalkeeper.vx = (playerGoalkeeper.startX - playerGoalkeeper.x) * 0.1;
        playerGoalkeeper.vy = (playerGoalkeeper.startY - playerGoalkeeper.y) * 0.1;
    } else {
        // Śledź piłkę ale tylko w bramce
        let targetY = ball.y;
        playerGoalkeeper.x = Math.max(20, Math.min(50, playerGoalkeeper.x));
        targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
        
        const dy = targetY - playerGoalkeeper.y;
        playerGoalkeeper.vy = dy * 0.08; // Nieco wolniejszy niż przeciwny bramkarz
    }
    
    playerGoalkeeper.x += playerGoalkeeper.vx;
    playerGoalkeeper.y += playerGoalkeeper.vy;
}

function updateFieldBot(bot) {
    const distanceToBall = Math.sqrt((ball.x - bot.x) ** 2 + (ball.y - bot.y) ** 2);
    const ballInReach = distanceToBall < 120;
    
    let targetX, targetY;

    // Sprawdź odległości do kolegów z drużyny (unikaj skupiania się)
    const teammateSpacing = 60;
    let spacingAdjustmentX = 0;
    let spacingAdjustmentY = 0;
    
    bots.forEach(teammate => {
        if (teammate !== bot && !teammate.isGoalkeeper) {
            const dx = bot.x - teammate.x;
            const dy = bot.y - teammate.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < teammateSpacing && distance > 0) {
                const pushStrength = (teammateSpacing - distance) / teammateSpacing;
                spacingAdjustmentX += (dx / distance) * pushStrength * 30;
                spacingAdjustmentY += (dy / distance) * pushStrength * 30;
            }
        }
    });

    // Różne zachowania w zależności od roli
    switch(bot.role) {
        case "attacker":
            if (ballInReach || ball.x > canvas.width * 0.3) {
                // Napastnicy agresywnie gonią piłkę
                const predictTime = 6;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                
                if (distanceToBall < 50) {
                    // Pozycjonuj się za piłką do strzału
                    const goalCenterY = canvas.height / 2;
                    const angleToGoal = Math.atan2(goalCenterY - ball.y, 20 - ball.x);
                    targetX = ball.x + Math.cos(angleToGoal + Math.PI) * 30;
                    targetY = ball.y + Math.sin(angleToGoal + Math.PI) * 30;
                }
            } else {
                // Czekaj w pozycji ofensywnej
                targetX = canvas.width * 0.6;
                targetY = bot.preferredY;
            }
            break;
            
        case "midfielder":
            if (ballInReach) {
                // Pomocnicy wspierają grę
                targetX = ball.x + (Math.random() - 0.5) * 40;
                targetY = ball.y + (Math.random() - 0.5) * 40;
            } else {
                // Trzymaj pozycję centralną
                targetX = canvas.width * 0.65;
                targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.3;
            }
            break;
            
        case "defender":
        default:
            if (ball.x > canvas.width * 0.6 && ballInReach) {
                // Obrońcy reagują tylko gdy piłka blisko
                targetX = ball.x + 20;
                targetY = ball.y;
            } else {
                // Trzymaj pozycję defensywną
                targetX = canvas.width * 0.75;
                targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.2;
            }
            break;
    }

    // Zastosuj korektę rozstawienia
    targetX += spacingAdjustmentX;
    targetY += spacingAdjustmentY;

    // System błędów dla różnych przeciwników
    let errorChance;
    if (gameMode === 'tournament') {
        switch(gameState.currentRound) {
            case 0: errorChance = 0.15; break;
            case 1: errorChance = 0.10; break;
            case 2: errorChance = 0.08; break;
            case 3: errorChance = 0.06; break;
            case 4: errorChance = 0.04; break;
            default: errorChance = 0.08;
        }
    } else {
        switch(selectedTeam) {
            case 0: errorChance = 0.15; break; // VFL Oldenburg
            case 1: errorChance = 0.10; break; // SV Waldorf Mannheim  
            case 2: errorChance = 0.12; break; // FC Hansa Rostock - zwiększone błędy
            case 3: errorChance = 0.06; break; // Eintracht Braunschweig
            case 4: errorChance = 0.04; break; // Lokomotiv Leipzig
            case 5: errorChance = 0.20; break; // FC Carl Zeiss Jena
            case 6: errorChance = 0.18; break; // SpVgg Unterhaching
            default: errorChance = 0.08;
        }
    }
    
    // Dodaj błędy w zależności od roli
    let roleErrorMultiplier = 1.0;
    switch(bot.role) {
        case "attacker": roleErrorMultiplier = 0.8; break;  // Napastnicy bardziej precyzyjni
        case "midfielder": roleErrorMultiplier = 1.0; break;
        case "defender": roleErrorMultiplier = 1.2; break;  // Obrońcy mniej zwinni
    }
    
    if (Math.random() < errorChance * roleErrorMultiplier) {
        targetX += (Math.random() - 0.5) * 60;
        targetY += (Math.random() - 0.5) * 60;
    }

    const dx = targetX - bot.x;
    const dy = targetY - bot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 3) {
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;
        
        // Stała prędkość - brak bonusów
        const currentSpeed = bot.maxSpeed;
        
        bot.vx = normalizedX * currentSpeed;
        bot.vy = normalizedY * currentSpeed;
    } else {
        bot.vx *= 0.8;
        bot.vy *= 0.8;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;

    // Ograniczenia pozycji
    if (bot.canCrossHalf) {
        bot.x = Math.max(canvas.width / 2 - 50, Math.min(canvas.width - bot.radius - 15, bot.x));
    } else {
        bot.x = Math.max(canvas.width / 2 + 10, Math.min(canvas.width - bot.radius - 15, bot.x));
    }
    
    bot.y = Math.max(bot.radius + 15, Math.min(canvas.height - bot.radius - 15, bot.y));
}

function updateGoalkeeper(bot) {
    let targetY = ball.y;
    bot.x = Math.max(canvas.width - 50, Math.min(canvas.width - 20, bot.x));
    targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
    
    const dy = targetY - bot.y;
    bot.vy = dy * 0.12;
    bot.y += bot.vy;
}
