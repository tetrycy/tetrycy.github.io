// ============================================
// SYSTEM ZDOLNOŚCI I EFEKTÓW
// ============================================

// ============================================
// SYSTEM TRENERÓW
// ============================================

function applyCoachPassiveEffect(player) {
    const coach = gameState[player].coach;
    if (!coach || coach.type !== 'passive') return;
    
    switch(coach.passiveEffect) {
        case 'buff_defenders':
            // Wszyscy obrońcy (taunt) dostają +2 obrony
            gameState[player].field.forEach(card => {
                if (hasAbility(card, 'taunt')) {
                    card.defense += 2;
                }
            });
            break;
            
        case 'buff_attackers':
            // Wszyscy zawodnicy dostają +1 atak
            gameState[player].field.forEach(card => {
                card.attack += 1;
            });
            break;
    }
}

function getCardCost(player, card) {
    const coach = gameState[player].coach;
    let cost = card.cost;
    
    // Efekt "mana_discount" - wszystkie karty kosztują 1 manę mniej
    if (coach && coach.type === 'passive' && coach.passiveEffect === 'mana_discount') {
        cost = Math.max(1, cost - 1);
    }
    
    return cost;
}

function activateCoachAbility(player) {
    const coach = gameState[player].coach;
    
    if (!coach || coach.type !== 'active') {
        addLog("Trener nie ma aktywnej umiejetnosci!", 'play');
        return false;
    }
    
    // Sprawdzenie many
    if (gameState[player].mana < coach.cost) {
        addLog(`Nie masz wystarczajaco many! Potrzebujesz ${coach.cost} many.`, 'play');
        return false;
    }
    
    // Sprawdzenie cooldownu
    if (gameState[player].coachCooldown > 0) {
        addLog(`Umiejetnosc trenera niedostepna! Cooldown: ${gameState[player].coachCooldown} tur`, 'play');
        return false;
    }
    
    // Odejmowanie many
    gameState[player].mana -= coach.cost;
    
    // Ustawienie trybu wyboru celu (jeśli potrzebne)
    switch(coach.activeEffect) {
        case 'give_charge':
        case 'heal_minion':
        case 'buff_minion':
            // Tryb wyboru zawodnika
            gameState.coachTargetMode = {
                active: true,
                effect: coach.activeEffect,
                caster: player
            };
            addLog(`${coach.name}: Wybierz zawodnika!`, 'play');
            document.getElementById('spell-indicator').classList.add('active');
            updateUI();
            break;
            
        default:
            addLog(`Nieznany efekt trenera: ${coach.activeEffect}`, 'play');
    }
    
    // Ustawienie cooldownu
    if (coach.cooldown && coach.cooldown > 0) {
        gameState[player].coachCooldown = coach.cooldown;
    }
    
    return true;
}

function executeCoachEffect(player, targetIndex) {
    const coach = gameState[player].coach;
    const target = gameState[player].field[targetIndex];
    
    if (!target) {
        addLog("Nieprawidlowy cel!", 'play');
        return;
    }
    
    switch(coach.activeEffect) {
        case 'give_charge':
            target.canAttack = true;
            addLog(`${coach.name}: ${target.name} otrzymuje SZARZE!`, 'play');
            break;
            
        case 'heal_minion':
            target.defense += 3;
            addLog(`${coach.name}: ${target.name} odzyskuje 3 HP!`, 'play');
            break;
            
        case 'buff_minion':
            target.attack += 2;
            target.defense += 2;
            addLog(`${coach.name}: ${target.name} otrzymuje +2/+2!`, 'play');
            break;
            
        default:
            addLog(`Nieznany efekt: ${coach.activeEffect}`, 'play');
    }
}

// ============================================
// SPRAWDZANIE ZDOLNOŚCI
// ============================================

function hasAbility(card, abilityName) {
    return card.abilities && card.abilities.includes(abilityName);
}

function getAbilityDescription(card) {
    if (!card.abilities || card.abilities.length === 0) {
        return '';
    }
    
    const descriptions = {
        'taunt': 'OBRONCA: Blokuje ataki',
        'charge': 'SZARZA: Atakuje od razu',
        'lifesteal': 'WAMPIRYZM: Leczy bramkarza',
        'divine_shield': 'TARCZA: Ignoruje obrazenia',
        'battlecry_buff': 'MOTYWACJA: +1/+1 sojusznikom'
    };
    
    const abilityTexts = card.abilities.map(ability => descriptions[ability] || ability);
    return abilityTexts.join(' | ');
}

// ============================================
// AKTYWOWANE ZDOLNOŚCI
// ============================================

function activateAbility(player, fieldIndex, abilityId) {
    const card = gameState[player].field[fieldIndex];
    const ability = card.activatedAbilities?.find(a => a.id === abilityId);
    
    if (!ability) {
        addLog("Zdolnosc nie znaleziona!", 'play');
        return false;
    }
    
    // Sprawdzenie many
    if (gameState[player].mana < ability.cost) {
        addLog(`Nie masz wystarczajaco many! Potrzebujesz ${ability.cost} many.`, 'play');
        return false;
    }
    
    // Sprawdzenie cooldownu
    if (card.abilityCooldowns && card.abilityCooldowns[abilityId] > 0) {
        addLog(`Zdolnosc niedostepna! Cooldown: ${card.abilityCooldowns[abilityId]} tur`, 'play');
        return false;
    }
    
    // Odejmowanie many
    gameState[player].mana -= ability.cost;
    
    // Wykonanie efektu
    executeActivatedEffect(player, card, ability, fieldIndex);
    
    // Ustawienie cooldownu
    if (ability.cooldown && ability.cooldown > 0) {
        if (!card.abilityCooldowns) card.abilityCooldowns = {};
        card.abilityCooldowns[abilityId] = ability.cooldown;
    }
    
    addLog(`${card.name} uzywa: ${ability.name}!`, 'play');
    updateUI();
    return true;
}

