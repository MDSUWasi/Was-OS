/**
 * Was-OS Notepad v4.0 - FIXED
 */

OS.registerApp({
    id: 'notepad',
    title: 'Notepad',
    icon: '📝',
    description: 'Text editor',
    category: 'productivity',
    
    init(pid, bodyId, state) {
        try {
            const container = document.getElementById(bodyId);
            if (!container) throw new Error("Container missing");
            
            state.tabs = [];
            state.activeTabIndex = -1;
            
            const root = document.createElement('div');
            root.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1e1e1e;font-family:sans-serif;';
            
            // Toolbar
            const toolbar = document.createElement('div');
            toolbar.style.cssText = 'display:flex;gap:8px;padding:10px;background:#242428;border-bottom:1px solid #333;';
            
            const newBtn = document.createElement('button');
            newBtn.textContent = '+ New';
            newBtn.style.cssText = 'background:#3584e4;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;';
            
            const saveBtn = document.createElement('button');
            saveBtn.textContent = '💾 Save';
            saveBtn.style.cssText = 'background:#2ec27e;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;';
            
            const statusSpan = document.createElement('span');
            statusSpan.id = `${pid}_status`;
            statusSpan.style.cssText = 'margin-left:auto;color:#999;font-size:0.8rem;line-height:30px;';
            statusSpan.textContent = 'Ready';
            
            toolbar.append(newBtn, saveBtn, statusSpan);
            
            // Editor Area
            const editorArea = document.createElement('textarea');
            editorArea.style.cssText = 'flex:1;background:#1e1e1e;color:#fff;border:none;padding:20px;font-family:monospace;font-size:0.95rem;resize:none;outline:none;';
            editorArea.placeholder = 'Start typing...';
            
            root.append(toolbar, editorArea);
            container.appendChild(root);
            
            // Create initial tab
            addNewTab();
            
            // Helper: Add Tab
            function addNewTab() {
                const name = prompt("File name:", "untitled.txt") || "untitled.txt";
                state.tabs.push({
                    name: name,
                    content: '',
                    dirty: false
                });
                state.activeTabIndex = state.tabs.length - 1;
                updateStatus();
            }
            
            // Helper: Update Status
            function updateStatus() {
                const tab = state.tabs[state.activeTabIndex];
                if(tab) {
                    statusSpan.textContent = tab.dirty ? "* Unsaved changes" : "Ready";
                    statusSpan.style.color = tab.dirty ? "#f5c211" : "#999";
                }
            }
            
            // Event: New Button
            newBtn.onclick = addNewTab;
            
            // Event: Save Button
            saveBtn.onclick = () => {
                const tab = state.tabs[state.activeTabIndex];
                if(!tab) return;
                
                let filename = tab.name;
                if(filename.startsWith('untitled')) {
                    filename = prompt("Save as:", `documents/${filename}`) || `documents/${Date.now()}.txt`;
                }
                
                VFS.write(filename, editorArea.value);
                tab.content = editorArea.value;
                tab.dirty = false;
                updateStatus();
                Notifier.show({title: 'Saved', message: `Saved to ${filename}`, type: 'success'});
            };
            
            // Event: Input (Dirty tracking)
            editorArea.addEventListener('input', () => {
                const tab = state.tabs[state.activeTabIndex];
                if(tab && tab.content !== editorArea.value) {
                    tab.content = editorArea.value;
                    tab.dirty = true;
                    updateStatus();
                }
            });
            
        } catch (e) {
            console.error("[Notepad] Error:", e);
            if(container) container.innerHTML = `<div style="color:red">${e.message}</div>`;
        }
    },
    cleanup() {}
});