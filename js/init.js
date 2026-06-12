(function() {
    const bootTime = performance.now();
    
    console.log('%c╔═══════════════════════════════════╗', 'color:#3584e4;font-weight:bold;');
    console.log('%c║      Was-Operating System         ║', 'color:#3584e4;');
    console.log('%c╚═══════════════════════════════════╝', 'color:#3584e4;font-weight:bold;');
    
    window.addEventListener('load', async () => {
        try {
            // 1. Initialize VFS
            VFS.init();
            
            // 2. Initialize Core Components
            await Promise.all([
                new Promise(resolve => {
                    if (typeof WindowManager !== 'undefined') {
                        WindowManager.init();
                        resolve();
                    } else {
                        console.error('[ERROR] WindowManager not loaded!');
                        resolve();
                    }
                }),
                new Promise(resolve => {
                    if (typeof Notifier !== 'undefined') {
                        Notifier.init();
                        resolve();
                    } else {
                        console.error('[ERROR] Notifier not loaded!');
                        resolve();
                    }
                })
            ]);
            
            // 3. Setup UI Components
            if (typeof OS !== 'undefined') {
                OS.setupStartMenu();
                OS.Clock?.init?.();
                OS.Calendar?.init?.();
            }
            
            // 4. Restore User Settings
            const savedTheme = localStorage.getItem('wasos_theme');
            if (savedTheme) {
                applyTheme(savedTheme);
            }
            
            // 5. Calculate Boot Time
            const totalTime = ((performance.now() - bootTime) / 1000).toFixed(2);
            console.log(`%c✅ Was-OS initialized in ${totalTime}s`, 'color:#2ec27e');
            
            // 6. Welcome Notification
            setTimeout(() => {
                Notifier.show({
                    title: 'System Ready',
                    message: 'Welcome to Was-OS v4.0!',
                    type: 'success',
                    duration: 4000
                });
            }, 1500);
            
        } catch (error) {
            console.error('[BOOT] Critical error:', error);
            document.body.innerHTML = `
                <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a1a1e;color:#fff;font-family:sans-serif;text-align:center;padding:20px;">
                    <div>
                        <h1>⚠️ Boot Error</h1>
                        <p>Unable to initialize system. Please refresh.</p>
                        <p style="color:#999;margin-top:20px;font-size:0.9rem;">${error.message}</p>
                    </div>
                </div>
            `;
        }
        
        // Event Listeners
        bindUIEvents();
    });
    
    // Bind UI Event Listeners
    function bindUIEvents() {
        // Start Button
        document.getElementById('start-btn')?.addEventListener('click', () => {
            WindowManager?.toggleStartMenu?.();
        });
        
        // Activities Button
        document.getElementById('activities-btn')?.addEventListener('click', () => {
            WindowManager?.toggleActivities?.();
        });
        
        // Settings Button
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            OS?.launchApp('settings');
        });
        
        // Power Button
        document.getElementById('power-btn')?.addEventListener('click', () => {
            OS?.shutdown();
        });
        
        // Shutdown in Start Menu
        document.getElementById('shutdown-btn')?.addEventListener('click', () => {
            OS?.shutdown();
        });
        
        // Show All in Start Menu
        document.getElementById('show-all-btn')?.addEventListener('click', () => {
            OS?.launchApp('software');
        });
        
        // Clock & Calendar
        updateClock();
        setInterval(updateClock, 1000);
        updateCalendar();
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            const startMenu = document.getElementById('start-menu');
            const activities = document.getElementById('activities-overlay');
            
            if (startMenu && !startMenu.contains(e.target) && 
                e.target.id !== 'start-btn' && e.target.closest('#start-btn') === null) {
                startMenu.classList.add('hidden');
            }
        });
        
        // Prevent accidental tab close
        window.addEventListener('beforeunload', (e) => {
            const openWindows = WindowManager?.getWindowCount?.() || 0;
            if (openWindows > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    function updateClock() {
        const el = document.getElementById('clock');
        if (el) {
            el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    
    function updateCalendar() {
        const el = document.getElementById('calendar');
        if (el) {
            el.textContent = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }
    
    function applyTheme(themeName) {
        const themes = {
            gradient: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0a0e17 100%)',
            dark: '#1a1a1e',
            nature: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)'
        };
        
        const bg = themes[themeName] || themes.gradient;
        document.body.style.background = bg;
        document.body.style.animation = themeName === 'gradient' ? 'bgShift 15s ease infinite' : 'none';
    }
})();