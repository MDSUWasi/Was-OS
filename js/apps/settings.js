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
            root.style.cssText = 'height:100%;background:#1a1a1e;color:#fff;padding:20px;overflow-y:auto;font-family:sans-serif;';
            
            // Title
            const header = document.createElement('h2');
            header.textContent = '⚙️ Settings';
            header.style.cssText = 'margin-bottom:20px;border-bottom:1px solid #333;padding-bottom:10px;';
            root.appendChild(header);

            // WALLPAPER SECTION
            const wpSection = document.createElement('div');
            wpSection.style.cssText = 'background:#202024;padding:20px;border-radius:8px;margin-bottom:20px;';
            
            // File Input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.id = `${pid}_upload_input`;
            fileInput.style.display = 'none';
            
            wpSection.innerHTML = `
                <h3 style="margin-top:0;color:#fff;">Desktop Wallpaper</h3>
                <p style="color:#9a9996;font-size:0.85rem;margin-bottom:15px;">Select a theme or upload your own image (Max 3MB).</p>
                
                <!-- Upload Button -->
                <button id="${pid}_upload_btn" style="width:100%;padding:12px;background:#3584e4;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;margin-bottom:15px;display:flex;align-items:center;justify-content:center;gap:8px;">
                    📂 Upload Custom Image
                </button>

                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <button data-bg="gradient" class="wp-btn" style="flex:1;min-width:100px;padding:12px;background:linear-gradient(135deg,#1c355e,#0c101f);border:2px solid #3584e4;border-radius:6px;color:white;cursor:pointer;font-size:0.85rem;">Blue Gradient</button>
                    <button data-bg="dark" class="wp-btn" style="flex:1;min-width:100px;padding:12px;background:#1a1a1e;border:2px solid #555;border-radius:6px;color:white;cursor:pointer;font-size:0.85rem;">Dark Gray</button>
                    <button data-bg="nature" class="wp-btn" style="flex:1;min-width:100px;padding:12px;background:linear-gradient(135deg,#1b4332,#2d6a4f);border:2px solid #555;border-radius:6px;color:white;cursor:pointer;font-size:0.85rem;">Nature Green</button>
                    <button data-bg="purple" class="wp-btn" style="flex:1;min-width:100px;padding:12px;background:linear-gradient(135deg,#4a148c,#7b1fa2);border:2px solid #555;border-radius:6px;color:white;cursor:pointer;font-size:0.85rem;">Purple Nebula</button>
                </div>
                <button id="${pid}_reset_bg" style="width:100%;margin-top:10px;padding:8px;background:#e01b24;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">🗑️ Reset to Default</button>
            `;
            
            // SYSTEM INFO SECTION
            const infoSection = document.createElement('div');
            infoSection.style.cssText = 'background:#202024;padding:20px;border-radius:8px;';
            infoSection.innerHTML = `
                <h3 style="margin-top:0;color:#fff;">System Information</h3>
                <div style="margin-top:10px;line-height:1.6;color:#ddd;">
                    <p><strong>OS Version:</strong> Was-OS v4.0</p>
                    <p><strong>Storage Used:</strong> ${(VFS.getStorageUsed() / 1024).toFixed(2)} KB</p>
                    <p><strong>Current BG:</strong> <span id="${pid}_bg_status">Default</span></p>
                </div>
            `;

            root.append(wpSection, infoSection);
            container.appendChild(root);
            container.appendChild(fileInput); // Append hidden input
            
            // LOGIC

            // 1. Handle Upload Button Click
            document.getElementById(`${pid}_upload_btn`).onclick = () => {
                fileInput.click();
            };

            // 2. Handle File Selection
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Check size (Max 3MB recommended for localStorage)
                if (file.size > 3 * 1024 * 1024) {
                    alert("❌ File too large! Please choose an image under 3MB.");
                    fileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64Data = evt.target.result;
                    
                    // Save to LocalStorage
                    localStorage.setItem('wasos_background', base64Data);
                    localStorage.setItem('wasos_bg_type', 'image');
                    
                    // Apply immediately
                    applyWallpaper(base64Data);
                    
                    Notifier.show({
                        title: 'Image Set',
                        message: `Loaded: ${file.name}`,
                        type: 'success'
                    });
                    
                    document.getElementById(`${pid}_bg_status`).textContent = file.name;
                    fileInput.value = ''; // Reset input
                };
                
                reader.onerror = () => {
                    alert("Error reading file.");
                };
                
                reader.readAsDataURL(file);
            };

            // 3. Theme Buttons
            const themes = {
                gradient: 'linear-gradient(135deg, #1c355e 0%, #0c101f 100%)',
                dark: '#1a1a1e',
                nature: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                purple: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)'
            };

            wpSection.querySelectorAll('.wp-btn').forEach(btn => {
                btn.onclick = () => {
                    const themeKey = btn.dataset.bg;
                    const bgValue = themes[themeKey];
                    
                    applyWallpaper(bgValue);
                    localStorage.setItem('wasos_background', bgValue);
                    localStorage.setItem('wasos_bg_type', 'color');
                    
                    Notifier.show({
                        title: 'Theme Changed',
                        message: `Active: ${btn.innerText}`,
                        type: 'success'
                    });
                    document.getElementById(`${pid}_bg_status`).textContent = btn.innerText;
                };
            });

            // 4. Reset Button
            document.getElementById(`${pid}_reset_bg`).onclick = () => {
                localStorage.removeItem('wasos_background');
                localStorage.removeItem('wasos_bg_type');
                document.body.style.background = 'linear-gradient(135deg, #1c355e 0%, #0c101f 100%)';
                document.body.style.animation = 'bgShift 15s ease infinite';
                
                Notifier.show({
                    title: 'Reset',
                    message: 'Background restored to default.',
                    type: 'info'
                });
                document.getElementById(`${pid}_bg_status`).textContent = 'Default';
            };

        } catch (e) {
            console.error("[Settings] Error:", e);
            if(container) container.innerHTML = `<div style="color:red;">Error: ${e.message}</div>`;
        }
    },
    cleanup(pid, state) {}
});

// Helper function to apply wallpaper (Global scope access needed)
function applyWallpaper(value) {
    document.body.style.background = value;
    
    // Disable animation if it's an image
    if (value.startsWith('data:image')) {
        document.body.style.animation = 'none';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    } else {
        // If it's a color/gradient, use animation
        document.body.style.animation = 'bgShift 15s ease infinite';
    }
}