// ============================================================================
// 1. SIMULATED TERMINAL ENVIRONMENT APPLICATION
// ============================================================================
OS.registerApp("terminal", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    let currentDir = "documents";

    const termRoot = document.createElement("div");
    termRoot.className = "terminal-app-root";
    termRoot.innerHTML = `
        <div class="terminal-output-log" id="${pid}_term_out">WEBOS TERMINAL INTERACTION LAYER [Version 1.2.0]\nType 'help' to review structural command logs.\n\n</div>
        <div class="terminal-input-row">
            <span class="terminal-prompt">webos@local:~/${currentDir}$</span>
            <input type="text" class="terminal-input-field" id="${pid}_term_in" autofocus autocomplete="off" spellcheck="false">
        </div>
    `;
    parent.appendChild(termRoot);

    const outNode = document.getElementById(`${pid}_term_out`);
    const inNode = document.getElementById(`${pid}_term_in`);

    termRoot.onclick = () => inNode.focus();

    inNode.onkeydown = function(e) {
        if (e.key === "Enter") {
            const fullRawCmd = inNode.value.trim();
            inNode.value = "";
            if (!fullRawCmd) return;

            outNode.innerText += `webos@local:~/${currentDir}$ ${fullRawCmd}\n`;
            
            const tokens = fullRawCmd.split(" ");
            const cmd = tokens[0].toLowerCase();
            const arg = tokens.slice(1).join(" ");

            switch(cmd) {
                case "help":
                    outNode.innerText += "Available System Commands:\n  help               Display command references\n  ls                 List structural system directory items\n  cat [file]         Output plaintext file matrix contents\n  clear              Flush command screen buffer lines\n  neofetch           Display hardware configuration telemetry\n  rm [file]          Purge targeted asset index from memory space\n";
                    break;
                case "ls":
                    const list = OS.VFS.listFiles();
                    outNode.innerText += list.join("\n") + "\n";
                    break;
                case "cat":
                    if (!arg) { outNode.innerText += "Fault error: Target address input parameters missing.\n"; break; }
                    const txt = OS.VFS.readFile(arg);
                    outNode.innerText += txt !== null ? `${txt}\n` : "System Error: File node path resolution failure.\n";
                    break;
                case "rm":
                    if (!arg) { outNode.innerText += "Fault error: Target argument missing.\n"; break; }
                    const dataDrive = JSON.parse(localStorage.getItem("webos_vfs_root"));
                    if (dataDrive[arg] !== undefined) {
                        delete dataDrive[arg];
                        localStorage.setItem("webos_vfs_root", JSON.stringify(dataDrive));
                        outNode.innerText += `Successfully deleted [${arg}].\n`;
                    } else { outNode.innerText += "File target reference path mismatch.\n"; }
                    break;
                case "neofetch":
                    outNode.innerText += "██████████████████████████\n   OS: WebOS Client-Side Pro 2026\n   KERNEL: JavaScript Core V8 Engine\n   UPTIME: Environment active sandbox\n   MEMORY: LocalStorage Allotment Stack\n   DISPLAY: Floating DOM Window Frame Workspace Grid\n██████████████████████████\n";
                    break;
                case "clear":
                    outNode.innerText = "";
                    break;
                default:
                    outNode.innerText += `Command Exception: Reference string structure '${cmd}' not globally recognized.\n`;
            }
            outNode.scrollTop = outNode.scrollHeight;
        }
    };
});

