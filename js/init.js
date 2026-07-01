(function() {
    const bootTime = performance.now();
    
    console.log('%c╔═══════════════════════════════════╗', 'color:#3584e4;font-weight:bold;');
    console.log('%c║      Was-Operating System         ║', 'color:#3584e4;');
    console.log('%c╚═══════════════════════════════════╝', 'color:#3584e4;font-weight:bold;');
    
    window.addEventListener('load', async () => {
        try {
            VFS.init();
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
            if (typeof OS !== 'undefined') {
                OS.setupStartMenu();
                OS.Clock?.init?.();
                OS.Calendar?.init?.();
            }
            const savedTheme = localStorage.getItem('wasos_theme');
            if (savedTheme) {
                applyTheme(savedTheme);
            }

            const savedBackground = localStorage.getItem('wasos_background');
            const bgType = localStorage.getItem('wasos_bg_type');
            if (savedBackground) {
                applyBackground(savedBackground, bgType);
            }

            const savedWindowStyle = localStorage.getItem('wasos_window_style');
            if (savedWindowStyle) {
                document.body.classList.add(`window-style-${savedWindowStyle}`);
            }

            const clockVisible = localStorage.getItem('wasos_show_clock');
            const dateVisible = localStorage.getItem('wasos_show_date');
            document.getElementById('clock').style.display = clockVisible === 'false' ? 'none' : 'inline-flex';
            document.getElementById('calendar').style.display = dateVisible === 'false' ? 'none' : 'inline-flex';
            const totalTime = ((performance.now() - bootTime) / 1000).toFixed(2);
            console.log(`%c✅ Was-OS initialized in ${totalTime}s`, 'color:#2ec27e');
            
            setTimeout(() => {
                Notifier.show({
                    title: 'System Ready',
                    message: 'Welcome to Was-OS v5.0!',
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
        
        bindUIEvents();
    });
    
    function bindUIEvents() {
        document.getElementById('start-btn')?.addEventListener('click', () => {
            WindowManager?.toggleStartMenu?.();
        });
        
        document.getElementById('activities-btn')?.addEventListener('click', () => {
            WindowManager?.toggleActivities?.();
        });
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            OS?.launchApp('settings');
        });
        
        document.getElementById('power-btn')?.addEventListener('click', () => {
            OS?.shutdown();
        });
        
        document.getElementById('shutdown-btn')?.addEventListener('click', () => {
            OS?.shutdown();
        });
        
        document.getElementById('show-all-btn')?.addEventListener('click', () => {
            WindowManager?.toggleStartMenu?.();
            OS?.launchApp('external-apps');
        });
        
        updateClock();
        setInterval(updateClock, 1000);
        updateCalendar();
        
        document.addEventListener('click', (e) => {
            const startMenu = document.getElementById('start-menu');
            const activities = document.getElementById('activities-overlay');
            
            if (startMenu && !startMenu.contains(e.target) && 
                e.target.id !== 'start-btn' && e.target.closest('#start-btn') === null) {
                startMenu.classList.add('hidden');
            }

            if (activities && !activities.contains(e.target) &&
                e.target.id !== 'activities-btn' && e.target.closest('#activities-btn') === null) {
                activities.classList.add('hidden');
            }
        });
        
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
            nature: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            purple: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)'
        };
        
        const bg = themes[themeName] || themes.gradient;
        document.body.style.background = bg;
        document.body.style.animation = themeName === 'gradient' ? 'bgShift 15s ease infinite' : 'none';
        localStorage.setItem('wasos_theme', themeName);
    }

    function applyBackground(value, type = 'color') {
        document.body.style.background = value;
        if (type === 'image' && value.startsWith('data:image')) {
            document.body.style.animation = 'none';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
        } else {
            document.body.style.animation = 'bgShift 15s ease infinite';
        }
    }
})();