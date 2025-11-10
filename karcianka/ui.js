// ============================================
// INTERFEJS UŻYTKOWNIKA (UI)
// ============================================

function updateCoachUI(player) {
    const coach = gameState[player].coach;
    if (!coach) return;
    
    const coachElement = document.getElementById(`${player}-coach`);
    const coachName = document.getElementById(`${player}-coach-name`);
    const coachAbility = document.getElementById(`${player}-coach-ability`);
    const coachBtn = document.getElementById(`${player}-coach-btn`);
    
    if (coachName) coachName.textContent = `${coach.emoji} ${coach.name}`;
    if (coachAbility) coachAbility.textContent = coach.description;
    
    // Przycisk tylko dla aktywnych trenerów gracza
    if (coachBtn && coach.type === 'active' && player === 'player') {
        coachBtn.style.display = 'block';
        
        const onCooldown = gameState.player.coachCooldown > 0;
        const noMana = gameState.player.mana < coach.cost;
        const notPlayerTurn = gameState.currentPlayer !== 'player';
        
        if (onCooldown) {
            coachBtn.disabled = true;
            coachBtn.textContent = `${coach.emoji} Cooldown: ${gameState.player.coachCooldown}`;
        } else if (noMana) {
            coachBtn.disabled = true;
            coachBtn.textContent = `${coach.emoji} Brak many (${coach.cost})`;
        } else if (notPlayerTurn) {
            coachBtn.disabled = true;
            coachBtn.textContent = `${coach.emoji} ${coach.cost} many`;
        } else {
            coachBtn.disabled = false;
            coachBtn.textContent = `${coach.emoji} Uzyj (${coach.cost} many)`;
        }
    } else if (coachBtn) {
        coachBtn.style.display = 'none';
    }
}

function updateUI() {
    // Aktualizacja statystyk
    document.getElementById('turn-number').textContent = gameState.turn;
    document.getElementById('player-goals').textContent = gameState.player.goals;
    document.getElementById('player-mana').textContent = gameState.player.mana + '/' + gameState.player.maxMana;
    document.getElementById('bot-goals').textContent = gameState.bot.goals;
    document.getElementById('bot-mana').textContent = gameState.bot.mana + '/' + gameState.bot.maxMana;
    
    // Aktualizacja trenerów
    updateCoachUI('player');
    updateCoachUI('bot');
    
    // Aktualizacja bramkarzy
    document.getElementById('player-goalkeeper-hp').textContent = gameState.player.goalkeeperHP;
    document.getElementById('bot-goalkeeper-hp').textContent = gameState.bot.goalkeeperHP;
    
    // Oznaczanie otwartych bramek
    const playerGoalkeeper = document.getElementById('player-goalkeeper');
    const botGoalkeeper = document.getElementById('bot-goalkeeper');
    
    if (gameState.player.goalkeeperHP <= 0) {
        playerGoalkeeper.classList.add('open');
    } else {
        playerGoalkeeper.classList.remove('open');
    }
    
    if (gameState.bot.goalkeeperHP <= 0) {
        botGoalkeeper.classList.add('open');
    } else {
        botGoalkeeper.classList.remove('open');
    }
    
    // Aktualizacja kropek goli
    for (let i = 1; i <= 3; i++) {
        const playerDot = document.getElementById(`player-goal-${i}`);
        const botDot = document.getElementById(`bot-goal-${i}`);
        
        if (i <= gameState.player.goals) {
            playerDot.classList.add('scored');
        } else {
            playerDot.classList.remove('scored');
        }
        
        if (i <= gameState.bot.goals) {
            botDot.classList.add('scored');
        } else {
            botDot.classList.remove('scored');
        }
    }
    
    // Aktualizacja ręki gracza
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    gameState.player.hand.forEach((card, index) => {
        const cardEl = createCardElement(card, 'hand', index);
        handDiv.appendChild(cardEl);
    });
    
    // Aktualizacja boiska gracza
    const playerFieldDiv = document.getElementById('player-field');
    playerFieldDiv.innerHTML = '';
    gameState.player.field.forEach((card, index) => {
        const cardEl = createCardElement(card, 'player-field', index);
        playerFieldDiv.appendChild(cardEl);
    });
    
    // Aktualizacja boiska bota
    const botFieldDiv = document.getElementById('bot-field');
    botFieldDiv.innerHTML = '';
    gameState.bot.field.forEach((card, index) => {
        const cardEl = createCardElement(card, 'bot-field', index);
        botFieldDiv.appendChild(cardEl);
    });
    
    // Przycisk zakończenia tury
    document.getElementById('end-turn-btn').disabled = gameState.currentPlayer !== 'player';
    
    // Oznaczanie bramkarza bota gdy można go zaatakować
    const botHasTaunt = gameState.bot.field.some(card => hasAbility(card, 'taunt'));
    if (gameState.attackingCard !== null && !botHasTaunt && gameState.currentPlayer === 'player') {
        botGoalkeeper.classList.add('can-attack');
    } else {
        botGoalkeeper.classList.remove('can-attack');
    }
}

