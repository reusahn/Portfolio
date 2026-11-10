// Child of the Pacific 2023-2026 The dates in my photo library drive the rings and the figure.

const DAY_MS = 86400000; // ms in one day
const TURN = 2 * Math.PI; // one turn in radians
const INDEX_ANGLE = -Math.PI / 2; // top of the ring
const STEP_MS = 1050; // ms per step at 1x
const PORTRAIT_SCALE = 1.7; // figure size multiplier
// Four steps from curled to extended.
const POSES = [
  { amount: 0, name: "Curled" },
  { amount: .25, name: "Unfurling" },
  { amount: .56, name: "Opening" },
  { amount: 1, name: "Extended" }
];
const SEASONS = ["spring", "summer", "autumn", "winter"]; // outfit image keys
const UNITS = ["Year", "Month", "Week", "Day"]; // playback time units
// The menu starts at Year. On the canvas, Day is closest to the figure.
const RING_ORDER = [...UNITS].reverse(); // inner to outer
const DATE = new Intl.DateTimeFormat("en-US", {dateStyle:"medium", timeZone:"UTC"}); // full date label
const MONTH = new Intl.DateTimeFormat("en-US", {month:"long", year:"numeric", timeZone:"UTC"}); // month and year
const SHORT_MONTH = new Intl.DateTimeFormat("en-US", {month:"short", timeZone:"UTC"}); // short month label
const SHORT_DAY = new Intl.DateTimeFormat("en-US", {month:"short", day:"numeric", timeZone:"UTC"}); // short day label
const NUMBER = new Intl.NumberFormat("en-US"); // counts with commas

// Joint turns from the curled pose, in radians.
const OPEN_ANGLES = {
  torso:-.19, head:-.29, upperArm:-.96, forearm:1.56, hand:-.09,
  rearUpperArm:-.37, rearForearm:-1.10,
  thigh:.69, shin:-2.10, foot:.16, farThigh:.65, farShin:-2.03, farFoot:.10
};
const ui = {}; // page controls
// Current sketch state.
const scene = {
  dataset: null, // loaded photo data
  timelines: {}, // periods by time unit
  frames: [], // active period list
  frame: null, // current period
  index: 0, // current period index
  focus: null, // date shared by rings
  unit: "Month", // active time unit
  selected: null, // pinned place ID
  dials: [0,0,0,0], // ring rotation angles
  drag: null, // current pointer drag
  open: 0, // body opening amount
  eye: 0, // eye blend value
  angle: 0, // figure rotation
  season: "spring", // current outfit season
  layerImages: {}, // separate body images
  sources: {}, // whole curled drawings
  stage: null, // cached place rim
  overlay: null, // moving canvas layer
  targets: [], // place bearing list
  ready: false, // art loaded flag
  playing: true, // autoplay on or off
  speed: 1, // playback multiplier
  elapsed: 0 // ms toward next step
};
const clamp = (n,a,b) => Math.max(a,Math.min(b,n)); // keep within bounds
const ease_curve = t => t*t*(3-2*t); // smooth the blend
// Going past either end of a ring brings us back around.
const wrap_index = (n,length) => ((n%length)+length)%length; // wrap into range
const wrap_degrees = d => wrap_index(d+180,360)-180; // wrap longitude degrees
// Take the short way around so a turn across zero stays smooth.
const angle_delta = (target,current) => Math.atan2(Math.sin(target-current),Math.cos(target-current)); // shortest signed turn

// Build the controls before measuring the space for the canvas.
function setup() {
  pixelDensity(Math.min(2,window.devicePixelRatio||1));
  build_interface();
  const w=canvas_width(); // measured view width
  const canvas=createCanvas(w,canvas_height(w)); // main p5 canvas
  canvas.parent(ui.view);
  apply_style(canvas, {display:"block", "touch-action":"none"});
  canvas.attribute("tabindex","0");
  canvas.attribute("aria-label","Four circular time dials. Click or drag a dial, or use the arrow keys to step.");
  ui.canvas=canvas;
  frameRate(40);
  load_dataset(PACKED_GALLERY);
  resize_buffers();
  // The controls are ready first. Playback waits for the drawings.
  load_artwork().then(()=>{
    scene.ready=true;
    describe_frame();
  }).catch(error=>ui.status.html("Artwork could not load. "+error.message));
}

function canvas_width() { return Math.max(260,ui.view.elt.clientWidth); }
function canvas_height(w) { return w<560 ? Math.max(340,Math.round(w*.99)) : Math.round(clamp(w*.60,425,636)); }

// The place marks sit on one layer. The rings and body move on another.
function resize_buffers() {
  if(scene.stage)scene.stage.remove();
  if(scene.overlay)scene.overlay.remove();
  scene.stage=createGraphics(width,height);
  scene.overlay=createGraphics(width,height);
  scene.stage.pixelDensity(1);
  scene.overlay.pixelDensity(1);
  build_stage();
}

function window_resized() {
  const w=canvas_width(); // new view width
  resizeCanvas(w,canvas_height(w),true);
  resize_buffers();
}

// Keep the page styles here with the p5 controls.
function apply_style(element, declarations) {
  for(const [property,value] of Object.entries(declarations)) element.style(property,value); // CSS name and value
  return element;
}

function control_row(parent, centered=false) {
  return apply_style(createDiv().parent(parent), {
    display:"flex", "align-items":"center", "flex-wrap":"wrap",
    gap:"8px", "justify-content":centered?"center":"flex-start",
    "margin-top":centered?"0":"7px"
  });
}

function style_control(element) {
  return apply_style(element, {
    padding:"5px 9px", border:"1px solid #dce0dc", "border-radius":"4px",
    background:"#fff", color:"#252827", font:"inherit"
  });
}

function build_interface() {
  // Add ?controls=1 to open the CSV picker and joint view.
  const showControls=new URLSearchParams(window.location.search).get("controls")==="1"; // extra controls flag
  apply_style(select("body"), {
    margin:"0", padding:"0", background:"#fff", color:"#252827",
    "color-scheme":"light", font:"14px/1.45 system-ui, sans-serif"
  });
  // page wrapper
  const root=apply_style(createDiv().id("pacific"), {
    "max-width":"1040px", margin:"0 auto", padding:"clamp(12px,2.4vw,24px) clamp(10px,2vw,20px)",
    "box-sizing":"border-box"
  });
  apply_style(createElement("h1","Child of the Pacific").parent(root), {
    margin:"0", "text-align":"center", "letter-spacing":"-.012em",
    font:"normal clamp(16px,2.2vw,21px)/1.2 Georgia, serif"
  });
  ui.view=apply_style(createDiv().id("view").parent(root), {width:"100%"}); // canvas container

  const bar=control_row(root,true); // playback control row
  ui.play=style_control(createButton("Pause").parent(bar)); // play or pause button
  ui.play.style("cursor","pointer");
  ui.play.mouseClicked(()=>{
    // Play returns to following the dates after a place is picked.
    if(!showControls&&!scene.playing&&scene.selected!==null)pin(null);
    set_playing(!scene.playing);
  });
  ui.unit=style_control(createSelect().parent(bar)); // time unit menu
  for(const unit of UNITS)ui.unit.option(unit); // one menu option
  ui.unit.selected(scene.unit);
  ui.unit.attribute("aria-label","Playback time unit");
  ui.unit.changed(()=>set_unit(ui.unit.value()));
  ui.speed=style_control(createSelect().parent(bar)); // speed menu
  for(const speed of [.5,1,2,4])ui.speed.option(speed+"×",String(speed)); // one speed option
  ui.speed.selected("1");
  ui.speed.attribute("aria-label","Playback speed");
  ui.speed.changed(()=>{scene.speed=Number(ui.speed.value());});
  // current period label
  ui.period=apply_style(createDiv("").id("period").parent(root), {
    "text-align":"center", margin:"7px 0 0", font:"20px/1.3 Georgia, serif"
  });
  // target and pose text
  ui.status=apply_style(createDiv("Loading the portrait…").id("status").parent(root), {
    "text-align":"center", "min-height":"1.5em", margin:"4px 0 0", color:"#626a67",
    "font-size":"12px", "font-variant-numeric":"tabular-nums", "overflow-wrap":"anywhere"
  });

  // collapsible controls panel
  const details=apply_style(createElement("details").parent(root), {
    width:"fit-content", "max-width":"100%", margin:"9px auto 0", color:"#626a67", "font-size":"12px"
  });
  if(!showControls)details.hide();
  apply_style(createElement("summary","Coordinates and controls").parent(details), {
    cursor:"pointer", "text-align":"center"
  });
  const row=control_row(details); // extra control row
  ui.time=apply_style(createSlider(0,1,0,1).parent(row), {width:"135px", "accent-color":"#776453"}); // period slider
  ui.time.attribute("aria-label","Timeline position");
  ui.time.input(()=>{
    set_playing(false);
    select_frame(Number(ui.time.value()));
  });
  ui.place=style_control(createInput("","number").parent(row)); // place number input
  ui.place.style("width","78px");
  ui.place.attribute("min","1");
  ui.place.attribute("placeholder","Place #");
  ui.place.attribute("aria-label","Place number");
  ui.place.changed(()=>{
    const value=ui.place.value(); // typed place number
    const id=Number(value)-1; // zero-based place ID
    if(value==="")pin(null);
    else if(Number.isInteger(id)&&id>=0&&id<scene.dataset.points.length)pin(id);
  });
  const auto=style_control(createButton("Auto target").parent(row)); // auto target button
  auto.style("cursor","pointer");
  auto.mouseClicked(()=>pin(null));
  ui.joints=createCheckbox("Show joints",false).parent(row); // joint display toggle
  const sourceRow=control_row(details); // CSV picker row
  createSpan("Original GPS CSV").parent(sourceRow);
  createFileInput(open_csv).parent(sourceRow);
  set_playing(true);
}

function set_playing(playing) {
  scene.playing=playing;
  ui.play.html(playing?"Pause":"Play");
  ui.play.attribute("aria-pressed",String(playing));
  ui.play.style("background",playing?"#f8f0ea":"#fff");
  ui.play.style("color",playing?"#80503c":"#252827");
}

// Load the curled drawings and the pieces used when the body opens.
function load_artwork(){
  // art files to load
  const specs=[
    ...SEASONS.map(season=>({key:season,path:`art/${season}.png`,size:[1536,1024]})),
    ...RIG.layers.map(layer=>({...layer,key:layer.path,path:`rig_layers/${layer.path}`}))
  ];
  return Promise.all(specs.map(spec=>new Promise((resolve,reject)=>{
    // save the loaded image
    const assign=img=>{
      if(spec.kind) scene.layerImages[spec.key]=img;
      else scene.sources[spec.key]=img;
      resolve();
    };
    const failed=()=>reject(new Error(spec.path)); // report a missing image
    if(window.location.protocol!=="file:"){
      loadImage(spec.path,assign,failed);
      return;
    }
    // For a local folder, load the PNG in a hidden element and copy it.
    const element=createImg(spec.path,"",loaded=>{
      loaded.width=spec.size[0];
      loaded.height=spec.size[1];
      const buffer=createGraphics(...spec.size); // offscreen image copy
      buffer.pixelDensity(1);
      buffer.image(loaded,0,0,...spec.size);
      loaded.remove();
      assign(buffer);
    });
    element.hide();
    element.elt.addEventListener("error",failed,{once:true});
  })));
}

// Keep the dates in UTC so the browser time zone cannot shift a record.
// A week starts on Monday. The end date belongs to the next window.
function date_window(stamp,unit){
  const date=new Date(stamp),year=date.getUTCFullYear(),month=date.getUTCMonth(); // UTC date, year, month index
  if(unit==="Year") return [Date.UTC(year,0,1),Date.UTC(year+1,0,1)];
  if(unit==="Month") return [Date.UTC(year,month,1),Date.UTC(year,month+1,1)];
  if(unit==="Week"){
    const begin=stamp-((date.getUTCDay()+6)%7)*DAY_MS; // Monday at midnight
    return [begin,begin+7*DAY_MS];
  }
  return [stamp,stamp+DAY_MS];
}

// Make all the time windows first, including the empty ones.
function windows_for(dataset,unit){
  const first=Date.parse(dataset.first),last=Date.parse(dataset.last); // first and last timestamps
  const frames=[],byDay=[]; // period list and day lookup
  for(let stamp=first;stamp<=last;stamp+=DAY_MS){ // day being grouped
    const [begin,end]=date_window(stamp,unit); // start and end timestamps
    let frame=frames.at(-1); // most recent period
    if(!frame||frame.begin!==begin){
      frame={begin,end,focus:clamp((begin+end)/2,first,last),places:new Map(),total:0,missing:0,leader:null};
      frames.push(frame);
    }
    // A row can find its window right away using its day number.
    byDay.push(frame);
  }
  // Count records and days per place. A missing GPS record has id -1.
  for(const [day,id,count] of dataset.rows){ // day offset, place ID, count
    const frame=byDay[day]; // period for this day
    if(id<0){frame.missing+=count;continue;}
    frame.total+=count;
    if(!frame.places.has(id))frame.places.set(id,{count:0,days:0});
    const place=frame.places.get(id); // totals for this place
    place.count+=count;
    place.days++;
  }
  // The place with the most records leads. Ties go to the smaller id.
  for(const frame of frames){ // one time period
    let best=-1; // largest count so far
    for(const [id,place] of frame.places){ // place ID and totals
      if(place.count>best || (place.count===best&&id<frame.leader)){
        frame.leader=id;best=place.count;
      }
    }
  }
  return frames;
}

function load_dataset(dataset) {
  scene.dataset=dataset;
  scene.timelines=Object.fromEntries(UNITS.map(unit=>[unit,windows_for(dataset,unit)]));
  scene.selected=null;
  ui.place.value("");
  ui.place.attribute("max",String(dataset.points.length));
  set_unit(scene.unit);
  build_stage();
}

// Find the last window that started by this date. Check half the list at a time.
function frame_at(unit,stamp) {
  const frames=scene.timelines[unit]; // periods for this unit
  if(stamp===null || stamp<frames[0].begin)return 0;
  let lo=0,hi=frames.length-1; // search bounds
  while(lo<hi){
    const middle=Math.floor((lo+hi+1)/2); // middle period index
    if(frames[middle].begin<=stamp)lo=middle;
    else hi=middle-1;
  }
  return lo;
}

// Switch rings around the same date so the view does not jump.
function set_unit(unit) {
  if(!scene.timelines[unit])return;
  scene.unit=unit;
  scene.frames=scene.timelines[unit];
  ui.unit.selected(unit);
  ui.time.attribute("max",String(scene.frames.length-1));
  select_frame(frame_at(unit,scene.focus),true,scene.focus);
}

function select_frame(index, resetElapsed=true, preserveFocus=null) {
  if(!scene.frames.length)return;
  scene.index=clamp(index,0,scene.frames.length-1);
  scene.frame=scene.frames[scene.index];
  // The first or last window may cover only part of a week, month, or year.
  const lower=Math.max(scene.frame.begin,Date.parse(scene.dataset.first)); // earliest usable date
  const upper=Math.min(scene.frame.end-1,Date.parse(scene.dataset.last)); // latest usable date
  scene.focus=preserveFocus===null?scene.frame.focus:clamp(preserveFocus,lower,upper);
  if(resetElapsed)scene.elapsed=0;
  ui.time.value(scene.index);
  describe_frame();
}

// Follow a picked place first, or the busiest place in this window.
function target_id() { return scene.selected??scene.frame?.leader??null; }

// A click holds the date while I look at a place.
function pin(id) {
  scene.selected=id;
  if(id!==null)set_playing(false);
  ui.place.value(id===null?"":String(id+1));
  describe_frame();
}

function describe_frame() {
  if(!scene.frame)return;
  const {begin,end}=scene.frame; // period start and end
  // Date labels by unit.
  const labels={
    Day:()=>DATE.format(begin),
    Week:()=>DATE.format(begin)+" – "+DATE.format(end-DAY_MS), // include the last day
    Month:()=>MONTH.format(begin),
    Year:()=>String(new Date(begin).getUTCFullYear())
  };
  ui.period.html(labels[scene.unit]());

  if(!scene.ready){
    ui.status.html("Loading the portrait…");
    return;
  }
  const id=target_id(),point=scene.dataset.points[id],pose=pose_for(scene.frame,id); // place ID, GPS, pose
  const name=point?nearby_place_name(point):null; // nearby city name
  // target status text
  const target=point
    ? `${name?`Near ${name} · `:""}#${id+1} · ${coordinate_text(point,scene.dataset.exact?5:3)} · ${NUMBER.format(pose.visit.count)} records`
    : "No GPS target for this period";
  ui.status.html(`${target} · ${POSES[pose.level].name}`);
}

