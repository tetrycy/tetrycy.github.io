// field.js - funkcje rysowania różnych boisk - POPRAWIONE
function drawField() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    
    switch(currentTeamData.field) {
        case 'grass':
            drawGrassField();
            break;
        case 'muddy':
            drawMuddyField();
            break;
        case 'winter':
            drawWinterField();
            break;
        case 'professional':
            drawProfessionalField();
            break;
        case 'stadium':
            drawStadiumField();
            break;
        case 'sandy':
            drawSandyField();
            break;
        case 'asphalt':
            drawAsphaltField();
            break;
        case 'simple':
            drawSimpleField();
            break;
        case 'simple1':
            drawSimple1Field();
            break;
        case 'simple2':
            drawSimple2Field();
            break;
        case 'autumn':
            drawAutumnField();
            break;
        case 'desert':
            drawDesertField();
            break;
        case 'beach':
            drawBeachField();
            break;
        case 'forest':
            drawForestField();
            break;
        case 'clay':
            drawClayField();
            break;
        case 'rubber':
            drawRubberField();
            break;
        case 'concrete':
            drawConcreteField();
            break;
        case 'parquet':
            drawParquetField();
            break;
        case 'night':
            drawNightField();
            break;
        case 'rain':
            drawRainField();
            break;
        case 'retro':
            drawRetroField();
            break;
     case 'neon':
            drawNeonField();
            break;
        case 'campnou':  // <-- DODAJ TEN CASE
            drawCampNouField();
            break;
             case 'storm':
            drawStormField();
            break;
    }
}

function drawSimpleField() {
    // Proste zielone boisko - jasna zieleń
    ctx.fillStyle = '#32CD32'; // Lime green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStandardFieldLines();
}

function drawSimple1Field() {
    // Proste zielone boisko - średnia zieleń
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStandardFieldLines();
}

function drawSimple2Field() {
    // Proste zielone boisko - ciemna zieleń
    ctx.fillStyle = '#006400'; // Dark green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStandardFieldLines();
}

