const WindowManager = {
    windows: {},
    activeWindow: null,
    zIndexCounter: 1000,
    dragState: null,
    resizeState: null,
    
    config: {
        maxWindows: 100,      
        baseZIndex: 1000,
        animationDuration: 200
    },
    
    init() {
        this._setupKeyboardShortcuts();
        console.log('[WM] Window Manager initialized');
        
        setInterval(() => this._cleanupGhostWindows(), 60000);
    },
    
    /**
     * Createing a new window
     * @param {string} pid - Process ID
     * @param {string} title - Window title
     * @param {string} appId - Application ID
     * @param {string} icon - Icon emoji/string
     * @returns {string|null} Window ID or null if limit reached
     */
    createWindow(pid, title, appId, icon = '📦') {
        const workspace = document.getElementById('desktop-workspace');
        if (!workspace) {
            console.error('[WM] Desktop workspace not found');
            return null;
        }

        const currentOpen = Object.keys(this.windows).length;
        
        if (currentOpen >= this.config.maxWindows) {
            console.warn(`[WM] Max windows (${this.config.maxWindows}) reached.`);
            Notifier?.show({
                title: 'Window Limit Reached',
                message: `You have ${this.config.maxWindows} windows open. Close some apps to open more.`,
                type: 'warning',
                duration: 6000
            });
            return null;
        }

        const winId = `win_${pid}`;
        
        const offset = Math.min(currentOpen * 30, 300); 

        const win = document.createElement('div');
        win.className = 'os-window';
        win.id = winId;
        win.dataset.pid = pid;
        win.dataset.appId = appId;

        const randomX = Math.floor(Math.random() * 20) - 10;
        const randomY = Math.floor(Math.random() * 20) - 10;

        win.style.width = '600px';
        win.style.height = '400px';
        win.style.top = `${80 + offset + randomY}px`;
        win.style.left = `${80 + offset + randomX}px`;
        win.style.zIndex = ++this.zIndexCounter;

        win.innerHTML = `
            <div class="window-header" data-action="drag">
                <div class="window-title">
                    <span>${icon}</span>
                    <span>${title}</span>
                </div>
                <div class="window-controls">
                    <button class="win-btn btn-min" aria-label="Minimize" title="Minimize"></button>
                    <button class="win-btn btn-max" aria-label="Maximize" title="Maximize"></button>
                    <button class="win-btn btn-close" aria-label="Close" title="Close"></button>
                </div>
            </div>
            <div class="window-body" id="body_${pid}"></div>
            <div class="resize-handle" aria-hidden="true"></div>
        `;

        workspace.appendChild(win);

        this.windows[pid] = {
            element: win,
            body: document.getElementById(`body_${pid}`),
            header: win.querySelector('.window-header'),
            isMinimized: false,
            isMaximized: false,
            prevState: null,
            lastFocused: Date.now(),
            created: Date.now(),
            handlers: {}
        };

        this._bindEvents(win, pid);
        this.focus(pid);

        setTimeout(() => {
            const appDef = OS?.appRegistry?.[appId];
            if (appDef && typeof appDef.init === 'function') {
                try {
                    appDef.init(pid, `body_${pid}`, OS.runningProcesses[pid]?.state || {});
                } catch (err) {
                    console.error(`[WM] Init failed for ${appId}:`, err);
                    this._showError(pid, 'Failed to load application');
                }
            }
        }, 10);

        return winId;
    },

    /**
     * remove a window
     * @param {string} pid - Process ID
     */
    destroyWindow(pid) {
        const winData = this.windows[pid];
        if (!winData) return;

        winData.element.style.transition = `opacity ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`;
        winData.element.style.opacity = '0';
        winData.element.style.transform = 'scale(0.95)';

        setTimeout(() => {
            if (winData.element.parentNode) {
                winData.element.parentNode.removeChild(winData.element);
            }
        }, this.config.animationDuration);

        delete this.windows[pid];
        if (this.activeWindow === pid) {
            this.activeWindow = null;
            const remaining = Object.keys(this.windows);
            if (remaining.length > 0) {
                this.focus(remaining[remaining.length - 1]);
            }
        }
    },

    /**
     * Focused a window
     * @param {string} pid - Process ID
     */
    focus(pid) {
        const winData = this.windows[pid];
        if (!winData) return;

        winData.element.style.zIndex = ++this.zIndexCounter;
        winData.lastFocused = Date.now();

        for (const p of Object.keys(this.windows)) {
            if (p !== pid) {
                this.windows[p].element.classList.remove('focused');
            }
        }

        winData.element.classList.add('focused');
        this.activeWindow = pid;
        if (typeof OS !== 'undefined') OS._updateTaskbar();
    },

    minimize(pid) {
        const winData = this.windows[pid];
        if (winData) {
            winData.isMinimized = true;
            winData.element.style.display = 'none';
            if (typeof OS !== 'undefined') OS._updateTaskbar();
        }
    },

    restore(pid) {
        const winData = this.windows[pid];
        if (winData) {
            winData.isMinimized = false;
            winData.element.style.display = 'flex';
            this.focus(pid);
            if (typeof OS !== 'undefined') OS._updateTaskbar();
        }
    },

    toggleMinimize(pid) {
        const winData = this.windows[pid];
        if (winData) {
            if (winData.isMinimized) {
                this.restore(pid);
            } else {
                this.minimize(pid);
            }
        }
    },

    maximize(pid) {
        const winData = this.windows[pid];
        if (!winData) return;

        const el = winData.element;

        if (winData.isMaximized) {
            if (winData.prevState) {
                el.style.width = winData.prevState.width;
                el.style.height = winData.prevState.height;
                el.style.top = winData.prevState.top;
                el.style.left = winData.prevState.left;
            }
            winData.isMaximized = false;
        } else {
            winData.prevState = {
                width: el.style.width,
                height: el.style.height,
                top: el.style.top,
                left: el.style.left
            };

            const topPanelHeight = 40;
            const taskbarHeight = 50;
            const availableHeight = window.innerHeight - topPanelHeight - taskbarHeight;

            el.style.width = '100%';
            el.style.height = `${availableHeight}px`;
            el.style.top = `${topPanelHeight}px`;
            el.style.left = '0';

            winData.isMaximized = true;
        }
    },

    close(pid) {
        if (typeof OS !== 'undefined') {
            OS.closeProcess(pid);
        }
    },

    toggleStartMenu() {
        const menu = document.getElementById('start-menu');
        if (menu) {
            menu.classList.toggle('hidden');
            menu.setAttribute('aria-hidden', menu.classList.contains('hidden'));
        }
    },

    toggleActivities() {
        const overlay = document.getElementById('activities-overlay');
        const input = document.getElementById('search-input');

        if (overlay) {
            overlay.classList.toggle('hidden');
            if (!overlay.classList.contains('hidden')) {
                input?.focus();
            }
        }
    },

    getWindowCount() {
        return Object.keys(this.windows).length;
    },

    isMinimized(pid) {
        return this.windows[pid]?.isMinimized || false;
    },

    _cleanupGhostWindows() {
        const domIds = Array.from(document.querySelectorAll('.os-window')).map(el => el.id);
        let cleaned = false;

        for (const [pid, winData] of Object.entries(this.windows)) {
            const expectedId = `win_${pid}`;
            
            if (!domIds.includes(expectedId)) {
                console.warn(`[WM] Cleaning up ghost window ${expectedId}`);
                delete this.windows[pid];
                cleaned = true;
                continue;
            }

            if (domIds.includes(expectedId) && !this.windows[pid]) {
                 console.warn(`[WM] Found orphaned DOM window ${expectedId}`);
            }
        }

        if (cleaned) {
            console.log(`[WM] Cleanup complete. Current active windows: ${Object.keys(this.windows).length}`);
        }
    },

    /**
     * @private
     */
    switchWindows(reverse) {
        const openWindows = Object.keys(this.windows).filter(p => !this.windows[p].isMinimized);
        if (openWindows.length <= 1) return;

        const idx = openWindows.indexOf(this.activeWindow);
        const nextIdx = reverse 
            ? (idx - 1 + openWindows.length) % openWindows.length
            : (idx + 1) % openWindows.length;

        this.focus(openWindows[nextIdx]);
    },

    /**
     * @private
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchWindows(e.shiftKey);
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'w' && this.activeWindow) {
                e.preventDefault();
                this.close(this.activeWindow);
            }

            if (e.key === 'Escape' && this.activeWindow && !this.windows[this.activeWindow]?.isMaximized) {
                this.close(this.activeWindow);
            }
        });
    },

    /**
     * @private
     */
    _bindEvents(win, pid) {
        const winData = this.windows[pid];
        const dragListener = this.handleDrag.bind(this);
        const dragEndListener = this.stopDrag.bind(this);
        const resizeListener = this.handleResize.bind(this);
        const resizeEndListener = this.stopResize.bind(this);
        winData.handlers = { dragListener, dragEndListener, resizeListener, resizeEndListener };

        const header = win.querySelector('.window-header');
        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.button !== 0 || e.target.closest('.window-controls')) return;
                if (this.windows[pid].isMaximized) return;

                this.dragState = {
                    pid,
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: win.offsetLeft,
                    initialY: win.offsetTop
                };

                document.addEventListener('mousemove', dragListener);
                document.addEventListener('mouseup', dragEndListener);
            });
        }

        const handle = win.querySelector('.resize-handle');
        if (handle) {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.resizeState = {
                    pid,
                    x: e.clientX,
                    y: e.clientY,
                    width: win.offsetWidth,
                    height: win.offsetHeight
                };

                document.addEventListener('mousemove', resizeListener);
                document.addEventListener('mouseup', resizeEndListener);
            });
        }

        const btnMin = win.querySelector('.btn-min');
        const btnMax = win.querySelector('.btn-max');
        const btnClose = win.querySelector('.btn-close');

        if (btnMin) btnMin.onclick = () => this.toggleMinimize(pid);
        if (btnMax) btnMax.onclick = () => this.maximize(pid);
        if (btnClose) btnClose.onclick = () => this.close(pid);

        win.addEventListener('mousedown', () => this.focus(pid));
    },

    /**
     * @private
     */
    handleDrag(e) {
        if (!this.dragState) return;

        const win = this.windows[this.dragState.pid].element;
        if (!win) return;

        let newX = this.dragState.initialX + (e.clientX - this.dragState.startX);
        let newY = this.dragState.initialY + (e.clientY - this.dragState.startY);

        const minTop = 40; 
        const minLeft = 0;
        const maxWidth = window.innerWidth - win.offsetWidth;
        const maxHeight = window.innerHeight - win.offsetHeight - 50; 

        newX = Math.max(minLeft, Math.min(newX, maxWidth));
        newY = Math.max(minTop, Math.min(newY, maxHeight));

        win.style.left = `${newX}px`;
        win.style.top = `${newY}px`;
    },

    stopDrag() {
        if (!this.dragState) return;
        const winData = this.windows[this.dragState.pid];
        const handler = winData?.handlers;
        document.removeEventListener('mousemove', handler?.dragListener || this.handleDrag.bind(this));
        document.removeEventListener('mouseup', handler?.dragEndListener || this.stopDrag.bind(this));
        this.dragState = null;
    },

    /**
     * @private
     */
    handleResize(e) {
        if (!this.resizeState) return;

        const win = this.windows[this.resizeState.pid].element;
        if (!win) return;

        const newW = Math.max(320, this.resizeState.width + (e.clientX - this.resizeState.x));
        const newH = Math.max(220, this.resizeState.height + (e.clientY - this.resizeState.y));

        win.style.width = `${newW}px`;
        win.style.height = `${newH}px`;
    },

    stopResize() {
        if (!this.resizeState) return;
        const winData = this.windows[this.resizeState.pid];
        const handler = winData?.handlers;
        document.removeEventListener('mousemove', handler?.resizeListener || this.handleResize.bind(this));
        document.removeEventListener('mouseup', handler?.resizeEndListener || this.stopResize.bind(this));
        this.resizeState = null;
    },

    /**
     * @private
     */
    _showError(pid, message) {
        const winData = this.windows[pid];
        if (winData && winData.body) {
            winData.body.innerHTML = `
                <div style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:var(--error);gap:12px;padding:20px;">
                    <span style="font-size:3rem;">⚠️</span>
                    <h3>Error Loading Application</h3>
                    <p>${message}</p>
                    <button onclick="OS.closeProcess('${pid}')" style="padding:8px 16px;background:var(--error);color:white;border:none;border-radius:4px;cursor:pointer;margin-top:10px;">Close Window</button>
                </div>
            `;
        }
    }
};

window.WindowManager = WindowManager;