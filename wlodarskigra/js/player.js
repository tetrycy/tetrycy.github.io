// player.js - logika gracza i AI botów z nowym systemem pozycjonowania

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

// NOWY SYSTEM POZYCJONOWANIA - określa fazę gry na podstawie pozycji piłki
function determineGamePhase() {
    const centerLine = canvas.width / 2;
    const ballX = ball.x;
    
    // Strefy: lewa połowa to "obrona botów", prawa to "atak botów"
    if (ballX < centerLine - 100) {
        return "bot_attack"; // Piłka blisko bramki gracza - boty atakują
    } else if (ballX > centerLine + 100) {
        return "bot_defense"; // Piłka blisko bramki botów - boty się bronią  
    } else {
        return "neutral"; // Piłka w środku - pozycje neutralne
    }
}

// Inicjalizuje strefy odpowiedzialności dla botów
function initializeBotZones() {
    const fieldWidth = canvas.width;
    const fieldHeight = canvas.height;
    
    bots.forEach(bot => {
        if (bot.isGoalkeeper) {
            bot.homeZone = {
                x: [fieldWidth - 60, fieldWidth - 20],
                y: [fieldHeight * 0.3, fieldHeight * 0.7]
            };
            return;
        }
        
        // Strefy bazowe w zależności od roli
        switch(bot.role) {
            case "attacker":
                bot.homeZone = {
                    x: [fieldWidth * 0.4, fieldWidth * 0.9],
                    y: [fieldHeight * 0.2, fieldHeight * 0.8],
                    defensiveX: [fieldWidth * 0.6, fieldWidth * 0.85],
                    attackX: [fieldWidth * 0.3, fieldWidth * 0.95]
                };
                break;
                
            case "midfielder":
                bot.homeZone = {
                    x: [fieldWidth * 0.5, fieldWidth * 0.8],
                    y: [fieldHeight * 0.1, fieldHeight * 0.9],
                    defensiveX: [fieldWidth * 0.65, fieldWidth * 0.85],
                    attackX: [fieldWidth * 0.4, fieldWidth * 0.8]
                };
                break;
                
            case "defender":
            default:
                bot.homeZone = {
                    x: [fieldWidth * 0.6, fieldWidth * 0.9],
                    y: [fieldHeight * 0.15, fieldHeight * 0.85],
                    defensiveX: [fieldWidth * 0.7, fieldWidth * 0.9],
                    attackX: [fieldWidth * 0.6, fieldWidth * 0.85]
                };
                break;
        }
        
        // Przypisz preferowaną pozycję Y w strefie (podział równomierny)
        const botsInRole = bots.filter(b => b.role === bot.role && !b.isGoalkeeper);
        const roleIndex = botsInRole.indexOf(bot);
        const totalInRole = botsInRole.length;
        
        if (totalInRole > 1) {
            const ySpread = bot.homeZone.y[1] - bot.homeZone.y[0];
            bot.preferredYInZone = bot.homeZone.y[0] + (ySpread / (totalInRole + 1)) * (roleIndex + 1);
        } else {
            bot.preferredYInZone = (bot.homeZone.y[0] + bot.homeZone.y[1]) / 2;
        }
    });
}

