import './original.css';
import {weights,starts,end,phaseAt,progressFor,smooth} from './installation-timeline.js';
import {frontInstallation,installationParts} from './registered-installation.js';
import {frames,groups} from './journey.js';
import {floatingScene,clipSceneImage} from './floating-scene.js';
const $=s=>document.querySelector(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const last=frames.length-1,reduced=matchMedia('(prefers-reduced-motion: reduce)');
// A fresh visit starts at frame one instead of restoring the previous scroll.
history.scrollRestoration='manual';
scrollTo({top:0,behavior:'instant'});
const base=$('#frame-base'),next=$('#frame-next'),dialog=$('#chapters-dialog');
const cache=new Map(),pending=new Map(),failures=new Set(),chapterButtons=[],tabButtons=[];
let target=0,position=0,current=-1,raf=0,lastTime=0,still=reduced.matches,displayKey='',ready=false;
const metrics=window.__protail={loaded:false,mode:'complete-image-sequence',sceneCount:frames.length,phase:0,progress:0,imagesReady:0,errors:[],frame:0};
metrics.mode='registered-layered-store';metrics.timeline={weights,starts,end};
const floating=floatingScene($('#image-stack'));
const assembly=frontInstallation(floating.art,()=>{displayKey='';schedule()});
// Keep every chapter in a real vertical rail; move the live controls with its chapter.
const chapterViewport=$('.chapter-panel'),chapterRail=document.createElement('div');
chapterRail.className='chapter-rail';
const liveChapter=document.createElement('div');liveChapter.className='chapter-content';
while(chapterViewport.firstChild)liveChapter.append(chapterViewport.firstChild);
const narrativeCards=frames.map((frame,i)=>{
 const card=document.createElement('section');card.className='narrative-card';
 card.setAttribute('aria-label',`${i+1}. ${frame.service}`);
 const preview=document.createElement('div');preview.className='chapter-preview';
 const meta=document.createElement('div');meta.className='chapter-meta';meta.textContent=`${fa(String(i+1).padStart(2,'0'))} / ${fa(frames.length)}`;
 const service=document.createElement('p');service.className='narrative-service';service.textContent=frame.service;
 const title=document.createElement('h2');title.textContent=frame.title;
 const copy=document.createElement('p');copy.className='narrative-copy';copy.textContent=frame.copy;
 preview.append(meta,service,title,copy);card.append(preview);chapterRail.append(card);return card;
});
chapterViewport.append(chapterRail);narrativeCards[0].append(liveChapter);
function scrollNarrative(i,t){
 const card=narrativeCards[i];
 if(liveChapter.parentElement!==card)card.append(liveChapter);
 narrativeCards.forEach((item,j)=>{item.classList.toggle('is-current',i===j);item.inert=i!==j});
 // Share the image's eased timeline, including reverse scrolling and direct jumps.
 // Keep the current title beside its animation; bring the next chapter up at the end.
 const offset=i===last?0:.15*t+.85*smooth(.72,1,t);
 chapterViewport.scrollTop=card.offsetTop-chapterRail.offsetTop+offset*card.offsetHeight;
 metrics.narrative={phase:i,local:t,scrollTop:chapterViewport.scrollTop};
}
addEventListener('error',e=>metrics.errors.push(e.message));
frames.forEach((frame,i)=>{
 const section=document.createElement('section');section.className='scroll-stop';section.id=`step-${i+1}`;
 section.style.height=i===last?'100svh':`${weights[i]*90}svh`;
 section.innerHTML=`<div class="sr-only"><h2>${frame.service} — ${frame.title}</h2><p>${frame.copy}</p></div>`;$('#scroll-track').append(section);
 const b=document.createElement('button');b.innerHTML=`<b>${fa(String(i+1).padStart(2,'0'))}</b><div><small>${frame.service}</small><span>${frame.title}</span></div>`;b.onclick=()=>{dialog.close();go(i)};chapterButtons.push(b);$('#chapter-list').append(b);
});
groups.forEach(([id,name])=>{const b=document.createElement('button');b.textContent=name;b.onclick=()=>go(frames.findIndex(f=>f.group===id));tabButtons.push([id,b]);$('#service-tabs').append(b)});
function travel(){return Math.max(1,document.documentElement.scrollHeight-innerHeight)}
function go(i,local=installationParts[i]?0:i>=6&&i<last?.92:0){scrollTo({top:progressFor(i,local)*travel(),behavior:reduced.matches||still?'instant':'smooth'})}
function imagePath(i){const path=i===0?'installation/registered/site-v3.webp':i===2?'installation/registered/structure-floating-v6.png':i===3?'installation/registered/ground-rough-v3.webp':i>3?'installation/registered/base-v3.webp':`journey/${frames[i].asset}.webp`;return import.meta.env.BASE_URL+path}
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
 const {phase:i,local:t}=phaseAt(position),moving=!(still||reduced.matches);
 const layered=i>=3;
 const incoming=false;
 const from=incoming?i-1:i,to=incoming?i:Math.min(last,i+1);
 requestNearby(i);
 const a=i===3?cache.get(3):layered?cache.get(4):cache.get(from);
 const b=layered?null:cache.get(to);
 const installation=assembly.render(i,t,!moving);
 const blend=layered||!moving?0:smooth(0,1,t);
 metrics.installation=installation;metrics.installationReady=assembly.state.ready;metrics.assetLayers=assembly.state.layers;
 metrics.transition={from,to,blend};
 $('#frame-loading').hidden=!!a&&(!layered||assembly.state.ready);$('#fallback').hidden=!failures.has(i)&&!assembly.state.errors.length;
 if(a){
  const key=`${a.src}/${b?.src}`;
  if(key!==displayKey){base.src=a.src;base.alt=`${frames[i].service}: ${frames[i].title} — نمای کامل فروشگاه`;if(b)next.src=b.src;else next.removeAttribute('src');displayKey=key}
  next.style.opacity=String(b?blend:0);base.style.opacity='1';
  clipSceneImage(base,i);clipSceneImage(next,to);
  updateText(i);metrics.phase=i;metrics.service=frames[i].group;
  if(i===3){$('#chapter-title').textContent=t<.56?'زیرِ کف، پیش از کف‌سازی.':'بعد، کف آماده می‌شود.';$('#chapter-copy').textContent=t<.56?'لوله‌های فاضلاب، انشعاب‌های آب و چاه‌های بازدید در مسیرهای زیرِ کف اجرا می‌شوند؛ هنوز کف نهایی بسته نشده است.':'پس از تکمیل تأسیسات زمینی، مسیرها پوشانده می‌شوند و کف قابل شست‌وشوی فروشگاه شکل می‌گیرد.'}
  if(i===17){$('#chapter-title').textContent=t<.42?'اول، طاق بادکنکی ورودی.':'بعد، اولین مشتری‌ها.';$('#chapter-copy').textContent=t<.42?'ابتدا طاق بادکنکی دم درِ ورودی آماده می‌شود؛ فروشگاه برای شروع افتتاح آماده است.':'مشتریان با سبد و ترولی از ورودی وارد می‌شوند و در راهروهای فروشگاه حرکت می‌کنند.'}
  if(installationParts[i])$('#next').innerHTML=t<.97?(i>=14?'ادامهٔ چیدمان <span>↓</span>':'ادامهٔ نصب <span>↓</span>'):'مرحلهٔ بعد <span>↓</span>';
 }
 scrollNarrative(i,t);
 floating.update(position,!moving);
 metrics.progress=position;metrics.position=i+t;metrics.local=t;metrics.frame=Math.round((i+t)*100);
 $('#scrubber').value=Math.round(position*1000);$('#percent').textContent=fa(Math.round(position*100))+'٪';
}
function onScroll(){target=clamp(scrollY/travel());schedule()}
function schedule(){if(!raf)raf=requestAnimationFrame(tick)}
function tick(time){raf=0;const dt=Math.min(100,time-lastTime||16);lastTime=time;position=still||reduced.matches?target:position+(target-position)*(1-Math.exp(-dt/140));if(Math.abs(position-target)<.000001)position=target;if(ready)render();if(position!==target)schedule()}
$('#overview').onclick=()=>dialog.showModal();$('#close-dialog').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
$('#next').onclick=()=>{const {local}=phaseAt(position);if(installationParts[current]&&local<.97)go(current,local<.30?.33:local<.76?.79:.98);else go(current===last?0:current+1)};$('#previous').onclick=()=>go(current-1);$('#replay').onclick=()=>go(0);$('#complete').onclick=()=>go(16,.98);
$('.brand').onclick=e=>{e.preventDefault();go(0)};
$('#scrubber').oninput=e=>scrollTo({top:+e.target.value/1000*travel(),behavior:'instant'});
function motionUI(){$('#motion').setAttribute('aria-pressed',String(still));$('#motion').textContent=still?'حرکت تصویر':'کاهش حرکت';schedule()}
$('#motion').onclick=()=>{still=!still;motionUI()};reduced.addEventListener('change',()=>{still=reduced.matches;motionUI()});motionUI();
$('#retry').onclick=()=>{const i=phaseAt(position).phase;failures.delete(i);loadImage(i).catch(()=>schedule())};
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
addEventListener('keydown',e=>{
 if(dialog.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,button,a,[contenteditable]'))return;
 const i=({ArrowDown:current+1,ArrowUp:current-1,PageDown:current+1,PageUp:current-1,Home:0,End:last})[e.key];if(i!==undefined){e.preventDefault();go(i)}
});
async function preload(){let cursor=1;async function worker(){while(cursor<=last){const i=cursor++;try{await loadImage(i)}catch{}}}await Promise.all([worker(),worker(),worker()])}
async function init(){
 try{await loadImage(0);ready=true;metrics.loaded=true;await document.fonts.ready;onScroll();render();$('#load-status').hidden=true;preload();assembly.preload();if(new URLSearchParams(location.search).has('complete'))go(16,.98);const step=Number(new URLSearchParams(location.search).get('step'));if(step>=1&&step<=frames.length)go(step-1);const local=Number(new URLSearchParams(location.search).get('local'));if(step>=1&&step<=frames.length&&local>0&&local<1)go(step-1,local)}
 catch(e){metrics.errors.push(e.message);$('#load-status').hidden=true;$('#fallback').hidden=false}
}
init();

