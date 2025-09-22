// player.js - zoptymalizowana logika gracza i AI botów z unikalną rolą Hajto

// Sterowanie graczem - uproszczone
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

    // Natychmiast sprawdź kolizję z piłką
    checkPlayerBallCollision();

    // Ograniczenia boiska
    player.x = Math.max(player.radius + 15, Math.min(canvas.width - player.radius - 15, player.x));
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
        
        // Ustaw piłkę na krawędzi gracza
        ball.x = player.x + nx * minDistance;
        ball.y = player.y + ny * minDistance;
        
        // Nadaj piłce prędkość
        const kickPower = Math.max(6, Math.sqrt(player.vx * player.vx + player.vy * player.vy) + 3);
        ball.vx = nx * kickPower;
        ball.vy = ny * kickPower;
    }
}

// Zoptymalizowane AI botów
function updateBots() {
    bots.forEach((bot, index) => {
        if (!gameState.ballInPlay && !bot.isGoalkeeper) {
            const readyX = canvas.width / 2 + 80;
            const readyY = bot.startY || canvas.height / 2;
            
            bot.vx = (readyX - bot.x) * 0.1;
            bot.vy = (readyY - bot.y) * 0.1;
            
            bot.x += bot.vx;
            bot.y += bot.vy;
            return;
        }

        if (bot.isGoalkeeper) {
            updateGoalkeeper(bot);
        } else {
            updateFieldBot(bot, index);
        }
    });
    
    // Bramkarz gracza
    if (playerGoalkeeper) {
        updatePlayerGoalkeeper();
    }
}

function updatePlayerGoalkeeper() {
    if (!gameState.ballInPlay) {
        playerGoalkeeper.vx = (playerGoalkeeper.startX - playerGoalkeeper.x) * 0.1;
        playerGoalkeeper.vy = (playerGoalkeeper.startY - playerGoalkeeper.y) * 0.1;
    } else {
        let targetY = ball.y;
        playerGoalkeeper.x = Math.max(20, Math.min(50, playerGoalkeeper.x));
        targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
        
        const dy = targetY - playerGoalkeeper.y;
        playerGoalkeeper.vy = dy * 0.08;
    }
    
    playerGoalkeeper.x += playerGoalkeeper.vx;
    playerGoalkeeper.y += playerGoalkeeper.vy;
}

function updateFieldBot(bot, index) {
    // Optymalizacja: oblicz distanceToBall tylko co 3 klatki
    if (gameState.frameCount % 3 === index % 3) {
        const dx = ball.x - bot.x;
        const dy = ball.y - bot.y;
        bot.cachedDistanceToBall = Math.sqrt(dx * dx + dy * dy);
    }
    
    const distanceToBall = bot.cachedDistanceToBall || 999;
    const ballInReach = distanceToBall < 100;
    
    let targetX, targetY;

    // Pozycjonowanie według roli
    switch(bot.role) {
        case "attacker":
            if (ballInReach) {
                targetX = ball.x;
                targetY = ball.y;
            } else {
                targetX = canvas.width * 0.6;
                targetY = bot.preferredY;
            }
            break;
            
        case "midfielder":
            if (ballInReach) {
                targetX = ball.x + (Math.random() - 0.5) * 30;
                targetY = ball.y + (Math.random() - 0.5) * 30;
            } else {
                targetX = canvas.width * 0.65;
                targetY = bot.preferredY;
            }
            break;

        case "hajto":
            // UNIKALNA LOGIKA DLA HAJTO - agresywny obrońca w ćwierci boiska
            if (ballInReach || distanceToBall < 150) {
                // Aktywnie goni piłkę gdy w zasięgu
                targetX = ball.x;
                targetY = ball.y;
            } else {
                // Pozycja defensywna - patroluje między bramką a ćwiercią boiska
                const patrolX = canvas.width * 0.85; // 85% boiska
                targetX = patrolX;
                
                // Śledzi piłkę pionowo, ale z ograniczeniem
                if (ball.y < canvas.height * 0.3) {
                    targetY = canvas.height * 0.3; // Nie idzie za wysoko
                } else if (ball.y > canvas.height * 0.7) {
                    targetY = canvas.height * 0.7; // Nie idzie za nisko
                } else {
                    targetY = ball.y; // Śledzi piłkę normalnie
                }
            }
            
            // Ograniczenia ruchu Hajto - tylko ćwierć boiska
            targetX = Math.max(canvas.width * 0.75, Math.min(canvas.width - 30, targetX));
            break;
            
        case "defender":
        default:
            if (ball.x > canvas.width * 0.6 && ballInReach) {
                targetX = ball.x;
                targetY = ball.y;
            } else {
                targetX = canvas.width * 0.75;
                targetY = bot.preferredY;
            }
            break;
    }

    // Uproszczony system błędów - tylko co 5 klatek
    if (gameState.frameCount % 5 === 0) {
        let errorChance = 0.08;
        
        if (gameMode === '1v1') {
            switch(selectedTeam) {
                case 0: errorChance = 0.08; break; // HAJTO - mniejszy błąd (był 0.12)
                default: errorChance = 0.10;
            }
        } else if (gameMode === 'bundesliga') {
            const errorLevels = [0.15, 0.10, 0.12, 0.06, 0.04, 0.20, 0.18];
            errorChance = errorLevels[selectedTeam] || 0.08;
        }
        
        // Hajto robi mniej błędów dzięki doświadczeniu
        if (bot.role === "hajto") {
            errorChance *= 0.7;
        }
        
        if (Math.random() < errorChance) {
            targetX += (Math.random() - 0.5) * 40;
            targetY += (Math.random() - 0.5) * 40;
        }
        
        // Cache target dla kolejnych klatek
        bot.cachedTargetX = targetX;
        bot.cachedTargetY = targetY;
    } else {
        targetX = bot.cachedTargetX || targetX;
        targetY = bot.cachedTargetY || targetY;
    }

    const dx = targetX - bot.x;
    const dy = targetY - bot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 3) {
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;
        
        // Zastosuj aggressiveness jako modyfikator prędkości
        let speedModifier = 1.0;
        if (bot.aggressiveness) {
            speedModifier = 0.7 + (bot.aggressiveness * 0.3); // Od 70% do 100% prędkości
        }
        
        bot.vx = normalizedX * bot.maxSpeed * speedModifier;
        bot.vy = normalizedY * bot.maxSpeed * speedModifier;
    } else {
        bot.vx *= 0.7;
        bot.vy *= 0.7;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;

    // Ograniczenia pozycji
    if (bot.role === "hajto") {
        // Hajto ograniczony do ćwierci boiska (75%-100%)
        bot.x = Math.max(canvas.width * 0.75, Math.min(canvas.width - bot.radius - 15, bot.x));
    } else if (bot.canCrossHalf) {
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
    bot.vy = dy * 0.1;
    bot.y += bot.vy;
}
