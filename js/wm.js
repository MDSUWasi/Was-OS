const WindowManager = {
    createWindow: function(pid, title, appId) {
        const workspace = document.getElementById("desktop-workspace");
        const win = document.createElement("div");
        win.className = "os-window";
        win.id = pid;
        win.style.width = "620px";
        win.style.height = "390px";
        
        const offset = (parseInt(pid.replace("PID_", "")) * 25) % 120;
        win.style.top = `${40 + offset}px`;
        win.style.left = `${60 + offset}px`;

        win.innerHTML = `
            <div class="window-header" onmousedown="WindowManager.focus('${pid}')">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="win-control-btn btn-min" onclick="WindowManager.minimize('${pid}')"></button>
                    <button class="win-control-btn btn-max" onclick="WindowManager.maximize('${pid}')"></button>
                    <button class="win-control-btn btn-close" onclick="OS.closeProcess('${pid}')"></button>
                </div>
            </div>
            <div class="window-body" id="body_${pid}"></div>`;
        
        workspace.appendChild(win);
        this.bindDrag(win);
        this.focus(pid);

        setTimeout(() => { if(OS.appRegistry[appId]) OS.appRegistry[appId].init(pid, `body_${pid}`, OS.runningProcesses[pid].state); }, 20);
    },

    destroyWindow: function(pid) { const el = document.getElementById(pid); if(el) el.remove(); },
    focus: function(pid) { const el = document.getElementById(pid); if(el) { OS.topZIndex += 2; el.style.zIndex = OS.topZIndex; } },
    minimize: function(pid) { const el = document.getElementById(pid); if(el) el.style.display = el.style.display === "none" ? "flex" : "none"; },
    maximize: function(pid) {
        const el = document.getElementById(pid); if(!el) return;
        if(el.dataset.m === "1") {
            el.style.width = el.dataset.w; el.style.height = el.dataset.h; el.style.top = el.dataset.t; el.style.left = el.dataset.l; el.dataset.m = "0";
        } else {
            el.dataset.w = el.style.width; el.dataset.h = el.style.height; el.dataset.t = el.style.top; el.dataset.l = el.style.left;
            el.style.width = "100%"; el.style.height = "100%"; el.style.top = "0px"; el.style.left = "0px"; el.dataset.m = "1";
        }
    },

    bindDrag: function(win) {
        const head = win.querySelector(".window-header");
        let px = 0, py = 0, mx = 0, my = 0;
        head.onmousedown = (e) => {
            if(e.target.classList.contains("win-control-btn")) return;
            WindowManager.focus(win.id);
            mx = e.clientX; my = e.clientY; px = win.offsetLeft; py = win.offsetTop;
            document.onmousemove = (ev) => { win.style.left = `${px + (ev.clientX - mx)}px`; win.style.top = `${py + (ev.clientY - my)}px`; };
            document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; };
        };
    }
};