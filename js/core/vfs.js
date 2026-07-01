const VFS = {
    STORAGE_KEY: 'wasos_vfs_data',
    
    data: null,
    
    init() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                this.data = {
                    documents: {
                        'welcome.txt': 'Welcome to Was-OS!\n\nYour virtual filesystem persists across sessions.',
                        'notes.txt': 'Quick notes...'
                    },
                    pictures: {},
                    trash: {}
                };
                this._save();
            } else {
                this.data = JSON.parse(stored);
            }
            
            console.log('[VFS] Initialized successfully');
        } catch (error) {
            console.error('[VFS] Initialization error:', error);
            this.data = { documents: {}, pictures: {}, trash: {} };
        }
    },
    
    _save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (error) {
            console.error('[VFS] Save error:', error);
            Notifier?.show({
                title: 'Storage Error',
                message: 'Failed to save file changes.',
                type: 'error'
            });
        }
    },
    
    list(dir = '') {
        const parts = dir ? dir.split('/').filter(Boolean) : [];
        let current = this.data;
        
        for (const part of parts) {
            if (!current[part] || typeof current[part] !== 'object') return [];
            current = current[part];
        }
        
        if (typeof current !== 'object') return [];
        return Object.keys(current).sort();
    },
    
    read(filePath) {
        const parts = filePath.split('/').filter(Boolean);
        let current = this.data;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!current[part]) return null;
            if (i === parts.length - 1) return current[part];
            current = current[part];
        }
        
        return null;
    },
    
    write(filePath, content) {
        try {
            const parts = filePath.split('/').filter(Boolean);
            if (parts.length === 0) return false;
            
            const fileName = parts.pop();
            let current = this.data;
            for (const part of parts) {
                if (!current[part]) current[part] = {};
                current = current[part];
            }
            
            current[fileName] = content;
            this._save();
            return true;
        } catch (error) {
            console.error('[VFS] Write error:', error);
            return false;
        }
    },
    
    delete(filePath) {
        const parts = filePath.split('/').filter(Boolean);
        if (parts.length === 0) return false;
        
        const fileName = parts.pop();
        let current = this.data;
        
        for (const part of parts) {
            if (!current[part]) return false;
            current = current[part];
        }
        
        if (current[fileName] !== undefined) {
            delete current[fileName];
            this._save();
            return true;
        }
        
        return false;
    },
    
    exists(filePath) {
        const parts = filePath.split('/').filter(Boolean);
        let current = this.data;
        
        for (const part of parts) {
            if (!current[part]) return false;
            current = current[part];
        }
        
        return true;
    },
    
    isDirectory(filePath) {
        const parts = filePath.split('/').filter(Boolean);
        let current = this.data;
        
        for (const part of parts) {
            if (!current[part]) return false;
            current = current[part];
        }
        
        return typeof current === 'object';
    },
    
    move(fromPath, toPath) {
        const content = this.read(fromPath);
        if (content === null) return false;
        
        const success = this.write(toPath, content);
        if (success) {
            this.delete(fromPath);
            return true;
        }
        
        return false;
    },
    
    getAllFiles(dir = '') {
        const files = [];
        this._traverse(dir, (path, item) => {
            if (typeof item !== 'object') files.push(path);
        });
        return files.sort();
    },
    
    _traverse(path, callback, obj = this.data) {
        const prefix = path ? path + '/' : '';
        
        for (const [key, value] of Object.entries(obj)) {
            const fullPath = prefix + key;
            if (typeof value === 'object') {
                this._traverse(fullPath, callback, value);
            } else {
                callback(fullPath, value);
            }
        }
    },
    
    getStorageUsed() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY) || '';
            return new TextEncoder().encode(stored).length;
        } catch {
            return 0;
        }
    },
    
    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            this.data = { documents: {}, pictures: {}, trash: {} };
            this._save();
            return true;
        } catch (error) {
            console.error('[VFS] Clear error:', error);
            return false;
        }
    }
};

window.VFS = VFS;