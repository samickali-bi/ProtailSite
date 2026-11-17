import {smooth} from './installation-timeline.js';
import {drawClippedBase} from './floating-scene.js';
import {PEOPLE_SCALE,PERSON_HEIGHT,technicalRooms,safeFoot,blockedFloor,installationFeet,stockingFeet,customerPaths,queueFeet,campaignQueueFeet,cashierStations,pathPoint} from './scene-layout.js';

const root=import.meta.env.BASE_URL+'installation/registered/';
// Register the small drain line to the bottom of the excavated trench, including
// the two well connections. This transforms only the independent pipe sprite.
const drainOffsets=[[220,9],[365,-7],[550,-22],[1050,-8],[1400,-9],[1440,-14],[1580,-11]];
function drainOffset(x){let i=1;while(i<drainOffsets.length-1&&x>drainOffsets[i][0])i++;const a=drainOffsets[i-1],b=drainOffsets[i],t=Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*t}
export const installationParts={3:'underground',4:'pipes',5:'ducts',6:'electric',7:'network',8:'coldrooms',9:'protein',10:'produce',11:'shelves',12:'fridges',13:'checkout',14:'stocked-shelves',15:'fresh-stock',16:'staff',17:'opening',18:'campaign'};
const definitions=[
 {name:'underground',file:'underground-thin-v3',phase:3,end:3,z:5},
 {name:'pipes',phase:4,z:10},
 {name:'electric',phase:6,z:15},
 {name:'ducts',phase:5,z:20},
 {name:'network',phase:7,z:30},
 {name:'room-fronts',file:'room-fronts-v3',phase:7,z:32,start:.74,duration:.22},
 {name:'warehouse-stock',phase:14,z:31},
 {name:'coldrooms',phase:8,z:35},
 {name:'protein',phase:9,z:40,target:[105,210,440,280]},
 {name:'fridges',phase:12,z:45},
 {name:'shelves',phase:11,z:50},
 {name:'stocked-shelves',phase:14,z:51,match:'shelves'},
 {name:'filled-fridges',phase:15,z:46,match:'fridges'},
 {name:'filled-protein',phase:15,z:41,match:'protein'},
 {name:'produce',file:'produce-empty-v3',phase:10,z:60,target:[1080,330,470,310]},
 {name:'filled-produce',file:'produce-filled-v3',phase:15,z:61,match:'produce'},
 {name:'checkout',phase:13,z:70},
 {name:'decor-plants',file:'decor-plants-v3',phase:16,z:75},
 {name:'canopy-greenery',file:'canopy-greenery-v3',phase:16,z:76,placementFrom:'produce'}
];
const names={4:'لوله‌ها و شبکهٔ اطفا',5:'کانال‌ها و هواسازها',6:'روشنایی و سینی کابل',7:'شبکه، تابلو برق و قفسهٔ انبار',8:'سردخانه‌ها',9:'غرفهٔ گوشت و مرغ',10:'استند و سایبان میوه',11:'قفسه‌ها، سرلاین و مخازن فله',12:'یخچال‌ها و جزیرهٔ سرد',13:'صندوق‌ها و چرخ‌های خرید',14:'کالاهای خشک و چیدمان قفسه',15:'میوه، پروتئین و محصولات سرد',16:'آماده‌سازی تیم فروشگاه',17:'ورود اولین مشتری‌ها'};

