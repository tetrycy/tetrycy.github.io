const teams = [
    {
        number: 1,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "MSV DUISBURG",
        field: 'stadium',
        fieldScale: 1.0,
        bots: [
            { name: "HAJTO", x: 700, y: 200, color: "#0000ff", maxSpeed: 3.75, aggressiveness: 0.7, canCrossHalf: false, number: 7, role: "defender", preferredY: 200, team: "opponent" }
        ]
    },
    {
        number: 2, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SV WALDHOF MANNHEIM",
        field: "muddy",
        fieldScale: 1.0,
        bots: [
            { name: "KOBYLANSKI", x: 700, y: 200, color: "#800080", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: true, number: 9, role: "ball_chaser", preferredY: 200, team: "opponent" }
        ]
    },
    {
        number: 3,
        playerTeam: "SV BABELSBERG 04", 
        opponentTeam: "FC HANSA ROSTOCK",
        field: "winter",
        fieldScale: 0.75,
        bots: [
            { name: "MAJAK", x: 650, y: 150, color: "#006600", maxSpeed: 3.5, aggressiveness: 0.8, canCrossHalf: true, number: 8, role: "attacker", preferredY: 150, team: "opponent" },
            { name: "LANGE", x: 650, y: 250, color: "#006600", maxSpeed: 2.75, aggressiveness: 0.7, canCrossHalf: false, number: 11, role: "defender", preferredY: 200, team: "opponent" }
        ]
    },
    {
        number: 4,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "EINTRACHT BRAUNSCHWEIG", 
        field: 'stadium',
        fieldScale: 0.5,
        hasPlayerGoalkeeper: true
        bots: [
            { name: "GÜNTER HOFFMAN", x: 600, y: 120, color: "#ff6600", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: true, number: 6, role: "attacker", preferredY: 120, team: "opponent" },
            { name: "DIETER KLEIN", x: 650, y: 200, color: "#ff6600", maxSpeed: 4.5, aggressiveness: 0.8, canCrossHalf: false, number: 4, role: "midfielder", preferredY: 200, team: "opponent" },
            { name: "STEFAN BRAUN", x: 600, y: 280, color: "#ff6600", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: false, number: 3, role: "defender", preferredY: 280, team: "opponent" }
        ]
    },
    {
        number: 5,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "LOKOMOTIV LEIPZIG",
        field: "stadium", 
        fieldScale: 1.0,
        bots: [
            { name: "WOLFGANG RICHTER", x: 600, y: 100, color: "#990000", maxSpeed: 6, aggressiveness: 1.0, canCrossHalf: true, number: 5, role: "attacker", preferredY: 100, team: "opponent" },
            { name: "HERMANN FISCHER", x: 650, y: 200, color: "#990000", maxSpeed: 5.25, aggressiveness: 0.9, canCrossHalf: false, number: 2, role: "midfielder", preferredY: 200, team: "opponent" },
            { name: "RUDOLF BECKER", x: 600, y: 300, color: "#990000", maxSpeed: 6, aggressiveness: 1.0, canCrossHalf: false, number: 1, role: "defender", preferredY: 300, team: "opponent" },
            { name: "OTTO SCHULZ", x: 750, y: 200, color: "#660000", maxSpeed: 2.25, aggressiveness: 0.4, isGoalkeeper: true, canCrossHalf: false, number: 12, role: "goalkeeper", preferredY: 200, team: "opponent" }
        ]
    },
    {
        number: 6,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC CARL ZEISS JENA",
        field: "sandy",
        fieldScale: 0.75,
        bots: [
            { name: "BERND KOCH", x: 650, y: 130, color: "#0066ff", maxSpeed: 3.0, aggressiveness: 0.5, canCrossHalf: false, number: 14, role: "defender", preferredY: 130, team: "opponent" },
            { name: "UWE KRAUSE", x: 680, y: 200, color: "#0066ff", maxSpeed: 2.8, aggressiveness: 0.4, canCrossHalf: false, number: 8, role: "midfielder", preferredY: 200, team: "opponent" },
            { name: "THOMAS WEBER", x: 650, y: 270, color: "#0066ff", maxSpeed: 3.2, aggressiveness: 0.6, canCrossHalf: true, number: 9, role: "attacker", preferredY: 270, team: "opponent" }
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
            { name: "KAHN", x: 750, y: 200, color: "#660033", maxSpeed: 1.8, number: 1, role: "goalkeeper", isGoalkeeper: true, preferredY: 200, team: "opponent" },
            { name: "WEBER", x: 700, y: 120, color: "#800040", maxSpeed: 1.8, number: 2, role: "fullback", preferredY: 120, team: "opponent" },
            { name: "BRAUN", x: 720, y: 160, color: "#800040", maxSpeed: 1.5, number: 3, role: "centerback", preferredY: 160, team: "opponent" },
            { name: "MANN", x: 720, y: 240, color: "#800040", maxSpeed: 1.5, number: 4, role: "centerback", preferredY: 240, team: "opponent" },
            { name: "KLEIN", x: 700, y: 280, color: "#800040", maxSpeed: 1.8, number: 5, role: "fullback", preferredY: 280, team: "opponent" },
            { name: "SCHULZ", x: 650, y: 140, color: "#800040", maxSpeed: 2.0, number: 6, role: "defensive_midfielder", preferredY: 140, team: "opponent" },
            { name: "KOCH", x: 650, y: 260, color: "#800040", maxSpeed: 2.0, number: 8, role: "defensive_midfielder", preferredY: 260, team: "opponent" },
            { name: "FUCHS", x: 580, y: 120, color: "#800040", maxSpeed: 2.5, number: 7, role: "winger", preferredY: 120, team: "opponent" },
            { name: "RICHTER", x: 580, y: 280, color: "#800040", maxSpeed: 2.5, number: 11, role: "winger", preferredY: 280, team: "opponent" },
            { name: "MULLER", x: 520, y: 170, color: "#800040", maxSpeed: 2.8, number: 9, role: "striker", preferredY: 170, team: "opponent" },
            { name: "BECKER", x: 520, y: 230, color: "#800040", maxSpeed: 2.8, number: 10, role: "striker", preferredY: 230, team: "opponent" },

            // DRUŻYNA GRACZA (9 zawodników z pola + Włodarski + bramkarz)
            { name: "NOWAK", x: 100, y: 120, color: "#ff0000", maxSpeed: 1.8, number: 12, role: "fullback", preferredY: 120, team: "player" },
            { name: "KOWALSKI", x: 120, y: 160, color: "#ff0000", maxSpeed: 1.5, number: 13, role: "centerback", preferredY: 160, team: "player" },
            { name: "WIŚNIEWSKI", x: 120, y: 240, color: "#ff0000", maxSpeed: 1.5, number: 14, role: "centerback", preferredY: 240, team: "player" },
            { name: "JANKOWSKI", x: 100, y: 280, color: "#ff0000", maxSpeed: 1.8, number: 15, role: "fullback", preferredY: 280, team: "player" },
            { name: "ZIELIŃSKI", x: 150, y: 140, color: "#ff0000", maxSpeed: 2.0, number: 16, role: "defensive_midfielder", preferredY: 140, team: "player" },
            { name: "SZYMAŃSKI", x: 150, y: 260, color: "#ff0000", maxSpeed: 2.0, number: 18, role: "defensive_midfielder", preferredY: 260, team: "player" },
            { name: "DĄBROWSKI", x: 200, y: 200, color: "#ff0000", maxSpeed: 2.3, number: 21, role: "attacking_midfielder", preferredY: 200, team: "player" },
            { name: "LEWANDOWSKI", x: 220, y: 120, color: "#ff0000", maxSpeed: 2.5, number: 17, role: "winger", preferredY: 120, team: "player" },
            { name: "WÓJCIK", x: 220, y: 280, color: "#ff0000", maxSpeed: 2.5, number: 19, role: "winger", preferredY: 280, team: "player" }
        ],
        playerGoalkeeper: { name: "NOWAK", x: 50, y: 200, color: "#cc0000", maxSpeed: 2.0, number: 1, role: "goalkeeper" }
    }
];
