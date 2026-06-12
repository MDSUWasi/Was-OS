/**
 * Was-OS Settings v4.0 - FIXED
 */

OS.registerApp({
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    description: 'System configuration',
    category: 'system',
    singleInstance: true,
    
    init(pid, bodyId, state) {
        try {
            const container = document.getElementById(bodyId);
            if (!container) throw new Error("Container missing");
            
            const root = document.createElement('div');
            root.style.cssText = 'height:100%;background:#1a1a1e;color:#fff;padding:20px;overflow-y:auto;';
            
            // Section: Appearance
            const section1 = document.createElement('div');
            section1.style.cssText = 'margin-bottom:20px;padding:15px;background:#202024;border-radius:8px;';
            section1.innerHTML = `
                <h3 style="margin-top:0;">Desktop Theme</h3>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button data-theme="gradient" style="padding:10px;background:linear-gradient(135deg,#1c355e,#0c101f);border:2px solid #3584e4;border-radius:6px;color:white;cursor:pointer;">Blue Gradient</button>
                    <button data-theme="dark" style="padding:10px;background:#1a1a1e;border:2px solid #555;border-radius:6px;color:white;cursor:pointer;">Dark Gray</button>
                    <button data-theme="nature" style="padding:10px;background:linear-gradient(135deg,#1b4332,#2d6a4f);border:2px solid #555;border-radius:6px;color:white;cursor:pointer;">Nature Green</button>
                </div>
            `;
            
            // Section: Info
            const section2 = document.createElement('div');
            section2.style.cssText = 'margin-bottom:20px;padding:15px;background:#202024;border-radius:8px;';
            section2.innerHTML = `
                <h3 style="margin-top:0;">System Info</h3>
                <p>Version: Was-OS v4.0</p>
                <p>Build: ${new Date().getFullYear()}</p>
                <p>Storage Used: ${(VFS.getStorageUsed()/1024).toFixed(2)} KB</p>
            `;
            
            root.append(section1, section2);
            container.appendChild(root);
            
            // Theme Logic (Local)
            const themes = {
                gradient: 'linear-gradient(135deg, #1c355e 0%, #0c101f 100%)',
                dark: '#1a1a1e',
                nature: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)'
            };
            
            section1.querySelectorAll('button').forEach(btn => {
                btn.onclick = () => {
                    const theme = btn.dataset.theme;
                    document.body.style.background = themes[theme];
                    document.body.style.animation = theme === 'gradient' ? 'bgShift 15s ease infinite' : 'none';
                    localStorage.setItem('wasos_background', themes[theme]);
                    
                    Notifier.show({
                        title: 'Theme Applied',
                        message: `Changed to ${btn.innerText}`,
                        type: 'success'
                    });
                };
            });
            
        } catch (e) {
            console.error("[Settings] Error:", e);
            if(container) container.innerHTML = `<div style="color:red">${e.message}</div>`;
        }
    },
    cleanup() {}
});