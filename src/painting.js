import {drawDetails} from './service-details.js';
export function createPainting(canvas){
const ctx=canvas.getContext('2d',{alpha:false}),W=1672,H=941;
let width=1,height=1,dpr=1,loaded=false,finalImage,shellImage,layers=[];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
const settled=document.createElement('canvas');settled.width=W;settled.height=H;
const settledContext=settled.getContext('2d');let settledKey='';
function camera(a,b,t,fixed){
 if(fixed)return [1,836,470];
 const focus=scene=>{const full=['survey','complete','test'].includes(scene.detail);return [full?1.04:scene.serviceIndex<2?1.25:1.6,full?836:scene.x,full?470:scene.y]};
 const start=focus(a),end=focus(b),k=ease(t);
 return start.map((v,i)=>v+(end[i]-v)*k);
}
function path(points,c=ctx){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
function polygon(points,fill,stroke){path(points);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function line(points,color,width=3,dash=[]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([])}
const footprint=[[25,260],[560,192],[1645,443],[1648,650],[170,831]];
// Regions share the approved completed painting's pixel coordinates. Later regions
// own overlapping pixels, so the finished frame has no duplicate edges or ghosts.
const regions=[
 {stage:6,points:[[0,0],[1672,0],[1672,402],[1450,357],[930,247],[797,265],[0,252]]},
 {stage:7,points:[[598,126],[798,130],[802,260],[600,260]]},
 {stage:8,points:[[435,127],[603,136],[606,262],[433,252]]},
 {stage:9,points:[[29,65],[437,38],[437,257],[30,267]]},
 {stage:11,points:[[963,247],[1672,349],[1672,566],[1000,392]]},
 {stage:14,points:[[290,250],[792,263],[977,319],[1005,389],[704,370],[290,320]]},
 {stage:13,points:[[288,289],[695,301],[895,422],[834,523],[621,552],[345,465]]},
 {stage:12,points:[[28,249],[290,249],[351,398],[445,531],[442,730],[167,786],[82,540]]},
 {stage:10,points:[[960,274],[1128,308],[1127,339],[1340,378],[1338,405],[1638,451],[1638,585],[1030,445],[967,390]]},
 {stage:15,points:[[823,393],[935,386],[1034,428],[1012,520],[804,548]]},
 {stage:16,points:[[613,529],[1104,478],[1414,543],[1400,672],[630,759]]},
 {stage:17,points:[[165,785],[1645,527],[1672,941],[173,941]]}
];
function makeLayers(){
 const buffers=regions.map(()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c});
 for(let i=0;i<regions.length;i++){
  const c=buffers[i],g=c.getContext('2d');path(regions[i].points,g);g.fill();
  g.globalCompositeOperation='destination-out';for(let j=i+1;j<regions.length;j++){path(regions[j].points,g);g.fill()}
  g.globalCompositeOperation='source-in';g.drawImage(finalImage,0,0,W,H);
 }
 layers=buffers;
}
function ground(s){
 const rise=ease((s-1.8)/1.2);
 polygon([[25,260],[560,192],[1645,443],[1648,650],[170,831],[185,891],[1655,708],[1670,450],[560,179],[14,249]],'#b6a183');
 polygon(footprint,s<2?'#dfd1b8':'#d3c6ad','#a7997c');
 // Perspective layout follows the same floor plane as the architectural painting.
 ctx.save();path(footprint);ctx.clip();ctx.globalAlpha=ease(s/.8)*(1-ease((s-3)/1.3));ctx.lineWidth=2;
 for(let i=0;i<9;i++){let x=65+i*175;line([[x,200],[x+150,850]],'#63857a',1,[8,9])}
 for(let i=0;i<6;i++)line([[0,260+i*110],[1672,450+i*65]],'#63857a',1,[8,9]);
 for(let i=0;i<5;i++)polygon([[350+i*150,350],[390+i*150,345],[465+i*150,555],[425+i*150,562]],'#62998e16','#548e83');
 ctx.restore();
 if(rise){ctx.globalAlpha=rise;for(const x of [80,360,650,950,1250,1570])line([[x,390],[x+65,640]],'#a79d85',12);ctx.globalAlpha=1}
}
function pipes(s){const a=ease((s-4.5)/.5)*(1-ease((s-5.8)/.6));if(!a)return;ctx.save();ctx.globalAlpha=a;polygon([[170,831],[700,770],[700,885],[185,918]],'#ad9272');line([[185,882],[682,823]],'#386c75',16);line([[190,864],[680,804]],'#b78238',8);line([[195,901],[690,842]],'#708056',5);line([[235,875],[235,765],[435,720]],'#386c75',10);ctx.restore()}
function draw(s,scene,nextScene,t,fixed){
 if(!loaded)return;


 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#f7f1e6';ctx.fillRect(0,0,width,height);
 const fit=Math.min(width/W,height/H)*.98,[zoom,cx,cy]=camera(scene,nextScene,t,fixed);
 ctx.translate(width/2,height/2);ctx.scale(fit*zoom,fit*zoom);ctx.translate(-cx,-cy);
 ground(s);
 const shellAlpha=ease((s-2.6)/1.4),finished=regions.map(r=>ease((s-r.stage+.65)/.8));
 if(s>=4){
  const key=finished.map(t=>t===1?'1':'0').join('');
  if(key!==settledKey){settledContext.clearRect(0,0,W,H);settledContext.drawImage(shellImage,0,0,W,H);for(let i=0;i<layers.length;i++)if(finished[i]===1)settledContext.drawImage(layers[i],0,0);settledKey=key}
  ctx.drawImage(settled,0,0);
 }else if(shellAlpha){ctx.globalAlpha=shellAlpha;ctx.drawImage(shellImage,0,0,W,H);ctx.globalAlpha=1}
 // A subtle preview at the beginning makes the destination visible without
 // replacing the construction stages with a static finished-store image.
 if(s<1){ctx.globalAlpha=.12*(1-ease(s));ctx.drawImage(finalImage,0,0,W,H);ctx.globalAlpha=1}
 for(let i=0;i<regions.length;i++){
  const t=finished[i];if(!t||(s>=4&&t===1))continue;
  ctx.save();ctx.globalAlpha=t;ctx.translate(0,(1-t)*-20);ctx.drawImage(layers[i],0,0);ctx.restore();
 }
 const completion=ease((s-17.5)/1.2);if(completion){ctx.globalAlpha=completion;ctx.drawImage(finalImage,0,0,W,H);ctx.globalAlpha=1}
 pipes(s); drawDetails(ctx,scene,nextScene,t,fixed);
 ctx.setTransform(dpr,0,0,dpr,0,0);
}

const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Image failed: '+src));im.src=src});
return {
 async load(){[finalImage,shellImage]=await Promise.all([load('/illustration/complete.webp'),load('/illustration/shell.webp')]);makeLayers();loaded=true},
 resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr)},
 draw
};
}
