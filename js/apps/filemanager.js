OS.registerApp({
    id: 'filemanager',
    title: 'File Manager',
    icon: '📁',
    description: 'Browse files',
    category: 'utilities',
    
    init(pid, bodyId, state) {
        try {
            const container = document.getElementById(bodyId);
            if (!container) throw new Error("Container missing");
            
            state.currentPath = ''; // Root
            
            const root = document.createElement('div');
            root.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#1a1a1e;';
            
            // Path Bar
            const pathBar = document.createElement('div');
            pathBar.style.cssText = 'display:flex;gap:8px;padding:10px;background:#242428;border-bottom:1px solid #333;align-items:center;';
            pathBar.innerHTML = `
                <button id="${pid}_up" style="background:#333;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">↑ Up</button>
                <div id="${pid}_path_display" style="flex:1;color:#999;font-size:0.85rem;">Root</div>
            `;
            
            // Grid
            const grid = document.createElement('div');
            grid.id = `${pid}_grid`;
            grid.style.cssText = 'flex:1;padding:15px;display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:15px;overflow-y:auto;';
            
            root.append(pathBar, grid);
            container.appendChild(root);
            
            // Render Function
            function render() {
                const display = document.getElementById(`${pid}_path_display`);
                const gridEl = document.getElementById(`${pid}_grid`);
                
                display.textContent = state.currentPath ? `📂 ${state.currentPath}` : '📂 Root';
                gridEl.innerHTML = '';
                
                const items = VFS.list(state.currentPath);
                
                if(items.length === 0) {
                    gridEl.innerHTML = '<div style="color:#666;text-align:center;padding:40px;grid-column:1/-1;">Folder is empty</div>';
                    return;
                }
                
                items.forEach(name => {
                    const fullPath = state.currentPath ? `${state.currentPath}/${name}` : name;
                    const isDir = VFS.isDirectory(fullPath);
                    const ext = name.split('.').pop().toLowerCase();
                    
                    let icon = isDir ? '📁' : '📄';
                    if(['png','jpg'].includes(ext)) icon = '🖼️';
                    
                    const item = document.createElement('div');
                    item.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:15px;background:#202024;border-radius:6px;cursor:pointer;transition:0.2s;';
                    item.innerHTML = `<span style="font-size:2rem;">${icon}</span><span style="font-size:0.75rem;margin-top:5px;word-break:break-word;">${name}</span>`;
                    
                    item.onmouseenter = () => item.style.background = '#333';
                    item.onmouseleave = () => item.style.background = '#202024';
                    
                    item.onclick = () => {
                        if(isDir) {
                            state.currentPath = fullPath;
                            render();
                        } else {
                            if(['png','jpg'].includes(ext)) {
                                localStorage.setItem('wasos_shared_view_target', fullPath);
                                OS.launchApp('viewer');
                            } else {
                                const content = VFS.read(fullPath);
                                alert(`Content:\n\n${content?.substring(0, 100)}...`);
                            }
                        }
                    };
                    
                    gridEl.appendChild(item);
                });
            }
            
            // Up Button
            document.getElementById(`${pid}_up`).onclick = () => {
                if(!state.currentPath) return;
                const parts = state.currentPath.split('/').filter(Boolean);
                if(parts.length > 1) {
                    parts.pop();
                    state.currentPath = parts.join('/');
                } else {
                    state.currentPath = '';
                }
                render();
            };
            
            render();
            
        } catch (e) {
            console.error("[FileManager] Error:", e);
            if(container) container.innerHTML = `<div style="color:red">${e.message}</div>`;
        }
    },
    cleanup() {}
});