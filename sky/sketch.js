// THE SKY HAS SIDES — a p5 study for MAT 236.
// Draw in the pad, pull the completed shape back by its center, then release.
// Every completed drawing is a separate solid shape with its own collider.
// Hand input uses ml5 HandPose: palm position and a closed-fist press.

const INK = [[246,111,101],[249,177,57],[95,188,223],
  [167,128,226],[132,197,133],[235,116,168]];
let pad, ui=[], candidate=null, pieces=[];
let currentColor=0, lastColor=-1, activeSource=null, action=null, pointerId=null;
let pointer={x:0,y:0}, hover={x:-100,y:-100}, dragStart=null;
let score=0, launches=0, combo=0, hint='', hintUntil=0;
let skyBottom=0;
let lastTick=0;
let cameraState='off', cameraError='', camera=null, tracker=null;
let ml5Loading=null;
let hands=[], cameraToken=0, handPressed=false, handCursor=null;
let lostHand=0, lastHand={x:0,y:0}, curledFingers=0;
let fistFrames=0, openFrames=0, handFrame=0, processedHandFrame=-1, handSeenAt=0;
const FILL_GAP_RADIUS=20; // Half the width of the smallest settled form.
const AUTO_SEAL_COVERAGE=.98;
let coverage=0, inkCoverage=0, pendingArchive=false, manualArchive=false;
let autoArchiveAt=null, stageStart=new Date(), stageNumber=1;
let lastCoverageAt=0;
let archives=[], galleryIndex=-1, transition=null;
let archiveYaw=0, archiveFaces=[], archiveDrag=null;
let nextPieceId=1;
let startupFailure=false;

