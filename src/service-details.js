// Explanatory drawing layers: conceptual routes, components and focus markers.
// These are visual service explanations, not an engineering execution drawing.
const routeTypes=new Set(['water','drain','cooling','cable','data','network','power','earth','customer','logistics']);
const boxTypes=new Set(['panel','rack','server','backup','hvac','coldroom','fridge','storage','checkout','pos']);

function trace(ctx,points,color,width=4,progress=1,dash=[]){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let remaining=lengths.reduce((a,b)=>a+b,0)*progress;
 ctx.beginPath();ctx.moveTo(...points[0]);
 for(let i=0;i<lengths.length;i++){
  const a=points[i],b=points[i+1],t=Math.min(1,remaining/(lengths[i]||1));
  ctx.lineTo(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);remaining-=lengths[i];if(remaining<=0)break;
 }
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
}
function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,-.12,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke()}
function component(ctx,scene,amount,active){
 const {x,y,detail:type,service,localIndex}=scene,color=service.color;
 ctx.save();ctx.globalAlpha*=(typeof active==='number'?active:active?.9:.25)*amount;ctx.lineJoin='round';ctx.lineCap='round';
 const spread=100+localIndex*10;
 if(routeTypes.has(type)){
  const points=type==='customer'?[[1050,730],[1050,600],[720,510],[540,400],[360,450]]:
   type==='logistics'?[[90,210],[270,200],[400,300],[650,350]]:
   type==='earth'?[[x-170,y+65],[x-30,y+40],[x,y],[x+45,y-100]]:
   [[x-spread,y+75],[x-70,y+55],[x-75,y-35],[x+90,y-55],[x+spread,y-30]];
  trace(ctx,points,'#f7f1e6',12,amount);
  trace(ctx,points,color,type==='drain'?7:5,amount,type==='data'?[9,5]:[]);
  if(amount>.8)for(const [px,py] of [points[0],points.at(-1)]){ctx.fillStyle=color;ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill()}
  if(type==='earth'){for(let j=0;j<3;j++)trace(ctx,[[x-18+j*5,y+13+j*9],[x+18-j*5,y+13+j*9]],color,3)}
 }else if(type==='duct'){
  const points=[[x-240,y-40],[x-60,y],[x+200,y+55]];
  trace(ctx,points,'#f7f1e6',30,amount);trace(ctx,points,color,23,amount);trace(ctx,points,'#d9eced',15,amount);
  for(let j=0;j<4;j++){const px=x-160+j*95;trace(ctx,[[px,y-15+j*14],[px-20,y+65+j*14]],color,9,amount)}
 }else if(['vent','extract','light','spotlight','fire'].includes(type)){
  for(let j=0;j<4;j++){
   const px=x-150+j*95,py=y-20+j*18;
   if(type==='light'||type==='spotlight'){
    ctx.fillStyle='#fff3b340';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-35,py+110);ctx.lineTo(px+60,py+95);ctx.closePath();ctx.fill();
    trace(ctx,[[px-24,py],[px+30,py+8]],'#fff9d7',15,amount);trace(ctx,[[px-24,py],[px+30,py+8]],color,3,amount);
   }else if(type==='fire'){
    ctx.fillStyle=j===0?'#d87150':color;ctx.fillRect(px-10,py-13,20,26);trace(ctx,[[px-20,py+35],[px+20,py+35]],color,3,amount);
   }else{
    ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(px-24,py-9,48,18);
    for(let k=0;k<4;k++)trace(ctx,[[px-16+k*10,py-6],[px-16+k*10,py+6]],color,2);
    for(let k=0;k<2;k++)trace(ctx,[[px-8+k*16,py+18],[px-15+k*16,py+48]],color,2,amount);
   }
  }
 }else if(boxTypes.has(type)){
  const h=['panel','rack','server','fridge','coldroom'].includes(type)?100:60;
  ctx.fillStyle='#f7f1e6c9';ctx.fillRect(x-43,y-h/2,86,h);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(x-43,y-h/2,86,h);
  trace(ctx,[[x+43,y-h/2],[x+64,y-h/2-12],[x+64,y+h/2-12],[x+43,y+h/2]],color,3,amount);
  for(let j=0;j<4;j++){trace(ctx,[[x-30,y-h/2+16+j*17],[x+22,y-h/2+16+j*17]],color,2,amount);ctx.fillStyle=color;ctx.fillRect(x+28,y-h/2+12+j*17,4,4)}
  if(['panel','backup','hvac'].includes(type))trace(ctx,[[x+3,y-20],[x-10,y+2],[x+9,y-2],[x-3,y+20]],color,4,amount);
 }else if(type==='wifi'||type==='camera'){
  if(type==='wifi'){for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(x,y,24+j*24,Math.PI*1.1,Math.PI*1.9);ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke()}}
  else{ctx.fillStyle='#f7f1e6cc';ctx.fillRect(x-25,y-16,50,25);ctx.strokeStyle=color;ctx.strokeRect(x-25,y-16,50,25);trace(ctx,[[x,y+10],[x-12,y+30],[x-35,y+30]],color,4);ctx.fillStyle=color+'20';ctx.beginPath();ctx.moveTo(x+25,y);ctx.lineTo(x+145,y+65);ctx.lineTo(x+120,y-55);ctx.fill()}
 }else if(['shelf','merch','produce','steel','layout','floor','foundation','roof','wall','zones'].includes(type)){
  for(let j=0;j<3;j++){
   const py=y-50+j*40;trace(ctx,[[x-100,py],[x+65,py-20],[x+120,py+10],[x-45,py+30],[x-100,py]],color,3,amount);
   if(type==='merch'||type==='produce')for(let k=0;k<6;k++){ctx.fillStyle=[color,'#c58c55','#a8ab61'][k%3];ctx.fillRect(x-70+k*24,py-10+k*-2,12,14)}
  }
 }else if(type==='column'){
  for(let j=0;j<4;j++)trace(ctx,[[x-200+j*130,y+80+j*20],[x-200+j*130,y-90+j*20]],color,12,amount);
 }else if(type==='socket'){
  for(let j=0;j<3;j++){
   const px=x-90+j*90,py=y+j*15;ctx.fillStyle='#fcf9f0ee';ctx.fillRect(px-19,py-24,38,48);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(px-19,py-24,38,48);
   for(const dx of [-7,7]){ctx.beginPath();ctx.arc(px+dx,py,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
   trace(ctx,[[px,py-25],[px,py-60],[x+120,py-60]],color,3,amount);
  }
 }else if(type==='meter'){
  ctx.fillStyle='#fcf9f0dd';ctx.fillRect(x-60,y-50,120,95);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(x-60,y-50,120,95);
  ctx.beginPath();ctx.arc(x,y+5,35,Math.PI,Math.PI*2);ctx.stroke();trace(ctx,[[x,y+5],[x+20,y-23]],color,4,amount);
  trace(ctx,[[x-40,y+25],[x+40,y+25]],color,3,amount);
 }else if(type==='sign'){
  for(let j=0;j<3;j++){
   const px=x-135+j*110,py=y+j*20;trace(ctx,[[px,py-65],[px,py-20]],color,2,amount);ctx.fillStyle=color;ctx.fillRect(px-38,py-20,76,34);
   trace(ctx,[[px+20,py-3],[px-18,py-3],[px-9,py-12],[px-18,py-3],[px-9,py+6]],'#f7f1e6',3,amount);
  }
 }else if(type==='entry'){
  trace(ctx,[[x-90,y+60],[x-90,y-65],[x+90,y-65],[x+90,y+60]],color,6,amount);
  for(const dx of [-42,42]){ctx.fillStyle=color+'20';ctx.fillRect(x+dx-37,y-50,74,110);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(x+dx-37,y-50,74,110)}
  trace(ctx,[[x-30,y+80],[x+30,y+80]],color,3,amount);
 }else if(type==='team'){
  for(let j=0;j<3;j++){const px=x-60+j*60,py=y+j%2*15;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(px,py-35,12,0,Math.PI*2);ctx.stroke();trace(ctx,[[px-20,py+35],[px-20,py-3],[px+20,py-3],[px+20,py+35]],color,4,amount);trace(ctx,[[px,py+12],[px,py+62]],color,4,amount)}
 }else if(type==='campaign'||type==='promo'){
  ctx.fillStyle=color+'25';ctx.beginPath();ctx.moveTo(x-65,y-20);ctx.lineTo(x+30,y-55);ctx.lineTo(x+30,y+35);ctx.lineTo(x-65,y+10);ctx.closePath();ctx.fill();
  trace(ctx,[[x-65,y-20],[x+30,y-55],[x+30,y+35],[x-65,y+10],[x-65,y-20]],color,4,amount);
  trace(ctx,[[x-40,y+18],[x-25,y+60],[x-7,y+54],[x-20,y+23]],color,4,amount);
  for(let j=0;j<3;j++)trace(ctx,[[x+50,y-30+j*30],[x+85,y-50+j*50]],color,3,amount);
 }else if(['report','dashboard','app','analysis','catalog'].includes(type)){
  ctx.fillStyle='#fcf9f0ed';ctx.fillRect(x-95,y-65,190,120);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(x-95,y-65,190,120);
  for(let j=0;j<5;j++){ctx.fillStyle=color+(j%2?'65':'b0');const h=(25+j*12)*amount;ctx.fillRect(x-70+j*30,y+35-h,17,h)}
  trace(ctx,[[x-80,y-45],[x+25,y-45]],color,3);trace(ctx,[[x,y+55],[x,y+75],[x-35,y+75],[x+35,y+75]],color,3);
 }else{
  ellipse(ctx,x,y,75+localIndex*2,38,color);
  trace(ctx,[[x-20,y],[x-3,y+16],[x+32,y-20]],color,5,amount);
  if(type==='test')for(let j=0;j<4;j++)ellipse(ctx,x-130+j*90,y+50-j*15,13,8,color);
 }
 ctx.restore();
}

export function drawDetails(ctx,scene,nextScene,t,fixed){
 if(scene.detail==='complete')return;
 const group=scene.service;
 const sameService=nextScene.service===group;
 ctx.save();ctx.globalAlpha=sameService?1:1-t;
 // Details accumulate within a service and reverse naturally when scrolling up.
 for(let j=0;j<scene.localIndex;j++){
  const step=group.steps[j];component(ctx,{...scene,x:step[2],y:step[3],detail:step[4],localIndex:j},1,false);
 }
 component(ctx,scene,1,sameService?.9-.65*t:.9);
 ctx.restore();
 if(t>0)component(ctx,nextScene,t,true);
 if(!fixed){
  const x=scene.x+(nextScene.x-scene.x)*t,y=scene.y+(nextScene.y-scene.y)*t;
  ctx.save();ctx.strokeStyle=group.color;ctx.lineWidth=2;ctx.globalAlpha=.65;
  const size=38;for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])trace(ctx,[[x+dx*size,y+dy*(size-12)],[x+dx*size,y+dy*size],[x+dx*(size-12),y+dy*size]],group.color,2);
  ctx.restore();
 }
}