// Find separate silhouettes in the generated alpha layers. No pixels of the room
// are ever used as sprites. Each connected equipment silhouette keeps its camera.
function silhouettes(image){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,image.width,image.height),data=pixels.data;
 const w=image.width,h=image.height,count=w*h,labels=new Int32Array(count),queue=new Int32Array(count),groups=[];
 let transparent=0;for(let i=3;i<data.length;i+=4)if(data[i]===0)transparent++;
 if(transparent<count*.05)throw Error('Equipment layer must have genuine alpha: '+image.src);
 for(let seed=0;seed<count;seed++){
  if(labels[seed]||data[seed*4+3]<160)continue;
  const label=groups.length+1;let head=0,tail=1,l=w,t=h,r=0,b=0;queue[0]=seed;labels[seed]=label;
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
   const visit=n=>{if(!labels[n]&&data[n*4+3]>=160){labels[n]=label;queue[tail++]=n}};
   if(x)visit(p-1);if(x<w-1)visit(p+1);if(y)visit(p-w);if(y<h-1)visit(p+w);
  }
  groups.push({label,l,t,r,b,area:tail});
 }
 const main=groups.filter(g=>g.area>=180);
 if(!main.length)throw Error('Empty equipment layer: '+image.src);
 // Attach fine disconnected hangers, handles and anti-aliased marks to their item.
 const assignment=new Map(main.map((g,i)=>[g.label,i]));
 for(const g of groups)if(!assignment.has(g.label)){
  let best=0,distance=Infinity;main.forEach((m,i)=>{const dx=Math.max(m.l-g.r,g.l-m.r,0),dy=Math.max(m.t-g.b,g.t-m.b,0),d=dx*dx+dy*dy;if(d<distance){best=i;distance=d}});assignment.set(g.label,best);
  const m=main[best];m.l=Math.min(m.l,g.l);m.t=Math.min(m.t,g.t);m.r=Math.max(m.r,g.r);m.b=Math.max(m.b,g.b);
 }
 // Low-alpha shadows must not join neighboring fixtures into one animation.
 // Attach their original pixels back to the nearest opaque equipment core.
 for(let p=0;p<count;p++)if(!labels[p]&&data[p*4+3]>=8){
  const x=p%w,y=Math.floor(p/w);let best=0,distance=Infinity;
  main.forEach((m,i)=>{const dx=Math.max(m.l-x,x-m.r,0),dy=Math.max(m.t-y,y-m.b,0),center=(x-(m.l+m.r)/2)**2+(y-(m.t+m.b)/2)**2,d=dx*dx+dy*dy+center*.00001;if(d<distance){best=i;distance=d}});
  const m=main[best];labels[p]=m.label;
 }
 for(let p=0;p<count;p++)if(labels[p]){const m=main[assignment.get(labels[p])],x=p%w,y=Math.floor(p/w);m.l=Math.min(m.l,x);m.r=Math.max(m.r,x);m.t=Math.min(m.t,y);m.b=Math.max(m.b,y)}
 const parts=main.map(g=>{const surface=document.createElement('canvas');surface.width=g.r-g.l+1;surface.height=g.b-g.t+1;return {...g,x:g.l,y:g.t,w:surface.width,h:surface.height,surface,pixels:new ImageData(surface.width,surface.height)}});
 for(let p=0;p<count;p++){if(!labels[p])continue;const part=parts[assignment.get(labels[p])],x=p%w-part.x,y=Math.floor(p/w)-part.y,o=(y*part.w+x)*4;part.pixels.data.set(data.subarray(p*4,p*4+4),o)}
 for(const part of parts){part.surface.getContext('2d').putImageData(part.pixels,0,0);delete part.pixels}
 return {parts:parts.sort((a,b)=>a.y-b.y||a.x-b.x),transparent:transparent/count};
}
const bounds=parts=>{const x=Math.min(...parts.map(p=>p.x)),y=Math.min(...parts.map(p=>p.y));return [x,y,Math.max(...parts.map(p=>p.x+p.w))-x,Math.max(...parts.map(p=>p.y+p.h))-y]};

