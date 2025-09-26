// player.js - główna logika gracza i AI botów (bez definicji ról)

// ============ STAŁE I KONFIGURACJA ============
const GAME_CONSTANTS = {
    // Kolizje i fizyka
    COLLISION_COOLDOWN: 300,
    SEPARATION_BUFFER: 8,
    PUSH_BACK_POWER: 3,
    STUN_DURATION: 8,
    
    // AI i pozycjonowanie
    TEAMMATE_SPACING: 60,
    BALL_REACH_DISTANCE: 120,
    CLOSE_BALL_DISTANCE: 40,
    VERY_CLOSE_BALL_DISTANCE: 25,
};

// ============ FUNKCJE POMOCNICZE ============

/**
 * Sprawdza czy piłka jest w zasięgu bota
 */
function isBallInReach(bot, reachDistance = GAME_CONSTANTS.BALL_REACH_DISTANCE) {
    const scale = getCurrentScale();
    const distance = getDistanceToBall(bot);
    return distance < reachDistance * scale;
}

/**
 * Oblicza odległość między botem a piłką
 */
function getDistanceToBall(bot) {
    return Math.sqrt((ball.x - bot.x) ** 2 + (ball.y - bot.y) ** 2);
}

/**
 * Oblicza korektę rozstawienia względem kolegów z drużyny
 */
function calculateTeammateSpacing(bot) {
    const scale = getCurrentScale();
    const spacing = GAME_CONSTANTS.TEAMMATE_SPACING * scale;
    let adjustmentX = 0, adjustmentY = 0;
    
    bots.forEach(teammate => {
        if (teammate !== bot && !teammate.isGoalkeeper && teammate.team === bot.team) {
            const dx = bot.x - teammate.x;
            const dy = bot.y - teammate.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < spacing && distance > 0) {
                const pushStrength = (spacing - distance) / spacing;
                adjustmentX += (dx / distance) * pushStrength * 30 * scale;
                adjustmentY += (dy / distance) * pushStrength * 30 * scale;
            }
        }
    });
    
    return { x: adjustmentX, y: adjustmentY };
}

// ============ GŁÓWNE FUNKCJE ============

/**
 * Sterowanie graczem z natychmiastową kolizją
 */
function updatePlayer() {
    const speed = player.speed || 5.1;

    player.vx = 0;
    player.vy = 0;
    
    if (keys['w']) player.vy = -speed;
    if (keys['s']) player.vy = speed;
    if (keys['a']) player.vx = -speed;
    if (keys['d']) player.vx = speed;

    player.x += player.vx;
    player.y += player.vy;

    // Natychmiastowa kolizja z piłką
    checkPlayerBallCollision();

    // Ograniczenia boiska
    applyFieldBoundaries(player);
}

/**
 * Sprawdza kolizje gracza z piłką
 */
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
        const scale = getCurrentScale();
        const kickPower = Math.max(7 * scale, Math.sqrt(player.vx * player.vx + player.vy * player.vy) + 4 * scale);
        ball.vx = nx * kickPower;
        ball.vy = ny * kickPower;
    }
}

/**
 * Aktualizacja wszystkich botów
 */