// Read the chosen photo export in the browser and rebuild the rings.
async function open_csv(file) {
  if(!file?.file)return;
  try{
    const text=await file.file.text(); // raw CSV text
    const updated=read_exact_gallery(text); // parsed photo records
    load_dataset(updated);
  }catch(error){
    ui.status.html("CSV could not load. "+error.message);
  }
}

// More of this window's records at the target means a more open pose.
function pose_level(share,count){
  if(count===0)return 0;
  if(share<.18)return 1;
  if(share<.42)return 2;
  return 3;
}

function pose_for(frame,id){
  const visit=frame.places.get(id)??{count:0,days:0}; // photo count and active days
  const share=frame.total?visit.count/frame.total:0; // share of GPS records
  const days=(frame.end-frame.begin)/DAY_MS; // days in the period
  // For the eyes, use how often the place shows up across the days.
  // A single day uses its share of records.
  const coverage=scene.unit==="Day"?share:visit.days/days; // presence for eye blend
  const month=new Date(scene.focus).getUTCMonth(); // month index from zero
  const season=month<2||month===11?"winter":month<5?"spring":month<8?"summer":"autumn"; // outfit season
  return {level:pose_level(share,visit.count),share,visit,season,eye:clamp(coverage*3.65,0,2)};
}

function nearby_place_name([lat,lon]){
  const lonScale=Math.cos(lat*Math.PI/180); // longitude distance scale
  // Give the point a nearby city name if one is within about 18 km.
  // Longitude lines get closer together toward the poles.
  let limit=(18/111.2)**2; // squared distance cutoff
  let name=null; // closest city name
  for(const [label,y,x] of NEARBY_PLACES){ // city name, latitude, longitude
    const d=(lat-y)**2+(wrap_degrees(lon-x)*lonScale)**2; // squared city distance
    if(d<limit){
      name=label;
      limit=d;
    }
  }
  return name;
}

function coordinate_text(point,precision){
  const [lat,lon]=point; // latitude and longitude
  return `${Math.abs(lat).toFixed(precision)}° ${lat<0?"S":"N"} · ${Math.abs(lon).toFixed(precision)}° ${lon<0?"W":"E"}`;
}

// Read the date and GPS columns. One id stands for one pair of coordinates.
function read_exact_gallery(text){
  const lines=text.trim().split(/\r?\n/); // CSV lines
  const header=lines.shift()?.replace(/^\uFEFF/,"").split(",")??[]; // column names
  const cols=["date","latitude","longitude"].map(name=>header.indexOf(name)); // date and GPS columns
  if(cols.some(col=>col<0))throw new Error("The CSV needs date, latitude, and longitude columns.");
  let first=Infinity,last=-Infinity; // earliest and latest timestamps
  const points=[],keys=new Map(),days=new Map(); // GPS list, ID lookup, daily counts
  for(const line of lines){ // one CSV record
    const values=line.split(","); // values in this row
    const [date,latitude,longitude]=cols.map(i=>values[i]?.trim()); // date and GPS text
    if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))continue;
    const stamp=Date.parse(date); // UTC timestamp
    if(!Number.isFinite(stamp))continue;
    first=Math.min(first,stamp);last=Math.max(last,stamp);
    const lat=Number(latitude),lon=Number(longitude); // numeric GPS pair
    let id=-1; // default for missing GPS
    if(latitude&&longitude&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180){
      const key=lat+","+lon; // coordinate pair key
      if(!keys.has(key)){keys.set(key,points.length);points.push([lat,lon]);}
      id=keys.get(key);
    }
    if(!days.has(stamp))days.set(stamp,new Map());
    const counts=days.get(stamp); // counts for this date
    counts.set(id,(counts.get(id)||0)+1);
  }
  if(!points.length)throw new Error("No usable GPS coordinates were found.");
  const rows=[]; // packed count rows
  for(const [stamp,counts] of days){ // date and place counts
    for(const [id,count] of counts)rows.push([(stamp-first)/DAY_MS,id,count]); // place ID and count
  }
  // Store days as offsets from the first date so the rings can use them.
  const iso=stamp=>new Date(stamp).toISOString().slice(0,10); // timestamp to date string
  return {first:iso(first),last:iso(last),points,rows,exact:true};
}

// Leave room for four rings and for the legs in the longest pose.
function geometry() {
  const outer=Math.min(width*.463,height*.450); // outer ring radius
  const portraitRadius=outer-clamp(outer*.104,15,26)*RING_ORDER.length; // space for the figure
  const r=portraitRadius*1.08; // place rim radius
  const gap=(outer-r)/RING_ORDER.length; // gap between rings
  return {x:width/2,y:height/2,r,gap,portraitRadius};
}

function project(lat,lon) {
  // Wrap longitude around the Pacific. Use this same point for the mark and the turn.
  return [wrap_degrees(lon+173)/116,(32.7-lat)/27];
}

function polar(geo,r,angle) {
  return [geo.x+r*Math.cos(angle),geo.y+r*Math.sin(angle)];
}

function bearing(point) {
  const [x,y]=project(...point); // projected x and y
  return Math.atan2(y,x);
}

function build_stage() {
  if(!scene.stage||!scene.dataset)return;
  const g=scene.stage,geo=geometry(); // static layer and ring layout
  g.background("#ffffff");
  g.noFill();g.stroke("#d4dad6");g.strokeWeight(1);
  g.circle(geo.x,geo.y,geo.r*2);

  // All places get the same small tick on the rim.
  scene.targets=scene.dataset.points.map(bearing);
  const seen=new Set(); // pixels already drawn
  g.stroke("#7d8982");g.strokeWeight(1);
  for(const angle of scene.targets){ // one place bearing
    // Several places can share a pixel. Draw one tick there.
    const pixel=wrap_index(Math.round(wrap_index(angle,TURN)*geo.r),Math.ceil(TURN*geo.r)); // pixel along the rim
    if(seen.has(pixel))continue;
    seen.add(pixel);
    g.line(...polar(geo,geo.r-2.5,angle),...polar(geo,geo.r+2.5,angle));
  }
}

// Each ring looks up the same date in its own list of windows.
function dial_state(slot) {
  const unit=RING_ORDER[slot]; // time unit on this ring
  const index=frame_at(unit,scene.focus),frames=scene.timelines[unit]; // current index and period list
  const begin=frames[index].begin; // start of this period
  // date shown on ring
  const value=unit==="Year" ? new Date(begin).getUTCFullYear() :
    unit==="Month" ? SHORT_MONTH.format(begin) : SHORT_DAY.format(begin);
  return {unit,length:frames.length,index,caption:String(value)};
}

// Bring the chosen tick up to the top with a short, smooth turn.
function rotate_dials(dt) {
  const mix=1-Math.exp(-dt/155); // turn smoothing amount
  for(let slot=0;slot<RING_ORDER.length;slot++){ // ring number
    const {index,length}=dial_state(slot); // selected tick and tick count
    const angle=-index/length*TURN; // goal ring angle
    scene.dials[slot]=wrap_index(scene.dials[slot]+angle_delta(angle,scene.dials[slot])*mix,TURN);
  }
}

function draw_dials(g,geo) {
  const compact=width<500; // small canvas flag
  const captionAngles=[2.16,2.85,.87,5.66]; // ring label angles
  const captions=[]; // labels to draw last
  for(let slot=0;slot<RING_ORDER.length;slot++){ // ring number
    const dial=dial_state(slot),r=geo.r+(slot+1)*geo.gap; // ring state and radius
    const active=dial.unit===scene.unit; // selected time unit flag
    g.noFill();
    g.stroke(active?"#e5ebe7":"#f1f3f0");
    g.strokeWeight(geo.gap*.73);
    g.circle(geo.x,geo.y,r*2);
    g.stroke(active?"#c9d2cc":"#e0e5e0");
    g.strokeWeight(.65);
    g.circle(geo.x,geo.y,r*2);

    // Skip some marks when the ring has too many dates to fit.
    const stride=Math.max(1,Math.ceil(dial.length/(compact?48:88))); // ticks between marks
    const step=dial.unit==="Year"?5:3.3; // tick half length
    g.stroke(active?"#5d7165":"#89968d");g.strokeWeight(active?1.2:1);
    for(let i=0;i<dial.length;i+=stride){ // tick index
      const angle=INDEX_ANGLE+scene.dials[slot]+i/dial.length*TURN; // tick angle
      g.line(...polar(geo,r-step,angle),...polar(geo,r+step,angle));
    }
    const selectedAngle=INDEX_ANGLE+scene.dials[slot]+dial.index/dial.length*TURN; // selected tick angle
    g.noStroke();g.fill(active?"#8f5840":"#54645b");
    g.circle(...polar(geo,r,selectedAngle),active?6.4:4.3);
    g.stroke(active?"#8f5840":"#839389");g.strokeWeight(active?1.5:1);
    g.line(...polar(geo,r+geo.gap*.32,INDEX_ANGLE),...polar(geo,r+geo.gap*.5,INDEX_ANGLE));

    captions.push([r,captionAngles[slot],dial,active]);
  }
  // Add the labels after all four rings so none get covered.
  for(const [r,angle,dial,active] of captions)draw_caption(g,geo,r,angle,dial,active,compact); // radius, angle, ring, active flag
}

function draw_caption(g,geo,r,angle,dial,active,compact) {
  const [x,y]=polar(geo,r,angle); // label center
  const label=dial.unit.toUpperCase()+"  "+dial.caption; // unit and date text
  const size=compact?8.7:10; // label font size
  g.textFont("monospace");g.textSize(size);g.textAlign(CENTER,CENTER);
  const w=g.textWidth(label)+12,h=compact?13:16; // label box width and height
  const cx=clamp(x,w/2+2,width-w/2-2); // x inside canvas
  g.noStroke();g.fill("#ffffff");g.rect(cx-w/2,y-h/2,w,h,3);
  g.fill(active?"#80503c":"#54635b");
  g.text(label,cx,y+.4);
}

function draw_target(g,geo) {
  const id=target_id(); // current place ID
  if(id===null)return;
  const angle=scene.targets[id]; // target bearing
  const [x,y]=polar(geo,geo.r,angle); // target dot position
  g.fill("#fff");g.stroke("#8f5840");g.strokeWeight(1.35);
  g.circle(x,y,12);
  g.noStroke();g.fill("#8f5840");g.circle(x,y,4.5);
}

// Use a small hit area on the rim. Click again to cycle through nearby places.
function pick_target(theta,geo) {
  // nearby targets, closest first
  const candidates=scene.targets.map((angle,id)=>({id,d:Math.abs(angle_delta(angle,theta))}))
    .filter(target=>target.d*geo.r<=9)
    .sort((a,b)=>a.d-b.d||a.id-b.id);
  if(!candidates.length)return;
  const prior=candidates.findIndex(target=>target.id===scene.selected); // current target in list
  pin(candidates[(prior+1)%candidates.length].id);
}

// Undo the drawn turn first, then find the date under the pointer.
function index_at_angle(angle,shift,length) {
  return wrap_index(Math.round((angle-INDEX_ANGLE-shift)/TURN*length),length);
}

// The distance from the middle tells us which ring was picked.
function begin_interaction() {
  if(!scene.frame||scene.drag)return;
  const geo=geometry(),dx=mouseX-geo.x,dy=mouseY-geo.y; // ring layout, x offset, y offset
  const radius=Math.hypot(dx,dy),angle=Math.atan2(dy,dx); // pointer distance and angle
  const slot=Math.round((radius-geo.r)/geo.gap)-1; // ring under pointer
  if(slot>=0&&slot<RING_ORDER.length&&Math.abs(radius-geo.r-(slot+1)*geo.gap)<=geo.gap*.49){
    const dial=dial_state(slot); // pressed ring state
    set_playing(false);
    scene.drag={...dial,slot,radius,angle,last:angle,motion:0,shift:scene.dials[slot],moved:false};
    return false;
  }
  if(Math.abs(radius-geo.r)<=8){
    pick_target(angle,geo);
    return false;
  }
}

function choose_dial(drag,index) {
  if(scene.unit!==drag.unit)set_unit(drag.unit);
  select_frame(index);
}

function mouse_dragged() {
  const drag=scene.drag; // saved drag state
  if(!drag)return;
  const geo=geometry(),angle=Math.atan2(mouseY-geo.y,mouseX-geo.x); // ring layout and pointer angle
  // Add short turns as the pointer moves, including turns across zero.
  drag.motion+=angle_delta(angle,drag.last);
  drag.last=angle;
  // Wait for a few pixels of movement before treating a press as a drag.
  if(drag.moved||Math.abs(drag.motion)*drag.radius>4){
    drag.moved=true;
    const index=wrap_index(Math.round(drag.index-drag.motion/TURN*drag.length),drag.length); // period under drag
    if(drag.chosen!==index){
      drag.chosen=index;
      choose_dial(drag,index);
    }
  }
  return false;
}

function mouse_released() {
  const drag=scene.drag; // saved drag state
  if(!drag)return;
  scene.drag=null;
  // A short press still picks the date at that spot on the ring.
  if(!drag.moved)choose_dial(drag,index_at_angle(drag.angle,drag.shift,drag.length));
  return false;
}

function mouse_pressed(event) {
  if(event.target===ui.canvas?.elt)return begin_interaction();
}
function touch_started(event) {
  if(event.target===ui.canvas?.elt)return begin_interaction();
}
function touch_moved() { return mouse_dragged(); }
function touch_ended() { return mouse_released(); }

// Arrow keys step through time when the canvas has focus.
function key_pressed(event) {
  if(event.target?.tagName!=="CANVAS"||!scene.frame)return;
  if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return;
  const step=event.key==="ArrowRight"?1:-1; // direction to step
  set_playing(false);
  select_frame(wrap_index(scene.index+step,scene.frames.length));
  return false;
}

// Start in the source drawing and follow the joint up through its parents.
function point_on_joint(id,point,open){
  let [x,y]=point; // moving point coordinates
  for(let joint=id;joint;joint=RIG.joints[joint].parent){ // joint being applied
    const [px,py]=RIG.joints[joint].pivot; // joint pivot coordinates
    const angle=(OPEN_ANGLES[joint]||0)*open; // joint turn amount
    const c=Math.cos(angle),s=Math.sin(angle); // cosine and sine
    [x,y]=[px+(x-px)*c-(y-py)*s,py+(x-px)*s+(y-py)*c];
  }
  return [x,y];
}

function pivot_for(open){
  // Move the center as the arms and legs stretch out.
  const bend=open*open; // squared opening amount
  return [757+38*open+122*bend,548+622*open-265*bend];
}

// Take out the head's own angle so its turn ends at the place mark.
function target_rotation(point,open){
  const [tx,ty]=project(...point); // projected place coordinates
  const [hx,hy]=point_on_joint("head",[1300,279],open); // turned head coordinates
  const [cx,cy]=pivot_for(open); // figure pivot coordinates
  return Math.atan2(ty,tx)-Math.atan2(hy-cy,hx-cx);
}

function apply_joint(g,id,open){
  const joint=RIG.joints[id]; // joint settings
  // Turn the parent first. Then turn this part around its own joint.
  if(joint.parent)apply_joint(g,joint.parent,open);
  const [x,y]=joint.pivot; // joint pivot coordinates
  g.translate(x,y);
  g.rotate((OPEN_ANGLES[id]||0)*open);
  g.translate(-x,-y);
}

// Spring is the backup for a piece that has no seasonal drawing.
function layer_at(id,kind,season){
  const candidate=`${kind}/${id}_${season}.png`; // requested image path
  return LAYERS[candidate]??LAYERS[`${kind}/${id}_spring.png`];
}
function draw_layer(g,layer){
  if(layer)g.image(scene.layerImages[layer.path],...layer.sourceOrigin,...layer.size);
}

