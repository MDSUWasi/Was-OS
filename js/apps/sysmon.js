OS.registerApp({
    id: "sysmon",
    title: "System Monitor",
    init: function(pid, bodyId, state) {
        const target = document.getElementById(bodyId);
        state.ui = document.createElement("div");
        state.ui.style.padding = "20px";
        state.ui.style.background = "#1c1c1f";
        state.ui.style.height = "100%";
        state.ui.style.fontFamily = "sans-serif";

        target.appendChild(state.ui);

        state.loopId = setInterval(() => {
            const files = OS.VFS.list().length;
            const size = encodeURIComponent(JSON.stringify(localStorage)).length;
            
            let processRows = "";
            OS.runningProcesses.forEach((p) => {
                processRows += `<tr><td style="padding:4px 0;">${p.pid}</td><td style="color:#3584e4;">${p.title}</td></tr>`;
            });

            state.ui.innerHTML = `
                <h3 style="margin-bottom:15px; font-weight:300; color:#fff;">System Resources Status</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                    <div style="background:#2a2a2e; padding:12px; border-radius:6px;">📁 Storage Allocation<br><strong style="font-size:1.2rem; color:#2ec27e;">${files} Active Nodes</strong></div>
                    <div style="background:#2a2a2e; padding:12px; border-radius:6px;">💾 RAM Disk Footprint<br><strong style="font-size:1.2rem; color:#3584e4;">${(size / 1024).toFixed(2)} KB</strong></div>
                </div>
                <h4 style="margin-bottom:8px; font-weight:400; color:#9a9996;">Running Threads Desk</h4>
                <table style="width:100%; border-collapse:collapse; font-size:13px; color:#ddd;">
                    <thead><tr style="text-align:left; color:#777;"><th style="padding-bottom:6px;">Process ID</th><th>Task Mapping</th></tr></thead>
                    <tbody>${processRows}</tbody>
                </table>
            `;
        }, 800);
    },
    cleanup: function(pid, state) {
        clearInterval(state.loopId);
        state.ui.remove();
    }
});