function updateBots() {
    bots.forEach(bot => {
        if (!gameState.ballInPlay && !bot.isGoalkeeper) {
            positionBotForKickoff(bot);
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

/**
 * Pozycjonuje bota przed rozpoczęciem gry
 */
function positionBotForKickoff(bot) {
    const isPlayerTeam = bot.team === "player";
    const scale = getCurrentScale();
    
    let readyX, readyY;
    
    if (bot.isGoalkeeper) {
        readyX = isPlayerTeam ? 40 * scale : canvas.width - 40 * scale;
        readyY = canvas.height / 2;
    } else {
        readyX = isPlayerTeam ? canvas.width / 2 - 80 * scale : canvas.width / 2 + 80 * scale;
        readyY = bot.startY || canvas.height / 2;
    }
    
    bot.vx = (readyX - bot.x) * 0.1;
    bot.vy = (readyY - bot.y) * 0.1;
    
    bot.x += bot.vx;
    bot.y += bot.vy;
}

/**
 * Główna funkcja aktualizacji bota na boisku - UPROSZCZONA
 */
function updateFieldBot(bot) {
    const isPlayerTeam = bot.team === "player";
    const scale = getCurrentScale();
    const distanceToBall = getDistanceToBall(bot);
    const ballInReach = isBallInReach(bot);

    // Oblicz korektę rozstawienia
    const spacing = calculateTeammateSpacing(bot);
    
    // Określ pozycję docelową w zależności od roli - UŻYWAJĄC ROLES.JS
    const roleFunction = PlayerRoles[bot.role] || PlayerRoles.default;
    let target = roleFunction(bot, isPlayerTeam, ballInReach, distanceToBall);

    // Zastosuj korektę rozstawienia
    target.x += spacing.x;
    target.y += spacing.y;

    // Porusz bota w kierunku celu
    moveBotToTarget(bot, target);
    
    // Zastosuj ograniczenia boiska
    applyFieldBoundaries(bot);
}

/**
 * Porusza bota w kierunku celu
 */
function moveBotToTarget(bot, target) {
    const dx = target.x - bot.x;
    const dy = target.y - bot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scale = getCurrentScale();
    
    if (distance > 3 * scale) {
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;
        
        const currentSpeed = bot.maxSpeed;
        
        bot.vx = normalizedX * currentSpeed;
        bot.vy = normalizedY * currentSpeed;
    } else {
        bot.vx *= 0.8;
        bot.vy *= 0.8;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;
}

/**
 * Zastosuj ograniczenia boiska
 */
function applyFieldBoundaries(entity) {
    const scale = getCurrentScale();
    const border = 15 * scale;
    
    // Specjalne ograniczenie dla pierwszej rundy turnieju (Włodarski nie może przekraczać połowy)
    if (entity === player && gameMode === 'tournament' && gameState.currentRound === 0) {
        entity.x = Math.max(entity.radius + border, Math.min(canvas.width / 2 - 10, entity.x));
    } else {
        entity.x = Math.max(entity.radius + border, Math.min(canvas.width - entity.radius - border, entity.x));
    }
    
    entity.y = Math.max(entity.radius + border, Math.min(canvas.height - entity.radius - border, entity.y));
}

/**
 * Aktualizuje bramkarza przeciwnika lub gracza
 */
function updateGoalkeeper(bot) {
    const scale = getCurrentScale();
    const isPlayerTeam = bot.team === "player";
    let targetY = ball.y;
    
    if (isPlayerTeam) {
        bot.x = Math.max(20 * scale, Math.min(50 * scale, bot.x));
    } else {
        bot.x = Math.max(canvas.width - 50 * scale, Math.min(canvas.width - 20 * scale, bot.x));
    }
    
    targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
    
    const dy = targetY - bot.y;
    bot.vy = dy * 0.12;
    bot.y += bot.vy;
}

/**
 * Aktualizuje bramkarza gracza
 */
function updatePlayerGoalkeeper() {
    const scale = getCurrentScale();
    
    if (!gameState.ballInPlay) {
        playerGoalkeeper.vx = (playerGoalkeeper.startX - playerGoalkeeper.x) * 0.1;
        playerGoalkeeper.vy = (playerGoalkeeper.startY - playerGoalkeeper.y) * 0.1;
    } else {
        let targetY = ball.y;
        playerGoalkeeper.x = Math.max(20 * scale, Math.min(50 * scale, playerGoalkeeper.x));
        targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
        
        const dy = targetY - playerGoalkeeper.y;
        playerGoalkeeper.vy = dy * 0.08;
    }
    
    playerGoalkeeper.x += playerGoalkeeper.vx;
    playerGoalkeeper.y += playerGoalkeeper.vy;
}
