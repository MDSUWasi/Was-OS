// --- 1. Data Models ---
class EventItem {
    constructor(data) {
        this.id = data.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.title = data.title || '';
        this.start = data.start ? new Date(data.start).toISOString() : new Date().toISOString();
        this.end = data.end ? new Date(data.end).toISOString() : new Date().toISOString();
        this.category = data.category || 'work';
        this.color = data.color || '#3b82f6';
        this.location = data.location || '';
        this.description = data.description || '';
        this.recurring = data.recurring || false;
        this.recurrencePattern = data.recurrencePattern || 'weekly';
        this.recurrenceCount = data.recurrenceCount || 10;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    toJSON() { return { ...this }; }
    static fromJSON(json) { return new EventItem(json); }
}

// --- 2. State Management ---
class Store {
    constructor() {
        this.state = {
            events: JSON.parse(localStorage.getItem('powercalendar_events')) || [],
            theme: localStorage.getItem('powercalendar_theme') || 'glass',
            currentDate: new Date(),
            view: 'month',
            category: 'all',
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
        localStorage.setItem('powercalendar_theme', theme);
        document.body.className = `theme-${theme}`;
        this.notify();
    }

    addEvent(data) {
        const evt = new EventItem(data);
        this.state.events.unshift(evt);
        this.save();
        this.notify();
        return evt;
    }

    updateEvent(id, updates) {
        const idx = this.state.events.findIndex(e => e.id === id);
        if (idx !== -1) {
            const existing = this.state.events[idx];
            this.state.events[idx] = new EventItem({ 
                ...existing, 
                ...updates,
                id: existing.id,
                createdAt: existing.createdAt
            });
            this.save();
            this.notify();
        }
    }

    deleteEvent(id) {
        this.state.events = this.state.events.filter(e => e.id !== id);
        this.save();
        this.notify();
    }

    save() {
        localStorage.setItem('powercalendar_events', JSON.stringify(this.state.events.map(e => e.toJSON())));
    }

    getFilteredEvents() {
        let filtered = [...this.state.events];
        if (this.state.category !== 'all') {
            filtered = filtered.filter(e => e.category === this.state.category);
        }
        if (this.state.searchQuery) {
            const q = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(q) || 
                e.description.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q)
            );
        }
        return filtered;
    }

    getStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthEvents = this.state.events.filter(e => {
            const d = new Date(e.start);
            return d >= startOfMonth && d <= endOfMonth;
        });
        const upcoming = this.state.events.filter(e => new Date(e.start) > now).length;
        return { total: monthEvents.length, upcoming };
    }
}

// --- 3. UI Renderer ---
class Renderer {
    constructor(store) {
        this.store = store;
        this.modal = document.getElementById('event-modal');
        this.monthDays = document.getElementById('month-days');
        this.weekColumns = document.getElementById('week-columns');
        this.dayColumn = document.getElementById('day-column');
        this.dayTimeSidebar = document.getElementById('day-time-sidebar');
        this.yearGrid = document.getElementById('year-grid');
        this.currentPeriod = document.getElementById('current-period');
        this.emptyState = document.getElementById('empty-state');
        
        // Initialize Timetables once
        this.initTimetables();
    }

    initTimetables() {
        // Generate 24h sidebar for Week and Day views
        const hours = [];
        for (let i = 0; i < 24; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            hours.push(`<div class="time-slot">${time}</div>`);
        }
        
        // Week Sidebar
        const weekSidebar = document.querySelector('.week-grid .time-sidebar');
        if (weekSidebar) weekSidebar.innerHTML = hours.join('');
        
        // Day Sidebar
        if (this.dayTimeSidebar) this.dayTimeSidebar.innerHTML = hours.join('');
    }

    render() {
        const events = this.store.getFilteredEvents();
        const stats = this.store.getStats();
        
        document.getElementById('month-count').textContent = stats.total;
        document.getElementById('upcoming-count').textContent = stats.upcoming;
        
        this.updateView(events);
    }

    updateView(events) {
        const view = this.store.state.view;
        const date = this.store.state.currentDate;
        
        this.emptyState.classList.toggle('hidden', events.length > 0);
        
        document.querySelectorAll('.calendar-view').forEach(v => v.classList.remove('active'));
        
        if (view === 'month') {
            document.getElementById('month-view').classList.add('active');
            this.renderMonth(date, events);
        } else if (view === 'week') {
            document.getElementById('week-view').classList.add('active');
            this.renderWeek(date, events);
        } else if (view === 'day') {
            document.getElementById('day-view').classList.add('active');
            this.renderDay(date, events);
        } else if (view === 'year') {
            document.getElementById('year-view').classList.add('active');
            this.renderYear(date, events);
        }
    }

// --- Month View Logic ---
    renderMonth(date, events) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...
        
