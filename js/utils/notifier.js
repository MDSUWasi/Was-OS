const Notifier={
    container:null,
    init(){
        this.container=document.getElementById('notification-area');
        if(!this.container){this.container=document.createElement('div');this.container.id='notification-area';document.body.appendChild(this.container);}
        console.log('[Notifier] ready');
    },
    show({title,message,type='info',duration=5000}){
        if(!this.container)this.init();
        const n=document.createElement('div');n.className=`notification notif-${type}`;
        n.innerHTML=`<div class="notif-title">${title}</div><div class="notif-msg">${message}</div>`;
        this.container.appendChild(n);
        setTimeout(()=>{if(n.parentNode){n.style.opacity='0';setTimeout(()=>n.remove(),300);}},duration);
        return n;
    },
    clear(){this.container&&(this.container.innerHTML='');}
};
window.Notifier=Notifier;