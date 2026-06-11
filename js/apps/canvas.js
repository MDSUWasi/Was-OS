OS.registerApp("canvas", function(pid, bodyId) {
    const container = document.getElementById(bodyId);
    
    const appShell = document.createElement("div");
    appShell.className = "canvas-container";
    appShell.innerHTML = `
        <div class="canvas-toolbar">
            <input type="color" id="clr_${pid}" value="#3584e4">
            <button style="padding: 2px 6px;" id="clr_btn_${pid}">Reset Matrix</button>
        </div>
        <canvas class="canvas-element" id="cvs_${pid}" width="500" height="300"></canvas>
    `;
    container.appendChild(appShell);
    
    const canvas = document.getElementById(`cvs_${pid}`);
    const ctx = canvas.getContext("2d");
    const colorPicker = document.getElementById(`clr_${pid}`);
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let activeDrawing = false;
    
    canvas.onmousedown = () => activeDrawing = true;
    window.addEventListener("mouseup", () => { activeDrawing = false; ctx.beginPath(); });
    
    canvas.onmousemove = function(e) {
        if (!activeDrawing) return;
        const rect = canvas.getBoundingClientRect();
        
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = colorPicker.value;
        
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };
    
    document.getElementById(`clr_btn_${pid}`).onclick = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
});