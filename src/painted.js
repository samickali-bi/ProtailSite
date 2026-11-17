import './anime.css';
import './painted.css';
import {chapters,artwork,clamp,ease,sceneAt} from './painted-story.js';
const $=s=>document.querySelector(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const metrics=window.__protail={loaded:false,mode:'painted-scroll-story',progress:0,chapter:0,imagesReady:0,errors:[],camera:[]};
let simple=reduced.matches,progress=0,target=0,playing=false,lastTime=0,dirty=true,current=-1;
const loaded=new Set(),jobs=new Map(),layers=[],navigation=[];
artwork.forEach((a,i)=>{
 const layer=document.createElement('div');layer.className='art-layer';layer.dataset.scene=a.id;
 const im=document.createElement('img');im.alt=a.alt;im.draggable=false;im.decoding='async';layer.append(im);$('#painted-world').append(layer);layers.push({layer,im});
});
chapters.forEach((c,i)=>{const b=document.createElement('button');b.textContent=fa(i+1);b.setAttribute('aria-label',c.kicker);b.onclick=()=>go(c.at);$('#chapters').append(b);navigation.push(b)});
for(let i=0;i<18;i++){const dot=document.createElement('i');dot.style.left=`${(i*37+11)%100}%`;dot.style.top=`${(i*19+7)%100}%`;dot.style.setProperty('--distance',`${(i%5+1)*-13}px`);$('#painted-dust').append(dot)}
const travel=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
function stop(){playing=false;$('#play').textContent='پخش خودکار ▷'}
function go(p){stop();scrollTo({top:clamp(p)*travel(),behavior:simple?'instant':'smooth'})}
function load(i){
 if(loaded.has(i))return Promise.resolve();if(jobs.has(i))return jobs.get(i);
 const job=new Promise((resolve,reject)=>{
  const image=new Image();image.decoding='async';
  image.onload=async()=>{try{await image.decode()}catch{}layers[i].im.src=image.src;loaded.add(i);metrics.imagesReady=loaded.size;dirty=true;resolve()};
  image.onerror=()=>{jobs.delete(i);reject(Error(`Artwork unavailable: ${artwork[i].id}`))};image.src=artwork[i].src;
 });jobs.set(i,job);return job;
}
function updateUI(){
 let i=0;chapters.forEach((c,n)=>{if(progress>=c.at-.0005)i=n});
 if(i!==current){current=i;const c=chapters[i];$('#eyebrow').textContent=c.kicker;$('#title').textContent=c.title;$('#copy').textContent=c.copy;$('#role').hidden=!c.role;
  $('#chapter').textContent=`${fa(String(i+1).padStart(2,'0'))} / ${fa(chapters.length)}`;
  navigation.forEach((b,n)=>b.setAttribute('aria-current',String(n===i)));
  $('#story-copy').getAnimations().forEach(a=>a.cancel());
  if(!simple)$('#story-copy').animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
 }
 $('#next').firstChild.textContent=current===chapters.length-1?'از ابتدا ببینیم ':'ادامهٔ داستان ';
 $('#scrub').value=Math.round(progress*1000);$('#percent').textContent=fa(Math.round(progress*100))+'٪';metrics.chapter=i;
}
function render(){
 const states=sceneAt(progress,innerWidth<=760,simple);
 states.forEach((s,i)=>{
  const {layer,im}=layers[i];layer.style.visibility=loaded.has(i)?'visible':'hidden';layer.style.opacity=s.opacity;
  layer.style.transform=`translate3d(${s.x}%,${s.y}%,0) scale(${s.scale})`;
  im.style.objectPosition=`${s.focus}% 50%`;
 });
 const depth=simple?0:progress;
 const root=document.documentElement.style;root.setProperty('--journey',String(depth));
 root.setProperty('--foreground-x',`${(ease((depth-.23)/.5)-.5)*-12}%`);
 root.setProperty('--foreground-y',`${ease((depth-.23)/.5)*-4}%`);
 root.setProperty('--foreground-scale',String(1.07+ease((depth-.23)/.5)*.22));
 const front=simple?0:ease((progress-.23)/.13)*(1-ease((progress-.77)/.09));
 root.setProperty('--foreground-opacity',String(front*.8));
 root.setProperty('--light-x',`${-35+depth*90}%`);
 const need=states.findLastIndex(s=>s.opacity>.01);$('#artwork-status').hidden=need<0||loaded.has(need);
 metrics.progress=progress;metrics.camera=states.map(({id,x,y,scale,opacity})=>({id,x,y,scale,opacity}));updateUI();
}
addEventListener('scroll',()=>{target=clamp(scrollY/travel());dirty=true},{passive:true});
addEventListener('resize',()=>{target=progress;scrollTo({top:progress*travel(),behavior:'instant'});dirty=true});
addEventListener('wheel',()=>{if(playing)stop()},{passive:true});addEventListener('touchstart',()=>{if(playing)stop()},{passive:true});
$('#scrub').oninput=e=>go(+e.target.value/1000);$('#next').onclick=()=>go(current===chapters.length-1?0:chapters[current+1].at);$('#restart').onclick=()=>go(0);
$('#brand').onclick=e=>{e.preventDefault();go(0)};
$('#play').onclick=()=>{if(simple||!metrics.loaded)return;if(progress>.999){progress=target=0;scrollTo({top:0,behavior:'instant'})}playing=!playing;$('#play').textContent=playing?'توقف Ⅱ':'پخش خودکار ▷';dirty=true};
function motionUI(){document.body.classList.toggle('reduced',simple);$('#motion').setAttribute('aria-pressed',String(simple));$('#motion').textContent=simple?'حرکت کامل':'کاهش حرکت';$('#play').disabled=simple;dirty=true}
$('#motion').onclick=()=>{simple=!simple;stop();motionUI()};reduced.addEventListener('change',()=>{simple=reduced.matches;stop();motionUI()});motionUI();
$('#reload').onclick=()=>location.reload();
addEventListener('keydown',e=>{
 if(e.target.closest('button,input,a')||e.ctrlKey||e.metaKey||e.altKey)return;
 const at=({ArrowDown:chapters[Math.min(chapters.length-1,current+1)].at,ArrowUp:chapters[Math.max(0,current-1)].at,Home:0,End:1})[e.key];
 if(at!==undefined){e.preventDefault();go(at)}else if(['PageDown','PageUp',' '].includes(e.key))stop();
});
function tick(time){
 requestAnimationFrame(tick);const dt=Math.min(.05,(time-lastTime)/1000||.016);lastTime=time;if(document.hidden)return;
 if(playing){target=clamp(target+dt/60);scrollTo({top:target*travel(),behavior:'instant'});if(target>=1)stop()}
 const delta=target-progress;
 if(Math.abs(delta)>.00001){progress=simple?target:progress+delta*(1-Math.exp(-dt*10));dirty=true}
 else if(progress!==target){progress=target;dirty=true}
 if(dirty&&metrics.loaded){render();dirty=false}
}
async function init(){
 try{
  await load(0);await document.fonts.ready;metrics.loaded=true;target=clamp(scrollY/travel());progress=target;render();$('#loading').hidden=true;requestAnimationFrame(tick);
  for(const i of [1,2,3])load(i).catch(e=>{metrics.errors.push(e.message);$('#artwork-status').textContent='این نما آماده نشد؛ برای تلاش دوباره صفحه را تازه کنید.'});
 }catch(e){metrics.errors.push(e.message);$('#loading').hidden=true;$('#failure').hidden=false}
}
init();
