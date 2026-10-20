
const dialog=document.querySelector('.viewer');
if(dialog){const target=dialog.querySelector('img'),caption=dialog.querySelector('p');document.querySelectorAll('[data-enlarge]').forEach(button=>button.addEventListener('click',()=>{const img=button.querySelector('img');target.src=img.src;target.alt=img.alt;caption.textContent=img.alt;dialog.showModal();}));dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{const iframe=document.createElement('iframe');iframe.src='https://player.vimeo.com/video/'+button.dataset.video+'?autoplay=1&title=0&byline=0&portrait=0&dnt=1'+(button.dataset.hash?'&h='+encodeURIComponent(button.dataset.hash):'');iframe.title=button.dataset.title;iframe.allow='autoplay; fullscreen; picture-in-picture';iframe.allowFullscreen=true;button.replaceWith(iframe);}));


(function(){
  document.querySelectorAll('.case-filters').forEach(function(group){
    var section=group.closest('.study-library');
    if(!section) return;
    var cards=Array.from(section.querySelectorAll('[data-case-category]'));
    var count=section.querySelector('[data-case-count]');
    group.querySelectorAll('[data-case-filter]').forEach(function(button){
      button.addEventListener('click',function(){
        var category=button.dataset.caseFilter,shown=0;
        group.querySelectorAll('[data-case-filter]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});
        cards.forEach(function(card){var visible=category==='All'||card.dataset.caseCategory===category;card.hidden=!visible;if(visible)shown++;});
        if(count)count.textContent=shown+' study '+(shown===1?'brief':'briefs')+' shown';
      });
    });
  });
  var toolbar=document.querySelector('.board-toolbar');
  if(!toolbar)return;
  var key='jonghoon-lighting-evidence-v1',checks=Array.from(document.querySelectorAll('[data-evidence-key]')),notes=Array.from(document.querySelectorAll('[data-evidence-notes]'));
  var progress=document.querySelector('[data-evidence-progress]'),status=document.querySelector('[data-board-status]'),fileInput=document.querySelector('[data-board-file]'),saveTimer;
  function tell(message){if(status)status.textContent=message;}
  function collect(){var state={schema:'lighting-evidence-progress/v1',updated_at:new Date().toISOString(),checks:{},notes:{}};checks.forEach(function(x){state.checks[x.dataset.evidenceKey]=x.checked;});notes.forEach(function(x){state.notes[x.dataset.evidenceNotes]=x.value;});return state;}
  function update(){var n=checks.filter(function(x){return x.checked;}).length;if(progress)progress.textContent=n+' / '+checks.length+' presentation evidence items checked';}
  function apply(state){
    if(!state||typeof state!=='object'||Array.isArray(state)||state.schema!=='lighting-evidence-progress/v1')throw new Error('Choose a lighting evidence progress JSON exported from this page.');
    var c=state.checks&&typeof state.checks==='object'&&!Array.isArray(state.checks)?state.checks:{};
    var n=state.notes&&typeof state.notes==='object'&&!Array.isArray(state.notes)?state.notes:{};
    checks.forEach(function(x){x.checked=c[x.dataset.evidenceKey]===true;});
    notes.forEach(function(x){var v=n[x.dataset.evidenceNotes];x.value=typeof v==='string'?v.slice(0,8000):'';});
    update();
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(collect()));tell('Saved in this browser. Export a copy for a portable record.');}catch(e){tell('Browser storage is unavailable. Export progress to keep a copy.');}update();}
  try{var stored=localStorage.getItem(key);if(stored)apply(JSON.parse(stored));}catch(e){tell('Saved browser progress could not be loaded. You can import an exported JSON copy.');}
  update();
  checks.forEach(function(x){x.addEventListener('change',save);});
  notes.forEach(function(x){x.addEventListener('input',function(){clearTimeout(saveTimer);saveTimer=setTimeout(save,300);});});
  window.addEventListener('pagehide',function(){clearTimeout(saveTimer);try{localStorage.setItem(key,JSON.stringify(collect()));}catch(e){}});
  toolbar.querySelector('[data-board-export]').addEventListener('click',function(){
    try{clearTimeout(saveTimer);save();var data=JSON.stringify(collect(),null,2),blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='jonghoon-lighting-evidence-progress.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);tell('Progress exported. Published portfolio pages have not been changed.');}catch(e){tell('Export could not be created in this browser. Copy your notes before leaving.');}
  });
  toolbar.querySelector('[data-board-import]').addEventListener('click',function(){fileInput.click();});
  fileInput.addEventListener('change',async function(){
    var file=fileInput.files&&fileInput.files[0];if(!file)return;
    try{if(file.size>2000000)throw new Error('Choose a progress JSON smaller than 2 MB.');var parsed=JSON.parse(await file.text());apply(parsed);save();tell('Progress imported and saved in this browser. Published pages have not been changed.');}
    catch(e){tell(e.message||'Could not read this progress JSON.');}
    finally{fileInput.value='';}
  });
})();
