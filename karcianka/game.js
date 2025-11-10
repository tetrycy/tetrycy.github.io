// ============================================
// GŁÓWNA LOGIKA GRY
// ============================================

// ============================================
// STAN GRY
// ============================================

let gameState = {
    turn: 1,
    currentPlayer: 'player',
    player: {
        goalkeeperHP: 10,
        goals: 0,
        mana: 1,
        maxMana: 1,
        hand: [],
        field: [],
        deck: [],
        coach: null,
        coachCooldown: 0
    },
    bot: {
        goalkeeperHP: 10,
        goals: 0,
        mana: 0,
        maxMana: 0,
        hand: [],
        field: [],
        deck: [],
        coach: null,
        coachCooldown: 0
    },
    selectedCard: null,
    attackingCard: null,
    spellMode: null,
    coachTargetMode: null
};

let selectedFactions = {
    player: null,
    bot: null
};

let selectedCoaches = {
    player: null,
    bot: null
};

// ============================================
// INICJALIZACJA GRY
// ============================================

function initGame() {
    if (!selectedFactions.player || !selectedFactions.bot) {
        console.error('Frakcje nie zostaly wybrane!');
        return;
    }
    
    if (!selectedCoaches.player || !selectedCoaches.bot) {
        console.error('Trenerzy nie zostali wybrani!');
        return;
    }
    
    // Przypisanie trenerów
    gameState.player.coach = coaches.find(c => c.id === selectedCoaches.player);
    gameState.bot.coach = coaches.find(c => c.id === selectedCoaches.bot);
    
    // Tworzenie talii z wybranych frakcji
    gameState.player.deck = createDeck(selectedFactions.player);
    gameState.bot.deck = createDeck(selectedFactions.bot);
    
    // Początkowe karty
    for (let i = 0; i < 4; i++) {
        drawCard('player');
        drawCard('bot');
    }
    
    updateUI();
    addLog("Gra rozpoczeta! Dobrano poczatkowe karty.", 'play');
    addLog(`Twoj trener: ${gameState.player.coach.name}`, 'play');
    addLog(`Trener bota: ${gameState.bot.coach.name}`, 'play');
    
    // Ukrycie modali
    document.getElementById('faction-select-modal').classList.remove('active');
    document.getElementById('coach-select-modal').classList.remove('active');
}

function selectFaction(factionId) {
    selectedFactions.player = factionId;
    
    // Bot wybiera losową frakcję
    const factionIds = Object.keys(factions);
    selectedFactions.bot = factionIds[Math.floor(Math.random() * factionIds.length)];
    
    const playerFaction = factions[selectedFactions.player];
    const botFaction = factions[selectedFactions.bot];
    
    addLog(`Wybrales: ${playerFaction.emoji} ${playerFaction.name}`, 'play');
    addLog(`Bot wybral: ${botFaction.emoji} ${botFaction.name}`, 'play');
    
    // Ukrycie modala frakcji
    document.getElementById('faction-select-modal').classList.remove('active');
    
    // Pokazanie modala wyboru trenera
    document.getElementById('coach-select-modal').classList.add('active');
}

function selectCoach(coachId) {
    selectedCoaches.player = coachId;
    
    // Bot wybiera losowego trenera
    selectedCoaches.bot = coaches[Math.floor(Math.random() * coaches.length)].id;
    
    // Reset stanu gry
    resetGameState();
    
    // Start gry
    initGame();
}

function resetGameState() {
    gameState = {
        turn: 1,
        currentPlayer: 'player',
        player: {
            goalkeeperHP: 10,
            goals: 0,
            mana: 1,
            maxMana: 1,
            hand: [],
            field: [],
            deck: [],
            coach: null,
            coachCooldown: 0
        },
        bot: {
            goalkeeperHP: 10,
            goals: 0,
            mana: 0,
            maxMana: 0,
            hand: [],
            field: [],
            deck: [],
            coach: null,
            coachCooldown: 0
        },
        selectedCard: null,
        attackingCard: null,
        spellMode: null,
        coachTargetMode: null
    };
}

function newGame() {
    // Reset wybranych frakcji i trenerów
    selectedFactions.player = null;
    selectedFactions.bot = null;
    selectedCoaches.player = null;
    selectedCoaches.bot = null;
    
    // Ukrycie modali
    document.getElementById('game-over-modal').classList.remove('active');
    document.getElementById('coach-select-modal').classList.remove('active');
    
    // Pokazanie modala wyboru frakcji
    document.getElementById('faction-select-modal').classList.add('active');
    
    // Czyszczenie logu
    document.getElementById('game-log').innerHTML = '';
}

