import './illustrated.css';
import './cinematic.css';
import {cameraAt} from './cinematic-camera.js';
import {frames,groups} from './journey.js';
const $=s=>document.querySelector(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const last=frames.length-1,reduced=matchMedia('(prefers-reduced-motion: reduce)');
const base=$('#frame-base'),next=$('#frame-next'),dialog=$('#chapters-dialog');
const cache=new Map(),pending=new Map(),failures=new Set(),chapterButtons=[],tabButtons=[];
let target=0,position=0,current=-1,raf=0,lastTime=0,still=reduced.matches,displayKey='',ready=false;
const metrics=window.__protail={loaded:false,mode:'cinematic-store-journey',sceneCount:frames.length,phase:0,progress:0,imagesReady:0,errors:[],frame:0};
addEventListener('error',e=>metrics.errors.push(e.message));
frames.forEach((frame,i)=>{
 const section=document.createElement('section');section.className='scroll-stop';section.id=`step-${i+1}`;
 section.innerHTML=`<div class="sr-only"><h2>${frame.service} — ${frame.title}</h2><p>${frame.copy}</p></div>`;$('#scroll-track').append(section);
 const b=document.createElement('button');b.innerHTML=`<b>${fa(String(i+1).padStart(2,'0'))}</b><div><small>${frame.service}</small><span>${frame.title}</span></div>`;b.onclick=()=>{dialog.close();go(i)};chapterButtons.push(b);$('#chapter-list').append(b);
});
groups.forEach(([id,name])=>{const b=document.createElement('button');b.textContent=name;b.onclick=()=>go(frames.findIndex(f=>f.group===id));tabButtons.push([id,b]);$('#service-tabs').append(b)});
function travel(){return Math.max(1,document.documentElement.scrollHeight-innerHeight)}
function go(i){scrollTo({top:clamp(i/last)*travel(),behavior:reduced.matches||still?'instant':'smooth'})}
function imagePath(i){return `${import.meta.env.BASE_URL}journey/${frames[i].asset}.webp`}
function loadImage(i){
 if(cache.has(i))return Promise.resolve(cache.get(i));if(pending.has(i))return pending.get(i);
 const job=new Promise((resolve,reject)=>{
  const im=new Image();im.decoding='async';im.onload=async()=>{try{await im.decode()}catch{}cache.set(i,im);failures.delete(i);metrics.imagesReady=cache.size;resolve(im);schedule()};
  im.onerror=()=>{failures.add(i);pending.delete(i);reject(Error(`Frame failed: ${frames[i].asset}`))};im.src=imagePath(i);
 });pending.set(i,job);return job;
}
function requestNearby(i){for(const j of [i,i+1,i-1,i+2])if(j>=0&&j<=last&&!cache.has(j)&&!pending.has(j)&&!failures.has(j))loadImage(j).catch(()=>schedule())}
function updateText(i){
 if(i===current)return;current=i;const frame=frames[i];
 $('#chapter-number').textContent=`${fa(String(i+1).padStart(2,'0'))} / ${fa(frames.length)}`;
 $('#service-name').textContent=frame.service;$('#chapter-title').textContent=frame.title;$('#chapter-copy').textContent=frame.copy;
 $('#role-note').textContent=frame.supervision?'مشاوره و نظارت پروتیل\nاجرا توسط پیمانکار':'';
 $('#report-panel').hidden=!frame.reporting;document.body.classList.toggle('is-reporting',!!frame.reporting);
 $('#frame-caption').textContent=i>=13?'ورود از راست · خروج از چپ':'نمای کامل پروژه · دید از سمت راست';
 $('#previous').disabled=i===0;$('#next').innerHTML=i===last?'از ابتدا ببینیم <span>↺</span>':'مرحلهٔ بعد <span>↓</span>';
 chapterButtons.forEach((b,j)=>b.setAttribute('aria-current',i===j?'step':'false'));
 tabButtons.forEach(([id,b])=>b.setAttribute('aria-current',String(id===frame.group)));
}
function render(){
 const progress=position/last,moving=!(still||reduced.matches),camera=cameraAt(position,innerWidth<=760,!moving);
 const root=document.documentElement.style;
 root.setProperty('--travel',String(progress));
 root.setProperty('--grid-shift',`${moving?-position*54:0}px`);
 root.setProperty('--shot-x',`${camera.x}%`);
 root.setProperty('--shot-y',`${camera.y}%`);
 root.setProperty('--shot-scale',String(camera.scale));
 root.setProperty('--focus-x',`${clamp((50-camera.x*5)/100)*100}%`);
 metrics.camera=camera;
 $('#camera-caption').textContent=camera.label;
 $('#depth-value').textContent=fa(String(Math.round(progress*190)).padStart(3,'0'));
 document.body.classList.toggle('motion-still',!moving);
 const i=Math.min(last,Math.floor(position+.001)),j=Math.min(last,i+1),t=clamp(position-i);
 const textOpacity=!moving?1:Math.max(.2,Math.min(1,clamp((1-t)/.16)+(i===last?1:0)));
 root.setProperty('--copy-opacity',String(textOpacity));
 root.setProperty('--copy-y',`${moving?(1-textOpacity)*18:0}px`);
 requestNearby(i);
 const a=cache.get(i),b=cache.get(j),blend=still||reduced.matches?0:clamp((t-.48)/.52);
 $('#frame-loading').hidden=!!a;$('#fallback').hidden=!failures.has(i);
 if(a){
  const key=`${i}/${j}/${!!b}`;
  if(key!==displayKey){base.src=a.src;base.alt=`${frames[i].service}: ${frames[i].title}`;if(b)next.src=b.src;else next.removeAttribute('src');displayKey=key}
  next.style.opacity=String(b?blend:0);base.style.opacity='1';
  updateText(i);metrics.phase=i;metrics.service=frames[i].group;
 }
 metrics.progress=position/last;metrics.frame=Math.round(position*100);
 $('#scrubber').value=Math.round(position/last*1000);$('#percent').textContent=fa(Math.round(position/last*100))+'٪';
}
function onScroll(){target=clamp(scrollY/travel())*last;schedule()}
function schedule(){if(!raf)raf=requestAnimationFrame(tick)}
function tick(time){raf=0;const dt=Math.min(100,time-lastTime||16);lastTime=time;position=still||reduced.matches?target:position+(target-position)*(1-Math.exp(-dt/70));if(Math.abs(position-target)<.0001)position=target;if(ready)render();if(position!==target)schedule()}
$('#overview').onclick=()=>dialog.showModal();$('#close-dialog').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
$('#next').onclick=()=>go(current===last?0:current+1);$('#previous').onclick=()=>go(current-1);$('#replay').onclick=()=>go(0);$('#complete').onclick=()=>go(15);
$('.brand').onclick=e=>{e.preventDefault();go(0)};
$('#scrubber').oninput=e=>scrollTo({top:+e.target.value/1000*travel(),behavior:'instant'});
function motionUI(){$('#motion').setAttribute('aria-pressed',String(still));$('#motion').textContent=still?'حرکت تصویر':'کاهش حرکت';schedule()}
$('#motion').onclick=()=>{still=!still;motionUI()};reduced.addEventListener('change',()=>{still=reduced.matches;motionUI()});motionUI();
$('#retry').onclick=()=>{const i=Math.floor(position);failures.delete(i);loadImage(i).catch(()=>schedule())};
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
addEventListener('keydown',e=>{
 if(dialog.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,button,a,[contenteditable]'))return;
 const i=({ArrowDown:current+1,ArrowUp:current-1,PageDown:current+1,PageUp:current-1,Home:0,End:last})[e.key];if(i!==undefined){e.preventDefault();go(i)}
});
async function preload(){let cursor=1;async function worker(){while(cursor<=last){const i=cursor++;try{await loadImage(i)}catch{}}}await Promise.all([worker(),worker(),worker()])}
async function init(){
 try{await loadImage(0);ready=true;metrics.loaded=true;await document.fonts.ready;onScroll();render();$('#load-status').hidden=true;preload();if(new URLSearchParams(location.search).has('complete'))go(15)}
 catch(e){metrics.errors.push(e.message);$('#load-status').hidden=true;$('#fallback').hidden=false}
}
init();