        this.currentPeriod.textContent = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        this.monthDays.innerHTML = '';
        
        // 1. Previous Month Padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'day-cell other-month';
            cell.innerHTML = `<div class="day-number">${prevMonthLastDay - i}</div>`;
            this.monthDays.appendChild(cell);
        }
        
        // 2. Current Month Days
        for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            const currentDate = new Date(year, month, d);
            
            if (currentDate.toDateString() === new Date().toDateString()) {
                cell.classList.add('today');
            }
            
            cell.innerHTML = `<div class="day-number">${d}</div>`;
            
            // ... (Event logic remains the same) ...
            const dayEvents = events.filter(e => {
                const evtDate = new Date(e.start);
                return evtDate.getDate() === d && evtDate.getMonth() === month && evtDate.getFullYear() === year;
            });
            
            dayEvents.slice(0, 3).forEach(evt => {
                const chip = document.createElement('div');
                chip.className = 'event-chip';
                chip.style.backgroundColor = evt.color;
                chip.textContent = evt.title;
                chip.onclick = (e) => { e.stopPropagation(); this.openEdit(evt); };
                cell.appendChild(chip);
            });
            
            if (dayEvents.length > 3) {
                const more = document.createElement('div');
                more.style.fontSize = '0.7rem';
                more.style.color = 'var(--text-muted)';
                more.textContent = `+${dayEvents.length - 3} more`;
                cell.appendChild(more);
            }
            
            cell.onclick = () => this.openAdd(currentDate);
            this.monthDays.appendChild(cell);
        }
        
        // 3. Next Month Padding
        const totalCells = startDayOfWeek + lastDayOfMonth.getDate();
        const remainingCells = 42 - totalCells; // 6 rows * 7 cols = 42
        
        
        const finalRemaining = Math.max(0, remainingCells);

        for (let i = 1; i <= finalRemaining; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell other-month';
            cell.innerHTML = `<div class="day-number">${i}</div>`;
            this.monthDays.appendChild(cell);
        }
    }

    // --- Week View ---
    renderWeek(date, events) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        this.currentPeriod.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        
        this.weekColumns.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            
            const col = document.createElement('div');
            col.className = 'week-col';
            col.dataset.date = dayDate.toISOString().split('T')[0];
            
            const header = document.createElement('div');
            header.className = 'week-col-header';
            header.innerHTML = `<div>${dayDate.toLocaleDateString('en-US', { weekday: 'short' })}<br><strong>${dayDate.getDate()}</strong></div>`;
            col.appendChild(header);
            
            const dayEvents = events.filter(e => new Date(e.start).toDateString() === dayDate.toDateString());
            
            dayEvents.forEach(evt => {
                const start = new Date(evt.start);
                const end = new Date(evt.end);
                const dayStart = new Date(dayDate);
                dayStart.setHours(0,0,0,0);
                
                const diffMs = start - dayStart;
                const minutes = diffMs / (1000 * 60);
                const top = (minutes / 60) * 60;
                const durationMs = end - start;
                const height = (durationMs / (1000 * 60 * 60)) * 60;
                
                const el = document.createElement('div');
                el.className = 'grid-event';
                el.style.top = `${top}px`;
                el.style.height = `${Math.max(height, 30)}px`;
                el.style.backgroundColor = evt.color;
                el.textContent = `${start.getHours()}:${start.getMinutes().toString().padStart(2,'0')} - ${evt.title}`;
                el.onclick = () => this.openEdit(evt);
                col.appendChild(el);
            });
            
            this.weekColumns.appendChild(col);
        }
    }

    // --- Day View (With Timetable) ---
    renderDay(date, events) {
        this.currentPeriod.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        
        this.dayColumn.innerHTML = '';
        
        const dayEvents = events.filter(e => new Date(e.start).toDateString() === date.toDateString());
        
        dayEvents.forEach(evt => {
            const start = new Date(evt.start);
            const end = new Date(evt.end);
            const dayStart = new Date(date);
            dayStart.setHours(0,0,0,0);
            
            const diffMs = start - dayStart;
            const minutes = diffMs / (1000 * 60);
            const top = (minutes / 60) * 60;
            const durationMs = end - start;
            const height = (durationMs / (1000 * 60 * 60)) * 60;
            
            const el = document.createElement('div');
            el.className = 'grid-event';
            el.style.top = `${top}px`;
            el.style.height = `${Math.max(height, 30)}px`;
            el.style.backgroundColor = evt.color;
            el.innerHTML = `<strong>${evt.title}</strong><br>${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            el.onclick = () => this.openEdit(evt);
            this.dayColumn.appendChild(el);
        });
    }

    // --- Year View ---
    renderYear(date, events) {
        this.currentPeriod.textContent = date.getFullYear();
        this.yearGrid.innerHTML = '';
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        months.forEach((m, idx) => {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'year-month';
            monthDiv.innerHTML = `<h3>${m}</h3><div class="year-month-grid"></div>`;
            const grid = monthDiv.querySelector('.year-month-grid');
            const firstDay = new Date(date.getFullYear(), idx, 1);
            const lastDay = new Date(date.getFullYear(), idx + 1, 0);
            const startDay = firstDay.getDay();
            
            for(let i=0; i<startDay; i++) grid.appendChild(document.createElement('div'));
            
            for(let d=1; d<=lastDay.getDate(); d++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'year-day';
                dayDiv.textContent = d;
                const hasEvent = events.some(e => {
                    const ed = new Date(e.start);
                    return ed.getDate() === d && ed.getMonth() === idx && ed.getFullYear() === date.getFullYear();
                });
                if(hasEvent) dayDiv.classList.add('has-event');
                grid.appendChild(dayDiv);
            }
            this.yearGrid.appendChild(monthDiv);
        });
    }

    // --- Modal Logic ---
    openAdd(date = null) {
        this.modal.showModal();
        document.getElementById('modal-title').textContent = 'Add New Event';
        document.getElementById('event-id').value = '';
        document.getElementById('event-title').value = '';
        
        const start = date ? new Date(date) : new Date();
        start.setHours(9, 0, 0, 0);
        const end = new Date(start);
        end.setHours(10, 0, 0, 0);
        
        document.getElementById('event-start').value = start.toISOString().slice(0,16);
        document.getElementById('event-end').value = end.toISOString().slice(0,16);
        
        document.getElementById('event-category').value = 'work';
        document.getElementById('event-color').value = '#3b82f6';
        document.getElementById('event-location').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('event-recurring').checked = false;
        document.getElementById('recurring-options').classList.add('hidden');
        document.getElementById('delete-event-btn').classList.add('hidden');
    }

    openEdit(event) {
        this.modal.showModal();
        document.getElementById('modal-title').textContent = 'Edit Event';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        
        const start = new Date(event.start);
        const end = new Date(event.end);
        
        document.getElementById('event-start').value = start.toISOString().slice(0,16);
        document.getElementById('event-end').value = end.toISOString().slice(0,16);
        
        document.getElementById('event-category').value = event.category;
        document.getElementById('event-color').value = event.color;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-description').value = event.description;
        document.getElementById('event-recurring').checked = event.recurring;
        document.getElementById('recurrence-pattern').value = event.recurrencePattern || 'weekly';
        document.getElementById('recurrence-end').value = event.recurrenceCount || 10;
        
        document.getElementById('recurring-options').classList.toggle('hidden', !event.recurring);
        document.getElementById('delete-event-btn').classList.remove('hidden');
    }

    showToast(msg, type='info') {
        const div = document.createElement('div');
        div.className = `toast ${type}`;
        div.textContent = msg;
        document.getElementById('toast-container').appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    exportToICS() {
        const events = this.store.state.events;
        let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PowerCalendar//EN\r\n';
        events.forEach(evt => {
            icsContent += 'BEGIN:VEVENT\r\n';
            icsContent += `UID:${evt.id}@powercalendar\r\n`;
            icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
            icsContent += `DTSTART:${new Date(evt.start).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
            icsContent += `DTEND:${new Date(evt.end).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
            icsContent += `SUMMARY:${evt.title}\r\n`;
            if (evt.location) icsContent += `LOCATION:${evt.location}\r\n`;
            if (evt.description) icsContent += `DESCRIPTION:${evt.description}\r\n`;
            icsContent += 'END:VEVENT\r\n';
        });
        icsContent += 'END:VCALENDAR';
        
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `powercalendar_export_${new Date().toISOString().split('T')[0]}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Calendar exported!', 'success');
    }

    importFromICS(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const eventBlocks = content.split('BEGIN:VEVENT').slice(1);
            eventBlocks.forEach(block => {
                const lines = block.split('\r\n').filter(l => l.startsWith('DT') || l.startsWith('SUMMARY') || l.startsWith('LOCATION') || l.startsWith('DESCRIPTION') || l.startsWith('UID'));
                const event = {
                    id: lines.find(l => l.startsWith('UID'))?.split(':')[1]?.split('@')[0] || `imported_${Date.now()}`,
                    title: lines.find(l => l.startsWith('SUMMARY'))?.split(':')[1] || 'Imported Event',
                    start: lines.find(l => l.startsWith('DTSTART'))?.split(':')[1]?.replace(/[-:]/g, '') || '',
                    end: lines.find(l => l.startsWith('DTEND'))?.split(':')[1]?.replace(/[-:]/g, '') || '',
                    location: lines.find(l => l.startsWith('LOCATION'))?.split(':')[1] || '',
                    description: lines.find(l => l.startsWith('DESCRIPTION'))?.split(':')[1] || ''
                };
                if (event.start) {
                    const year = event.start.substring(0,4);
                    const month = event.start.substring(4,6);
                    const day = event.start.substring(6,8);
                    const hour = event.start.substring(8,10) || '00';
                    const min = event.start.substring(10,12) || '00';
                    event.start = `${year}-${month}-${day}T${hour}:${min}:00`;
                }
                if (event.end) {
                    const year = event.end.substring(0,4);
                    const month = event.end.substring(4,6);
                    const day = event.end.substring(6,8);
                    const hour = event.end.substring(8,10) || '00';
                    const min = event.end.substring(10,12) || '00';
                    event.end = `${year}-${month}-${day}T${hour}:${min}:00`;
                }
                this.store.addEvent(event);
            });
            this.showToast(`Imported ${eventBlocks.length} events!`, 'success');
        };
        reader.readAsText(file);
    }
}

// --- 4. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const store = new Store();
    const renderer = new Renderer(store);
    store.subscribe(() => renderer.render());

    // View Navigation
    document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setState({ view: btn.dataset.view });
    });

    // Category Filter
    document.querySelectorAll('.category-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setState({ category: btn.dataset.category });
    });

    // Date Navigation
    document.getElementById('prev-btn').onclick = () => {
        const date = new Date(store.state.currentDate);
        if (store.state.view === 'month') date.setMonth(date.getMonth() - 1);
        else if (store.state.view === 'week') date.setDate(date.getDate() - 7);
        else if (store.state.view === 'day') date.setDate(date.getDate() - 1);
        else if (store.state.view === 'year') date.setFullYear(date.getFullYear() - 1);
        store.setState({ currentDate: date });
    };

    document.getElementById('next-btn').onclick = () => {
        const date = new Date(store.state.currentDate);
        if (store.state.view === 'month') date.setMonth(date.getMonth() + 1);
        else if (store.state.view === 'week') date.setDate(date.getDate() + 7);
        else if (store.state.view === 'day') date.setDate(date.getDate() + 1);
        else if (store.state.view === 'year') date.setFullYear(date.getFullYear() + 1);
        store.setState({ currentDate: date });
    };

    document.getElementById('today-btn').onclick = () => {
        store.setState({ currentDate: new Date() });
    };

    // Search
    document.getElementById('search-input').oninput = (e) => store.setState({ searchQuery: e.target.value });

    // Buttons
    document.getElementById('add-event-btn').onclick = () => renderer.openAdd();
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

    // Modal Controls
    const modal = document.getElementById('event-modal');
    document.getElementById('modal-close').onclick = () => modal.close();
    document.getElementById('cancel-btn').onclick = () => modal.close();
    modal.onclick = (e) => { if(e.target === modal) modal.close(); };
    
    document.getElementById('event-recurring').onchange = (e) => {
        document.getElementById('recurring-options').classList.toggle('hidden', !e.target.checked);
    };

    document.getElementById('delete-event-btn').onclick = () => {
        const id = document.getElementById('event-id').value;
        if(id && confirm('Delete this event?')) { 
            store.deleteEvent(id); 
            modal.close(); 
            renderer.showToast('Event deleted', 'success'); 
        }
    };

    // --- Form Submission ---
    const form = document.getElementById('event-form');
    form.onsubmit = (e) => {
        e.preventDefault(); // STOP PAGE RELOAD
        
        const id = document.getElementById('event-id').value;
        const data = {
            title: document.getElementById('event-title').value,
            start: document.getElementById('event-start').value,
            end: document.getElementById('event-end').value,
            category: document.getElementById('event-category').value,
            color: document.getElementById('event-color').value,
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value,
            recurring: document.getElementById('event-recurring').checked,
            recurrencePattern: document.getElementById('recurrence-pattern').value,
            recurrenceCount: parseInt(document.getElementById('recurrence-end').value)
        };
        
        if(id) { 
            store.updateEvent(id, data); 
            renderer.showToast('Event updated', 'success'); 
        } else { 
            store.addEvent(data); 
            renderer.showToast('Event created', 'success'); 
        }
        modal.close();
    };

    // Export/Import
    document.getElementById('export-btn').onclick = () => renderer.exportToICS();
    document.getElementById('import-btn').onclick = () => document.getElementById('import-file').click();
    document.getElementById('import-file').onchange = (e) => {
        if(e.target.files[0]) {
            renderer.importFromICS(e.target.files[0]);
            e.target.value = '';
        }
    };

    renderer.render();
});
