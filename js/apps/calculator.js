OS.registerApp({
    id: 'calculator',
    title: 'Calculator',
    icon: '🧮',
    description: 'Basic calculator',
    category: 'utilities',
    
    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        state.expression = '';
        
        const root = document.createElement('div');
        root.className = 'calc-container';
        
        root.innerHTML = `
            <div class="calc-screen" id="${pid}_screen">0</div>
            <div class="calc-grid">
                <button class="calc-btn clear" data-val="C">C</button>
                <button class="calc-btn" data-val="/">÷</button>
                <button class="calc-btn" data-val="*">×</button>
                <button class="calc-btn" data-val="-">−</button>
                
                <button class="calc-btn" data-val="7">7</button>
                <button class="calc-btn" data-val="8">8</button>
                <button class="calc-btn" data-val="9">9</button>
                <button class="calc-btn operator" data-val="+">+</button>
                
                <button class="calc-btn" data-val="4">4</button>
                <button class="calc-btn" data-val="5">5</button>
                <button class="calc-btn" data-val="6">6</button>
                <button class="calc-btn equals" data-val="=">=</button>
                
                <button class="calc-btn" data-val="1">1</button>
                <button class="calc-btn" data-val="2">2</button>
                <button class="calc-btn" data-val="3">3</button>
                <button class="calc-btn" data-val=".">.</button>
                
                <button class="calc-btn" data-val="0" style="grid-column: span 2;">0</button>
            </div>
        `;
        
        container.appendChild(root);
        
        const screen = document.getElementById(`${pid}_screen`);
        const buttons = root.querySelectorAll('[data-val]');
        
        buttons.forEach(btn => {
            btn.onclick = () => {
                const val = btn.dataset.val;
                
                if (val === 'C') {
                    state.expression = '';
                    screen.textContent = '0';
                } else if (val === '=') {
                    try {
                        if (!state.expression) return;
                        const result = eval(state.expression);
                        state.expression = String(result);
                        screen.textContent = result;
                    } catch {
                        screen.textContent = 'Error';
                        setTimeout(() => { screen.textContent = '0'; state.expression = ''; }, 1500);
                    }
                } else {
                    state.expression += val;
                    screen.textContent = state.expression;
                }
            };
        });
        
        // Keyboard support
        container.onkeydown = (e) => {
            const key = e.key;
            if (/[0-9.+\-*/]/.test(key)) {
                state.expression += key;
                screen.textContent = state.expression;
            } else if (key === 'Enter') {
                buttons.forEach(btn => {
                    if (btn.dataset.val === '=') btn.click();
                });
            } else if (key === 'Escape') {
                buttons.forEach(btn => {
                    if (btn.dataset.val === 'C') btn.click();
                });
            } else if (key === 'Backspace') {
                state.expression = state.expression.slice(0, -1);
                screen.textContent = state.expression || '0';
            }
        };
    },
    
    cleanup(pid, state) {}
});