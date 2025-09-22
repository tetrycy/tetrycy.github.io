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
            { name: "KLAUS SCHMIDT", x: 700, y: 200, color: "#800080", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 9, role: "attacker", preferredY: 200 }
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
        field: "asphalt",
        fieldScale: 0.75, // Duże boisko jak Carl Zeiss
        hasPlayerGoalkeeper: true, // Włodarski ma bramkarza!
        bots: [
            { name: "RALF MULLER", x: 500, y: 200, color: "#800040", maxSpeed: 2.5, aggressiveness: 0.3, canCrossHalf: true, number: 10, role: "attacker", preferredY: 200 },
            { name: "JOSEF KAHN", x: 750, y: 200, color: "#660033", maxSpeed: 1.8, aggressiveness: 0.2, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ],
        playerGoalkeeper: { name: "PETER NOWAK", x: 50, y: 200, color: "#cc0000", maxSpeed: 2.0, aggressiveness: 0.3, number: 1, role: "goalkeeper" }
    }
];

// Nowe drużyny dla trybu 1vs1 (małe boisko)
const oneVsOneTeams = [
    {
        playerTeam: "MARIAN WŁODARSKI",
        opponentTeam: "GÜNTER NETZER", 
        field: "grass",
        fieldScale: 0.8, // Małe boisko
        bots: [
            { name: "GÜNTER NETZER", x: 650, y: 200, color: "#0066ff", maxSpeed: 4.0, aggressiveness: 0.8, canCrossHalf: true, number: 10, role: "attacker", preferredY: 200 }
        ]
    },
    {
        playerTeam: "MARIAN WŁODARSKI", 
        opponentTeam: "FRANZ BECKENBAUER",
        field: "professional",
        fieldScale: 0.8,
        bots: [
            { name: "FRANZ BECKENBAUER", x: 650, y: 200, color: "#ff6600", maxSpeed: 4.5, aggressiveness: 0.9, canCrossHalf: true, number: 5, role: "attacker", preferredY: 200 }
        ]
    },
    {
        playerTeam: "MARIAN WŁODARSKI",
        opponentTeam: "GERD MÜLLER", 
        field: "stadium",
        fieldScale: 0.8,
        bots: [
            { name: "GERD MÜLLER", x: 650, y: 200, color: "#990000", maxSpeed: 5.0, aggressiveness: 1.0, canCrossHalf: true, number: 13, role: "attacker", preferredY: 200 }
        ]
    }
];

