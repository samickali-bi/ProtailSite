import {smooth} from './installation-timeline.js';
const item=(asset,x,y,w,h)=>({asset,x,y,w,h});
// Standalone RGBA drawings only. Coordinates use the fixed shell's 1672 × 941 space.
export const installationParts={
4:[item('pipe',465,58,550,105),item('pipe',990,118,585,112)],
5:[item('duct',345,77,300,97),item('duct',790,110,380,105),item('duct',1170,153,355,105)],
6:[item('light',315,140,102,57),item('light',617,186,104,57),item('light',914,219,104,57),item('light',1255,256,104,57),item('light',435,264,112,60),item('light',755,309,112,60),item('light',1091,352,112,60)],
7:[item('rack',610,218,63,84),item('rack',675,226,63,84)],
8:[item('coldroom',55,285,234,195)],
9:[item('protein',155,413,269,171),item('protein',337,348,221,140)],
10:[item('produce',1300,415,223,135),item('produce',1230,490,239,145),item('produce',1150,573,259,157)],
11:[item('shelf',567,323,190,154),item('shelf',700,337,190,154),item('shelf',837,352,190,154),item('shelf',974,370,190,154),item('shelf',1110,392,166,135)],
12:[item('fridge',980,262,280,185),item('fridge',1263,292,280,185)],
13:[item('checkout',363,537,124,112),item('checkout',482,555,124,112),item('checkout',601,574,124,112)]};
export function frontInstallation(stack,onReady){
 const canvas=document.createElement('canvas');canvas.id='front-installation';canvas.hidden=true;canvas.setAttribute('aria-hidden','true');stack.insertBefore(canvas,document.querySelector('#frame-next'));
 const ctx=canvas.getContext('2d'),assets=new Map(),state={ready:false,errors:[]};
 const detail=document.createElement('div');detail.id='installation-detail';detail.hidden=true;detail.innerHTML='<p id="installation-action"></p><div class="installation-steps"><span>آماده‌سازی در سالن</span><span>نصب قطعه‌به‌قطعه</span><span>تثبیت و اتصال</span></div>';document.querySelector('#role-note').after(detail);
 const names={4:'لوله‌ها',5:'کانال‌ها',6:'چراغ‌ها',7:'رک‌ها',8:'سردخانه',9:'ویترین‌ها',10:'استندهای میوه',11:'شلف‌ها',12:'یخچال‌ها',13:'صندوق‌ها'};
 async function preload(){await Promise.all([...new Set(Object.values(installationParts).flat().map(p=>p.asset))].map(async name=>{try{
  const image=new Image();image.src=`/installation/equipment/${name}.png`;await image.decode();
  // Use alpha bounds for layout, preserving the original drawing and its transparency.
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);const {data}=cx.getImageData(0,0,c.width,c.height);
  let l=c.width,t=c.height,r=0,b=0,transparent=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const a=data[(y*c.width+x)*4+3];if(a<8)transparent++;if(a>16){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}}
  if(transparent<c.width*c.height*.05)throw Error(name+' lacks transparency');assets.set(name,{image,bounds:[l,t,r-l+1,b-t+1]});
 }catch(e){state.errors.push(String(e))}}));state.ready=state.errors.length===0;onReady()}
 function render(phase,local,reduced){
  const active=phase>=4&&phase<=14;canvas.hidden=!active;detail.hidden=!active||phase===14;if(!active)return null;
  const w=stack.clientWidth,h=stack.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const scale=Math.min(w/1672,h/941),ox=(w-1672*scale)/2,oy=(h-941*scale)/2,draw=[];
  for(const [key,parts] of Object.entries(installationParts)){const chapter=Number(key);if(chapter>phase)continue;parts.forEach((part,j)=>{const start=.04+j/parts.length*.46,p=reduced||chapter<phase?1:smooth(start,start+.36,local),asset=assets.get(part.asset);if(p===0||!asset)return;draw.push({...part,chapter,progress:p,offset:(1-p)*(chapter<=6?38:18),assetData:asset,opacity:reduced||chapter<phase?1:smooth(start,start+.08,local)})})}
  draw.sort((a,b)=>(a.y+a.h)-(b.y+b.h));for(const p of draw){ctx.globalAlpha=p.opacity;ctx.drawImage(p.assetData.image,...p.assetData.bounds,ox+p.x*scale,oy+(p.y+p.offset)*scale,p.w*scale,p.h*scale)}ctx.globalAlpha=1;
  const stage=local<.30?0:local<.86?1:2;detail.querySelector('p').textContent=local>=.91||reduced?`${names[phase]} نصب شدند؛ تجهیزات قبلی در جای خود باقی می‌مانند.`:`نصب ${names[phase]} در داخل سالن`;detail.querySelectorAll('span').forEach((el,i)=>{el.dataset.active=String(i===stage);el.dataset.complete=String(i<stage)});
  return {phase,stage,parts:draw.map(({assetData,...p})=>p),finish:smooth(.84,.91,local),ready:state.ready,errors:state.errors};
 }
 return {render,preload,state};
}
