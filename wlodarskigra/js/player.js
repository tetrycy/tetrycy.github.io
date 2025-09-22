// player.js - przepisany od zera, maksymalnie prosty

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
    checkPlayerBallCollision();

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
        
        ball.x = player.x + nx * minDistance;
        ball.y = player.y + ny * minDistance;
        
        const kickPower = Math.max(6, Math.sqrt(player.vx * player.vx + player.vy * player.vy) + 3);
        ball.vx = nx * kickPower;
        ball.vy = ny * kickPower;
    }
}

function updateBots() {
    bots.forEach((bot) => {
        if (!gameState.ballInPlay && !bot.isGoalkeeper) {
            // Pozycja startowa przed rozpoczęciem gry
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
            updateFieldBot(bot);
        }
    });
    
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

function updateFieldBot(bot) {
    // Oblicz odległość do piłki
    const dx = ball.x - bot.x;
    const dy = ball.y - bot.y;
    const distanceToBall = Math.sqrt(dx * dx + dy * dy);
    const ballClose = distanceToBall < 100;
    
    let targetX, targetY;

    // Wybierz cel na podstawie roli
    if (bot.role === "attacker") {
        if (ballClose) {
            targetX = ball.x;
            targetY = ball.y;
        } else {
            targetX = canvas.width * 0.6;
            targetY = bot.preferredY || 200;
        }
    } 
    else if (bot.role === "midfielder") {
        if (ballClose) {
            targetX = ball.x;
            targetY = ball.y;
        } else {
            targetX = canvas.width * 0.65;
            targetY = bot.preferredY || 200;
        }
    }
    else if (bot.role === "defender") {
        if (ball.x > canvas.width * 0.6 && ballClose) {
            targetX = ball.x;
            targetY = ball.y;
        } else {
            targetX = canvas.width * 0.75;
            targetY = bot.preferredY || 200;
        }
    }
    else {
        // Default behavior
        targetX = canvas.width * 0.7;
        targetY = bot.preferredY || 200;
    }

    // Ruch do celu
    const dx2 = targetX - bot.x;
    const dy2 = targetY - bot.y;
    const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    if (distance > 5) {
        const speed = bot.maxSpeed || 3;
        bot.vx = (dx2 / distance) * speed;
        bot.vy = (dy2 / distance) * speed;
    } else {
        bot.vx *= 0.8;
        bot.vy *= 0.8;
    }

    // Aktualizuj pozycję
    bot.x += bot.vx;
    bot.y += bot.vy;

    // Ograniczenia pozycji
    const radius = bot.radius || 20;
    
    if (bot.canCrossHalf) {
        bot.x = Math.max(canvas.width / 2 - 50, Math.min(canvas.width - radius - 15, bot.x));
    } else {
        bot.x = Math.max(canvas.width / 2 + 10, Math.min(canvas.width - radius - 15, bot.x));
    }
    
    bot.y = Math.max(radius + 15, Math.min(canvas.height - radius - 15, bot.y));
}

function updateGoalkeeper(bot) {
    let targetY = ball.y;
    const radius = bot.radius || 24;
    
    bot.x = Math.max(canvas.width - 50, Math.min(canvas.width - 20, bot.x));
    targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
    
    const dy = targetY - bot.y;
    bot.vy = dy * 0.1;
    bot.y += bot.vy;
}
