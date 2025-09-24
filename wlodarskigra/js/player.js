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
        case "striker":
            // Środkowy napastnik - zawsze blisko bramki przeciwnika
            if (ballInReach || ball.x > canvas.width * 0.4) {
                const predictTime = 8;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                
                if (distanceToBall < 40) {
                    // Pozycjonuj się optymalnie do strzału
                    const goalCenterY = canvas.height / 2;
                    const angleToGoal = Math.atan2(goalCenterY - ball.y, 15 - ball.x);
                    targetX = ball.x + Math.cos(angleToGoal + Math.PI) * 25;
                    targetY = ball.y + Math.sin(angleToGoal + Math.PI) * 25;
                }
            } else {
                // Czekaj w polu karnym przeciwnika
                targetX = canvas.width * 0.15;
                targetY = canvas.height / 2 + (Math.random() - 0.5) * 60;
            }
            break;

        case "winger":
            // Skrzydłowy - porusza się po bokach
            const isTopWinger = bot.preferredY < canvas.height / 2;
            const wingY = isTopWinger ? canvas.height * 0.2 : canvas.height * 0.8;
            
            if (ballInReach) {
                // Przy piłce - próbuj ją przeciągnąć na skrzydło
                targetX = ball.x - 30;
                targetY = wingY + (Math.random() - 0.5) * 40;
            } else if (ball.x > canvas.width * 0.5) {
                // Piłka w ofensywie - biegaj po linii bocznej
                targetX = canvas.width * 0.25;
                targetY = wingY;
            } else {
                // Piłka w defensywie - wróć nieco do tyłu
                targetX = canvas.width * 0.6;
                targetY = wingY;
            }
            break;

        case "attacking_midfielder":
            // Ofensywny pomocnik - wspiera atak
            if (ballInReach || ball.x > canvas.width * 0.4) {
                const predictTime = 5;
                targetX = ball.x + ball.vx * predictTime;
                targetY = ball.y + ball.vy * predictTime;
                
                if (distanceToBall < 60) {
                    // Znajdź wolną przestrzeń za napastnikami
                    targetX = canvas.width * 0.35;
                    targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.8;
                }
            } else {
                // Pozycja centralnie-ofensywna
                targetX = canvas.width * 0.5;
                targetY = bot.preferredY + (ball.y - canvas.height/2) * 0.4;
            }
            break;

        case "defensive_midfielder":
            // Defensywny pomocnik - osłania obronę
            if (ball.x > canvas.width * 0.6 && ballInReach) {
                targetX = ball.x + 40;
                targetY = ball.y;
            } else {
                // Pozycja przed obroną
                targetX = canvas.width * 0.7;
                targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.3;
                
                // Reaguj na zagrożenie
                if (ball.x < canvas.width * 0.4) {
                    targetX = canvas.width * 0.65;
                }
            }
            break;

        case "fullback":
            // Boczny obrońca
            const isTopFullback = bot.preferredY < canvas.height / 2;
            const fullbackY = isTopFullback ? canvas.height * 0.25 : canvas.height * 0.75;
            
            if (ball.x > canvas.width * 0.7 && ballInReach) {
                // Przy piłce w defensywie
                targetX = ball.x + 30;
                targetY = ball.y;
            } else if (ball.x < canvas.width * 0.3) {
                // Piłka w ataku - można wspomagać atak
                targetX = canvas.width * 0.55;
                targetY = fullbackY;
            } else {
                // Normalna pozycja defensywna
                targetX = canvas.width * 0.8;
                targetY = fullbackY;
            }
            break;

        case "centerback":
            // Środkowy obrońca - zawsze w centrum defensywy
            if (ball.x > canvas.width * 0.7 && ballInReach) {
                targetX = ball.x + 25;
                targetY = ball.y;
            } else {
                // Pozycja centralnie-defensywna
                targetX = canvas.width * 0.85;
                targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.15;
                
                // Reaguj na zagrożenie w polu karnym
                if (ball.x > canvas.width * 0.8) {
                    targetX = canvas.width * 0.9;
                    targetY = ball.y;
                }
            }
            break;

        case "sweeper":
            // Libero - swobodny obrońca
            if (ballInReach) {
                targetX = ball.x + 20;
                targetY = ball.y;
            } else {
                // Pozycjonuj się za linią obrony
                const defenseLine = Math.max(canvas.width * 0.75, 
                    Math.max(...bots.filter(b => b.role === "centerback" || b.role === "fullback").map(b => b.x)) + 30);
                
                targetX = defenseLine + 20;
                targetY = canvas.height / 2 + (ball.y - canvas.height/2) * 0.2;
                
                // Reaguj na przełamania
                if (ball.x > canvas.width * 0.6 && Math.abs(ball.vx) > 3) {
                    targetX = ball.x + ball.vx * 3;
                    targetY = ball.y + ball.vy * 3;
                }
            }
            break;

        case "attacker":
            // Klasyczny napastnik - bardziej uniwersalny niż striker
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
            // Klasyczny pomocnik
            if (ballInReach) {
                targetX = ball.x + (Math.random() - 0.5) * 40;
                targetY = ball.y + (Math.random() - 0.5) * 40;
            } else {
                targetX = canvas.width * 0.65;
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
            if (ball.x > canvas.width * 0.6 && ballInReach) {
                targetX = ball.x + 20;
                targetY = ball.y;
            } else {
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
    
    // Dodaj błędy w zależności od pozycji - rozszerzone
    let roleErrorMultiplier = 1.0;
    switch(bot.role) {
        case "striker": 
        case "attacking_midfielder": 
            roleErrorMultiplier = 0.7; break;  // Najlepsi technicznie
        case "winger": 
        case "attacker": 
            roleErrorMultiplier = 0.8; break;  // Dobrzy technicznie
        case "midfielder": 
        case "defensive_midfielder": 
            roleErrorMultiplier = 1.0; break;  // Średni poziom
        case "fullback": 
        case "sweeper": 
            roleErrorMultiplier = 1.1; break;  // Nieco mniej zwinni
        case "ball_chaser": 
            roleErrorMultiplier = 1.4; break;  // Bardzo nieprzewidywalni, dużo błędów
        case "centerback": 
        case "defender": 
            roleErrorMultiplier = 1.3; break;  // Najmniej zwinni
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
                speedMultiplier = 1.1; break;  // Najszybsi
            case "ball_chaser": 
                speedMultiplier = 1.15; break;  // Bardzo szybcy ale nieprecyzyjni
            case "attacking_midfielder": 
            case "attacker": 
                speedMultiplier = 1.05; break;  // Szybcy
            case "midfielder": 
            case "fullback": 
                speedMultiplier = 1.0; break;  // Normalni
            case "defensive_midfielder": 
            case "sweeper": 
                speedMultiplier = 0.95; break;  // Nieco wolniejsi
            case "centerback": 
            case "defender": 
                speedMultiplier = 0.9; break;  // Najwolniejsi
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
    let targetY = ball.y;
    bot.x = Math.max(canvas.width - 50, Math.min(canvas.width - 20, bot.x));
    targetY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.65, targetY));
    
    const dy = targetY - bot.y;
    bot.vy = dy * 0.12;
    bot.y += bot.vy;
}
