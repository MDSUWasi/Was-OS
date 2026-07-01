OS.registerApp({
    id: 'spreadsheet',
    title: 'Spreadsheet',
    icon: '📊',
    description: 'Simple spreadsheet with save and load support',
    category: 'productivity',

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#12131b;color:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#181b24;border-bottom:1px solid rgba(255,255,255,0.08);';
        header.innerHTML = `<div><h2 style="margin:0;font-size:1.1rem;">Spreadsheet</h2><div style="color:#8a8a8a;font-size:0.85rem;">Basic table editing.</div></div><button id="${pid}_save" style="padding:10px 16px;border:none;border-radius:12px;background:#3584e4;color:#fff;cursor:pointer;">Save</button>`;

        const gridWrapper = document.createElement('div');
        gridWrapper.style.cssText = 'flex:1;overflow:auto;padding:16px;';

        const table = document.createElement('table');
        table.style.cssText = 'width:100%;border-collapse:collapse;table-layout:fixed;font-size:0.9rem;';

        const rows = state.rows || 10;
        const cols = state.cols || 7;
        state.data = state.data || JSON.parse(localStorage.getItem('wasos_spreadsheet_data') || '[]');

        function renderTable() {
            table.innerHTML = '';

            const headerRow = document.createElement('tr');
            headerRow.style.background = 'rgba(255,255,255,0.04)';
            headerRow.appendChild(document.createElement('th'));

            for (let c = 0; c < cols; c++) {
                const th = document.createElement('th');
                th.style.cssText = 'padding:10px;border:1px solid rgba(255,255,255,0.08);text-align:center;color:#aaa;';
                th.textContent = String.fromCharCode(65 + c);
                headerRow.appendChild(th);
            }
            table.appendChild(headerRow);

            for (let r = 0; r < rows; r++) {
                const tr = document.createElement('tr');
                const rowHeader = document.createElement('th');
                rowHeader.style.cssText = 'padding:10px;border:1px solid rgba(255,255,255,0.08);text-align:center;color:#aaa;';
                rowHeader.textContent = r + 1;
                tr.appendChild(rowHeader);

                for (let c = 0; c < cols; c++) {
                    const td = document.createElement('td');
                    td.style.cssText = 'padding:0;border:1px solid rgba(255,255,255,0.08);';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.style.cssText = 'width:100%;padding:10px;border:none;background:transparent;color:#fff;outline:none;font-family:inherit;';
                    const value = state.data[r]?.[c] || '';
                    input.value = value;
                    input.addEventListener('input', () => {
                        state.data[r] = state.data[r] || [];
                        state.data[r][c] = input.value;
                    });
                    td.appendChild(input);
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
        }

        function saveData() {
            localStorage.setItem('wasos_spreadsheet_data', JSON.stringify(state.data));
            Notifier.show({ title: 'Saved', message: 'Spreadsheet data saved.', type: 'success' });
        }

        document.addEventListener('click', (e) => {
            if (e.target?.id === `${pid}_save`) saveData();
        });

        gridWrapper.appendChild(table);
        container.append(header, gridWrapper);
        renderTable();
    }
});