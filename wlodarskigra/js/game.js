function drawPlayer(playerObj, name, isBot = false) {
    // Pobierz skalę dla obecnego boiska
    const currentTeamData = getCurrentTeamData();
    const fieldScale = currentTeamData ? (currentTeamData.fieldScale || 1.0) : 1.0;
    
    // NOWE: Uwzględnij rozmiar bota
    const botSizeMultiplier = isBot && playerObj.sizeMultiplier ? playerObj.sizeMultiplier : 1.0;
    const combinedScale = fieldScale * botSizeMultiplier;
    
    const drawX = playerObj.x;
    const drawY = playerObj.y;

    // Skalowany promień gracza (boisko + rozmiar bota)
    const scaledRadius = playerObj.radius * combinedScale;

    // Cień gracza
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(drawX + 4, drawY + 4, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Koszulka
    ctx.fillStyle = playerObj.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Paski na koszulce - skalowane
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2 * combinedScale;
    const stripeSpacing = 8 * combinedScale;
    const stripeLength = 15 * combinedScale;
    for(let i = -stripeLength; i <= stripeLength; i += stripeSpacing) {
        ctx.beginPath();
        ctx.moveTo(drawX + i, drawY - stripeLength);
        ctx.lineTo(drawX + i, drawY + stripeLength);
        ctx.stroke();
    }

    // Ręce - skalowane
    ctx.fillStyle = '#ffdbac';
    const armDistance = 12 * combinedScale;
    const armRadius = 4 * combinedScale;
    const armHeight = 8 * combinedScale;
    ctx.beginPath();
    ctx.arc(drawX - armDistance, drawY - armHeight, armRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(drawX + armDistance, drawY - armHeight, armRadius, 0, Math.PI * 2);
    ctx.fill();

    // Nogi - skalowane
    ctx.fillStyle = playerObj.color;
    const legDistance = 6 * combinedScale;
    const legRadius = 5 * combinedScale;
    const legHeight = 15 * combinedScale;
    ctx.beginPath();
    ctx.arc(drawX - legDistance, drawY + legHeight, legRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(drawX + legDistance, drawY + legHeight, legRadius, 0, Math.PI * 2);
    ctx.fill();

    // Buty - skalowane
    ctx.fillStyle = '#000000';
    const shoeRadius = 3 * combinedScale;
    const shoeHeight = 18 * combinedScale;
    ctx.beginPath();
    ctx.arc(drawX - legDistance, drawY + shoeHeight, shoeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(drawX + legDistance, drawY + shoeHeight, shoeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Głowa - skalowana
    ctx.fillStyle = '#ffdbac';
    const headRadius = 8 * combinedScale;
    const headHeight = 12 * combinedScale;
    ctx.beginPath();
    ctx.arc(drawX, drawY - headHeight, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Włosy - skalowane
    ctx.fillStyle = isBot ? '#8B4513' : '#FFD700';
    const hairRadius = 6 * combinedScale;
    const hairHeight = 16 * combinedScale;
    ctx.beginPath();
    ctx.arc(drawX, drawY - hairHeight, hairRadius, 0, Math.PI);
    ctx.fill();

    // Numer na koszulce - skalowany
    ctx.fillStyle = 'white';
    ctx.font = `bold ${14 * combinedScale}px Orbitron`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3 * combinedScale;
    const number = playerObj.number.toString();
    ctx.strokeText(number, drawX, drawY + 4 * combinedScale);
    ctx.fillText(number, drawX, drawY + 4 * combinedScale);

    // Nazwa gracza - skalowana
    const nameY = drawY + scaledRadius + 25 * combinedScale;
    const nameWidth = 70 * combinedScale;
    const nameHeight = 12 * combinedScale;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(drawX - nameWidth/2, nameY - nameHeight/2, nameWidth, nameHeight);
    
    ctx.strokeStyle = isBot ? playerObj.color : '#ff0000';
    ctx.lineWidth = 2 * combinedScale;
    ctx.strokeRect(drawX - nameWidth/2, nameY - nameHeight/2, nameWidth, nameHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${8 * combinedScale}px Orbitron`;
    ctx.fillText(name, drawX, nameY + 2 * combinedScale);

    // NOWY: Wskaźnik specjalnych umiejętności
    if (isBot && (playerObj.pressureBall || playerObj.shootPower > 1.5 || playerObj.sizeMultiplier !== 1.0)) {
        // Rysuj małą ikonę specjalnych umiejętności
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(drawX + scaledRadius * 0.7, drawY - scaledRadius * 0.7, 3 * combinedScale, 0, Math.PI * 2);
        ctx.fill();
    }
}
