// ============================================
// LOGIKA BOTA (AI)
// ============================================

function botTurn() {
    addLog("Bot wykonuje ruch...", 'play');
    
    // Nowa tura
    gameState.turn++;
    gameState.bot.maxMana = Math.min(10, gameState.turn);
    gameState.bot.mana = gameState.bot.maxMana;
    
    // Zmniejszanie cooldownu trenera
    if (gameState.bot.coachCooldown > 0) {
        gameState.bot.coachCooldown--;
    }
    
    // Dobranie karty
    drawCard('bot');
    
    // Odświeżenie możliwości ataku dla kart które BYŁY na boisku przed tą turą
    gameState.bot.field.forEach(card => {
        card.canAttack = true;
    });
    
    // Bot gra karty (nowe karty dostaną canAttack = false/true w playCard)
    let played = true;
    while (played) {
        played = false;
        for (let i = 0; i < gameState.bot.hand.length; i++) {
            const actualCost = getCardCost('bot', gameState.bot.hand[i]);
            if (actualCost <= gameState.bot.mana && gameState.bot.field.length < 7) {
                const cardName = gameState.bot.hand[i].name;
                playCard('bot', i);
                addLog(`Bot zagral: ${cardName}`, 'play');
                played = true;
                break;
            }
        }
    }
    
    updateUI();
    
    setTimeout(() => {
        // Bot atakuje - karty już mają canAttack ustawione prawidłowo
        botAttackPhase();
        
        updateUI();
        
        setTimeout(() => {
            // Koniec tury bota - start tury gracza
            startPlayerTurn();
        }, 1500);
    }, 2000);
}

function botAttackPhase() {
    for (let i = gameState.bot.field.length - 1; i >= 0; i--) {
        if (gameState.bot.field[i] && gameState.bot.field[i].canAttack) {
            const playerHasTaunt = gameState.player.field.some(card => hasAbility(card, 'taunt'));
            
            // Bot decyduje czy atakować kartę czy bramkarza
            if (gameState.player.field.length > 0 && Math.random() > 0.3) {
                // 70% szans - atakuj losową kartę gracza
                const targetIndex = Math.floor(Math.random() * gameState.player.field.length);
                attack('bot', i, 'player', targetIndex);
            } else if (!playerHasTaunt) {
                // 30% szans - atakuj bramkarza (jeśli nie ma taunt)
                attack('bot', i, 'player', null);
            } else {
                // Gracz ma taunt - atakuj kartę
                const targetIndex = Math.floor(Math.random() * gameState.player.field.length);
                attack('bot', i, 'player', targetIndex);
            }
        }
    }
}