// ============================================
// ZARZĄDZANIE KARTAMI
// ============================================

function drawCard(player) {
    if (gameState[player].deck.length > 0 && gameState[player].hand.length < 10) {
        const card = gameState[player].deck.pop();
        gameState[player].hand.push(card);
        if (player === 'player') {
            addLog(`Dobrales karte: ${card.name}`, 'play');
        }
        return true;
    }
    return false;
}

function playCard(player, cardIndex) {
    const card = gameState[player].hand[cardIndex];
    const actualCost = getCardCost(player, card);
    
    if (gameState[player].mana < actualCost) {
        addLog("Nie masz wystarczajaco many!", 'play');
        return false;
    }
    
    // Odejmowanie many
    gameState[player].mana -= actualCost;
    gameState[player].hand.splice(cardIndex, 1);
    
    if (card.type === 'spell') {
        // KARTA AKCJI - wykonaj efekt i znika
        if (player === 'player') {
            addLog(`Zagrales: ${card.name}`, 'play');
        }
        executeSpellEffect(player, card.effect);
        updateUI();
        return true;
        
    } else if (card.type === 'minion') {
        // KARTA ZAWODNIKA - trafia na boisko
        if (gameState[player].field.length >= 7) {
            addLog("Boisko pelne! Maksymalnie 7 kart.", 'play');
            // Zwróć kartę i manę
            gameState[player].hand.push(card);
            gameState[player].mana += actualCost;
            return false;
        }
        
        // Ustawianie canAttack - charge pozwala atakować od razu
        const canAttackNow = hasAbility(card, 'charge');
        const newCard = { ...card, canAttack: canAttackNow, id: Math.random() };
        
        gameState[player].field.push(newCard);
        
        // Zastosowanie pasywnego efektu trenera
        applyCoachPassiveEffect(player);
        
        if (player === 'player') {
            addLog(`Zagrales: ${card.name} (${card.position})`, 'play');
            if (canAttackNow) {
                addLog(`${card.name} ma SZARZE! Moze atakowac od razu!`, 'play');
            }
        }
        
        // Wykonanie Battlecry
        triggerBattlecry(player, newCard);
        
        updateUI();
        return true;
    }
    
    return false;
}

// ============================================
// MECHANIKA ATAKU
// ============================================

function attack(attackerPlayer, attackerIndex, defenderPlayer, defenderIndex = null) {
    const attacker = gameState[attackerPlayer].field[attackerIndex];
    
    if (!attacker.canAttack) {
        addLog("Ta karta nie moze jeszcze atakowac!", 'attack');
        return false;
    }

    // Sprawdzenie czy są karty z taunt na polu przeciwnika
    const defenderHasTaunt = gameState[defenderPlayer].field.some(card => hasAbility(card, 'taunt'));

    if (defenderIndex === null) {
        // Atak bezpośredni na bramkarza
        if (!defenderHasTaunt) {
            // Atak na bramkarza (dozwolony gdy nie ma Obrońców)
            if (gameState[defenderPlayer].goalkeeperHP > 0) {
                // Bramkarz broni
                const damage = attacker.attack;
                gameState[defenderPlayer].goalkeeperHP -= damage;
                
                // Lifesteal - leczenie własnego bramkarza
                if (hasAbility(attacker, 'lifesteal')) {
                    gameState[attackerPlayer].goalkeeperHP += damage;
                    if (gameState[attackerPlayer].goalkeeperHP > 10) {
                        gameState[attackerPlayer].goalkeeperHP = 10;
                    }
                    addLog(`${attacker.name} leczy bramkarza o ${damage} HP!`, 'play');
                }
                
                addLog(`${attacker.name} atakuje Bramkarza! ${damage} obrazen!`, 'attack');
                
                if (gameState[defenderPlayer].goalkeeperHP <= 0) {
                    gameState[defenderPlayer].goalkeeperHP = 0;
                    addLog(`BRAMKA OTWARTA! Bramkarz pokonany!`, 'attack');
                }
            } else {
                // Bramkarz pokonany - GOL!
                gameState[attackerPlayer].goals++;
                addLog(`GOOOOL!!! ${attacker.name} strzela gola!`, 'attack');
                
                // Reset bramkarza
                gameState[defenderPlayer].goalkeeperHP = 10;
                addLog(`Bramkarz wraca na pozycje (10 HP)`, 'play');
                
                checkGameOver();
            }
            
            attacker.canAttack = false;
            updateUI();
            return true;
        } else {
            addLog("Obronca blokuje atak! Musisz najpierw zniszczyc wszystkich Obroncow!", 'attack');
            return false;
        }
    } else {
        // Atak na kartę przeciwnika
        const defender = gameState[defenderPlayer].field[defenderIndex];
        
        addLog(`${attacker.name} (${attacker.attack}) atakuje ${defender.name} (${defender.defense})!`, 'attack');
        
        // Sprawdzenie Divine Shield obrońcy
        if (hasAbility(defender, 'divine_shield')) {
            // Usuń divine shield i zablokuj obrażenia
            defender.abilities = defender.abilities.filter(a => a !== 'divine_shield');
            addLog(`${defender.name} traci TARCZĘ, ale przeżywa atak!`, 'attack');
            
            // Atakujący nadal otrzymuje kontratak
            attacker.defense -= defender.attack;
        } else {
            // Normalne obrażenia
            const damageDealt = attacker.attack;
            defender.defense -= damageDealt;
            attacker.defense -= defender.attack;
            
            // Lifesteal - leczenie własnego bramkarza
            if (hasAbility(attacker, 'lifesteal')) {
                gameState[attackerPlayer].goalkeeperHP += damageDealt;
                if (gameState[attackerPlayer].goalkeeperHP > 10) {
                    gameState[attackerPlayer].goalkeeperHP = 10;
                }
                addLog(`${attacker.name} leczy bramkarza o ${damageDealt} HP!`, 'play');
            }
        }
        
        // Usuwanie zniszczonych kart
        if (defender.defense <= 0) {
            gameState[defenderPlayer].field.splice(defenderIndex, 1);
            addLog(`${defender.name} zostal zniszczony!`, 'attack');
        }
        
        if (attacker.defense <= 0) {
            gameState[attackerPlayer].field.splice(attackerIndex, 1);
            addLog(`${attacker.name} zostal zniszczony!`, 'attack');
        } else {
            attacker.canAttack = false;
        }
        
        updateUI();
        return true;
    }
}