// Fade between the eye drawings as the body wakes or goes back to sleep.
function draw_eyes(g,eye,alpha){
  const value=clamp(eye,0,2),lo=Math.floor(value),part=value-lo; // eye value, base frame, blend
  if(lo>0){
    g.tint(255,alpha);
    draw_layer(g,layer_at("head","eyes",["closed","drowsy","stare"][lo]));
  }
  if(part>.01&&lo<2){
    g.tint(255,alpha*part);
    draw_layer(g,layer_at("head","eyes",["closed","drowsy","stare"][lo+1]));
  }
  g.noTint();
}

function render_portrait(g,pose){
  const {x,y,scale:factor,open,eye,angle,season}=pose; // center, scale, opening, eyes, turn, outfit
  const [cx,cy]=pivot_for(open); // figure pivot coordinates
  // Start with the whole curled drawing. Fade into the joint pieces as it opens.
  const blend=ease_curve(clamp((open-.015)/.12,0,1)); // joint layer opacity
  g.push();
  g.translate(x,y);
  g.rotate(angle);
  g.scale(factor);
  g.translate(-cx,-cy);
  if(blend<1){
    g.tint(255,255*(1-blend));
    g.image(scene.sources[season],0,0,1536,1024);
    g.noTint();
    draw_eyes(g,eye,255*(1-blend));
  }
  if(blend>0){
    for(const id of RIG.backToFront){ // part to paint
      g.push();
      apply_joint(g,id,open);
      if(blend<1)g.tint(255,255*blend);
      // Paint behind the joint first to cover gaps between the pieces.
      draw_layer(g,layer_at(id,"underpaint",season));
      draw_layer(g,layer_at(id,"parts",season));
      g.noTint();
      if(id==="head")draw_eyes(g,eye,255*blend);
      g.pop();
    }
  }
  if(pose.joints){
    g.stroke("#a2d1e2");
    g.strokeWeight(6);
    for(const id of RIG.backToFront){ // joint to show
      const joint=RIG.joints[id],point=point_on_joint(id,joint.pivot,open); // joint settings and position
      if(joint.parent){
        const parent=point_on_joint(joint.parent,RIG.joints[joint.parent].pivot,open); // parent joint position
        g.line(...point,...parent);
      }
      g.fill("#f0c28e");
      g.circle(...point,18);
    }
  }
  g.pop();
}

function update_pose(){
  if(!scene.frame)return;
  const id=target_id(); // current place ID
  const pose=pose_for(scene.frame,id); // pose for this period
  const amount=POSES[pose.level].amount; // goal opening amount
  // Move a little toward the new pose each frame. Use the time since the last frame.
  const ease=1-Math.exp(-Math.min(deltaTime,100)/200); // pose smoothing amount
  scene.open+=(amount-scene.open)*ease;
  scene.eye+=(pose.eye-scene.eye)*ease;
  scene.season=pose.season;
  const point=scene.dataset.points[id]; // target GPS pair
  if(point)scene.angle+=angle_delta(target_rotation(point,scene.open),scene.angle)*ease;
}
function draw() {
  if(!scene.stage||!scene.frame)return;
  // Limit a long frame so coming back to the tab does not skip a long stretch.
  const dt=clamp(deltaTime,0,100); // capped frame time
  if(scene.ready&&scene.playing){
    scene.elapsed+=dt*scene.speed;
    if(scene.elapsed>=STEP_MS){
      const steps=Math.floor(scene.elapsed/STEP_MS); // periods to advance
      scene.elapsed%=STEP_MS;
      select_frame((scene.index+steps)%scene.frames.length,false);
    }
  }
  rotate_dials(dt);
  update_pose();
  // Draw the cached place marks, then add this frame's rings and figure.
  image(scene.stage,0,0);
  const geo=geometry(),g=scene.overlay; // ring layout and moving layer
  g.clear();
  draw_dials(g,geo);
  if(scene.ready){
    render_portrait(g,{x:geo.x,y:geo.y,scale:PORTRAIT_SCALE*geo.portraitRadius*(.00060-.000045*scene.open),
      open:scene.open,eye:scene.eye,angle:scene.angle,season:scene.season,joints:ui.joints.checked()});
  }
  draw_target(g,geo);
  image(g,0,0);
}

// p5 looks up these event names on the window.
window.windowResized = window_resized;
window.mousePressed = mouse_pressed;
window.mouseDragged = mouse_dragged;
window.mouseReleased = mouse_released;
window.touchStarted = touch_started;
window.touchMoved = touch_moved;
window.touchEnded = touch_ended;
window.keyPressed = key_pressed;

// Joint pivots and image layers.
const RIG={"sourceSize":[1536,1024],"center":[768,520],"rotationUnit":"radians","backToFront":["farThigh","farFoot","farShin","rearUpperArm","rearForearm","torso","head","upperArm","forearm","hand","thigh","foot","shin"],"joints":{"farThigh":{"parent":null,"pivot":[312,608],"openRotation":0.22},"farShin":{"parent":"farThigh","pivot":[899,858],"openRotation":-0.44},"farFoot":{"parent":"farShin","pivot":[318,916],"openRotation":0.12},"rearUpperArm":{"parent":null,"pivot":[906,232],"openRotation":-0.14},"rearForearm":{"parent":"rearUpperArm","pivot":[1104,609],"openRotation":0.13},"torso":{"parent":null,"pivot":[499,464],"openRotation":-0.027},"head":{"parent":"torso","pivot":[1071,326],"openRotation":-0.2},"upperArm":{"parent":"torso","pivot":[926,234],"openRotation":0.21},"forearm":{"parent":"upperArm","pivot":[758,442],"openRotation":-0.46},"hand":{"parent":"forearm","pivot":[1030,493],"openRotation":0.055},"thigh":{"parent":null,"pivot":[289,561],"openRotation":0.12},"shin":{"parent":"thigh","pivot":[845,645],"openRotation":-0.56},"foot":{"parent":"shin","pivot":[345,786],"openRotation":0.14}},"layers":[{"path":"underpaint/farThigh_spring.png","id":"farThigh","kind":"underpaint","season":"spring","sourceOrigin":[255,554],"pivot":[57,54],"sourcePivot":[312,608],"parent":null,"size":[692,364]},{"path":"parts/farFoot_spring.png","id":"farFoot","kind":"parts","season":"spring","sourceOrigin":[98,831],"pivot":[220,85],"sourcePivot":[318,916],"parent":"farShin","size":[282,191]},{"path":"parts/farShin_spring.png","id":"farShin","kind":"parts","season":"spring","sourceOrigin":[319,770],"pivot":[580,88],"sourcePivot":[899,858],"parent":"farThigh","size":[681,245]},{"path":"underpaint/rearUpperArm_spring.png","id":"rearUpperArm","kind":"underpaint","season":"spring","sourceOrigin":[817,202],"pivot":[89,30],"sourcePivot":[906,232],"parent":null,"size":[341,478]},{"path":"underpaint/rearUpperArm_summer.png","id":"rearUpperArm","kind":"underpaint","season":"summer","sourceOrigin":[817,202],"pivot":[89,30],"sourcePivot":[906,232],"parent":null,"size":[341,478]},{"path":"underpaint/rearUpperArm_autumn.png","id":"rearUpperArm","kind":"underpaint","season":"autumn","sourceOrigin":[817,202],"pivot":[89,30],"sourcePivot":[906,232],"parent":null,"size":[341,478]},{"path":"underpaint/rearUpperArm_winter.png","id":"rearUpperArm","kind":"underpaint","season":"winter","sourceOrigin":[817,202],"pivot":[89,30],"sourcePivot":[906,232],"parent":null,"size":[341,478]},{"path":"parts/rearForearm_spring.png","id":"rearForearm","kind":"parts","season":"spring","sourceOrigin":[867,534],"pivot":[237,75],"sourcePivot":[1104,609],"parent":"rearUpperArm","size":[352,276]},{"path":"parts/rearForearm_summer.png","id":"rearForearm","kind":"parts","season":"summer","sourceOrigin":[867,534],"pivot":[237,75],"sourcePivot":[1104,609],"parent":"rearUpperArm","size":[352,276]},{"path":"parts/rearForearm_autumn.png","id":"rearForearm","kind":"parts","season":"autumn","sourceOrigin":[867,534],"pivot":[237,75],"sourcePivot":[1104,609],"parent":"rearUpperArm","size":[352,276]},{"path":"parts/rearForearm_winter.png","id":"rearForearm","kind":"parts","season":"winter","sourceOrigin":[867,534],"pivot":[237,75],"sourcePivot":[1104,609],"parent":"rearUpperArm","size":[352,276]},{"path":"parts/torso_spring.png","id":"torso","kind":"parts","season":"spring","sourceOrigin":[93,50],"pivot":[406,414],"sourcePivot":[499,464],"parent":null,"size":[1012,692]},{"path":"parts/torso_summer.png","id":"torso","kind":"parts","season":"summer","sourceOrigin":[93,50],"pivot":[406,414],"sourcePivot":[499,464],"parent":null,"size":[1012,692]},{"path":"parts/torso_autumn.png","id":"torso","kind":"parts","season":"autumn","sourceOrigin":[93,50],"pivot":[406,414],"sourcePivot":[499,464],"parent":null,"size":[1012,692]},{"path":"parts/torso_winter.png","id":"torso","kind":"parts","season":"winter","sourceOrigin":[93,50],"pivot":[406,414],"sourcePivot":[499,464],"parent":null,"size":[1012,692]},{"path":"underpaint/torso_spring.png","id":"torso","kind":"underpaint","season":"spring","sourceOrigin":[203,200],"pivot":[296,264],"sourcePivot":[499,464],"parent":null,"size":[832,537]},{"path":"underpaint/torso_summer.png","id":"torso","kind":"underpaint","season":"summer","sourceOrigin":[203,200],"pivot":[296,264],"sourcePivot":[499,464],"parent":null,"size":[832,537]},{"path":"underpaint/torso_autumn.png","id":"torso","kind":"underpaint","season":"autumn","sourceOrigin":[203,200],"pivot":[296,264],"sourcePivot":[499,464],"parent":null,"size":[832,537]},{"path":"underpaint/torso_winter.png","id":"torso","kind":"underpaint","season":"winter","sourceOrigin":[203,200],"pivot":[296,264],"sourcePivot":[499,464],"parent":null,"size":[832,537]},{"path":"parts/head_spring.png","id":"head","kind":"parts","season":"spring","sourceOrigin":[1019,22],"pivot":[52,304],"sourcePivot":[1071,326],"parent":"torso","size":[510,448]},{"path":"underpaint/head_spring.png","id":"head","kind":"underpaint","season":"spring","sourceOrigin":[997,226],"pivot":[74,100],"sourcePivot":[1071,326],"parent":"torso","size":[189,224]},{"path":"parts/upperArm_spring.png","id":"upperArm","kind":"parts","season":"spring","sourceOrigin":[607,129],"pivot":[319,105],"sourcePivot":[926,234],"parent":"torso","size":[474,344]},{"path":"parts/upperArm_summer.png","id":"upperArm","kind":"parts","season":"summer","sourceOrigin":[607,129],"pivot":[319,105],"sourcePivot":[926,234],"parent":"torso","size":[474,344]},{"path":"parts/upperArm_autumn.png","id":"upperArm","kind":"parts","season":"autumn","sourceOrigin":[607,129],"pivot":[319,105],"sourcePivot":[926,234],"parent":"torso","size":[474,344]},{"path":"parts/upperArm_winter.png","id":"upperArm","kind":"parts","season":"winter","sourceOrigin":[607,129],"pivot":[319,105],"sourcePivot":[926,234],"parent":"torso","size":[474,344]},{"path":"underpaint/upperArm_spring.png","id":"upperArm","kind":"underpaint","season":"spring","sourceOrigin":[637,150],"pivot":[289,84],"sourcePivot":[926,234],"parent":"torso","size":[393,361]},{"path":"underpaint/upperArm_summer.png","id":"upperArm","kind":"underpaint","season":"summer","sourceOrigin":[637,150],"pivot":[289,84],"sourcePivot":[926,234],"parent":"torso","size":[393,361]},{"path":"underpaint/upperArm_autumn.png","id":"upperArm","kind":"underpaint","season":"autumn","sourceOrigin":[637,150],"pivot":[289,84],"sourcePivot":[926,234],"parent":"torso","size":[393,361]},{"path":"underpaint/upperArm_winter.png","id":"upperArm","kind":"underpaint","season":"winter","sourceOrigin":[637,150],"pivot":[289,84],"sourcePivot":[926,234],"parent":"torso","size":[393,361]},{"path":"parts/forearm_spring.png","id":"forearm","kind":"parts","season":"spring","sourceOrigin":[706,375],"pivot":[52,67],"sourcePivot":[758,442],"parent":"upperArm","size":[356,256]},{"path":"parts/forearm_summer.png","id":"forearm","kind":"parts","season":"summer","sourceOrigin":[706,375],"pivot":[52,67],"sourcePivot":[758,442],"parent":"upperArm","size":[356,256]},{"path":"parts/forearm_autumn.png","id":"forearm","kind":"parts","season":"autumn","sourceOrigin":[706,375],"pivot":[52,67],"sourcePivot":[758,442],"parent":"upperArm","size":[356,256]},{"path":"parts/forearm_winter.png","id":"forearm","kind":"parts","season":"winter","sourceOrigin":[706,375],"pivot":[52,67],"sourcePivot":[758,442],"parent":"upperArm","size":[356,256]},{"path":"underpaint/forearm_spring.png","id":"forearm","kind":"underpaint","season":"spring","sourceOrigin":[680,377],"pivot":[78,65],"sourcePivot":[758,442],"parent":"upperArm","size":[407,251]},{"path":"underpaint/forearm_summer.png","id":"forearm","kind":"underpaint","season":"summer","sourceOrigin":[680,377],"pivot":[78,65],"sourcePivot":[758,442],"parent":"upperArm","size":[407,251]},{"path":"underpaint/forearm_autumn.png","id":"forearm","kind":"underpaint","season":"autumn","sourceOrigin":[680,377],"pivot":[78,65],"sourcePivot":[758,442],"parent":"upperArm","size":[407,251]},{"path":"underpaint/forearm_winter.png","id":"forearm","kind":"underpaint","season":"winter","sourceOrigin":[680,377],"pivot":[78,65],"sourcePivot":[758,442],"parent":"upperArm","size":[407,251]},{"path":"parts/hand_spring.png","id":"hand","kind":"parts","season":"spring","sourceOrigin":[1000,425],"pivot":[30,68],"sourcePivot":[1030,493],"parent":"forearm","size":[334,209]},{"path":"parts/hand_summer.png","id":"hand","kind":"parts","season":"summer","sourceOrigin":[1000,425],"pivot":[30,68],"sourcePivot":[1030,493],"parent":"forearm","size":[334,209]},{"path":"parts/hand_autumn.png","id":"hand","kind":"parts","season":"autumn","sourceOrigin":[1000,425],"pivot":[30,68],"sourcePivot":[1030,493],"parent":"forearm","size":[334,209]},{"path":"parts/hand_winter.png","id":"hand","kind":"parts","season":"winter","sourceOrigin":[1000,425],"pivot":[30,68],"sourcePivot":[1030,493],"parent":"forearm","size":[334,209]},{"path":"underpaint/hand_spring.png","id":"hand","kind":"underpaint","season":"spring","sourceOrigin":[973,429],"pivot":[57,64],"sourcePivot":[1030,493],"parent":"forearm","size":[148,139]},{"path":"parts/thigh_spring.png","id":"thigh","kind":"parts","season":"spring","sourceOrigin":[178,369],"pivot":[111,192],"sourcePivot":[289,561],"parent":null,"size":[747,390]},{"path":"parts/thigh_summer.png","id":"thigh","kind":"parts","season":"summer","sourceOrigin":[178,369],"pivot":[111,192],"sourcePivot":[289,561],"parent":null,"size":[747,390]},{"path":"parts/thigh_autumn.png","id":"thigh","kind":"parts","season":"autumn","sourceOrigin":[178,369],"pivot":[111,192],"sourcePivot":[289,561],"parent":null,"size":[747,390]},{"path":"parts/thigh_winter.png","id":"thigh","kind":"parts","season":"winter","sourceOrigin":[178,369],"pivot":[111,192],"sourcePivot":[289,561],"parent":null,"size":[747,390]},{"path":"underpaint/thigh_spring.png","id":"thigh","kind":"underpaint","season":"spring","sourceOrigin":[195,392],"pivot":[94,169],"sourcePivot":[289,561],"parent":null,"size":[733,371]},{"path":"parts/foot_spring.png","id":"foot","kind":"parts","season":"spring","sourceOrigin":[17,705],"pivot":[328,81],"sourcePivot":[345,786],"parent":"shin","size":[375,269]},{"path":"underpaint/foot_spring.png","id":"foot","kind":"underpaint","season":"spring","sourceOrigin":[284,740],"pivot":[61,46],"sourcePivot":[345,786],"parent":"shin","size":[117,112]},{"path":"parts/shin_spring.png","id":"shin","kind":"parts","season":"spring","sourceOrigin":[301,554],"pivot":[544,91],"sourcePivot":[845,645],"parent":"thigh","size":[624,374]},{"path":"underpaint/shin_spring.png","id":"shin","kind":"underpaint","season":"spring","sourceOrigin":[310,538],"pivot":[535,107],"sourcePivot":[845,645],"parent":"thigh","size":[628,372]},{"path":"eyes/head_closed.png","id":"head","kind":"eyes","season":"closed","sourceOrigin":[1199,223],"pivot":[-128,103],"sourcePivot":[1071,326],"parent":"torso","size":[203,152]},{"path":"eyes/head_drowsy.png","id":"head","kind":"eyes","season":"drowsy","sourceOrigin":[1199,223],"pivot":[-128,103],"sourcePivot":[1071,326],"parent":"torso","size":[203,152]},{"path":"eyes/head_stare.png","id":"head","kind":"eyes","season":"stare","sourceOrigin":[1199,223],"pivot":[-128,103],"sourcePivot":[1071,326],"parent":"torso","size":[203,152]}]};
const LAYERS=Object.fromEntries(RIG.layers.map(layer=>[layer.path,layer])); // layer info by path