function setup(){
  window.skySetupEntered=true;
  try{setupSketch();}
  catch(err){startupFailure=true;console.error('Sketch setup failed:',err);
    window.showStartupError?.('setup: '+String(err?.message||err));}
}
function setupSketch(){
  const canvas=createCanvas(windowWidth,windowHeight);
  stageStart=new Date();
  pixelDensity(1);textFont('Arial');
  canvas.elt.addEventListener('pointerdown',pointerDown);
  canvas.elt.addEventListener('pointermove',pointerMove);
  canvas.elt.addEventListener('pointerup',pointerUp);
  canvas.elt.addEventListener('pointercancel',pointerUp);
  window.addEventListener('keydown',keyboard,true);
  arrange();chooseColor();
  clearPreviousArchive();
  say('DRAW A LINE OR CURVE IN THE PAD');
}
function chooseColor(){
  const choices=INK.map((_,i)=>i).filter(i=>i!==lastColor);
  currentColor=random(choices);lastColor=currentColor;
}
function arrange(){
  const w=min(390,max(180,width-36)),h=height<560?110:142;
  // Leave room below the pad for a longer backward pull before release.
  const bottomMargin=height<560?50:70;
  pad={x:(width-w)/2,y:height-h-bottomMargin,w,h};
  skyBottom=max(130,pad.y-18);
  ui=[];
  addButton('hand',width-(width<600?92:120),65,width<600?76:96,29);
  addButton('seal',width-(width<600?170:208),65,width<600?68:78,29);
  updateCoverage();
}
function addButton(id,x,y,w,h){ui.push({id,x,y,w,h});}
function windowResized(){
  if(transition){transition.old.remove();transition=null;stageStart=new Date();}
  const sx=windowWidth/width,sy=windowHeight/height;
  for(const p of pieces){
    p.start.x*=sx;p.start.y*=sy;p.target.x*=sx;p.target.y*=sy;
    p.x*=sx;p.y*=sy;
  }
  resizeCanvas(windowWidth,windowHeight);
  candidate=null;activeSource=null;action=null;
  arrange();
}
function inPad(x,y){return x>=pad.x&&x<=pad.x+pad.w&&y>=pad.y&&y<=pad.y+pad.h;}
function buttonAt(x,y){return ui.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);}
function say(s){hint=s;hintUntil=millis()+3500;}
function draw(){
  window.skyDrawEntered=true;
  if(startupFailure)return;
  try{drawFrame();}
  catch(err){startupFailure=true;console.error('Sketch draw failed:',err);
    window.showStartupError?.('draw: '+String(err?.message||err));noLoop();}
}
function drawFrame(){
  const now=millis(),dt=min(.05,max(0,(now-lastTick)/1000));lastTick=now;
  background(249,249,247);
  if(transition){
    try{drawTransition();}
    catch(err){
      console.error('Face transition:',err);
      transition.old?.remove();transition=null;stageStart=new Date();
      background(249,249,247);say('NEW FACE OPENED');
    }
    drawTopInterface();drawGallery();
    updateHand();if(handCursor)drawHandCursor();return;
  }
  updatePieces(dt);
  stepSettled(dt);
  if(pieces.length&&now-lastCoverageAt>450){
    updateCoverage();lastCoverageAt=now;
    requestAutoArchive();
  }
  if(pendingArchive&&!pieces.some(p=>p.phase==='flying')&&
    (manualArchive||pieces.every(p=>Math.hypot(p.vx||0,p.vy||0)<.08)||
      (autoArchiveAt!==null&&now-autoArchiveAt>2200))){
    pendingArchive=false;manualArchive=false;autoArchiveAt=null;
    archiveStage();return;
  }
  drawShapes();
  drawInterface();
  drawCandidate();
  drawTopInterface();
  drawGallery();
  updateHand();
  if(handCursor)drawHandCursor();
  if(!window.skyFirstFrame){window.skyFirstFrame=true;
    const status=document.getElementById('startup');if(status)status.style.display='none';}
}
function drawInterface(){
  // The pad is a drawing surface, a graspable object, and a launch origin.
  fill(254);stroke(37,46,53,150);strokeWeight(1.2);rect(pad.x,pad.y,pad.w,pad.h,3);
  noStroke();fill(132,140,143);textAlign(LEFT,TOP);textSize(9);
  text(candidate?'PULL FROM CENTER':'DRAW HERE',pad.x+18,pad.y+17);
  const rgb=INK[candidate?candidate.color:currentColor];
  noStroke();fill(...rgb);circle(pad.x+pad.w-26,pad.y+27,14);
  if(candidate){
    const n=candidate.strokes.length;
    fill(117,124,128);textAlign(RIGHT,TOP);textSize(9);
    text(n+' MARK'+(n>1?'S':''),pad.x+pad.w-17,pad.y+44);
  }
  fill(145,151,155);textAlign(CENTER,TOP);textSize(10);
  const line=candidate?'GRAB THE CENTER  ·  PULL BACK  ·  RELEASE':
    cameraState==='on'?'CLOSE FIST TO DRAW  ·  FIST AT CENTER, PULL BACK':
      pieces.length?'CLICK A PLACED SHAPE TO NUDGE  ·  SAVE/NEXT TO TURN':
      'DRAW IN THE PAD  ·  EACH NEW FORM GETS A RANDOM COLOR';
  text(line,width/2,pad.y+pad.h+7,min(width-24,630));
  if(millis()<hintUntil){fill(92,99,104);textSize(10);
    text(hint,width/2,max(132,pad.y-42),min(width-30,580));}
  if(cameraState==='on')drawCameraPreview();
}
function drawTopInterface(){
  const mobile=width<600;
  noStroke();fill(34,39,43);textAlign(LEFT,TOP);
  textSize(mobile?14:16);textStyle(NORMAL);
  text(mobile?'SKY / SIDES':'THE SKY HAS SIDES',20,20);
  fill(132,140,144);textSize(mobile?9:10);
  text('DRAW · THROW · FILL · TURN',21,mobile?42:50);
  for(const b of ui){
    const on=b.id==='hand'&&cameraState==='on';
    noStroke();fill(on?color(45,56,65):color(255));rect(b.x,b.y,b.w,b.h,8);
    noFill();stroke(65,75,83,on?0:65);strokeWeight(1);rect(b.x,b.y,b.w,b.h,8);
    noStroke();fill(on?255:58);textAlign(CENTER,CENTER);textSize(10);
    text(b.id==='hand'?(cameraState==='on'?'HAND ON':cameraState==='loading'?'CANCEL':'HAND OFF'):
      pendingArchive?'SAVING…':'SAVE/NEXT',
      b.x+b.w/2,b.y+b.h/2);
  }
  noStroke();fill(120,128,135);textAlign(LEFT,TOP);textSize(10);
  text('FACE '+String(stageNumber).padStart(2,'0')+'   PLACED '+launches+'   MATCH '+score,21,mobile?119:81);
  const barY=mobile?142:104;
  fill(224,228,228);rect(21,barY,min(mobile?156:230,width*.37),3,2);
  fill(91,115,124);rect(21,barY,min(mobile?156:230,width*.37)*coverage,3,2);
  fill(130,139,144);textSize(9);
  text('FILLED  '+floor(coverage*100)+'%  ·  INK  '+floor(inkCoverage*100)+'%',21,barY+9);
  drawArchiveShelf();
  if(cameraState==='loading'||cameraState==='error'||cameraState==='on'){
    fill(cameraState==='error'?color(186,62,61):color(107,119,125));textSize(9);
    const s=cameraState==='loading'?'STARTING CAMERA / HAND MODEL…':
      cameraState==='error'?'HAND ERROR: '+cameraError:
      hands.length?(handPressed?'FIST HELD · MOVE YOUR HAND':
        'HAND TRACKED · CLOSE YOUR FIST TO PRESS'):'CAMERA READY · SHOW YOUR HAND';
    text(s,21,mobile?171:133,min(width-35,510));
  }
}
function drawCameraPreview(){
  if(!camera?.elt||camera.elt.readyState<2)return;
  const w=112,h=83,x=width-w-18,y=height-pad.h-h-83;
  push();noStroke();fill(255,240);rect(x-4,y-4,w+8,h+8,7);
  translate(x+w,y);scale(-1,1);drawingContext.drawImage(camera.elt,0,0,w,h);pop();
  if(hands.length){
    const hand=hands[0],vw=camera.elt.videoWidth||640,vh=camera.elt.videoHeight||480;
    const point=handPalm(hand);
    if(point){fill(36,115,103);stroke(255);strokeWeight(1.5);
      circle(x+point.x/vw*w,y+point.y/vh*h,handPressed?13:10);}
  }
}
function drawCandidate(){
  if(!candidate)return;
  const rgb=INK[candidate.color];
  if(candidate.strokes.length){
    const body=buildNodes(candidate.strokes);
    const shift=action?.type==='aim'?
      {x:pointer.x-dragStart.x,y:pointer.y-dragStart.y}:{x:0,y:0};
    if(action?.type==='aim'){
      noFill();stroke(165,172,174,170);strokeWeight(1.2);
      drawingContext.setLineDash([5,5]);
      drawContour(body.outline.map(q=>({x:q.x+body.center.x,y:q.y+body.center.y})));
      drawingContext.setLineDash([]);
    }
    fill(...rgb);stroke(40,46,51);strokeWeight(3.2);strokeJoin(ROUND);
    drawContour(body.outline.map(q=>({x:q.x+body.center.x+shift.x,
      y:q.y+body.center.y+shift.y})));
    const cx=body.center.x+shift.x,cy=body.center.y+shift.y;
    if(action?.type==='aim'){
      noFill();stroke(47,55,60);strokeWeight(1.4);
      line(cx,cy,body.center.x,body.center.y);
      circle(body.center.x,body.center.y,8);
      const ax=constrain(-shift.x*1.5,-min(135,width*.28),min(135,width*.28));
      const ay=constrain(-shift.y*1.5,-min(160,height*.22),80)-32;
      const ex=cx+ax,ey=cy+ay,a=atan2(ay,ax);
      drawingContext.setLineDash([4,5]);line(cx,cy,ex,ey);
      drawingContext.setLineDash([]);
      line(ex,ey,ex-11*cos(a-.5),ey-11*sin(a-.5));
      line(ex,ey,ex-11*cos(a+.5),ey-11*sin(a+.5));
    }
    fill(254);stroke(40,46,51);strokeWeight(1.7);circle(cx,cy,15);
    noStroke();fill(40,46,51);circle(cx,cy,3.5);
  }
  noFill();stroke(...rgb,190);strokeWeight(8);strokeCap(ROUND);strokeJoin(ROUND);
  if(action?.type==='drawing'&&action.path){
    beginShape();for(const p of action.path)vertex(p.x,p.y);endShape();
  }
}
function previewConnection(){
  if(!candidate||candidate.strokes.length<2)return null;
  const st=candidate.strokes,a=st[st.length-2].at(-1),b=st.at(-1)[0];
  return {a,b};
}
function nearestMark(x,y){
  if(!candidate)return Infinity;
  let best=Infinity;
  for(const s of candidate.strokes){
    if(s.length===1){best=min(best,dist(x,y,s[0].x,s[0].y));continue;}
    for(let i=1;i<s.length;i++){
      const a=s[i-1],b=s[i],dx=b.x-a.x,dy=b.y-a.y;
      const t=constrain(((x-a.x)*dx+(y-a.y)*dy)/max(.0001,dx*dx+dy*dy),0,1);
      best=min(best,dist(x,y,a.x+t*dx,a.y+t*dy));
    }
  }
  return best;
}
function beginAt(x,y,source){
  if(activeSource)return;
  if(galleryIndex>=0){galleryBegin(x,y,source);return;}
  if(transition)return;
  activeSource=source;pointer={x,y};
  const b=buttonAt(x,y);
  if(b){action={type:'button'};if(b.id==='hand')toggleCamera();else sealCurrentStage();return;}
  const tile=shelfTileAt(x,y);
  if(tile){action={type:'button'};openGallery(tile.index);return;}
  // A long stroke can put its centroid beyond the drawing pad. The grip
  // belongs to the shape, so it remains interactive anywhere on the canvas.
  if(candidate?.strokes.length){
    const body=buildNodes(candidate.strokes);
    if(dist(x,y,body.center.x,body.center.y)<20){
      action={type:'aim'};dragStart={x,y};return;
    }
  }
  if(tapShapeAt(x,y)){action={type:'tap'};return;}
  if(!inPad(x,y)){action={type:'idle'};return;}
  if(!candidate)candidate={strokes:[],color:currentColor};
  action={type:'drawing',path:[{x,y}]};
}
function moveAt(x,y,source){
  if(activeSource!==source)return;
  pointer={x,y};
  if(action?.type==='gallery'){galleryMove(x,y);return;}
  if(action?.type==='drawing'){
    const p=action.path.at(-1);
    const px=constrain(x,10,width-10),py=constrain(y,10,height-10);
    if(dist(p.x,p.y,px,py)>2.8)action.path.push({x:px,y:py});
  }
}
function endAt(x,y,source){
  if(activeSource!==source)return;
  moveAt(x,y,source);
  if(action?.type==='gallery')galleryEnd(x,y);
  if(action?.type==='drawing'){
    const path=action.path;
    if(path.length===1)path.push({x:path[0].x+1,y:path[0].y+1});
    candidate.strokes.push(path);
    say('GRAB THE CENTER, PULL DOWN, RELEASE  ·  OR PRESS SPACE');
  }else if(action?.type==='aim'){
    const offset={x:x-dragStart.x,y:y-dragStart.y};
    if(Math.hypot(offset.x,offset.y)<12)say('PULL THE SHAPE BACK TO AIM');
    else launch(aimTarget({x,y}),offset);
  }
  activeSource=null;action=null;dragStart=null;
}
function aimTarget(end){
  const center=candidate?.strokes.length?buildNodes(candidate.strokes).center:
    {x:pad.x+pad.w/2,y:pad.y+pad.h/2};
  const dx=dragStart?end.x-dragStart.x:0;
  const dy=dragStart?end.y-dragStart.y:0;
  return {x:constrain(center.x-dx*2.7,32,width-32),
    y:constrain(pad.y-145-max(0,dy)*2.15+min(0,dy)*.8,92,skyBottom-55)};
}
function smoothStroke(points){
  if(points.length<3)return points;
  return points.map((p,i)=>i===0||i===points.length-1?p:
    {x:(points[i-1].x+2*p.x+points[i+1].x)/4,
     y:(points[i-1].y+2*p.y+points[i+1].y)/4});
}
function sampleLine(a,b,spacing=8){
  const count=max(1,ceil(dist(a.x,a.y,b.x,b.y)/spacing)),out=[];
  for(let i=0;i<count;i++)out.push({x:lerp(a.x,b.x,i/count),y:lerp(a.y,b.y,i/count)});
  return out;
}
function buildNodes(strokes){
  const points=[];
  for(const stroke of strokes){
    const smoothed=smoothStroke(stroke);
    if(points.length)points.push(...sampleLine(points.at(-1),smoothed[0]));
    for(let i=0;i<smoothed.length-1;i++)points.push(...sampleLine(smoothed[i],smoothed[i+1]));
    points.push(smoothed.at(-1));
  }
  let hull=convexHull(points);
  if(hull.length<3||polygonArea(hull)<220){
    let a=points[0],b=points.at(-1),longest=0;
    for(const q of points)for(const r of points){
      const d=dist(q.x,q.y,r.x,r.y);
      if(d>longest){longest=d;a=q;b=r;}
    }
    if(longest<5){b={x:a.x+5,y:a.y};longest=5;}
    const nx=-(b.y-a.y)/longest*16,ny=(b.x-a.x)/longest*16;
    hull=[{x:a.x+nx,y:a.y+ny},{x:b.x+nx,y:b.y+ny},
      {x:b.x-nx,y:b.y-ny},{x:a.x-nx,y:a.y-ny}];
  }
  const center={x:hull.reduce((s,p)=>s+p.x,0)/hull.length,
    y:hull.reduce((s,p)=>s+p.y,0)/hull.length};
  // Close and soften an unfinished gesture into a single, still recognizable body.
  hull=hull.map(p=>{const dx=p.x-center.x,dy=p.y-center.y,d=max(1,Math.hypot(dx,dy));
    return {x:dx+dx/d*9,y:dy+dy/d*9};});
  for(let k=0;k<3;k++){
    const next=[];
    for(let i=0;i<hull.length;i++){
      const a=hull[i],b=hull[(i+1)%hull.length];
      next.push({x:a.x*.75+b.x*.25,y:a.y*.75+b.y*.25},
        {x:a.x*.25+b.x*.75,y:a.y*.25+b.y*.75});
    }
    hull=next;
  }
  hull=resampleOutline(hull,40);
  return {center,outline:hull,
    bound:max(...hull.map(p=>Math.hypot(p.x,p.y)))};
}
function resampleOutline(poly,count){
  if(poly.length<3)return poly;
  const lengths=poly.map((p,i)=>Math.hypot(poly[(i+1)%poly.length].x-p.x,
    poly[(i+1)%poly.length].y-p.y));
  const total=lengths.reduce((a,b)=>a+b,0),step=total/count,out=[];
  let edge=0,at=0;
  for(let i=0;i<count;i++){
    const goal=i*step;
    while(edge<poly.length-1&&at+lengths[edge]<goal){at+=lengths[edge++];}
    const t=constrain((goal-at)/max(.00001,lengths[edge]),0,1);
    out.push({x:lerp(poly[edge].x,poly[(edge+1)%poly.length].x,t),
      y:lerp(poly[edge].y,poly[(edge+1)%poly.length].y,t)});
  }
  return out;
}
function convexHull(points){
  const sorted=[...points].sort((a,b)=>a.x-b.x||a.y-b.y);
  if(sorted.length<3)return sorted;
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const lower=[],upper=[];
  for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];
    while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  lower.pop();upper.pop();return lower.concat(upper);
}
function polygonArea(poly){let a=0;
  for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];a+=p.x*q.y-q.x*p.y;}
  return abs(a)*.5;
}
function launch(target,offset={x:0,y:0}){
  if(!candidate||!candidate.strokes.length)return;
  const geometry=buildNodes(candidate.strokes);
  const piece={id:nextPieceId++,outline:geometry.outline,
    bound:geometry.bound,start:{x:geometry.center.x+offset.x,y:geometry.center.y+offset.y},target,
    x:geometry.center.x+offset.x,y:geometry.center.y+offset.y,scale:1,color:candidate.color,
    phase:'flying',progress:0,duration:.64+random(.12,.26),
    vx:0,vy:0,matched:false};
  pieces.push(piece);
  candidate=null;chooseColor();launches++;
  say('FLY  ·  PLACE THE NEXT COLOR BESIDE ITS MATCH');
}
function settle(p){
  p.phase='settled';p.x=p.target.x;p.y=p.target.y;p.scale=.82;
  p.vx=constrain((p.target.x-p.start.x)*.006,-3,3);
  p.vy=constrain((p.target.y-p.start.y)*.003,-2,2);
  resolveContacts(10);
  let touching=false;
  for(const other of pieces){
    if(other===p||other.phase!=='settled'||other.color!==p.color)continue;
    if(boundaryGap(p,other)<18){
      touching=true;combo++;score+=combo;p.matched=true;other.matched=true;
      say('SAME COLOR TOUCHES · +'+combo);break;
    }
  }
  if(!touching)combo=0;
  updateCoverage();
  requestAutoArchive();
}
function updatePieces(dt){
  for(const p of pieces){
    if(p.phase!=='flying')continue;
    p.progress=min(1,p.progress+dt/p.duration);
    const t=p.progress,e=1-pow(1-t,3);
    p.x=lerp(p.start.x,p.target.x,e);
    p.y=lerp(p.start.y,p.target.y,e)-sin(PI*t)*16;
    p.scale=lerp(1,.82,e);
    if(t>=1)settle(p);
  }
}
function worldOutline(p){return p.outline.map(q=>({x:p.x+q.x*p.scale,y:p.y+q.y*p.scale}));}
function polygonContact(a,b){
  if(!a.outline||!b.outline||dist(a.x,a.y,b.x,b.y)>(a.bound*a.scale+b.bound*b.scale+4))return null;
  const aa=worldOutline(a),bb=worldOutline(b);
  let best=Infinity,nx=0,ny=0;
  for(const poly of [aa,bb])for(let i=0;i<poly.length;i++){
    const p=poly[i],q=poly[(i+1)%poly.length],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy);
    if(len<.01)continue;
    const ax=-dy/len,ay=dx/len;
    let a0=Infinity,a1=-Infinity,b0=Infinity,b1=-Infinity;
    for(const v of aa){const n=v.x*ax+v.y*ay;a0=min(a0,n);a1=max(a1,n);}
    for(const v of bb){const n=v.x*ax+v.y*ay;b0=min(b0,n);b1=max(b1,n);}
    const overlap=min(a1,b1)-max(a0,b0);
    if(overlap<=0)return null;
    if(overlap<best){best=overlap;nx=ax;ny=ay;}
  }
  if((b.x-a.x)*nx+(b.y-a.y)*ny<0){nx=-nx;ny=-ny;}
  return {overlap:best,nx,ny};
}
function boundaryGap(a,b){
  if(!a.outline||!b.outline)return Infinity;
  if(dist(a.x,a.y,b.x,b.y)>a.bound*a.scale+b.bound*b.scale+22)return Infinity;
  if(polygonContact(a,b))return 0;
  const aa=worldOutline(a),bb=worldOutline(b);
  let best=Infinity;
  for(const [vertices,edges] of [[aa,bb],[bb,aa]])for(const p of vertices)
    for(let j=0;j<edges.length;j++){
      const u=edges[j],v=edges[(j+1)%edges.length],dx=v.x-u.x,dy=v.y-u.y;
      const t=constrain(((p.x-u.x)*dx+(p.y-u.y)*dy)/max(1,dx*dx+dy*dy),0,1);
      best=min(best,dist(p.x,p.y,u.x+t*dx,u.y+t*dy));
    }
  return best;
}
function keepInside(p){
  const poly=worldOutline(p),minX=min(...poly.map(q=>q.x)),maxX=max(...poly.map(q=>q.x));
  const minY=min(...poly.map(q=>q.y)),maxY=max(...poly.map(q=>q.y));
  const top=skyTop(),bottom=skyBottom-13;
  if(minX<12){p.x+=12-minX;p.vx=max(0,p.vx)*.35;}
  if(maxX>width-12){p.x-=maxX-(width-12);p.vx=min(0,p.vx)*.35;}
  if(minY<top){p.y+=top-minY;p.vy=max(0,p.vy)*.35;}
  if(maxY>bottom){p.y-=maxY-bottom;p.vy=min(0,p.vy)*.35;}
}
function tapShapeAt(x,y){
  for(let i=pieces.length-1;i>=0;i--){
    const p=pieces[i];
    if(p.phase!=='settled'||!insidePoly(x,y,softOutline(p)))continue;
    const dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy);
    const nx=d<12?(p.x<width*.5?.55:-.55):dx/d;
    const ny=d<12?-.85:dy/d;
    p.vx=constrain((p.vx||0)+nx*5.8,-7,7);
    p.vy=constrain((p.vy||0)+ny*5.8-1.1,-7,7);
    say('SHAPE NUDGED · CLICK A SHAPE TO PUSH · SAVE/NEXT TO TURN');
    return true;
  }
  return false;
}
function resolveContacts(iterations=2){
  const settled=pieces.filter(p=>p.phase==='settled'&&p.outline);
  let changed=false;
  for(let step=0;step<iterations;step++){
    let pushed=false;
    for(let i=0;i<settled.length;i++)for(let j=i+1;j<settled.length;j++){
      const a=settled[i],b=settled[j],hit=polygonContact(a,b);
      if(!hit||hit.overlap<.18)continue;
      const move=(hit.overlap+.2)*.52;
      a.x-=hit.nx*move;a.y-=hit.ny*move;
      b.x+=hit.nx*move;b.y+=hit.ny*move;
      if(step===0){const impulse=min(1.6,hit.overlap*.035);
        a.vx-=hit.nx*impulse;a.vy-=hit.ny*impulse;
        b.vx+=hit.nx*impulse;b.vy+=hit.ny*impulse;}
      pushed=true;changed=true;
    }
    for(const p of settled)keepInside(p);
    if(!pushed)break;
  }
  return changed;
}
function stepSettled(dt){
  const settled=pieces.filter(p=>p.phase==='settled');
  if(!settled.length)return;
  const tick=min(2.5,dt*60),drag=pow(.84,tick);
  for(const p of settled){
    p.x+=(p.vx||0)*tick;p.y+=(p.vy||0)*tick;
    p.vx=(p.vx||0)*drag;p.vy=(p.vy||0)*drag;
    if(Math.hypot(p.vx,p.vy)<.035)p.vx=p.vy=0;
    if(p.outline)keepInside(p);
  }
  // Neighboring bodies keep closing the gap even after their flight stops.
  // Colliders then push back, so the bodies pack without passing through.
  for(let i=0;i<settled.length;i++)for(let j=i+1;j<settled.length;j++){
    const a=settled[i],b=settled[j],gap=boundaryGap(a,b);
    if(gap<=.18||gap>=22)continue;
    const d=max(1,dist(a.x,a.y,b.x,b.y));
    const pull=min(3.2,(gap-.18)*.28)*tick;
    const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;
    a.x+=nx*pull*.5;a.y+=ny*pull*.5;
    b.x-=nx*pull*.5;b.y-=ny*pull*.5;
  }
  resolveContacts(3);
}
function drawShapes(graphics){
  for(const p of pieces){
    if(!p.outline)continue;
    const poly=softOutline(p),rgb=INK[p.color];
    if(graphics){
      graphics.fill(...rgb);graphics.stroke(40,46,51);
      graphics.strokeWeight(3.5);graphics.strokeJoin(ROUND);
      drawContour(poly,graphics);
    }else{
      fill(...rgb);stroke(40,46,51);strokeWeight(3.5);strokeJoin(ROUND);
      drawContour(poly);
    }
  }
}
function drawContour(poly,g){
  if(poly.length<3)return;
  if(g)g.beginShape();else beginShape();
  // The sampled contour is already smoothed. Use its actual vertices so
  // the fill and border follow the same closed path without a spline seam.
  for(const p of poly){if(g)g.vertex(p.x,p.y);else vertex(p.x,p.y);}
  if(g)g.endShape(CLOSE);else endShape(CLOSE);
}
function softOutline(p){
  const poly=worldOutline(p);
  if(p.phase!=='settled')return poly;
  for(const other of pieces){
    if(other===p||other.phase!=='settled'||!other.outline)continue;
    const distance=Math.hypot(p.x-other.x,p.y-other.y);
    if(distance>p.bound*p.scale+other.bound*other.scale+22)continue;
    const gap=boundaryGap(p,other);
    if(gap>=20)continue;
    const strength=constrain((20-gap)/13,0,1),nx=(other.x-p.x)/max(1,distance),
      ny=(other.y-p.y)/max(1,distance);
    const support=max(...poly.map(v=>(v.x-p.x)*nx+(v.y-p.y)*ny));
    const otherBack=min(...worldOutline(other).map(v=>(v.x-p.x)*nx+(v.y-p.y)*ny));
    const sharedPlane=(support+otherBack)*.5;
    const width=max(22,min(55,support*.85));
    for(const v of poly){
      const projection=(v.x-p.x)*nx+(v.y-p.y)*ny;
      const near=constrain(1-(support-projection)/width,0,1);
      if(near>0){
        // Both sides aim for the same contact plane. Their front arcs spread
        // into a broad seam, like adjacent chambers in a soap film.
        const displacement=(sharedPlane-projection)*near*.95*strength;
        v.x+=nx*displacement;v.y+=ny*displacement;
      }else if(projection<-support*.28){
        const bulge=4.5*strength*constrain((-projection-support*.28)/max(12,support),0,1);
        v.x-=nx*bulge;v.y-=ny*bulge;
      }
    }
  }
  return poly;
}
function skyTop(){return min(skyBottom-80,width<600?170:106);}
function insidePoly(x,y,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }
  return inside;
}
function updateCoverage(){
  const top=skyTop(),bottom=skyBottom-13,cell=12;
  const shapes=pieces.filter(p=>p.phase==='settled'&&p.outline).map(p=>{
    const poly=worldOutline(p);
    return {poly,minX:min(...poly.map(q=>q.x)),maxX:max(...poly.map(q=>q.x)),
      minY:min(...poly.map(q=>q.y)),maxY:max(...poly.map(q=>q.y))};
  });
  let filled=0,inked=0,total=0;
  for(let y=top+cell*.5;y<bottom;y+=cell)for(let x=12+cell*.5;x<width-12;x+=cell){
    total++;
    if(shapes.some(s=>x>=s.minX&&x<=s.maxX&&y>=s.minY&&y<=s.maxY&&
      insidePoly(x,y,s.poly))){inked++;filled++;continue;}
    // White slivers narrower than a drawable piece have no usable space.
    if(shapes.some(s=>nearOutline(x,y,s,FILL_GAP_RADIUS)))filled++;
  }
  inkCoverage=total?inked/total:0;
  coverage=total?filled/total:0;
}
function nearOutline(x,y,shape,radius){
  if(x<shape.minX-radius||x>shape.maxX+radius||
    y<shape.minY-radius||y>shape.maxY+radius)return false;
  const poly=shape.poly,limit=radius*radius;
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y;
    const t=constrain(((x-a.x)*dx+(y-a.y)*dy)/max(.0001,dx*dx+dy*dy),0,1);
    if((x-a.x-t*dx)**2+(y-a.y-t*dy)**2<=limit)return true;
  }
  return false;
}
function drawHandCursor(){
  const {x,y}=handCursor;noFill();stroke(37,45,50,210);strokeWeight(1.5);
  circle(x,y,handPressed?18:27);
  if(handPressed){noStroke();fill(45,52,56);circle(x,y,4);}
}
function pointFromEvent(e){const r=e.currentTarget.getBoundingClientRect();
  return {x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height};}
