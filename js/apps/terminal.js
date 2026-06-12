/**
 * Was-OS Terminal v4.0 - FIXED (No 'this' references)
 */

(function() {
    OS.registerApp({
        id: 'terminal',
        title: 'Terminal',
        icon: '📟',
        description: 'Command line interface',
        category: 'utilities',
        
        init(pid, bodyId, state) {
            try {
                const container = document.getElementById(bodyId);
                if (!container) {
                    console.error(`[Terminal] Container ${bodyId} not found`);
                    return;
                }
                
                state.history = [];
                state.historyIndex = -1;
                state.currentDir = 'documents';
                state.theme = localStorage.getItem('wasos_terminal_theme') || 'dark';
                
                // --- LOCAL HELPER FUNCTIONS (Avoid 'this') ---
                
                function getPrompt(dir) {
                    return `user@wasos:${dir ? '~/' + dir : '~'}$`;
                }
                
                function printToOutput(text, color = '#4ade80') {
                    const span = document.createElement('span');
                    span.textContent = text;
                    if (color) span.style.color = color;
                    output.appendChild(span);
                }
                
                function applyLocalTheme(theme) {
                    if (theme === 'light') {
                        root.style.background = '#f5f5f5';
                        output.style.color = '#000';
                        promptLabel.style.color = '#2b5e2e';
                    } else {
                        root.style.background = '#0d0d10';
                        output.style.color = '#4ade80';
                        promptLabel.style.color = '#2ec27e';
                    }
                    state.theme = theme;
                    localStorage.setItem('wasos_terminal_theme', theme);
                }
                
                function executeCmd(rawCmd) {
                    const args = rawCmd.split(/\s+/).filter(arg => arg);
                    const cmd = args[0].toLowerCase();
                    const arg1 = args[1];
                    
                    switch (cmd) {
                        case 'help':
                            return "Was-OS Terminal v4.0\nCommands: ls, cd, cat, mkdir, rm, touch, clear, about, date, whoami";
                        case 'ls':
                            try {
                                const items = VFS.list(state.currentDir);
                                return items.length ? items.join('\n') : '(empty)';
                            } catch { return 'Error'; }
                        case 'cd':
                            if (!arg1 || arg1 === '~') state.currentDir = 'documents';
                            else if (arg1 === '..') {
                                const parts = state.currentDir.split('/').filter(Boolean);
                                if(parts.length) parts.pop();
                                state.currentDir = parts.join('/') || 'documents';
                            } else {
                                const target = `${state.currentDir}/${arg1}`;
                                if(VFS.exists(target) && VFS.isDirectory(target)) state.currentDir = target;
                                else return `cd: ${arg1}: No such directory`;
                            }
                            promptLabel.textContent = getPrompt(state.currentDir);
                            return '';
                        case 'cat':
                            if(!arg1) return 'Usage: cat <file>';
                            const content = VFS.read(`${state.currentDir}/${arg1}`);
                            return content !== null ? content : 'File not found';
                        case 'mkdir':
                            if(!arg1) return 'Usage: mkdir <dir>';
                            const path = `${state.currentDir}/${arg1}`;
                            if(VFS.exists(path)) return 'Exists';
                            VFS.createDirectory(path);
                            return `Created ${arg1}`;
                        case 'rm':
                            if(!arg1) return 'Usage: rm <file>';
                            const rPath = `${state.currentDir}/${arg1}`;
                            if(!VFS.exists(rPath)) return 'Not found';
                            VFS.delete(rPath);
                            return `Deleted ${arg1}`;
                        case 'clear': return '[CLEAR]';
                        case 'about': return "Was-OS v4.0\nJS Kernel\nOpen: " + Object.keys(OS.runningProcesses).length;
                        case 'date': return new Date().toString();
                        case 'whoami': return 'user';
                        default: return `'${cmd}' not recognized.`;
                    }
                }

                // --- BUILD UI ---
                const root = document.createElement('div');
                root.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#0d0d10;font-family:"JetBrains Mono",monospace;font-size:0.9rem;overflow:hidden;';
                
                root.innerHTML = `
                    <div style="padding:8px;background:#1a1a1e;border-bottom:1px solid #333;display:flex;gap:6px;">
                        <span style="color:#666;font-size:0.7rem;">Was-OS Shell</span>
                        <button id="${pid}_dark" style="background:#333;color:white;border:none;padding:2px 6px;font-size:0.7rem;border-radius:4px;cursor:pointer;">Dark</button>
                        <button id="${pid}_light" style="background:#ddd;color:black;border:none;padding:2px 6px;font-size:0.7rem;border-radius:4px;cursor:pointer;">Light</button>
                    </div>
                    <div class="term-output" id="${pid}_output" style="flex:1;overflow-y:auto;padding:10px;color:#4ade80;white-space:pre-wrap;"></div>
                    <div style="padding:5px 10px;display:flex;gap:8px;border-top:1px solid #333;">
                        <span class="term-prompt" id="${pid}_prompt" style="color:#2ec27e;font-weight:bold;">user@wasos:~/documents$</span>
                        <input type="text" id="${pid}_input" style="flex:1;background:transparent;border:none;color:#fff;outline:none;font-family:inherit;" autocomplete="off">
                    </div>
                `;
                
                container.appendChild(root);
                
                const output = root.querySelector(`#${pid}_output`);
                const input = root.querySelector(`#${pid}_input`);
                const promptLabel = root.querySelector(`#${pid}_prompt`);
                
                // Apply initial theme
                applyLocalTheme(state.theme);
                
                // Theme buttons
                root.querySelector(`#${pid}_dark`).onclick = () => applyLocalTheme('dark');
                root.querySelector(`#${pid}_light`).onclick = () => applyLocalTheme('light');
                
                // Welcome
                printToOutput("Was-OS Terminal v4.0\nType 'help' for commands.\n\n");
                promptLabel.textContent = getPrompt(state.currentDir);
                
                // Input handler
                input.focus();
                container.addEventListener('click', () => input.focus());
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const cmd = input.value.trim();
                        input.value = '';
                        if(!cmd) return;
                        
                        printToOutput(`${getPrompt(state.currentDir)} ${cmd}\n`, '#4ade80');
                        
                        const response = executeCmd(cmd);
                        if (response === '[CLEAR]') {
                            output.innerHTML = '';
                        } else if (response) {
                            printToOutput(response + '\n');
                        }
                        
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
                });
                
                console.log(`[Terminal] Ready for PID ${pid}`);
            } catch (err) {
                console.error("[Terminal] CRITICAL ERROR:", err);
                if(container) container.innerHTML = `<div style="color:red;padding:20px;">Error: ${err.message}</div>`;
            }
        },
        
        cleanup(pid, state) {}
    });
})();