// --- MULTI-TAB DOCUMENT TEXT WRITER APP INTERFACE MODULE ---
OS.registerApp("notepad", function(pid, parentContainerId) {
    const parentNode = document.getElementById(parentContainerId);

    let applicationState = {
        activeTabUid: null,
        tabs: {}
    };

    const appRoot = document.createElement("div");
    appRoot.className = "notepad-app-root";
    appRoot.innerHTML = `
        <div class="notepad-control-bar">
            <button class="notepad-btn action-new">📄 New Tab</button>
            <button class="notepad-btn action-open">📂 Open File</button>
            <button class="notepad-btn action-save">💾 Save Active</button>
        </div>
        <div class="notepad-tabs-strip" id="${pid}_tabs_strip"></div>
        <textarea class="notepad-text-engine" id="${pid}_editor_core" placeholder="Begin typing text data documents... Local VFS commit layer functional."></textarea>
    `;
    parentNode.appendChild(appRoot);

    const tabsStripNode = document.getElementById(`${pid}_tabs_strip`);
    const textEngineNode = document.getElementById(`${pid}_editor_core`);

    textEngineNode.addEventListener("input", (e) => {
        if (applicationState.activeTabUid) {
            applicationState.tabs[applicationState.activeTabUid].rawContent = e.target.value;
        }
    });

    function renderTabsUI() {
        tabsStripNode.innerHTML = "";
        Object.keys(applicationState.tabs).forEach(uid => {
            const tabObj = applicationState.tabs[uid];
            const tabEl = document.createElement("div");
            tabEl.className = `notepad-tab ${uid === applicationState.activeTabUid ? 'active-tab' : ''}`;
            tabEl.innerHTML = `
                <span class="tab-label-string">🕒 ${tabObj.name}</span>
                <span class="close-tab-trigger" data-target="${uid}">&times;</span>
            `;
            
            tabEl.onclick = (e) => {
                if (e.target.classList.contains("close-tab-trigger")) return;
                switchActiveTab(uid);
            };

            tabEl.querySelector(".close-tab-trigger").onclick = (e) => {
                e.stopPropagation();
                closeTabInstance(uid);
            };

            tabsStripNode.appendChild(tabEl);
        });
    }

    function switchActiveTab(uid) {
        applicationState.activeTabUid = uid;
        if (uid && applicationState.tabs[uid]) {
            textEngineNode.value = applicationState.tabs[uid].rawContent;
            textEngineNode.disabled = false;
        } else {
            textEngineNode.value = "";
            textEngineNode.disabled = true;
        }
        renderTabsUI();
    }

    function createNewTabInstance(filename = "untitled.txt", path = null, content = "") {
        const uniqueTabId = `tab_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        applicationState.tabs[uniqueTabId] = {
            name: filename,
            vfsPath: path,
            rawContent: content
        };
        switchActiveTab(uniqueTabId);
    }

    function closeTabInstance(uid) {
        delete applicationState.tabs[uid];
        if (applicationState.activeTabUid === uid) {
            const remainingKeys = Object.keys(applicationState.tabs);
            applicationState.activeTabUid = remainingKeys.length > 0 ? remainingKeys[0] : null;
        }
        switchActiveTab(applicationState.activeTabUid);
    }

    appRoot.querySelector(".action-new").onclick = () => {
        const nameInput = prompt("Enter target name designation for new memory file:", "document.txt");
        if (nameInput) createNewTabInstance(nameInput, null, "");
    };

    appRoot.querySelector(".action-open").onclick = () => {
        const tracks = OS.VFS.listFiles();
        if (tracks.length === 0) { alert("No files tracked inside drive sectors."); return; }
        
        const selection = prompt(`Target drive sector indexes found:\n\n${tracks.join("\n")}\n\nType exact file directory string path to load:`, tracks[0]);
        if (selection && tracks.includes(selection)) {
            const duplicateCheck = Object.keys(applicationState.tabs).find(t => applicationState.tabs[t].vfsPath === selection);
            if (duplicateCheck) {
                switchActiveTab(duplicateCheck);
            } else {
                const readContent = OS.VFS.readFile(selection);
                createNewTabInstance(selection.split('/').pop(), selection, readContent);
            }
        } else if (selection) {
            alert("VFS Disk Target Reference Lookup Array Mismatch: Path not found.");
        }
    };

    appRoot.querySelector(".action-save").onclick = () => {
        const activeUid = applicationState.activeTabUid;
        if (!activeUid || !applicationState.tabs[activeUid]) { alert("No active text payload tabs recognized."); return; }

        let activeTab = applicationState.tabs[activeUid];
        if (!activeTab.vfsPath) {
            const requestedCommitPath = prompt("Set directory destination file path string for local disk storage:", `documents/${activeTab.name}`);
            if (!requestedCommitPath) return;
            activeTab.vfsPath = requestedCommitPath;
            activeTab.name = requestedCommitPath.split('/').pop();
        }

        OS.VFS.writeFile(activeTab.vfsPath, activeTab.rawContent);
        alert(`File matrix content committed successfully to VFS path layout allocation:\n[${activeTab.vfsPath}]`);
        renderTabsUI();
    };

    createNewTabInstance("readme.txt", "documents/readme.txt", OS.VFS.readFile("documents/readme.txt"));
});