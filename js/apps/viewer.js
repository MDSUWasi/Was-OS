OS.registerApp({
    id: 'viewer',
    title: 'Viewer',
    icon: '🖼️',
    description: 'View images and documents inside Was-OS',
    category: 'utilities',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#11131a;color:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';

        const topBar = document.createElement('div');
        topBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px;background:#161a24;border-bottom:1px solid rgba(255,255,255,0.08);';
        topBar.innerHTML = `<div style="font-size:1rem;color:#ccc;">Image Viewer</div><button id="${pid}_close" style="padding:8px 14px;border:none;border-radius:10px;background:#e01b24;color:#fff;cursor:pointer;">Close</button>`;

        const viewer = document.createElement('div');
        viewer.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;padding:20px;';

        const targetPath = localStorage.getItem('wasos_shared_view_target');

        if (targetPath && VFS.exists(targetPath)) {
            const data = VFS.read(targetPath);
            const img = document.createElement('img');
            img.src = data;
            img.style.cssText = 'max-width:100%;max-height:100%;border-radius:14px;box-shadow:0 30px 90px rgba(0,0,0,0.4);';
            viewer.appendChild(img);
        } else {
            viewer.innerHTML = '<div style="color:#999;text-align:center;">No image selected or file not found.</div>';
        }

        container.append(topBar, viewer);

        document.getElementById(`${pid}_close`).addEventListener('click', () => {
            OS.closeProcess(pid);
        });
    }
});