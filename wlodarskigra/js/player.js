// player.js - REFAKTORYZOWANA logika gracza i AI botów

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
 * Pobiera aktualną skalę boiska
 */
function getCurrentScale() {
    const currentTeamData = gameMode === 'tournament' 
        ? teams[gameState.currentRound] 
        : teams[selectedTeam];
    return currentTeamData?.fieldScale || 1.0;
}

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
 * Sprawdza czy piłka jest w określonej strefie boiska
 */
function isBallInZone(zone, isPlayerTeam) {
    switch (zone) {
        case 'offensive':
            return isPlayerTeam ? ball.x > canvas.width * 0.6 : ball.x < canvas.width * 0.4;
        case 'attack':
            return isPlayerTeam ? ball.x > canvas.width * 0.4 : ball.x < canvas.width * 0.6;
        case 'defense':
            return isPlayerTeam ? ball.x < canvas.width * 0.4 : ball.x > canvas.width * 0.6;
        case 'penalty':
            return isPlayerTeam ? ball.x < canvas.width * 0.2 : ball.x > canvas.width * 0.8;
        case 'very_close':
            return isPlayerTeam ? ball.x < canvas.width * 0.3 : ball.x > canvas.width * 0.7;
        default:
            return false;
    }
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

/**
 * Oblicza kierunek do bramki przeciwnika
 */
function getShootDirection(isPlayerTeam, fromX, fromY) {
    const goalX = isPlayerTeam ? canvas.width - 15 : 15;
    const goalY = canvas.height / 2;
    return Math.atan2(goalY - fromY, goalX - fromX);
}

/**
 * Przewiduje pozycję piłki po określonym czasie
 */
function predictBallPosition(timeFrames) {
    return {
        x: ball.x + ball.vx * timeFrames,
        y: ball.y + ball.vy * timeFrames
    };
}

// ============ FUNKCJE POZYCJONOWANIA DLA RÓL ============

/**
 * Pozycjonowanie napastnika
 */
function updateStriker(bot, isPlayerTeam, ballInReach, distanceToBall) {
    const scale = getCurrentScale();
    const ballInOffensiveZone = isBallInZone('offensive', isPlayerTeam);
    
    if (ballInReach || ballInOffensiveZone) {
        const predicted = predictBallPosition(8);
        let targetX = predicted.x;
        let targetY = predicted.y;

        if (distanceToBall < GAME_CONSTANTS.CLOSE_BALL_DISTANCE * scale) {
            const shootAngle = getShootDirection(isPlayerTeam, ball.x, ball.y);
            targetX = ball.x + Math.cos(shootAngle + Math.PI) * 25 * scale;
            targetY = ball.y + Math.sin(shootAngle + Math.PI) * 25 * scale;
        }
        
        return { x: targetX, y: targetY };
    } else {
        // Pozycja w polu karnym przeciwnika
        const targetX = isPlayerTeam ? canvas.width * 0.85 : canvas.width * 0.15;
        const targetY = canvas.height / 2 + (Math.random() - 0.5) * 60 * scale;
        return { x: targetX, y: targetY };
    }
}

/**
 * Pozycjonowanie skrzydłowego
 */
function updateWinger(bot, isPlayerTeam, ballInReach) {
    const scale = getCurrentScale();
    const isTopWinger = bot.preferredY < canvas.height / 2;
    const wingY = isTopWinger ? canvas.height * 0.2 : canvas.height * 0.8;
    
    if (ballInReach) {
        const targetX = ball.x + (isPlayerTeam ? 30 * scale : -30 * scale);
        const targetY = wingY + (Math.random() - 0.5) * 40 * scale;
        return { x: targetX, y: targetY };
    } else if (isBallInZone('attack', isPlayerTeam)) {
        const targetX = isPlayerTeam ? canvas.width * 0.75 : canvas.width * 0.25;
        return { x: targetX, y: wingY };
    } else {
        const targetX = isPlayerTeam ? canvas.width * 0.4 : canvas.width * 0.6;
        return { x: targetX, y: wingY };
    }
}

/**
 * Pozycjonowanie ofensywnego pomocnika
 */
function updateAttackingMidfielder(bot, isPlayerTeam, ballInReach, distanceToBall) {
    const scale = getCurrentScale();
    const ballInAttackZone = isBallInZone('attack', isPlayerTeam);
    
    if (ballInReach || ballInAttackZone) {
        const predicted = predictBallPosition(5);
        let targetX = predicted.x;
        let targetY = predicted.y;
        
        if (distanceToBall < 60 * scale) {
            targetX = isPlayerTeam ? canvas.width * 0.65 : canvas.width * 0.35;
            targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.8;
        }
        
        return { x: targetX, y: targetY };
    } else {
        const targetX = canvas.width * 0.5;
        const targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.4;
        return { x: targetX, y: targetY };
    }
}

/**
 * Pozycjonowanie defensywnego pomocnika
 */
function updateDefensiveMidfielder(bot, isPlayerTeam, ballInReach) {
    const scale = getCurrentScale();
    const ballNearDefense = isBallInZone('defense', isPlayerTeam);
    
    if (ballNearDefense && ballInReach) {
        const targetX = ball.x + (isPlayerTeam ? -40 * scale : 40 * scale);
        const targetY = ball.y;
        return { x: targetX, y: targetY };
    } else {
        let targetX = isPlayerTeam ? canvas.width * 0.3 : canvas.width * 0.7;
        const targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.3;
        
        if (isBallInZone('very_close', isPlayerTeam)) {
            targetX = isPlayerTeam ? canvas.width * 0.25 : canvas.width * 0.75;
        }
        
        return { x: targetX, y: targetY };
    }
}

/**
 * Pozycjonowanie bocznego obrońcy
 */
function updateFullback(bot, isPlayerTeam, ballInReach) {
    const scale = getCurrentScale();
    const isTopFullback = bot.preferredY < canvas.height / 2;
    const fullbackY = isTopFullback ? canvas.height * 0.25 : canvas.height * 0.75;
    const ballInDefenseZone = isBallInZone('very_close', isPlayerTeam);
    
    if (ballInDefenseZone && ballInReach) {
        const targetX = ball.x + (isPlayerTeam ? -30 * scale : 30 * scale);
        const targetY = ball.y;
        return { x: targetX, y: targetY };
    } else if (isBallInZone('offensive', !isPlayerTeam)) {
        const targetX = isPlayerTeam ? canvas.width * 0.45 : canvas.width * 0.55;
        return { x: targetX, y: fullbackY };
    } else {
        const targetX = isPlayerTeam ? canvas.width * 0.2 : canvas.width * 0.8;
        return { x: targetX, y: fullbackY };
    }
}

/**
 * Pozycjonowanie środkowego obrońcy
 */
function updateCenterback(bot, isPlayerTeam, ballInReach) {
    const scale = getCurrentScale();
    const ballVeryClose = isBallInZone('very_close', isPlayerTeam);
    
    if (ballVeryClose && ballInReach) {
        const targetX = ball.x + (isPlayerTeam ? -25 * scale : 25 * scale);
        const targetY = ball.y;
        return { x: targetX, y: targetY };
    } else {
        let targetX = isPlayerTeam ? canvas.width * 0.15 : canvas.width * 0.85;
        let targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.15;
        
        if (isBallInZone('penalty', isPlayerTeam)) {
            targetX = isPlayerTeam ? canvas.width * 0.1 : canvas.width * 0.9;
            targetY = ball.y;
        }
        
        return { x: targetX, y: targetY };
    }
}

/**
 * Pozycjonowanie libero
 */
function updateSweeper(bot, isPlayerTeam, ballInReach) {
    const scale = getCurrentScale();
    
    if (ballInReach) {
        const targetX = ball.x + (isPlayerTeam ? -20 * scale : 20 * scale);
        const targetY = ball.y;
        return { x: targetX, y: targetY };
    } else {
        const sameTeamDefenders = bots.filter(b => 
            b.team === bot.team && (b.role === "centerback" || b.role === "fullback")
        );
        
        let defenseLine;
        if (isPlayerTeam) {
            defenseLine = sameTeamDefenders.length > 0 ? 
                Math.min(...sameTeamDefenders.map(b => b.x)) - 20 * scale : 
                canvas.width * 0.25;
        } else {
            defenseLine = sameTeamDefenders.length > 0 ? 
                Math.max(...sameTeamDefenders.map(b => b.x)) + 20 * scale : 
                canvas.width * 0.75;
        }
        
        let targetX = defenseLine;
        let targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.2;
        
        // Reaguj na przełamania
        const ballFastMoving = Math.abs(ball.vx) > 3;
        const ballThreatening = isBallInZone('defense', isPlayerTeam);
        
        if (ballFastMoving && ballThreatening) {
            targetX = ball.x + ball.vx * 3 * scale;
            targetY = ball.y + ball.vy * 3 * scale;
        }
        
        return { x: targetX, y: targetY };
    }
}

/**
 * Pozycjonowanie goniącego za piłką
 */
function updateBallChaser(bot, distanceToBall) {
    const scale = getCurrentScale();
    const predicted = predictBallPosition(2);
    
    if (distanceToBall > 200 * scale) {
        return { x: ball.x, y: ball.y };
    }
    
    return { x: predicted.x, y: predicted.y };
}

/**
 * Domyślne pozycjonowanie (obrońca/pomocnik)
 */
function updateDefaultRole(bot, isPlayerTeam, ballInReach) {
    const scale = getCurrentScale();
    const ballNearOwnGoal = isBallInZone('defense', isPlayerTeam);
    
    if (ballNearOwnGoal && ballInReach) {
        const targetX = ball.x + (isPlayerTeam ? -20 * scale : 20 * scale);
        const targetY = ball.y;
        return { x: targetX, y: targetY };
    } else {
        const targetX = isPlayerTeam ? canvas.width * 0.25 : canvas.width * 0.75;
        const targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.2;
        return { x: targetX, y: targetY };
    }
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
 * Główna funkcja aktualizacji bota na boisku - ZREFAKTORYZOWANA
 */
function updateFieldBot(bot) {
    const isPlayerTeam = bot.team === "player";
    const scale = getCurrentScale();
    const distanceToBall = getDistanceToBall(bot);
    const ballInReach = isBallInReach(bot);

    // Oblicz korektę rozstawienia
    const spacing = calculateTeammateSpacing(bot);
    
    // Określ pozycję docelową w zależności od roli
    let target;
    
    switch(bot.role) {
        case "striker":
            target = updateStriker(bot, isPlayerTeam, ballInReach, distanceToBall);
            break;
        case "winger":
            target = updateWinger(bot, isPlayerTeam, ballInReach);
            break;
        case "attacking_midfielder":
            target = updateAttackingMidfielder(bot, isPlayerTeam, ballInReach, distanceToBall);
            break;
        case "defensive_midfielder":
            target = updateDefensiveMidfielder(bot, isPlayerTeam, ballInReach);
            break;
        case "fullback":
            target = updateFullback(bot, isPlayerTeam, ballInReach);
            break;
        case "centerback":
            target = updateCenterback(bot, isPlayerTeam, ballInReach);
            break;
        case "sweeper":
            target = updateSweeper(bot, isPlayerTeam, ballInReach);
            break;
        case "ball_chaser":
            target = updateBallChaser(bot, distanceToBall);
            break;
        case "attacker":
            target = updateStriker(bot, isPlayerTeam, ballInReach, distanceToBall); // Podobny do strikera
            break;
        case "midfielder":
            if (ballInReach) {
                target = {
                    x: ball.x + (Math.random() - 0.5) * 40 * scale,
                    y: ball.y + (Math.random() - 0.5) * 40 * scale
                };
            } else {
                target = {
                    x: isPlayerTeam ? canvas.width * 0.35 : canvas.width * 0.65,
                    y: bot.preferredY + (ball.y - canvas.height/2) * 0.3
                };
            }
            break;
        case "defender":
        default:
            target = updateDefaultRole(bot, isPlayerTeam, ballInReach);
            break;
    }

    // Zastosuj korektę rozstawienia
    target.x += spacing.x;
    target.y += spacing.y;

    // Zastosuj błędy AI
    
    // Porusz bota w kierunku celu
    moveBotToTarget(bot, target);
    
    // Zastosuj ograniczenia boiska
    applyFieldBoundaries(bot);
}

/**
 * Zastosuj błędy AI w zależności od poziomu trudności i roli
 */
function applyAIErrors(bot, target, scale) {
    const botErrorChance = bot.errorChance || 0.08; // domyślnie 8%
    
    if (Math.random() < botErrorChance) {
        target.x += (Math.random() - 0.5) * 60 * scale;
        target.y += (Math.random() - 0.5) * 60 * scale;
    }
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
