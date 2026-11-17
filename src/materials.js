import * as T from 'three';
export function makeMaterials(renderer,onChange){
 const loader=new T.TextureLoader();const aniso=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
 const texture=(path,x=1,y=1,color=true)=>{const t=loader.load(path,onChange);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(x,y);t.anisotropy=aniso;if(color)t.colorSpace=T.SRGBColorSpace;return t};
 let seed=103;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function canvasTexture(draw,size=1024){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=aniso;return t}
 const terrazzo=canvasTexture((ctx,s)=>{ctx.fillStyle='#aaa99e';ctx.fillRect(0,0,s,s);for(let i=0;i<60000;i++){const n=120+random()*75;ctx.fillStyle=`rgba(${n},${n},${n-8},${.05+random()*.22})`;ctx.fillRect(random()*s,random()*s,random()*3+.5,random()*3+.5)}for(let i=0;i<2800;i++){ctx.fillStyle=['#7a796e','#d1cdc1','#939083','#ddd8c9'][i%4];ctx.beginPath();ctx.ellipse(random()*s,random()*s,random()*2+.3,random()*1.3+.3,random()*6,0,7);ctx.fill()}ctx.strokeStyle='#74756b';ctx.lineWidth=1.4;ctx.strokeRect(0,0,s,s);});terrazzo.repeat.set(24,20);
 const concrete=canvasTexture((ctx,s)=>{ctx.fillStyle='#85837a';ctx.fillRect(0,0,s,s);for(let i=0;i<120000;i++){const n=80+random()*100;ctx.fillStyle=`rgba(${n},${n},${n-5},.13)`;ctx.fillRect(random()*s,random()*s,random()*6,random()*6)}});concrete.repeat.set(10,8);
 const dirt=canvasTexture((ctx,s)=>{ctx.fillStyle='#746552';ctx.fillRect(0,0,s,s);for(let i=0;i<180000;i++){const n=45+random()*90;ctx.fillStyle=`rgba(${n+18},${n+7},${n-10},.4)`;ctx.fillRect(random()*s,random()*s,random()*5+.3,random()*4+.3)}});dirt.repeat.set(14,14);
 const brushed=canvasTexture((ctx,s)=>{ctx.fillStyle='#a0a0a0';ctx.fillRect(0,0,s,s);for(let i=0;i<8000;i++){ctx.fillStyle=`rgba(220,220,220,${random()*.2})`;ctx.fillRect(random()*s,random()*s,random()*600,random()*.7+.1)}});brushed.colorSpace=T.NoColorSpace;brushed.repeat.set(2,2);
 const asphalt=canvasTexture((ctx,s)=>{ctx.fillStyle='#32383a';ctx.fillRect(0,0,s,s);for(let i=0;i<170000;i++){const n=30+random()*65;ctx.fillStyle=`rgb(${n},${n+2},${n+3})`;ctx.fillRect(random()*s,random()*s,random()*2,random()*2)}});asphalt.repeat.set(10,8);
 const M={
  concrete:new T.MeshStandardMaterial({map:concrete,roughness:.9,bumpMap:concrete,bumpScale:.045}),
  dirt:new T.MeshStandardMaterial({map:dirt,roughness:1,bumpMap:dirt,bumpScale:.15}),
  floor:new T.MeshPhysicalMaterial({map:terrazzo,roughness:.24,metalness:.05,clearcoat:.48,clearcoatRoughness:.22,envMapIntensity:.6}),
  wall:new T.MeshStandardMaterial({color:'#deddd5',roughness:.92}),
  tile:new T.MeshStandardMaterial({color:'#eeeae0',roughness:.28}),
  steel:new T.MeshStandardMaterial({color:'#c3c8cb',metalness:.95,roughness:.27,bumpMap:brushed,bumpScale:.008,envMapIntensity:1.2}),
  galvanized:new T.MeshStandardMaterial({color:'#9da3a4',metalness:.8,roughness:.55}),
  black:new T.MeshStandardMaterial({color:'#131c20',roughness:.38,metalness:.35}),
  shelf:new T.MeshStandardMaterial({color:'#deded7',roughness:.36,metalness:.5}),
  green:new T.MeshStandardMaterial({color:'#34483c',roughness:.48,metalness:.25}),
  blue:new T.MeshStandardMaterial({color:'#3b9bc5',roughness:.4,metalness:.35}),
  wood:new T.MeshStandardMaterial({map:texture('/textures/oak-color.jpg',1,1),bumpMap:texture('/textures/oak-bump.jpg',1,1,false),bumpScale:.025,roughnessMap:texture('/textures/oak-roughness.jpg',1,1,false),roughness:.65,color:'#b49c76'}),
  glass:new T.MeshPhysicalMaterial({color:'#d8e9e9',metalness:.05,roughness:.065,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide,envMapIntensity:1.8,clearcoat:1}),
  displayGlass:new T.MeshPhysicalMaterial({color:'#dae6df',roughness:.09,metalness:.18,transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide,envMapIntensity:1.5}),
  light:new T.MeshStandardMaterial({color:'#fff2d4',emissive:'#fff0c9',emissiveIntensity:5,roughness:.4}),
  coldLight:new T.MeshStandardMaterial({color:'#e6faff',emissive:'#c6eeff',emissiveIntensity:3}),
  red:new T.MeshStandardMaterial({color:'#ab3229',roughness:.4}),
  copper:new T.MeshStandardMaterial({color:'#b77448',roughness:.35,metalness:.8}),
  water:new T.MeshStandardMaterial({color:'#2476a2',roughness:.4,metalness:.3}),
  drain:new T.MeshStandardMaterial({color:'#956341',roughness:.75}),
  yellow:new T.MeshStandardMaterial({color:'#e1ae39',roughness:.55}),
  asphalt:new T.MeshStandardMaterial({map:asphalt,roughness:.97,bumpMap:asphalt,bumpScale:.025}),
  leaf:new T.MeshStandardMaterial({color:'#446337',roughness:.85,side:T.DoubleSide}),
 };
 const foodAtlas=loader.load('/textures/fresh-food-atlas.png',onChange);foodAtlas.colorSpace=T.SRGBColorSpace;foodAtlas.anisotropy=aniso;
 function foodTexture(quadrant){const t=foodAtlas.clone();t.repeat.set(.48,.48);t.offset.set(quadrant%2*.5+.01,quadrant<2?.51:.01);t.needsUpdate=true;return t}
 return {M,canvasTexture,random,foodTexture};
}