// ============================================================================
// 2. RUNTIME GRAPHICAL SYSTEM STATE MONITOR
// ============================================================================
OS.registerApp("sysmon", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    const root = document.createElement("div");
    root.className = "sysmon-app-root";
    parent.appendChild(root);

    function rebuildMonitorData() {
        const fileCount = OS.VFS.listFiles().length;
        const totalProcs = Object.keys(OS.runningProcesses).length;
        const bytesUsed = encodeURIComponent(JSON.stringify(localStorage)).length;

        root.innerHTML = `
            <div class="sysmon-metric-grid">
                <div class="sysmon-card"><div>Active Processes</div><div class="sysmon-value">${totalProcs} PIDs</div></div>
                <div class="sysmon-card"><div>Allocated Files</div><div class="sysmon-value">${fileCount} Nodes</div></div>
                <div class="sysmon-card"><div>VFS Storage Load</div><div class="sysmon-value">${(bytesUsed / 1024).toFixed(2)} KB</div></div>
            </div>
            <h3 style="margin-bottom: 8px; font-size:0.9rem;">KERNEL SCHEDULER ACTIVE CONTROLS</h3>
            <table class="sysmon-table">
                <thead><tr><th>PID Hash</th><th>Process Tag Identifier</th><th>Actions</th></tr></thead>
                <tbody id="${pid}_proc_body"></tbody>
            </table>
        `;

        const tbody = document.getElementById(`${pid}_proc_body`);
        Object.keys(OS.runningProcesses).forEach(pKey => {
            const p = OS.runningProcesses[pKey];
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${p.pid}</td><td>${p.title}</td><td><button style="color:#ff5555; background:none; border:1px solid #ff5555; cursor:pointer; font-size:0.75rem; padding:2px 6px; border-radius:3px;" onclick="OS.closeProcess('${p.pid}');">CLOSE</button></td>`;
            tbody.appendChild(tr);
        });
    }

    const syncLoopId = setInterval(rebuildMonitorData, 1500);
    rebuildMonitorData();

    const originalClose = OS.closeProcess;
    OS.closeProcess = function(targetPid) {
        if(targetPid === pid) clearInterval(syncLoopId);
        originalClose.apply(this, arguments);
    };
});

// ============================================================================
// 3. ADVANCED FEATURE-RICH HTML5 GRAPHICS CANVAS SUITE
// ============================================================================
OS.registerApp("canvas", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    let brushColor = "#89b4fa";
    let brushSize = 5;
    let operationMode = "draw";

    const view = document.createElement("div");
    view.className = "canvas-app-root";
    view.innerHTML = `
        <div class="canvas-toolbar">
            <input type="color" class="notepad-btn" id="${pid}_color" value="${brushColor}">
            <select class="notepad-btn" id="${pid}_size">
                <option value="2">Fine Line (2px)</option><option value="5" selected>Standard (5px)</option><option value="12">Medium Stroke (12px)</option><option value="30">Heavy Block (30px)</option>
            </select>
            <button class="notepad-btn" id="${pid}_tool_draw">✍️ Paint Brush</button>
            <button class="notepad-btn" id="${pid}_tool_erase">🧽 Eraser Block</button>
            <button class="notepad-btn" id="${pid}_tool_clear">🗑️ Clear Canvas</button>
            <button class="notepad-btn" id="${pid}_tool_save" style="background-color:#a6e3a1; color:#111;">💾 Commit Image</button>
        </div>
        <div class="canvas-workspace-wrapper">
            <canvas class="canvas-render-element" id="${pid}_cvs" width="600" height="400"></canvas>
        </div>
    `;
    parent.appendChild(view);

    const canvas = document.getElementById(`${pid}_cvs`);
    const ctx = canvas.getContext("2d");
    let activeDrawingState = false;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById(`${pid}_color`).onchange = (e) => brushColor = e.target.value;
    document.getElementById(`${pid}_size`).onchange = (e) => brushSize = parseInt(e.target.value);
    document.getElementById(`${pid}_tool_draw`).onclick = () => operationMode = "draw";
    document.getElementById(`${pid}_tool_erase`).onclick = () => operationMode = "erase";
    document.getElementById(`${pid}_tool_clear`).onclick = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    document.getElementById(`${pid}_tool_save`).onclick = () => {
        const outputFilename = prompt("Provide alphanumeric label tracking for this illustration graphic:", "drawing.png");
        if (outputFilename) {
            const dataUrlString = canvas.toDataURL("image/png");
            OS.VFS.writeFile(`documents/${outputFilename.endsWith('.png') ? outputFilename : outputFilename + '.png'}`, dataUrlString);
            alert("Illustration layout successfully captured and committed onto local storage vectors.");
        }
    };

    canvas.onmousedown = (e) => { activeDrawingState = true; drawCoordinateTrack(e); };
    window.addEventListener("mouseup", () => { activeDrawingState = false; ctx.beginPath(); });
    canvas.onmousemove = (e) => drawCoordinateTrack(e);

    function drawCoordinateTrack(e) {
        if (!activeDrawingState) return;
        const rect = canvas.getBoundingClientRect();
        const drawPositionX = e.clientX - rect.left;
        const drawPositionY = e.clientY - rect.top;

        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = operationMode === "erase" ? "#ffffff" : brushColor;

        ctx.lineTo(drawPositionX, drawPositionY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(drawPositionX, drawPositionY);
    }
});

// ============================================================================
// 4. INTERACTIVE VISUAL FILE MANAGER WORKSPACE
// ============================================================================
OS.registerApp("filemanager", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    const root = document.createElement("div");
    root.className = "fm-app-root";
    parent.appendChild(root);

    function redrawDirectoryTree() {
        root.innerHTML = `<div class="notepad-control-bar"><span style="font-size:0.75rem; padding-top:4px;">Drive Mapping Context: Root/documents/</span></div><div class="fm-grid" id="${pid}_fm_grid"></div>`;
        const container = document.getElementById(`${pid}_fm_grid`);
        const itemKeysArray = OS.VFS.listFiles();

        itemKeysArray.forEach(filePath => {
            const fileItem = document.createElement("div");
            fileItem.className = "fm-item";
            const fileExtension = filePath.split('.').pop().toLowerCase();
            
            let descriptiveGraphicSymbol = "📝";
            if (["png", "jpg", "jpeg", "webp"].includes(fileExtension)) descriptiveGraphicSymbol = "🖼️";

            fileItem.innerHTML = `
                <div class="fm-icon">${descriptiveGraphicSymbol}</div>
                <div class="fm-label">${filePath.split('/').pop()}</div>
            `;

            fileItem.onclick = () => {
                if (descriptiveGraphicSymbol === "🖼️") {
                    localStorage.setItem("webos_shared_view_target", filePath);
                    OS.launchApp("viewer");
                } else {
                    alert(`File Management System Inspection:\nPath: root/${filePath}\n\nUse the Tabbed Editor or Word Processor applications to modify this file.`);
                }
            };
            container.appendChild(fileItem);
        });
    }
    
    redrawDirectoryTree();
    document.getElementById(pid).addEventListener("mousedown", () => redrawDirectoryTree());
});

// ============================================================================
// 5. GRID CALCULATOR APPLICATION
// ============================================================================
OS.registerApp("calc", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    let sequenceBufferString = "";

    const shell = document.createElement("div");
    shell.className = "calc-app-root";
    shell.innerHTML = `
        <div class="calc-screen" id="${pid}_screen">0</div>
        <div class="calc-buttons-grid">
            <button class="notepad-btn btn-c">C</button><button class="notepad-btn op">/</button><button class="notepad-btn op">*</button><button class="notepad-btn op">-</button>
            <button class="notepad-btn num">7</button><button class="notepad-btn num">8</button><button class="notepad-btn num">9</button><button class="notepad-btn op">+</button>
            <button class="notepad-btn num">4</button><button class="notepad-btn num">5</button><button class="notepad-btn num">6</button><button class="notepad-btn eq" style="grid-row: span 2; background-color:var(--accent-blue); color:#111;">=</button>
            <button class="notepad-btn num">1</button><button class="notepad-btn num">2</button><button class="notepad-btn num">3</button>
            <button class="notepad-btn num" style="grid-columns: span 2;">0</button><button class="notepad-btn num">.</button>
        </div>
    `;
    parent.appendChild(shell);
    const monitor = document.getElementById(`${pid}_screen`);

    shell.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
            const val = btn.innerText;
            if (val === "C") {
                sequenceBufferString = "";
                monitor.innerText = "0";
            } else if (val === "=") {
                try {
                    if(!sequenceBufferString) return;
                    const calculatedOutputs = new Function(`return ${sequenceBufferString}`)();
                    monitor.innerText = calculatedOutputs;
                    sequenceBufferString = String(calculatedOutputs);
                } catch {
                    monitor.innerText = "Error";
                    sequenceBufferString = "";
                }
            } else {
                sequenceBufferString += val;
                monitor.innerText = sequenceBufferString;
            }
        };
    });
});

// ============================================================================
// 6. BASE64 FILE SYSTEM IMAGE / PHOTO VIEWER
// ============================================================================
OS.registerApp("viewer", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    const frame = document.createElement("div");
    frame.className = "viewer-app-root";
    frame.innerHTML = `
        <div class="notepad-control-bar">
            <button class="notepad-btn click-load">📂 Mount Photo File</button>
        </div>
        <div class="viewer-display-zone"><img id="${pid}_img" class="viewer-img-element" src="" style="display:none;"></div>
    `;
    parent.appendChild(frame);

    const imgTag = document.getElementById(`${pid}_img`);

    function resolveImageLoadSequence(path) {
        const contentPayload = OS.VFS.readFile(path);
        if (contentPayload && contentPayload.startsWith("data:image")) {
            imgTag.src = contentPayload;
            imgTag.style.display = "block";
        } else {
            alert("File Exception Error: Selected node path context does not contain parsed image base64 asset streams.");
        }
    }

    frame.querySelector(".click-load").onclick = () => {
        const indexList = OS.VFS.listFiles().filter(f => f.endsWith(".png") || f.endsWith(".jpg"));
        if(indexList.length === 0) { alert("No valid image files located in the file system context layers."); return; }
        const pathChoice = prompt(`Target index paths found:\n\n${indexList.join("\n")}\n\nType desired file path:`, indexList[0]);
        if(pathChoice) resolveImageLoadSequence(pathChoice);
    };

    const targetInterprocSharedKey = localStorage.getItem("webos_shared_view_target");
    if (targetInterprocSharedKey) {
        resolveImageLoadSequence(targetInterprocSharedKey);
        localStorage.removeItem("webos_shared_view_target");
    }
});

// ============================================================================
// 7. RICH TEXT DESIGN DOCUMENT / WORD PROCESSOR
// ============================================================================
OS.registerApp("word", function(pid, bodyId) {
    const parent = document.getElementById(bodyId);
    const workspaceShell = document.createElement("div");
    workspaceShell.className = "word-app-root";
    
    let activeWordFilePath = null;

    workspaceShell.innerHTML = `
        <div class="canvas-toolbar">
            <button class="notepad-btn word-new">📄 New doc</button>
            <button class="notepad-btn word-open">📂 Load</button>
            <button class="notepad-btn word-save" style="background-color:#a6e3a1; color:#111;">💾 Commit</button>
            <span style="color:var(--text-muted); margin:0 10px;">|</span>
            <button class="notepad-btn style-trigger" data-cmd="bold" style="font-weight:bold;">B</button>
            <button class="notepad-btn style-trigger" data-cmd="italic" style="font-style:italic;">I</button>
            <button class="notepad-btn style-trigger" data-cmd="underline" style="text-decoration:underline;">U</button>
            <button class="notepad-btn style-trigger" data-cmd="insertUnorderedList">• List</button>
        </div>
        <div class="window-body-canvas">
            <div class="word-editor-canvas" id="${pid}_editable" contenteditable="true"><h1>Document Header</h1><p>Start writing rich documents here...</p></div>
        </div>
    `;
    parent.appendChild(workspaceShell);

    const editableField = document.getElementById(`${pid}_editable`);

    workspaceShell.querySelectorAll(".style-trigger").forEach(controlBtn => {
        controlBtn.onclick = () => {
            const frameworkStylingCommand = controlBtn.dataset.cmd;
            document.execCommand(frameworkStylingCommand, false, null);
            editableField.focus();
        };
    });

    workspaceShell.querySelector(".word-new").onclick = () => {
        if(confirm("Discard active document mutations?")) {
            editableField.innerHTML = "<h1>Untitled Doc</h1><p>Type content elements here...</p>";
            activeWordFilePath = null;
        }
    };

    workspaceShell.querySelector(".word-open").onclick = () => {
        const indices = OS.VFS.listFiles();
        const choice = prompt(`Select text/html asset layer to read:\n\n${indices.join("\n")}`, "documents/project_notes.txt");
        if (choice && indices.includes(choice)) {
            activeWordFilePath = choice;
            editableField.innerHTML = OS.VFS.readFile(choice);
        }
    };

    workspaceShell.querySelector(".word-save").onclick = () => {
        if (!activeWordFilePath) {
            activeWordFilePath = prompt("Provide name designation for document target:", "documents/word_doc.html");
        }
        if (activeWordFilePath) {
            OS.VFS.writeFile(activeWordFilePath, editableField.innerHTML);
            alert(`Document matrix written successfully to VFS: [${activeWordFilePath}]`);
        }
    };
});