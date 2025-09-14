// Paint Windows 98 - Funkcjonalność rysowania
let paintCanvas = null;
let paintCtx = null;
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#000000';
let lastX = 0;
let lastY = 0;

function initPaint() {
    paintCanvas = document.getElementById('paint-canvas');
    
    if (!paintCanvas) {
        setTimeout(initPaint, 100);
        return;
    }
    
    paintCtx = paintCanvas.getContext('2d');
    
    // Usuń stare event listenery
    const oldCanvas = paintCanvas.cloneNode(true);
    paintCanvas.parentNode.replaceChild(oldCanvas, paintCanvas);
    paintCanvas = oldCanvas;
    paintCtx = paintCanvas.getContext('2d');
    
    // Ustawienia canvas
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    paintCtx.lineWidth = 2;
    paintCtx.strokeStyle = currentColor;
    
    // Event listenery dla canvas
    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', stopDrawing);
    paintCanvas.addEventListener('mouseout', stopDrawing);
    
    // Event listenery dla narzędzi
    document.addEventListener('click', handlePaintClick);
}

function handlePaintClick(e) {
    // Narzędzia
    if (e.target.classList.contains('paint-tool')) {
        document.querySelectorAll('.paint-tool').forEach(tool => {
            tool.classList.remove('active');
        });
        e.target.classList.add('active');
        currentTool = e.target.getAttribute('data-tool');
        
        // Zmień kursor w zależności od narzędzia
        if (currentTool === 'eraser') {
            paintCanvas.style.cursor = 'grab';
        } else {
            paintCanvas.style.cursor = 'crosshair';
        }
    }
    
    // Kolory
    if (e.target.classList.contains('color-box')) {
        document.querySelectorAll('.color-box').forEach(color => {
            color.classList.remove('active');
        });
        e.target.classList.add('active');
        currentColor = e.target.getAttribute('data-color');
        
        if (currentTool !== 'eraser') {
            paintCtx.strokeStyle = currentColor;
        }
    }
}

function startDrawing(e) {
    isDrawing = true;
    const rect = paintCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = paintCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    paintCtx.beginPath();
    
    if (currentTool === 'eraser') {
        paintCtx.globalCompositeOperation = 'destination-out';
        paintCtx.lineWidth = 10;
    } else {
        paintCtx.globalCompositeOperation = 'source-over';
        paintCtx.strokeStyle = currentColor;
        
        if (currentTool === 'pencil') {
            paintCtx.lineWidth = 1;
        } else if (currentTool === 'brush') {
            paintCtx.lineWidth = 3;
        }
    }
    
    paintCtx.moveTo(lastX, lastY);
    paintCtx.lineTo(currentX, currentY);
    paintCtx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    isDrawing = false;
}

// Inicjalizuj Paint
setTimeout(initPaint, 200);
