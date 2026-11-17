import * as T from 'three';
import {chapters,smooth,shotAt} from './anime-story.js';
import './anime.css';
const $=s=>document.querySelector(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const metrics=window.__protail={loaded:false,mode:'anime-3d',progress:0,chapter:0,errors:[],peopleHeight:1.72,shelfHeight:1.8};
addEventListener('error',e=>metrics.errors.push(e.message));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let simple=reduced.matches,progress=0,target=0,playing=false,lastTime=0,dirty=true,current=-1;
const scene=new T.Scene();scene.background=new T.Color('#07151d');scene.fog=new T.FogExp2('#07151d',.009);
const camera=new T.PerspectiveCamera(44,innerWidth/innerHeight,.08,180);
let renderer;
try{renderer=new T.WebGLRenderer({canvas:$('#world'),antialias:true,powerPreference:'high-performance'});}catch(e){$('#loading').hidden=true;$('#failure').hidden=false;$('#reload').onclick=()=>location.reload();throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
scene.add(new T.HemisphereLight('#b3dfef','#284350',2.5));
const sun=new T.DirectionalLight('#ffe5ad',4);sun.position.set(-13,25,15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-23,right:23,top:22,bottom:-22,near:1,far:70});sun.shadow.normalBias=.04;scene.add(sun);
const rim=new T.DirectionalLight('#58d3df',2);rim.position.set(16,12,-16);scene.add(rim);
const ramp=new T.DataTexture(new Uint8Array([72,128,198,255]),4,1,T.RedFormat);ramp.needsUpdate=true;ramp.minFilter=ramp.magFilter=T.NearestFilter;
const material=color=>new T.MeshToonMaterial({color,gradientMap:ramp});
const M={floor:material('#d9d3b4'),edge:material('#285767'),wall:material('#abc0b9'),white:material('#e8e4ca'),steel:material('#496b79'),dark:material('#142c3b'),wood:material('#d49a55'),teal:material('#269d99'),gold:material('#edbd68'),red:material('#d66b52'),green:material('#65995a'),leaf:material('#3c7755'),skin:material('#d8a681'),pants:material('#243d50'),hair:material('#3a302d')};
const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,8),cylinder=new T.CylinderGeometry(1,1,1,12);
const outlineMaterial=new T.LineBasicMaterial({color:'#102c3a',transparent:true,opacity:.55});const edgeGeo=new T.EdgesGeometry(cube);
function box(g,x,y,z,w,h,d,m,outline=false){const o=new T.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;g.add(o);if(outline){const l=new T.LineSegments(edgeGeo,outlineMaterial);o.add(l)}return o}
function ball(g,x,y,z,r,m,sx=1,sy=1,sz=1){const o=new T.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(r*sx,r*sy,r*sz);o.castShadow=true;g.add(o);return o}
function tube(g,a,b,r,m){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=new T.Mesh(cylinder,m);o.position.copy(new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.castShadow=true;g.add(o);return o}
const root=new T.Group();scene.add(root);const layers=[];
function layer(name,start,end){const g=new T.Group();g.name=name;root.add(g);layers.push({g,start,end});return g}
const base=layer('site',0,.07);box(base,0,-.65,0,29,1,23,M.dark,true);box(base,0,-.1,0,27,.12,21,M.edge,true);
const ground=new T.Mesh(new T.PlaneGeometry(300,300),new T.MeshToonMaterial({color:'#0c242c',gradientMap:ramp}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.2;ground.receiveShadow=true;scene.add(ground);
const grid=new T.GridHelper(180,60,'#2b6a71','#173b47');grid.position.y=-1.17;scene.add(grid);
const plan=layer('blueprint',.01,.13);const planMaterial=new T.LineBasicMaterial({color:'#8cfff0'});
function line(points){const l=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),planMaterial);plan.add(l)}
line([[-12,.04,-9],[12,.04,-9],[12,.04,9],[-12,.04,9],[-12,.04,-9]]);
for(const x of [-6,-2,2])for(const z of [-3,3])line([[x-.6,.05,z-2.1],[x+.6,.05,z-2.1],[x+.6,.05,z+2.1],[x-.6,.05,z+2.1],[x-.6,.05,z-2.1]]);
for(let i=0;i<8;i++)line([[-11+i*3,.05,-8],[-11+i*3,.05,8]]);
const architecture=layer('architecture',.10,.27);box(architecture,0,.05,0,24,.25,18,M.floor,true);
for(let x=-12;x<=12;x+=4){box(architecture,x,2.65,-9,.18,5.3,.22,M.steel,true);if(x===-12||x===12)box(architecture,x,2.65,7,.18,5.3,.22,M.steel,true)}
box(architecture,0,2.5,-9,24,5,.18,M.wall,true);box(architecture,-12,1.25,-1,.18,2.5,16,M.wall,true);box(architecture,12,1.25,-1,.18,2.5,16,M.wall,true);
for(const z of [-9,0,8])box(architecture,0,5.3,z,24,.2,.18,M.steel,true);
for(let x=-11;x<12;x+=2)box(architecture,x,.19,0,.018,.005,17.8,M.white);
for(let z=-8;z<9;z+=2)box(architecture,0,.19,z,23.8,.005,.018,M.white);
const services=layer('services',.25,.40);
for(const x of [-8,0,8]){tube(services,[x,4.65,-8],[x,4.65,7],.24,M.steel);for(const z of [-5,0,5]){tube(services,[x,4.65,z],[x+1.3,4.65,z],.13,M.steel);box(services,x+1.3,4.46,z,.65,.13,.65,M.white,true)}}
for(const x of [-10,10])tube(services,[x,4.9,-8],[x,4.9,7],.055,M.red);
const lightMat=new T.MeshBasicMaterial({color:'#fff4bf'});
for(const x of [-5,3,9])for(const z of [-5,1,6]){box(services,x,4.25,z,2.3,.09,.16,M.dark);box(services,x,4.19,z,2.2,.035,.13,lightMat)}
for(let i=0;i<3;i++)box(services,-9+i*.55,1.2,-8.45,.45,2,.45,M.steel,true);
const racks=layer('equipment',.39,.56),shelfSlots=[];
for(const x of [-6,-2,2])for(const z of [-3,3]){
 box(racks,x,.27,z,1.35,.18,4.6,M.dark,true);box(racks,x,.98,z,.09,1.6,4.5,M.white,true);
 for(const end of [-2.2,2.2])box(racks,x,1,z+end,1.3,1.8,.08,M.wood,true);
 for(const y of [.42,.82,1.22,1.62]){box(racks,x,y,z,1.3,.065,4.5,M.white,true);for(const side of [-1,1])for(let n=0;n<12;n++)shelfSlots.push([x+side*.39,y+.14,z-2+n*.35])}
}
// Cold chain along the back; transparent door-like panels remain stylized and legible.
for(let x=-7;x<=9;x+=2){box(racks,x,1.32,-7.65,1.8,2.25,1.2,M.dark,true);box(racks,x,1.32,-6.98,1.65,2.02,.05,M.teal,true);for(const y of [.6,1.1,1.6,2.1])box(racks,x,y,-6.9,1.55,.06,.6,M.white);box(racks,x+.65,1.35,-6.85,.03,.4,.04,M.gold)}
// Produce to the right of entry, protein to the left near the exit.
const fruitSlots=[];
for(const z of [1.5,4.5]){box(racks,8,.58,z,4.2,.8,2,M.wood,true);for(const dx of [-1.4,0,1.4]){box(racks,8+dx,1.03,z,1.3,.16,1.8,M.gold,true);for(let a=0;a<5;a++)for(let b=0;b<6;b++)fruitSlots.push([8+dx-.48+a*.23,1.19,z-.65+b*.24])}}
for(const z of [-4,-.5,3]){box(racks,-9.7,.65,z,2.1,1.1,3,M.white,true);box(racks,-9.7,1.25,z,2,.15,2.9,M.teal,true);box(racks,-9.7,1.4,z-.1,1.8,.12,2.4,M.red)}
for(const x of [-8,-5]){box(racks,x,.68,7,1.1,1.1,1.8,M.wood,true);box(racks,x,1.28,7,1.6,.12,2.2,M.white,true);box(racks,x,1.65,7,.5,.45,.12,M.dark,true)}
const stock=layer('stock',.57,.70);let seed=71;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const productMaterials=['#df885b','#e6bc62','#70a99a','#9ebd68','#e1d6b8','#648ca5'].map(material);
const matrix=new T.Matrix4(),q=new T.Quaternion();
for(let color=0;color<6;color++){
 const slots=shelfSlots.filter((_,i)=>i%6===color),inst=new T.InstancedMesh(cube,productMaterials[color],slots.length);slots.forEach((p,i)=>{matrix.compose(new T.Vector3(...p),q,new T.Vector3(.21,.23+rand()*.07,.22));inst.setMatrixAt(i,matrix)});inst.castShadow=true;stock.add(inst);
 const fruit=fruitSlots.filter((_,i)=>i%3===color%3);if(color<3){const mesh=new T.InstancedMesh(sphere,[M.red,M.green,M.gold][color],fruit.length);fruit.forEach((p,i)=>{matrix.compose(new T.Vector3(...p),q,new T.Vector3(.13,.12,.13));mesh.setMatrixAt(i,matrix)});mesh.castShadow=true;stock.add(mesh)}
}
const signage=layer('identity',.52,.65);
function sign(text,x,y,z,w,h){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#173d47';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#f9e5b2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 125px Arial';ctx.fillText(text,512,135);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));mesh.position.set(x,y,z);signage.add(mesh)}
sign('PROTAIL',0,3.2,8.85,5.4,1.2);for(const x of [-3,3])box(signage,x,1.7,8.9,.09,3.4,.12,M.steel);
sign('FRESH',8,2.7,1.3,3,.6);sign('PROTEIN',-9.65,2.7,-3.8,2.6,.6);
const facade=layer('facade',.72,.80);
const glass=new T.MeshToonMaterial({color:'#92d9d3',gradientMap:ramp,transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide});
for(const x of [-7.7,-4.5,-1.3,1.9,5.1]){box(facade,x,1.6,8.85,3.1,2.8,.035,glass);box(facade,x-1.57,1.6,8.85,.045,2.8,.07,M.steel);box(facade,x,2.99,8.85,3.2,.05,.07,M.steel)}
for(const x of [-10.5,9.1]){box(facade,x-1.2,1.6,8.85,.07,2.8,.1,M.steel);box(facade,x+1.2,1.6,8.85,.07,2.8,.1,M.steel);box(facade,x,3,8.85,2.45,.09,.15,M.teal)}
const staff=layer('team',.67,.74),customers=layer('customers',.80,.87),actors=[];
function person(parent,x,z,color,index,walk=false){
 const rig=new T.Group();parent.add(rig);const shirt=material(color),hips=new T.Group();rig.add(hips);
 box(hips,0,1.06,0,.39,.48,.24,shirt,true);ball(hips,0,1.49,0,.17,M.skin, .84,1.1,.88);ball(hips,0,1.621,-.015,.165,M.hair,.86,.6,.92);
 const limbs=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.105,.84,0);rig.add(leg);box(leg,0,-.375,0,.13,.75,.15,M.pants);box(leg,0,-.78,.045,.15,.12,.27,M.dark);limbs.push(leg);
  const arm=new T.Group();arm.position.set(side*.25,1.22,0);rig.add(arm);box(arm,0,-.20,0,.12,.4,.13,shirt);ball(arm,0,-.43,0,.075,M.skin);limbs.push(arm);
 }
 rig.position.set(x,.22,z);actors.push({rig,limbs,x,z,index,walk});return rig;
}
person(staff,-8,6.4,'#209b9c',0);person(staff,8,3,'#209b9c',1);person(staff,-4.1,0,'#209b9c',2,true);
person(customers,.1,5,'#dfb86c',3,true);person(customers,6,2,'#b67369',4,true);person(customers,-8.2,2,'#7b9faa',5,true);person(customers,4,-4,'#d0c6a2',6,true);
// Small trees anchor the building to its surroundings.
const exterior=layer('outside',.10,.26);for(const x of [-13,13])for(const z of [-7,7]){tube(exterior,[x,0,z],[x,2.2,z],.12,M.wood);ball(exterior,x,2.7,z,.85,M.leaf,1,1.3,1)}
const balloonGroup=layer('opening',.80,.86);for(const x of [5.1,9])for(let i=0;i<4;i++){ball(balloonGroup,x+(i%2)*.3,2.1+Math.floor(i/2)*.5,9,.26,i%2?M.gold:M.teal);tube(balloonGroup,[x,.2,9],[x,2.3,9],.009,M.white)}
// Depth particles are actual world-space geometry, so parallax comes from the camera.
const pts=[];for(let i=0;i<140;i++)pts.push((rand()-.5)*130,8+rand()*45,(rand()-.5)*100);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));const stars=new T.Points(geo,new T.PointsMaterial({color:'#8dbab5',size:.08,transparent:true,opacity:.5}));scene.add(stars);
const chapterNav=$('#chapters');chapters.forEach((c,i)=>{const b=document.createElement('button');b.textContent=fa(i+1);b.setAttribute('aria-label',c.kicker);b.onclick=()=>go(c.at);chapterNav.append(b)});
const travel=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
function go(p){playing=false;$('#play').textContent='پخش خودکار ▷';scrollTo({top:p*travel(),behavior:simple?'instant':'smooth'})}
function updateUI(){let i=0;chapters.forEach((c,n)=>{if(progress>=c.at-.0005)i=n});if(i!==current){current=i;const c=chapters[i];$('#eyebrow').textContent=c.kicker;$('#title').textContent=c.title;$('#copy').textContent=c.copy;$('#role').hidden=!c.role;$('#chapter').textContent=`${fa(String(i+1).padStart(2,'0'))} / ${fa(chapters.length)}`;[...chapterNav.children].forEach((b,n)=>b.setAttribute('aria-current',String(n===i)));$('#story-copy').getAnimations().forEach(a=>a.cancel());if(!simple)$('#story-copy').animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'ease-out'})}$('#scrub').value=progress*1000;$('#percent').textContent=fa(Math.round(progress*100))+'٪';metrics.chapter=i;}
function update(p){
 for(const {g,start,end} of layers){const t=smooth(start,end,p);g.visible=t>.0001;g.scale.y=Math.max(.001,t);g.position.y=-.35*(1-t)}
 plan.visible=p<.33;plan.position.y=.03;planMaterial.opacity=1-smooth(.16,.3,p);planMaterial.transparent=true;
 for(const a of actors){const time=(p-(a.walk?.77:.68))*90,walk=a.walk&&p>.78;a.rig.position.set(a.x,.22,a.z+(walk?Math.sin(time*.16+a.index)*1.6:0));a.rig.rotation.y=walk?Math.cos(time*.16+a.index)>0?0:Math.PI: a.index%2?.5:-.4;a.limbs.forEach((l,i)=>l.rotation.x=walk?Math.sin(time*2.4+((i===1||i===2)?Math.PI:0))*.35: i%2?-.2:0)}
 balloonGroup.visible=p>=.80&&p<.94;
 const shot=shotAt(simple?Math.floor(p*6)/6:p);camera.position.fromArray(shot.eye);const look=new T.Vector3(...shot.target);
 if(innerWidth<=760){camera.fov=58;camera.position.sub(look).multiplyScalar(1.18).add(look);camera.setViewOffset(innerWidth,innerHeight,0,innerHeight*.10,innerWidth,innerHeight)}else{camera.fov=44;camera.setViewOffset(innerWidth,innerHeight,innerWidth*.13,0,innerWidth,innerHeight)}
 camera.lookAt(look);camera.updateProjectionMatrix();sun.intensity=4-smooth(.35,.6,p)*1.2;scene.fog.density=p>.44&&p<.78?.002:.009;grid.material.opacity=1-smooth(.18,.48,p)*.7;grid.material.transparent=true;
 renderer.render(scene,camera);metrics.progress=p;metrics.camera=camera.position.toArray();metrics.calls=renderer.info.render.calls;metrics.triangles=renderer.info.render.triangles;updateUI();
}
addEventListener('scroll',()=>{target=Math.max(0,Math.min(1,scrollY/travel()));dirty=true},{passive:true});addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;dirty=true});
$('#scrub').oninput=e=>{playing=false;go(+e.target.value/1000)};$('#next').onclick=()=>go(current===6?0:chapters[current+1].at);$('#restart').onclick=()=>go(0);$('#brand').onclick=e=>{e.preventDefault();go(0)};
$('#play').onclick=()=>{if(simple)return;if(progress>.999){progress=target=0;scrollTo({top:0,behavior:'instant'})}playing=!playing;$('#play').textContent=playing?'توقف Ⅱ':'پخش خودکار ▷';dirty=true};
function motionUI(){document.body.classList.toggle('reduced',simple);$('#motion').setAttribute('aria-pressed',String(simple));$('#motion').textContent=simple?'حرکت کامل':'کاهش حرکت';$('#play').disabled=simple;$('#play').textContent=playing?'توقف Ⅱ':'پخش خودکار ▷';dirty=true}
$('#motion').onclick=()=>{simple=!simple;playing=false;motionUI()};reduced.addEventListener('change',()=>{simple=reduced.matches;playing=false;motionUI()});motionUI();
addEventListener('keydown',e=>{if(e.target.closest('button,input,a')||e.ctrlKey||e.metaKey||e.altKey)return;const p=({ArrowDown:chapters[Math.min(6,current+1)].at,ArrowUp:chapters[Math.max(0,current-1)].at,Home:0,End:1})[e.key];if(p!==undefined){e.preventDefault();go(p)}});
$('#world').addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;$('#failure').hidden=false});$('#reload').onclick=()=>location.reload();
function tick(time){requestAnimationFrame(tick);const dt=Math.min(.05,(time-lastTime)/1000||.016);lastTime=time;if(document.hidden)return;if(playing){target=Math.min(1,target+dt/65);scrollTo({top:target*travel(),behavior:'instant'});if(target>=1){playing=false;$('#play').textContent='پخش خودکار ▷'}}const delta=target-progress;if(Math.abs(delta)>.00001){progress=simple?target:progress+delta*(1-Math.exp(-dt*9));dirty=true}else if(progress!==target){progress=target;dirty=true}if(dirty){update(progress);dirty=false}}
metrics.loaded=true;$('#loading').hidden=true;target=scrollY/travel();update(0);requestAnimationFrame(tick);
