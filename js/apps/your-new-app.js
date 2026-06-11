OS.registerApp({
    id: "app_id_slug",
    title: "Human Readable Display Title",
    init: function(pid, bodyId, state) {
        const rootElement = document.getElementById(bodyId);
        
        // 1. Build custom application interface elements here
        state.myUI = document.createElement("div");
        state.myUI.innerHTML = `<h1>Functional Scope Layer</h1>`;
        rootElement.appendChild(state.myUI);
        
        // 2. Attach specialized listeners or compute workers
        state.workerLoop = setInterval(() => {
             // Handle background updates here safely
        }, 1000);
    },
    cleanup: function(pid, state) {
        // 3. Always clear intervals/timeouts to maintain OS speed performance
        clearInterval(state.workerLoop);
        state.myUI.remove();
    }
});