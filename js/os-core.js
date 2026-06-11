const OS = {
    runningProcesses: {},
    appRegistry: {},
    topZIndex: 100,
    pidCounter: 0,

    init: function() {
        this.VFS.init();
        this.Clock.init();
        this.registerBuiltInApps();
    },

    registerApp: function(id, title, initCallback, cleanupCallback = null) {
        this.appRegistry[id] = { title, init: initCallback, cleanup: cleanupCallback };
    },

    launchApp: function(id) {
        if (!this.appRegistry[id]) return;
        this.pidCounter++;
        const pid = `PID_${this.pidCounter}`;
        
        this.runningProcesses[pid] = { id: id, title: this.appRegistry[id].title, state: {} };
        WindowManager.createWindow(pid, this.runningProcesses[pid].title, id);
    },

    closeProcess: function(pid) {
        if (this.runningProcesses[pid]) {
            const app = this.appRegistry[this.runningProcesses[pid].id];
            if (app.cleanup) app.cleanup(pid, this.runningProcesses[pid].state);
            delete this.runningProcesses[pid];
            WindowManager.destroyWindow(pid);
        }
    },

    VFS: {
        init: function() {
            if (!localStorage.getItem("Was-OS_vfs")) {
                const base = {
                    "welcome.txt": "Welcome to Was-Operating System.\nEverything runs natively inside isolated process loops.",
                    "system_report.log": "Kernel Initialization status: 200 OK\nAll modules verification clear."
                };
                localStorage.setItem("Was-OS_vfs", JSON.stringify(base));
            }
        },
        read: function(file) { return JSON.parse(localStorage.getItem("Was-OS_vfs"))[file] || null; },
        write: function(file, data) {
            const fs = JSON.parse(localStorage.getItem("Was-OS_vfs"));
            fs[file] = data;
            localStorage.setItem("Was-OS_vfs", JSON.stringify(fs));
        },
        list: function() { return Object.keys(JSON.parse(localStorage.getItem("Was-OS_vfs"))); }
    },

    Clock: {
        init: function() {
            setInterval(() => {
                const node = document.getElementById("panel-clock");
                if (node) node.innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }, 1000);
        }
    },

    registerBuiltInApps: function() {
        // 1. TERMINAL
        this.registerApp("terminal", "Terminal Console", function(pid, bodyId, state) {
            const box = document.getElementById(bodyId);
            box.innerHTML = `
                <div class="term-box">
                    <div class="term-log" id="log_${pid}">Was-OS-sh v3.8\nType 'help', 'ls', or 'cat [file]'.\n\n</div>
                    <div class="term-row"><span>[user@Was-OS ~]$</span><input type="text" class="term-input" id="in_${pid}" autocomplete="off" spellcheck="false"></div>
                </div>`;
            const log = document.getElementById(`log_${pid}`);
            const input = document.getElementById(`in_${pid}`);
            input.focus();
            input.onkeydown = (e) => {
                if (e.key === "Enter") {
                    const cmdLine = input.value.trim(); input.value = ""; if(!cmdLine) return;
                    log.innerText += `[user@Was-OS ~]$ ${cmdLine}\n`;
                    const args = cmdLine.split(" "); const baseCmd = args[0].toLowerCase();
                    if(baseCmd === "help") log.innerText += "Commands: help, ls, cat [filename], clear\n";
                    else if(baseCmd === "ls") log.innerText += OS.VFS.list().join("    ") + "\n";
                    else if(baseCmd === "clear") log.innerText = "";
                    else if(baseCmd === "cat") log.innerText += (OS.VFS.read(args[1]) || "File not found.") + "\n";
                    else log.innerText += `sh: command not found: ${baseCmd}\n`;
                    log.scrollTop = log.scrollHeight;
                }
            };
        });

        // 2. SYSTEM MONITOR
        this.registerApp("sysmon", "System Monitor", function(pid, bodyId, state) {
            const box = document.getElementById(bodyId);
            box.innerHTML = `<div class="sysmon-box" id="mon_${pid}"></div>`;
            const render = () => {
                const mon = document.getElementById(`mon_${pid}`);
                if (!mon) return;
                mon.innerHTML = `
                    <div class="sysmon-card"><strong>Task Scheduler:</strong> ${Object.keys(OS.runningProcesses).length} Active Processes</div>
                    <div class="sysmon-card"><strong>Virtual Filesystem:</strong> ${OS.VFS.list().length} Tracked File System Nodes</div>
                    <div class="sysmon-card"><strong>System Memory Allocation:</strong> ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB / LocalStorage</div>`;
            };
            render();
            state.timer = setInterval(render, 1000);
        }, function(pid, state) { clearInterval(state.timer); });

        // 3. PAINT STUDIO
        this.registerApp("canvas", "Paint Studio", function(pid, bodyId, state) {
            const box = document.getElementById(bodyId);
            box.innerHTML = `
                <div class="canvas-box">
                    <div class="canvas-bar"><input type="color" id="c_${pid}" value="#3584e4"><button id="r_${pid}">Clear Workspace</button></div>
                    <canvas class="canvas-el" id="cvs_${pid}" width="580" height="300"></canvas>
                </div>`;
            const cvs = document.getElementById(`cvs_${pid}`); const ctx = cvs.getContext("2d");
            ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,cvs.width,cvs.height);
            let active = false;
            cvs.onmousedown = () => active = true;
            window.addEventListener("mouseup", () => { active = false; ctx.beginPath(); });
            cvs.onmousemove = (e) => {
                if(!active) return; const r = cvs.getBoundingClientRect();
                ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.strokeStyle = document.getElementById(`c_${pid}`).value;
                ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke(); ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
            };
            document.getElementById(`r_${pid}`).onclick = () => { ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,cvs.width,cvs.height); };
        });

        // 4. SETTINGS WALLPAPER INTERFACE
        this.registerApp("settings", "Settings", function(pid, bodyId, state) {
            const box = document.getElementById(bodyId);
            box.innerHTML = `
                <div style="padding:20px; background:#242430; height:100%;">
                    <h3 style="margin-bottom:12px;">Desktop Background Configuration</h3>
                    <p style="font-size:0.8rem; margin-bottom:15px; color:var(--text-muted);">Paste an online image URL or select a built-in background style configuration:</p>
                    <input type="text" id="wall_url_${pid}" placeholder="https://example.com/image.jpg" style="width:100%; padding:8px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; margin-bottom:15px;">
                    <button id="set_wall_${pid}" style="background:var(--accent-color); border:none; color:#fff; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:600; margin-right:8px;">Apply Custom Image</button>
                    <button id="reset_wall_${pid}" style="background:#444; border:none; color:#fff; padding:6px 12px; border-radius:4px; cursor:pointer;">Reset to Was-OS Default</button>
                </div>`;
            
            document.getElementById(`set_wall_${pid}`).onclick = () => {
                const val = document.getElementById(`wall_url_${pid}`).value.trim();
                if(val) document.body.style.background = `url('${val}') no-repeat center center / cover`;
            };
            document.getElementById(`reset_wall_${pid}`).onclick = () => {
                document.body.style.background = "linear-gradient(135deg, #1c355e 0%, #0c101f 100%)";
            };
        });
    }
};

document.addEventListener("DOMContentLoaded", () => OS.init());