function createCardElement(card, location, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    // Oznaczanie kart z taunt
    if (hasAbility(card, 'taunt')) {
        cardDiv.classList.add('taunt');
    }
    
    // Oznaczanie kart z divine shield
    if (hasAbility(card, 'divine_shield')) {
        cardDiv.classList.add('divine-shield');
    }
    
    // Obliczenie rzeczywistego kosztu (z rabatem trenera)
    const actualCost = location === 'hand' ? getCardCost('player', card) : card.cost;
    const discounted = actualCost < card.cost;
    
    // Oznaczanie kart, które można zagrać
    if (location === 'hand' && gameState.currentPlayer === 'player' && 
        gameState.player.mana >= actualCost && gameState.player.field.length < 7) {
        cardDiv.classList.add('playable');
    }
    
    // Oznaczanie kart, które mogą atakować
    if (location === 'player-field' && card.canAttack && gameState.currentPlayer === 'player') {
        cardDiv.classList.add('can-attack');
    }
    
    // Generowanie HTML w zależności od typu karty
    if (card.type === 'spell') {
        // KARTA AKCJI
        cardDiv.innerHTML = `
            <div class="card-cost" style="${discounted ? 'background: #008000;' : ''}">${actualCost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-position">AKCJA</div>
            <div class="card-image">${card.emoji}</div>
            <div class="card-ability spell-description">${card.description || ''}</div>
        `;
        cardDiv.classList.add('spell-card');
    } else {
        // KARTA ZAWODNIKA
        const abilityText = getAbilityDescription(card);
        
        // Generowanie przycisków aktywowanych zdolności (tylko na boisku gracza)
        let abilityButtonsHTML = '';
        if (location === 'player-field' && card.activatedAbilities && card.activatedAbilities.length > 0) {
            abilityButtonsHTML = '<div class="ability-buttons">';
            card.activatedAbilities.forEach(ability => {
                const onCooldown = card.abilityCooldowns && card.abilityCooldowns[ability.id] > 0;
                const noMana = gameState.player.mana < ability.cost;
                const cooldownClass = onCooldown ? 'on-cooldown' : '';
                const manaClass = noMana ? 'no-mana' : '';
                const cooldownText = onCooldown ? ` (${card.abilityCooldowns[ability.id]})` : '';
                
                abilityButtonsHTML += `
                    <div class="ability-btn ${cooldownClass} ${manaClass}" 
                         data-card-index="${index}" 
                         data-ability-id="${ability.id}"
                         title="${ability.description}"
                         onclick="event.stopPropagation(); activateAbility('player', ${index}, '${ability.id}');">
                        ${ability.emoji} ${ability.name} (${ability.cost}M)${cooldownText}
                    </div>
                `;
            });
            abilityButtonsHTML += '</div>';
        }
        
        cardDiv.innerHTML = `
            <div class="card-cost" style="${discounted ? 'background: #008000;' : ''}">${actualCost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-position">${card.position}</div>
            <div class="card-image">${card.emoji}</div>
            <div class="card-stats">
                <div class="stat attack">ATK ${card.attack}</div>
                <div class="stat defense">DEF ${card.defense}</div>
            </div>
            <div class="card-ability">${abilityText}</div>
            ${abilityButtonsHTML}
        `;
    }
    
    // Obsługa kliknięć
    setupCardClickHandlers(cardDiv, card, location, index);
    
    return cardDiv;
}

function setupCardClickHandlers(cardDiv, card, location, index) {
    if (location === 'hand' && gameState.currentPlayer === 'player') {
        cardDiv.onclick = () => playCard('player', index);
        
    } else if (location === 'player-field' && gameState.currentPlayer === 'player') {
        // Obsługa wyboru celu dla trenera
        if (gameState.coachTargetMode && gameState.coachTargetMode.active && gameState.coachTargetMode.caster === 'player') {
            cardDiv.onclick = () => {
                executeCoachEffect('player', index);
                gameState.coachTargetMode = null;
                document.getElementById('spell-indicator').classList.remove('active');
                updateUI();
            };
            cardDiv.style.cursor = 'crosshair';
            cardDiv.style.border = '3px solid #00ff00';
            return;
        }
        
        // Normalna obsługa ataku
        cardDiv.onclick = () => {
            if (card.canAttack) {
                if (gameState.attackingCard === index) {
                    gameState.attackingCard = null;
                    document.getElementById('attack-indicator').classList.remove('active');
                    updateUI();
                } else {
                    gameState.attackingCard = index;
                    document.getElementById('attack-indicator').classList.add('active');
                    updateUI();
                    cardDiv.classList.add('selected');
                }
            }
        };
        
    } else if (location === 'bot-field') {
        // Obsługa spell mode - wybór celu zaklęcia
        if (gameState.spellMode && gameState.spellMode.active && gameState.spellMode.caster === 'player') {
            if (gameState.spellMode.effect === 'destroy_enemy_minion') {
                cardDiv.onclick = () => {
                    // Zniszczenie wybranej karty
                    gameState.bot.field.splice(index, 1);
                    addLog(`Zniszczono: ${card.name}!`, 'attack');
                    gameState.spellMode = null;
                    document.getElementById('spell-indicator').classList.remove('active');
                    updateUI();
                };
                cardDiv.style.cursor = 'crosshair';
                cardDiv.style.border = '3px solid #ff00ff';
            }
        }
        // Normalny atak kartą
        else if (gameState.attackingCard !== null && gameState.currentPlayer === 'player') {
            cardDiv.onclick = () => {
                attack('player', gameState.attackingCard, 'bot', index);
                gameState.attackingCard = null;
                document.getElementById('attack-indicator').classList.remove('active');
            };
            cardDiv.style.cursor = 'crosshair';
            cardDiv.style.border = '3px solid #ff0000';
        }
    }
}
