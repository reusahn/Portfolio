
(function(){
  const body=document.body;
  const btn=document.querySelector('[data-guide-toggle]');
  const saved=localStorage.getItem('portfolioGuide')==='1';
  if(saved) body.classList.add('guide-mode');
  if(btn){
    const sync=()=>{const on=body.classList.contains('guide-mode');btn.classList.toggle('on',on);btn.textContent=on?'Build Guide: ON':'Build Guide';};
    sync();btn.addEventListener('click',()=>{body.classList.toggle('guide-mode');localStorage.setItem('portfolioGuide',body.classList.contains('guide-mode')?'1':'0');sync();});
  }
  document.querySelectorAll('.media-slot img[data-src]').forEach(img=>{
    const slot=img.closest('.media-slot');
    img.addEventListener('load',()=>slot.classList.add('has-media'));
    img.addEventListener('error',()=>{img.removeAttribute('src');slot.classList.remove('has-media')});
    img.src=img.dataset.src;
  });
  document.querySelectorAll('.media-slot video[data-src]').forEach(video=>{
    const slot=video.closest('.media-slot');
    const src=video.dataset.src;
    const onReady=()=>slot.classList.add('has-media');
    const onError=()=>{video.removeAttribute('src');slot.classList.remove('has-media')};
    video.addEventListener('loadeddata',onReady,{once:true});
    video.addEventListener('error',onError,{once:true});
    video.src=src;
    video.load();
  });
})();
