// field.js - funkcje rysowania różnych boisk
function drawField() {
    const currentTeamData = gameMode === '1v1' ? oneVsOneTeams[selectedTeam] : bundesligaTeams[selectedTeam];
    
    switch(currentTeamData.field) {
        case 'simple':
            drawSimpleField();
            break;
        case 'light_grass':
            drawLightGrassField();
            break;
        case 'dark_grass':
            drawDarkGrassField();
            break;
        case 'striped_grass':
            drawStripedGrassField();
            break;
        case 'dotted_grass':
            drawDottedGrassField();
            break;
        case 'penalty_box':
            drawPenaltyBoxField();
            break;
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
    }
}

function drawSimpleField() {
    // Proste zielone tło - bez gradientów, bez efektów
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tylko standardowe linie boiska
    drawStandardFieldLines();
}

function drawLightGrassField() {
    // Jasna zieleń dla SZYBKIEGO MARIO
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Subtelne światełka na boisku
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 8; i++) {
        const x = (i * 100) + 50;
        const y = 100 + (i % 2) * 200;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawStandardFieldLines();
}

function drawDarkGrassField() {
    // Ciemna zieleń dla BRUTALNEGO BORISA
    ctx.fillStyle = '#1F4F1F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ciemne plamy na boisku
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    const spots = [{x:150,y:120,r:25}, {x:400,y:80,r:20}, {x:650,y:300,r:30}, {x:300,y:320,r:22}];
    spots.forEach(spot => {
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawStandardFieldLines();
}

function drawStripedGrassField() {
    // Pasiaste boisko dla WSZECHSTRONNEGO WERNERA
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pionowe paski
    ctx.fillStyle = '#1F7A1F';
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.fillRect(i, 0, 30, canvas.height);
    }
    
    drawStandardFieldLines();
}

function drawDottedGrassField() {
    // Kropkowane boisko dla PRECYZYJNEGO PAVLA
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Regularne kropki
    ctx.fillStyle = '#32CD32';
    for (let x = 40; x < canvas.width; x += 40) {
        for (let y = 40; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawStandardFieldLines();
}

function drawPenaltyBoxField() {
    // Specjalne boisko z wyraźnym polem karnym dla BRAMKARZA GUSTAVA
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Podkreśl pole karne po prawej stronie
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    const penaltyBoxWidth = 80;
    const penaltyBoxHeight = canvas.height * 0.5;
    const penaltyBoxTop = canvas.height * 0.25;
    ctx.fillRect(canvas.width - 10 - penaltyBoxWidth, penaltyBoxTop, penaltyBoxWidth, penaltyBoxHeight);
    
    drawStandardFieldLines();
}

function drawSandyField() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === '1v1' ? oneVsOneTeams[selectedTeam] : bundesligaTeams[selectedTeam];
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

function drawWinterField() {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = gameMode === '1v1' ? oneVsOneTeams[selectedTeam] : bundesligaTeams[selectedTeam];
    const scale = currentTeamData.fieldScale || 1.0;
    
    // Zimowe boisko
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 400);
    gradient.addColorStop(0, '#f8f8ff');
    gradient.addColorStop(0.7, '#e6f3ff');
    gradient.addColorStop(1, '#d0e8ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Płatki śniegu - SKALOWANE
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for(let i = 0; i < 20; i++) {
        const x = (i * 37 + Math.sin(time + i) * 10) % canvas.width;
        const y = (i * 23 + time * 10) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, (2 + Math.sin(time + i)) * scale, 0, Math.PI * 2); // SKALOWANE
        ctx.fill();
    }
    
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
    const currentTeamData = gameMode === '1v1' ? oneVsOneTeams[selectedTeam] : bundesligaTeams[selectedTeam];
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
    // Wyraźniejsze bramki - skalowane
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10 * scale;
    
    const goalHeight = canvas.height * 0.3 * scale;
    const goalTop = canvas.height * 0.5 - goalHeight/2;
    const goalBottom = canvas.height * 0.5 + goalHeight/2;
    
    // Lewa bramka
    ctx.beginPath();
    ctx.moveTo(10, goalTop);
    ctx.lineTo(10, goalBottom);
    ctx.stroke();
    
    // Prawa bramka
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, goalTop);
    ctx.lineTo(canvas.width - 10, goalBottom);
    ctx.stroke();
    
    // Pola bramkowe - skalowane
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2 * scale;
    const boxWidth = 40 * scale;
    const boxHeight = canvas.height * 0.2 * scale;
    const boxTop = canvas.height * 0.5 - boxHeight/2;
    
    ctx.strokeRect(10, boxTop, boxWidth, boxHeight);
    ctx.strokeRect(canvas.width - 10 - boxWidth, boxTop, boxWidth, boxHeight);

    // Pola karne - skalowane
    const penaltyWidth = 80 * scale;
    const penaltyHeight = canvas.height * 0.5 * scale;
    const penaltyTop = canvas.height * 0.5 - penaltyHeight/2;
    
    ctx.strokeRect(10, penaltyTop, penaltyWidth, penaltyHeight);
    ctx.strokeRect(canvas.width - 10 - penaltyWidth, penaltyTop, penaltyWidth, penaltyHeight);

    // Punkty karne - skalowane
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(70 * scale, canvas.height / 2, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(canvas.width - 70 * scale, canvas.height / 2, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
}