// Nowe drużyny dla Zweite Bundesliga (duże boisko, więcej graczy)
const bundesligaTeams = [
    {
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "ENERGIE COTTBUS",
        field: "professional", 
        fieldScale: 0.7, // Duże boisko
        bots: [
            { name: "MICHAEL TARNAT", x: 600, y: 100, color: "#ffaa00", maxSpeed: 4.8, aggressiveness: 0.9, canCrossHalf: true, number: 7, role: "attacker", preferredY: 100 },
            { name: "ANDREAS BECK", x: 650, y: 200, color: "#ffaa00", maxSpeed: 4.2, aggressiveness: 0.7, canCrossHalf: false, number: 6, role: "midfielder", preferredY: 200 },
            { name: "MARCO REICH", x: 600, y: 300, color: "#ffaa00", maxSpeed: 4.0, aggressiveness: 0.8, canCrossHalf: false, number: 4, role: "defender", preferredY: 300 },
            { name: "SILVIO SCHRÖTER", x: 700, y: 150, color: "#ffaa00", maxSpeed: 3.8, aggressiveness: 0.6, canCrossHalf: true, number: 11, role: "midfielder", preferredY: 150 },
            { name: "RENÉ MÜLLER", x: 750, y: 200, color: "#cc8800", maxSpeed: 2.5, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "DYNAMO DRESDEN",
        field: "stadium",
        fieldScale: 0.7,
        bots: [
            { name: "UWE RÖSLER", x: 600, y: 120, color: "#ffff00", maxSpeed: 5.2, aggressiveness: 1.0, canCrossHalf: true, number: 9, role: "attacker", preferredY: 120 },
            { name: "MATTHIAS SAMMER", x: 650, y: 200, color: "#ffff00", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: false, number: 6, role: "midfielder", preferredY: 200 },
            { name: "TORSTEN GÜTSCHOW", x: 600, y: 280, color: "#ffff00", maxSpeed: 4.8, aggressiveness: 0.9, canCrossHalf: true, number: 10, role: "attacker", preferredY: 280 },
            { name: "RENÉ BEUCHEL", x: 700, y: 160, color: "#ffff00", maxSpeed: 4.0, aggressiveness: 0.7, canCrossHalf: false, number: 8, role: "defender", preferredY: 160 },
            { name: "LUTZ LINDEMANN", x: 750, y: 200, color: "#cccc00", maxSpeed: 2.8, aggressiveness: 0.5, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC ST. PAULI",
        field: "muddy",
        fieldScale: 0.7,
        bots: [
            { name: "IVAN KLASNIĆ", x: 600, y: 130, color: "#8B4513", maxSpeed: 4.6, aggressiveness: 0.8, canCrossHalf: true, number: 9, role: "attacker", preferredY: 130 },
            { name: "HOLGER STANISLAWSKI", x: 650, y: 200, color: "#8B4513", maxSpeed: 4.0, aggressiveness: 0.7, canCrossHalf: false, number: 8, role: "midfielder", preferredY: 200 },
            { name: "ANDRÉ TRULSEN", x: 600, y: 270, color: "#8B4513", maxSpeed: 3.8, aggressiveness: 0.6, canCrossHalf: false, number: 4, role: "defender", preferredY: 270 },
            { name: "MATHIAS ABEL", x: 750, y: 200, color: "#654321", maxSpeed: 2.6, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    }
];

// Nowe drużyny dla trybu 1vs1 (małe boisko)
const oneVsOneTeams = [
    {
        playerTeam: "MARIAN WŁODARSKI",
        opponentTeam: "GÜNTER NETZER", 
        field: "grass",
        fieldScale: 0.8, // Małe boisko
        bots: [
            { name: "GÜNTER NETZER", x: 650, y: 200, color: "#0066ff", maxSpeed: 4.0, aggressiveness: 0.8, canCrossHalf: true, number: 10, role: "attacker", preferredY: 200 }
        ]
    },
    {
        playerTeam: "MARIAN WŁODARSKI", 
        opponentTeam: "FRANZ BECKENBAUER",
        field: "professional",
        fieldScale: 0.8,
        bots: [
            { name: "FRANZ BECKENBAUER", x: 650, y: 200, color: "#ff6600", maxSpeed: 4.5, aggressiveness: 0.9, canCrossHalf: true, number: 5, role: "attacker", preferredY: 200 }
        ]
    },
    {
        playerTeam: "MARIAN WŁODARSKI",
        opponentTeam: "GERD MÜLLER", 
        field: "stadium",
        fieldScale: 0.8,
        bots: [
            { name: "GERD MÜLLER", x: 650, y: 200, color: "#990000", maxSpeed: 5.0, aggressiveness: 1.0, canCrossHalf: true, number: 13, role: "attacker", preferredY: 200 }
        ]
    }
];

// Nowe drużyny dla Zweite Bundesliga (duże boisko, więcej graczy)
const bundesligaTeams = [
    {
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "ENERGIE COTTBUS",
        field: "professional", 
        fieldScale: 0.7, // Duże boisko
        bots: [
            { name: "MICHAEL TARNAT", x: 600, y: 100, color: "#ffaa00", maxSpeed: 4.8, aggressiveness: 0.9, canCrossHalf: true, number: 7, role: "attacker", preferredY: 100 },
            { name: "ANDREAS BECK", x: 650, y: 200, color: "#ffaa00", maxSpeed: 4.2, aggressiveness: 0.7, canCrossHalf: false, number: 6, role: "midfielder", preferredY: 200 },
            { name: "MARCO REICH", x: 600, y: 300, color: "#ffaa00", maxSpeed: 4.0, aggressiveness: 0.8, canCrossHalf: false, number: 4, role: "defender", preferredY: 300 },
            { name: "SILVIO SCHRÖTER", x: 700, y: 150, color: "#ffaa00", maxSpeed: 3.8, aggressiveness: 0.6, canCrossHalf: true, number: 11, role: "midfielder", preferredY: 150 },
            { name: "RENÉ MÜLLER", x: 750, y: 200, color: "#cc8800", maxSpeed: 2.5, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "DYNAMO DRESDEN",
        field: "stadium",
        fieldScale: 0.7,
        bots: [
            { name: "UWE RÖSLER", x: 600, y: 120, color: "#ffff00", maxSpeed: 5.2, aggressiveness: 1.0, canCrossHalf: true, number: 9, role: "attacker", preferredY: 120 },
            { name: "MATTHIAS SAMMER", x: 650, y: 200, color: "#ffff00", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: false, number: 6, role: "midfielder", preferredY: 200 },
            { name: "TORSTEN GÜTSCHOW", x: 600, y: 280, color: "#ffff00", maxSpeed: 4.8, aggressiveness: 0.9, canCrossHalf: true, number: 10, role: "attacker", preferredY: 280 },
            { name: "RENÉ BEUCHEL", x: 700, y: 160, color: "#ffff00", maxSpeed: 4.0, aggressiveness: 0.7, canCrossHalf: false, number: 8, role: "defender", preferredY: 160 },
            { name: "LUTZ LINDEMANN", x: 750, y: 200, color: "#cccc00", maxSpeed: 2.8, aggressiveness: 0.5, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    }
];
