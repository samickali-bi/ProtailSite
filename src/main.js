import './style.css';
import * as T from 'three';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {makeMaterials} from './materials.js';
import {buildStore,stops} from './scene.js';
import {story} from './story.js';
gsap.registerPlugin(ScrollTrigger);
const $=s=>document.querySelector(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const lite=new URLSearchParams(location.search).has('lite');
let progress=0,current=-1,simple=matchMedia('(prefers-reduced-motion: reduce)').matches;
let dirty=true,store,renderer,camera,composer,scene,reflection,previousTime=0,aoPass,beautyPass;
function requestRender(){dirty=true}
const metrics={loaded:false,errors:[],objects:0,instances:0,phase:0};window.__protail=metrics;
window.addEventListener('error',e=>metrics.errors.push(e.message));
function go(p){scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:simple?'instant':'smooth'})}
$('.start').onclick=()=>go(.065);$('#replay').onclick=()=>go(0);
$('#complete').onclick=()=>go(.812);
const dialog=$('#chapters-dialog');$('#overview').onclick=()=>dialog.showModal();$('#close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
story.forEach((c,i)=>{const b=document.createElement('button');b.innerHTML=`<b>${fa(String(i+1).padStart(2,'0'))}</b><span>${c[0]}</span>`;b.onclick=()=>{dialog.close();go(stops[i]+.019)};$('#chapter-list').append(b)});
[0,1,3,5,6,7,8,10,11,12,13,14,15,16,17,18,20,21,22,23].forEach(i=>{const b=document.createElement('button');b.setAttribute('aria-label',story[i][0]);b.dataset.stage=i;b.innerHTML=`<span>${story[i][0]}</span>`;b.onclick=()=>go(stops[i]+.019);$('#timeline').append(b)});
$('#motion').setAttribute('aria-pressed',String(simple));$('#motion').onclick=()=>{simple=!simple;$('#motion').textContent=simple?'دوربین متحرک':'دوربین ثابت';$('#motion').setAttribute('aria-pressed',String(simple));requestRender()};
function ui(p){let i=0;while(i<stops.length-1&&p>=stops[i+1])i++;metrics.phase=i;document.querySelector('#role-note').textContent=i>=2&&i<=7?'مشاوره و نظارت پروتیل · اجرا توسط پیمانکار':'';if(i!==current){current=i;$('#chapter-number').textContent=`${fa(String(i+1).padStart(2,'0'))} / ۲۴`;$('#chapter-en').textContent=story[i][1];$('#chapter-title').textContent=story[i][0];$('#chapter-copy').textContent=story[i][2];$('#chapter-tags').innerHTML=story[i][3].map(t=>`<span>${t}</span>`).join('');$('#phase-label').textContent=story[i][0];[...$('#timeline').children].forEach(b=>{const selected=+b.dataset.stage===i;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'step':'false')})}$('#chapter').style.opacity=p>.042&&p<.975?'1':'0';$('#progress').style.width=p*100+'%';$('#percent').textContent=fa(Math.round(p*100))+'٪';$('#view-label').textContent=p<.79?'CONSTRUCTION / CUTAWAY VIEW':'PROTAIL / INTERIOR & ARCHITECTURE';}
ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{progress=s.progress;ui(progress);requestRender()}});
const keys=[
 [0,[49,34,60],[0,0,0]], [.055,[39,38,49],[0,0,-1]], [.095,[36,29,46],[0,0,0]], [.135,[45,27,54],[0,2,0]], [.175,[39,26,50],[0,2,0]],
 [.215,[29,27,33],[-5,0,-3]], [.255,[12,6.4,10],[0,5.7,-4]], [.295,[18,3.4,-12],[21,1.8,-17]], [.335,[18.7,3.1,-12],[17,1.8,-17]],
 [.375,[31,17,-30],[12,1,-16]], [.415,[-14,3.2,-9],[-12,2,-16]], [.455,[-12,2.8,-4],[-14,1.5,-9]], [.495,[-13,2.6,7],[-18,1.3,3.6]],
 [.535,[24,24,34],[0,1,0]], [.575,[12,2.6,6],[22,1.5,3]], [.615,[-5,2.5,-1],[-7,2,-5.8]], [.655,[-4,7.5,25],[-3,1.4,14]],
 [.695,[0,3.1,1],[-9,4,-12]], [.735,[27,22,34],[0,1,0]], [.775,[3.2,4,17],[1.6,1.7,-8]],
 [.805,[1.6,2.05,10],[1.6,1.8,-10]], [.82,[1.6,2.05,1],[-9,1.7,-5.8]], [.835,[-12.5,2.05,2],[-18,1.5,-3]], [.85,[-12.5,2.05,-5],[-18,1.7,-9]],
 [.865,[-14,2.05,-5.5],[-21.7,2,-10.2]], [.885,[-8,2.1,11],[17,1.8,12]], [.905,[0,2.1,17],[0,2,32]],
 [.93,[0,5,35],[0,4,19]], [.96,[32,25,54],[0,2,7]], [1,[49,38,65],[0,1,6]]
];
const v1=new T.Vector3(),v2=new T.Vector3(),target=new T.Vector3();
function positionCamera(p){let i=0;while(i<keys.length-2&&p>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=T.MathUtils.clamp((p-a[0])/(b[0]-a[0]),0,1),f=p<.775?T.MathUtils.clamp((u-.62)/.38,0,1):u,t=f*f*(3-2*f);v1.fromArray(a[1]);v2.fromArray(b[1]);camera.position.copy(v1).lerp(v2,t);v1.fromArray(a[2]);v2.fromArray(b[2]);target.copy(v1).lerp(v2,t);const mobile=innerWidth<700;if(simple){camera.position.set(47,36,57);target.set(0,1,0)}if((p<.79||p>.95)&&!simple){camera.position.sub(target).multiplyScalar(mobile?1.3:1.08).add(target)}camera.lookAt(target);camera.fov=mobile?66:p>.79&&p<.91?64:49;camera.aspect=innerWidth/innerHeight;camera.clearViewOffset();camera.updateProjectionMatrix();}
async function init(){
 await document.fonts.load('16px Yekan');
 renderer=new T.WebGLRenderer({canvas:$('#world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,lite?1:1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=!lite;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.outputColorSpace=T.SRGBColorSpace;renderer.info.autoReset=false;
 scene=new T.Scene();scene.background=new T.Color('#8cabb8');scene.fog=new T.FogExp2('#9eb7bb',.0028);camera=new T.PerspectiveCamera(49,innerWidth/innerHeight,.08,350);
 const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.65;
 new RGBELoader().load('/textures/studio.hdr',hdr=>{scene.environment=pmrem.fromEquirectangular(hdr).texture;hdr.dispose();scene.environmentIntensity=.75;requestRender()},undefined,()=>{});
 const hemi=new T.HemisphereLight('#dbeeff','#77705a',.8);scene.add(hemi);const sun=new T.DirectionalLight('#ffe8c5',1.8);sun.position.set(-32,45,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-44,right:44,top:40,bottom:-40,near:.5,far:140});sun.shadow.bias=-.00008;sun.shadow.normalBias=.035;scene.add(sun);
 RectAreaLightUniformsLib.init();const areaLights=[];for(const [x,z,w,h] of [[-13,1,16,30],[4,1,13,30],[18,1,9,30],[0,-10,40,5]]){const light=new T.RectAreaLight('#fff1d9',2,w,h);light.position.set(x,6.25,z);light.rotation.x=-Math.PI/2;scene.add(light);areaLights.push(light)}
 const entranceLight=new T.RectAreaLight('#cae6ff',1.5,40,5);entranceLight.position.set(0,3,18.8);entranceLight.lookAt(0,2,-10);scene.add(entranceLight);
 const materials=makeMaterials(renderer,requestRender);store=buildStore(scene,materials,requestRender);
 // Low-opacity planar reflection adds real scene reflections across the polished floor.
 reflection=new Reflector(new T.PlaneGeometry(47.5,38.5),{color:0x999c99,textureWidth:768,textureHeight:768,clipBias:.003,multisample:0});reflection.rotation.x=-Math.PI/2;reflection.position.set(0,.297,-.5);reflection.material.fragmentShader=reflection.material.fragmentShader.replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','gl_FragColor = vec4( blendOverlay( base.rgb, color ), 0.10 );');reflection.material.transparent=true;reflection.material.depthWrite=false;scene.add(reflection);
 composer=new EffectComposer(renderer);beautyPass=new RenderPass(scene,camera);composer.addPass(beautyPass);aoPass=new SSAOPass(scene,camera,Math.round(innerWidth*.65),Math.round(innerHeight*.65),16);aoPass.kernelRadius=.55;aoPass.minDistance=.002;aoPass.maxDistance=.12;composer.addPass(aoPass);const bloom=new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.035,.12,3);composer.addPass(bloom);composer.addPass(new OutputPass());
 metrics.objects=0;scene.traverse(()=>metrics.objects++);metrics.instances=store.totalInstances;metrics.loaded=true;metrics.inventory=store.inventory;
 $('#load-status').hidden=true;ui(progress);requestRender();
 function tick(time){requestAnimationFrame(tick);if(!dirty||document.hidden||time-previousTime<30)return;previousTime=time;dirty=false;renderer.info.reset();store.update(progress);positionCamera(progress);const indoors=progress>.79&&progress<.915;sun.intensity=indoors?.8:1.8;hemi.intensity=indoors?.3:.6;areaLights.forEach(l=>l.intensity=progress>.3?indoors?2:1:0);reflection.visible=indoors&&!simple&&!lite;scene.fog.density=indoors?0:.0028;renderer.toneMappingExposure=indoors?.95:.9;aoPass.enabled=indoors&&innerWidth>700&&!simple;beautyPass.enabled=true;aoPass.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);aoPass.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);if(lite||!indoors)renderer.render(scene,camera);else composer.render();metrics.calls=renderer.info.render.calls;metrics.triangles=renderer.info.render.triangles;metrics.camera=camera.position.toArray();metrics.progress=progress;}
 requestAnimationFrame(tick);
 window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);requestRender()});
 $('#world').addEventListener('webglcontextlost',e=>{e.preventDefault();$('#fallback').hidden=false});$('#world').addEventListener('webglcontextrestored',()=>{$('#fallback').hidden=true;requestRender()});
}
init().catch(error=>{console.error(error);metrics.errors.push(error.message);$('#load-status').hidden=true;$('#fallback').hidden=false;});