function executeActivatedEffect(player, card, ability, fieldIndex) {
    const opponentPlayer = player === 'player' ? 'bot' : 'player';
    const effect = ability.effect;
    
    // Parsowanie efektów z parametrami (np. "damage_goalkeeper_2")
    if (effect.startsWith('damage_goalkeeper_')) {
        const damage = parseInt(effect.split('_')[2]);
        gameState[opponentPlayer].goalkeeperHP -= damage;
        if (gameState[opponentPlayer].goalkeeperHP < 0) {
            gameState[opponentPlayer].goalkeeperHP = 0;
        }
        addLog(`${card.name}: Bramkarz przeciwnika otrzymuje ${damage} obrazen!`, 'attack');
        
        if (gameState[opponentPlayer].goalkeeperHP <= 0) {
            addLog(`BRAMKA OTWARTA! Bramkarz pokonany!`, 'attack');
        }
        return;
    }
    
    switch(effect) {
        case 'heal_self':
            const healAmount = 2;
            card.defense += healAmount;
            addLog(`${card.name} leczy sie o ${healAmount} HP!`, 'play');
            break;
            
        case 'buff_self':
            card.attack += 1;
            card.defense += 1;
            addLog(`${card.name} otrzymuje +1/+1!`, 'play');
            break;
            
        case 'buff_adjacent':
            // Buff do sąsiednich kart
            if (fieldIndex > 0) {
                gameState[player].field[fieldIndex - 1].attack += 1;
                gameState[player].field[fieldIndex - 1].defense += 1;
            }
            if (fieldIndex < gameState[player].field.length - 1) {
                gameState[player].field[fieldIndex + 1].attack += 1;
                gameState[player].field[fieldIndex + 1].defense += 1;
            }
            addLog(`${card.name} wspiera sasiadow! +1/+1`, 'play');
            break;
            
        case 'draw_card':
            drawCard(player);
            addLog(`${card.name} pozwala dobrac karte!`, 'play');
            break;
            
        default:
            addLog(`Nieznany efekt: ${effect}`, 'play');
    }
}

// ============================================
// EFEKTY SPELL (KART AKCJI)
// ============================================

function executeSpellEffect(player, effect) {
    const opponentPlayer = player === 'player' ? 'bot' : 'player';
    
    switch(effect) {
        case 'destroy_enemy_minion':
            // Gracz wybiera kartę przeciwnika do zniszczenia
            if (gameState[opponentPlayer].field.length > 0) {
                gameState.spellMode = {
                    active: true,
                    effect: 'destroy_enemy_minion',
                    caster: player
                };
                addLog("Wybierz karte przeciwnika do zniszczenia", 'play');
                document.getElementById('spell-indicator').classList.add('active');
                updateUI();
            } else {
                addLog("Przeciwnik nie ma kart na boisku!", 'play');
            }
            break;
            
        case 'buff_all_friendly':
            // +1/+1 do wszystkich sojuszników
            gameState[player].field.forEach(card => {
                card.attack += 1;
                card.defense += 1;
            });
            addLog("Wszystkie twoje karty otrzymuja +1/+1!", 'play');
            updateUI();
            break;
            
        case 'damage_enemy_goalkeeper':
            // Zadaj obrażenia bramkarzowi przeciwnika
            const damage = 3;
            gameState[opponentPlayer].goalkeeperHP -= damage;
            if (gameState[opponentPlayer].goalkeeperHP < 0) {
                gameState[opponentPlayer].goalkeeperHP = 0;
            }
            addLog(`Bramkarz przeciwnika otrzymuje ${damage} obrazen!`, 'attack');
            updateUI();
            break;
            
        case 'heal_goalkeeper':
            // Wylecz swojego bramkarza
            const heal = 5;
            gameState[player].goalkeeperHP += heal;
            if (gameState[player].goalkeeperHP > 10) {
                gameState[player].goalkeeperHP = 10;
            }
            addLog(`Twoj bramkarz odzyskuje ${heal} HP!`, 'play');
            updateUI();
            break;
            
        default:
            addLog(`Nieznany efekt: ${effect}`, 'play');
    }
}

// ============================================
// BATTLECRY (EFEKT PRZY ZAGRANIU)
// ============================================

function triggerBattlecry(player, card) {
    if (hasAbility(card, 'battlecry_buff')) {
        // +1/+1 do wszystkich innych sojuszników
        gameState[player].field.forEach(minion => {
            if (minion.id !== card.id) {
                minion.attack += 1;
                minion.defense += 1;
            }
        });
        addLog(`${card.name} daje +1/+1 wszystkim sojusznikom!`, 'play');
    }
}
