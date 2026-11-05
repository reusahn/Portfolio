import {FACTS,SHOTS,PERSPECTIVES,makeCut} from "./story.mjs";
import {acceptEditProposal} from "./edit-contract.mjs";

const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
const state={pov:"friend",focus:"auto",index:0,compare:false,preview:null};
const labels={friend:"A",worker:"B",leaver:"C"};

function el(tag,className,text){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

function drawFactLedger(){
  const root=$("#facts");
  root.replaceChildren();
  FACTS.forEach(text=>{
    const item=el("li","fact",text);
    root.append(item);
  });
}

function makeCompareCard(id,pov){
  const card=el("article","compare-card");
  card.append(el("div","identifier",labels[id]+" / "+pov.role.toUpperCase()));
  card.append(el("h3","",pov.quote));
  const p=el("p");
  const factLabel=el("b","","BELIEF / ");
  p.append(factLabel,document.createTextNode(pov.inference));
  const u=el("p");
  u.append(el("b","","UNKNOWABLE / "),document.createTextNode(pov.uncertainty));
  card.append(p,u);
  return card;
}

function renderComparison(){
  const grid=$("#compareGrid");
  grid.replaceChildren();
  Object.entries(PERSPECTIVES).forEach(([id,pov])=>grid.append(makeCompareCard(id,pov)));
  const section=$("#comparison");
  section.hidden=!state.compare;
  const button=$("#compareButton");
  button.setAttribute("aria-expanded",String(state.compare));
  button.textContent=state.compare?"HIDE THE COMPARISON ↑":"COMPARE ALL THREE CUTS ↗";
}

function render(){
  const pov=PERSPECTIVES[state.pov];
  const authored=makeCut(state.pov,state.focus);
  const cut=state.preview&&state.preview.perspective===state.pov
    ? {...authored,shotOrder:[...state.preview.shotOrder],caption:state.preview.caption}
    : authored;
  state.index=Math.max(0,Math.min(state.index,cut.shotOrder.length-1));
  const shotId=cut.shotOrder[state.index];
  const shot=SHOTS[shotId];

  $$(".pov").forEach(button=>{
    const active=button.dataset.pov===state.pov;
    button.classList.toggle("selected",active);
    button.setAttribute("aria-pressed",String(active));
  });

  $("#frame").dataset.palette=pov.palette;
  $("#frame").dataset.shot=shotId;
  $("#frame").setAttribute("aria-label","Storyboard shot "+(state.index+1)+": "+shot.label+". Press Left and Right arrow keys to navigate.");
  $("#cutLabel").textContent="CUT "+labels[state.pov]+" · "+pov.name.toUpperCase()+(state.preview?" / DEMO EDIT":"");
  const previewStatus=$("#previewStatus");
  if(previewStatus)previewStatus.textContent=state.preview?"Approved demonstration edit active · "+state.preview.pace+" pace. Not AI-generated.":"Original director-authored cut active.";
  $("#frameTitle").textContent=shot.label.toUpperCase();
  $("#frameDetail").textContent=shot.detail;
  $("#frameCount").textContent=String(state.index+1).padStart(2,"0")+" / "+String(cut.shotOrder.length).padStart(2,"0");
  $("#filmSubtitle").textContent=cut.caption;
  $("#shotPosition").textContent=(state.index+1)+" / "+cut.shotOrder.length;
  $("#progressBar").style.width=((state.index+1)/cut.shotOrder.length*100)+"%";
  $("#quote").textContent="“"+pov.quote+"”";
  $("#povSubtitle").textContent=pov.subtitle;
  $("#directorNote").textContent=pov.notes;
  $("#assumption").textContent=pov.inference;
  $("#uncertainty").textContent=pov.uncertainty;
  $("#focusSelect").value=state.focus;
  const previewButton=$("#previewButton");
  if(previewButton){previewButton.textContent=state.preview?"RESTORE ORIGINAL CUT":"PREVIEW VALIDATED EDIT";previewButton.setAttribute("aria-pressed",String(!!state.preview));}
  $("#prevShot").disabled=state.index<=0;
  $("#nextShot").disabled=state.index>=cut.shotOrder.length-1;

  const strip=$("#filmstrip");
  strip.replaceChildren();
  cut.shotOrder.forEach((id,index)=>{
    const b=el("button","strip-shot"+(index===state.index?" active":""));
    b.type="button";
    b.setAttribute("aria-label","View shot "+(index+1)+": "+SHOTS[id].label);
    b.setAttribute("aria-pressed",String(index===state.index));
    b.append(el("span","",String(index+1).padStart(2,"0")+" / SHOT"));
    b.append(el("strong","",SHOTS[id].label));
    b.addEventListener("click",()=>{state.index=index;render()});
    strip.append(b);
  });

  const announce=$("#screenAnnounce");
  if(announce)announce.textContent=pov.name+", shot "+(state.index+1)+": "+shot.label;
}

function navigate(delta){
  const len=state.preview?state.preview.shotOrder.length:makeCut(state.pov,state.focus).shotOrder.length;
  const next=Math.min(len-1,Math.max(0,state.index+delta));
  if(next!==state.index){state.index=next;render()}
}

function init(){
  drawFactLedger();
  const announcer=el("div","visually-hidden");
  announcer.id="screenAnnounce";
  announcer.setAttribute("role","status");
  announcer.setAttribute("aria-live","polite");
  document.body.append(announcer);

  $$(".pov").forEach(button=>button.addEventListener("click",()=>{
    state.pov=button.dataset.pov;
    state.focus="auto";
    state.preview=null;
    state.index=0;
    render();
  }));

  $("#focusSelect").addEventListener("change",e=>{
    state.focus=e.target.value;
    state.preview=null;
    state.index=0;
    render();
  });

  $("#prevShot").addEventListener("click",()=>navigate(-1));
  $("#nextShot").addEventListener("click",()=>navigate(1));
  $("#frame").addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"){e.preventDefault();navigate(-1)}
    if(e.key==="ArrowRight"){e.preventDefault();navigate(1)}
  });
  $("#compareButton").addEventListener("click",()=>{
    state.compare=!state.compare;
    renderComparison();
    if(state.compare)$("#comparison").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  });
  // An intentionally authored fixture demonstrates the exact validator path a future
  // model response must pass. No API request is made and no output is attributed to AI.
  const previewButton=el("button","secondary-button");
  previewButton.type="button";
  previewButton.id="previewButton";
  previewButton.setAttribute("aria-pressed","false");
  const previewStatus=el("p","hint","Original director-authored cut active.");
  previewStatus.id="previewStatus";
  const demoNote=el("p","hint","This is a pre-written test proposal, not an AI response. The validator rejects invented facts and unapproved captions.");
  const anchor=$("#compareButton");
  anchor.parentNode.insertBefore(previewButton,anchor);
  anchor.parentNode.insertBefore(previewStatus,anchor);
  anchor.parentNode.insertBefore(demoNote,anchor);
  previewButton.addEventListener("click",()=>{
    if(state.preview){state.preview=null;state.index=0;render();return}
    const original=PERSPECTIVES[state.pov];
    const captionIds={friend:"silence",worker:"clock",leaver:"pause"};
    const source=[...original.shots].reverse();
    const proposal={perspective:state.pov,shot_order:source,caption_id:captionIds[state.pov],pace:"measured"};
    const result=acceptEditProposal(proposal,state.pov);
    if(!result.ok){previewStatus.textContent="Proposal rejected: "+result.errors.join("; ");return}
    state.preview=result.edit;
    state.focus="auto";
    state.index=0;
    render();
  });
  render();
  renderComparison();
}
init();
