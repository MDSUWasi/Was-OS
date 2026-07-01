OS.registerApp({
    id: 'paint',
    title: 'Paint',
    icon: '🎨',
    description: 'Draw with paint tools and save your art',
    category: 'productivity',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#12141d;color:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';

        const toolbar = document.createElement('div');
        toolbar.style.cssText = 'display:flex;gap:10px;align-items:center;padding:12px;background:#181b25;border-bottom:1px solid rgba(255,255,255,0.08);';
        toolbar.innerHTML = `<button id="${pid}_brush" style="padding:8px 14px;border:none;border-radius:10px;background:#3584e4;color:#fff;cursor:pointer;">Brush</button><button id="${pid}_clear" style="padding:8px 14px;border:none;border-radius:10px;background:#e01b24;color:#fff;cursor:pointer;">Clear</button><input id="${pid}_color" type="color" value="#ffffff" style="width:48px;height:40px;border:none;background:none;cursor:pointer;">`;

        const canvas = document.createElement('canvas');
        canvas.id = `${pid}_canvas`;
        canvas.style.cssText = 'flex:1;width:100%;background:#0b0c12;cursor:crosshair;display:block;';
        container.append(toolbar, canvas);

        const ctx = canvas.getContext('2d');
        let drawing = false;
        let color = '#ffffff';
        let lastPos = null;

        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 4;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function drawPoint(x, y) {
            if (!lastPos) lastPos = { x, y };
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            lastPos = { x, y };
        }

        canvas.addEventListener('mousedown', (e) => {
            drawing = true;
            lastPos = { x: e.offsetX, y: e.offsetY };
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            drawPoint(e.offsetX, e.offsetY);
        });

        canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
        canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

        document.getElementById(`${pid}_color`).addEventListener('input', (e) => { color = e.target.value; });
        document.getElementById(`${pid}_clear`).addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); });
    }
});