// ============================================
// DEFINICJE KART I FRAKCJI
// ============================================

/* 
 * JAK DODAWAĆ KARTY:
 * 
 * 1. TYPY KART:
 *    - type: "minion"  - Zawodnik (trafia na boisko)
 *    - type: "spell"   - Akcja/Taktyka (efekt i znika)
 * 
 * 2. KARTY NEUTRALNE (neutralCards) - dostępne dla WSZYSTKICH drużyn
 * 3. KARTY FRAKCJI (faction1Cards / faction2Cards) - unikalne dla drużyny
 * 
 * FORMAT KARTY ZAWODNIKA (MINION):
 * { 
 *   type: "minion",
 *   name: "Nazwa Karty",
 *   position: "ST",
 *   cost: 3,
 *   attack: 4,
 *   defense: 2,
 *   emoji: "⚡",
 *   abilities: [],
 *   activatedAbilities: []
 * }
 * 
 * FORMAT KARTY AKCJI (SPELL):
 * {
 *   type: "spell",
 *   name: "Faul Taktyczny",
 *   cost: 2,
 *   emoji: "🟨",
 *   effect: "destroy_enemy_minion",
 *   description: "Zniszcz karte przeciwnika"
 * }
 * 
 * ZDOLNOŚCI PASYWNE (abilities):
 * - "taunt"           - Blokuje atak na bramkarza
 * - "charge"          - Może atakować od razu po zagraniu
 * - "lifesteal"       - Leczy bramkarza o wartość zadanych obrażeń
 * - "divine_shield"   - Ignoruje pierwsze otrzymane obrażenia
 * - "battlecry_buff"  - +1 atak/obrona wszystkim sojusznikom przy zagraniu
 * 
 * ZDOLNOŚCI AKTYWNE (activatedAbilities):
 * {
 *   id: "long_shot",
 *   name: "Strzał z dystansu",
 *   cost: 1,
 *   emoji: "🎯",
 *   effect: "damage_goalkeeper_2",
 *   description: "Zadaj 2 DMG bramkarzowi",
 *   cooldown: 0
 * }
 * 
 * DOSTĘPNE EFEKTY AKTYWOWANYCH ZDOLNOŚCI:
 * - "damage_goalkeeper_X"  - Zadaj X obrażeń bramkarzowi
 * - "heal_self"            - Wylecz tę kartę
 * - "buff_self"            - +1/+1 do tej karty
 * - "buff_adjacent"        - +1/+1 do sąsiednich kart
 * - "draw_card"            - Dobierz kartę
 */

// ============================================
// KARTY NEUTRALNE
// ============================================

const neutralCards = [
    { type: "minion", name: "Mlody Talent", position: "ST", cost: 1, attack: 2, defense: 1, emoji: "⭐", abilities: [] },
    { type: "minion", name: "Skrzydlowy", position: "W", cost: 2, attack: 3, defense: 2, emoji: "🏃", abilities: [] },
    { type: "minion", name: "Napastnik", position: "ST", cost: 3, attack: 4, defense: 2, emoji: "⚡", abilities: [] },
    { type: "minion", name: "Obronca", position: "CB", cost: 3, attack: 2, defense: 5, emoji: "🛡️", abilities: ["taunt"] },
    { type: "minion", name: "Pomocnik", position: "CM", cost: 4, attack: 3, defense: 4, emoji: "🎯", abilities: [] },
    { type: "minion", name: "Defensywny Pomocnik", position: "CDM", cost: 4, attack: 2, defense: 6, emoji: "⚔️", abilities: [] },
    { type: "minion", name: "Gwiazda", position: "ST", cost: 6, attack: 6, defense: 4, emoji: "👑", abilities: [] },
    { type: "minion", name: "Snajper", position: "ST", cost: 4, attack: 3, defense: 3, emoji: "🎯", 
      abilities: [], 
      activatedAbilities: [{
        id: "long_shot", 
        name: "Strzal z dystansu", 
        cost: 1, 
        emoji: "⚽",
        effect: "damage_goalkeeper_2", 
        description: "2 DMG do bramkarza",
        cooldown: 0
      }]
    },
];

// ============================================
// KARTY FRAKCJI 1
// ============================================

const faction1Cards = [
    // ZAWODNICY
    { type: "minion", name: "Błyskawiczny Napastnik", position: "ST", cost: 4, attack: 4, defense: 2, emoji: "💨", abilities: ["charge"] },
    { type: "minion", name: "Żelazny Obrońca", position: "CB", cost: 5, attack: 3, defense: 7, emoji: "🏰", abilities: ["taunt"] },
    { type: "minion", name: "Playmaker", position: "CAM", cost: 6, attack: 5, defense: 5, emoji: "🎩", abilities: ["battlecry_buff"] },
    
    // ZAKLĘCIA
    { type: "spell", name: "Faul Taktyczny", cost: 2, emoji: "🟨", effect: "destroy_enemy_minion", description: "Zniszcz karte przeciwnika" },
    { type: "spell", name: "Rzut Karny", cost: 4, emoji: "⚽", effect: "damage_enemy_goalkeeper", description: "Zadaj 3 DMG bramkarzowi" },
    { type: "spell", name: "Trening Drużyny", cost: 3, emoji: "📊", effect: "buff_all_friendly", description: "+1/+1 do wszystkich" },
    { type: "spell", name: "Przerwa na Wodę", cost: 2, emoji: "💧", effect: "heal_goalkeeper", description: "Wylecz bramkarza o 5 HP" },
    { type: "spell", name: "Czerwona Kartka", cost: 5, emoji: "🟥", effect: "destroy_enemy_minion", description: "Zniszcz karte przeciwnika" },
];

