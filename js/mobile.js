/* Minimal Mobile CSS - tylko pełnoekranowe aplikacje */
/* Dodaj do css/mobile.css */

@media (max-width: 768px) {
    /* Mobilny tryb pełnoekranowy TYLKO dla aplikacji */
    .window.mobile-fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2000 !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
    }
    
    .window.mobile-fullscreen .window-header {
        height: 44px !important;
        padding: 8px 12px !important;
        background: linear-gradient(90deg, #0066cc 0%, #004499 100%);
        touch-action: none;
    }
    
    .window.mobile-fullscreen .window-title {
        font-size: 16px !important;
        font-weight: bold;
    }
    
    .window.mobile-fullscreen .window-controls {
        gap: 8px;
    }
    
    .window.mobile-fullscreen .window-btn {
        width: 36px !important;
        height: 36px !important;
        font-size: 18px !important;
        border-radius: 4px;
        touch-action: manipulation;
    }
    
    .window.mobile-fullscreen .window-content {
        height: calc(100vh - 44px) !important;
        padding: 12px !important;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    /* Ukryj niepotrzebne przyciski na telefonie */
    .window.mobile-fullscreen .window-btn.minimize,
    .window.mobile-fullscreen .window-btn.maximize {
        display: none !important;
    }
    
    /* Paint na telefonie */
    .window.mobile-fullscreen.paint-mobile .paint-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
    }
    
    .window.mobile-fullscreen.paint-mobile .paint-tool {
        width: 44px;
        height: 44px;
        font-size: 20px;
        border: 2px outset #c0c0c0;
        background: #c0c0c0;
        touch-action: manipulation;
    }
    
    .window.mobile-fullscreen.paint-mobile .paint-colors {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 12px;
    }
    
    .window.mobile-fullscreen.paint-mobile .color-box {
        width: 32px;
        height: 32px;
        border: 2px inset #c0c0c0;
        touch-action: manipulation;
    }
    
    .window.mobile-fullscreen.paint-mobile #paint-canvas {
        width: 100% !important;
        height: calc(100% - 120px) !important;
        border: 2px inset #c0c0c0;
        touch-action: none;
    }
    
    /* Kalkulator na telefonie */
    .window.mobile-fullscreen.calculator-mobile .calculator {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .window.mobile-fullscreen.calculator-mobile .calculator-display {
        margin-bottom: 16px;
    }
    
    .window.mobile-fullscreen.calculator-mobile #calc-display {
        width: 100%;
        height: 60px;
        font-size: 24px;
        text-align: right;
        padding: 8px 12px;
        border: 2px inset #c0c0c0;
    }
    
    .window.mobile-fullscreen.calculator-mobile .calculator-buttons {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
    }
    
    .window.mobile-fullscreen.calculator-mobile .calc-btn {
        height: 60px;
        font-size: 18px;
        font-weight: bold;
        border: 2px outset #c0c0c0;
        background: #c0c0c0;
        touch-action: manipulation;
    }
    
    .window.mobile-fullscreen.calculator-mobile .calc-btn.zero {
        grid-column: span 2;
    }
    
    /* Saper na telefonie */
    .window.mobile-fullscreen.minesweeper-mobile .minesweeper-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px;
        background: #c0c0c0;
        border: 2px inset #c0c0c0;
    }
    
    .window.mobile-fullscreen.minesweeper-mobile .digit-display {
        font-size: 20px;
        padding: 8px;
        background: #000;
        color: #ff0000;
        border: 2px inset #c0c0c0;
        font-family: 'Courier New', monospace;
    }
    
    .window.mobile-fullscreen.minesweeper-mobile .smiley-btn {
        width: 48px;
        height: 48px;
        font-size: 24px;
        border: 2px outset #c0c0c0;
        background: #c0c0c0;
        touch-action: manipulation;
    }
    
    .window.mobile-fullscreen.minesweeper-mobile .minesweeper-board {
        display: grid;
        gap: 1px;
        background: #808080;
        padding: 2px;
        border: 2px inset #c0c0c0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .window.mobile-fullscreen.minesweeper-mobile .mine-cell {
        width: 32px;
        height: 32px;
        font-size: 14px;
        font-weight: bold;
        border: 2px outset #c0c0c0;
        background: #c0c0c0;
        touch-action: manipulation;
    }
    
    /* Notatnik na telefonie */
    .window.mobile-fullscreen.notepad-mobile #notepad-textarea {
        width: 100%;
        height: calc(100% - 20px);
        font-size: 16px;
        padding: 12px;
        border: 2px inset #c0c0c0;
        background: #ffffff;
        resize: none;
        outline: none;
    }
    
    /* Pasjans na telefonie */
    .window.mobile-fullscreen.solitaire-mobile .solitaire-board {
        transform: scale(0.8);
        transform-origin: top left;
        width: 125%;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
}
