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
// AI Botów + bramkarz gracza - POPRAWIONE
function updateBots() {
    bots.forEach(bot => {
        if (!gameState.ballInPlay && !bot.isGoalkeeper) {
            // Pozycjonowanie startowe zależne od drużyny
            const isPlayerTeam = bot.team === "player";
            let readyX, readyY;
            
            if (bot.isGoalkeeper) {
                readyX = isPlayerTeam ? 40 : canvas.width - 40;
                readyY = canvas.height / 2;
            } else {
                // Gracze drużyny gracza po lewej, przeciwnicy po prawej
                readyX = isPlayerTeam ? canvas.width / 2 - 80 : canvas.width / 2 + 80;
                readyY = bot.startY || canvas.height / 2;
            }
            
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

function updateFieldBot(bot) {
    // Określ kierunek ataku na podstawie drużyny
    const isPlayerTeam = bot.team === "player";
    const enemyGoalX = isPlayerTeam ? canvas.width - 20 : 20;
    const ownGoalX = isPlayerTeam ? 20 : canvas.width - 20;
    
    const distanceToBall = Math.sqrt((ball.x - bot.x) ** 2 + (ball.y - bot.y) ** 2);
    const ballInReach = distanceToBall < 120;
    
    let targetX, targetY;

    // Sprawdź odległości do kolegów z tej samej drużyny
    const teammateSpacing = 60;
    let spacingAdjustmentX = 0;
    let spacingAdjustmentY = 0;
    
    bots.forEach(teammate => {
        if (teammate !== bot && !teammate.isGoalkeeper && teammate.team === bot.team) {
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

    // Różne zachowania w zależności od roli i drużyny
    switch(bot.role) {
        case "striker":
            // Środkowy napastnik - zawsze blisko bramki przeciwnika
            const ballInOffensiveZone = isPlayerTeam ? ball.x > canvas.width * 0.6 : ball.x < canvas.width * 0.4;
            
            if (ballInReach || ballInOffensiveZone) {
                const predictTime = 8;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                
                if (distanceToBall < 40) {
                    // Pozycjonuj się optymalnie do strzału na bramkę wroga
                    const goalCenterY = canvas.height / 2;
                    const angleToGoal = Math.atan2(goalCenterY - ball.y, enemyGoalX - ball.x);
                    targetX = ball.x + Math.cos(angleToGoal + Math.PI) * 25;
                    targetY = ball.y + Math.sin(angleToGoal + Math.PI) * 25;
                }
            } else {
                // Czekaj w polu karnym przeciwnika
                targetX = isPlayerTeam ? canvas.width * 0.85 : canvas.width * 0.15;
                targetY = canvas.height / 2 + (Math.random() - 0.5) * 60;
            }
            break;

        case "winger":
            // Skrzydłowy - porusza się po bokach
            const isTopWinger = bot.preferredY < canvas.height / 2;
            const wingY = isTopWinger ? canvas.height * 0.2 : canvas.height * 0.8;
            
            if (ballInReach) {
                // Przy piłce - przeciągaj ją w stronę bramki wroga
                targetX = ball.x + (isPlayerTeam ? 30 : -30);
                targetY = wingY + (Math.random() - 0.5) * 40;
            } else if (isPlayerTeam ? ball.x < canvas.width * 0.5 : ball.x > canvas.width * 0.5) {
                // Piłka w ofensywie - biegaj po linii bocznej
                targetX = isPlayerTeam ? canvas.width * 0.75 : canvas.width * 0.25;
                targetY = wingY;
            } else {
                // Piłka w defensywie - wróć nieco do tyłu
                targetX = isPlayerTeam ? canvas.width * 0.4 : canvas.width * 0.6;
                targetY = wingY;
            }
            break;

        case "attacking_midfielder":
            // Ofensywny pomocnik - wspiera atak
            const ballInAttackZone = isPlayerTeam ? ball.x > canvas.width * 0.4 : ball.x < canvas.width * 0.6;
            
            if (ballInReach || ballInAttackZone) {
                const predictTime = 5;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                
                if (distanceToBall < 60) {
                    // Znajdź wolną przestrzeń za napastnikami
                    targetX = isPlayerTeam ? canvas.width * 0.65 : canvas.width * 0.35;
                    targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.8;
                }
            } else {
                // Pozycja centralnie-ofensywna
                targetX = isPlayerTeam ? canvas.width * 0.5 : canvas.width * 0.5;
                targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.4;
            }
            break;

        case "defensive_midfielder":
            // Defensywny pomocnik - osłania obronę
            const ballNearDefense = isPlayerTeam ? ball.x < canvas.width * 0.4 : ball.x > canvas.width * 0.6;
            
            if (ballNearDefense && ballInReach) {
                targetX = ball.x + (isPlayerTeam ? -40 : 40);
                targetY = ball.y;
            } else {
                // Pozycja przed obroną
                targetX = isPlayerTeam ? canvas.width * 0.3 : canvas.width * 0.7;
                targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.3;
                
                // Reaguj na zagrożenie
                const ballThreatening = isPlayerTeam ? ball.x < canvas.width * 0.3 : ball.x > canvas.width * 0.7;
                if (ballThreatening) {
                    targetX = isPlayerTeam ? canvas.width * 0.25 : canvas.width * 0.75;
                }
            }
            break;

        case "fullback":
            // Boczny obrońca
            const isTopFullback = bot.preferredY < canvas.height / 2;
            const fullbackY = isTopFullback ? canvas.height * 0.25 : canvas.height * 0.75;
            const ballInDefenseZone = isPlayerTeam ? ball.x < canvas.width * 0.3 : ball.x > canvas.width * 0.7;
            
            if (ballInDefenseZone && ballInReach) {
                // Przy piłce w defensywie
                targetX = ball.x + (isPlayerTeam ? -30 : 30);
                targetY = ball.y;
            } else if (isPlayerTeam ? ball.x > canvas.width * 0.7 : ball.x < canvas.width * 0.3) {
                // Piłka w ataku - można wspomagać atak
                targetX = isPlayerTeam ? canvas.width * 0.45 : canvas.width * 0.55;
                targetY = fullbackY;
            } else {
                // Normalna pozycja defensywna
                targetX = isPlayerTeam ? canvas.width * 0.2 : canvas.width * 0.8;
                targetY = fullbackY;
            }
            break;

        case "centerback":
            // Środkowy obrońca - zawsze w centrum defensywy
            const ballVeryClose = isPlayerTeam ? ball.x < canvas.width * 0.3 : ball.x > canvas.width * 0.7;
            
            if (ballVeryClose && ballInReach) {
                targetX = ball.x + (isPlayerTeam ? -25 : 25);
                targetY = ball.y;
            } else {
                // Pozycja centralnie-defensywna
                targetX = isPlayerTeam ? canvas.width * 0.15 : canvas.width * 0.85;
                targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.15;
                
                // Reaguj na zagrożenie w polu karnym
                const ballInPenaltyBox = isPlayerTeam ? ball.x < canvas.width * 0.2 : ball.x > canvas.width * 0.8;
                if (ballInPenaltyBox) {
                    targetX = isPlayerTeam ? canvas.width * 0.1 : canvas.width * 0.9;
                    targetY = ball.y;
                }
            }
            break;

        case "sweeper":
            // Libero - swobodny obrońca
            if (ballInReach) {
                targetX = ball.x + (isPlayerTeam ? -20 : 20);
                targetY = ball.y;
            } else {
                // Pozycjonuj się za linią obrony
                const sameTeamDefenders = bots.filter(b => 
                    b.team === bot.team && 
                    (b.role === "centerback" || b.role === "fullback")
                );
                
                let defenseLine;
                if (isPlayerTeam) {
                    defenseLine = sameTeamDefenders.length > 0 ? 
                        Math.min(...sameTeamDefenders.map(b => b.x)) - 20 : canvas.width * 0.25;
                } else {
                    defenseLine = sameTeamDefenders.length > 0 ? 
                        Math.max(...sameTeamDefenders.map(b => b.x)) + 20 : canvas.width * 0.75;
                }
                
                targetX = defenseLine;
                targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.2;
                
                // Reaguj na przełamania
                const ballFastMoving = Math.abs(ball.vx) > 3;
                const ballThreatening = isPlayerTeam ? ball.x < canvas.width * 0.4 : ball.x > canvas.width * 0.6;
                
                if (ballFastMoving && ballThreatening) {
                    targetX = ball.x + ball.vx * 3;
                    targetY = ball.y + ball.vy * 3;
                }
            }
            break;

        case "attacker":
            // Klasyczny napastnik
            const ballInOffensive = isPlayerTeam ? ball.x > canvas.width * 0.3 : ball.x < canvas.width * 0.7;
            
            if (ballInReach || ballInOffensive) {
                const predictTime = 6;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                
                if (distanceToBall < 50) {
                    const goalCenterY = canvas.height / 2;
                    const angleToGoal = Math.atan2(goalCenterY - ball.y, enemyGoalX - ball.x);
                    targetX = ball.x + Math.cos(angleToGoal + Math.PI) * 30;
                    targetY = ball.y + Math.sin(angleToGoal + Math.PI) * 30;
                }
            } else {
                targetX = isPlayerTeam ? canvas.width * 0.4 : canvas.width * 0.6;
                targetY = bot.preferredY;
            }
            break;
            
        case "midfielder":
            // Klasyczny pomocnik
            if (ballInReach) {
                targetX = ball.x + (Math.random() - 0.5) * 40;
                targetY = ball.y + (Math.random() - 0.5) * 40;
            } else {
                targetX = isPlayerTeam ? canvas.width * 0.35 : canvas.width * 0.65;
                targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.3;
            }
            break;
            
        case "ball_chaser":
            // Zawsze goni za piłką - brak taktyki
            const chasePredictTime = 2;
            targetX = ball.x + ball.vx * chasePredictTime;
            targetY = ball.y + ball.vy * chasePredictTime;
            
            // Nie odstępuj od piłki daleko
            if (distanceToBall > 200) {
                targetX = ball.x;
                targetY = ball.y;
            }
            break;

        case "defender":
        default:
            // Klasyczny obrońca
            const ballNearOwnGoal = isPlayerTeam ? ball.x < canvas.width * 0.4 : ball.x > canvas.width * 0.6;
            
            if (ballNearOwnGoal && ballInReach) {
                targetX = ball.x + (isPlayerTeam ? -20 : 20);
                targetY = ball.y;
            } else {
                targetX = isPlayerTeam ? canvas.width * 0.25 : canvas.width * 0.75;
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
            case 0: errorChance = 0.15; break;
            case 1: errorChance = 0.10; break;
            case 2: errorChance = 0.12; break;
            case 3: errorChance = 0.06; break;
            case 4: errorChance = 0.04; break;
            case 5: errorChance = 0.20; break;
            case 6: errorChance = 0.18; break;
            default: errorChance = 0.08;
        }
    }
    
    // Dodaj błędy w zależności od pozycji
    let roleErrorMultiplier = 1.0;
    switch(bot.role) {
        case "striker": 
        case "attacking_midfielder": 
            roleErrorMultiplier = 0.7; break;
        case "winger": 
        case "attacker": 
            roleErrorMultiplier = 0.8; break;
        case "midfielder": 
        case "defensive_midfielder": 
            roleErrorMultiplier = 1.0; break;
        case "fullback": 
        case "sweeper": 
            roleErrorMultiplier = 1.1; break;
        case "ball_chaser": 
            roleErrorMultiplier = 1.4; break;
        case "centerback": 
        case "defender": 
            roleErrorMultiplier = 1.3; break;
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
        
        // Różne prędkości w zależności od pozycji
        let speedMultiplier = 1.0;
        switch(bot.role) {
            case "winger": 
            case "striker": 
                speedMultiplier = 1.1; break;
            case "ball_chaser": 
                speedMultiplier = 1.15; break;
            case "attacking_midfielder": 
            case "attacker": 
                speedMultiplier = 1.05; break;
            case "midfielder": 
            case "fullback": 
                speedMultiplier = 1.0; break;
            case "defensive_midfielder": 
            case "sweeper": 
                speedMultiplier = 0.95; break;
            case "centerback": 
            case "defender": 
                speedMultiplier = 0.9; break;
        }
        
        const currentSpeed = bot.maxSpeed * speedMultiplier;
        
        bot.vx = normalizedX * currentSpeed;
        bot.vy = normalizedY * currentSpeed;
    } else {
        bot.vx *= 0.8;
        bot.vy *= 0.8;
    }

    bot.x += bot.vx;
    bot.y += bot.vy;

    // Ograniczenia pozycji - tylko granice boiska
    bot.x = Math.max(bot.radius + 15, Math.min(canvas.width - bot.radius - 15, bot.x));
    bot.y = Math.max(bot.radius + 15, Math.min(canvas.height - bot.radius - 15, bot.y));
}

function updateGoalkeeper(bot) {
    // Bramkarz - pozycja zależy od drużyny
    const isPlayerTeam = bot.team === "player";
    let targetY = ball.y;
    
    if (isPlayerTeam) {
        // Bramkarz gracza - lewa strona
        bot.x = Math.max(20, Math.min(50, bot.x));
    } else {
        // Bramkarz przeciwnika - prawa strona
        bot.x = Math.max(canvas.width - 50, Math.min(canvas.width - 20, bot.x));
    }
    
    targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
    
    const dy = targetY - bot.y;
    bot.vy = dy * 0.12;
    bot.y += bot.vy;
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