// ============================================
// ZARZĄDZANIE TURAMI
// ============================================

function endTurn() {
    if (gameState.currentPlayer === 'player') {
        gameState.currentPlayer = 'bot';
        document.getElementById('current-player').textContent = 'TURA BOTA';
        addLog("Twoja tura zakonczona", 'play');
        
        setTimeout(() => {
            botTurn();
        }, 1000);
    }
}

function startPlayerTurn() {
    gameState.currentPlayer = 'player';
    gameState.player.maxMana = Math.min(10, gameState.turn);
    gameState.player.mana = gameState.player.maxMana;
    
    // Zmniejszanie cooldownu trenera
    if (gameState.player.coachCooldown > 0) {
        gameState.player.coachCooldown--;
    }
    
    // Gracz może atakować swoimi kartami
    gameState.player.field.forEach(card => {
        card.canAttack = true;
        
        // Zmniejszanie cooldownów aktywowanych zdolności
        if (card.abilityCooldowns) {
            Object.keys(card.abilityCooldowns).forEach(abilityId => {
                if (card.abilityCooldowns[abilityId] > 0) {
                    card.abilityCooldowns[abilityId]--;
                }
            });
        }
    });
    
    drawCard('player');
    
    document.getElementById('current-player').textContent = 'TWOJA TURA';
    addLog("Twoja tura rozpoczeta!", 'play');
    updateUI();
}

// ============================================
// ZAKOŃCZENIE GRY
// ============================================

function checkGameOver() {
    if (gameState.player.goals >= 3) {
        showGameOver(true);
    } else if (gameState.bot.goals >= 3) {
        showGameOver(false);
    }
}

function showGameOver(playerWon) {
    const modal = document.getElementById('game-over-modal');
    const text = document.getElementById('game-over-text');
    const message = document.getElementById('game-over-message');
    
    if (playerWon) {
        text.textContent = 'WYGRANA!';
        message.textContent = `Gratulacje! Wygrales ${gameState.player.goals}:${gameState.bot.goals}!`;
    } else {
        text.textContent = 'PRZEGRANA';
        message.textContent = `Bot wygral ${gameState.bot.goals}:${gameState.player.goals}. Sprobuj ponownie!`;
    }
    
    modal.classList.add('active');
}

// ============================================
// FUNKCJE POMOCNICZE LOGU
// ============================================

function addLog(message, type = '') {
    const logDiv = document.getElementById('game-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    logDiv.insertBefore(entry, logDiv.firstChild);
    
    // Limit wpisów
    while (logDiv.children.length > 20) {
        logDiv.removeChild(logDiv.lastChild);
    }
}
