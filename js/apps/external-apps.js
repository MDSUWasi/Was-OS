OS.registerApp({
    id: 'external-apps',
    title: 'Installed Web Apps',
    icon: '🌐',
    description: 'Launch your own HTML apps inside Was-OS',
    category: 'system',
    singleInstance: true,

    init(pid, bodyId, state) {
        const container = document.getElementById(bodyId);
        if (!container) return;

        container.style.cssText = 'height:100%;background:#1b1b1f;color:#fff;padding:20px;overflow:auto;font-family:sans-serif;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;';
        header.innerHTML = '<h2 style="margin:0;font-size:1.2rem;">Installed Web Apps</h2><span style="color:#8a8a8a;font-size:0.9rem;">Open HTML apps inside the desktop</span>';

        const list = document.createElement('div');
        list.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;';

        const appElements = Array.from(document.querySelectorAll('#custom-app-source .external-app'));

        if (appElements.length === 0) {
            list.innerHTML = '<div style="grid-column:1/-1;color:#999;padding:40px;text-align:center;">No custom HTML apps found. Add them to #custom-app-source in index.html.</div>';
        }

        appElements.forEach(el => {
            const id = el.dataset.id || `custom-${Math.random().toString(36).slice(2)}`;
            const title = el.dataset.title || 'Custom App';
            const icon = el.dataset.icon || '🧩';
            const src = el.dataset.src;
            const description = el.dataset.description || 'HTML web app loaded inside the OS';
            const category = el.dataset.category || 'custom';

            const card = document.createElement('button');
            card.type = 'button';
            card.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;padding:18px;background:#222229;border:1px solid #333;border-radius:14px;color:#fff;cursor:pointer;text-align:left;transition:transform .15s ease;';
            card.onmouseenter = () => card.style.transform = 'translateY(-1px)';
            card.onmouseleave = () => card.style.transform = 'translateY(0)';
            card.innerHTML = `<span style="font-size:1.6rem;margin-bottom:12px;">${icon}</span><strong style="font-size:1rem;margin-bottom:6px;">${title}</strong><span style="color:#999;font-size:0.85rem;line-height:1.4;">${description}</span>`;

            card.onclick = () => {
                if (!src) {
                    Notifier.show({ title: 'Missing Source', message: `Custom app '${title}' has no data-src attribute.`, type: 'warning' });
                    return;
                }

                OS.registerApp({
                    id,
                    title,
                    icon,
                    description,
                    category,
                    singleInstance: true,
                    init(innerPid, innerBodyId) {
                        const innerContainer = document.getElementById(innerBodyId);
                        if (!innerContainer) return;
                        innerContainer.style.background = '#000';
                        innerContainer.style.padding = '0';
                        innerContainer.style.overflow = 'hidden';
                        innerContainer.innerHTML = `<iframe src="${src}" style="border:none;width:100%;height:100%;"></iframe>`;
                    }
                });

                OS.launchApp(id);
            };

            list.appendChild(card);
        });

        container.append(header, list);
    }
});