const teams = [
    {
        number: 1,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "MSV DUISBURG",
        field: 'simple',
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
                shootPower: 1.0,  // Słabszy strzelec
                radius: 20,       // Standardowy rozmiar
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
        number: 2, 
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SV WALDHOF MANNHEIM",
        field: "muddy",
        fieldScale: 1.0,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 5.0,        // Nieco wolniejszy na błocie
        playerShootPower: 7.5,   // Nieco słabsze strzały
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.5,          // Wolniejsza na błocie
        ballMaxSpeed: 11.0,
        
        bots: [
            { 
                name: "KOBYLANSKI", 
                x: 700, 
                y: 200, 
                color: "#800080", 
                maxSpeed: 4.5,
                shootPower: 1.5,  // Mocniejszy strzelec
                radius: 18,       // Nieco mniejszy, zwinniejszy
                canCrossHalf: true, 
                number: 9, 
                role: "ball_chaser", 
                preferredY: 200, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 3,
        playerTeam: "SV BABELSBERG 04", 
        opponentTeam: "FC HANSA ROSTOCK",
        field: "winter",
        fieldScale: 0.75,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 4.8,        // Ślisko na śniegu
        playerShootPower: 7,     // Trudniej kopać na śniegu
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.2,          // Wolniejsza na śniegu
        ballMaxSpeed: 10.5,
        
        bots: [
            { 
                name: "MAJAK", 
                x: 650, 
                y: 150, 
                color: "#006600", 
                maxSpeed: 3.5,
                shootPower: 1.3,
                radius: 16,       // Skalowane do boiska 0.75
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
                shootPower: 0.9,  // Obrońca - słabszy w strzałach
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
        number: 4,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "EINTRACHT BRAUNSCHWEIG", 
        field: 'stadium',
        fieldScale: 0.5,
        hasPlayerGoalkeeper: true,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 5.2,        // Szybsze na stadionowej murawie
        playerShootPower: 8.5,   // Mocniejsze strzały
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 6.0,          // Szybsza na dobrej nawierzchni
        ballMaxSpeed: 12.0,
        
        bots: [
            { 
                name: "GÜNTER HOFFMAN", 
                x: 600, 
                y: 120, 
                color: "#ff6600", 
                maxSpeed: 5.25,
                shootPower: 1.6,  // Silny napastnik
                radius: 12,       // Skalowane do 0.5
                canCrossHalf: true, 
                number: 6, 
                role: "attacker", 
                preferredY: 120, 
                team: "opponent" 
            },
            { 
                name: "DIETER KLEIN", 
                x: 650, 
                y: 200, 
                color: "#ff6600", 
                maxSpeed: 4.5,
                shootPower: 1.2,
                radius: 11,
                canCrossHalf: false, 
                number: 4, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "STEFAN BRAUN", 
                x: 600, 
                y: 280, 
                color: "#ff6600", 
                maxSpeed: 5.25,
                shootPower: 0.8,  // Obrońca
                radius: 12,
                canCrossHalf: false, 
                number: 3, 
                role: "defender", 
                preferredY: 280, 
                team: "opponent" 
            },
            { 
                name: "KEEPER BRAUN", 
                x: 750, 
                y: 200, 
                color: "#cc3300", 
                maxSpeed: 1.8,
                shootPower: 0.5,  // Bramkarz - bardzo słaby w strzałach
                radius: 14,       // Większy bramkarz
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
        number: 5,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "LOKOMOTIV LEIPZIG",
        field: "professional", 
        fieldScale: 0.25,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 20,
        playerSpeed: 4.7,        // Trudniejszy mecz - wolniejszy
        playerShootPower: 7,     // Słabsze strzały
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 6.2,          // Szybsza piłka = trudniejsza kontrola
        ballMaxSpeed: 13.0,
        
        bots: [
            { 
                name: "WOLFGANG RICHTER", 
                x: 600, 
                y: 100, 
                color: "#990000", 
                maxSpeed: 6,
                shootPower: 1.8,  // Bardzo mocny napastnik
                radius: 6,        // Bardzo małe boisko
                canCrossHalf: true, 
                number: 5, 
                role: "attacker", 
                preferredY: 100, 
                team: "opponent" 
            },
            { 
                name: "HERMANN FISCHER", 
                x: 650, 
                y: 200, 
                color: "#990000", 
                maxSpeed: 5.25,
                shootPower: 1.4,
                radius: 6,
                canCrossHalf: false, 
                number: 2, 
                role: "midfielder", 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "RUDOLF BECKER", 
                x: 600, 
                y: 300, 
                color: "#990000", 
                maxSpeed: 6,
                shootPower: 1.0,
                radius: 6,
                canCrossHalf: false, 
                number: 1, 
                role: "defender", 
                preferredY: 300, 
                team: "opponent" 
            },
            { 
                name: "OTTO SCHULZ", 
                x: 750, 
                y: 200, 
                color: "#660000", 
                maxSpeed: 2.25,
                shootPower: 0.4,  // Słaby bramkarz w strzałach
                radius: 7,        // Większy bramkarz
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
        number: 6,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "FC CARL ZEISS JENA",
        field: "sandy",
        fieldScale: 0.75,
        
        // === PARAMETRY WŁODARSKIEGO ===
        playerRadius: 18,        // Mniejszy na piasku
        playerSpeed: 4.5,        // Trudno biegać na piasku
        playerShootPower: 6.5,   // Słabsze strzały na piasku
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 5.0,          // Piasek hamuje piłkę
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
                shootPower: 1.4,  // Napastnik
                radius: 15,       // Mniejszy, szybszy
                canCrossHalf: true, 
                number: 9, 
                role: "attacker", 
                preferredY: 270, 
                team: "opponent" 
            }
        ]
    },
    {
        number: 7,
        playerTeam: "SV BABELSBERG 04",
        opponentTeam: "SPVGG UNTERHACHING",
        field: "professional",
        fieldScale: 0.25,
        hasPlayerGoalkeeper: true,
        
        // === PARAMETRY WŁODARSKIEGO - FINAŁ! ===
        playerRadius: 4,        // Większy, mocniejszy
        playerSpeed: 1,        // Najszybszy
        playerShootPower: 1,    // Najsilniejsze strzały
        
        // === PARAMETRY PIŁKI ===
        ballSpeed: 0.5,          // Bardzo szybka
        ballMaxSpeed: 1.5,      // Najszybsza możliwa
        
        bots: [
            // DRUŻYNA PRZECIWNIKA (11 zawodników) - NIEMCY '96
            { 
                name: "KAHN", 
                x: 750, 
                y: 200, 
                color: "#080808", 
                maxSpeed: 1.8,
                shootPower: 0.3,  // Bramkarz
                radius: 20,
                number: 21, 
                role: "goalkeeper", 
                isGoalkeeper: true, 
                preferredY: 200, 
                team: "opponent" 
            },
            { 
                name: "KOHLER", 
                x: 700, 
                y: 120, 
                color: "#080808", 
                maxSpeed: 0.8,
                shootPower: 0.9,
                radius: 25,
                number: 20, 
                role: "fullback", 
                preferredY: 120, 
                team: "opponent" 
            },
            { 
                name: "HELMER", 
                x: 720, 
                y: 160, 
                color: "#080808", 
                maxSpeed: 0.5,
                shootPower: 0.7,
                radius: 19,
                number: 29, 
                role: "centerback", 
                preferredY: 160, 
                team: "opponent" 
            },
            { 
                name: "REUTER", 
                x: 720, 
                y: 240, 
                color: "#080808", 
                maxSpeed: 0.5,
                shootPower: 0.7,
                radius: 6,
                number: 19, 
                role: "centerback", 
                preferredY: 240, 
                team: "opponent" 
            },
            { 
                name: "ZIEGE", 
                x: 700, 
                y: 280, 
                color: "#080808", 
                maxSpeed: 0.8,
                shootPower: 1.1,  // Ziege był dobry w strzałach
                radius: 6,
                number: 18, 
                role: "fullback", 
                preferredY: 280, 
                team: "opponent" 
            },
            { 
                name: "ELITS", 
                x: 650, 
                y: 140, 
                color: "#080808", 
                maxSpeed: 1.0,
                shootPower: 1.0,
                radius: 40,
                number: 16, 
                role: "defensive_midfielder", 
                preferredY: 140, 
                team: "opponent" 
            },
            { 
                name: "STRUNZ", 
                x: 650, 
                y: 260, 
                color: "#080808", 
                maxSpeed: 1.0,
                shootPower: 1.0,
                radius: 23,
                number: 15, 
                role: "defensive_midfielder", 
                preferredY: 260, 
                team: "opponent" 
            },
            { 
                name: "MOLLER", 
                x: 580, 
                y: 120, 
                color: "#080808", 
                maxSpeed: 0.5,
                shootPower: 1.5,  // Möller był świetnym strzelcem
                radius: 34,
                number: 14, 
                role: "winger", 
                preferredY: 140, 
                team: "opponent" 
            },
            { 
                name: "HASLER", 
                x: 580, 
                y: 280, 
                color: "#080808", 
                maxSpeed: 0.5,
                shootPower: 1.3,
                radius: 5,
                number: 13, 
                role: "winger", 
                preferredY: 280, 
                team: "opponent" 
            },
            { 
                name: "KLINSMANN", 
                x: 520, 
                y: 170, 
                color: "#080808", 
                maxSpeed: 1.8,
                shootPower: 2.0,  // Klinsmann - legendarny strzelec!
                radius: 8,
                number: 12, 
                role: "striker", 
                preferredY: 170, 
                team: "opponent" 
            },
            { 
                name: "BIERHOFF", 
                x: 520, 
                y: 230, 
                color: "#080808", 
                maxSpeed: 0.8,
                shootPower: 1.9,  // Bierhoff też mocny strzelec
                radius: 6,        // Większy fizycznie
                number: 11, 
                role: "striker", 
                preferredY: 230, 
                team: "opponent" 
            },

            // DRUŻYNA GRACZA (9 zawodników z pola + Włodarski + bramkarz)
            { 
                name: "WOJTALA", 
                x: 100, 
                y: 120, 
                color: "#ff0000", 
                maxSpeed: 0.8,
                shootPower: 0.9,
                radius: 25,
                number: 17, 
                role: "fullback", 
                preferredY: 120, 
                team: "player" 
            },
            { 
                name: "ŁAPIŃSKI", 
                x: 120, 
                y: 160, 
                color: "#ff0000", 
                maxSpeed: 0.5,
                shootPower: 0.7,
                radius: 6,
                number: 9, 
                role: "centerback", 
                preferredY: 160, 
                team: "player" 
            },
            { 
                name: "ZIELIŃSKI", 
                x: 120, 
                y: 240, 
                color: "#ff0000", 
                maxSpeed: 0.5,
                shootPower: 0.7,
                radius: 12,
                number: 8, 
                role: "centerback", 
                preferredY: 240, 
                team: "player" 
            },
            { 
                name: "HAJTO", 
                x: 100, 
                y: 280, 
                color: "#ff0000", 
                maxSpeed: 0.8,
                shootPower: 1.0,
                radius: 25,
                number: 7, 
                role: "fullback", 
                preferredY: 280, 
                team: "player" 
            },
            { 
                name: "CZERWIEC", 
                x: 150, 
                y: 140, 
                color: "#ff0000", 
                maxSpeed: 1.0,
                shootPower: 1.1,
                radius: 10,
                number: 6, 
                role: "defensive_midfielder", 
                preferredY: 140, 
                team: "player" 
            },
            { 
                name: "MICHALSKI", 
                x: 150, 
                y: 260, 
                color: "#ff0000", 
                maxSpeed: 1.0,
                shootPower: 1.1,
                radius: 30,
                number: 4, 
                role: "defensive_midfielder", 
                preferredY: 260, 
                team: "player" 
            },
            { 
                name: "BRZĘCZEK", 
                x: 200, 
                y: 200, 
                color: "#ff0000", 
                maxSpeed: 1.3,
                shootPower: 1.4,  // Kreatywny pomocnik
                radius: 5,
                number: 3, 
                role: "attacking_midfielder", 
                preferredY: 200, 
                team: "player" 
            },
            { 
                name: "WARZYCHA", 
                x: 220, 
                y: 120, 
                color: "#ff0000", 
                maxSpeed: 1.5,
                shootPower: 1.6,  // Skrzydłowy z dryblingu i strzałami
                radius: 25,
                number: 2, 
                role: "winger", 
                preferredY: 120, 
                team: "player" 
            },
            { 
                name: "KOWALCZYK", 
                x: 220, 
                y: 280, 
                color: "#ff0000", 
                maxSpeed: 1.5,
                shootPower: 1.6,
                radius: 25,
                number: 1, 
                role: "winger", 
                preferredY: 280, 
                team: "player" 
            }
        ],
        playerGoalkeeper: { 
            name: "SZCZESNY", 
            x: 50, 
            y: 200, 
            color: "#cc0000", 
            maxSpeed: 2.0,
            shootPower: 0.5,
            radius: 25,
            number: 5, 
            role: "goalkeeper" 
        }
    }
];