// ============================================
// KARTY FRAKCJI 2
// ============================================

const faction2Cards = [
    // ZAWODNICY
    { type: "minion", name: "Inspirujący Kapitan", position: "CM", cost: 5, attack: 3, defense: 4, emoji: "💪", abilities: ["battlecry_buff"] },
    { type: "minion", name: "Wampir Boiskowy", position: "ST", cost: 5, attack: 5, defense: 3, emoji: "🧛", abilities: ["lifesteal"] },
    { type: "minion", name: "Twardziel", position: "CB", cost: 4, attack: 2, defense: 6, emoji: "🗿", abilities: ["taunt", "divine_shield"] },
    
    // ZAKLĘCIA
    { type: "spell", name: "Motywacja", cost: 3, emoji: "📣", effect: "buff_all_friendly", description: "+1/+1 do wszystkich zawodnikow" },
    { type: "spell", name: "Strzał z Dystansu", cost: 3, emoji: "🎯", effect: "damage_enemy_goalkeeper", description: "Zadaj 3 DMG bramkarzowi" },
    { type: "spell", name: "Interwencja Sędziego", cost: 4, emoji: "👨‍⚖️", effect: "destroy_enemy_minion", description: "Zniszcz karte przeciwnika" },
    { type: "spell", name: "Medyczna Pomoc", cost: 3, emoji: "🏥", effect: "heal_goalkeeper", description: "Wylecz bramkarza o 5 HP" },
    { type: "spell", name: "Doping Kibiców", cost: 4, emoji: "📢", effect: "buff_all_friendly", description: "+1/+1 do wszystkich zawodnikow" },
];

// ============================================
// DEFINICJE TRENERÓW
// ============================================

/*
 * TRENERZY - wybierani przed meczem, stale obecni
 * 
 * FORMAT TRENERA:
 * {
 *   id: "wojno",
 *   name: "Wojno",
 *   emoji: "👔",
 *   type: "passive",              // "passive" lub "active"
 *   
 *   // Dla pasywnych:
 *   passiveEffect: "buff_defenders",
 *   description: "Obroncy maja +2 obrony",
 *   
 *   // Dla aktywnych:
 *   cost: 2,
 *   activeEffect: "give_charge",
 *   description: "Daj zawodnikowi szarze",
 *   cooldown: 0
 * }
 * 
 * DOSTĘPNE EFEKTY PASYWNE:
 * - "buff_defenders" - Wszyscy obrońcy (taunt) mają +2 obrony
 * - "buff_attackers" - Wszyscy napastnicy mają +1 atak
 * - "mana_discount" - Wszystkie karty kosztują 1 manę mniej (min 1)
 * 
 * DOSTĘPNE EFEKTY AKTYWNE:
 * - "give_charge" - Daj wybranej karcie szarżę
 * - "heal_minion" - Wylecz wybraną kartę o 3 HP
 * - "buff_minion" - Daj wybranej karcie +2/+2
 */

const coaches = [
    {
        id: "wojno",
        name: "WOJNO",
        emoji: "🛡️",
        type: "passive",
        passiveEffect: "buff_defenders",
        description: "Obroncy maja +2 obrony"
    },
    {
        id: "kasperczak",
        name: "KASPERCZAK",
        emoji: "⚡",
        type: "active",
        cost: 2,
        activeEffect: "give_charge",
        description: "Daj zawodnikowi szarze",
        cooldown: 0
    },
    {
        id: "smith",
        name: "SMITH",
        emoji: "💪",
        type: "passive",
        passiveEffect: "buff_attackers",
        description: "+1 atak dla wszystkich"
    },
    {
        id: "medyk",
        name: "DR. MEDYK",
        emoji: "🏥",
        type: "active",
        cost: 3,
        activeEffect: "heal_minion",
        description: "Wylecz zawodnika o 3 HP",
        cooldown: 0
    }
];

// ============================================
// DEFINICJE FRAKCJI
// ============================================

const factions = {
    faction1: {
        id: 'faction1',
        name: 'Druzyna A',
        emoji: '🔵',
        color: '#0000ff',
        cards: faction1Cards,
        description: 'Opis druzyny A'
    },
    faction2: {
        id: 'faction2',
        name: 'Druzyna B',
        emoji: '🔴',
        color: '#ff0000',
        cards: faction2Cards,
        description: 'Opis druzyny B'
    }
};

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

function createDeck(factionId) {
    const deck = [];
    const faction = factions[factionId];
    
    // Łączenie kart neutralnych + kart frakcji
    const allCards = [...neutralCards, ...faction.cards];
    
    // Każda karta x3 w talii
    allCards.forEach(card => {
        for (let i = 0; i < 3; i++) {
            deck.push({ ...card, id: Math.random() });
        }
    });
    
    // Tasowanie
    return deck.sort(() => Math.random() - 0.5);
}