// In the master painting, shadows and touching endcaps connect the gondolas.
// Their aisle axes separate these equipment-only pixels into six rows and three
// display units, without cutting any rectangle out of the architectural scene.
function shelfSilhouettes(image){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);
 const {data}=cx.getImageData(0,0,c.width,c.height),labels=new Int8Array(c.width*c.height).fill(-1);
 const axes=[[630,410,757,327],[719,435,848,333],[808,457,939,344],[898,478,1038,355],[993,498,1139,370],[1103,515,1230,388]];
 const groups=Array.from({length:9},()=>({l:c.width,t:c.height,r:0,b:0,area:0}));let transparent=0;
 const distance=(x,y,[ax,ay,bx,by])=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));return (x-ax-t*dx)**2+(y-ay-t*dy)**2};
 for(let p=0;p<labels.length;p++){
  if(data[p*4+3]<8){transparent++;continue}const x=p%c.width,y=Math.floor(p/c.width);
  // The freezer belongs to the refrigeration chapter and has its own drawing.
  if(x<705&&y<410&&y<641-x*.40)continue;
  let label;
  if(y>=437&&x<638)label=6;
  else if(y>=432&&x>=638&&x<=825)label=7;
  else if(y>=487&&x>825&&x<=986)label=8;
  else{let best=Infinity;axes.forEach((axis,i)=>{const d=distance(x,y,axis);if(d<best){best=d;label=i}})}
  labels[p]=label;const g=groups[label];g.l=Math.min(g.l,x);g.r=Math.max(g.r,x);g.t=Math.min(g.t,y);g.b=Math.max(g.b,y);g.area++;
 }
 const parts=groups.map(g=>{const surface=document.createElement('canvas');surface.width=Math.max(1,g.r-g.l+1);surface.height=Math.max(1,g.b-g.t+1);return {...g,x:g.l,y:g.t,w:surface.width,h:surface.height,surface,pixels:new ImageData(surface.width,surface.height)}});
 for(let p=0;p<labels.length;p++)if(labels[p]>=0){const part=parts[labels[p]],x=p%c.width-part.x,y=Math.floor(p/c.width)-part.y;part.pixels.data.set(data.subarray(p*4,p*4+4),(y*part.w+x)*4)}
 for(const part of parts){part.surface.getContext('2d').putImageData(part.pixels,0,0);delete part.pixels}
 return {parts:parts.filter(p=>p.area>0),transparent:transparent/labels.length};
}