function pointerDown(e){e.preventDefault();if(pointerId!==null)return;
  pointerId=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);
  const p=pointFromEvent(e);beginAt(p.x,p.y,'pointer');}
function pointerMove(e){const p=pointFromEvent(e);hover=p;
  if(pointerId===e.pointerId)moveAt(p.x,p.y,'pointer');}
function pointerUp(e){if(pointerId!==e.pointerId)return;
  const p=pointFromEvent(e);endAt(p.x,p.y,'pointer');pointerId=null;}
function keyboard(e){
  if(e.metaKey||e.ctrlKey||e.altKey||e.isComposing)return;
  if(galleryIndex>=0){
    if(['Escape','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
    if(e.key==='Escape')galleryIndex=-1;
    if(e.key==='ArrowLeft')selectGalleryFace(galleryIndex-1);
    if(e.key==='ArrowRight')selectGalleryFace(galleryIndex+1);
    return;
  }
  if(transition)return;
  if(e.key===' '){e.preventDefault();if(candidate)launch(aimTarget({x:pad.x+pad.w/2,y:pad.y-140}));}
  if(e.key.toLowerCase()==='h')toggleCamera();
  if(e.key.toLowerCase()==='s')sealCurrentStage();
  if(e.key.toLowerCase()==='g'&&archives.length)openGallery(archives.length-1);
  if(e.key==='Escape'){candidate=null;action=null;activeSource=null;say('DRAW A NEW FORM');}
}
function clearAll(){pieces=[];candidate=null;score=0;combo=0;launches=0;
  coverage=0;inkCoverage=0;pendingArchive=false;manualArchive=false;autoArchiveAt=null;
  updateCoverage();
  say('FIELD CLEARED · DRAW A NEW FORM');}
function withTimeout(promise,ms,label){let timer;
  return Promise.race([Promise.resolve(promise),new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error(label)),ms))]).finally(()=>clearTimeout(timer));}
