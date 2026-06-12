/**
 * Was-OS System Core
 * Manages app registry, processes, and system-level functions
 */

const OS = {
    runningProcesses: {},
    appRegistry: {},
    
    config: {
        baseZIndex: 1000,
        maxWindows: 50
    },
    
    /**
     * Register an application with the OS
     * @param {string|object} idOrConfig - App ID or full config object
     * @param {string} [title] - Display title (optional if using object)
     * @param {function} [initFn] - Initialization function (optional if using object)
     */
    registerApp(idOrConfig, title, initFn) {
        let appDef;
        
        if (typeof idOrConfig === 'object') {
            // Object syntax: {id, title, icon, description, init, cleanup, ...}
            appDef = {
                id: idOrConfig.id,
                title: idOrConfig.title || idOrConfig.id,
                icon: idOrConfig.icon || '📦',
                description: idOrConfig.description || '',
                category: idOrConfig.category || 'utilities',
                init: idOrConfig.init,
                cleanup: idOrConfig.cleanup || null,
                singleInstance: idOrConfig.singleInstance || false,
                metadata: idOrConfig.metadata || {}
            };
        } else {
            // Param syntax: registerApp('id', 'Title', initFn)
            appDef = {
                id: idOrConfig,
                title: title || idOrConfig,
                icon: '📦',
                description: '',
                category: 'utilities',
                init: initFn,
                cleanup: null,
                singleInstance: false,
                metadata: {}
            };
        }
        
        if (!appDef.init) {
            console.error(`[OS] App '${appDef.id}' registered without init function!`);
            return false;
        }
        
        // Prevent duplicate registration
        if (this.appRegistry[appDef.id]) {
            console.warn(`[OS] App '${appDef.id}' already registered.`);
            return false;
        }
        
        this.appRegistry[appDef.id] = appDef;
        console.log(`[OS] Registered: ${appDef.id} (${appDef.title})`);
        return true;
    },
    
    /**
     * Launch an application
     * @param {string} appId - The app ID to launch
     * @returns {string|null} Process ID or null on failure
     */
    launchApp(appId) {
        const appDef = this.appRegistry[appId];
        
        if (!appDef) {
            console.error(`[OS] App '${appId}' not found.`);
            Notifier?.show({
                title: 'Error',
                message: `Application '${appId}' not found.`,
                type: 'error'
            });
            return null;
        }
        
        // Single instance check
        if (appDef.singleInstance) {
            const existingPid = this._findRunningProcess(appId);
            if (existingPid && WindowManager?.windows[existingPid]) {
                WindowManager.focus(existingPid);
                if (WindowManager.isMinimized(existingPid)) {
                    WindowManager.restore(existingPid);
                }
                return existingPid;
            }
        }
        
        // Create process ID
        const pid = `PID_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Add to running processes
        this.runningProcesses[pid] = {
            id: appId,
            title: appDef.title,
            state: {},
            launchedAt: Date.now(),
            lastFocused: Date.now()
        };
        
        // Create window via WindowManager
        if (typeof WindowManager !== 'undefined') {
            WindowManager.createWindow(pid, appDef.title, appId, appDef.icon);
        } else {
            console.error('[OS] WindowManager not initialized!');
            delete this.runningProcesses[pid];
            return null;
        }
        
        this._updateTaskbar();
        return pid;
    },
    
    /**
     * Close a running process
     * @param {string} pid - Process ID
     */
    closeProcess(pid) {
        const process = this.runningProcesses[pid];
        if (!process) return;
        
        // Run cleanup if defined
        const appDef = this.appRegistry[process.id];
        if (appDef && typeof appDef.cleanup === 'function') {
            try {
                appDef.cleanup(pid, process.state);
            } catch (error) {
                console.error(`[OS] Cleanup error for ${pid}:`, error);
            }
        }
        
        // Remove from processes
        delete this.runningProcesses[pid];
        
        // Destroy window
        if (typeof WindowManager !== 'undefined') {
            WindowManager.destroyWindow(pid);
        }
        
        this._updateTaskbar();
    },
    
    /**
     * Find PID by app ID
     * @private
     */
    _findRunningProcess(appId) {
        return Object.keys(this.runningProcesses).find(pid => 
            this.runningProcesses[pid].id === appId
        );
    },
    
    /**
     * Update taskbar display
     * @private
     */
    _updateTaskbar() {
        if (typeof WindowManager === 'undefined') return;
        
        const container = document.getElementById('taskbar-items');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (const [pid, proc] of Object.entries(this.runningProcesses)) {
            const appInfo = this.appRegistry[proc.id];
            if (!appInfo) continue;
            
            const item = document.createElement('div');
            item.className = 'task-item';
            if (WindowManager.isMinimized(pid)) item.classList.add('minimized');
            item.setAttribute('data-pid', pid);
            
            item.innerHTML = `<span>${appInfo.icon}</span>`;
            item.title = proc.title;
            
            item.onclick = () => {
                if (WindowManager.isMinimized(pid)) {
                    WindowManager.restore(pid);
                } else if (WindowManager.activeWindow === pid) {
                    WindowManager.minimize(pid);
                } else {
                    WindowManager.focus(pid);
                }
            };
            
            container.appendChild(item);
        }
    },
    
    /**
     * Populated Start Menu
     */
    setupStartMenu() {
        const list = document.getElementById('start-app-list');
        if (!list) return;
        
        const apps = Object.entries(this.appRegistry)
            .map(([id, def]) => ({ id, ...def }))
            .sort((a, b) => a.title.localeCompare(b.title));
        
        if (apps.length === 0) {
            list.innerHTML = '<div style="padding:20px;color:#666;">No applications installed</div>';
            return;
        }
        
        list.innerHTML = '';
        
        for (const app of apps) {
            const item = document.createElement('div');
            item.className = 'start-item';
            item.setAttribute('role', 'listitem');
            
            item.innerHTML = `
                <span class="app-icon">${app.icon}</span>
                <span class="app-name">${app.title}</span>
            `;
            
            item.onclick = () => OS.launchApp(app.id);
            list.appendChild(item);
        }
    },
    
    /**
     * Shutdown the system
     */
    shutdown() {
        if (confirm('Shutdown Was-OS? This will close all windows.')) {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.innerHTML = `
                    <div style="background:#000;height:100vh;display:flex;justify-content:center;align-items:center;color:#fff;font-family:sans-serif;">
                        <h1>Shutting down...</h1>
                    </div>
                `;
                setTimeout(() => {
                    try { window.close(); } catch(e) {}
                }, 2000);
            }, 500);
        }
    },
    
    /**
     * Get stats about the system
     */
    getStats() {
        return {
            openWindows: Object.keys(this.runningProcesses).length,
            installedApps: Object.keys(this.appRegistry).length,
            storageUsed: VFS.getStorageUsed()
        };
    }
};

// Export globally
window.OS = OS;