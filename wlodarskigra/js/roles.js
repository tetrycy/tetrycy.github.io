// roles.js - zachowania różnych pozycji piłkarskich

// ============ FUNKCJE POMOCNICZE DLA RÓL ============

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

// ============ DEFINICJE RÓL ============

const PlayerRoles = {
    
    /**
     * Pozycjonowanie napastnika
     */
    striker: function(bot, isPlayerTeam, ballInReach, distanceToBall) {
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
    },

    /**
     * Pozycjonowanie skrzydłowego - AKTYWNA WERSJA
     */
    winger: function(bot, isPlayerTeam, ballInReach) {
        const scale = getCurrentScale();
        const isTopWinger = bot.preferredY < canvas.height / 2;
        
        // Definiuj przestrzeń wingera (pas na skrzydle)
        const wingZone = {
            // Strefa X - od linii końcowej do linii końcowej (cały pas)
            minX: 0,
            maxX: canvas.width,
            // Strefa Y - górna lub dolna część boiska
            minY: isTopWinger ? canvas.height * 0.05 : canvas.height * 0.5,
            maxY: isTopWinger ? canvas.height * 0.5 : canvas.height * 0.95
        };
        
        // Sprawdź czy piłka jest w przestrzeni wingera
        const ballInWingZone = (
            ball.x >= wingZone.minX && ball.x <= wingZone.maxX &&
            ball.y >= wingZone.minY && ball.y <= wingZone.maxY
        );
        
        // Jeśli piłka w strefie wingera - GOŃ JĄ!
        if (ballInWingZone) {
            // Przewiduj pozycję piłki
            const predicted = predictBallPosition(3);
            
            // Jeśli bardzo blisko piłki - pozycjonuj się obok
            if (ballInReach) {
                const targetX = ball.x + (isPlayerTeam ? -25 * scale : 25 * scale);
                const targetY = ball.y;
                return { x: targetX, y: targetY };
            } else {
                // Goń przewidywaną pozycję piłki
                return { x: predicted.x, y: predicted.y };
            }
        }
        
        // Jeśli piłka poza strefą - PATROLUJ przestrzeń
        
        // Dodaj ruch patrolujący - oscylacja w strefie wingera
        const time = Date.now() * 0.001; // czas w sekundach
        const patrolSpeed = 0.8; // szybkość patrolowania
        
        // Oscyluj między punktami w strefie
        const patrolProgressX = (Math.sin(time * patrolSpeed + bot.number) + 1) / 2; // 0-1
        const patrolProgressY = (Math.cos(time * patrolSpeed * 0.7 + bot.number) + 1) / 2; // 0-1
        
        let targetX = wingZone.minX + (wingZone.maxX - wingZone.minX) * patrolProgressX;
        let targetY = wingZone.minY + (wingZone.maxY - wingZone.minY) * patrolProgressY;
        
        // Modyfikuj pozycję w zależności od sytuacji na boisku
        if (isBallInZone('attack', isPlayerTeam)) {
            // Atak - idź wyżej w strefę ofensywną
            targetX = isPlayerTeam ? 
                Math.max(targetX, canvas.width * 0.6) : 
                Math.min(targetX, canvas.width * 0.4);
        } else if (isBallInZone('defense', isPlayerTeam)) {
            // Obrona - wracaj niżej
            targetX = isPlayerTeam ? 
                Math.min(targetX, canvas.width * 0.5) : 
                Math.max(targetX, canvas.width * 0.5);
        }
        
        // Reaguj na pozycję piłki w osi Y
        const ballInfluence = 0.3;
        const centerY = (wingZone.minY + wingZone.maxY) / 2;
        targetY = targetY * (1 - ballInfluence) + 
                  (centerY + (ball.y - canvas.height/2) * 0.5) * ballInfluence;
        
        // Upewnij się że cel jest w strefie wingera
        targetX = Math.max(wingZone.minX, Math.min(wingZone.maxX, targetX));
        targetY = Math.max(wingZone.minY, Math.min(wingZone.maxY, targetY));
        
        return { x: targetX, y: targetY };
    },

    /**
     * Pozycjonowanie ofensywnego pomocnika
     */
    attacking_midfielder: function(bot, isPlayerTeam, ballInReach, distanceToBall) {
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
    },

    /**
     * Pozycjonowanie defensywnego pomocnika
     */
    defensive_midfielder: function(bot, isPlayerTeam, ballInReach) {
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
    },

    /**
     * Pozycjonowanie bocznego obrońcy
     */
    fullback: function(bot, isPlayerTeam, ballInReach) {
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
    },

    /**
     * Pozycjonowanie środkowego obrońcy
     */
    centerback: function(bot, isPlayerTeam, ballInReach) {
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
    },

    /**
     * Pozycjonowanie libero
     */
    sweeper: function(bot, isPlayerTeam, ballInReach) {
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
    },

    /**
     * Pozycjonowanie goniącego za piłką
     */
    ball_chaser: function(bot, distanceToBall) {
        const scale = getCurrentScale();
        const predicted = predictBallPosition(2);
        
        if (distanceToBall > 200 * scale) {
            return { x: ball.x, y: ball.y };
        }
        
        return { x: predicted.x, y: predicted.y };
    },

    /**
     * Pozycjonowanie napastnika (alias dla striker)
     */
    attacker: function(bot, isPlayerTeam, ballInReach, distanceToBall) {
        return this.striker(bot, isPlayerTeam, ballInReach, distanceToBall);
    },

    /**
     * Pozycjonowanie pomocnika
     */
    midfielder: function(bot, isPlayerTeam, ballInReach) {
        const scale = getCurrentScale();
        
        if (ballInReach) {
            return {
                x: ball.x + (Math.random() - 0.5) * 40 * scale,
                y: ball.y + (Math.random() - 0.5) * 40 * scale
            };
        } else {
            return {
                x: isPlayerTeam ? canvas.width * 0.35 : canvas.width * 0.65,
                y: bot.preferredY + (ball.y - canvas.height/2) * 0.3
            };
        }
    },

    /**
     * Pozycjonowanie obrońcy
     */
    defender: function(bot, isPlayerTeam, ballInReach) {
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
    },

    /**
     * Domyślne pozycjonowanie
     */
    default: function(bot, isPlayerTeam, ballInReach) {
        return this.defender(bot, isPlayerTeam, ballInReach);
    }
};