function loadHandLibrary(){
  if(typeof ml5!=='undefined'&&typeof ml5.handPose==='function')return Promise.resolve();
  if(!ml5Loading)ml5Loading=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://unpkg.com/ml5@1.3.1/dist/ml5.min.js';
    script.onload=()=>typeof ml5!=='undefined'&&typeof ml5.handPose==='function'?
      resolve():reject(new Error('HAND LIBRARY DID NOT INITIALIZE'));
    script.onerror=()=>reject(new Error('HAND LIBRARY FILE DID NOT LOAD'));
    document.head.appendChild(script);
  }).catch(err=>{ml5Loading=null;throw err;});
  return ml5Loading;
}
function stopCamera(){
  cameraToken++;
  if(activeSource==='hand')endAt(lastHand.x,lastHand.y,'hand');
  try{tracker?.detectStop();}catch(e){console.warn(e);}
  tracker=null;
  camera?.elt?.srcObject?.getTracks().forEach(t=>t.stop());
  camera?.remove();camera=null;
  hands=[];handCursor=null;handPressed=false;fistFrames=0;openFrames=0;lostHand=0;
  curledFingers=0;handFrame=0;processedHandFrame=-1;handSeenAt=0;
  cameraState='off';say('HAND INPUT OFF');
}
async function toggleCamera(){
  if(cameraState==='on'||cameraState==='loading'){stopCamera();return;}
  const token=++cameraToken;cameraState='loading';cameraError='';
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('USE LOCALHOST OR HTTPS');
    await withTimeout(loadHandLibrary(),60000,'HAND LIBRARY TIMED OUT');
    if(token!==cameraToken)return;
    // ml5's official HandPose path expects the p5.MediaElement returned here.
    camera=createCapture(VIDEO,{flipped:true});camera.size(640,480);camera.hide();
    await withTimeout(new Promise((resolve,reject)=>{
      if(camera.elt.readyState>=2&&camera.elt.videoWidth){resolve();return;}
      camera.elt.addEventListener('loadeddata',resolve,{once:true});
      camera.elt.addEventListener('error',()=>reject(new Error('VIDEO DID NOT START')),{once:true});
    }),18000,'VIDEO DID NOT START');
    if(token!==cameraToken)return;
    tracker=await withTimeout(Promise.resolve(ml5.handPose({flipped:true})),60000,'HAND MODEL TIMED OUT');
    if(tracker?.ready)await withTimeout(tracker.ready,60000,'HAND MODEL TIMED OUT');
    if(token!==cameraToken)return;
    tracker.detectStart(camera,result=>{
      if(token===cameraToken){hands=result||[];handFrame++;}
    });
    cameraState='on';say('SHOW YOUR HAND · CLOSE YOUR FIST TO DRAW');
  }catch(err){
    if(token!==cameraToken)return;
    console.error('THE SKY HAS SIDES hand:',err);
    cameraError=(err?.name==='NotAllowedError'?'CAMERA PERMISSION DENIED':
      err?.name==='NotFoundError'?'CAMERA NOT FOUND':String(err?.message||err)).toUpperCase().slice(0,70);
    try{tracker?.detectStop();}catch(e){}
    tracker=null;camera?.elt?.srcObject?.getTracks().forEach(t=>t.stop());
    camera?.remove();camera=null;hands=[];cameraState='error';
  }
}
function handPoint(hand,name,index){return hand[name]||hand.keypoints?.[index];}
function handPalm(hand){
  const bases=[5,9,13,17].map((i,j)=>handPoint(hand,
    ['index_finger_mcp','middle_finger_mcp','ring_finger_mcp','pinky_mcp'][j],i))
    .filter(p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y));
  if(bases.length<3)return null;
  const wrist=handPoint(hand,'wrist',0);
  const x=bases.reduce((sum,p)=>sum+p.x,0)/bases.length;
  const y=bases.reduce((sum,p)=>sum+p.y,0)/bases.length;
  return wrist&&Number.isFinite(wrist.x)&&Number.isFinite(wrist.y)?
    {x:x*.82+wrist.x*.18,y:y*.82+wrist.y*.18}:{x,y};
}
function countCurledFingers(hand){
  let curled=0,available=0;
  for(const [name,mcp,pip,tip] of [
    ['index_finger',5,6,8],['middle_finger',9,10,12],
    ['ring_finger',13,14,16],['pinky',17,18,20]]){
    const base=handPoint(hand,name+'_mcp',mcp);
    const joint=handPoint(hand,name+'_pip',pip);
    const end=handPoint(hand,name+'_tip',tip);
    if(!base||!joint||!end)continue;
    available++;
    const segment=Math.hypot(joint.x-base.x,joint.y-base.y);
    const reach=Math.hypot(end.x-base.x,end.y-base.y);
    if(reach<max(10,segment*1.55))curled++;
  }
  return available>=3?curled:-1;
}
function releaseHand(){
  if(handPressed)endAt(lastHand.x,lastHand.y,'hand');
  handPressed=false;fistFrames=0;openFrames=0;
}
function updateHand(){
  if(cameraState!=='on'||!camera){handCursor=null;return;}
  if(handFrame===processedHandFrame){
    if(handPressed&&millis()-handSeenAt>1200)releaseHand();
    return;
  }
  processedHandFrame=handFrame;
  const h=hands[0],palm=h&&handPalm(h);
  if(!palm){
    handCursor=null;lostHand++;
    if(lostHand>=4)releaseHand();
    return;
  }
  const wasLost=lostHand>0;lostHand=0;handSeenAt=millis();
  const vw=camera.elt.videoWidth||640,vh=camera.elt.videoHeight||480;
  let left=pad.x+14,right=pad.x+pad.w-14;
  let top=pad.y+16,bottom=pad.y+pad.h-16;
  if(candidate?.strokes.length){
    const grip=buildNodes(candidate.strokes).center;
    left=min(left,grip.x-25);right=max(right,grip.x+25);
    top=min(top,grip.y-25);bottom=max(bottom,grip.y+25);
  }
  const rawX=left+constrain(palm.x/vw,0,1)*(right-left);
  const rawY=top+constrain(palm.y/vh,0,1)*(bottom-top);
  const x=lastHand.x&&!wasLost?lerp(lastHand.x,rawX,.58):rawX;
  const y=lastHand.y&&!wasLost?lerp(lastHand.y,rawY,.58):rawY;
  handCursor={x,y};lastHand={x,y};
  const curled=countCurledFingers(h);
  if(curled<0)return;
  curledFingers=curled;
  fistFrames=curled>=3?min(3,fistFrames+1):0;
  openFrames=curled<=1?min(3,openFrames+1):0;
  if(!handPressed&&fistFrames>=2&&(!activeSource||activeSource==='hand')){
    beginAt(x,y,'hand');handPressed=true;
  }
  if(handPressed&&openFrames>=2){releaseHand();return;}
  if(handPressed)moveAt(x,y,'hand');
}

