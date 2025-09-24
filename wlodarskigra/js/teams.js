// teams.js - definicje drużyn i przeciwników
const teams = [
    {
        number: 1,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "VFL OLDENBURG",
        field: "grass",
        fieldScale: 1.0,
        bots: [
            { name: "HANS JURGEN", x: 700, y: 200, color: "#0000ff", maxSpeed: 3.75, aggressiveness: 0.7, canCrossHalf: false, number: 7, role: "defender", preferredY: 200 }
        ]
    },
    {
        number: 2, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SV WALDORF MANNHEIM",
        field: "muddy",
        fieldScale: 1.0,
        bots: [
            { name: "KLAUS SCHMIDT", x: 700, y: 200, color: "#800080", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 9, role: "ball_chaser", preferredY: 200 }
        ]
    },
    {
        number: 3,
        playerTeam: "SV BABELSBERG 04", 
        opponentTeam: "FC HANSA ROSTOCK",
        field: "winter",
        fieldScale: 1.0,
        bots: [
            { name: "WERNER MÜLLER", x: 650, y: 150, color: "#006600", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 8, role: "attacker", preferredY: 150 },
            { name: "FRITZ WAGNER", x: 650, y: 250, color: "#006600", maxSpeed: 3.75, aggressiveness: 0.7, canCrossHalf: false, number: 11, role: "defender", preferredY: 250 }
        ]
    },
    {
        number: 4,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "EINTRACHT BRAUNSCHWEIG", 
        field: "professional",
        fieldScale: 1.0,
        bots: [
            { name: "GÜNTER HOFFMAN", x: 600, y: 120, color: "#ff6600", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: true, number: 6, role: "attacker", preferredY: 120 },
            { name: "DIETER KLEIN", x: 650, y: 200, color: "#ff6600", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: false, number: 4, role: "midfielder", preferredY: 200 },
            { name: "STEFAN BRAUN", x: 600, y: 280, color: "#ff6600", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: false, number: 3, role: "defender", preferredY: 280 }
        ]
    },
    {
        number: 5,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "LOKOMOTIV LEIPZIG",
        field: "stadium", 
        fieldScale: 1.0,
        bots: [
            { name: "WOLFGANG RICHTER", x: 600, y: 100, color: "#990000", maxSpeed: 6, aggressiveness: 1.0, canCrossHalf: true, number: 5, role: "attacker", preferredY: 100 },
            { name: "HERMANN FISCHER", x: 650, y: 200, color: "#990000", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: false, number: 2, role: "midfielder", preferredY: 200 },
            { name: "RUDOLF BECKER", x: 600, y: 300, color: "#990000", maxSpeed: 6, aggressiveness: 1.0, canCrossHalf: false, number: 1, role: "defender", preferredY: 300 },
            { name: "OTTO SCHULZ", x: 750, y: 200, color: "#660000", maxSpeed: 2.25, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 12, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        number: 6,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC CARL ZEISS JENA",
        field: "sandy",
        fieldScale: 0.75, // Wszystko pomniejszone o 25% = efekt 4x większego boiska
        bots: [
            { name: "BERND KOCH", x: 650, y: 130, color: "#0066ff", maxSpeed: 3.0, aggressiveness: 0.5, canCrossHalf: false, number: 14, role: "defender", preferredY: 130 },
            { name: "UWE KRAUSE", x: 680, y: 200, color: "#0066ff", maxSpeed: 2.8, aggressiveness: 0.4, canCrossHalf: false, number: 8, role: "midfielder", preferredY: 200 },
            { name: "THOMAS WEBER", x: 650, y: 270, color: "#0066ff", maxSpeed: 3.2, aggressiveness: 0.6, canCrossHalf: true, number: 9, role: "attacker", preferredY: 270 }
        ]
    },
{
    number: 7,
    playerTeam: "SV BABELSBERG 04",
    opponentTeam: "SPVGG UNTERHACHING",
    field: "professional",
    fieldScale: 0.25,
    hasPlayerGoalkeeper: true,
    bots: [
        // DRUŻYNA PRZECIWNIKA (11 zawodników)
        // Bramkarz
        { name: "JOSEF KAHN", x: 750, y: 200, color: "#660033", maxSpeed: 1.8, number: 1, role: "goalkeeper", isGoalkeeper: true, preferredY: 200 },
        
        // Obrona (4 zawodników)
        { name: "KLAUS WEBER", x: 700, y: 120, color: "#800040", maxSpeed: 3.8, number: 2, role: "fullback", preferredY: 120 },
        { name: "WERNER BRAUN", x: 720, y: 160, color: "#800040", maxSpeed: 3.5, number: 3, role: "centerback", preferredY: 160 },
        { name: "FRITZ MANN", x: 720, y: 240, color: "#800040", maxSpeed: 3.5, number: 4, role: "centerback", preferredY: 240 },
        { name: "GUSTAV KLEIN", x: 700, y: 280, color: "#800040", maxSpeed: 3.8, number: 5, role: "fullback", preferredY: 280 },
        
        // Pomocnicy (4 zawodników)  
        { name: "OTTO SCHULZ", x: 650, y: 140, color: "#800040", maxSpeed: 4.0, number: 6, role: "defensive_midfielder", preferredY: 140 },
        { name: "ERNST KOCH", x: 650, y: 260, color: "#800040", maxSpeed: 4.0, number: 8, role: "defensive_midfielder", preferredY: 260 },
        { name: "HEINRICH FUCHS", x: 580, y: 120, color: "#800040", maxSpeed: 4.5, number: 7, role: "winger", preferredY: 120 },
        { name: "LUDWIG RICHTER", x: 580, y: 280, color: "#800040", maxSpeed: 4.5, number: 11, role: "winger", preferredY: 280 },
        
        // Napastnicy (2 zawodników)
        { name: "RALF MULLER", x: 520, y: 170, color: "#800040", maxSpeed: 4.8, number: 9, role: "striker", preferredY: 170 },
        { name: "KARL BECKER", x: 520, y: 230, color: "#800040", maxSpeed: 4.8, number: 10, role: "striker", preferredY: 230 },

        // DRUŻYNA GRACZA (9 zawodników z pola + Włodarski + bramkarz)
        // Obrona (4 zawodników)
        { name: "STEFAN NOWAK", x: 100, y: 120, color: "#ff0000", maxSpeed: 3.8, number: 2, role: "fullback", preferredY: 120 },
        { name: "MAREK KOWALSKI", x: 120, y: 160, color: "#ff0000", maxSpeed: 3.5, number: 3, role: "centerback", preferredY: 160 },
        { name: "TOMASZ WIŚNIEWSKI", x: 120, y: 240, color: "#ff0000", maxSpeed: 3.5, number: 4, role: "centerback", preferredY: 240 },
        { name: "PAWEŁ JANKOWSKI", x: 100, y: 280, color: "#ff0000", maxSpeed: 3.8, number: 5, role: "fullback", preferredY: 280 },
        
        // Pomocnicy (3 zawodników)
        { name: "JACEK ZIELIŃSKI", x: 150, y: 140, color: "#ff0000", maxSpeed: 4.0, number: 6, role: "defensive_midfielder", preferredY: 140 },
        { name: "ANDRZEJ SZYMAŃSKI", x: 150, y: 260, color: "#ff0000", maxSpeed: 4.0, number: 8, role: "defensive_midfielder", preferredY: 260 },
        { name: "MICHAŁ DĄBROWSKI", x: 200, y: 200, color: "#ff0000", maxSpeed: 4.3, number: 11, role: "attacking_midfielder", preferredY: 200 },
        
        // Skrzydłowi (2 zawodników)
        { name: "GRZEGORZ LEWANDOWSKI", x: 220, y: 120, color: "#ff0000", maxSpeed: 4.5, number: 7, role: "winger", preferredY: 120 },
        { name: "ROBERT WÓJCIK", x: 220, y: 280, color: "#ff0000", maxSpeed: 4.5, number: 9, role: "winger", preferredY: 280 }
    ],
    playerGoalkeeper: { name: "PETER NOWAK", x: 50, y: 200, color: "#cc0000", maxSpeed: 2.0, number: 1, role: "goalkeeper" }
}
];
