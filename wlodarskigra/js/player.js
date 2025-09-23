// player.js - logika gracza i AI botów z nowymi rolami i modyfikacjami

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

    // Ograniczenia boiska - dla trybu duell pierwszego przeciwnika ograniczenie do połowy
    if (gameMode === 'duell' && selectedTeam === 0) {
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

// NOWA FUNKCJA: Kolizja bot-piłka z siłą strzału
function checkBotBallCollision(bot) {
    const dx = ball.x - bot.x;
    const dy = ball.y - bot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Uwzględnij rozmiar bota
    const botRadius = bot.radius * (bot.sizeMultiplier || 1.0);
    const minDistance = ball.radius + botRadius;

    if (distance < minDistance && distance > 0) {
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Kontrola piłki - słaba kontrola = piłka się odbija
        const controlFactor = bot.ballControl || 0.8;
        if (Math.random() > controlFactor) {
            // Słaba kontrola - piłka odbija się w losowym kierunku
            const randomAngle = Math.random() * Math.PI * 2;
            ball.vx = Math.cos(randomAngle) * 3;
            ball.vy = Math.sin(randomAngle) * 3;
            return;
        }
        
        // Ustaw piłkę na krawędzi bota
        ball.x = bot.x + nx * minDistance;
        ball.y = bot.y + ny * minDistance;
        
        // Oblicz siłę strzału
        const basePower = bot.maxSpeed * 1.2;
        const shootMultiplier = bot.shootPower || 1.0;
        
        // Specjalne role z bonusem mocy
        let powerMultiplier = 1.0;
        switch(bot.role) {
            case "cannon": powerMultiplier = 2.5; break;
            case "powerhouse": powerMultiplier = 2.0; break;
            case "ballchaser": powerMultiplier = 1.3; break;
            case "maniac": powerMultiplier = 1.8; break;
            default: powerMultiplier = 1.0;
        }
        
        const finalPower = basePower * shootMultiplier * powerMultiplier;
        
        ball.vx = nx * finalPower;
        ball.vy = ny * finalPower;
    }
}

// NOWA FUNKCJA: Znajdź wolną przestrzeń dla playmaker
function findFreeSpace(bot) {
    const areas = [
        {x: canvas.width * 0.6, y: canvas.height * 0.3},
        {x: canvas.width * 0.6, y: canvas.height * 0.7},
        {x: canvas.width * 0.4, y: canvas.height * 0.5},
        {x: canvas.width * 0.7, y: canvas.height * 0.5}
    ];
    
    // Znajdź obszar najdalej od innych botów
    let bestArea = areas[0];
    let maxDistance = 0;
    
    areas.forEach(area => {
        let minDistanceToBot = Infinity;
        bots.forEach(otherBot => {
            if (otherBot !== bot) {
                const dist = Math.sqrt((area.x - otherBot.x)**2 + (area.y - otherBot.y)**2);
                minDistanceToBot = Math.min(minDistanceToBot, dist);
            }
        });
        
        if (minDistanceToBot > maxDistance) {
            maxDistance = minDistanceToBot;
            bestArea = area;
        }
    });
    
    return bestArea;
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
        
        // Sprawdź kolizję z piłką
        checkBotBallCollision(bot);
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
        playerGoalkeeper.vy = dy * 0.08;
    }
    
    playerGoalkeeper.x += playerGoalkeeper.vx;
    playerGoalkeeper.y += playerGoalkeeper.vy;
}