function drawWinterField() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Zimowe boisko - SZARAWY ŚNIEG zamiast białego
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#e8e8e8'); // Jasny szary
    gradient.addColorStop(0.7, '#d5d5d5'); // Średni szary
    gradient.addColorStop(1, '#c0c0c0'); // Ciemniejszy szary
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Płatki śniegu - SZARE zamiast białych - skalowane
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(200,200,200,0.8)'; // Szary śnieg
    for(let i = 0; i < 20; i++) {
        const x = (i * 37 + Math.sin(time + i) * 10) % canvas.width;
        const y = (i * 23 + time * 10) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, (2 + Math.sin(time + i)) * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Dodatkowe szare plamy śniegu na ziemi
    ctx.fillStyle = 'rgba(180,180,180,0.6)';
    [[150,80,40,25], [500,150,35,20], [300,300,30,18], [650,250,45,30]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w * scale, h * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawSandyField() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Piaszczyste boisko z pustynną teksturą
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#F4A460'); // Sandy brown
    gradient.addColorStop(0.5, '#D2B48C'); // Tan
    gradient.addColorStop(1, '#DEB887'); // Burlywood
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Wzory piasku - SKALOWANE
    ctx.strokeStyle = 'rgba(210, 180, 140, 0.3)';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < canvas.width; i += 15 * scale) {
        for (let j = 0; j < canvas.height; j += 15 * scale) {
            ctx.beginPath();
            ctx.arc(i + Math.sin(i*j*0.01) * 3 * scale, j + Math.cos(i*j*0.01) * 3 * scale, 1 * scale, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Wydmy piasku - SKALOWANE
    ctx.fillStyle = 'rgba(244, 164, 96, 0.4)';
    [[150,80,60,20], [650,320,80,25], [300,350,50,15], [500,100,70,18]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w * scale, h * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawAsphaltField() {
    // Asfaltowe boisko z miejskim charakterem
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#404040'); // Ciemny szary
    gradient.addColorStop(0.5, '#333333'); // Grafitowy
    gradient.addColorStop(1, '#1a1a1a'); // Prawie czarny
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tekstura asfaltu - cząstki
    ctx.fillStyle = 'rgba(80, 80, 80, 0.3)';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Pęknięcia w asfalcie
    ctx.strokeStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.lineWidth = 2;
    [[100,50,200,80], [600,300,650,350], [300,100,320,200], [500,250,550,280]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });
    
    // Plamy oleju
    ctx.fillStyle = 'rgba(10, 10, 10, 0.6)';
    [[250,150,15,10], [550,280,20,12], [400,320,18,14]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawGrassField() {
    // Zielone boisko z realistycznymi zniszczeniami
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#32CD32');
    gradient.addColorStop(0.7, '#228B22');
    gradient.addColorStop(1, '#1F7A1F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tekstura trawy
    ctx.strokeStyle = 'rgba(50, 205, 50, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    // Błoto pod bramkami
    ctx.fillStyle = 'rgba(139,69,19,0.6)';
    ctx.beginPath();
    ctx.ellipse(60, canvas.height/2, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(canvas.width - 60, canvas.height/2, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Starta murawa
    ctx.fillStyle = 'rgba(101,67,33,0.4)';
    const spots = [{x:300,y:100,w:25,h:15}, {x:500,y:320,w:30,h:20}, {x:150,y:250,w:20,h:25}, {x:650,y:150,w:35,h:18}];
    spots.forEach(spot => {
        ctx.beginPath();
        ctx.ellipse(spot.x, spot.y, spot.w, spot.h, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawMuddyField() {
    // Błotniste boisko
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#654321');
    gradient.addColorStop(1, '#2F1B0C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Kałuże
    ctx.fillStyle = 'rgba(0,100,150,0.7)';
    [[200,100,40,20], [600,300,35,25], [400,150,30,15]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawProfessionalField() {
    // Profesjonalne boisko
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#228B22');
    gradient.addColorStop(0.5, '#32CD32');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Paski
    ctx.fillStyle = 'rgba(50, 205, 50, 0.5)';
    for (let i = 0; i < canvas.width; i += 80) {
        ctx.fillRect(i, 0, 40, canvas.height);
    }
    
    drawStandardFieldLines();
}

function drawStadiumField() {
    // Stadionowe boisko finałowe
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#00FF00');
    gradient.addColorStop(0.7, '#228B22');
    gradient.addColorStop(1, '#006400');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Paski stadionowe
    ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, 0, 20, canvas.height);
    }
    
    // Reflektory
    const time = Date.now() * 0.001;
    ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(time) * 0.05})`;
    ctx.beginPath();
    ctx.arc(canvas.width/4, 50, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3*canvas.width/4, 50, 80, 0, Math.PI * 2);
    ctx.fill();
    
    drawStandardFieldLines();
}

function drawStandardFieldLines() {
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Linie boiska - skalowane
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4 * scale;

    // Obramowanie
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Linia środkowa
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(canvas.width / 2, canvas.height - 10);
    ctx.stroke();

    // Koło środkowe - skalowane
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Punkt środkowy - skalowany
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

   
    drawGoalsAndBoxes(scale);
}

function drawGoalsAndBoxes(scale = 1.0) {
    const goalHeight = canvas.height * 0.3 * scale;
    const goalTop = canvas.height * 0.5 - goalHeight/2;
    const goalBottom = canvas.height * 0.5 + goalHeight/2;
    const goalWidth = 15 * scale; // Szerokość bramki (głębokość)
    
    // ============ LEWA BRAMKA ============
    
    // Tło bramki (ciemniejsze)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(10 - goalWidth, goalTop, goalWidth, goalHeight);
    
    // Siatka bramki
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1 * scale;
    
    // Pionowe linie siatki
    for (let i = 0; i < 4; i++) {
        const x = 10 - goalWidth + (goalWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, goalTop);
        ctx.lineTo(x, goalBottom);
        ctx.stroke();
    }
    
    // Poziome linie siatki
    for (let i = 0; i <= 3; i++) {
        const y = goalTop + (goalHeight / 3) * i;
        ctx.beginPath();
        ctx.moveTo(10 - goalWidth, y);
        ctx.lineTo(10, y);
        ctx.stroke();
    }
    
    // Słupki bramki (grube, białe z cieniem)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8 * scale;
    ctx.lineCap = 'round';
    
    // Cień słupków
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(12, goalTop + 2);
    ctx.lineTo(12, goalBottom + 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(10 - goalWidth + 2, goalTop - 2);
    ctx.lineTo(10 + 2, goalTop - 2);
    ctx.stroke();
    
    // Białe słupki
    ctx.strokeStyle = '#ffffff';
    
    // Lewy słupek (linia bramki)
    ctx.beginPath();
    ctx.moveTo(10, goalTop);
    ctx.lineTo(10, goalBottom);
    ctx.stroke();
    
    // Poprzeczka
    ctx.beginPath();
    ctx.moveTo(10 - goalWidth, goalTop);
    ctx.lineTo(10, goalTop);
    ctx.stroke();
    
    // Dolna poprzeczka (opcjonalna)
    ctx.beginPath();
    ctx.moveTo(10 - goalWidth, goalBottom);
    ctx.lineTo(10, goalBottom);
    ctx.stroke();
    
    // Tylni słupek
    ctx.strokeStyle = '#cccccc'; // Jaśniejszy, bo z tyłu
    ctx.beginPath();
    ctx.moveTo(10 - goalWidth, goalTop);
    ctx.lineTo(10 - goalWidth, goalBottom);
    ctx.stroke();
    
    // ============ PRAWA BRAMKA ============
    
    // Tło bramki
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(canvas.width - 10, goalTop, goalWidth, goalHeight);
    
    // Siatka bramki
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1 * scale;
    
    // Pionowe linie siatki
    for (let i = 0; i < 4; i++) {
        const x = canvas.width - 10 + (goalWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, goalTop);
        ctx.lineTo(x, goalBottom);
        ctx.stroke();
    }
    
    // Poziome linie siatki
    for (let i = 0; i <= 3; i++) {
        const y = goalTop + (goalHeight / 3) * i;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 10, y);
        ctx.lineTo(canvas.width - 10 + goalWidth, y);
        ctx.stroke();
    }
    
    // Słupki prawej bramki
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8 * scale;
    
    // Cień słupków
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 12, goalTop + 2);
    ctx.lineTo(canvas.width - 12, goalBottom + 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10 - 2, goalTop - 2);
    ctx.lineTo(canvas.width - 10 + goalWidth - 2, goalTop - 2);
    ctx.stroke();
    
    // Białe słupki
    ctx.strokeStyle = '#ffffff';
    
    // Prawy słupek (linia bramki)
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, goalTop);
    ctx.lineTo(canvas.width - 10, goalBottom);
    ctx.stroke();
    
    // Poprzeczka
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, goalTop);
    ctx.lineTo(canvas.width - 10 + goalWidth, goalTop);
    ctx.stroke();
    
    // Dolna poprzeczka
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, goalBottom);
    ctx.lineTo(canvas.width - 10 + goalWidth, goalBottom);
    ctx.stroke();
    
    // Tylni słupek
    ctx.strokeStyle = '#cccccc';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10 + goalWidth, goalTop);
    ctx.lineTo(canvas.width - 10 + goalWidth, goalBottom);
    ctx.stroke();
    
    // ============ POLA BRAMKOWE I KARNE ============
ctx.strokeStyle = 'white';
ctx.lineWidth = 2 * scale;
ctx.lineCap = 'butt';

const boxWidth = canvas.width * 0.05;
const boxHeight = canvas.height * 0.2;
const boxTop = canvas.height * 0.5 - boxHeight/2;

ctx.strokeRect(10, boxTop, boxWidth, boxHeight);
ctx.strokeRect(canvas.width - 10 - boxWidth, boxTop, boxWidth, boxHeight);

// Pola karne
const penaltyWidth = canvas.width * 0.1;
const penaltyHeight = canvas.height * 0.5;
const penaltyTop = canvas.height * 0.5 - penaltyHeight/2;

ctx.strokeRect(10, penaltyTop, penaltyWidth, penaltyHeight);
ctx.strokeRect(canvas.width - 10 - penaltyWidth, penaltyTop, penaltyWidth, penaltyHeight);

// Punkty karne
ctx.fillStyle = 'white';
const penaltyRadius = 4;

ctx.beginPath();
ctx.arc(canvas.width * 0.0875, canvas.height / 2, penaltyRadius, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.arc(canvas.width * 0.9125, canvas.height / 2, penaltyRadius, 0, Math.PI * 2);
ctx.fill();

// Obramowanie punktów karnych
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.arc(canvas.width * 0.0875, canvas.height / 2, penaltyRadius, 0, Math.PI * 2);
ctx.stroke();

ctx.beginPath();
ctx.arc(canvas.width * 0.9125, canvas.height / 2, penaltyRadius, 0, Math.PI * 2);
ctx.stroke();

    }
    
function drawAutumnField() {
    // Jesienne boisko - brązowo-pomarańczowe
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#D2691E');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Spadające liście
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    const time = Date.now() * 0.0005;
    ctx.fillStyle = 'rgba(255, 140, 0, 0.6)';
    for(let i = 0; i < 15; i++) {
        const x = (i * 50 + Math.sin(time + i) * 20) % canvas.width;
        const y = (i * 30 + time * 30) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawStandardFieldLines();
}

function drawDesertField() {
    // Pustynne boisko
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#EDC9AF');
    gradient.addColorStop(0.5, '#F5DEB3');
    gradient.addColorStop(1, '#D2B48C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Wydmy
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    ctx.fillStyle = 'rgba(222, 184, 135, 0.5)';
    [[200,100,80,30], [500,250,100,35], [650,150,70,25]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w * scale, h * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawBeachField() {
    // Plażowe boisko
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#F4E4C1');
    gradient.addColorStop(0.7, '#E6D7B0');
    gradient.addColorStop(1, '#D4C5A0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Fale na brzegu
    ctx.strokeStyle = 'rgba(70, 130, 180, 0.3)';
    ctx.lineWidth = 3;
    for(let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 50 + i * 30);
        ctx.quadraticCurveTo(canvas.width/2, 80 + i * 30, canvas.width, 50 + i * 30);
        ctx.stroke();
    }
    
    drawStandardFieldLines();
}

function drawForestField() {
    // Leśne boisko
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#2D5016');
    gradient.addColorStop(0.5, '#1F3A0F');
    gradient.addColorStop(1, '#152608');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cienie drzew
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    [[100,80,40,60], [700,120,35,50], [300,300,45,70], [600,280,38,55]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w * scale, h * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawClayField() {
    // Boisko z gliny
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#B87333');
    gradient.addColorStop(0.5, '#A0633D');
    gradient.addColorStop(1, '#8B5A3C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tekstura gliny
    ctx.fillStyle = 'rgba(160, 82, 45, 0.2)';
    for(let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
    
    drawStandardFieldLines();
}

function drawRubberField() {
    // Gumowe boisko (orlik)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#DC143C');
    gradient.addColorStop(0.5, '#B22222');
    gradient.addColorStop(1, '#8B0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tekstura gumy
    ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
    for(let i = 0; i < canvas.width; i += 50) {
        ctx.fillRect(i, 0, 25, canvas.height);
    }
    
    drawStandardFieldLines();
}

function drawConcreteField() {
    // Betonowe boisko
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#A9A9A9');
    gradient.addColorStop(0.5, '#808080');
    gradient.addColorStop(1, '#696969');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pęknięcia w betonie
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.6)';
    ctx.lineWidth = 2;
    [[150,100,300,120], [500,200,650,250], [200,300,250,350]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });
    
    drawStandardFieldLines();
}

function drawParquetField() {
    // Parkiet (hala)
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Wzór parkietu
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
    ctx.lineWidth = 1 * scale;
    for(let i = 0; i < canvas.width; i += 40 * scale) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    drawStandardFieldLines();
}

function drawNightField() {
    // Nocne boisko z reflektorami
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#1a4d1a');
    gradient.addColorStop(0.7, '#0d260d');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Światło reflektorów
    const time = Date.now() * 0.001;
    ctx.fillStyle = `rgba(255, 255, 200, ${0.15 + Math.sin(time) * 0.05})`;
    ctx.beginPath();
    ctx.arc(canvas.width/4, 0, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3*canvas.width/4, 0, 150, 0, Math.PI * 2);
    ctx.fill();
    
    drawStandardFieldLines();
}

function drawRainField() {
    // Deszczowe boisko
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#2F5F2F');
    gradient.addColorStop(0.5, '#1F4F1F');
    gradient.addColorStop(1, '#0F3F0F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Krople deszczu
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    const time = Date.now() * 0.01;
    ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
    ctx.lineWidth = 1 * scale;
    for(let i = 0; i < 30; i++) {
        const x = (i * 25 + time * 2) % canvas.width;
        const y = (i * 13 + time * 5) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 10 * scale);
        ctx.stroke();
    }
    
    // Kałuże
    ctx.fillStyle = 'rgba(100, 149, 237, 0.3)';
    [[200,150,30,20], [500,250,35,25], [350,320,25,18]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w * scale, h * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawRetroField() {
    // Retro boisko (lata 80)
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Retro paski
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    for(let i = 0; i < canvas.height; i += 30) {
        ctx.fillRect(0, i, canvas.width, 15);
    }
    
    // Kropki
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    for(let i = 0; i < canvas.width; i += 50) {
        for(let j = 0; j < canvas.height; j += 50) {
            ctx.beginPath();
            ctx.arc(i, j, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawStandardFieldLines();
}

function drawNeonField() {
    // Neonowe boisko futurystyczne
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Neonowa siatka
    const time = Date.now() * 0.001;
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(time) * 0.3})`;
    ctx.lineWidth = 2;
    for(let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for(let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Świecące okręgi
    ctx.strokeStyle = `rgba(255, 0, 255, ${0.6 + Math.sin(time * 2) * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 100, 0, Math.PI * 2);
    ctx.stroke();
    
    drawStandardFieldLines();
}

function drawCampNouField() {
    // Camp Nou - legendarny stadion FC Barcelona
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Gradient w kolorach Barcelony (blaugrana)
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#1a7a3e');
    gradient.addColorStop(0.5, '#228B22');
    gradient.addColorStop(1, '#0d5c29');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Charakterystyczne paski Camp Nou
    ctx.fillStyle = 'rgba(26, 122, 62, 0.4)';
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.fillRect(i, 0, 30, canvas.height);
    }
    
    // Dodatkowy wzór - paski pod kątem (efekt koszenia)
    ctx.fillStyle = 'rgba(13, 92, 41, 0.2)';
    for (let i = 0; i < canvas.width; i += 120) {
        ctx.fillRect(i, 0, 60, canvas.height);
    }
    
    // Akcenty w kolorach Barcelony (blaugrana)
    const time = Date.now() * 0.001;
    
    // Niebieski akcent (lewy narożnik)
    ctx.fillStyle = `rgba(0, 51, 160, ${0.05 + Math.sin(time) * 0.02})`;
    ctx.beginPath();
    ctx.arc(100 * scale, 100 * scale, 80 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Czerwony akcent (prawy narożnik)
    ctx.fillStyle = `rgba(164, 0, 0, ${0.05 + Math.sin(time + 1) * 0.02})`;
    ctx.beginPath();
    ctx.arc((canvas.width - 100) * scale, (canvas.height - 100) * scale, 80 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Światła stadionu (4 reflektory w narożnikach)
    ctx.fillStyle = `rgba(255, 255, 220, ${0.08 + Math.sin(time * 0.5) * 0.03})`;
    [[100, 50], [canvas.width - 100, 50], [100, canvas.height - 50], [canvas.width - 100, canvas.height - 50]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 60 * scale, 0, Math.PI * 2);
        ctx.fill();
    });
    
   
    drawStandardFieldLines();
}  // <-- KONIEC - to jest ostatnia rzecz w pliku field.js
function drawStormField() {
    // Burzowe boisko
    const currentTeamData = gameMode === 'tournament' ? teams[gameState.currentRound] : teams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Ciemne, burzowe niebo
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#2a3a2a');
    gradient.addColorStop(0.5, '#1a2a1a');
    gradient.addColorStop(1, '#0a1a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const time = Date.now() * 0.001;
    
    // Błyskawice (losowe)
    if (Math.random() < 0.02) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`;
        ctx.lineWidth = 3;
        const startX = Math.random() * canvas.width;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX + (Math.random() - 0.5) * 100, canvas.height / 3);
        ctx.lineTo(startX + (Math.random() - 0.5) * 100, canvas.height / 2);
        ctx.lineTo(startX + (Math.random() - 0.5) * 100, canvas.height);
        ctx.stroke();
    }
    
    // Deszcz (gęsty)
    ctx.strokeStyle = 'rgba(180, 200, 220, 0.4)';
    ctx.lineWidth = 1;
    for(let i = 0; i < 50; i++) {
        const x = (i * 16 + time * 100) % canvas.width;
        const y = (i * 8 + time * 150) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 15 * scale);
        ctx.stroke();
    }
    
    // Kałuże i błoto
    ctx.fillStyle = 'rgba(60, 80, 100, 0.5)';
    [[150,120,50,30], [400,180,60,35], [600,280,55,32], [250,320,45,28], [500,100,40,25]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w * scale, h * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Ciemne chmury (efekt)
    ctx.fillStyle = `rgba(40, 50, 60, ${0.3 + Math.sin(time * 0.5) * 0.1})`;
    [[200, 80, 120], [500, 60, 140], [650, 100, 110]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r * scale, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Błysk światła (okresowy)
    if (Math.sin(time * 2) > 0.95) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    drawStandardFieldLines();
}
