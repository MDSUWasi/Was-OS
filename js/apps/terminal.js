OS.registerApp("terminal", function(pid, bodyId) {
    const container = document.getElementById(bodyId);
    
    const root = document.createElement("div");
    root.className = "terminal-container";
    root.innerHTML = `
        <div class="terminal-log" id="log_${pid}">Welcome to WebOS shell terminal proxy.\nType 'help' for configurations.\n\n</div>
        <div class="terminal-row">
            <span>user@system:~$</span>
            <input type="text" class="terminal-input" id="in_${pid}" autocomplete="off" spellcheck="false">
        </div>
    `;
    container.appendChild(root);
    
    const log = document.getElementById(`log_${pid}`);
    const input = document.getElementById(`in_${pid}`);
    
    root.onclick = () => input.focus();
    
    input.onkeydown = function(e) {
        if (e.key === "Enter") {
            const text = input.value.trim();
            input.value = "";
            if (!text) return;
            
            log.innerText += `user@system:~$ ${text}\n`;
            const args = text.split(" ");
            const cmd = args[0].toLowerCase();
            
            if (cmd === "help") {
                log.innerText += "Commands: help, ls, cat [file], clear\n";
            } else if (cmd === "ls") {
                log.innerText += OS.VFS.list().join("    ") + "\n";
            } else if (cmd === "cat") {
                const target = args[1];
                const contents = OS.VFS.read(target);
                log.innerText += contents ? `${contents}\n` : "File error: Not located.\n";
            } else if (cmd === "clear") {
                log.innerText = "";
            } else {
                log.innerText += `Shell exception: command missing '${cmd}'\n`;
            }
            log.scrollTop = log.scrollHeight;
        }
    };
});