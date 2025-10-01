const teams = [
    {
        number: 0,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "VFL OLDENBURG",
        field: 'rain',
        fieldScale: 1.0,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 5.1,
        playerShootPower: 8,
        canCrossHalf: true,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.7,
        ballMaxSpeed: 11.5,
        
        bots: [
            { 
                name: "SZUBERT", 
                x: 700, 
                y: 200, 
                color: "#8000FF", 
                maxSpeed: 2.25,
                shootPower: 1.0,
                radius: 20,
                errorChance: 0.12,
                canCrossHalf: false, 
                number: 2, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 1,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "MSV DUISBURG",
        field: 'simple2',
        fieldScale: 1.0,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 5.1,
        playerShootPower: 8,
        canCrossHalf: true,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.7,
        ballMaxSpeed: 11.5,
        
        bots: [
            { 
                name: "HAJTO", 
                x: 700, 
                y: 200, 
                color: "#0000ff", 
                maxSpeed: 3.75,
                shootPower: 1.0,
                radius: 20,
                errorChance: 0.12,
                canCrossHalf: false, 
                number: 2, 
                role: "defender", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 3, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SV WALDHOF MANNHEIM",
        field: "muddy",
        fieldScale: 1.0,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 6.0,
        playerShootPower: 7.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 4.5,
        ballMaxSpeed: 8.0,
        
        bots: [
            { 
                name: "KOBYLANSKI", 
                x: 700, 
                y: 200, 
                color: "#800080", 
                maxSpeed: 4.5,
                shootPower: 1.5,
                radius: 18,
                canCrossHalf: true, 
                number: 9, 
                role: "ball_chaser", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 4, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC KAISERSLAUTERN",
        field: "professional",
        fieldScale: 1.0,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 6.0,
        playerShootPower: 7.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 7.5,
        ballMaxSpeed: 11.0,
        
        bots: [
            { 
                name: "RATINHO", 
                x: 700, 
                y: 200, 
                color: "#a33f2e", 
                maxSpeed: 5.5,
                shootPower: 1.5,
                radius: 14,
                canCrossHalf: false, 
                number: 9, 
                role: "ball_chaser", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
{
    number: 2, 
    playerTeam: "SV BABELSBERG 04",
    opponentTeam: "FC GUTERSLOH",
    field: "campnou",
    fieldScale: 1.0,
    
    // === PARAMETRY WŁODARSKIEGO ===
    playerRadius: 20,
    playerSpeed: 6.0,
    playerShootPower: 7.5,
    
    // === PARAMETRY PIŁKI ===
    ballSpeed: 7.5,
    ballMaxSpeed: 11.0,
    
    bots: [
        { 
            name: "MATYSEK", 
            x: 750,              // Bliżej bramki
            y: 200, 
            color: "#3b3635", 
            maxSpeed: 1.5,       // Wolniejszy jak bramkarz
            shootPower: 1.5,     // Słabszy w strzałach
            radius: 18,          // Nieco większy
            canCrossHalf: false, 
            number: 1,           // Numer bramkarza
            role: "goalkeeper",  // ZMIANA: z "midfielder" na "goalkeeper"
            isGoalkeeper: true,  // DODANE: oznacza bramkarza
            preferredY: 200, 
            team: "opponent" 
        }
    ]
},
    {
        number: 5,
        playerTeam: "SV BABELSBERG 04", 
        opponentTeam: "FC HANSA ROSTOCK",
        field: "winter",
        fieldScale: 0.75,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 5.1,
        playerShootPower: 7,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 4.2,
        ballMaxSpeed: 10.5,
        
        bots: [
            { 
                name: "MAJAK", 
                x: 650, 
                y: 150, 
                color: "#006600", 
                maxSpeed: 3.0,
                shootPower: 1.3,
                radius: 16,
                canCrossHalf: true, 
                number: 8, 
                role: "attacker", 
                preferredY: 150, 
                team: "opponent" 
            },
            { 
                name: "LANGE", 
                x: 650, 
                y: 250, 
                color: "#006600", 
                maxSpeed: 2.75,
                shootPower: 0.9,
                radius: 18,
                canCrossHalf: false, 
                number: 11, 
                role: "defender", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 6,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SV MEPPEN", 
        field: 'stadium',
        fieldScale: 0.5,
        hasPlayerGoalkeeper: true,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 15,
        playerSpeed: 5.2,
        playerShootPower: 8.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 6.0,
        ballMaxSpeed: 12.0,
        
        bots: [
            { 
                name: "CLAASEN", 
                x: 600, 
                y: 120, 
                color: "#ff6600", 
                maxSpeed: 3.25,
                shootPower: 1.6,
                radius: 12,
                canCrossHalf: true, 
                number: 6, 
                role: "attacker", 
                preferredY: 120, 
                team: "opponent" 
            },

            { 
                name: "BRASAS", 
                x: 750, 
                y: 200, 
                color: "#cc3300", 
                maxSpeed: 0.8,
                shootPower: 0.5,
                radius: 14,
                number: 1, 
                role: "goalkeeper", 
                isGoalkeeper: true, 
                preferredY: 200, 
                team: "opponent" 
            }
        ],
        playerGoalkeeper: { 
            name: "NOWAK", 
            x: 50, 
            y: 200, 
            color: "#cc0000", 
            maxSpeed: 2.0,
            shootPower: 0.6,
            radius: 14,
            number: 1, 
            role: "goalkeeper" 
        }
    },
    {
        number: 7,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FORTUNA KOLN",
        field: "forest", 
        fieldScale: 0.25,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 10,
        playerSpeed: 2.7,
        playerShootPower: 2,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 3.2,
        ballMaxSpeed: 6.0,
        
        bots: [
            { 
                name: "BRDARIC", 
                x: 600, 
                y: 100, 
                color: "#990000", 
                maxSpeed: 2,
                shootPower: 1.8,
                radius: 6,
                canCrossHalf: true, 
                number: 5, 
                role: "attacker", 
                preferredY: 100, 
                team: "opponent" 
            },
            { 
                name: "AKONNOR", 
                x: 650, 
                y: 200, 
                color: "#990000", 
                maxSpeed: 2,
                shootPower: 1.4,
                radius: 6,
                canCrossHalf: false, 
                number: 2, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "NIEDZIELLA", 
                x: 600, 
                y: 300, 
                color: "#990000", 
                maxSpeed: 2,
                shootPower: 1.0,
                radius: 6,
                canCrossHalf: false, 
                number: 1, 
                role: "defender", 
                preferredY: 300, 
                team: "opponent" 
            },
            { 
                name: "WESSELS", 
                x: 750, 
                y: 200, 
                color: "#660000", 
                maxSpeed: 2.25,
                shootPower: 0.4,
                radius: 7,
                isGoalkeeper: true, 
                canCrossHalf: false, 
                number: 12, 
                role: "goalkeeper", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 8,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC CARL ZEISS JENA",
        field: "sandy",
        fieldScale: 0.75,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 18,
        playerSpeed: 4.5,
        playerShootPower: 6.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.0,
        ballMaxSpeed: 10.0,
        
        bots: [
            { 
                name: "BERND KOCH", 
                x: 650, 
                y: 130, 
                color: "#0066ff", 
                maxSpeed: 3.0,
                shootPower: 0.8,
                radius: 17,
                canCrossHalf: false, 
                number: 14, 
                role: "defender", 
                preferredY: 130, 
                team: "opponent" 
            },
            { 
                name: "UWE KRAUSE", 
                x: 680, 
                y: 200, 
                color: "#0066ff", 
                maxSpeed: 2.8,
                shootPower: 1.1,
                radius: 16,
                canCrossHalf: false, 
                number: 8, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "THOMAS WEBER", 
                x: 650, 
                y: 270, 
                color: "#0066ff", 
                maxSpeed: 3.2,
                shootPower: 1.4,
                radius: 15,
                canCrossHalf: true, 
                number: 9, 
                role: "attacker", 
                preferredY: 270, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 9,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "VFL BOCHUM",
        field: "simple",
        fieldScale: 0.75,
        hasPlayerGoalkeeper: true,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 22,
        playerSpeed: 5.5,
        playerShootPower: 7.8,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 6.8,
        ballMaxSpeed: 13.5,
        
        bots: [
            // DRUŻYNA PRZECIWNIKA
            { 
                name: "WOSZ", 
                x: 650, 
                y: 200, 
                color: "#004488", 
                maxSpeed: 4.8,
                shootPower: 1.4,
                radius: 13,
                errorChance: 0.08,
                canCrossHalf: true, 
                number: 8, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "WAŁDOCH", 
                x: 720, 
                y: 200, 
                color: "#004488", 
                maxSpeed: 3.2,
                shootPower: 0.9,
                radius: 15,
                errorChance: 0.06,
                canCrossHalf: false, 
                number: 5, 
                role: "sweeper", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "BAŁUSZYŃSKI", 
                x: 580, 
                y: 180, 
                color: "#004488", 
                maxSpeed: 5.5,
                shootPower: 1.8,
                radius: 12,
                errorChance: 0.09,
                canCrossHalf: true, 
                number: 10, 
                role: "attacker", 
                preferredY: 180, 
                team: "opponent" 
            },
            
            // DRUŻYNA GRACZA - OBROŃCA
            { 
                name: "SZUMNARSKI", 
                x: 120, 
                y: 200, 
                color: "#ff0000", 
                maxSpeed: 4.0,
                shootPower: 1.1,
                radius: 15,
                number: 4, 
                role: "centerback", 
                preferredY: 200, 
                team: "player" 
            }
        ],
playerGoalkeeper: { 
            name: "HANAUER", 
            x: 50, 
            y: 200, 
            color: "#cc0000", 
            maxSpeed: 2.2,
            shootPower: 0.6,
            radius: 17,
            number: 1, 
            role: "goalkeeper" 
        }
    },  // <-- TEN PRZECINEK BYŁ POMINIĘTY
    {
        number: 10, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "KFC UERDINGEN",
        field: "clay",
        fieldScale: 0.25,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 10,
        playerSpeed: 6.0,
        playerShootPower: 11.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 6.5,
        ballMaxSpeed: 12.0,
        
        bots: [
            { 
                name: "THORUP", 
                x: 700, 
                y: 200, 
                color: "#a33f2e", 
                maxSpeed: 6.0,
                shootPower: 1.5,
                radius: 10,
                canCrossHalf: false, 
                number: 9, 
                role: "ball_chaser", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {  // <-- DODAJ TO

        number: 11, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "STUTTGARTER KICKERS",
        field: "beach",
        fieldScale: 0.5,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 15,
        playerSpeed: 5.0,
        playerShootPower: 8.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 4.5,
        ballMaxSpeed: 8.0,
        
        bots: [
            { 
                name: "STROGIES", 
                x: 700, 
                y: 200, 
                color: "#a33f2e", 
                maxSpeed: 2.0,
                shootPower: 1.0,
                radius: 25,
                canCrossHalf: false, 
                number: 9, 
                role: "sweeper", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {  // <-- DODAJ TO

       number: 12, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FSV ZWICKAU",
        field: "night",
        fieldScale: 0.5,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 15,
        playerSpeed: 5.0,
        playerShootPower: 8.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 4.5,
        ballMaxSpeed: 8.0,
        
        bots: [
            { 
                name: "KIRSTEN", 
                x: 700, 
                y: 200, 
                color: "#a38a2e", 
                maxSpeed: 4.5,
                shootPower: 1.0,
                radius: 25,
                canCrossHalf: false, 
                number: 9, 
                role: "ball_chaser", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
         {
        number: 13,
        playerTeam: "SV BABELSBERG 04", 
        opponentTeam: "HERTHA BERLIN",
        field: "parquet",
        fieldScale: 1.0,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 16,
        playerSpeed: 5.1,
        playerShootPower: 7,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.2,
        ballMaxSpeed: 10.5,
        
        bots: [
            { 
                name: "RRAKLI", 
                x: 650, 
                y: 150, 
                color: "#006600", 
                maxSpeed: 4.0,
                shootPower: 1.3,
                radius: 16,
                canCrossHalf: true, 
                number: 8, 
                role: "midfielder", 
                preferredY: 150, 
                team: "opponent" 
            },
            { 
                name: "GOTZ", 
                x: 650, 
                y: 250, 
                color: "#006600", 
                maxSpeed: 3.75,
                shootPower: 0.9,
                radius: 18,
                canCrossHalf: false, 
                number: 11, 
                role: "defender", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },

             {
        number: 14,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC ST. PAULI",
        field: "neon",
        fieldScale: 0.5,
        hasPlayerGoalkeeper: true,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 16,
        playerSpeed: 5.3,
        playerShootPower: 7.5,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.5,
        ballMaxSpeed: 11.0,
        
        bots: [
            { 
                name: "EBBERS", 
                x: 620, 
                y: 150, 
                color: "#663300", 
                maxSpeed: 4.2,
                shootPower: 1.7,
                radius: 13,
                canCrossHalf: true, 
                number: 7, 
                role: "attacker", 
                preferredY: 150, 
                team: "opponent" 
            },
            { 
                name: "PRZONDZIONO", 
                x: 680, 
                y: 200, 
                color: "#663300", 
                maxSpeed: 3.5,
                shootPower: 1.2,
                radius: 14,
                canCrossHalf: false, 
                number: 6, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "GOLKE", 
                x: 750, 
                y: 200, 
                color: "#442200", 
                maxSpeed: 1.8,
                shootPower: 0.5,
                radius: 15,
                number: 1, 
                role: "goalkeeper", 
                isGoalkeeper: true, 
                preferredY: 200, 
                team: "opponent" 
            },
            
            // DRUŻYNA GRACZA
            { 
                name: "RZEPKA", 
                x: 150, 
                y: 200, 
                color: "#ff0000", 
                maxSpeed: 3.8,
                shootPower: 1.0,
                radius: 14,
                number: 5, 
                role: "sweeper", 
                preferredY: 200, 
                team: "player" 
            }
        ],
        playerGoalkeeper: { 
            name: "RADOMSKI", 
            x: 50, 
            y: 200, 
            color: "#cc0000", 
            maxSpeed: 2.1,
            shootPower: 0.6,
            radius: 15,
            number: 1, 
            role: "goalkeeper" 
        }
    },
    {
        number: 15,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "1. FC UNION BERLIN",
        field: "storm",
        fieldScale: 0.5,
        hasPlayerGoalkeeper: true,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 12,
        playerSpeed: 4.8,
        playerShootPower: 6.0,
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 3.8,
        ballMaxSpeed: 7.5,
        
        bots: [
            { 
                name: "PFANNENSTIEL", 
                x: 750, 
                y: 200, 
                color: "#aa1000", 
                maxSpeed: 1.5,
                shootPower: 0.4,
                radius: 13,
                number: 1, 
                role: "goalkeeper", 
                isGoalkeeper: true, 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "SEITZ", 
                x: 680, 
                y: 180, 
                color: "#cc1000", 
                maxSpeed: 3.8,
                shootPower: 1.3,
                radius: 10,
                canCrossHalf: false, 
                number: 4, 
                role: "defender", 
                preferredY: 180, 
                team: "opponent" 
            },
            { 
                name: "TIFFERT", 
                x: 640, 
                y: 220, 
                color: "#cc1000", 
                maxSpeed: 4.0,
                shootPower: 1.5,
                radius: 10,
                canCrossHalf: true, 
                number: 8, 
                role: "midfielder", 
                preferredY: 220, 
                team: "opponent" 
            },
            { 
                name: "QUIRING", 
                x: 590, 
                y: 200, 
                color: "#cc1000", 
                maxSpeed: 4.5,
                shootPower: 1.8,
                radius: 11,
                canCrossHalf: true, 
                number: 9, 
                role: "attacker", 
                preferredY: 200, 
                team: "opponent" 
            },
            
            // DRUŻYNA GRACZA - 2 GRACZY
            { 
                name: "MEYER", 
                x: 130, 
                y: 180, 
                color: "#ff0000", 
                maxSpeed: 3.5,
                shootPower: 0.9,
                radius: 11,
                number: 3, 
                role: "defender", 
                preferredY: 180, 
                team: "player" 
            },
            { 
                name: "RICHTER", 
                x: 180, 
                y: 220, 
                color: "#ff0000", 
                maxSpeed: 4.2,
                shootPower: 1.4,
                radius: 10,
                number: 7, 
                role: "midfielder", 
                preferredY: 220, 
                team: "player" 
            }
        ],
        playerGoalkeeper: { 
            name: "PETERSEN", 
            x: 50, 
            y: 200, 
            color: "#cc0000", 
            maxSpeed: 1.9,
            shootPower: 0.5,
            radius: 13,
            number: 1, 
            role: "goalkeeper" 
        }
    }
             
];
