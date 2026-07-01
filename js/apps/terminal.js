(function() {
    OS.registerApp({
        id: 'terminal',
        title: 'Terminal',
        icon: '📟',
        description: 'Command line interface',
        category: 'utilities',

        init(pid, bodyId, state) {
            const container = document.getElementById(bodyId);
            if (!container) return;

            state.history = [];
            state.historyIndex = -1;
            state.currentDir = 'documents';
            state.theme = localStorage.getItem('wasos_terminal_theme') || 'dark';
            state.startTime = Date.now();

            // Helper functions
            function getPrompt(dir) {
                return `user@wasos:${dir ? '~/' + dir : '~'}$`;
            }

            function print(text, color) {
                const span = document.createElement('span');
                if (color) span.style.color = color;
                span.innerHTML = text.includes('<') ? text : text;
                output.appendChild(span);
            }

            function setTheme(theme) {
                state.theme = theme;
                localStorage.setItem('wasos_terminal_theme', theme);
                if (theme === 'light') {
                    root.style.background = '#f5f5f5';
                    output.style.color = '#000';
                    promptLabel.style.color = '#2b5e2e';
                    root.querySelector('.term-toolbar').style.background = '#e0e0e0';
                } else {
                    root.style.background = '#0d0d10';
                    output.style.color = '#4ade80';
                    promptLabel.style.color = '#2ec27e';
                    root.querySelector('.term-toolbar').style.background = '#1a1a1e';
                }
            }

            function generateAbout() {
                const now = new Date();
                const uptime = Date.now() - state.startTime;
                let str = `${Math.floor(uptime / 1000)}s`;
                if (uptime > 3600) {
                    const h = Math.floor(uptime / 3600);
                    const m = Math.floor((uptime % 3600) / 60);
                    str = `${h}h ${m}m`;
                }

                return `
<span style="color:#3584e4">================================</span><br>
<span style="color:#3584e4">========== W A S - O S ==========</span><br>
<span style="color:#3584e4">========== Web-Based OS ==========</span><br>
<span style="color:#3584e4">================================</span><br><br>
  <span style='color:#2ec27e'>OS:</span>      Was-Operating System<br>
  <span style='color:#2ec27e'>Host:</span>    Web Browser (${navigator.userAgent.includes('Chrome') ? 'Chromium' : 'JS-Browser'})<br>
  <span style='color:#2ec27e'>Kernel:</span>  JavaScript ES2022<br>
  <span style='color:#2ec27e'>Uptime:</span>  ${str}<br>
  <span style='color:#2ec27e'>Memory:</span>  ${(VFS.getStorageUsed() / 1024).toFixed(2)} KB<br>
  <span style='color:#2ec27e'>Theme:</span>   ${state.theme}<br>
<br>
Copyright © 2024 Was-OS Project
`;
            }

            function execute(cmdRaw) {
                const args = cmdRaw.trim().split(/\s+/).filter(a => a);
                const cmd = args[0]?.toLowerCase();
                const arg1 = args[1];

                switch (cmd) {
                    case 'help':
                        return "Commands:\n  help          Show help\n  ls            List files\n  cd <dir>      Change directory\n  cat <file>    Read file\n  mkdir <name>  Create dir\n  rm <file>     Delete file\n  clear         Clear screen\n  about         System info\n  date          Current time\n  whoami        User info";

                    case 'ls':
                        try {
                            const items = VFS.list(state.currentDir);
                            return items.length ? items.join('\n') : '(empty)';
                        } catch { return 'Error: Directory not found.'; }

                    case 'cd':
                        if (!arg1 || arg1 === '~') { state.currentDir = 'documents'; }
                        else if (arg1 === '..') {
                            const parts = state.currentDir.split('/').filter(Boolean);
                            parts.pop();
                            state.currentDir = parts.join('/') || 'documents';
                        } else {
                            const target = state.currentDir ? `${state.currentDir}/${arg1}` : arg1;
                            if (VFS.exists(target) && VFS.isDirectory(target)) { state.currentDir = target; }
                            else { return `cd: ${arg1}: No such directory`; }
                        }
                        promptLabel.textContent = getPrompt(state.currentDir);
                        return '';

                    case 'cat':
                        if (!arg1) return 'Usage: cat <filename>';
                        const content = VFS.read(`${state.currentDir}/${arg1}`);
                        return content !== null ? content : 'Error: File not found';

                    case 'mkdir':
                        if (!arg1) return 'Usage: mkdir <dirname>';
                        const path = state.currentDir ? `${state.currentDir}/${arg1}` : arg1;
                        if (VFS.exists(path)) return 'Error: Exists';
                        VFS.write(`${path}/.keep`, '');
                        return `Created: ${arg1}`;

                    case 'rm':
                        if (!arg1) return 'Usage: rm <filename>';
                        const rPath = state.currentDir ? `${state.currentDir}/${arg1}` : arg1;
                        if (!VFS.exists(rPath)) return 'Error: Not found';
                        if (VFS.isDirectory(rPath)) return 'Error: Is directory';
                        VFS.delete(rPath);
                        return `Deleted: ${arg1}`;

                    case 'clear': return '[CLEAR]';
                    case 'about': return generateAbout();
                    case 'date': return new Date().toString();
                    case 'whoami': return 'user';
                    default: return `'${cmd}' not recognized. Type 'help'.`;
                }
            }

            // Build UI
            root = document.createElement('div');
            root.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#0d0d10;font-family:"JetBrains Mono",monospace;font-size:0.9rem;overflow:hidden;';

            root.innerHTML = `
<div class="term-toolbar" style="padding:8px;background:#1a1a1e;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">
    <span style="color:#666;font-size:0.75rem;">Was-Shell v4.0</span>
    <div style="display:flex;gap:6px;">
        <button id="${pid}_dark" style="background:#333;color:white;border:none;padding:2px 8px;font-size:0.7rem;border-radius:4px;cursor:pointer;">Dark</button>
        <button id="${pid}_light" style="background:#ddd;color:black;border:none;padding:2px 8px;font-size:0.7rem;border-radius:4px;cursor:pointer;">Light</button>
    </div>
</div>
<div class="term-output" id="${pid}_output" style="flex:1;overflow-y:auto;padding:10px;color:#4ade80;white-space:pre-wrap;"></div>
<div style="padding:5px 10px;display:flex;gap:8px;border-top:1px solid #333;">
    <span class="term-prompt" id="${pid}_prompt" style="color:#2ec27e;font-weight:bold;">user@wasos:~/documents$</span>
    <input type="text" id="${pid}_input" style="flex:1;background:transparent;border:none;color:#fff;outline:none;font-family:inherit;" autocomplete="off">
</div>`;

            container.appendChild(root);
            output = root.querySelector(`#${pid}_output`);
            input = root.querySelector(`#${pid}_input`);
            promptLabel = root.querySelector(`#${pid}_prompt`);

            setTheme(state.theme);
            promptLabel.textContent = getPrompt(state.currentDir);
            print("Was-OS Terminal v4.0\nType 'about' for system info.\nType 'help' for commands.\n\n");

            // Theme buttons
            root.querySelector(`#${pid}_dark`).onclick = () => setTheme('dark');
            root.querySelector(`#${pid}_light`).onclick = () => setTheme('light');

            input.focus();
            container.onclick = () => input.focus();

            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const cmd = input.value.trim();
                    const fullPrompt = getPrompt(state.currentDir);
                    input.value = '';
                    if (!cmd) return;

                    print(`${fullPrompt} ${cmd}\n`, '#4ade80');

                    const resp = execute(cmd);
                    if (resp === '[CLEAR]') output.innerHTML = '';
                    else if (resp) print(resp + '\n');

                    output.scrollTop = output.scrollHeight;
                    state.history.push(cmd);
                    state.historyIndex = state.history.length;
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (state.historyIndex > 0) {
                        state.historyIndex--;
                        input.value = state.history[state.historyIndex];
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (state.historyIndex < state.history.length - 1) {
                        state.historyIndex++;
                        input.value = state.history[state.historyIndex] || '';
                    } else {
                        state.historyIndex = state.history.length;
                        input.value = '';
                    }
                }
            };

            console.log(`[Terminal] Ready for PID ${pid}`);
        },

        cleanup(pid, state) {}
    });
})();