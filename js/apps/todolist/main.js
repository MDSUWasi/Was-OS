// --- 1. Data Models ---
class Task {
    constructor(data) {
        this.id = data.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.title = data.title || '';
        this.category = data.category || 'study';
        this.priority = data.priority || 'medium';
        this.status = data.status || 'todo';
        this.dueDate = data.dueDate || null;
        this.notes = data.notes || '';
        this.recurring = data.recurring || false;
        this.completed = data.completed || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    toJSON() { return { ...this }; }
    static fromJSON(json) { return new Task(json); }
}

// --- 2. State Management ---
class Store {
    constructor() {
        this.state = {
            tasks: JSON.parse(localStorage.getItem('focusflow_tasks')) || [],
            theme: localStorage.getItem('focusflow_theme') || 'glass',
            filter: 'all',
            category: 'all',
            sort: 'created',
            searchQuery: ''
        };
        this.listeners = [];
        this.init();
    }

    init() {
        document.body.className = `theme-${this.state.theme}`;
        this.notify();
    }

    subscribe(fn) {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    }

    notify() { this.listeners.forEach(fn => fn(this.state)); }

    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }

    setTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem('focusflow_theme', theme);
        document.body.className = `theme-${theme}`;
        this.notify();
    }

    addTask(data) {
        const task = new Task(data);
        this.state.tasks.unshift(task);
        this.save();
        this.notify();
        return task;
    }

    updateTask(id, updates) {
        const idx = this.state.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            this.state.tasks[idx] = new Task({ ...this.state.tasks[idx], ...updates, updatedAt: new Date().toISOString() });
            this.save();
            this.notify();
        }
    }

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.save();
        this.notify();
    }

    toggleComplete(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.status = task.completed ? 'done' : 'todo';
            this.save();
            this.notify();
        }
    }

    save() {
        localStorage.setItem('focusflow_tasks', JSON.stringify(this.state.tasks.map(t => t.toJSON())));
    }

    getFilteredTasks() {
        let filtered = [...this.state.tasks];
        const today = new Date().toISOString().split('T')[0];

        if (this.state.category !== 'all') filtered = filtered.filter(t => t.category === this.state.category);
        if (this.state.filter === 'today') filtered = filtered.filter(t => t.dueDate === today && !t.completed);
        else if (this.state.filter === 'upcoming') filtered = filtered.filter(t => t.dueDate && t.dueDate > today && !t.completed);
        else if (this.state.filter === 'completed') filtered = filtered.filter(t => t.completed);
        else if (this.state.filter === 'urgent') filtered = filtered.filter(t => t.priority === 'urgent' && !t.completed);

        if (this.state.searchQuery) {
            const q = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q));
        }

        filtered.sort((a, b) => {
            switch (this.state.sort) {
                case 'due': return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1;
                case 'priority': const p = { urgent: 4, high: 3, medium: 2, low: 1 }; return p[b.priority] - p[a.priority];
                case 'alphabetical': return a.title.localeCompare(b.title);
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        return filtered;
    }

    getStats() {
        const total = this.state.tasks.length;
        const completed = this.state.tasks.filter(t => t.completed).length;
        const today = new Date().toISOString().split('T')[0];
        return {
            total, completed,
            todayCount: this.state.tasks.filter(t => t.dueDate === today && !t.completed).length,
            upcoming: this.state.tasks.filter(t => t.dueDate && t.dueDate > today && !t.completed).length,
            urgent: this.state.tasks.filter(t => t.priority === 'urgent' && !t.completed).length,
            progress: total > 0 ? (completed / total) * 100 : 0
        };
    }
}

// --- 3. UI Renderer ---
class Renderer {
    constructor(store) {
        this.store = store;
        this.taskListEl = document.getElementById('task-list');
        this.kanbanTodoEl = document.getElementById('tasks-todo');
        this.kanbanProgEl = document.getElementById('tasks-in-progress');
        this.kanbanDoneEl = document.getElementById('tasks-done');
        this.timelineEl = document.getElementById('timeline-container');
        this.emptyStateEl = document.getElementById('empty-state');
        this.modal = document.getElementById('task-modal');
    }

    render() {
        const tasks = this.store.getFilteredTasks();
        const stats = this.store.getStats();
        this.updateSidebar(stats);
        this.updateProgress(stats);
        this.renderView(tasks);
    }

    updateSidebar(stats) {
        document.getElementById('count-all').textContent = this.store.state.tasks.filter(t => !t.completed).length;
        document.getElementById('count-today').textContent = stats.todayCount;
        document.getElementById('count-upcoming').textContent = stats.upcoming;
        document.getElementById('count-completed').textContent = stats.completed;
        document.getElementById('count-urgent').textContent = stats.urgent;
        document.getElementById('completed-count').textContent = stats.completed;
        document.getElementById('total-count').textContent = stats.total;
    }

    updateProgress(stats) {
        document.getElementById('progress-fill').style.width = `${stats.progress}%`;
    }

    renderView(tasks) {
        const view = document.querySelector('.view-btn.active').dataset.view;
        if (tasks.length === 0) {
            this.emptyStateEl.classList.remove('hidden');
            this.taskListEl.innerHTML = '';
            this.kanbanTodoEl.innerHTML = '';
            this.kanbanProgEl.innerHTML = '';
            this.kanbanDoneEl.innerHTML = '';
            this.timelineEl.innerHTML = '';
            return;
        }
        this.emptyStateEl.classList.add('hidden');
        if (view === 'list') this.renderListView(tasks);
        else if (view === 'kanban') this.renderKanbanView(tasks);
        else if (view === 'timeline') this.renderTimelineView(tasks);
    }

    renderListView(tasks) {
        this.taskListEl.innerHTML = '';
        tasks.forEach(task => this.taskListEl.appendChild(this.createTaskElement(task)));
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.draggable = true;
        div.dataset.id = task.id;

        const catClass = `cat-${task.category}`;
        const pClass = `p-${task.priority}`;
        const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        
        let dueHtml = '';
        if (task.dueDate) {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = task.dueDate < today && !task.completed;
            const isToday = task.dueDate === today;
            const dueClass = isOverdue ? 'overdue' : (isToday ? 'today' : '');
            const label = isOverdue ? 'Overdue' : (isToday ? 'Today' : new Date(task.dueDate).toLocaleDateString());
            dueHtml = `<span class="due-date ${dueClass}">📅 ${label}</span>`;
        }

        div.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle"></div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-category ${catClass}">${task.category}</span>
                    <span class="priority-badge ${pClass}">${priorityLabel}</span>
                    ${dueHtml}
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit" title="Edit">✏️</button>
                <button class="action-btn delete" title="Delete">🗑️</button>
            </div>
        `;

        div.querySelector('[data-action="toggle"]').onclick = () => this.store.toggleComplete(task.id);
        div.querySelector('.edit').onclick = () => this.openEdit(task);
        div.querySelector('.delete').onclick = () => { if(confirm('Delete?')) { this.store.deleteTask(task.id); this.showToast('Deleted', 'success'); }};
        div.addEventListener('dragstart', () => div.classList.add('dragging'));
        div.addEventListener('dragend', () => div.classList.remove('dragging'));
        return div;
    }

    renderKanbanView(tasks) {
        this.kanbanTodoEl.innerHTML = '';
        this.kanbanProgEl.innerHTML = '';
        this.kanbanDoneEl.innerHTML = '';
        const todo = tasks.filter(t => t.status === 'todo');
        const prog = tasks.filter(t => t.status === 'in-progress');
        const done = tasks.filter(t => t.status === 'done');
        
        document.getElementById('count-todo').textContent = todo.length;
        document.getElementById('count-in-progress').textContent = prog.length;
        document.getElementById('count-done').textContent = done.length;

        todo.forEach(t => this.kanbanTodoEl.appendChild(this.createKanbanCard(t)));
        prog.forEach(t => this.kanbanProgEl.appendChild(this.createKanbanCard(t)));
        done.forEach(t => this.kanbanDoneEl.appendChild(this.createKanbanCard(t)));
        this.setupKanbanDrop();
    }

    createKanbanCard(task) {
        const div = document.createElement('div');
        div.className = 'kanban-task';
        div.draggable = true;
        div.dataset.id = task.id;
        div.innerHTML = `<div class="kanban-task-title">${task.title}</div><div class="kanban-task-meta"><span class="task-category cat-${task.category}">${task.category}</span><span class="priority-badge p-${task.priority}">${task.priority}</span></div>`;
        div.addEventListener('dragstart', () => div.classList.add('dragging'));
        div.addEventListener('dragend', () => div.classList.remove('dragging'));
        div.querySelector('.kanban-task-title').onclick = () => this.openEdit(task);
        return div;
    }

    setupKanbanDrop() {
        document.querySelectorAll('.column-tasks').forEach(col => {
            col.addEventListener('dragover', e => { e.preventDefault(); const d = document.querySelector('.dragging'); if(d) col.appendChild(d); });
            col.addEventListener('drop', () => { const d = document.querySelector('.dragging'); if(d) { this.store.updateTask(d.dataset.id, { status: col.dataset.status }); this.showToast('Moved', 'success'); }});
        });
    }

    renderTimelineView(tasks) {
        this.timelineEl.innerHTML = '';
        const grouped = {};
        tasks.forEach(t => { const d = t.dueDate || 'No Date'; if(!grouped[d]) grouped[d]=[]; grouped[d].push(t); });
        
        Object.keys(grouped).sort().forEach(date => {
            const group = document.createElement('div');
            group.className = 'timeline-group';
            group.innerHTML = `<div class="timeline-date">${date === 'No Date' ? 'No Due Date' : new Date(date).toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })}</div>`;
            grouped[date].forEach(t => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `<div style="font-weight:600; margin-bottom:4px;">${t.title}</div><div style="font-size:0.85rem; color:var(--text-secondary);"><span class="task-category cat-${t.category}">${t.category}</span> • ${t.priority}</div>`;
                item.onclick = () => this.openEdit(t);
                group.appendChild(item);
            });
            this.timelineEl.appendChild(group);
        });
    }

    openAdd() {
        this.modal.showModal();
        document.getElementById('modal-title').textContent = 'Add New Task';
        document.getElementById('task-id').value = '';
        document.getElementById('task-title').value = '';
        document.getElementById('task-category').value = 'study';
        document.getElementById('task-priority').value = 'medium';
        document.getElementById('task-status').value = 'todo';
        document.getElementById('task-due').value = '';
        document.getElementById('task-notes').value = '';
        document.getElementById('task-recurring').checked = false;
        document.getElementById('delete-task-btn').classList.add('hidden');
    }

    openEdit(task) {
        this.modal.showModal();
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-due').value = task.dueDate || '';
        document.getElementById('task-notes').value = task.notes;
        document.getElementById('task-recurring').checked = task.recurring;
        document.getElementById('delete-task-btn').classList.remove('hidden');
    }

    showToast(msg, type='info') {
        const div = document.createElement('div');
        div.className = `toast ${type}`;
        div.textContent = msg;
        document.getElementById('toast-container').appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

// --- 4. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const store = new Store();
    const renderer = new Renderer(store);
    store.subscribe(() => renderer.render());

    // Filters
    document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setState({ filter: btn.dataset.filter });
    });

    document.querySelectorAll('.category-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setState({ category: btn.dataset.category });
    });

    // Views
    document.querySelectorAll('.view-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.task-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${btn.dataset.view}-view`).classList.add('active');
        renderer.render();
    });

    // Search & Sort
    document.getElementById('search-input').oninput = (e) => store.setState({ searchQuery: e.target.value });
    document.getElementById('sort-select').onchange = (e) => store.setState({ sort: e.target.value });

    // Buttons
    document.getElementById('add-task-btn').onclick = () => renderer.openAdd();
    document.getElementById('empty-add-btn').onclick = () => renderer.openAdd();

    // Theme
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    themeToggle.onclick = (e) => { e.stopPropagation(); themeMenu.classList.toggle('hidden'); };
    document.addEventListener('click', () => themeMenu.classList.add('hidden'));
    document.querySelectorAll('#theme-menu button').forEach(btn => btn.onclick = () => {
        store.setTheme(btn.dataset.theme);
        renderer.showToast(`Theme: ${btn.textContent.split(' ')[1]}`, 'success');
    });

    // Modal
    const modal = document.getElementById('task-modal');
    document.getElementById('modal-close').onclick = () => modal.close();
    document.getElementById('cancel-btn').onclick = () => modal.close();
    modal.onclick = (e) => { if(e.target === modal) modal.close(); };
    
    document.getElementById('delete-task-btn').onclick = () => {
        const id = document.getElementById('task-id').value;
        if(id && confirm('Delete?')) { store.deleteTask(id); modal.close(); renderer.showToast('Deleted', 'success'); }
    };

    document.getElementById('task-form').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        const data = {
            title: document.getElementById('task-title').value,
            category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value,
            dueDate: document.getElementById('task-due').value || null,
            notes: document.getElementById('task-notes').value,
            recurring: document.getElementById('task-recurring').checked
        };
        if(id) { store.updateTask(id, data); renderer.showToast('Updated', 'success'); }
        else { store.addTask(data); renderer.showToast('Created', 'success'); }
        modal.close();
    };

    document.getElementById('clear-completed').onclick = () => {
        if(confirm('Clear completed?')) {
            store.state.tasks.filter(t => t.completed).forEach(t => store.deleteTask(t.id));
            renderer.showToast('Cleared', 'success');
        }
    };

    document.getElementById('export-btn').onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state.tasks));
        const a = document.createElement('a');
        a.href = dataStr; a.download = "focusflow_backup.json";
        document.body.appendChild(a); a.click(); a.remove();
        renderer.showToast('Exported', 'success');
    };

    renderer.render();
});
