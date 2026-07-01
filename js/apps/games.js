OS.registerApp({
    id: 'games',
    title: 'Games',
    icon: '🕹️',
    description: 'Classic mini-games for fun and quick breaks',
    category: 'entertainment',
    singleInstance: true,

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#12131b;color:#fff;padding:18px;overflow:auto;font-family:sans-serif;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = '<h2 style="margin:0;font-size:1.2rem;">Games</h2><span style="color:#8a8a8a;font-size:0.9rem;">Choose a classic game below.</span>';

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;';

        const games = [
            { id: 'tic-tac-toe', title: 'Tic Tac Toe', icon: '⭕', description: 'Play a simple tic tac toe.' },
            { id: 'snake', title: 'Snake', icon: '🐍', description: 'Grow the snake and avoid walls.' },
            { id: 'memory', title: 'Memory', icon: '🧠', description: 'Match pairs of cards.' }
        ];

        games.forEach(item => {
            const card = document.createElement('button');
            card.type = 'button';
            card.style.cssText = 'background:#1d1f28;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;text-align:left;color:#fff;cursor:pointer;transition:transform .15s ease;';
            card.innerHTML = `<div style="font-size:1.7rem;margin-bottom:10px;">${item.icon}</div><strong>${item.title}</strong><div style="color:#999;font-size:0.85rem;margin-top:6px;">${item.description}</div>`;
            card.addEventListener('click', () => {
                OS.launchApp(item.id);
            });
            grid.appendChild(card);
        });

        container.append(header, grid);
    }
});

OS.registerApp({
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    icon: '⭕',
    description: 'Classic tic tac toe game',
    category: 'games',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#111418;color:#fff;padding:18px;display:flex;flex-direction:column;gap:14px;font-family:sans-serif;';

        state.board = state.board || Array(9).fill('');
        state.current = state.current || 'X';
        state.winner = state.winner || null;

        const status = document.createElement('div');
        status.style.cssText = 'font-size:1rem;color:#ccc;';

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;';

        function render() {
            grid.innerHTML = '';

            state.board.forEach((cell, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.style.cssText = 'width:100%;padding:26px;background:#1c1f2b;border:1px solid rgba(255,255,255,0.08);color:#fff;font-size:1.5rem;cursor:pointer;';
                btn.textContent = cell || '';
                btn.disabled = !!cell || !!state.winner;

                btn.addEventListener('click', () => {
                    state.board[idx] = state.current;
                    state.current = state.current === 'X' ? 'O' : 'X';
                    state.winner = checkWinner();
                    render();
                });

                grid.appendChild(btn);
            });

            status.textContent = state.winner ? `${state.winner} wins!` : `Turn: ${state.current}`;
        }

        function checkWinner() {
            const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for (const [a,b,c] of lines) {
                if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                    return state.board[a];
                }
            }
            return state.board.every(Boolean) ? 'Draw' : null;
        }

        const reset = document.createElement('button');
        reset.type = 'button';
        reset.textContent = 'Reset';
        reset.style.cssText = 'padding:10px 16px;border:none;border-radius:12px;background:#3584e4;color:#fff;cursor:pointer;align-self:flex-start;';
        reset.addEventListener('click', () => {
            state.board = Array(9).fill('');
            state.current = 'X';
            state.winner = null;
            render();
        });

        container.append(status, grid, reset);
        render();
    }
});

OS.registerApp({
    id: 'snake',
    title: 'Snake',
    icon: '🐍',
    description: 'Classic snake game',
    category: 'games',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#090b11;color:#fff;padding:20px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
        container.innerHTML = '<div style="text-align:center;max-width:420px;"><h2>Snake Game</h2><p style="color:#999;">Playable version coming soon.</p></div>';
    }
});

OS.registerApp({
    id: 'memory',
    title: 'Memory',
    icon: '🧠',
    description: 'Memory matching game',
    category: 'games',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#10131b;color:#fff;padding:20px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
        container.innerHTML = '<div style="text-align:center;max-width:420px;"><h2>Memory Game</h2><p style="color:#999;">Full game coming soon.</p></div>';
    }
});