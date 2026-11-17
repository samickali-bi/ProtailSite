import {installationAt,smooth} from './installation-timeline.js';

export function ductInstallation(stack,onReady){
 const overlay=document.createElement('div');overlay.id='duct-installation';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
 const shadow=document.createElement('img'),main=document.createElement('img'),branches=document.createElement('img'),finish=document.createElement('img');
 for(const img of [shadow,main,branches,finish]){img.alt='';img.draggable=false;overlay.append(img)}
 shadow.className='duct-shadow';main.className='duct-main';branches.className='duct-branches';finish.className='duct-finish';
 stack.insertBefore(overlay,document.querySelector('#frame-next'));
 const detail=document.createElement('div');detail.id='installation-detail';detail.hidden=true;
 detail.innerHTML='<p id="installation-action"></p><div class="installation-steps"><span>کانال اصلی</span><span>انشعاب‌ها</span><span>اتصال نهایی</span></div>';
 document.querySelector('#role-note').after(detail);
 const labels=['بلندکردن آرام کانال اصلی از کف','بالابردن انشعاب‌ها تا سقف','هم‌راستاکردن، فلنج‌ها و اتصال نهایی','شبکهٔ کانال‌ها در جای خود قرار گرفت'];
 const assets={ready:false,clean:null,error:null};let pending;
 function preload(){
  if(pending)return pending;
  const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=async()=>{try{await img.decode()}catch{}resolve(img)};img.onerror=()=>reject(Error('Installation asset unavailable: '+src));img.src=src});
  pending=Promise.all([load('/installation/ducts-clean.webp'),load('/installation/ducts-cutout.webp')]).then(([clean,cutout])=>{
   assets.clean=clean;shadow.src=main.src=branches.src=cutout.src;finish.src='/journey/05-ducts.webp';assets.ready=true;onReady();
  }).catch(error=>{assets.error=error.message;onReady()});return pending;
 }
 function render(active,local,reduced){
  const enabled=active&&assets.ready&&!reduced;overlay.hidden=!enabled;detail.hidden=!enabled;
  if(!enabled)return null;
  const state=installationAt(local),ratio=assets.clean.naturalWidth/assets.clean.naturalHeight;
  const imageHeight=Math.min(stack.clientHeight,stack.clientWidth/ratio);
  const lift=(1-state.main)*imageHeight*.36,branchLift=(1-state.branches)*imageHeight*.31;
  main.style.transform=`translateY(${lift}px)`;branches.style.transform=`translateY(${branchLift}px)`;
  main.style.opacity=String(smooth(0,.07,local)*(1-state.finish));branches.style.opacity=String(smooth(.27,.35,local)*(1-state.finish));
  finish.style.opacity=String(state.finish);
  shadow.style.transform=`translateY(${imageHeight*.38}px) scaleY(.65)`;
  shadow.style.opacity=String(smooth(0,.05,local)*(1-smooth(.30,.72,local))*.12);
  document.querySelector('#installation-action').textContent=labels[state.stage];
  [...detail.querySelectorAll('span')].forEach((el,i)=>{el.dataset.active=String(i===Math.min(2,state.stage));el.dataset.complete=String(i<state.stage)});
  return {...state,lift,branchLift};
 }
 return {assets,preload,render};
}
