import {FACTS,SHOTS,PERSPECTIVES,makeCut} from "./story.mjs";

const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
const state={pov:"friend",focus:"auto",index:0,compare:false};
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
  const cut=makeCut(state.pov,state.focus);
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
  $("#cutLabel").textContent="CUT "+labels[state.pov]+" · "+pov.name.toUpperCase();
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
  const len=makeCut(state.pov,state.focus).shotOrder.length;
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
    state.index=0;
    render();
  }));

  $("#focusSelect").addEventListener("change",e=>{
    state.focus=e.target.value;
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
  render();
  renderComparison();
}
init();
