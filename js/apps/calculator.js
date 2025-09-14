// Prosty kalkulator Windows 98
let calcDisplay = null;
let currentInput = '0';
let previousInput = null;
let operation = null;
let shouldResetDisplay = false;
let memory = 0;

// Inicjalizacja kalkulatora
function initCalculator() {
    calcDisplay = document.getElementById('calc-display');
    
    if (!calcDisplay) {
        setTimeout(initCalculator, 100);
        return;
    }
    
    // Usuń stare event listenery jeśli istnieją
    const oldButtons = document.querySelectorAll('.calc-btn');
    oldButtons.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Dodaj nowe event listenery
    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('click', handleCalculatorClick);
    });
    
    updateDisplay();
}

function handleCalculatorClick(e) {
    const button = e.target;
    const action = button.getAttribute('data-action');
    const value = button.getAttribute('data-value');
    
    if (value) {
        inputNumber(value);
    } else if (action) {
        switch(action) {
            case 'clear':
                clearAll();
                break;
            case 'ce':
                clearEntry();
                break;
            case 'backspace':
                backspace();
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'add':
                setOperation('+');
                break;
            case 'subtract':
                setOperation('-');
                break;
            case 'multiply':
                setOperation('*');
                break;
            case 'divide':
                setOperation('/');
                break;
            case 'equals':
                calculate();
                break;
            case 'mc':
                memory = 0;
                break;
            case 'mr':
                currentInput = memory.toString();
                shouldResetDisplay = true;
                break;
            case 'ms':
                memory = parseFloat(currentInput);
                break;
            case 'm+':
                memory += parseFloat(currentInput);
                break;
        }
    }
    
    updateDisplay();
}

function inputNumber(num) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0') {
        currentInput = num;
    } else {
        currentInput += num;
    }
}

function inputDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (currentInput.indexOf('.') === -1) {
        currentInput += '.';
    }
}

function setOperation(op) {
    if (previousInput !== null && operation !== null && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = parseFloat(currentInput);
    operation = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (operation === null || previousInput === null) {
        return;
    }
    
    const current = parseFloat(currentInput);
    let result;
    
    switch(operation) {
        case '+':
            result = previousInput + current;
            break;
        case '-':
            result = previousInput - current;
            break;
        case '*':
            result = previousInput * current;
            break;
        case '/':
            result = current !== 0 ? previousInput / current : 0;
            break;
        default:
            return;
    }
    
    currentInput = result.toString();
    operation = null;
    previousInput = null;
    shouldResetDisplay = true;
}

function clearAll() {
    currentInput = '0';
    previousInput = null;
    operation = null;
    shouldResetDisplay = false;
}

function clearEntry() {
    currentInput = '0';
}

function backspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
}

function updateDisplay() {
    if (calcDisplay) {
        let displayValue = currentInput;
        
        // Ogranicz wyświetlanie do 12 znaków
        if (displayValue.length > 12) {
            const num = parseFloat(displayValue);
            displayValue = num.toExponential(6);
        }
        
        calcDisplay.value = displayValue;
    }
}

// Uruchom kalkulator
setTimeout(initCalculator, 200);
