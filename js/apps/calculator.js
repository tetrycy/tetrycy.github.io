// Kalkulator Windows 98 - Logika obliczeń
class Calculator {
    constructor() {
        this.display = null;
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.memory = 0;
        
        this.init();
    }
    
    init() {
        // Poczekaj na załadowanie DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.setupCalculator();
        });
        
        // Jeśli DOM już załadowany
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCalculator();
            });
        } else {
            this.setupCalculator();
        }
    }
    
    setupCalculator() {
        this.display = document.getElementById('calc-display');
        
        if (!this.display) {
            // Spróbuj ponownie za chwilę
            setTimeout(() => this.setupCalculator(), 100);
            return;
        }
        
        // Dodaj event listenery do przycisków
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('calc-btn')) {
                this.handleButtonClick(e.target);
            }
        });
        
        // Obsługa klawiatury
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    handleButtonClick(button) {
        const action = button.getAttribute('data-action');
        const value = button.getAttribute('data-value');
        
        if (value) {
            // Przyciski cyfr
            this.inputNumber(value);
        } else if (action) {
            switch(action) {
                case 'clear':
                    this.clear();
                    break;
                case 'ce':
                    this.clearEntry();
                    break;
                case 'backspace':
                    this.backspace();
                    break;
                case 'decimal':
                    this.inputDecimal();
                    break;
                case 'add':
                case 'subtract':
                case 'multiply':
                case 'divide':
                    this.inputOperation(action);
                    break;
                case 'equals':
                    this.calculate();
                    break;
                case 'mc':
                    this.memoryClear();
                    break;
                case 'mr':
                    this.memoryRecall();
                    break;
                case 'ms':
                    this.memoryStore();
                    break;
                case 'm+':
                    this.memoryAdd();
                    break;
            }
        }
        
        this.updateDisplay();
    }
    
    inputNumber(num) {
        if (this.waitingForNewValue) {
            this.currentValue = num;
            this.waitingForNewValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
    }
    
    inputDecimal() {
        if (this.waitingForNewValue) {
            this.currentValue = '0.';
            this.waitingForNewValue = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
    }
    
    inputOperation(nextOperation) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const newValue = this.performCalculation();
            
            this.currentValue = String(newValue);
            this.previousValue = newValue;
        }
        
        this.waitingForNewValue = true;
        this.operation = nextOperation;
    }
    
    performCalculation() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        
        if (isNaN(prev) || isNaN(current)) return current;
        
        switch(this.operation) {
            case 'add':
                return prev + current;
            case 'subtract':
                return prev - current;
            case 'multiply':
                return prev * current;
            case 'divide':
                return current !== 0 ? prev / current : 0;
            default:
                return current;
        }
    }
    
    calculate() {
        if (this.operation && this.previousValue !== null) {
            const newValue = this.performCalculation();
            this.currentValue = String(newValue);
            this.operation = null;
            this.previousValue = null;
            this.waitingForNewValue = true;
        }
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
    }
    
    clearEntry() {
        this.currentValue = '0';
        this.waitingForNewValue = false;
    }
    
    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
    }
    
    memoryClear() {
        this.memory = 0;
    }
    
    memoryRecall() {
        this.currentValue = String(this.memory);
        this.waitingForNewValue = true;
    }
    
    memoryStore() {
        this.memory = parseFloat(this.currentValue);
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
    }
    
    updateDisplay() {
        if (this.display) {
            // Ogranicz liczbę cyfr na wyświetlaczu
            let displayValue = this.currentValue;
            if (displayValue.length > 12) {
                const num = parseFloat(displayValue);
                displayValue = num.toExponential(6);
            }
            this.display.value = displayValue;
        }
    }
    
    handleKeyboard(e) {
        // Sprawdź czy kalkulator jest aktywny (okno w fokusie)
        const calcWindow = document.getElementById('calculator-window');
        if (!calcWindow || !calcWindow.classList.contains('active')) {
            return;
        }
        
        e.preventDefault();
        
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else {
            switch(key) {
                case '.':
                case ',':
                    this.inputDecimal();
                    break;
                case '+':
                    this.inputOperation('add');
                    break;
                case '-':
                    this.inputOperation('subtract');
                    break;
                case '*':
                    this.inputOperation('multiply');
                    break;
                case '/':
                    this.inputOperation('divide');
                    break;
                case 'Enter':
                case '=':
                    this.calculate();
                    break;
                case 'Escape':
                case 'c':
                case 'C':
                    this.clear();
                    break;
                case 'Backspace':
                    this.backspace();
                    break;
            }
        }
        
        this.updateDisplay();
    }
}

// Inicjalizuj kalkulator
const calculator = new Calculator();