// A face is archived when even the remaining gaps cannot fit another form.
// SAVE/NEXT is available whenever the artist wants to finish the composition.
function requestAutoArchive(){
  if(coverage<AUTO_SEAL_COVERAGE||pendingArchive)return;
  pendingArchive=true;autoArchiveAt=millis();
}
function sealCurrentStage(){
  if(transition)return;
  pendingArchive=true;manualArchive=true;
  if(candidate?.strokes.length){
    launch(aimTarget({x:pad.x+pad.w/2,y:pad.y-140}));
    say('SAVING AFTER THIS SHAPE LANDS');return;
  }
  candidate=null;
  if(pieces.some(p=>p.phase==='flying')){
    say('SAVING AFTER THIS SHAPE LANDS');return;
  }
  // A manual turn is immediate even if nearby pieces are still nudging.
  pendingArchive=false;manualArchive=false;autoArchiveAt=null;
  archiveStage();
}
function fileStamp(date){
  const two=n=>String(n).padStart(2,'0');
  const offset=-date.getTimezoneOffset(),sign=offset<0?'-':'+';
  return `${date.getFullYear()}-${two(date.getMonth()+1)}-${two(date.getDate())}_`+
    `${two(date.getHours())}-${two(date.getMinutes())}-${two(date.getSeconds())}`+
    `${sign}${two(floor(abs(offset)/60))}${two(abs(offset)%60)}`;
}
function archiveStage(){
  if(transition)return false;
  const ended=new Date(),name=`The_Sky_Has_Sides_${fileStamp(stageStart)}_to_${fileStamp(ended)}.png`;
  let snapshot,old,dataUrl;
  try{
    snapshot=createGraphics(width,ceil(skyBottom));
    snapshot.pixelDensity(1);snapshot.background(249,249,247);
    drawShapes(snapshot);
    dataUrl=(snapshot.canvas||snapshot.elt).toDataURL('image/png');
    old=createGraphics(width,height);
    old.pixelDensity(1);old.background(249,249,247);
    old.image(snapshot,0,0);
    old.noFill();old.stroke(42,49,54,145);old.strokeWeight(1);
    old.rect(pad.x,pad.y,pad.w,pad.h,3);
  }catch(err){
    console.error('Archive image:',err);old?.remove();
    say('IMAGE COULD NOT BE SAVED · TRY SEAL AGAIN');return false;
  }finally{snapshot?.remove();}
  const id=ended.getTime()+'-'+Math.random().toString(36).slice(2,8);
  const record={id,start:stageStart.toISOString(),end:ended.toISOString(),name,
    coverage:coverage,dataUrl};
  hydrateArchive(record);archives.push(record);
  archives.sort((a,b)=>a.end.localeCompare(b.end));
  transition={old,started:millis(),duration:1750};
  pieces=[];candidate=null;score=0;combo=0;launches=0;
  pendingArchive=false;manualArchive=false;autoArchiveAt=null;
  updateCoverage();chooseColor();
  stageNumber=archives.length+1;
  return true;
}
function drawTransition(){
  const t=constrain((millis()-transition.started)/transition.duration,0,1);
  const ease=t*t*(3-2*t),split=width*(1-ease);
  image(transition.old,split-width,0,width,height);
  noStroke();fill(249,249,247);rect(split,0,width-split,height);
  stroke(184,190,192,130*(1-t));strokeWeight(1);line(split,0,split,height);
  noStroke();fill(87,96,100,175*sin(PI*t));textAlign(CENTER,CENTER);textSize(11);
  text('A NEW FACE',split+(width-split)/2,height*.44);
  if(t>=1){transition.old.remove();transition=null;stageStart=new Date();
    say('NEW WHITE SPACE · THE PREVIOUS FACE IS IN THE ARCHIVE');}
}
function hydrateArchive(record){
  const picture=new Image();picture.src=record.dataUrl;record.picture=picture;
}
function clearPreviousArchive(){
  archives=[];stageNumber=1;galleryIndex=-1;
  // Older versions kept faces between visits. Remove that cache once at startup.
  try{window.indexedDB?.deleteDatabase('the-sky-has-sides-archive');}
  catch(err){console.warn('Previous archive cache could not be cleared:',err);}
}
function archiveShelfBounds(){return {x:width-91,y:17,w:73,h:44};}
function shelfTileAt(x,y){
  const b=archiveShelfBounds();
  return archives.length&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h?
    {index:frontArchiveIndex(archives.length,millis()*.0004)}:null;
}
function drawArchiveShelf(){
  const b=archiveShelfBounds();
  noStroke();fill(126,137,142);textAlign(RIGHT,TOP);textSize(9);
  text('ARCHIVE  '+String(archives.length).padStart(2,'0'),width-18,8);
  if(!archives.length){
    noFill();stroke(163,172,175,120);strokeWeight(1);
    drawingContext.setLineDash([3,4]);rect(width-62,25,43,30,3);drawingContext.setLineDash([]);
    return;
  }
  drawArchiveObject(b.x+b.w*.5,b.y+b.h*.5,b.w*.75,b.h*.82,
    archives.length===1?.08:millis()*.0004);
}
function frontArchiveIndex(n,yaw){
  if(n<=1)return 0;
  let best=-Infinity,index=0;
  for(let i=0;i<n;i++){
    const facing=cos(yaw+TWO_PI*i/n);
    if(facing>best){best=facing;index=i;}
  }
  return index;
}
function projectFacePoint(x,y,z,cx,cy,focal){
  const s=focal/(focal-z);
  return {x:cx+x*s,y:cy+y*s,z};
}
function drawArchiveObject(cx,cy,w,h,yaw,selected=-1){
  const n=archives.length;if(!n)return [];
  const focal=max(350,w*2.1),faces=[];
  if(n<=2){
    const half=w*.42,depth=n===1?0:max(8,w*.075);
    for(let i=0;i<n;i++){
      const a=yaw+PI*i,localZ=depth*.5;
      const corners=[[-half,-h*.48],[half,-h*.48],[half,h*.48],[-half,h*.48]];
      const quad=corners.map(([x,y])=>projectFacePoint(
        x*cos(a)+localZ*sin(a),y,localZ*cos(a)-x*sin(a),cx,cy,focal));
      faces.push({index:i,quad,depth:localZ*cos(a),facing:cos(a)});
    }
  }else{
    const radius=w*.47,step=TWO_PI/n;
    for(let i=0;i<n;i++){
      const a=yaw+step*i,left=a-step*.5,right=a+step*.5;
      const l={x:radius*sin(left),z:radius*cos(left)};
      const r={x:radius*sin(right),z:radius*cos(right)};
      const quad=[projectFacePoint(l.x,-h*.48,l.z,cx,cy,focal),
        projectFacePoint(r.x,-h*.48,r.z,cx,cy,focal),
        projectFacePoint(r.x,h*.48,r.z,cx,cy,focal),
        projectFacePoint(l.x,h*.48,l.z,cx,cy,focal)];
      faces.push({index:i,quad,depth:(l.z+r.z)*.5,facing:cos(a)});
    }
  }
  const visible=faces.filter(f=>f.facing>.02).sort((a,b)=>a.depth-b.depth);
  const ctx=drawingContext;
  for(const face of visible){
    const img=archives[face.index].picture,q=face.quad;
    ctx.save();ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);
    for(let j=1;j<4;j++)ctx.lineTo(q[j].x,q[j].y);
    ctx.closePath();ctx.fillStyle='#f2f3f0';ctx.fill();ctx.restore();
    if(img?.complete&&img.naturalWidth)drawTexturedQuad(img,q);
    ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);
    for(let j=1;j<4;j++)ctx.lineTo(q[j].x,q[j].y);
    ctx.closePath();ctx.strokeStyle=face.index===selected?'#202a2f':'#535f64';
    ctx.lineWidth=face.index===selected?2.5:1.3;ctx.stroke();
  }
  return visible.sort((a,b)=>b.depth-a.depth);
}
function drawTexturedQuad(img,q){
  const iw=img.naturalWidth,ih=img.naturalHeight;
  textureTriangle(img,[q[0],q[1],q[2]],[[0,0],[iw,0],[iw,ih]]);
  textureTriangle(img,[q[0],q[2],q[3]],[[0,0],[iw,ih],[0,ih]]);
}
function textureTriangle(img,dest,source){
  const [[u0,v0],[u1,v1],[u2,v2]]=source;
  const [p0,p1,p2]=dest,du1=u1-u0,dv1=v1-v0,du2=u2-u0,dv2=v2-v0;
  const det=du1*dv2-du2*dv1;if(abs(det)<.001)return;
  const a=((p1.x-p0.x)*dv2-(p2.x-p0.x)*dv1)/det;
  const b=((p1.y-p0.y)*dv2-(p2.y-p0.y)*dv1)/det;
  const c=((p2.x-p0.x)*du1-(p1.x-p0.x)*du2)/det;
  const d=((p2.y-p0.y)*du1-(p1.y-p0.y)*du2)/det;
  const e=p0.x-a*u0-c*v0,f=p0.y-b*u0-d*v0,ctx=drawingContext;
  ctx.save();ctx.beginPath();ctx.moveTo(p0.x,p0.y);
  ctx.lineTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.closePath();ctx.clip();
  ctx.setTransform(a,b,c,d,e,f);ctx.drawImage(img,0,0);ctx.restore();
}
function selectGalleryFace(index){
  if(!archives.length)return;
  galleryIndex=(index+archives.length)%archives.length;
  archiveYaw=-TWO_PI*galleryIndex/archives.length+
    (archives.length>=3?PI/archives.length*.8:archives.length===2?.1:0);
}
function openGallery(index){selectGalleryFace(index);}
function galleryLayout(){
  const wide=width>780;
  return wide?
    {object:{cx:width*.34,cy:height*.45,w:min(width*.53,550),h:min(height*.56,400)},
      image:{x:width*.64,y:height*.25,w:width*.30,h:height*.44}}:
    {object:{cx:width*.5,cy:height*.33,w:width*.75,h:height*.39},
      image:{x:width*.13,y:height*.56,w:width*.74,h:height*.21}};
}
function drawGallery(){
  if(galleryIndex<0||!archives.length)return;
  const item=archives[galleryIndex],layout=galleryLayout(),box=layout.image;
  noStroke();fill(249,249,247,247);rect(0,0,width,height);
  fill(39,49,53);textAlign(LEFT,TOP);textSize(width<600?15:20);
  text('THE SKY HAS SIDES  /  ARCHIVE',20,20);
  fill(117,128,132);textSize(10);
  text(String(archives.length)+' FACES  ·  DRAG TO TURN  ·  CLICK A FACE',21,49);
  const o=layout.object;
  archiveFaces=drawArchiveObject(o.cx,o.cy,o.w,o.h,archiveYaw,galleryIndex);
  noStroke();fill(66,77,83);textAlign(CENTER,TOP);textSize(10);
  text('FACE '+String(galleryIndex+1).padStart(2,'0')+' / '+String(archives.length).padStart(2,'0'),
    box.x+box.w*.5,box.y-23);
  if(item.picture?.complete&&item.picture.naturalWidth){
    const ratio=item.picture.naturalWidth/item.picture.naturalHeight;
    const iw=min(box.w,box.h*ratio),ih=iw/ratio;
    drawingContext.drawImage(item.picture,box.x+(box.w-iw)/2,box.y+(box.h-ih)/2,iw,ih);
  }
  noFill();stroke(118,128,132,140);strokeWeight(1);rect(box.x,box.y,box.w,box.h);
  noStroke();fill(57,68,72);textAlign(CENTER,TOP);textSize(10);
  text(new Date(item.start).toLocaleString()+'  →  '+new Date(item.end).toLocaleString(),
    box.x+box.w*.5,box.y+box.h+12,min(box.w,width-30));
  fill(126,135,139);textSize(9);
  text(item.name,box.x+box.w*.5,box.y+box.h+30,min(box.w,width-25));
  const controls=galleryControls();
  for(const q of controls){
    noFill();stroke(103,114,119,125);strokeWeight(1);rect(q.x,q.y,q.w,q.h,5);
    noStroke();fill(55,65,70);textAlign(CENTER,CENTER);textSize(10);
    text(q.label,q.x+q.w/2,q.y+q.h/2);
  }
}
function galleryControls(){
  const y=height-67,bw=min(130,(width-68)/3);
  return [
    {id:'prev',label:'← PREV',x:18,y,w:bw,h:31},
    {id:'download',label:'DOWNLOAD PNG',x:(width-bw)/2,y,w:bw,h:31},
    {id:'next',label:'NEXT →',x:width-bw-18,y,w:bw,h:31},
    {id:'close',label:'×',x:width-49,y:17,w:31,h:31}
  ];
}
function galleryClick(x,y){
  const b=galleryControls().find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h);
  if(!b)return false;
  if(b.id==='close')galleryIndex=-1;
  if(b.id==='prev')selectGalleryFace(galleryIndex-1);
  if(b.id==='next')selectGalleryFace(galleryIndex+1);
  if(b.id==='download')downloadArchive(archives[galleryIndex]);
  return true;
}
function galleryBegin(x,y,source){
  activeSource=source;
  if(galleryClick(x,y)){action={type:'button'};return;}
  action={type:'gallery'};
  archiveDrag={startX:x,startY:y,lastX:x,moved:false};
}
function galleryMove(x,y){
  if(!archiveDrag)return;
  if(abs(x-archiveDrag.startX)>5)archiveDrag.moved=true;
  archiveYaw+=(x-archiveDrag.lastX)*.011;
  archiveDrag.lastX=x;
}
function galleryEnd(x,y){
  if(!archiveDrag)return;
  if(archiveDrag.moved)galleryIndex=frontArchiveIndex(archives.length,archiveYaw);
  else{
    const hit=archiveFaces.find(face=>insidePoly(x,y,face.quad));
    if(hit)galleryIndex=hit.index;
  }
  archiveDrag=null;
}
function downloadArchive(record){
  const a=document.createElement('a');
  a.href=record.dataUrl;a.download=record.name;
  document.body.appendChild(a);a.click();a.remove();
}