function updateFieldBot(bot) {
    const distanceToBall = Math.sqrt((ball.x - bot.x) ** 2 + (ball.y - bot.y) ** 2);
    const distanceToPlayer = Math.sqrt((player.x - bot.x) ** 2 + (player.y - bot.y) ** 2);
    const ballInReach = distanceToBall < 120;
    
    let targetX, targetY;

    // PRESSING - jeśli bot ma pressing i gracz ma piłkę
    const pressureRadius = bot.pressureRadius || 150;
    const playerHasBall = Math.sqrt((ball.x - player.x) ** 2 + (ball.y - player.y) ** 2) < 30;
    
    if (bot.pressureBall && playerHasBall && distanceToPlayer < pressureRadius) {
        // Pressing - bezpośredni atak na gracza
        targetX = player.x;
        targetY = player.y;
    } else {
        // Normalne zachowanie w zależności od roli
        
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

        // WSZYSTKIE ROLE - stare i nowe
        switch(bot.role) {
            case "attacker":
                if (ballInReach || ball.x > canvas.width * 0.3) {
                    const predictTime = 6;
                    targetX = ball.x + ball.vx * predictTime;
                    targetY = ball.y + ball.vy * predictTime;
                    
                    if (distanceToBall < 50) {
                        const goalCenterY = canvas.height / 2;
                        const angleToGoal = Math.atan2(goalCenterY - ball.y, 20 - ball.x);
                        targetX = ball.x + Math.cos(angleToGoal + Math.PI) * 30;
                        targetY = ball.y + Math.sin(angleToGoal + Math.PI) * 30;
                    }
                } else {
                    targetX = canvas.width * 0.6;
                    targetY = bot.preferredY;
                }
                break;
                
            case "midfielder":
                if (ballInReach) {
                    targetX = ball.x + (Math.random() - 0.5) * 40;
                    targetY = ball.y + (Math.random() - 0.5) * 40;
                } else {
                    targetX = canvas.width * 0.65;
                    targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.3;
                }
                break;
                
            case "defender":
                if (ball.x > canvas.width * 0.6 && ballInReach) {
                    targetX = ball.x + 20;
                    targetY = ball.y;
                } else {
                    targetX = canvas.width * 0.75;
                    targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.2;
                }
                break;

            // NOWE ROLE:
            case "sweeper":
                // Zawsze za ostatnim obrońcą
                const defenders = bots.filter(b => b.role === "defender" && !b.isGoalkeeper);
                const backestDefender = defenders.length > 0 ? 
                    Math.max(...defenders.map(b => b.x)) : canvas.width * 0.8;
                targetX = Math.min(backestDefender + 30, canvas.width * 0.85);
                targetY = ball.y; // Śledzi piłkę w pionie
                break;

            case "wingback":
                // Boczny obrońca z wsparciem ataku
                if (ball.x < canvas.width * 0.5) {
                    targetX = canvas.width * 0.7; // Defensywa
                    targetY = bot.preferredY;
                } else {
                    targetX = canvas.width * 0.4; // Wsparcie ataku
                    targetY = bot.preferredY;
                }
                break;

            case "poacher":
                // Kłusownik w polu karnym
                const penaltyAreaX = 80;
                if (ball.x < canvas.width * 0.6) {
                    targetX = penaltyAreaX;
                    targetY = canvas.height * 0.5;
                } else {
                    targetX = ball.x - 20;
                    targetY = ball.y;
                }
                break;

            case "playmaker":
                // Rozgrywający szuka wolnej przestrzeni
                const freeSpace = findFreeSpace(bot);
                targetX = freeSpace.x;
                targetY = freeSpace.y;
                break;

            case "ballchaser":
                // ZAWSZE goni piłkę
                targetX = ball.x;
                targetY = ball.y;
                spacingAdjustmentX = 0; // Ignoruje kolegów
                spacingAdjustmentY = 0;
                break;

            case "maniac":
                // Szalony pościg z przewidywaniem
                const predictTime = 8;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                break;

            case "counter-attacker":
                if (ball.x > canvas.width * 0.7) {
                    // Defensywa gdy przeciwnik atakuje
                    targetX = canvas.width * 0.8;
                    targetY = bot.preferredY;
                } else if (ball.vx < -2) {
                    // Sprint do przodu w kontrataku
                    targetX = canvas.width * 0.3;
                    targetY = ball.y;
                } else {
                    targetX = canvas.width * 0.6;
                    targetY = bot.preferredY;
                }
                break;

            case "cannon":
                // Pozycjonuje się do potężnych strzałów
                if (distanceToBall < 80) {
                    const goalAngle = Math.atan2(canvas.height/2 - ball.y, 20 - ball.x);
                    targetX = ball.x + Math.cos(goalAngle + Math.PI) * 40;
                    targetY = ball.y + Math.sin(goalAngle + Math.PI) * 40;
                } else {
                    targetX = canvas.width * 0.6;
                    targetY = bot.preferredY;
                }
                break;

            case "powerhouse":
                // Siłacz - podobnie do cannon ale bliżej
                if (distanceToBall < 100) {
                    targetX = ball.x;
                    targetY = ball.y;
                } else {
                    targetX = canvas.width * 0.65;
                    targetY = bot.preferredY;
                }
                break;

            default:
                // Domyślne zachowanie midfielder
                if (ballInReach) {
                    targetX = ball.x + (Math.random() - 0.5) * 40;
                    targetY = ball.y + (Math.random() - 0.5) * 40;
                } else {
                    targetX = canvas.width * 0.65;
                    targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.3;
                }
                break;
        }

        // Zastosuj korektę rozstawienia (oprócz ballchaser i maniac)
        if (bot.role !== "ballchaser" && bot.role !== "maniac") {
            targetX += spacingAdjustmentX;
            targetY += spacingAdjustmentY;
        }
    }

    // System błędów dla różnych przeciwników
    let errorChance;
    if (gameMode === 'duell') {
        switch(selectedTeam) {
            case 0: errorChance = 0.25; break; // Amateur Stefan
            default: errorChance = 0.15;
        }
    } else if (gameMode === 'zweite_bundesliga') {
        switch(selectedTeam) {
            case 0: errorChance = 0.15; break; // VFL Oldenburg
            case 1: errorChance = 0.10; break; // SV Waldorf Mannheim  
            case 2: errorChance = 0.12; break; // FC Hansa Rostock
            case 3: errorChance = 0.06; break; // Eintracht Braunschweig
            case 4: errorChance = 0.04; break; // Lokomotiv Leipzig
            case 5: errorChance = 0.20; break; // FC Carl Zeiss Jena
            case 6: errorChance = 0.18; break; // SpVgg Unterhaching
            case 7: errorChance = 0.12; break; // Marco Reus Test
            default: errorChance = 0.08;
        }
    } else {
        errorChance = 0.08;
    }
    
    // Dodaj błędy w zależności od roli
    let roleErrorMultiplier = 1.0;
    switch(bot.role) {
        case "attacker": roleErrorMultiplier = 0.8; break;
        case "midfielder": roleErrorMultiplier = 1.0; break;
        case "defender": roleErrorMultiplier = 1.2; break;
        case "playmaker": roleErrorMultiplier = 0.6; break; // Bardzo precyzyjny
        case "maniac": roleErrorMultiplier = 2.0; break; // Dużo błędów
        case "ballchaser": roleErrorMultiplier = 1.3; break;
        case "sweeper": roleErrorMultiplier = 0.9; break;
        case "cannon": roleErrorMultiplier = 1.1; break;
        default: roleErrorMultiplier = 1.0;
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
        
        // Oblicz prędkość z bonusami dla ról
        let currentSpeed = bot.maxSpeed;
        
        // Bonusy prędkości dla specjalnych ról
        if (bot.role === "ballchaser") currentSpeed *= 1.2;
        if (bot.role === "maniac") currentSpeed *= 1.5;
        if (bot.role === "counter-attacker" && ball.vx < -2) currentSpeed *= 1.5;
        
        // Pressing bonus
        if (bot.pressureBall && playerHasBall && distanceToPlayer < pressureRadius) {
            currentSpeed *= 1.3;
        }
        
        bot.vx = normalizedX * currentSpeed;
        bot.vy = normalizedY * currentSpeed;
    } else {
        bot.vx *= 0.8;
        bot.vy *= 0.8;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;

    // Ograniczenia pozycji z uwzględnieniem rozmiaru
    const botRadius = bot.radius * (bot.sizeMultiplier || 1.0);
    
    if (bot.canCrossHalf) {
        bot.x = Math.max(canvas.width / 2 - 50, Math.min(canvas.width - botRadius - 15, bot.x));
    } else {
        bot.x = Math.max(canvas.width / 2 + 10, Math.min(canvas.width - botRadius - 15, bot.x));
    }
    
    bot.y = Math.max(botRadius + 15, Math.min(canvas.height - botRadius - 15, bot.y));
}

function updateGoalkeeper(bot) {
    let targetY = ball.y;
    const botRadius = bot.radius * (bot.sizeMultiplier || 1.0);
    
    bot.x = Math.max(canvas.width - 50, Math.min(canvas.width - 20, bot.x));
    targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
    
    const dy = targetY - bot.y;
    bot.vy = dy * 0.12;
    bot.y += bot.vy;
}
