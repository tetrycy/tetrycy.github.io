// teams.js - definicje drużyn i przeciwników z nowym systemem pozycjonowania
const teams = [
    // DRUŻYNA TESTOWA - runda 0 do testowania formacji
    {
        number: 0,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "TEST FORMATION FC",
        field: "professional",
        fieldScale: 0.5,
        bots: [
            { name: "STRIKER RED", x: 550, y: 120, color: "#ff4444", maxSpeed: 4.8, aggressiveness: 0.9, canCrossHalf: true, number: 9, role: "fullback", },

        ]
    },
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
        fieldScale: 0.75,
        bots: [
            { name: "KLAUS SCHMIDT", x: 650, y: 200, color: "#800080", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 9, role: "attacker", preferredY: 200 },
            { name: "HERMANN BACK", x: 720, y: 200, color: "#600060", maxSpeed: 3.2, aggressiveness: 0.6, canCrossHalf: false, number: 3, role: "defender", preferredY: 200 }
        ]
    },
    {
        number: 3,
        playerTeam: "SV BABELSBERG 04", 
        opponentTeam: "FC HANSA ROSTOCK",
        field: "winter",
        fieldScale: 1.0,
        bots: [
            { name: "WERNER MÜLLER", x: 580, y: 150, color: "#006600", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 8, role: "attacker", preferredY: 150 },
            { name: "HANS MIDDLE", x: 650, y: 200, color: "#008800", maxSpeed: 4.0, aggressiveness: 0.7, canCrossHalf: true, number: 6, role: "midfielder", preferredY: 200 },
            { name: "FRITZ WAGNER", x: 720, y: 250, color: "#004400", maxSpeed: 3.75, aggressiveness: 0.7, canCrossHalf: false, number: 11, role: "defender", preferredY: 250 }
        ]
    },
    {
        number: 4,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "EINTRACHT BRAUNSCHWEIG", 
        field: "professional",
        fieldScale: 1.0,
        bots: [
            { name: "GÜNTER HOFFMAN", x: 580, y: 120, color: "#ff6600", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: true, number: 6, role: "attacker", preferredY: 120 },
            { name: "DIETER KLEIN", x: 650, y: 200, color: "#dd5500", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 4, role: "midfielder", preferredY: 200 },
            { name: "STEFAN BRAUN", x: 720, y: 280, color: "#bb4400", maxSpeed: 4.0, aggressiveness: 0.6, canCrossHalf: false, number: 3, role: "defender", preferredY: 280 },
            { name: "KEEPER ORANGE", x: 750, y: 200, color: "#883300", maxSpeed: 2.5, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        number: 5,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "LOKOMOTIV LEIPZIG",
        field: "stadium", 
        fieldScale: 1.0,
        bots: [
            { name: "WOLFGANG RICHTER", x: 550, y: 100, color: "#990000", maxSpeed: 6.0, aggressiveness: 1.0, canCrossHalf: true, number: 5, role: "attacker", preferredY: 100 },
            { name: "KARL STRIKER", x: 550, y: 300, color: "#990000", maxSpeed: 6.0, aggressiveness: 1.0, canCrossHalf: true, number: 7, role: "attacker", preferredY: 300 },
            { name: "HERMANN FISCHER", x: 650, y: 170, color: "#770000", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: true, number: 2, role: "midfielder", preferredY: 170 },
            { name: "GUSTAV MIDDLE", x: 650, y: 230, color: "#770000", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: false, number: 8, role: "midfielder", preferredY: 230 },
            { name: "RUDOLF BECKER", x: 720, y: 200, color: "#550000", maxSpeed: 4.5, aggressiveness: 0.7, canCrossHalf: false, number: 1, role: "defender", preferredY: 200 },
            { name: "OTTO SCHULZ", x: 750, y: 200, color: "#330000", maxSpeed: 2.8, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 12, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        number: 6,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC CARL ZEISS JENA",
        field: "sandy",
        fieldScale: 0.75,
        bots: [
            { name: "THOMAS WEBER", x: 600, y: 120, color: "#0066ff", maxSpeed: 3.2, aggressiveness: 0.6, canCrossHalf: true, number: 9, role: "attacker", preferredY: 120 },
            { name: "UWE KRAUSE", x: 650, y: 200, color: "#0055dd", maxSpeed: 2.8, aggressiveness: 0.4, canCrossHalf: true, number: 8, role: "midfielder", preferredY: 200 },
            { name: "BERND KOCH", x: 700, y: 170, color: "#0044bb", maxSpeed: 3.0, aggressiveness: 0.5, canCrossHalf: false, number: 14, role: "defender", preferredY: 170 },
            { name: "WERNER BACK", x: 700, y: 230, color: "#0044bb", maxSpeed: 3.0, aggressiveness: 0.5, canCrossHalf: false, number: 4, role: "defender", preferredY: 230 },
            { name: "KEEPER BLUE", x: 750, y: 200, color: "#002288", maxSpeed: 2.0, aggressiveness: 0.3, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ]
    },
    {
        number: 7,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SPVGG UNTERHACHING",
        field: "asphalt",
        fieldScale: 0.75,
        hasPlayerGoalkeeper: true, // Włodarski ma bramkarza!
        bots: [
            { name: "RALF MULLER", x: 580, y: 200, color: "#800040", maxSpeed: 2.5, aggressiveness: 0.3, canCrossHalf: true, number: 10, role: "attacker", preferredY: 200 },
            { name: "GUSTAV SLOW", x: 650, y: 180, color: "#600030", maxSpeed: 2.2, aggressiveness: 0.25, canCrossHalf: false, number: 6, role: "midfielder", preferredY: 180 },
            { name: "WERNER SLOW", x: 650, y: 220, color: "#600030", maxSpeed: 2.2, aggressiveness: 0.25, canCrossHalf: false, number: 8, role: "midfielder", preferredY: 220 },
            { name: "HERMANN WALL", x: 720, y: 200, color: "#400020", maxSpeed: 2.0, aggressiveness: 0.2, canCrossHalf: false, number: 4, role: "defender", preferredY: 200 },
            { name: "JOSEF KAHN", x: 750, y: 200, color: "#200010", maxSpeed: 1.8, aggressiveness: 0.2, isGoalkeeper: true, canCrossHalf: false, number: 1, role: "goalkeeper", preferredY: 200 }
        ],
        playerGoalkeeper: { name: "PETER NOWAK", x: 50, y: 200, color: "#cc0000", maxSpeed: 2.0, aggressiveness: 0.3, number: 1, role: "goalkeeper" }
    }
];
