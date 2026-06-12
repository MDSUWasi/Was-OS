/**
 * Was-OS Terminal v4.0 - FIXED (No Syntax Errors)
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
                    console.error(`[Terminal] Container ${bodyId} missing`); 
                    return; 
                }
                
                state.history = [];
                state.historyIndex = -1;
                state.currentDir = 'documents';
                state.theme = localStorage.getItem('wasos_terminal_theme') || 'dark';
                
                // --- HELPER FUNCTIONS ---
                function getPrompt(dir) {
                    return `user@wasos:${dir ? '~/' + dir : '~'}$`;
                }
                
                function printToOutput(text, color) {
                    const span = document.createElement('span');
                    if (color) span.style.color = color;
                    
                    // Check if text contains HTML tags
                    if (text.includes('<')) {
                        span.innerHTML = text;
                    } else {
                        span.textContent = text;
                    }
                    
                    output.appendChild(span);
                }
                
                function applyLocalTheme(theme) {
                    if (theme === 'light') {
                        root.style.background = '#f5f5f5';
                        output.style.color = '#000';
                        promptLabel.style.color = '#2b5e2e';
                        document.querySelector('.term-toolbar').style.background = '#e0e0e0';
                    } else {
                        root.style.background = '#0d0d10';
                        output.style.color = '#4ade80';
                        promptLabel.style.color = '#2ec27e';
                        document.querySelector('.term-toolbar').style.background = '#1a1a1e';
                    }
                    state.theme = theme;
                    localStorage.setItem('wasos_terminal_theme', theme);
                }

                // --- THE "NEOFETCH" LOGIC ---
                function generateAboutStats() {
                    const now = new Date();
                    const uptimeMs = Date.now() - (state.startTime || now.getTime());
                    const seconds = Math.floor(uptimeMs / 1000);
                    
                    let uptimeStr = `${seconds}s`;
                    if (seconds > 60) uptimeStr = `${Math.floor(seconds/60)}m ${seconds%60}s`;
                    if (seconds > 3600) {
                        const h = Math.floor(seconds/3600);
                        const m = Math.floor((seconds%3600)/60);
                        uptimeStr = `${h}h ${m}m`;
                    }

                    const openWindows = Object.keys(OS.runningProcesses).length;
                    const storageUsed = (VFS.getStorageUsed() / 1024).toFixed(2);
                    const shell = navigator.userAgent.includes('Chrome') ? 'Chromium' : 'JS-Browser';
                    const kernel = 'JavaScript ES2022';
                    const resolution = `${window.innerWidth}x${window.innerHeight}`;
                    
                    // ASCII Logo (Blue)
                    const logoLines = [
                        "  ██╗    ██╗███████╗██████╗ ██████╗ ",
                        "  ██║    ██║██╔════╝██╔══██╗██╔══██╗",
                        "  ██║ █╗ ██║█████╗  ██████╔╝██████╔╝",
                        "  ██║███╗██║██╔══╝  ██╔══██╗██╔══██╗",
                        "  ╚███╔███╔╝███████╗██║  ██║██████╔╝",
                        "   ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝╚═════╝ "
                    ];
                    
                    const infoLines = [
                        "  ┌──────────────────────────────┐",
                        "  │   <span style='color:#3584e4'>Was-OS</span> v4.0             │",
                        "  └──────────────────────────────┘",
                        "",
                        "  <span style='color:#2ec27e'>OS</span>:        Was-Operating System",
                        "  <span style='color:#2ec27e'>Host</span>:      Web Browser (" + shell + ")",
                        "  <span style='color:#2ec27e'>Kernel</span>:    " + kernel,
                        "  <span style='color:#2ec27e'>Uptime</span>:    " + uptimeStr,
                        "  <span style='color:#2ec27e'>Memory</span>:    " + storageUsed + " KB (Local Storage)",
                        "  <span style='color:#2ec27e'>Resolution</span>: " + resolution,
                        "  <span style='color:#2ec27e'>Theme</span>:     " + state.theme,
                        "  <span style='color:#2ec27e'>Shell</span>:     WAS-SH v1.0",
                        "",
                        "  Copyright © 2024 Was-OS Project"
                    ];

                    // Build the full HTML string safely
                    let result = "";
                    for (let line of logoLines) {
                        result += "<span style='color:#3584e4'>" + line + "</span><br>";
                    }
                    result += "<br>";
                    for (let line of infoLines) {
                        result += line + "<br>";
                    }
                    
                    return result;
                }

                // --- COMMAND EXECUTOR ---
                function executeCmd(rawCmd) {
                    const args = rawCmd.split(/\s+/).filter(arg => arg);
                    const cmd = args[0].toLowerCase();
                    const arg1 = args[1];
                    
                    switch (cmd) {
                        case 'help':
                            return "Commands:\n  help          Show help\n  ls            List files\n  cd <dir>      Change directory\n  cat <file>    Read file\n  mkdir <name>  Create dir\n  rm <file>     Delete file\n  clear         Clear screen\n  about         System info (Neofetch)\n  date          Current time\n  whoami        User info";
                        
                        case 'ls':
                            try {
                                const items = VFS.list(state.currentDir);
                                return items.length ? items.join('\n') : '(empty directory)';
                            } catch { return 'Error: Directory not found.'; }
                        
                        case 'cd':
                            if (!arg1 || arg1 === '~') { state.currentDir = 'documents'; }
                            else if (arg1 === '..') {
                                const parts = state.currentDir.split('/').filter(Boolean);
                                if(parts.length) parts.pop();
                                state.currentDir = parts.join('/') || 'documents';
                            } else {
                                const target = state.currentDir ? `${state.currentDir}/${arg1}` : arg1;
                                if(VFS.exists(target) && VFS.isDirectory(target)) { state.currentDir = target; }
                                else { return `cd: ${arg1}: No such directory`; }
                            }
                            promptLabel.textContent = getPrompt(state.currentDir);
                            return '';
                        
                        case 'cat':
                            if(!arg1) return 'Usage: cat <filename>';
                            const content = VFS.read(`${state.currentDir}/${arg1}`);
                            return content !== null ? content : 'Error: File not found';
                        
                        case 'mkdir':
                            if(!arg1) return 'Usage: mkdir <dirname>';
                            const newPath = state.currentDir ? `${state.currentDir}/${arg1}` : arg1;
                            if(VFS.exists(newPath)) return 'Error: Directory exists';
                            VFS.createDirectory(newPath);
                            return `Created: ${arg1}`;
                        
                        case 'rm':
                            if(!arg1) return 'Usage: rm <filename>';
                            const rPath = state.currentDir ? `${state.currentDir}/${arg1}` : arg1;
                            if(!VFS.exists(rPath)) return 'Error: File not found';
                            if(VFS.isDirectory(rPath)) return 'Error: Cannot remove directory';
                            VFS.delete(rPath);
                            return `Deleted: ${arg1}`;
                        
                        case 'clear': 
                            return '[CLEAR]';
                        
                        case 'about':
                            return generateAboutStats();
                        
                        case 'date': return new Date().toString();
                        case 'whoami': return 'user';
                        
                        default: return `'${cmd}' is not recognized. Type 'help'.`;
                    }
                }

                // --- BUILD UI ---
                const root = document.createElement('div');
                root.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#0d0d10;font-family:"JetBrains Mono",monospace;font-size:0.9rem;overflow:hidden;';
                
                root.innerHTML = `
                    <div class="term-toolbar" style="padding:8px;background:#1a1a1e;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#666;font-size:0.75rem;">Was-OS Shell v4.0</span>
                        <div style="display:flex;gap:6px;">
                            <button id="${pid}_dark" style="background:#333;color:white;border:none;padding:2px 8px;font-size:0.7rem;border-radius:4px;cursor:pointer;">Dark</button>
                            <button id="${pid}_light" style="background:#ddd;color:black;border:none;padding:2px 8px;font-size:0.7rem;border-radius:4px;cursor:pointer;">Light</button>
                        </div>
                    </div>
                    <div class="term-output" id="${pid}_output" style="flex:1;overflow-y:auto;padding:10px;color:#4ade80;white-space:pre-wrap;"></div>
                    <div style="padding:5px 10px;display:flex;gap:8px;border-top:1px solid #333;">
                        <span class="term-prompt" id="${pid}_prompt" style="color:#2ec27e;font-weight:bold;">user@wasos:~/documents$</span>
                        <input type="text" id="${pid}_input" style="flex:1;background:transparent;border:none;color:#fff;outline:none;font-family:inherit;" autocomplete="off" spellcheck="false">
                    </div>
                `;
                
                container.appendChild(root);
                
                const output = root.querySelector(`#${pid}_output`);
                const input = root.querySelector(`#${pid}_input`);
                const promptLabel = root.querySelector(`#${pid}_prompt`); // FIXED: Added missing backtick here
                
                // Init State
                state.startTime = Date.now();
                applyLocalTheme(state.theme);
                
                // Welcome Message
                printToOutput("Was-OS Terminal v4.0\nType 'about' for system info.\nType 'help' for commands.\n\n");
                promptLabel.textContent = getPrompt(state.currentDir);
                
                // Theme Buttons
                const btnDark = root.querySelector(`#${pid}_dark`);
                const btnLight = root.querySelector(`#${pid}_light`);
                
                if(btnDark) btnDark.onclick = () => applyLocalTheme('dark');
                if(btnLight) btnLight.onclick = () => applyLocalTheme('light');
                
                // Input Logic
                input.focus();
                container.addEventListener('click', () => input.focus());
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const cmd = input.value.trim();
                        const fullPrompt = getPrompt(state.currentDir);
                        input.value = '';
                        if(!cmd) return;
                        
                        printToOutput(`${fullPrompt} ${cmd}\n`, '#4ade80');
                        
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