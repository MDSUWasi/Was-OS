OS.registerApp({
    id: "gedit",
    title: "Gedit Text Editor",
    init: function(pid, bodyId, state) {
        const target = document.getElementById(bodyId);
        state.wrapper = document.createElement("div");
        state.wrapper.style.display = "flex";
        state.wrapper.style.flexDirection = "column";
        state.wrapper.style.height = "100%";

        state.wrapper.innerHTML = `
            <div style="background:#2d2d2d; padding:8px; display:flex; gap:10px; border-bottom:1px solid #444;">
                <button id="save_${pid}" style="background:#2ea65a; color:#fff; border:none; padding:4px 10px; border-radius:3px; cursor:pointer;">💾 Save File</button>
                <button id="load_${pid}" style="background:#3584e4; color:#fff; border:none; padding:4px 10px; border-radius:3px; cursor:pointer;">📂 Open Path</button>
                <input type="text" id="path_${pid}" value="home/user/welcome.md" style="background:#1e1e1e; color:#fff; border:1px solid #555; padding:2px 8px; flex:1; font-family:monospace; border-radius:3px;">
            </div>
            <textarea id="text_${pid}" style="flex:1; background:#1e1e1e; color:#fff; border:none; padding:15px; font-family:Consolas, monospace; font-size:14px; outline:none; resize:none;"></textarea>
        `;
        target.appendChild(state.wrapper);

        const pathInput = document.getElementById(`path_${pid}`);
        const editorArea = document.getElementById(`text_${pid}`);

        editorArea.value = OS.VFS.read(pathInput.value) || "";

        document.getElementById(`save_${pid}`).onclick = () => {
            OS.VFS.write(pathInput.value, editorArea.value);
            alert(`File saved to secure localized VFS node: ${pathInput.value}`);
        };

        document.getElementById(`load_${pid}`).onclick = () => {
            const files = OS.VFS.list();
            const chosen = prompt(`Available System Files:\n\n${files.join('\n')}\n\nEnter absolute structural path:`, pathInput.value);
            if (chosen) {
                pathInput.value = chosen;
                editorArea.value = OS.VFS.read(chosen) || "";
            }
        };
    },
    cleanup: function(pid, state) {
        state.wrapper.remove();
    }
});