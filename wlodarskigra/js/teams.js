const oneVsOneTeams = [
    {
        playerTeam: "M. WŁODARSKI",
        opponentTeam: "HAJTO",
        field: "simple",
        fieldScale: 1.0,
        bots: [
            {
                name: "HAJTO",
                x: 650,
                y: 200,
                color: "#0066ff",
                maxSpeed: 4.0,
                number: 2,
                role: "defender",
                preferredY: 200,
                radius: 20
            }
        ]
    },
    {
        playerTeam: "M. WŁODARSKI",
        opponentTeam: "BASLER",
        field: "light_grass",
        fieldScale: 1.0,
        bots: [
            {
                name: "BASLER",
                x: 650,
                y: 200,
                color: "#ff4400",
                maxSpeed: 5.0,
                number: 11,
                role: "attacker",
                preferredY: 200,
                radius: 16,
                canCrossHalf: true
            }
        ]
    },
    {
        playerTeam: "M. WŁODARSKI",
        opponentTeam: "BAŁAKOW",
        field: "dark_grass",
        fieldScale: 1.0,
        bots: [
            {
                name: "BAŁAKOW",
                x: 680,
                y: 200,
                color: "#8b0000",
                maxSpeed: 3.0,
                number: 6,
                role: "defender",
                preferredY: 200,
                radius: 26
            }
        ]
    },
    {
        playerTeam: "M. WŁODARSKI",
        opponentTeam: "P. NOWAK",
        field: "striped_grass",
        fieldScale: 1.0,
        bots: [
            {
                name: "P. NOWAK",
                x: 650,
                y: 200,
                color: "#4b0082",
                maxSpeed: 4.0,
                number: 8,
                role: "midfielder",
                preferredY: 200,
                radius: 20,
                canCrossHalf: true
            }
        ]
    },
    {
        playerTeam: "M. WŁODARSKI",
        opponentTeam: "HERZOG",
        field: "dotted_grass",
        fieldScale: 1.0,
        bots: [
            {
                name: "HERZOG",
                x: 650,
                y: 200,
                color: "#2e8b57",
                maxSpeed: 3.5,
                number: 10,
                role: "midfielder",
                preferredY: 200,
                radius: 18,
                canCrossHalf: true
            }
        ]
    },
    {
        playerTeam: "M. WŁODARSKI",
        opponentTeam: "KAHN",
        field: "penalty_box",
        fieldScale: 1.0,
        bots: [
            {
                name: "KAHN",
                x: 720,
                y: 200,
                color: "#ff1493",
                maxSpeed: 3.0,
                number: 1,
                role: "goalkeeper",
                preferredY: 200,
                radius: 24,
                isGoalkeeper: true
            }
        ]
    }
];

const bundesligaTeams = [
    {
        number: 1,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "VFL OLDENBURG",
        field: "grass",
        fieldScale: 1.0,
        bots: [
            {
                name: "HANS JURGEN",
                x: 700,
                y: 200,
                color: "#0000ff",
                maxSpeed: 3.5,
                number: 7,
                role: "defender",
                preferredY: 200,
                radius: 20
            }
        ]
    }
];
