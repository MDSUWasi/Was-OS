OS.registerApp({
    id: 'notes',
    title: 'Notes',
    icon: '🗒️',
    description: 'Sticky notes and quick reminders',
    category: 'productivity',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#181a22;color:#fff;padding:16px;display:flex;flex-direction:column;gap:14px;overflow:auto;font-family:sans-serif;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;';
        header.innerHTML = `<h2 style="margin:0;font-size:1.2rem;">Notes</h2><button id="${pid}_new_note" style="padding:8px 14px;border:none;background:#3584e4;color:#fff;border-radius:8px;cursor:pointer;">+ New Note</button>`;

        const list = document.createElement('div');
        list.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;';

        const notes = state.notes || JSON.parse(localStorage.getItem('wasos_notes') || '[]');
        state.notes = notes;

        function saveNotes() {
            localStorage.setItem('wasos_notes', JSON.stringify(state.notes));
        }

        function renderNotes() {
            list.innerHTML = '';

            if (state.notes.length === 0) {
                list.innerHTML = '<div style="grid-column:1/-1;color:#999;padding:40px;text-align:center;">No notes yet. Click + New Note.</div>';
                return;
            }

            state.notes.forEach((note, index) => {
                const card = document.createElement('div');
                card.style.cssText = 'background:#1d1f28;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;';
                card.innerHTML = `<textarea data-index="${index}" style="background:transparent;border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#fff;padding:10px;min-height:120px;resize:vertical;outline:none;font-family:inherit;font-size:0.95rem;">${note}</textarea><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;"><span style="color:#999;font-size:0.8rem;">Note ${index + 1}</span><button data-delete="${index}" style="padding:6px 10px;border:none;border-radius:8px;background:#e01b24;color:#fff;cursor:pointer;">Delete</button></div>`;

                const textarea = card.querySelector('textarea');
                const deleteBtn = card.querySelector('[data-delete]');

                textarea.addEventListener('input', () => {
                    state.notes[index] = textarea.value;
                    saveNotes();
                });

                deleteBtn.addEventListener('click', () => {
                    state.notes.splice(index, 1);
                    saveNotes();
                    renderNotes();
                });

                list.appendChild(card);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target?.id === `${pid}_new_note`) {
                state.notes.unshift('');
                saveNotes();
                renderNotes();
            }
        });

        container.append(header, list);
        renderNotes();
    }
});