// Oblicza optymalną pozycję w formacji
function calculateFormationPosition(bot, gamePhase) {
    if (bot.isGoalkeeper) {
        // Bramkarze mają własną logikę - bez zmian
        return {
            x: Math.max(canvas.width - 50, Math.min(canvas.width - 20, bot.x)),
            y: Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, ball.y))
        };
    }
    
    let targetX, targetY;
    const ballInfluence = 0.3; // Jak mocno piłka wpływa na pozycję
    
    // Oblicz docelowy X na podstawie fazy gry
    switch(gamePhase) {
        case "bot_defense":
            // W obronie - cofnij się do defensywnej części strefy
            const defZone = bot.homeZone.defensiveX;
            targetX = (defZone[0] + defZone[1]) / 2;
            // Dodatkowo zbliż się do centrum jeśli piłka bardzo blisko
            if (ball.x > canvas.width * 0.7) {
                targetX = Math.max(targetX - 50, defZone[0]);
            }
            break;
            
        case "bot_attack":
            // W ataku - przesuń się do ofensywnej części strefy
            const attZone = bot.homeZone.attackX;
            targetX = (attZone[0] + attZone[1]) / 2;
            // Napastnicy idą najbliżej bramki
            if (bot.role === "attacker") {
                targetX = Math.min(targetX - 30, attZone[0]);
            }
            break;
            
        case "neutral":
        default:
            // Neutralnie - środek domyślnej strefy
            targetX = (bot.homeZone.x[0] + bot.homeZone.x[1]) / 2;
            break;
    }
    
    // Oblicz Y - bazuj na preferowanej pozycji ale reaguj na piłkę
    targetY = bot.preferredYInZone + (ball.y - canvas.height/2) * ballInfluence;
    
    // Upewnij się że Y jest w dozwolonej strefie
    targetY = Math.max(bot.homeZone.y[0], Math.min(bot.homeZone.y[1], targetY));
    
    // W sytuacjach krytycznych (piłka bardzo blisko) zwiększ reakcję
    const distanceToBall = Math.sqrt((ball.x - bot.x) ** 2 + (ball.y - bot.y) ** 2);
    if (distanceToBall < 80) {
        // Bezpośrednia reakcja na piłkę gdy jest blisko
        if (gamePhase === "bot_attack" || gamePhase === "neutral") {
            targetX = ball.x + (Math.random() - 0.5) * 60;
            targetY = ball.y + (Math.random() - 0.5) * 60;
        }
    }
    
    return { x: targetX, y: targetY };
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

// NOWA LOGIKA BOTÓW POLOWYCH z systemem pozycjonowania
function updateFieldBot(bot) {
    const distanceToBall = Math.sqrt((ball.x - bot.x) ** 2 + (ball.y - bot.y) ** 2);
    const ballInReach = distanceToBall < 120;
    
    // NOWY SYSTEM - określ fazę gry i pozycję w formacji
    const gamePhase = determineGamePhase();
    const formationPos = calculateFormationPosition(bot, gamePhase);
    
    let targetX = formationPos.x;
    let targetY = formationPos.y;

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

    // SPECJALNE ZACHOWANIA gdy piłka w zasięgu
    if (ballInReach) {
        switch(bot.role) {
            case "attacker":
                // Napastnicy priorytetowo gonią piłkę
                if (gamePhase === "bot_attack" || gamePhase === "neutral") {
                    const predictTime = 6;
                    targetX = ball.x + ball.vx * predictTime;
                    targetY = ball.y + ball.vy * predictTime;
                    
                    // Pozycjonuj się do strzału
                    if (distanceToBall < 50) {
                        const goalCenterY = canvas.height / 2;
                        const angleToGoal = Math.atan2(goalCenterY - ball.y, 20 - ball.x);
                        targetX = ball.x + Math.cos(angleToGoal + Math.PI) * 30;
                        targetY = ball.y + Math.sin(angleToGoal + Math.PI) * 30;
                    }
                }
                break;
                
            case "midfielder":
                // Pomocnicy wspierają w każdej fazie
                if (gamePhase !== "bot_defense" || ball.x > canvas.width * 0.6) {
                    targetX = ball.x + (Math.random() - 0.5) * 40;
                    targetY = ball.y + (Math.random() - 0.5) * 40;
                }
                break;
                
            case "defender":
                // Obrońcy reagują tylko w krytycznych sytuacjach
                if (ball.x > canvas.width * 0.65 && (gamePhase === "bot_defense" || distanceToBall < 60)) {
                    targetX = ball.x + 20;
                    targetY = ball.y;
                }
                break;
        }
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
