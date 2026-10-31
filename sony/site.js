
const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
document.querySelectorAll('[data-vimeo]').forEach(box=>{box.querySelector('button').addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src='https://player.vimeo.com/video/'+box.dataset.vimeo+'?autoplay=1&dnt=1';frame.title=box.dataset.title||'Project video';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;box.replaceChildren(frame);});});
const dialog=document.querySelector('dialog');
document.querySelectorAll('.image-button').forEach(button=>button.addEventListener('click',()=>{const image=button.querySelector('img');dialog.querySelector('img').src=image.src;dialog.querySelector('img').alt=image.alt;dialog.querySelector('.dialog-caption').textContent=image.alt;dialog.showModal();}));
dialog?.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
