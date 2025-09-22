// player.js - nowa logika AI napisana od podstaw

// Sterowanie graczem
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

// ===== NOWA LOGIKA AI - NAPISANA OD ZERA =====

function updateBots() {
    bots.forEach((bot, index) => {
        if (!gameState.ballInPlay && !bot.isGoalkeeper) {
            returnToStartPosition(bot);
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

function returnToStartPosition(bot) {
    const readyX = canvas.width / 2 + 80;
    const readyY = bot.startY || canvas.height / 2;
    
    bot.vx = (readyX - bot.x) * 0.1;
    bot.vy = (readyY - bot.y) * 0.1;
    
    bot.x += bot.vx;
    bot.y += bot.vy;
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

// GŁÓWNA FUNKCJA AI - TUTAJ DEFINIUJESZ ZACHOWANIA
function updateFieldBot(bot) {
    // 1. OBLICZ PODSTAWOWE DANE
    const distanceToBall = getDistance(bot, ball);
    const ballNearby = distanceToBall < 120;
    
    // 2. WYBIERZ ZACHOWANIE NA PODSTAWIE ROLI
    let behavior = getBehaviorForRole(bot.role, bot, ballNearby, distanceToBall);
    
    // 3. WYKONAJ ZACHOWANIE
    const targetPosition = behavior.getTarget();
    const speed = behavior.getSpeed();
    
    // 4. RUCH DO CELU
    moveToTarget(bot, targetPosition.x, targetPosition.y, speed);
    
    // 5. OGRANICZENIA POZYCJI
    applyPositionLimits(bot);
}

// DEFINIOWANIE ZACHOWAŃ DLA KAŻDEJ ROLI
function getBehaviorForRole(role, bot, ballNearby, distanceToBall) {
    switch(role) {
        case "hajto":
            return createHajtoBehavior(bot, ballNearby, distanceToBall);
            
        case "attacker":
            return createAttackerBehavior(bot, ballNearby);
            
        case "midfielder":
            return createMidfielderBehavior(bot, ballNearby);
            
        case "defender":
        default:
            return createDefenderBehavior(bot, ballNearby);
    }
}

// ===== DEFINICJE KONKRETNYCH ZACHOWAŃ =====

function createHajtoBehavior(bot, ballNearby, distanceToBall) {
    return {
        getTarget: function() {
            if (ballNearby || distanceToBall < 150) {
                // Agresywnie goni piłkę
                return { x: ball.x, y: ball.y };
            } else {
                // Patroluje obronę
                const patrolX = canvas.width * 0.8;
                let patrolY = ball.y;
                
                // Ograniczenia pionowe
                patrolY = Math.max(canvas.height * 0.25, patrolY);
                patrolY = Math.min(canvas.height * 0.75, patrolY);
                
                return { x: patrolX, y: patrolY };
            }
        },
        getSpeed: function() {
            return bot.maxSpeed * 0.95; // Bardzo szybki
        }
    };
}

function createAttackerBehavior(bot, ballNearby) {
    return {
        getTarget: function() {
            if (ballNearby) {
                return { x: ball.x, y: ball.y };
            } else {
                return { x: canvas.width * 0.6, y: bot.preferredY };
            }
        },
        getSpeed: function() {
            return bot.maxSpeed;
        }
    };
}

function createMidfielderBehavior(bot, ballNearby) {
    return {
        getTarget: function() {
            if (ballNearby) {
                return { x: ball.x, y: ball.y };
            } else {
                return { x: canvas.width * 0.65, y: bot.preferredY };
            }
        },
        getSpeed: function() {
            return bot.maxSpeed * 0.9;
        }
    };
}

function createDefenderBehavior(bot, ballNearby) {
    return {
        getTarget: function() {
            if (ball.x > canvas.width * 0.6 && ballNearby) {
                return { x: ball.x, y: ball.y };
            } else {
                return { x: canvas.width * 0.75, y: bot.preferredY };
            }
        },
        getSpeed: function() {
            return bot.maxSpeed * 0.8;
        }
    };
}

// ===== FUNKCJE POMOCNICZE =====

function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function moveToTarget(bot, targetX, targetY, speed) {
    const dx = targetX - bot.x;
    const dy = targetY - bot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 3) {
        bot.vx = (dx / distance) * speed;
        bot.vy = (dy / distance) * speed;
    } else {
        bot.vx *= 0.7;
        bot.vy *= 0.7;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;
}

function applyPositionLimits(bot) {
    // Ograniczenia dla roli "hajto"
    if (bot.role === "hajto") {
        bot.x = Math.max(canvas.width * 0.7, bot.x);
        bot.x = Math.min(canvas.width - bot.radius - 15, bot.x);
    }
    // Ograniczenia dla innych
    else if (bot.canCrossHalf) {
        bot.x = Math.max(canvas.width / 2 - 50, Math.min(canvas.width - bot.radius - 15, bot.x));
    } else {
        bot.x = Math.max(canvas.width / 2 + 10, Math.min(canvas.width - bot.radius - 15, bot.x));
    }
    
    // Ograniczenia pionowe dla wszystkich
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