export function frontInstallation(stack,onReady){
 const canvas=document.createElement('canvas');canvas.id='front-installation';canvas.hidden=true;canvas.setAttribute('aria-hidden','true');stack.insertBefore(canvas,document.querySelector('#frame-next'));
 const ctx=canvas.getContext('2d'),layers=new Map(),sprites=new Map(),state={ready:false,errors:[],layers:[],peopleScale:PEOPLE_SCALE};
 const detail=document.createElement('div');detail.id='installation-detail';detail.hidden=true;
 detail.innerHTML='<p id="installation-action"></p><div class="installation-steps"><span>تجهیزات خالی</span><span>جانمایی و نصب</span><span>مرچندایزینگ</span></div>';document.querySelector('#role-note').after(detail);
 let preloadJob;
 function preload(){return preloadJob??=(async()=>{
  const load=async file=>{const image=new Image();image.src=root+file+'.webp';await image.decode();return image};
  try{[state.roughBase,state.floorBase]=await Promise.all([load('ground-rough-v3'),load('base-v3')])}catch(e){state.errors.push(String(e))}
  for(const def of definitions){
   try{const image=await load(def.file||def.name);
    const matched=def.match&&layers.get(def.match);
    let drawing=image;
    if(matched){
     // Stock can change only pixels inside the installed fixture silhouette.
     // The original equipment remains drawn beneath it at identical coordinates.
     const surface=document.createElement('canvas');surface.width=1672;surface.height=941;
     const context=surface.getContext('2d');context.drawImage(image,0,0);context.globalCompositeOperation='destination-in';context.drawImage(matched.image,0,0);drawing=surface;
    }
    const result=def.name==='shelves'||def.name==='stocked-shelves'?shelfSilhouettes(drawing):silhouettes(drawing);
    const placement=matched||(def.placementFrom&&layers.get(def.placementFrom));
    const source=placement?.source||bounds(result.parts),target=placement?.target||def.target||source;
    const layer={...def,...result,source,target,image};
    if(def.people){
     // Human height stays proportional to the original store, not catalog scale.
     layer.parts=layer.parts.map(p=>({...p}));
    }
    layers.set(def.name,layer);state.layers.push({name:def.name,phase:def.phase,parts:result.parts.length,transparent:result.transparent});
   }catch(e){state.errors.push(String(e))}
  }
  for(const file of ['detergent-podium-v5','cashier-woman-v5','cashier-man-v5','plumber-v4','duct-ladder-v4','duct-helper-v4','technician-v4','electrician-v4','assembler-v4','shelf-fitter-v4','cold-fitter-v4','stock-crate-v4','stock-unpack-v4','shopper-woman-v4','shopper-man-v4','server-rack-v4','installer-drill-v3','installer-kneel-v3','worker-carton-v3','worker-stock-v3','shopper-basket-v3','shopper-trolley-v3','balloon-arch-v3','campaign-stand-v3','campaign-dangler-v3']){
   try{const image=await load(file),c=document.createElement('canvas');c.width=image.width;c.height=image.height;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);const {data}=cx.getImageData(0,0,c.width,c.height);let l=c.width,t=c.height,r=0,b=0;
    for(let p=0;p<c.width*c.height;p++)if(data[p*4+3]>=8){const x=p%c.width,y=Math.floor(p/c.width);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
    sprites.set(file,{image,source:[l,t,r-l+1,b-t+1]});
   }catch(e){state.errors.push(String(e))}
  }
  state.ready=state.errors.length===0;onReady();
 })()}
 function render(phase,local,reduced){
  const active=phase>=3;canvas.hidden=!active;detail.hidden=!active||phase===3||phase>17;if(!active)return null;
  const width=stack.clientWidth,height=stack.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr)}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  const scale=Math.min(width/1672,height/941),ox=(width-1672*scale)/2,oy=(height-941*scale)/2,draw=[];
  const floorCover=phase===3?(reduced?1:smooth(.56,1,local)):phase>3?1:0;
  if(phase===3&&state.floorBase){ctx.globalAlpha=floorCover;drawClippedBase(ctx,state.floorBase,phase,ox,oy,scale);ctx.globalAlpha=1}
  for(const layer of [...layers.values()].sort((a,b)=>a.z-b.z)){
   if(layer.phase>phase||(layer.end&&phase>layer.end))continue;
   const [sx,sy,sw,sh]=layer.source,[tx,ty,tw,th]=layer.target;
   layer.parts.forEach((part,index)=>{
    const start=layer.start??index/Math.max(1,layer.parts.length)*.64;
    const finish=layer.name==='underground'?.56:layer.name==='network'?.74:1;
    const progress=reduced||layer.phase<phase?1:smooth(start,finish,local);
    if(progress===0)return;
    let x=tx+(part.x-sx)/sw*tw,y=ty+(part.y-sy)/sh*th,w=part.w/sw*tw,h=part.h/sh*th;
    let room=null;
    if(layer.name==='network'&&part.x>=600){
     room=part.x<800?'server':'electrical';[x,y,w,h]=technicalRooms[room];
    }
    const offset=layer.phase<14?(1-progress)*(layer.phase<=6?15:7):0;
    const opacity=progress*(layer.name==='underground'?1-floorCover:1);
    if(opacity===0)return;
    let depth=y+h+layer.z*.0001;
    if(layer.name==='underground')depth=1;
    if(layer.match){const parent=layers.get(layer.match),parentPart=parent.parts[index];if(parentPart)depth=parent.target[1]+(parentPart.y+parentPart.h-parent.source[1])/parent.source[3]*parent.target[3]+layer.z*.0001}
    if(layer.placementFrom)depth=layers.get(layer.placementFrom).target[1]+layers.get(layer.placementFrom).target[3]+.01;
    draw.push({asset:layer.name,chapter:layer.phase,index,x,y,w,h,progress,opacity,offset,depth,room,kind:layer.name.includes('greenery')||layer.name==='decor-plants'?'decor':layer.name==='room-fronts'?'wall':'equipment',surface:part.surface,sprite:room==='server'?sprites.get('server-rack-v4'):null});
   });
  }
  function person(asset,anchor,role,opacity=1,height=PERSON_HEIGHT,index=0,task=null){
   const sprite=sprites.get(asset);if(!sprite||opacity<=0)return;
   const foot=role==='cashier'?anchor:safeFoot(anchor,phase,asset.includes('trolley')||asset==='shopper-man-v4'?14:7,draw.filter(p=>p.kind==='person').map(p=>p.foot)),w=sprite.source[2]/sprite.source[3]*height;
   let depth=foot[1]+.05;
   // The long butcher counter recedes diagonally: its leftmost front is deeper
   // than its right-hand end. Use its local floor edge, not the whole image's
   // bottom, when a person is standing in front of the right-hand counter.
   if(phase>=9&&foot[0]>100&&foot[0]<565&&foot[1]>496-(foot[0]-130)*.34+8)depth=Math.max(depth,490.06);
   draw.push({asset,chapter:phase,index,kind:'person',role,task,foot,x:foot[0]-w/2,y:foot[1]-height,w,h:height,progress:1,opacity,offset:0,depth,standingHeight:PERSON_HEIGHT,peopleScale:PEOPLE_SCALE,onFixture:blockedFloor(foot,phase,asset.includes('trolley')||asset==='shopper-man-v4'?14:7),sprite});
  }
  const workerOpacity=reduced?1:smooth(.02,.14,local)*(1-smooth(.85,.98,local));
  const crew={
   3:[['plumber-v4',.62,'join-floor-drain'],['installer-kneel-v3',.64,'tighten-floor-pipe'],['assembler-v4',.84,'fit-well-connection']],
   4:[['duct-ladder-v4',1.75,'fix-overhead-pipe'],['duct-helper-v4',1,'support-overhead-pipe'],['plumber-v4',.62,'prepare-pipe-joint']],
   5:[['duct-ladder-v4',1.75,'fix-duct-to-ceiling'],['duct-helper-v4',1,'support-duct'],['assembler-v4',.84,'assemble-duct-joint']],
   6:[['duct-ladder-v4',1.75,'fix-lighting'],['electrician-v4',1,'connect-lighting-wire'],['technician-v4',.66,'connect-cable']],
   7:[['technician-v4',.66,'connect-server'],['electrician-v4',1,'connect-switchboard'],['shelf-fitter-v4',.66,'assemble-warehouse-rack']],
   8:[['cold-fitter-v4',1,'connect-coldroom'],['assembler-v4',.84,'fasten-coldroom'],['installer-drill-v3',1,'fix-coldroom-panel']],
   9:[['cold-fitter-v4',1,'connect-counter'],['plumber-v4',.62,'connect-counter-drain'],['assembler-v4',.84,'level-counter']],
   10:[['assembler-v4',.84,'assemble-produce-bin'],['shelf-fitter-v4',.66,'fasten-produce-frame'],['electrician-v4',1,'connect-produce-lamps']],
   11:[['shelf-fitter-v4',.66,'fasten-shelf'],['assembler-v4',.84,'level-shelf'],['installer-drill-v3',1,'fix-endcap']],
   12:[['cold-fitter-v4',1,'connect-refrigeration'],['electrician-v4',1,'connect-fridge-power'],['assembler-v4',.84,'level-freezer']],
   13:[['technician-v4',.66,'connect-checkout-data'],['electrician-v4',1,'connect-checkout-power'],['assembler-v4',.84,'fix-checkout-rail']]
  };
  if(crew[phase]&&phase!==11)crew[phase].forEach(([asset,size,task],i)=>{
   const stop=phase===3?.56:phase===7?.74:1;
   const opacity=reduced?0:smooth(.015,.10,local)*(1-smooth(stop-.08,stop,local));
   const installing=draw.filter(p=>p.chapter===phase&&p.kind==='equipment'&&p.progress<1);
   const equipment=installing[i%Math.max(1,installing.length)];
   const beat=Math.min(3,Math.floor(local*4));
   const changeCrew=phase>=8;
   const pool=[['installer-drill-v3',1],['technician-v4',.66],['electrician-v4',1],['shelf-fitter-v4',.66],['assembler-v4',.84],['plumber-v4',.62],['cold-fitter-v4',1],['worker-carton-v3',1]].filter(([name])=>!crew[phase].some(p=>p[0]===name));
   const variant=changeCrew&&beat%2?pool[i]:[asset,size];
   const delta=changeCrew?[[0,0],[-25,18],[18,8],[-16,-8]][beat]:[0,0];
   const anchor=installationFeet[phase][i],follow=[anchor[0]+delta[0],anchor[1]+delta[1]];
   person(variant[0],follow,'installer',opacity,PERSON_HEIGHT*variant[1],i,task);
   const worker=draw.at(-1);if(worker?.kind==='person'&&worker.role==='installer'){worker.installFor=equipment?`${equipment.asset}:${equipment.index}`:installationParts[phase];worker.workBeat=beat;}
  });
  if(phase===11&&!reduced){
   const poses=[['shelf-fitter-v4',.66],['assembler-v4',.84],['installer-drill-v3',1],['technician-v4',.66],['electrician-v4',1],['worker-carton-v3',1],['plumber-v4',.62],['cold-fitter-v4',1],['duct-helper-v4',1]];
   const fixtures=draw.filter(p=>p.asset==='shelves'&&p.progress>0&&p.progress<1);
   fixtures.forEach(p=>{
    const [asset,size]=poses[p.index%poses.length];
    const opacity=smooth(0,.12,p.progress)*(1-smooth(.88,1,p.progress));
    person(asset,[p.x+p.w*.5,p.y+p.h+15],'installer',opacity,PERSON_HEIGHT*size,p.index,p.index<6?'assemble-gondola':'assemble-display-unit');
    const worker=draw.at(-1);if(worker?.role==='installer')worker.installFor=`shelves:${p.index}`;
   });
  }
  if(phase===14||phase===15)stockingFeet[phase].forEach((foot,i)=>person((phase===15?['worker-stock-v3','stock-crate-v4','worker-carton-v3']:['worker-carton-v3','worker-stock-v3','stock-unpack-v4'])[i],foot,'stock-worker',workerOpacity,PERSON_HEIGHT*(phase===15&&i===1||phase===14&&i===2?.65:1),i,phase===14?'stock-dry-goods':'stock-fresh-goods'));
  if(phase>=16)cashierStations.forEach((foot,i)=>person(i===1?'cashier-man-v5':'cashier-woman-v5',foot,'cashier',phase===16&&!reduced?smooth(i*.16,1,local):1,PERSON_HEIGHT*(i===1?1:.86),i,'serve-checkout'));
  function prop(asset,rect,role,opacity,depth){
   const sprite=sprites.get(asset);if(!sprite||opacity<=0)return;
   const [x,y,w,h]=rect,factor=Math.min(w/sprite.source[2],h/sprite.source[3]),pw=sprite.source[2]*factor,ph=sprite.source[3]*factor;
   draw.push({asset,chapter:phase,kind:role,x:x+(w-pw)/2,y:y+h-ph,w:pw,h:ph,opacity,progress:opacity,offset:0,depth:depth??y+h,cordTop:role==='campaign-dangler'?y:null,sprite});
  }
  const arch=phase===17?(reduced?1:smooth(0,.38,local)):phase===18?(reduced?0:1-smooth(0,.25,local)):0;
  prop('balloon-arch-v3',[960,625,240,235],'opening-arch',arch);
  const customerProgress=phase===17?(reduced?1:smooth(.38,1,local)):phase>17?1:0;
  if(phase>=17)customerPaths.forEach((path,i)=>{
   const delay=i/customerPaths.length*.22;
   const p=phase>17||reduced?1:smooth(.38+delay,1,local);
   const foot=phase>=18&&i<campaignQueueFeet.length?campaignQueueFeet[i]:pathPoint(path,p);
   if(p>0)person(['shopper-basket-v3','shopper-trolley-v3','shopper-woman-v4','shopper-man-v4'][i%4],foot,i<queueFeet.length?'checkout-customer':'customer',smooth(0,.08,p),PERSON_HEIGHT,i,i<queueFeet.length?'checkout-queue':'shopping');
  });
  const campaign=phase===18?(reduced?1:smooth(.25,1,local)):phase>18?1:0;
  prop('campaign-stand-v3',[1200,795,65,100],'campaign',campaign);
  prop('campaign-stand-v3',[325,635,65,100],'campaign',campaign);
  prop('campaign-stand-v3',[1005,510,45,75],'campaign',campaign);
  for(const [x,y] of [[650,145],[930,175],[1215,205]])prop('campaign-dangler-v3',[x,y,65,145],'campaign-dangler',campaign,420);
  prop('detergent-podium-v5',[300,350,225,180],'campaign-podium',campaign,530);
  prop('campaign-dangler-v3',[450,425,58,95],'podium-discount',campaign,551);
  // Painter's order is based on ground depth, so foreground fixtures correctly
  // hide people walking behind them. The foot anchors stay on clear floor.
  draw.sort((a,b)=>a.depth-b.depth);
  for(const p of draw){
   ctx.globalAlpha=p.opacity;
   if(p.kind==='person'&&!p.asset.includes('trolley')){ctx.save();ctx.globalAlpha=p.opacity*.16;ctx.fillStyle='#4c3b25';ctx.beginPath();ctx.ellipse(ox+p.foot[0]*scale,oy+p.foot[1]*scale,9*scale,2.2*scale,0,0,Math.PI*2);ctx.fill();ctx.restore()}
   if(p.kind==='campaign-dangler'){ctx.strokeStyle='#726452';ctx.lineWidth=Math.max(.5,scale);for(const dx of [p.w*.23,p.w*.77]){ctx.beginPath();ctx.moveTo(ox+(p.x+dx)*scale,oy+p.cordTop*scale);ctx.lineTo(ox+(p.x+dx)*scale,oy+(p.y+3)*scale);ctx.stroke()}}
   if(p.sprite){
    ctx.drawImage(p.sprite.image,...p.sprite.source,ox+p.x*scale,oy+(p.y+p.offset)*scale,p.w*scale,p.h*scale);
    if(p.kind==='campaign-podium'){
     ctx.save();ctx.translate(ox+p.x*scale,oy+p.y*scale);ctx.scale(scale,scale);ctx.fillStyle='#187e79';ctx.fillRect(p.w*.10,p.h*.86,p.w*.78,19);ctx.fillStyle='#fff8e9';ctx.direction='rtl';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 13px Yekan';ctx.fillText('پودر ماشین لباسشویی',p.w*.49,p.h*.86+9.5,p.w*.72);ctx.restore();
    }
   }
   else if(p.asset==='underground'){
    for(let u=0;u<p.surface.width;u+=4){const strip=Math.min(4,p.surface.width-u),worldX=p.x+u/p.surface.width*p.w;ctx.drawImage(p.surface,u,0,strip,p.surface.height,ox+worldX*scale,oy+(p.y+p.offset+drainOffset(worldX))*scale,strip/p.surface.width*p.w*scale+.2,p.h*scale)}
   }else ctx.drawImage(p.surface,ox+p.x*scale,oy+(p.y+p.offset)*scale,p.w*scale,p.h*scale)
  }
  ctx.globalAlpha=1;
  const merch=phase>=14;
  detail.querySelector('p').textContent=merch?(phase===14?'چیدمان کالای خشک، فیسینگ قفسه‌ها و پُرکردن مخازن فله':phase===15?'چیدمان میوه و سبزی، ویترین پروتئین و یخچال‌ها':names[phase]||'فروشگاه آمادهٔ بهره‌برداری است'):`نصب ${names[phase]}؛ تجهیزات تا مرحلهٔ مرچندایزینگ خالی می‌مانند.`;
  detail.querySelectorAll('span').forEach((el,i)=>{el.dataset.active=String(i===(merch?2:local<.3?0:1));el.dataset.complete=String(merch?i<2:i===0&&local>.3)});
  return {phase,parts:draw.map(({surface,sprite,...p})=>p),ready:state.ready,errors:state.errors,merchandising:merch,dryStock:phase>14?1:phase===14?smooth(0,1,local):0,freshStock:phase>15?1:phase===15?smooth(0,1,local):0,floorCover,undergroundInstalled:phase===3?smooth(0,.56,local):phase>3?1:0,roomWalls:phase===7?smooth(.74,1,local):phase>7?1:0,arch,customerProgress,campaign,peopleScale:PEOPLE_SCALE};
 }
 return {render,preload,state};
}