// Record counts by day and place.
const PACKED_GALLERY={"first":"2023-01-04","last":"2026-11-09","points":[[26.0375,127.6625],[26.0375,127.7125],[26.0375,127.7375],[26.0375,127.7625],[26.0625,127.6375],[26.0625,127.7625],[26.0875,127.6375],[26.0875,127.7625],[26.0875,127.7875],[26.1125,127.7875],[26.1375,127.6375],[26.1375,127.7875],[26.1625,127.6375],[26.1625,127.6625],[26.1875,127.6375],[26.2125,127.6625],[26.2125,127.6875],[26.2125,127.7125],[26.2125,127.8125],[26.2375,127.8125],[26.3375,127.7625],[26.5125,127.8375],[26.5125,127.8625],[26.5375,127.9375],[26.6875,127.8875],[32.7125,-117.1625],[32.7375,-117.2375],[32.7375,-117.1625],[32.7375,-117.1375],[32.7625,-117.2125],[32.7625,-117.1625],[32.8375,-117.2625],[32.8625,-117.2625],[32.8625,-117.2375],[33.2125,126.2625],[33.2125,126.2875],[33.2375,-117.4125],[33.2375,126.4375],[33.2375,126.4625],[33.2625,126.2875],[33.2625,126.6375],[33.2625,126.7125],[33.2875,126.1625],[33.2875,126.7125],[33.2875,126.7375],[33.3125,-117.4875],[33.3125,-117.4625],[33.3125,126.1875],[33.3375,-117.5125],[33.3375,126.2625],[33.3375,126.3375],[33.3625,126.7875],[33.4125,126.0375],[33.4125,126.3875],[33.4625,126.6125],[33.4875,126.4625],[33.4875,126.4875],[33.4875,126.5125],[33.4875,126.7125],[33.5125,126.4875],[33.5125,126.5125],[33.5125,126.7125],[33.5375,126.6125],[33.5375,126.6375],[33.5375,126.6625],[33.5375,126.6875],[33.5375,126.8375],[33.5625,126.6375],[33.5625,126.7625],[33.6125,-117.7125],[33.6625,-118.0125],[33.6875,-118.0375],[33.6875,-117.8875],[33.7375,-118.1125],[33.7625,-118.1625],[33.7625,-118.1375],[33.7625,-118.1125],[33.7625,-117.9625],[33.7625,-117.8625],[33.7875,-118.1375],[33.7875,-118.1125],[33.7875,-117.8875],[33.8125,-118.3375],[33.8375,-118.3625],[33.8375,-118.3375],[33.8375,-118.0875],[33.8625,126.4625],[33.8875,-118.1125],[33.8875,-118.0375],[33.9125,-118.3125],[33.9125,-118.1125],[33.9375,-118.4375],[33.9375,-118.4125],[33.9375,-118.3875],[33.9375,-118.1125],[33.9375,-118.0875],[33.9625,-118.3375],[33.9625,-118.3125],[33.9625,-118.1125],[34.0125,-118.4875],[34.0125,-118.4375],[34.0125,-118.4125],[34.0125,-118.3875],[34.0125,-118.3625],[34.0125,-118.3375],[34.0125,-118.2875],[34.0125,-118.2625],[34.0125,-118.2375],[34.0125,-118.2125],[34.0375,-118.4375],[34.0375,-118.3875],[34.0375,-118.3625],[34.0375,-118.2625],[34.0375,-118.2375],[34.0375,-118.2125],[34.0625,-119.0125],[34.0625,-118.4375],[34.0625,-118.4125],[34.0625,-118.3875],[34.0625,-118.3625],[34.0625,-118.3125],[34.0625,-118.2875],[34.0625,-118.2625],[34.0625,-118.2375],[34.0625,-118.2125],[34.0875,-118.4875],[34.0875,-118.4625],[34.0875,-118.3375],[34.0875,-118.2875],[34.0875,-118.2625],[34.0875,-118.2375],[34.1125,-118.3375],[34.1375,-118.4625],[34.1375,-118.2625],[34.1375,-118.1375],[34.1375,-118.1125],[34.1375,-118.0625],[34.1625,-118.4625],[34.1625,-118.3125],[34.1625,-118.2875],[34.1875,-119.1125],[34.1875,-119.0625],[34.1875,-118.3875],[34.1875,-118.3625],[34.1875,-118.3375],[34.1875,-118.0875],[34.2125,-118.4625],[34.2125,-118.3375],[34.2125,-118.2375],[34.2625,-118.6875],[34.2625,-118.6125],[34.2875,-119.3375],[34.2875,-119.3125],[34.2875,-119.2875],[34.2875,-118.6125],[34.2875,-118.5625],[34.2875,-118.4625],[34.2875,-118.4125],[34.3125,-118.4875],[34.3125,-118.4625],[34.3125,-118.4375],[34.3375,-119.4125],[34.3375,-119.3875],[34.3625,-118.5625],[34.3875,-119.5125],[34.3875,-119.4875],[34.3875,-118.5875],[34.3875,-118.5625],[34.3875,-118.5375],[34.4125,-119.8625],[34.4125,-119.8375],[34.4125,-119.7125],[34.4125,-119.6875],[34.4125,-118.5875],[34.4125,-118.5625],[34.4125,-118.5375],[34.4125,-118.5125],[34.4125,-118.4625],[34.4125,-118.4125],[34.4375,-119.8625],[34.4375,-119.7375],[34.4375,-118.6375],[34.4375,-118.6125],[34.4375,-118.5875],[34.4375,-118.5625],[34.4375,-118.5375],[34.4875,-118.7625],[34.4875,-118.6125],[34.5125,-118.6125],[34.5125,-118.3375],[34.5625,-118.5625],[34.5625,-118.5375],[34.5875,-118.5625],[34.6125,-118.5625],[34.8375,-118.0125],[34.9375,128.5875],[35.0875,129.0125],[35.0875,129.0375],[35.1125,129.0375],[35.1625,128.9125],[35.1625,128.9375],[35.1625,129.1125],[35.1625,129.1625],[35.2125,128.9375],[35.2125,129.0875],[35.2125,129.2125],[35.2375,127.7125],[35.8375,128.6125],[35.8375,128.6875],[35.8625,128.5875],[35.8625,128.6125],[35.8625,128.6375],[35.8625,128.6625],[35.8875,128.5875],[35.8875,128.6125],[35.8875,128.6375],[35.9625,128.7125],[35.9625,128.7625],[36.0875,-115.1625],[36.0875,-115.1375],[36.1125,-115.1625],[36.7125,127.1875],[36.9625,126.7125],[37.1875,126.9375],[37.2125,-121.9875],[37.2375,126.6125],[37.2625,126.9875],[37.2875,127.0375],[37.2875,127.1875],[37.2875,127.2125],[37.3125,-121.9375],[37.3375,-122.0125],[37.3375,-121.9875],[37.3375,-121.9375],[37.3375,-107.6625],[37.3375,126.8125],[37.3375,127.1125],[37.3875,-121.9875],[37.3875,129.2375],[37.4125,-122.0625],[37.4125,126.9375],[37.4375,-122.1625],[37.4375,126.4625],[37.4375,126.5875],[37.4375,127.0125],[37.4625,126.4375],[37.4625,126.8875],[37.4625,126.9125],[37.4625,126.9625],[37.4875,126.8875],[37.4875,126.9375],[37.4875,126.9625],[37.4875,126.9875],[37.4875,127.0125],[37.4875,127.0375],[37.4875,127.0625],[37.5125,126.8625],[37.5125,126.8875],[37.5125,126.9375],[37.5125,126.9625],[37.5125,126.9875],[37.5125,127.0125],[37.5125,127.0375],[37.5125,127.0625],[37.5125,127.0875],[37.5125,127.1125],[37.5125,129.1125],[37.5375,126.8625],[37.5375,126.8875],[37.5375,126.9125],[37.5375,126.9375],[37.5375,126.9625],[37.5375,126.9875],[37.5375,127.0125],[37.5375,127.0375],[37.5375,127.0625],[37.5375,129.1125],[37.5625,126.8125],[37.5625,126.8875],[37.5625,126.9125],[37.5625,126.9375],[37.5625,126.9625],[37.5625,126.9875],[37.5625,127.0125],[37.5625,127.0375],[37.5625,127.0625],[37.5625,127.3125],[37.5625,129.1125],[37.5875,-122.0625],[37.5875,126.8875],[37.5875,126.9375],[37.5875,126.9625],[37.5875,126.9875],[37.5875,127.0125],[37.5875,127.0375],[37.6125,-122.3875],[37.6125,-122.0625],[37.6125,126.6875],[37.6125,126.9875],[37.6125,129.0875],[37.6375,-122.4125],[37.6375,-122.0875],[37.7625,-122.2625],[37.8375,-122.2875],[37.8875,127.7375],[37.8875,127.7875],[38.9125,-93.4625],[40.6875,-84.5125],[40.7375,-84.4125],[41.4125,-81.8375],[41.4125,-81.7375],[41.4375,-81.8125],[41.4625,-81.5125],[41.4625,-81.4875],[41.4625,-81.4625],[41.5125,-81.5875],[41.5125,-81.5375],[41.5125,-81.4625],[41.5125,-81.4375],[41.5125,-81.4125],[44.5625,-123.1625]],"rows":[[0,-1,1],[0,229,159],[0,254,3],[1,-1,1],[1,267,28],[6,279,25],[7,-1,1],[8,-1,1],[8,270,1],[8,280,3],[9,256,1],[10,-1,2],[10,267,41],[12,293,1],[12,298,10],[13,293,7],[16,-1,3],[16,256,25],[16,263,71],[16,267,40],[18,264,54],[18,265,26],[19,265,4],[20,-1,2],[21,-1,1],[21,282,1],[22,289,4],[24,267,4],[31,-1,1],[31,267,22],[31,268,13],[31,279,49],[35,-1,1],[35,289,12],[36,-1,3],[36,289,6],[37,-1,1],[38,268,37],[57,-1,1],[57,268,12],[58,256,18],[59,256,1],[59,267,37],[59,270,3],[64,250,1],[64,267,7],[65,269,16],[69,267,5],[72,270,9],[73,270,15],[74,-1,1],[74,250,1],[74,267,6],[76,-1,1],[77,278,18],[78,267,29],[79,259,20],[79,271,5],[84,-1,2],[84,280,50],[85,250,5],[86,280,1],[86,294,1],[87,-1,1],[87,250,1],[87,290,103],[88,-1,2],[88,244,34],[89,244,38],[89,267,8],[90,-1,1],[90,250,2],[91,250,3],[93,-1,1],[93,269,25],[93,282,6],[94,250,1],[94,269,40],[95,250,4],[96,244,14],[97,-1,1],[97,269,4],[101,279,16],[107,-1,1],[115,250,2],[116,262,16],[117,-1,1],[117,249,1],[117,292,1],[118,-1,2],[131,261,11],[131,262,45],[133,298,22],[142,269,13],[143,-1,1],[143,279,9],[148,298,125],[151,261,17],[152,261,6],[152,267,1],[152,273,4],[152,274,17],[154,258,15],[154,270,1],[155,250,1],[158,-1,11],[161,256,3],[161,267,2],[165,265,19],[166,265,2],[170,280,3],[171,268,2],[171,280,9],[173,282,134],[174,250,7],[182,-1,1],[184,250,1],[184,285,4],[188,250,2],[188,282,35],[189,-1,1],[189,282,19],[190,-1,1],[190,282,3],[192,-1,1],[194,282,1],[195,282,8],[196,250,7],[196,282,29],[197,282,6],[200,250,1],[201,-1,2],[202,-1,13],[202,250,21],[202,293,1],[203,-1,1],[203,250,1],[203,293,3],[204,210,6],[205,209,4],[206,-1,1],[206,202,31],[206,205,5],[207,202,58],[208,202,3],[208,210,4],[209,-1,1],[209,209,7],[210,250,3],[211,-1,2],[211,250,3],[211,259,4],[211,282,1],[212,250,5],[213,-1,1],[213,250,2],[214,293,1],[215,250,9],[216,-1,1],[216,250,4],[217,250,3],[218,-1,9],[218,250,4],[219,-1,3],[219,250,4],[219,279,1],[220,-1,1],[220,250,4],[220,293,3],[221,250,3],[222,250,4],[222,293,9],[223,-1,1],[223,250,2],[223,293,5],[224,210,4],[225,-1,1],[225,210,6],[226,-1,1],[226,209,3],[226,210,2],[227,207,6],[227,209,2],[227,210,1],[228,-1,1],[229,210,1],[229,223,1],[229,250,3],[230,-1,1],[230,250,1],[231,250,1],[232,250,3],[234,-1,1],[234,201,10],[234,202,11],[235,286,4],[235,293,1],[236,210,2],[236,250,1],[237,-1,1],[238,-1,2],[238,251,1],[238,274,17],[238,275,7],[238,283,44],[239,-1,3],[239,242,11],[239,245,6],[239,250,4],[241,303,1],[242,303,1],[246,-1,3],[246,167,11],[247,121,2],[248,-1,2],[248,167,121],[248,173,1],[248,174,32],[252,-1,1],[252,167,1],[253,-1,1],[254,-1,2],[254,167,4],[255,-1,1],[256,167,1],[257,-1,1],[258,167,4],[259,-1,2],[259,167,2],[260,167,5],[262,167,1],[264,167,6],[265,167,5],[266,167,9],[267,-1,8],[267,167,7],[268,-1,4],[268,167,1],[270,-1,1],[271,-1,1],[273,167,1],[274,-1,1],[274,167,29],[275,167,3],[276,167,4],[278,167,4],[279,167,3],[280,167,8],[281,167,16],[282,167,6],[283,-1,1],[283,167,1],[284,-1,1],[286,-1,2],[286,167,12],[287,-1,3],[288,167,1],[289,167,1],[289,184,2],[290,167,20],[291,-1,8],[291,167,2],[292,167,2],[293,167,17],[294,167,3],[297,-1,1],[297,167,8],[298,-1,1],[298,167,5],[299,167,6],[300,-1,2],[300,167,6],[301,167,3],[302,-1,3],[302,167,2],[303,167,3],[305,-1,4],[306,-1,7],[307,-1,16],[307,167,4],[308,-1,1],[309,-1,2],[309,167,6],[310,-1,3],[310,167,1],[311,-1,2],[311,167,2],[312,-1,2],[312,167,1],[313,167,9],[314,-1,3],[314,167,1],[315,-1,1],[315,167,1],[316,167,4],[317,-1,2],[317,167,1],[318,107,2],[318,167,1],[320,167,9],[321,167,3],[322,167,6],[323,167,1],[324,-1,3],[324,119,34],[324,120,10],[324,129,21],[325,120,6],[325,127,44],[328,-1,2],[328,167,3],[330,167,7],[331,-1,5],[331,167,2],[333,-1,7],[333,167,5],[335,167,8],[336,167,21],[337,167,15],[338,167,2],[339,-1,6],[339,167,1],[340,167,1],[342,167,5],[343,-1,1],[343,167,4],[344,-1,6],[345,-1,6],[345,167,2],[345,174,14],[346,167,5],[347,-1,7],[347,92,3],[347,93,2],[347,167,3],[348,-1,1],[348,250,1],[349,210,3],[349,282,8],[349,292,31],[352,274,1],[352,282,20],[354,262,1],[354,284,1],[355,-1,5],[355,250,1],[355,262,30],[355,293,3],[356,-1,2],[356,254,8],[356,262,17],[357,263,1],[357,272,1],[358,255,5],[358,263,10],[358,293,1],[358,304,3],[358,305,4],[359,250,1],[359,283,1],[360,250,1],[361,-1,1],[361,250,1],[364,250,2],[365,252,5],[366,-1,3],[366,250,3],[366,271,1],[367,-1,1],[367,250,4],[367,259,1],[367,271,4],[367,279,2],[367,280,4],[369,280,5],[370,-1,2],[370,209,1],[371,-1,11],[371,210,18],[372,-1,4],[372,210,18],[372,214,1],[374,209,25],[374,210,1],[375,-1,2],[375,269,2],[375,279,8],[376,279,2],[377,-1,1],[377,250,11],[377,293,4],[378,262,1],[378,293,8],[379,-1,21],[379,291,5],[379,292,2],[380,-1,25],[381,-1,2],[381,167,2],[382,119,11],[383,167,3],[384,-1,1],[384,167,3],[385,-1,1],[385,167,1],[386,167,1],[387,-1,1],[388,-1,3],[388,167,3],[391,-1,2],[391,167,1],[392,167,3],[393,167,5],[395,-1,1],[396,-1,1],[397,-1,3],[397,167,1],[398,-1,3],[398,167,6],[398,174,3],[399,-1,1],[400,-1,2],[400,105,205],[400,119,12],[401,167,3],[401,174,3],[402,-1,6],[402,174,1],[403,-1,1],[403,167,8],[404,167,4],[405,-1,1],[405,167,5],[406,-1,3],[406,167,8],[409,174,14],[410,167,3],[411,-1,1],[411,167,4],[412,-1,2],[413,-1,4],[413,167,1],[414,-1,4],[414,119,9],[414,120,7],[414,121,7],[414,167,2],[415,105,23],[415,112,12],[415,117,39],[415,120,4],[416,-1,1],[416,120,10],[417,-1,1],[417,123,4],[418,167,4],[419,-1,8],[419,167,7],[420,-1,3],[420,167,1],[421,167,3],[422,-1,19],[422,99,80],[422,100,122],[424,167,1],[424,184,2],[425,-1,4],[425,167,2],[426,-1,4],[426,167,4],[427,-1,2],[427,167,12],[427,168,1],[428,-1,2],[428,167,13],[429,-1,15],[429,167,25],[430,167,12],[430,168,5],[430,173,18],[430,181,2],[430,182,1],[430,183,39],[431,167,2],[432,-1,5],[432,167,5],[433,-1,3],[433,167,7],[434,-1,1],[434,167,40],[435,-1,3],[435,167,6],[436,-1,1],[436,167,12],[437,-1,142],[437,125,26],[437,126,167],[438,-1,1],[438,167,8],[439,-1,1],[439,167,12],[440,-1,4],[441,-1,10],[441,167,51],[442,-1,3],[442,167,2],[443,-1,2],[443,121,1],[443,159,1],[443,160,13],[443,167,1],[445,-1,10],[445,167,24],[446,-1,6],[446,167,11],[447,-1,4],[450,167,1],[452,-1,1],[452,167,4],[453,-1,1],[453,167,21],[454,-1,9],[454,167,17],[455,167,16],[456,-1,3],[456,167,7],[456,174,1],[456,175,16],[456,185,6],[457,-1,1],[457,167,3],[458,-1,5],[458,167,2],[459,120,2],[460,-1,1],[460,167,3],[461,-1,1],[461,167,7],[462,-1,2],[462,167,2],[463,-1,2],[463,167,9],[463,174,2],[464,-1,2],[464,167,10],[465,167,6],[466,-1,7],[466,167,1],[467,-1,3],[467,126,11],[467,167,6],[468,-1,1],[468,167,12],[469,-1,1],[469,167,7],[470,167,26],[470,173,1],[471,-1,3],[471,167,17],[472,167,2],[473,-1,1],[473,167,1],[474,167,1],[475,-1,53],[475,167,1],[476,-1,2],[476,167,1],[477,167,11],[478,-1,7],[478,167,1],[479,167,21],[480,167,13],[481,-1,1],[481,167,2],[482,-1,2],[482,167,14],[483,-1,2],[483,167,3],[484,-1,2],[484,167,191],[485,-1,2],[485,167,10],[486,-1,6],[486,167,2],[487,167,1],[487,168,4],[488,167,24],[488,174,12],[489,167,6],[490,-1,4],[491,-1,4],[491,167,12],[492,167,4],[493,-1,1],[495,250,7],[496,-1,1],[497,-1,4],[498,-1,1],[498,250,2],[499,-1,33],[499,250,13],[500,-1,1],[501,259,21],[502,-1,8],[502,250,1],[503,293,2],[504,-1,1],[504,292,20],[505,-1,1],[505,292,32],[506,-1,1],[507,212,40],[509,-1,3],[509,282,2],[510,250,1],[510,279,1],[511,-1,7],[511,250,5],[511,293,21],[512,-1,4],[513,250,1],[514,-1,1],[516,250,2],[518,250,1],[518,293,5],[519,262,4],[519,293,1],[520,-1,2],[520,250,1],[520,262,24],[520,263,2],[520,274,2],[521,-1,1],[522,-1,1],[522,0,1],[522,1,6],[522,2,4],[522,3,2],[522,4,10],[522,5,3],[522,6,7],[522,7,2],[522,8,3],[522,9,4],[522,10,3],[522,11,3],[522,12,9],[522,13,1],[522,14,49],[522,15,3],[522,16,30],[522,17,18],[522,18,1],[522,19,1],[522,20,1],[522,195,1],[522,199,1],[522,200,3],[522,203,2],[522,210,2],[523,16,17],[523,21,10],[523,22,8],[523,24,101],[524,-1,3],[524,23,9],[525,209,3],[525,214,1],[526,209,2],[526,210,2],[528,250,1],[530,-1,4],[530,250,1],[530,275,9],[532,-1,1],[532,235,30],[533,235,2],[534,254,2],[536,254,1],[536,259,1],[536,262,1],[536,271,2],[537,-1,2],[537,250,3],[537,273,3],[538,-1,3],[538,214,1],[538,250,1],[541,-1,7],[541,248,15],[541,251,2],[542,-1,2],[542,265,3],[542,279,5],[543,250,1],[543,265,4],[544,-1,1],[545,252,3],[546,-1,2],[546,250,1],[546,280,4],[547,-1,2],[548,-1,2],[548,262,10],[548,274,1],[549,262,31],[549,274,1],[550,-1,1],[550,262,25],[550,292,15],[551,274,2],[551,292,1],[552,-1,3],[552,250,1],[552,282,15],[553,-1,2],[553,250,4],[553,292,1],[555,261,1],[556,262,1],[557,240,1],[557,250,12],[558,-1,2],[558,215,2],[558,240,1],[558,250,1],[559,-1,6],[559,209,15],[560,-1,1],[561,-1,1],[562,-1,5],[562,250,1],[563,-1,2],[563,250,3],[564,-1,2],[564,250,1],[565,250,2],[566,275,2],[567,-1,1],[567,275,3],[568,-1,2],[568,250,11],[568,275,2],[569,-1,4],[569,254,1],[570,-1,2],[571,-1,2],[571,250,2],[572,196,1],[573,-1,8],[573,196,150],[573,197,5],[574,-1,8],[574,198,6],[575,251,7],[576,-1,1],[577,-1,1],[577,208,17],[578,-1,14],[579,-1,2],[579,281,2],[580,-1,4],[580,279,15],[580,292,8],[581,-1,4],[583,263,1],[583,272,2],[584,263,3],[585,-1,4],[586,259,1],[586,282,2],[586,291,2],[587,-1,3],[588,-1,1],[588,124,1],[589,-1,10],[589,261,4],[590,-1,7],[590,261,3],[591,210,10],[592,-1,1],[592,210,1],[593,-1,2],[593,282,2],[594,110,1],[594,209,1],[594,292,1],[595,210,5],[595,215,2],[596,210,3],[596,283,5],[597,-1,2],[597,260,1],[597,290,5],[598,-1,2],[598,280,11],[599,282,1],[600,282,3],[601,262,3],[601,282,13],[602,-1,6],[602,282,4],[602,292,13],[603,-1,1],[603,210,1],[604,209,1],[604,280,1],[605,-1,4],[605,210,9],[605,275,7],[606,-1,14],[606,250,1],[606,275,27],[607,-1,5],[608,167,15],[609,-1,1],[609,167,4],[609,174,1],[610,-1,1],[610,167,5],[611,-1,1],[612,-1,4],[612,128,2],[612,134,14],[612,145,33],[612,167,2],[613,167,7],[614,-1,1],[615,167,1],[615,168,1],[616,-1,1],[616,167,11],[617,-1,5],[617,167,4],[617,176,10],[618,167,4],[619,-1,1],[619,167,4],[620,-1,3],[620,167,7],[621,-1,1],[621,99,44],[621,167,1],[622,167,10],[623,-1,2],[623,167,24],[624,-1,3],[624,167,16],[625,167,6],[625,174,7],[626,-1,9],[626,99,53],[626,109,2],[626,116,9],[627,-1,2],[627,167,4],[628,167,2],[628,174,11],[630,-1,3],[630,250,4],[631,-1,1],[631,263,3],[631,292,2],[632,-1,2],[632,292,22],[633,-1,3],[633,245,1],[633,250,3],[633,274,1],[634,134,4],[634,135,3],[636,-1,3],[636,167,1],[637,-1,1],[637,99,8],[637,167,4],[638,-1,1],[638,167,2],[639,-1,2],[639,167,1],[639,183,3],[640,167,1],[640,184,1],[641,-1,1],[641,167,9],[642,-1,1],[642,167,20],[643,-1,1],[643,167,4],[644,167,10],[645,-1,2],[645,167,4],[646,167,30],[647,167,4],[648,-1,2],[648,109,19],[648,167,5],[648,168,2],[649,-1,3],[649,167,4],[649,175,1],[650,-1,4],[650,167,8],[651,-1,1],[651,167,3],[652,-1,2],[652,167,34],[653,166,1],[653,167,19],[654,-1,7],[654,111,86],[654,167,61],[655,-1,1],[655,120,4],[655,167,2],[656,-1,2],[656,167,1],[656,174,1],[657,-1,3],[657,167,7],[658,174,6],[659,167,17],[660,-1,1],[660,167,9],[661,-1,2],[661,167,1],[661,184,2],[662,-1,2],[662,82,9],[662,83,9],[662,84,1],[662,101,2],[662,167,1],[664,-1,1],[664,167,1],[665,-1,7],[665,167,2],[666,-1,4],[666,167,2],[667,-1,2],[667,167,31],[668,120,3],[668,121,6],[668,124,1],[668,167,14],[669,-1,1],[669,167,3],[670,-1,2],[670,167,4],[671,124,9],[671,167,5],[672,167,5],[673,-1,7],[673,167,7],[673,175,1],[674,-1,1],[674,167,1],[674,175,1],[675,206,2],[676,26,17],[676,31,9],[676,32,58],[676,33,3],[676,69,1],[676,124,1],[676,167,5],[677,-1,3],[677,25,49],[677,27,18],[677,28,73],[677,36,1],[677,121,5],[678,-1,7],[678,167,7],[678,282,1],[679,167,1],[680,-1,5],[680,167,5],[681,-1,9],[681,167,4],[682,-1,23],[682,106,34],[682,120,1],[682,121,8],[682,167,2],[683,-1,5],[683,167,9],[683,174,2],[684,-1,4],[684,167,1],[685,167,17],[685,282,3],[686,117,21],[686,167,4],[687,-1,5],[687,167,3],[688,-1,6],[688,167,13],[688,282,1],[689,-1,9],[689,167,38],[690,-1,2],[690,121,5],[691,167,13],[692,-1,2],[692,167,2],[693,167,12],[694,167,4],[695,167,2],[695,174,13],[696,134,9],[697,-1,1],[698,167,7],[699,-1,2],[699,167,4],[700,-1,1],[700,167,11],[701,-1,4],[701,167,29],[702,167,1],[703,-1,5],[703,167,1],[703,184,4],[704,-1,1],[704,167,4],[705,-1,1],[705,167,1],[706,-1,1],[706,167,4],[707,-1,4],[708,-1,5],[708,167,42],[709,-1,2],[709,167,37],[710,-1,1],[710,167,10],[711,167,1],[711,174,5],[711,185,8],[712,-1,2],[712,124,1],[712,167,1],[713,167,10],[714,167,4],[714,250,1],[715,-1,2],[715,167,2],[715,174,5],[716,-1,1],[716,167,1],[717,-1,3],[718,-1,2],[718,167,9],[718,174,2],[719,167,22],[719,185,3],[720,-1,2],[720,119,33],[720,166,1],[720,167,5],[721,167,5],[722,-1,6],[722,167,2],[723,-1,7],[723,167,8],[724,-1,2],[724,167,1],[725,-1,7],[725,167,39],[726,167,22],[727,-1,4],[728,167,15],[728,174,21],[729,-1,3],[729,167,3],[730,-1,6],[730,167,10],[731,167,16],[732,-1,2],[732,167,12],[733,-1,1],[733,167,4],[734,-1,4],[734,167,6],[735,-1,1],[735,167,3],[736,-1,1],[736,167,2],[737,-1,4],[737,167,4],[738,-1,103],[738,135,5],[738,167,4],[738,190,102],[738,192,24],[739,167,7],[740,-1,2],[740,167,29],[741,167,11],[742,-1,1],[742,166,4],[742,167,17],[743,167,5],[744,-1,5],[744,167,2],[745,-1,2],[745,167,7],[745,188,16],[745,190,125],[745,191,4],[745,192,5],[745,193,1],[746,-1,2],[746,167,9],[747,-1,4],[747,116,10],[747,117,3],[747,118,2],[747,119,1],[747,121,2],[748,167,1],[749,-1,1],[749,76,2],[749,79,3],[749,80,14],[749,132,1],[749,137,1],[749,163,1],[749,167,14],[750,-1,3],[750,70,151],[750,71,12],[750,73,3],[750,80,1],[751,-1,2],[751,74,4],[751,75,2],[751,80,7],[752,-1,1],[752,80,20],[753,-1,2],[753,85,2],[753,167,1],[754,-1,1],[754,167,4],[755,-1,4],[755,167,2],[756,-1,3],[756,167,2],[757,-1,5],[757,167,1],[758,-1,4],[758,167,10],[759,167,2],[759,174,9],[760,-1,2],[760,167,1],[760,185,1],[760,186,46],[761,-1,1],[761,167,21],[762,-1,5],[762,167,7],[763,167,8],[764,-1,1],[764,167,29],[765,-1,2],[765,167,35],[765,184,1],[766,-1,1],[766,167,10],[767,-1,1],[767,167,13],[767,185,2],[768,-1,3],[768,167,15],[769,-1,2],[769,167,7],[769,189,50],[770,-1,1],[770,167,8],[771,-1,14],[771,167,4],[772,-1,5],[772,167,4],[773,-1,5],[773,167,11],[773,168,3],[774,-1,2],[775,-1,4],[775,167,3],[776,-1,2],[776,167,8],[777,167,1],[778,-1,1],[779,-1,1],[780,167,1],[781,-1,2],[781,167,3],[782,-1,1],[782,167,2],[783,167,11],[784,-1,59],[784,108,19],[784,167,13],[786,-1,3],[786,167,17],[787,-1,8],[788,-1,2],[788,108,37],[789,167,1],[790,-1,4],[790,167,14],[790,175,6],[791,-1,1],[791,167,2],[792,-1,1],[792,167,2],[793,-1,2],[793,167,4],[794,-1,10],[794,167,5],[795,155,6],[795,174,5],[796,167,12],[797,167,4],[798,167,6],[799,-1,3],[799,116,2],[800,-1,136],[800,167,1],[801,-1,1],[801,167,11],[802,167,2],[803,167,4],[804,167,9],[805,-1,2],[805,167,6],[806,167,4],[807,-1,1],[807,167,4],[808,-1,3],[808,167,1],[809,-1,3],[809,167,2],[810,167,13],[811,-1,24],[811,167,12],[812,167,1],[812,173,1],[813,-1,1],[813,167,7],[814,-1,3],[814,167,19],[815,-1,2],[815,167,12],[816,-1,3],[816,167,29],[817,-1,1],[817,167,22],[818,-1,1],[818,167,13],[819,-1,2],[819,167,16],[820,-1,3],[820,167,35],[821,167,18],[822,-1,1],[822,167,34],[823,-1,1],[823,167,41],[824,167,33],[825,-1,1],[825,167,7],[826,167,19],[827,167,6],[828,-1,2],[828,167,31],[828,184,6],[829,167,7],[830,-1,2],[830,167,4],[831,167,19],[832,112,2],[832,122,3],[832,167,4],[833,120,1],[833,167,18],[834,-1,1],[834,167,9],[835,167,7],[836,175,9],[837,167,28],[838,-1,3],[838,167,13],[839,-1,1],[839,167,43],[839,175,7],[840,-1,1],[840,99,27],[840,167,3],[841,-1,5],[841,109,4],[841,116,2],[841,167,7],[842,-1,1],[842,167,12],[843,167,35],[845,-1,2],[845,167,1],[846,-1,1],[846,167,25],[846,174,71],[847,-1,2],[847,167,4],[848,-1,1],[848,167,9],[849,-1,1],[849,167,2],[850,120,1],[850,167,21],[851,167,4],[851,173,1],[852,167,2],[853,-1,1],[853,167,14],[854,167,3],[855,-1,1],[855,167,4],[856,-1,3],[856,167,3],[857,167,4],[858,167,6],[859,-1,18],[859,167,9],[860,167,17],[861,167,5],[862,-1,2],[862,167,6],[863,-1,4],[863,167,102],[864,-1,3],[864,167,31],[864,184,1],[865,-1,3],[865,167,11],[866,-1,17],[866,167,3],[867,124,1],[867,167,13],[867,174,25],[868,167,7],[869,167,9],[869,174,34],[870,-1,1],[870,167,16],[870,174,9],[871,-1,4],[871,167,5],[872,-1,2],[872,167,6],[873,-1,5],[873,166,6],[873,167,2],[874,166,4],[874,167,5],[877,167,30],[879,-1,1],[881,-1,2],[881,307,1],[881,308,1],[881,311,1],[881,315,3],[881,316,4],[881,319,8],[882,312,10],[882,313,3],[882,314,2],[882,318,24],[882,319,14],[883,318,2],[884,-1,2],[884,310,11],[884,318,4],[885,317,9],[885,318,4],[886,-1,4],[886,234,1],[886,306,5],[886,309,4],[886,319,1],[887,167,4],[887,174,57],[888,-1,1],[888,166,17],[888,174,4],[889,-1,3],[889,92,1],[889,166,4],[889,320,3],[890,-1,3],[890,250,6],[891,-1,2],[891,250,3],[892,250,1],[893,-1,1],[893,250,2],[893,251,1],[894,-1,1],[894,250,2],[896,-1,1],[896,210,2],[896,258,1],[896,282,2],[897,-1,2],[897,208,62],[898,210,4],[898,211,1],[901,250,7],[902,-1,1],[902,250,1],[902,251,3],[903,250,5],[903,251,1],[903,254,10],[903,281,1],[903,282,1],[904,-1,3],[904,254,8],[904,276,5],[904,299,1],[905,-1,1],[905,287,13],[906,238,6],[906,266,1],[906,276,3],[907,-1,7],[907,53,23],[907,250,1],[908,35,5],[908,40,2],[909,-1,5],[909,41,1],[910,-1,7],[910,254,13],[911,-1,5],[911,273,16],[912,269,1],[912,279,1],[913,-1,1],[913,250,2],[913,263,6],[916,-1,6],[916,221,1],[916,253,1],[916,254,16],[918,210,3],[919,-1,37],[919,250,9],[919,279,2],[919,280,7],[919,282,4],[920,-1,1],[920,245,1],[921,-1,2],[921,166,4],[921,174,19],[922,-1,5],[922,166,1],[923,102,22],[923,127,6],[924,-1,1],[924,102,20],[924,127,3],[924,142,9],[925,-1,10],[925,102,39],[926,-1,2],[926,102,1],[926,120,19],[927,224,4],[927,230,3],[927,231,27],[927,232,2],[927,233,10],[927,237,2],[927,239,61],[927,241,89],[927,300,8],[928,-1,2],[928,288,1],[928,295,1],[928,296,1],[928,300,2],[928,302,1],[929,-1,5],[929,102,32],[929,127,5],[930,-1,1],[930,127,1],[930,146,2],[930,150,42],[930,154,1],[930,166,1],[931,136,32],[932,-1,1],[932,166,2],[933,166,3],[934,166,5],[937,166,3],[939,-1,1],[941,113,5],[941,130,1],[941,144,1],[941,147,1],[941,166,4],[943,-1,3],[944,112,14],[944,157,1],[945,167,1],[946,-1,4],[947,166,12],[948,166,1],[948,167,1],[948,250,5],[949,-1,2],[951,166,1],[952,-1,2],[953,-1,1],[953,166,5],[954,-1,2],[954,166,3],[955,-1,9],[955,158,1],[955,166,3],[958,-1,1],[958,166,1],[958,167,1],[958,213,1],[959,166,1],[960,166,1],[961,-1,1],[961,166,1],[962,-1,5],[962,166,3],[963,-1,10],[963,127,1],[964,-1,1],[964,120,2],[964,121,1],[964,166,7],[965,-1,1],[965,166,1],[966,-1,2],[969,-1,4],[969,184,2],[970,166,2],[971,137,3],[971,148,1],[971,166,6],[973,-1,1],[973,167,1],[974,166,2],[975,-1,1],[976,166,6],[977,166,5],[978,166,9],[980,166,3],[981,-1,1],[982,166,1],[983,-1,3],[983,166,7],[984,-1,3],[984,166,2],[985,166,11],[986,166,3],[987,-1,3],[988,-1,3],[988,166,5],[989,-1,3],[989,166,9],[990,-1,3],[991,166,4],[992,-1,13],[992,166,4],[992,167,2],[993,-1,18],[993,166,2],[993,167,12],[995,166,8],[995,167,2],[996,166,5],[997,166,11],[997,175,3],[998,-1,1],[998,166,3],[999,-1,3],[999,166,21],[1000,166,9],[1001,-1,1],[1001,166,24],[1001,167,5],[1002,166,18],[1002,167,5],[1003,-1,4],[1003,166,57],[1003,167,15],[1003,187,1],[1004,175,10],[1005,-1,1],[1005,166,2],[1007,-1,1],[1007,166,8],[1008,166,3],[1009,-1,1],[1009,138,1],[1010,-1,4],[1010,72,36],[1010,77,10],[1010,78,5],[1010,81,3],[1010,124,16],[1010,166,6],[1011,112,123],[1011,123,2],[1011,124,7],[1012,-1,3],[1013,-1,2],[1013,124,5],[1013,166,2],[1013,167,2],[1014,166,4],[1014,167,10],[1015,167,2],[1016,166,1],[1017,166,10],[1018,166,3],[1018,167,10],[1019,-1,15],[1019,166,12],[1019,167,1],[1019,185,5],[1021,-1,2],[1021,166,14],[1021,167,8],[1022,-1,2],[1022,131,5],[1023,-1,2],[1023,167,4],[1024,-1,2],[1024,113,4],[1024,123,60],[1024,168,4],[1025,-1,7],[1026,166,3],[1027,-1,11],[1027,166,17],[1027,167,16],[1028,-1,1],[1028,166,8],[1028,167,2],[1029,-1,1],[1030,-1,2],[1030,166,2],[1031,-1,1],[1031,167,22],[1032,-1,6],[1032,166,4],[1032,167,1],[1033,-1,1],[1033,166,7],[1034,-1,5],[1034,166,32],[1034,167,1],[1035,-1,2],[1035,166,5],[1036,166,7],[1036,167,13],[1037,-1,2],[1037,166,6],[1038,-1,4],[1038,166,13],[1038,167,6],[1038,301,2],[1039,-1,1],[1039,167,9],[1042,-1,3],[1042,102,33],[1044,119,34],[1044,131,1],[1045,-1,1],[1045,105,4],[1045,124,3],[1045,158,2],[1046,-1,1],[1048,-1,3],[1049,166,3],[1050,167,1],[1051,-1,2],[1051,166,2],[1052,166,1],[1053,-1,1],[1053,166,3],[1053,167,1],[1053,301,2],[1054,167,4],[1055,-1,10],[1055,129,2],[1055,166,19],[1056,-1,2],[1056,166,9],[1057,-1,6],[1057,166,5],[1058,166,11],[1058,167,21],[1059,-1,1],[1059,166,3],[1061,166,10],[1061,167,2],[1062,166,6],[1063,166,4],[1063,167,14],[1063,178,32],[1064,-1,8],[1064,166,5],[1065,-1,3],[1065,166,8],[1065,167,14],[1066,-1,1],[1066,166,4],[1067,-1,6],[1067,166,4],[1069,-1,1],[1069,166,2],[1070,-1,2],[1070,166,2],[1070,167,6],[1071,-1,5],[1071,166,3],[1071,167,2],[1072,166,3],[1073,-1,1],[1073,166,1],[1074,-1,2],[1075,166,5],[1075,167,1],[1076,-1,5],[1076,139,1],[1076,167,8],[1077,89,1],[1077,96,50],[1077,97,1],[1078,-1,1],[1078,96,111],[1078,167,2],[1079,-1,6],[1079,166,4],[1080,166,4],[1080,167,1],[1081,113,3],[1081,114,1],[1081,120,6],[1081,121,5],[1081,166,8],[1081,167,1],[1081,301,4],[1082,-1,2],[1082,167,11],[1083,166,7],[1083,167,3],[1084,166,7],[1084,167,6],[1085,166,12],[1086,-1,2],[1086,166,3],[1086,167,3],[1087,-1,1],[1087,166,9],[1088,166,21],[1088,167,2],[1089,166,4],[1090,124,2],[1091,87,1],[1091,88,1],[1091,90,35],[1091,95,5],[1091,98,1],[1091,124,15],[1092,-1,7],[1093,-1,8],[1093,163,44],[1094,166,1],[1096,-1,2],[1096,166,2],[1097,-1,2],[1097,166,31],[1097,167,8],[1098,-1,4],[1098,143,4],[1098,219,2],[1098,220,66],[1099,220,64],[1100,-1,1],[1100,166,1],[1100,194,2],[1100,218,1],[1100,220,7],[1101,29,3],[1101,30,1],[1101,36,6],[1101,45,15],[1101,46,5],[1101,48,17],[1101,112,2],[1102,-1,3],[1102,26,36],[1102,30,86],[1102,94,1],[1102,166,2],[1103,-1,10],[1104,-1,8],[1104,166,14],[1104,167,2],[1105,-1,3],[1105,103,2],[1105,104,3],[1105,105,9],[1105,121,4],[1105,156,1],[1105,166,2],[1106,166,8],[1106,167,3],[1106,174,19],[1107,166,2],[1108,-1,5],[1108,166,6],[1108,167,4],[1108,174,6],[1109,163,105],[1110,-1,2],[1110,167,7],[1112,167,16],[1112,174,1],[1113,-1,6],[1113,166,1],[1114,-1,3],[1114,166,5],[1115,-1,2],[1116,-1,2],[1116,167,3],[1116,174,3],[1117,167,2],[1118,-1,3],[1118,166,6],[1119,-1,1],[1119,167,3],[1120,166,15],[1121,-1,1],[1121,166,3],[1122,-1,1],[1122,166,1],[1123,166,7],[1123,167,3],[1124,-1,2],[1124,166,18],[1124,167,1],[1125,-1,6],[1125,166,14],[1126,-1,2],[1126,166,1],[1127,-1,7],[1127,166,6],[1128,166,1],[1128,167,1],[1129,166,1],[1129,167,1],[1131,166,12],[1131,167,4],[1133,166,8],[1134,166,19],[1134,167,24],[1135,166,21],[1136,166,4],[1137,-1,1],[1137,166,11],[1138,-1,1],[1138,167,6],[1139,166,11],[1140,-1,1],[1140,166,15],[1140,167,29],[1141,-1,8],[1141,166,35],[1141,167,14],[1142,166,9],[1142,167,13],[1143,166,6],[1143,167,7],[1144,167,5],[1146,-1,2],[1146,166,16],[1147,-1,1],[1147,166,11],[1148,-1,1],[1148,166,3],[1149,166,20],[1149,167,4],[1150,-1,2],[1150,166,3],[1151,166,9],[1152,-1,1],[1152,166,1],[1152,167,20],[1153,-1,6],[1153,166,4],[1153,167,1],[1154,-1,1],[1154,129,19],[1154,166,23],[1155,-1,2],[1155,166,8],[1155,167,2],[1156,166,3],[1157,166,2],[1159,177,2],[1160,-1,2],[1160,166,11],[1160,175,3],[1161,-1,4],[1161,166,4],[1161,167,1],[1162,166,6],[1163,-1,12],[1163,166,1],[1163,167,5],[1164,-1,1],[1164,166,14],[1164,167,2],[1165,-1,1],[1165,188,75],[1166,167,18],[1167,-1,1],[1167,166,1],[1168,166,7],[1168,167,1],[1169,-1,1],[1170,-1,2],[1170,166,13],[1170,167,1],[1171,166,2],[1172,-1,2],[1172,166,38],[1172,173,1],[1173,166,1],[1173,167,4],[1174,-1,1],[1174,166,11],[1176,-1,4],[1176,166,8],[1176,167,4],[1177,167,2],[1178,-1,1],[1178,167,11],[1179,120,2],[1179,127,7],[1179,131,4],[1179,133,24],[1180,-1,7],[1180,120,2],[1182,-1,2],[1182,166,1],[1182,167,3],[1183,166,2],[1184,166,28],[1184,167,6],[1185,166,1],[1185,250,2],[1185,301,1],[1186,-1,14],[1186,166,31],[1186,167,20],[1187,166,6],[1187,167,1],[1188,166,7],[1189,-1,1],[1189,166,15],[1190,167,4],[1191,-1,2],[1191,167,3],[1192,-1,2],[1192,166,18],[1192,167,14],[1193,-1,9],[1193,166,29],[1193,167,21],[1195,166,14],[1195,167,18],[1196,166,2],[1196,167,2],[1197,166,2],[1197,167,4],[1199,-1,2],[1199,167,17],[1199,174,10],[1201,-1,1],[1201,166,3],[1201,167,4],[1202,-1,3],[1202,166,5],[1202,167,21],[1203,-1,5],[1203,167,5],[1204,166,1],[1205,-1,4],[1206,-1,2],[1206,167,7],[1207,167,8],[1209,166,4],[1210,-1,3],[1211,166,2],[1212,-1,1],[1212,166,5],[1213,166,6],[1214,167,10],[1214,185,2],[1215,-1,1],[1216,-1,1],[1216,166,18],[1216,167,8],[1216,177,2],[1217,-1,1],[1217,120,1],[1217,167,1],[1218,-1,2],[1218,166,3],[1218,167,3],[1218,175,3],[1219,-1,3],[1219,166,1],[1219,167,13],[1220,-1,2],[1220,166,7],[1220,167,2],[1220,175,1],[1221,-1,3],[1221,166,3],[1223,166,3],[1224,91,4],[1224,92,12],[1224,166,2],[1225,250,2],[1226,262,9],[1226,282,9],[1227,210,3],[1227,211,4],[1227,282,2],[1228,209,2],[1228,210,3],[1228,250,2],[1229,282,7],[1230,-1,1],[1230,250,4],[1231,251,1],[1233,250,2],[1233,282,1],[1234,-1,1],[1235,250,1],[1236,250,2],[1236,254,1],[1237,-1,2],[1238,-1,1],[1238,250,3],[1239,265,6],[1240,-1,1],[1240,250,6],[1241,-1,1],[1241,226,1],[1241,227,1],[1241,251,1],[1242,-1,2],[1242,250,6],[1243,250,1],[1244,-1,1],[1244,250,1],[1244,274,1],[1245,-1,3],[1245,246,95],[1245,247,5],[1245,251,2],[1246,-1,2],[1246,246,4],[1246,250,2],[1246,254,3],[1247,-1,1],[1247,250,1],[1247,274,3],[1248,275,4],[1249,250,5],[1249,262,1],[1249,274,13],[1250,-1,1],[1250,262,2],[1251,250,6],[1252,-1,4],[1252,250,9],[1253,-1,1],[1253,250,10],[1253,257,5],[1254,-1,5],[1254,257,4],[1255,-1,1],[1255,250,2],[1256,-1,4],[1256,257,2],[1257,251,4],[1258,281,1],[1259,-1,2],[1259,250,4],[1259,254,2],[1260,-1,4],[1260,250,1],[1260,253,9],[1260,261,1],[1261,217,7],[1262,-1,1],[1263,-1,1],[1263,210,1],[1263,215,3],[1264,210,8],[1265,-1,2],[1265,253,2],[1266,-1,1],[1266,204,8],[1266,250,6],[1266,253,6],[1266,275,8],[1267,228,15],[1267,229,14],[1267,236,4],[1268,-1,2],[1268,217,14],[1269,217,7],[1270,-1,1],[1270,250,3],[1270,251,2],[1271,-1,3],[1271,52,1],[1271,58,26],[1271,60,1],[1271,86,1],[1271,222,1],[1271,225,1],[1271,243,1],[1271,250,2],[1271,297,1],[1272,42,21],[1272,49,3],[1272,57,13],[1272,61,32],[1273,34,1],[1273,35,1],[1273,37,29],[1273,38,1],[1273,43,80],[1273,44,1],[1273,49,1],[1273,61,26],[1274,56,1],[1275,-1,11],[1275,34,4],[1275,39,2],[1275,43,58],[1275,49,3],[1276,51,14],[1276,59,2],[1276,250,1],[1276,252,1],[1278,250,2],[1279,-1,3],[1279,250,4],[1280,278,4],[1281,250,6],[1283,250,1],[1283,262,1],[1284,-1,3],[1285,252,9],[1285,278,2],[1286,278,1],[1287,-1,4],[1288,210,5],[1288,216,1],[1288,217,6],[1289,217,1],[1289,277,2],[1290,34,11],[1290,63,2],[1290,65,7],[1290,66,74],[1290,68,32],[1291,42,23],[1291,63,5],[1292,54,3],[1292,61,116],[1293,-1,1],[1293,62,6],[1293,63,1],[1293,65,11],[1293,67,24],[1294,42,3],[1294,47,2],[1294,301,6],[1295,34,48],[1295,64,1],[1296,58,1],[1296,61,64],[1297,64,3],[1297,65,1],[1298,61,34],[1298,64,1],[1299,-1,4],[1299,42,46],[1299,64,3],[1300,-1,1],[1300,42,2],[1300,47,1],[1300,64,1],[1301,-1,3],[1301,34,6],[1301,42,22],[1301,47,10],[1302,34,6],[1302,61,39],[1303,61,27],[1304,61,16],[1304,64,3],[1305,-1,2],[1305,61,35],[1305,62,4],[1305,64,8],[1306,-1,9],[1306,55,5],[1306,62,7],[1307,42,28],[1307,49,11],[1307,50,2],[1307,59,1],[1308,250,2],[1309,282,4],[1310,-1,4],[1310,211,2],[1310,217,1],[1312,250,1],[1313,250,3],[1313,252,15],[1313,261,1],[1316,166,4],[1317,166,1],[1317,167,1],[1319,-1,14],[1320,166,5],[1321,-1,7],[1326,-1,1],[1326,166,1],[1326,167,1],[1327,-1,3],[1327,166,4],[1327,167,6],[1328,-1,2],[1328,131,24],[1328,166,18],[1329,-1,1],[1330,-1,2],[1330,166,1],[1330,167,4],[1331,-1,3],[1331,250,1],[1332,-1,1],[1332,166,2],[1333,166,13],[1333,167,1],[1334,166,1],[1335,-1,1],[1335,166,7],[1335,167,5],[1336,166,4],[1336,167,7],[1336,169,48],[1337,169,12],[1337,170,11],[1338,169,3],[1338,170,11],[1339,169,2],[1339,170,5],[1341,169,5],[1341,170,6],[1342,-1,1],[1342,170,4],[1342,171,24],[1342,172,3],[1343,170,2],[1344,169,3],[1346,-1,1],[1347,172,2],[1348,169,7],[1349,169,4],[1350,-1,1],[1352,169,3],[1353,-1,9],[1353,169,2],[1353,170,3],[1353,292,4],[1354,-1,1],[1354,115,27],[1356,-1,3],[1356,170,8],[1357,169,1],[1361,169,4],[1362,169,3],[1362,170,6],[1363,170,3],[1365,-1,12],[1365,169,1],[1365,170,2],[1366,170,2],[1368,170,2],[1370,169,1],[1372,169,5],[1373,169,6],[1374,169,1],[1375,169,3],[1375,170,1],[1376,169,1],[1377,169,2],[1381,169,2],[1382,-1,2],[1382,128,1],[1382,140,1],[1382,141,1],[1382,149,1],[1382,151,1],[1382,152,1],[1382,153,1],[1382,161,2],[1382,162,1],[1382,164,2],[1382,165,1],[1382,169,3],[1382,172,5],[1383,169,3],[1384,169,15],[1387,169,3],[1388,169,2],[1389,-1,1],[1389,169,7],[1390,169,36],[1390,180,1],[1391,169,8],[1392,169,5],[1392,170,1],[1393,169,8],[1394,169,9],[1396,169,7],[1397,169,1],[1398,169,17],[1399,-1,1],[1399,169,4],[1401,169,20],[1402,169,1],[1403,169,5],[1403,179,1],[1404,169,2],[1405,169,4]],"exact":false};



