
const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
document.querySelectorAll('[data-vimeo]').forEach(box=>{box.querySelector('button')?.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src='https://player.vimeo.com/video/'+box.dataset.vimeo+'?autoplay=1&title=0&byline=0&portrait=0&dnt=1';frame.title=box.dataset.title||'Project video';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;box.replaceChildren(frame);});});
const dialog=document.querySelector('dialog');let gallery=[],active=0;
const prev=dialog?.querySelector('.viewer-prev'),next=dialog?.querySelector('.viewer-next');
function showEvidence(index){if(!dialog||!gallery.length)return;active=Math.max(0,Math.min(index,gallery.length-1));const button=gallery[active],img=button.querySelector('img');dialog.querySelector('img').src=button.dataset.full||img.src;dialog.querySelector('img').alt=img.alt;dialog.querySelector('.dialog-caption').textContent=img.alt+(gallery.length>1?' · '+(active+1)+' / '+gallery.length:'');if(prev)prev.disabled=active===0;if(next)next.disabled=active===gallery.length-1;}
document.querySelectorAll('.image-button').forEach(button=>button.addEventListener('click',()=>{if(!dialog)return;const group=button.closest('[data-gallery]');gallery=Array.from((group||document).querySelectorAll('.image-button'));showEvidence(gallery.indexOf(button));dialog.showModal();}));
prev?.addEventListener('click',()=>showEvidence(active-1));next?.addEventListener('click',()=>showEvidence(active+1));
dialog?.querySelector('.close-dialog')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showEvidence(active-1);}if(e.key==='ArrowRight'){e.preventDefault();showEvidence(active+1);}});
dialog?.addEventListener('close',()=>{dialog.querySelector('img').removeAttribute('src');});
