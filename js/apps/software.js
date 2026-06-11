OS.registerApp({
    id: "software",
    title: "Software Center",
    init: function(pid, bodyId, state) {
        const target = document.getElementById(bodyId);
        state.container = document.createElement("div");
        state.container.style.padding = "20px";
        state.container.style.background = "#242424";
        state.container.style.height = "100%";
        state.container.style.overflowY = "auto";

        state.container.innerHTML = `
            <h2 style="margin-bottom:15px; font-weight:400;">Was-OS Repositories</h2>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="background:#333; padding:15px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>Gedit Text Editor</strong><br><small style="color:#aaa;">Simple text and code document system processor</small></div>
                    <button id="btn_gedit_${pid}" style="background:#3584e4; border:none; padding:6px 12px; color:#fff; border-radius:4px; cursor:pointer;">Launch</button>
                </div>
                <div style="background:#333; padding:15px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>System Monitor Core</strong><br><small style="color:#aaa;">Review processing usage overhead logs</small></div>
                    <button id="btn_mon_${pid}" style="background:#3584e4; border:none; padding:6px 12px; color:#fff; border-radius:4px; cursor:pointer;">Launch</button>
                </div>
            </div>
        `;
        target.appendChild(state.container);

        document.getElementById(`btn_gedit_${pid}`).onclick = () => OS.launchApp('gedit');
        document.getElementById(`btn_mon_${pid}`).onclick = () => OS.launchApp('sysmon');
    },
    cleanup: function(pid, state) {
        state.container.remove();
    }
});