// Nearby city names and coordinates.
// Data © GeoNames https://www.geonames.org/export/ · CC BY 4.0 https://creativecommons.org/licenses/by/4.0/
const NEARBY_PLACES = [
  ["Agoura Hills, CA",34.13639,-118.77453],
  ["Agoura, CA",34.14306,-118.73787],
  ["Alameda, CA",37.77099,-122.26087],
  ["Albany, CA",37.88687,-122.29775],
  ["Albany, OR",44.63651,-123.10593],
  ["Alhambra, CA",34.09529,-118.12701],
  ["Aliso Viejo, CA",33.56504,-117.72712],
  ["Altadena, CA",34.18973,-118.13118],
  ["Alum Rock, CA",37.36605,-121.82718],
  ["Anaheim, CA",33.83529,-117.9145],
  ["Ansan-si",37.32361,126.82194],
  ["Anyang-si",37.3925,126.92694],
  ["Ara-dong, Jeju",33.46889,126.5275],
  ["Arcadia, CA",34.13973,-118.03534],
  ["Artesia, CA",33.86585,-118.08312],
  ["Asan",36.78361,127.00417],
  ["Ashland, CA",37.69465,-122.11385],
  ["Atwater Village, CA",34.1164,-118.25646],
  ["Aurora, OH",41.31755,-81.34539],
  ["Avocado Heights, CA",34.03612,-117.99118],
  ["Avon Center, OH",41.45976,-82.01959],
  ["Avon Lake, OH",41.50532,-82.0282],
  ["Avon, OH",41.45171,-82.03542],
  ["Azusa, CA",34.13362,-117.90756],
  ["Baldwin Park, CA",34.08529,-117.9609],
  ["Bay Village, OH",41.48477,-81.92208],
  ["Bayview-Hunters Point, CA",37.72855,-122.38107],
  ["Bell Gardens, CA",33.96529,-118.15146],
  ["Bell, CA",33.97751,-118.18702],
  ["Bellflower, CA",33.88168,-118.11701],
  ["Belmont, CA",37.52021,-122.2758],
  ["Benicia, CA",38.04937,-122.15858],
  ["Berea, OH",41.36616,-81.8543],
  ["Berkeley, CA",37.87159,-122.27275],
  ["Beverly Hills, CA",34.07362,-118.40036],
  ["Bostonia, CA",32.813,-116.944],
  ["Boulder City, NV",35.97859,-114.83249],
  ["Boyle Heights, CA",34.0339,-118.20535],
  ["Brea, CA",33.91668,-117.90006],
  ["Brentwood, CA",34.05195,-118.47397],
  ["Broadview Heights, OH",41.31394,-81.68513],
  ["Brook Park, OH",41.39838,-81.80458],
  ["Brunswick, OH",41.23811,-81.8418],
  ["Bucheon-si",37.49889,126.78306],
  ["Buena Park, CA",33.86751,-117.99812],
  ["Burbank, CA",34.18084,-118.30897],
  ["Burlingame, CA",37.5841,-122.36608],
  ["Busan",35.10168,129.03004],
  ["Calabasas, CA",34.15778,-118.63842],
  ["Camarillo, CA",34.21639,-119.0376],
  ["Campbell, CA",37.28717,-121.94996],
  ["Canoga Park, CA",34.20112,-118.59814],
  ["Canyon Country, CA",34.42333,-118.47203],
  ["Carlsbad, CA",33.15809,-117.35059],
  ["Carson, CA",33.83141,-118.28202],
  ["Casa de Oro-Mount Helix, CA",32.76397,-116.96877],
  ["Castaic, CA",34.48888,-118.62287],
  ["Castro Valley, CA",37.6941,-122.08635],
  ["Cerritos, CA",33.85835,-118.06479],
  ["Changwon",35.22806,128.68111],
  ["Chatan, Okinawa",26.30948,127.77024],
  ["Chatsworth, CA",34.25723,-118.6012],
  ["Cheonan",36.8065,127.1522],
  ["Cheongju-si",36.63722,127.48972],
  ["Chinatown, CA",37.7966,-122.40858],
  ["Chinch'on",36.85667,127.44333],
  ["Chino Hills, CA",33.9938,-117.75888],
  ["Chino, CA",34.01223,-117.68894],
  ["Chula Vista, CA",32.64005,-117.0842],
  ["Chuncheon",37.88302,127.7289],
  ["Claremont, CA",34.09668,-117.71978],
  ["Clark-Fulton, OH",41.46402,-81.70979],
  ["Cleveland Heights, OH",41.52005,-81.55624],
  ["Cleveland, OH",41.4995,-81.69541],
  ["Collinwood, OH",41.55838,-81.56929],
  ["Compton, CA",33.89585,-118.22007],
  ["Concord, CA",37.97798,-122.03107],
  ["Corona, CA",33.87529,-117.56644],
  ["Coronado, CA",32.68589,-117.18309],
  ["Corvallis, OR",44.56457,-123.26204],
  ["Costa Mesa, CA",33.64113,-117.91867],
  ["Covina, CA",34.09001,-117.89034],
  ["Cudahy, CA",33.96057,-118.18535],
  ["Culver City, CA",34.02112,-118.39647],
  ["Cupertino, CA",37.323,-122.03218],
  ["Cypress, CA",33.81696,-118.03729],
  ["Daegu",35.87102,128.60121],
  ["Daly City, CA",37.70577,-122.46192],
  ["Dana Point, CA",33.46697,-117.69811],
  ["Danville, CA",37.82159,-121.99996],
  ["Detroit-Shoreway, OH",41.47772,-81.72991],
  ["Diamond Bar, CA",34.02862,-117.81034],
  ["Donghae City",37.54389,129.10694],
  ["Downey, CA",33.94001,-118.13257],
  ["Duarte, CA",34.13945,-117.97729],
  ["Dublin, CA",37.70215,-121.93579],
  ["Durango, CO",37.27528,-107.88007],
  ["East Cleveland, OH",41.53311,-81.57901],
  ["East Los Angeles, CA",34.0239,-118.17202],
  ["East Palo Alto, CA",37.46883,-122.14108],
  ["East Rancho Dominguez, CA",33.89807,-118.19535],
  ["Eastlake, OH",41.65394,-81.45039],
  ["Eastvale, CA",33.96358,-117.56418],
  ["Echo Park, CA",34.07808,-118.26066],
  ["Eisen",35.9675,128.93083],
  ["El Cajon, CA",32.79477,-116.96253],
  ["El Camino Real, CA",33.69662,-117.77668],
  ["El Cerrito, CA",37.91576,-122.31164],
  ["El Monte, CA",34.06862,-118.02757],
  ["El Segundo, CA",33.91918,-118.41647],
  ["Elyria, OH",41.36838,-82.10765],
  ["Encinitas, CA",33.03699,-117.29198],
  ["Encino, CA",34.15917,-118.50119],
  ["Enterprise, NV",36.02525,-115.24194],
  ["Euclid, OH",41.5931,-81.52679],
  ["Fairview Park, OH",41.44144,-81.8643],
  ["Fallbrook, CA",33.37642,-117.25115],
  ["Fillmore, CA",34.39916,-118.91815],
  ["Florence-Graham, CA",33.96772,-118.24438],
  ["Foster City, CA",37.55855,-122.27108],
  ["Fountain Valley, CA",33.70918,-117.95367],
  ["Fremont, CA",37.54827,-121.98857],
  ["Fullerton, CA",33.87029,-117.92534],
  ["Gaigeturi, Jeju",33.46444,126.31833],
  ["Ganghwa-gun",37.74722,126.48556],
  ["Gangneung",37.75266,128.87239],
  ["Gapyeong",37.83101,127.51059],
  ["Garden Grove, CA",33.77391,-117.94145],
  ["Gardena, CA",33.88835,-118.30896],
  ["Garfield Heights, OH",41.417,-81.60596],
  ["Geoje",34.81379,128.70556],
  ["Gijang",35.24417,129.21389],
  ["Gimpo-si",37.62361,126.71417],
  ["Ginowan, Okinawa",26.26265,127.76147],
  ["Glendale, CA",34.14251,-118.25508],
  ["Glendora, CA",34.13612,-117.86534],
  ["Glenville, OH",41.53338,-81.61735],
  ["Goleta, CA",34.43583,-119.82764],
  ["Goseong",34.97631,128.32361],
  ["Goyang-si",37.65639,126.835],
  ["Gumi",36.1136,128.336],
  ["Gunpo",37.3675,126.94694],
  ["Guri-si",37.5986,127.1394],
  ["Gushikawa, Okinawa",26.35937,127.86735],
  ["Gwangju",37.41,127.25722],
  ["Gwangmyeong",37.47722,126.86639],
  ["Gyeongsan-si",35.82333,128.73778],
  ["Hacienda Heights, CA",33.99307,-117.96868],
  ["Hadong",35.068,127.75147],
  ["Hanam",37.54,127.20556],
  ["Hawthorne, CA",33.9164,-118.35257],
  ["Hayang",35.91333,128.82],
  ["Hayward, CA",37.66882,-122.0808],
  ["Henderson, NV",36.0397,-114.98194],
  ["Hercules, CA",38.01714,-122.28858],
  ["Hermosa Beach, CA",33.86224,-118.39952],
  ["Hollywood, CA",34.09834,-118.32674],
  ["Hongch'on",37.6918,127.8857],
  ["Hough, OH",41.512,-81.63652],
  ["Hudson, OH",41.24006,-81.44067],
  ["Huntington Beach, CA",33.6603,-117.99923],
  ["Huntington Park, CA",33.98168,-118.22507],
  ["Hwacheon",38.10705,127.70632],
  ["Hwado",37.6525,127.3075],
  ["Hwaseong-si",37.20682,126.8169],
  ["Hwawon",35.80167,128.50083],
  ["Icheon-si",37.27917,127.4425],
  ["Ido-dong, Jeju",33.49778,126.52722],
  ["Imperial Beach, CA",32.58394,-117.11308],
  ["Incheon",37.45646,126.70515],
  ["Inglewood, CA",33.96168,-118.35313],
  ["Irvine, CA",33.66946,-117.82311],
  ["Ishikawa, Okinawa",26.42333,127.82139],
  ["Isla Vista, CA",34.41333,-119.86097],
  ["Itoman, Okinawa",26.12647,127.66918],
  ["Jeju City",33.50972,126.52194],
  ["Kanegusuku, Okinawa",26.19698,127.72591],
  ["Katsuren-haebaru, Okinawa",26.33294,127.87403],
  ["Kimhae",35.23417,128.88111],
  ["Kishaba, Okinawa",26.30328,127.79396],
  ["Koreatown, CA",34.05779,-118.30091],
  ["Kurye",35.20944,127.46444],
  ["Kyosai",34.85028,128.58861],
  ["La Canada Flintridge, CA",34.19917,-118.18785],
  ["La Crescenta-Montrose, CA",34.23216,-118.23529],
  ["La Habra, CA",33.93196,-117.94617],
  ["La Jolla, CA",32.84727,-117.2742],
  ["La Mesa, CA",32.76783,-117.02308],
  ["La Mirada, CA",33.91724,-118.01201],
  ["La Palma, CA",33.8464,-118.04673],
  ["La Presa, CA",32.70811,-116.99725],
  ["La Puente, CA",34.02001,-117.94951],
  ["La Verne, CA",34.10084,-117.76784],
  ["Ladera Ranch, CA",33.57086,-117.63561],
  ["Lafayette, CA",37.88576,-122.11802],
  ["Laguna Beach, CA",33.54225,-117.78311],
  ["Laguna Hills, CA",33.61252,-117.71283],
  ["Laguna Niguel, CA",33.52253,-117.70755],
  ["Laguna Woods, CA",33.6103,-117.72533],
  ["Lake Forest, CA",33.64697,-117.68922],
  ["Lakeside, CA",32.85727,-116.92225],
  ["Lakewood, CA",33.85363,-118.13396],
  ["Lakewood, OH",41.48199,-81.79819],
  ["Lancaster, CA",34.69804,-118.13674],
  ["Las Vegas, NV",36.17497,-115.13722],
  ["Lawndale, CA",33.88724,-118.35257],
  ["Lebanon, OR",44.53651,-122.90703],
  ["Lemon Grove, CA",32.74255,-117.03142],
  ["Lennox, CA",33.93807,-118.35258],
  ["Lima, OH",40.74255,-84.10523],
  ["Live Oak, CA",36.98356,-121.98052],
  ["Livermore, CA",37.68187,-121.76801],
  ["Lomita, CA",33.79224,-118.31507],
  ["Long Beach, CA",33.76696,-118.18923],
  ["Los Altos, CA",37.38522,-122.11413],
  ["Los Angeles, CA",34.05223,-118.24368],
  ["Los Gatos, CA",37.22661,-121.97468],
  ["Lynwood, CA",33.93029,-118.21146],
  ["Manhattan Beach, CA",33.88474,-118.41091],
  ["Maple Heights, OH",41.41533,-81.56596],
  ["Martinez, CA",38.01937,-122.13413],
  ["Mayfield Heights, OH",41.51922,-81.4579],
  ["Maywood, CA",33.98668,-118.18535],
  ["Menlo Park, CA",37.45383,-122.18219],
  ["Mentor, OH",41.66616,-81.33955],
  ["Mid-City, CA",34.04126,-118.36058],
  ["Middleburg Heights, OH",41.36144,-81.81291],
  ["Millbrae, CA",37.59855,-122.38719],
  ["Milpitas, CA",37.42827,-121.90662],
  ["Mira Mesa, CA",32.9156,-117.14392],
  ["Mission District, CA",37.75993,-122.41914],
  ["Mission Viejo, CA",33.60002,-117.672],
  ["Monrovia, CA",34.14806,-117.99895],
  ["Montebello, CA",34.00946,-118.10535],
  ["Monterey Park, CA",34.06251,-118.12285],
  ["Moorpark, CA",34.28556,-118.88204],
  ["Moraga, CA",37.83493,-122.12969],
  ["Morgan Hill, CA",37.1305,-121.65439],
  ["Mountain View, CA",37.38605,-122.08385],
  ["Munsan",37.85944,126.785],
  ["Murrieta, CA",33.55391,-117.21392],
  ["Nago, Okinawa",26.61502,127.98543],
  ["Naha, Okinawa",26.213,127.67851],
  ["Nakagusuku, Okinawa",26.25,127.78333],
  ["Namyangju",37.63667,127.21417],
  ["Nanjo, Okinawa",26.14447,127.76697],
  ["National City, CA",32.67811,-117.0992],
  ["Newark, CA",37.52966,-122.04024],
  ["Newport Beach, CA",33.61891,-117.92895],
  ["Nishihara, Okinawa",26.25353,127.74352],
  ["Noe Valley, CA",37.75018,-122.43369],
  ["Norco, CA",33.93113,-117.54866],
  ["North Hills, CA",34.23639,-118.48472],
  ["North Hollywood, CA",34.17223,-118.37897],
  ["North Las Vegas, NV",36.19886,-115.1175],
  ["North Olmsted, OH",41.4156,-81.92347],
  ["North Ridgeville, OH",41.38949,-82.01903],
  ["North Royalton, OH",41.31366,-81.72457],
  ["North Tustin, CA",33.76446,-117.79394],
  ["Northridge, CA",34.22834,-118.53675],
  ["Northwood, CA",33.71372,-117.76091],
  ["Norwalk, CA",33.90224,-118.08173],
  ["Oakland, CA",37.80437,-122.2708],
  ["Oceanside, CA",33.19587,-117.37948],
  ["Okinawa",26.33583,127.80139],
  ["Ora-dong, Jeju",33.48194,126.50639],
  ["Orange, CA",33.78779,-117.85311],
  ["Orinda, CA",37.87715,-122.17969],
  ["Osan",37.15222,127.07056],
  ["Oxnard, CA",34.1975,-119.17705],
  ["Pacific Palisades, CA",34.04806,-118.52647],
  ["Pacifica, CA",37.61383,-122.48692],
  ["Painesville, OH",41.72449,-81.24566],
  ["Paju",37.761,126.77272],
  ["Palmdale, CA",34.57943,-118.11646],
  ["Palo Alto, CA",37.44188,-122.14302],
  ["Paradise, NV",36.09719,-115.14666],
  ["Paramount, CA",33.88946,-118.15979],
  ["Parkside, CA",37.74197,-122.4863],
  ["Parma Heights, OH",41.39005,-81.75958],
  ["Parma, OH",41.40477,-81.72291],
  ["Pasadena, CA",34.14778,-118.14452],
  ["Pico Rivera, CA",33.98307,-118.09673],
  ["Pinole, CA",38.00437,-122.29886],
  ["Placentia, CA",33.87224,-117.87034],
  ["Pleasant Hill, CA",37.94798,-122.0608],
  ["Pleasanton, CA",37.66243,-121.87468],
  ["Pomona, CA",34.05529,-117.75228],
  ["Port Hueneme, CA",34.14778,-119.19511],
  ["Poway, CA",32.96282,-117.03586],
  ["Pubal",37.29167,127.50778],
  ["Pyeongtaek",36.99472,127.08889],
  ["Rancho Palos Verdes, CA",33.74446,-118.38702],
  ["Rancho Penasquitos, CA",32.95949,-117.11531],
  ["Rancho San Diego, CA",32.74727,-116.9353],
  ["Rancho Santa Margarita, CA",33.64086,-117.6031],
  ["Redondo Beach, CA",33.84918,-118.38841],
  ["Redwood City, CA",37.48522,-122.23635],
  ["Reseda, CA",34.20112,-118.53647],
  ["Richmond, CA",37.93576,-122.34775],
  ["Rocky River, OH",41.4756,-81.8393],
  ["Rosamond, CA",34.86414,-118.16341],
  ["Rosemead, CA",34.08057,-118.07285],
  ["Rowland Heights, CA",33.97612,-117.90534],
  ["San Bruno, CA",37.63049,-122.41108],
  ["San Carlos, CA",37.50716,-122.26052],
  ["San Clemente, CA",33.42697,-117.61199],
  ["San Diego, CA",32.71571,-117.16472],
  ["San Dimas, CA",34.10668,-117.80673],
  ["San Fernando, CA",34.28195,-118.43897],
  ["San Francisco, CA",37.77493,-122.41942],
  ["San Gabriel, CA",34.09611,-118.10583],
  ["San Jose, CA",37.33939,-121.89496],
  ["San Juan Capistrano, CA",33.50169,-117.66255],
  ["San Leandro, CA",37.72493,-122.15608],
  ["San Lorenzo, CA",37.67412,-122.13321],
  ["San Marcos, CA",33.14337,-117.16614],
  ["San Mateo, CA",37.56299,-122.32553],
  ["San Pablo, CA",37.96215,-122.34553],
  ["San Pedro, CA",33.73585,-118.29229],
  ["San Rafael, CA",37.97353,-122.53109],
  ["San Ramon, CA",37.77993,-121.97802],
  ["Santa Ana, CA",33.74557,-117.86783],
  ["Santa Barbara, CA",34.42083,-119.69819],
  ["Santa Clara, CA",37.35411,-121.95524],
  ["Santa Clarita, CA",34.39166,-118.54259],
  ["Santa Cruz, CA",36.97412,-122.0308],
  ["Santa Fe Springs, CA",33.94724,-118.08535],
  ["Santa Monica, CA",34.01949,-118.49138],
  ["Santa Paula, CA",34.35417,-119.05927],
  ["Santee, CA",32.83838,-116.97392],
  ["Santyoku",37.44056,129.17083],
  ["Saratoga, CA",37.26383,-122.02301],
  ["Sawtelle, CA",34.0363,-118.44949],
  ["Seal Beach, CA",33.74141,-118.10479],
  ["Sedalia, MO",38.70446,-93.22826],
  ["Sejong",36.59245,127.29223],
  ["Seodong, Jeju",33.48443,126.49252],
  ["Seogwipo, Jeju",33.25333,126.56181],
  ["Seonghwan",36.91556,127.13139],
  ["Seongnam-si",37.43861,127.13778],
  ["Seosan",36.78167,126.45222],
  ["Seoul",37.566,126.9784],
  ["Shaker Heights, OH",41.47394,-81.53707],
  ["Sherman Oaks, CA",34.15112,-118.44925],
  ["Siheungdong",37.45177,126.91079],
  ["Silver Lake, CA",34.08668,-118.27023],
  ["Simi Valley, CA",34.26945,-118.78148],
  ["Sinhyeon",34.8825,128.62667],
  ["Solon, OH",41.38978,-81.44123],
  ["South El Monte, CA",34.05195,-118.04673],
  ["South Euclid, OH",41.52311,-81.51846],
  ["South Gate, CA",33.95474,-118.21202],
  ["South Pasadena, CA",34.11612,-118.15035],
  ["South San Francisco, CA",37.65466,-122.40775],
  ["South San Jose Hills, CA",34.01279,-117.90478],
  ["South Whittier, CA",33.95015,-118.03917],
  ["Spring Valley, CA",32.74477,-116.99892],
  ["Spring Valley, NV",36.10803,-115.245],
  ["Stanton, CA",33.80252,-117.99312],
  ["Stevenson Ranch, CA",34.39048,-118.57372],
  ["Stonegate, CA",33.70534,-117.74009],
  ["Streetsboro, OH",41.23922,-81.34594],
  ["Strongsville, OH",41.3145,-81.83569],
  ["Studio City, CA",34.14862,-118.39647],
  ["Summerlin South, NV",36.11708,-115.33001],
  ["Sunland, CA",34.26695,-118.3023],
  ["Sunnyvale, CA",37.36883,-122.03635],
  ["Sunrise Manor, NV",36.21108,-115.07306],
  ["Suwon",37.27818,127.03164],
  ["Sylmar, CA",34.30778,-118.44925],
  ["T'aebaek",37.1759,128.9889],
  ["Taesal-li",36.9714,126.4542],
  ["Tallang-dong, Jeju",33.49028,126.47528],
  ["Tangjin",36.89444,126.62972],
  ["Temecula, CA",33.49364,-117.14836],
  ["Temple City, CA",34.10723,-118.05785],
  ["Thousand Oaks, CA",34.17056,-118.83759],
  ["Tijuana",32.5027,-117.00371],
  ["Tomigusuku, Okinawa",26.18583,127.68192],
  ["Tongyeong",34.84957,128.42779],
  ["Torrance, CA",33.83585,-118.34063],
  ["Tsuha, Okinawa",26.65753,128.09412],
  ["Tujunga, CA",34.25223,-118.28841],
  ["Tustin Legacy, CA",33.70006,-117.82588],
  ["Tustin, CA",33.74585,-117.82617],
  ["Twinsburg, OH",41.31256,-81.44011],
  ["UC Irvine, CA",33.63967,-117.84164],
  ["Uijeongbu-si",37.7415,127.0474],
  ["Uiwang",37.36528,126.94778],
  ["Ungsang",35.40611,129.16861],
  ["Union City, CA",37.59577,-122.01913],
  ["Universal City, CA",34.1389,-118.35341],
  ["Urasoe, Okinawa",26.25902,127.73012],
  ["Uruma, Okinawa",26.37609,127.85908],
  ["Valencia, CA",34.44361,-118.60953],
  ["Valinda, CA",34.04529,-117.94367],
  ["Valley Glen, CA",34.18568,-118.42032],
  ["Van Nuys, CA",34.18667,-118.44897],
  ["Venice, CA",33.99084,-118.46008],
  ["Ventura, CA",34.27834,-119.29317],
  ["Vermont Square, CA",34.00204,-118.29896],
  ["Vincent, CA",34.09836,-117.92383],
  ["Vincent, CA",34.50055,-118.11646],
  ["Visitacion Valley, CA",37.71715,-122.40433],
  ["Vista, CA",33.20004,-117.24254],
  ["Wabu",37.58972,127.22028],
  ["Waegwan",35.99251,128.39785],
  ["Walnut Creek, CA",37.90631,-122.06496],
  ["Walnut Park, CA",33.96807,-118.22507],
  ["Walnut, CA",34.02029,-117.86534],
  ["Warrensburg, MO",38.76279,-93.73605],
  ["West Carson, CA",33.82168,-118.29257],
  ["West Covina, CA",34.06862,-117.93895],
  ["West Hills, CA",34.19731,-118.64398],
  ["West Hollywood, CA",34.09001,-118.36174],
  ["West Puente Valley, CA",34.05168,-117.9684],
  ["West Whittier-Los Nietos, CA",33.976,-118.06909],
  ["Westlake, OH",41.45532,-81.91792],
  ["Westminster, CA",33.75918,-118.00673],
  ["Westmont, CA",33.9414,-118.3023],
  ["Westpark, CA",33.68527,-117.81371],
  ["Whitney, NV",36.09831,-115.0363],
  ["Whittier, CA",33.97918,-118.03284],
  ["Willoughby, OH",41.63977,-81.4065],
  ["Willowbrook, CA",33.91696,-118.25507],
  ["Wilmington, CA",33.78002,-118.26257],
  ["Winchester, NV",36.12997,-115.11889],
  ["Winnetka, CA",34.21334,-118.57203],
  ["Winter Gardens, CA",32.83116,-116.93336],
  ["Woodbridge, CA",33.67724,-117.79442],
  ["Woodland Hills, CA",34.16834,-118.60592],
  ["Yaese, Okinawa",26.12733,127.7432],
  ["Yanggu",38.10583,127.98944],
  ["Yangju",37.83311,127.06169],
  ["Yangp'yong",37.48972,127.49056],
  ["Yangsan",35.34199,129.03358],
  ["Yomitan, Okinawa",26.40167,127.74503],
  ["Yonabaru, Okinawa",26.20437,127.75267],
  ["Yorba Linda, CA",33.88863,-117.81311]
];
