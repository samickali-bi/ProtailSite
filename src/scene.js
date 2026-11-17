import * as T from 'three';
import {geometryKit} from './geometry.js';
import {productKit} from './products.js';
import logoUrl from '../Protail Logo/Protail_Logo.png';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const stops=[0,.055,.095,.135,.175,.215,.255,.295,.335,.375,.415,.455,.495,.535,.575,.615,.655,.695,.735,.775,.805,.865,.915,.96];

export function buildStore(scene,materials,onChange){
 const {M,canvasTexture,random}=materials,K=geometryKit();
 const {box,cyl,ellipsoid,pipe,straight,line,panel}=K;
 const stages=[],labels=[],inventory=[],textCache=new Map();
 const manifest=(stage,name,count=1)=>inventory.push({stage,name,count});
 function stage(index,name){const g=new T.Group();g.name=name;g.userData.stage=index;scene.add(g);stages.push(g);return g}
 function sub(parent,x=0,y=0,z=0,rot=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;parent.add(g);return g}
 function textTexture(text,subtitle='',bg='#22382f',color='#f5eedb',w=1024,h=256){const key=[text,subtitle,bg,color,w,h].join('|');if(textCache.has(key))return textCache.get(key);const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d5b576';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.1,h*.13);ctx.lineTo(w*.9,h*.13);ctx.stroke();ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';ctx.font=`${Math.floor(h*.37)}px Yekan`;ctx.fillText(text,w/2,h*.46);ctx.font=`${Math.floor(h*.095)}px Arial`;ctx.direction='ltr';ctx.fillStyle='#ccb77f';ctx.fillText(subtitle,w/2,h*.8);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;textCache.set(key,tex);return tex}
 function sign(parent,text,subtitle,x,y,z,w,h,rot=0,bg){const g=sub(parent,x,y,z,rot);box(g,0,0,-.06,w+.08,h+.08,.1,M.black);const p=panel(g,textTexture(text,subtitle,bg),0,0,.005,w,h);labels.push(p);return g}
 function slats(parent,x,y,z,w,h,spacing=.14){const n=Math.floor(w/spacing);for(let i=0;i<n;i++)box(parent,x-w/2+i*spacing,y,z,.065,h,.08,M.wood)}
 function strip(parent,x,y,z,w,d=.04,cold=false){return box(parent,x,y,z,w,.035,d,cold?M.coldLight:M.light)}
 function legs(parent,w,d,h=.85){for(const x of [-w/2+.08,w/2-.08])for(const z of [-d/2+.08,d/2-.08])cyl(parent,x,h/2,z,.035,h,M.steel)}
 const products=productKit(materials,K);

 // 00 / Full-size land; no floating miniature base.
 const land=stage(0,'Site and soil');box(land,0,-.6,0,160,1,140,M.dirt);
 for(let i=0;i<75;i++){const x=(random()-.5)*130,z=(random()-.5)*110;if(Math.abs(x)<31&&Math.abs(z)<31)continue;ellipsoid(land,x,-.04,z,.25+random()*.4,.05+random()*.1,.2+random()*.4,M.concrete)}
 for(let x=-27;x<28;x+=6){straight(land,[x,.05,-23],[x,1,-23],.035,M.red);straight(land,[x,.05,22],[x,1,22],.035,M.red)}
 manifest(0,'زمین و نشانه‌گذاری محدوده');

 // 01 / Layout includes the sales floor, prep rooms, cold rooms, storage and parking.
 const plan=stage(1,'Layout and zoning');
 for(const z of [-20,-13,-9,12,19])line(plan,[[-24,.05,z],[24,.05,z]]);
 for(const x of [-24,-15,-8,0,8,16,24])line(plan,[[x,.05,-20],[x,.05,19]]);
 for(const z of [0,6])for(const x of [-9,-2,5,12])line(plan,[[x-1.1,.06,z-3],[x+1.1,.06,z-3],[x+1.1,.06,z+3],[x-1.1,.06,z+3],[x-1.1,.06,z-3]]);
 for(let x=-28;x<29;x+=3)line(plan,[[x,.06,24],[x,.06,30]]);
 manifest(1,'لی‌اوت تمام بخش‌ها و پارکینگ');

 // 02 / Footings, grade beams, column anchor bolts.
 const foundation=stage(2,'Foundations and leveling');
 for(const x of [-23,-12,0,12,23])for(const z of [-19,0,18]){box(foundation,x,-.1,z,2,.5,2,M.concrete);box(foundation,x,.18,z,.65,.08,.65,M.steel);for(const dx of [-.24,.24])for(const dz of [-.24,.24])cyl(foundation,x+dx,.25,z+dz,.025,.15,M.steel)}
 for(const z of [-19,0,18])box(foundation,0,-.1,z,47,.35,.6,M.concrete);
 for(const x of [-23,0,23])box(foundation,x,-.1,-.5,.6,.35,38,M.concrete);
 manifest(2,'پی و شناژ و بولت ستون',15);

 // 03 / I-section steelwork, purlins, diagonals and an eventual roof.
 const frame=stage(3,'Steel frame');
 function column(x,z){box(frame,x,3.4,z,.14,6.5,.34,M.galvanized);for(const dx of [-.18,.18])box(frame,x+dx,3.4,z,.06,6.5,.58,M.galvanized)}
 for(const x of [-23,0,23])for(const z of [-19,-6,7,18])column(x,z);
 for(const z of [-19,-6,7,18]){box(frame,0,6.65,z,47,.4,.17,M.galvanized);box(frame,0,6.9,z,47,.065,.5,M.galvanized);box(frame,0,6.4,z,47,.065,.5,M.galvanized);for(let x=-22;x<22;x+=3)straight(frame,[x,6.45,z],[x+3,6.87,z],.035,M.galvanized)}
 for(const x of [-20,-12,-4,4,12,20])box(frame,x,6.97,-.5,.1,.14,38,M.galvanized);
 manifest(3,'ستون و تیر و بادبند و پرلین');

 // 04 / Walls and floor. The floor is lowered only for the underground inspection chapter.
 const shell=stage(4,'Envelope and partitions');
 const slab=box(shell,0,.12,-.5,48,.25,39,M.concrete);
 const finishFloor=box(shell,0,.27,-.5,47.7,.045,38.7,M.floor);
 box(shell,0,3.4,-20,48,6.5,.28,M.wall);box(shell,-24,3.4,-.5,.28,6.5,39,M.wall);box(shell,24,3.4,-.5,.28,6.5,39,M.wall);
 const backWall=box(shell,0,1.8,-13,47.5,3.2,.16,M.wall);
 for(const x of [-16,-8,0,8,16])box(shell,x,1.8,-16.5,.14,3.2,7,M.wall);
 for(let x=-23;x<24;x+=.8)box(shell,x,.47,-12.89,.75,.3,.04,M.tile);
 const roof=new T.Group();shell.add(roof);box(roof,0,7.12,-.5,48.7,.2,39.8,M.black);
 manifest(4,'دیوار، تیغه، کف و سقف کامل');

 // 05 / Visible trenches, sanitary connections, inspection chambers and earth pit.
 const below=stage(5,'Water drainage and earthing');
 for(const z of [-10,-16,10]){pipe(below,[[-22,.1,z],[0,.1,z],[22,.1,z]],.11,z===10?M.drain:M.water);for(const x of [-18,-10,-2,6,14,21]){pipe(below,[[x,.1,z],[x,.1,z+1.4],[x,1.2,z+1.4]],.055,M.water);cyl(below,x,.25,z+1.8,.2,.08,M.steel);for(let j=-2;j<=2;j++)box(below,x+j*.06,.3,z+1.8,.025,.012,.32,M.black)}}
 pipe(below,[[-20,.08,-17],[-20,.08,10],[27,.08,10],[27,-.5,22]],.18,M.drain);
 for(const [x,z] of [[27,22],[27,-18]]){cyl(below,x,-.1,z,.65,.55,M.concrete);cyl(below,x,.2,z,.5,.04,M.black);for(let n=0;n<8;n++)box(below,x,.23,z-.35+n*.1,.7,.01,.025,M.steel)}
 box(below,-28,.1,-16,1.2,.2,1.2,M.concrete);cyl(below,-28,-.3,-16,.05,1.5,M.copper);pipe(below,[[-28,.2,-16],[-24,.2,-16],[-24,.2,-19],[22,.2,-19]],.018,M.copper);sign(below,'ارت','EARTHING',-28,1.1,-16,1.5,.5);
 manifest(5,'آب، فاضلاب، کف‌شورها، چاه‌های بازدید، چاه ارت و هم‌بندی');

 // 06 / Real duct runs, flanges, drops, louvers, insulated refrigeration lines and rooftop plant.
 const mechanical=stage(6,'HVAC and refrigeration services');
 for(const x of [-16,0,16]){
  straight(mechanical,[x,5.9,-18],[x,5.9,16],.32,M.galvanized);
  for(let z=-17;z<17;z+=1.4){const ring=new T.Mesh(new T.TorusGeometry(.325,.018,6,30),M.steel);ring.position.set(x,5.9,z);mechanical.add(ring)}
  for(const z of [-7,3,12]){straight(mechanical,[x,5.9,z],[x+2,5.9,z],.17,M.galvanized);box(mechanical,x+2,5.75,z,.75,.14,.75,M.shelf);for(let j=-3;j<=3;j++)box(mechanical,x+2+j*.085,5.66,z,.025,.03,.55,M.black)}
 }
 for(const x of [-21,-14,-7,0,7,14,21]){straight(mechanical,[x,6.9,-2],[x,5.8,-2],.012,M.steel)}
 pipe(mechanical,[[-22,4.6,-19],[-22,4.6,-10],[21,4.6,-10]],.075,M.black);pipe(mechanical,[[-21.7,4.6,-19],[-21.7,4.6,-10],[21,4.6,-10]],.035,M.copper);
 const plant=sub(mechanical,15,7.5,-15);box(plant,0,.55,0,5,1.1,3,M.galvanized);for(const x of [-1.5,0,1.5]){cyl(plant,x,1.15,0,.55,.08,M.black);for(let j=0;j<8;j++){const blade=box(plant,x,1.21,0,.8,.02,.07,M.steel);blade.rotation.y=j*Math.PI/4}}for(let j=0;j<12;j++)box(plant,0,.2+j*.07,1.52,4.5,.025,.02,M.black);
 manifest(6,'کانال، دریچه، فلنج، لوله برودت و یونیت بام');

 // 07 / Electrical distribution boards, actual cable trays, lamps and fire services.
 const electrical=stage(7,'Power lighting and fire safety');
 const board=sub(electrical,21,0,-17);box(board,0,1.5,0,2.8,2.5,.6,M.shelf);for(const x of [-.8,.15,.95]){box(board,x,1.5,.32,.8,2.3,.04,M.galvanized);box(board,x+.25,1.4,.37,.04,.2,.03,M.black);for(let n=0;n<4;n++){cyl(board,x-.17+n*.1,2.3,.37,.025,.02,n%2?M.red:M.green).rotation.x=Math.PI/2}}sign(board,'تابلو برق','MAIN DISTRIBUTION',0,3.05,0,2.5,.45);
 for(const x of [-11,11]){for(const dx of [-.22,.22])box(electrical,x+dx,5.35,-.5,.025,.15,36,M.steel);for(let z=-18;z<18;z+=.5)box(electrical,x,5.3,z,.45,.025,.035,M.steel);for(let n=0;n<4;n++)straight(electrical,[x-.12+n*.08,5.4,-18],[x-.12+n*.08,5.4,17],.018,n%2?M.red:M.black)}
 for(const x of [-19,-12,-5,2,9,16,22])for(const z of [-8,0,8,15]){box(electrical,x,5.7,z,.12,.15,2.7,M.black);strip(electrical,x,5.61,z,.08,2.55);straight(electrical,[x,6.8,z],[x,5.78,z],.009,M.steel)}
 for(const z of [-8,4,14]){straight(electrical,[-23,6.3,z],[23,6.3,z],.035,M.red);for(const x of [-16,-5,6,17]){cyl(electrical,x,6.23,z,.06,.11,M.red);ellipsoid(electrical,x,6.1,z,.055,.035,.055,M.steel)}}
 for(const x of [-23,23])for(const z of [-11,8]){cyl(electrical,x,1.05,z,.11,.65,M.red);pipe(electrical,[[x,1.4,z],[x+.18,1.5,z],[x+.2,1.2,z]],.015,M.black);box(electrical,x,2.2,z,.18,.28,.08,M.red)}
 manifest(7,'تابلو، کابل، سینی کابل، روشنایی، اطفا و کپسول');

 // 08 / Rack with server chassis, patch panels, switch ports, UPS, CCTV and access points.
 const network=stage(8,'Network server CCTV and UPS');
 const rack=sub(network,16.8,0,-16.9,.08);box(rack,0,1.45,0,1.15,2.4,1,M.black);for(const x of [-.54,.54])box(rack,x,1.45,.53,.04,2.4,.04,M.steel);
 for(let n=0;n<12;n++){const y=.45+n*.17;box(rack,0,y,.53,1,.13,.05,M.galvanized);for(let p=0;p<10;p++){box(rack,-.4+p*.085,y,.565,.045,.045,.01,M.black);if(n%3===0)box(rack,-.39+p*.085,y+.03,.575,.012,.012,.01,M.coldLight)}if(n<4)for(let j=0;j<12;j++)box(rack,-.35+j*.065,y,.58,.025,.06,.01,M.black)}
 for(let p=0;p<14;p++)pipe(rack,[[-.4+p*.06,1.95,.6],[-.4+p*.06,2.12+p*.006,.7],[.48,2.13+p*.006,.72],[.5,1.5,.7]],.008,p%2?M.blue:M.yellow);
 box(network,18.4,.65,-17,.7,.75,.8,M.black);sign(network,'سرور و شبکه','SERVER / SWITCH / UPS',17.2,3.4,-17,3.3,.65);
 for(const x of [-19,-5,9,21]){straight(network,[x,5.15,-17],[x,5.15,14],.028,M.blue);pipe(network,[[x,5.15,14],[x,4.8,14],[x,1,14]],.023,M.blue)}
 for(const [x,z] of [[-22,-11],[22,-11],[-22,16],[22,16],[0,0]]){box(network,x,4.8,z,.25,.12,.25,M.shelf);const body=ellipsoid(network,x,4.6,z,.17,.13,.17,M.tile);ellipsoid(network,x,4.53,z+.1,.07,.06,.07,M.black)}
 for(const x of [-14,0,14]){cyl(network,x,5.05,4,.2,.06,M.tile);cyl(network,x,5.01,4,.03,.01,M.coldLight)}
 manifest(8,'رک، سرور، پچ پنل، سوئیچ، کابل پچ، UPS، دوربین و Wi-Fi');

 // 09 / Receiving area, steel racks, pallets, cartons, staff lockers, office.
 const back=stage(9,'Warehouse receiving office staff');
 for(const x of [11,15,19,22]){for(const xx of [-.65,.65])for(const z of [-19,-14])box(back,x+xx,1.8,z,.08,3,.08,M.blue);for(const y of [.45,1.4,2.4,3.2]){box(back,x,y,-16.5,1.5,.08,5.2,M.wood);for(let n=0;n<4;n++)box(back,x,y+.3,-18.5+n*1.2,1,.55,.9,M.concrete)}}
 for(const x of [-4,-2,0,2]){box(back,x,1.25,-18.8,1,1.9,.6,M.galvanized);for(let j=0;j<5;j++)box(back,x,1.7+j*.07,-18.48,.6,.025,.02,M.black);box(back,x+.3,1.2,-18.46,.035,.2,.03,M.black)}
 box(back,-5,.8,-15,2.5,.1,1.1,M.wood);legs(sub(back,-5,0,-15),2.5,1.1,.75);box(back,-5,1.2,-15,.75,.45,.06,M.black);box(back,-5,1.2,-14.96,.67,.37,.01,M.blue);
 box(back,23.7,1.7,-17,.1,2.8,3.5,M.steel);for(let y=.4;y<3;y+=.15)box(back,23.6,y,-17,.06,.025,3.4,M.black);
 for(let i=0;i<3;i++){cyl(back,8+i*.75,.75,-18.8,.26,.9,i===1?M.green:M.black);cyl(back,8+i*.75,1.21,-18.8,.28,.05,M.steel)}
 manifest(9,'بارانداز، قفسه انبار، پالت، کارتن، رختکن، دفتر و مخازن پسماند');

 // 10 / Separate insulated cold rooms with door hardware, unit coolers and strip curtains.
 const cold=stage(10,'Cold rooms');
 for(let i=0;i<3;i++){const x=-19+i*8;const room=sub(cold,x,0,-16.6);box(room,0,.35,0,7.1,.1,6.2,M.steel);for(const xx of [-3.5,3.5])box(room,xx,1.9,0,.12,3.1,6.2,M.tile);box(room,0,1.9,-3.05,7,3.1,.12,M.tile);box(room,0,1.9,3.05,7,3.1,.12,M.tile);for(let xx=-3;xx<3;xx+=.6)box(room,xx,1.9,3.13,.015,3,.02,M.steel);box(room,0,1.65,3.18,1.7,2.5,.12,M.galvanized);box(room,.62,1.6,3.3,.055,.55,.08,M.black);box(room,-.6,2.45,3.3,.15,.15,.08,M.black);box(room,0,3.5,0,7.2,.12,6.3,M.tile);box(room,0,2.9,-2.55,2,.6,.7,M.galvanized);for(const xx of [-.55,.55]){cyl(room,xx,2.9,-2.12,.22,.04,M.black).rotation.x=Math.PI/2;for(let k=0;k<6;k++){const b=box(room,xx,2.9,-2.08,.35,.035,.02,M.steel);b.rotation.z=k*Math.PI/3}}sign(room,['سردخانه گوشت','سردخانه مرغ','سردخانه ماهی'][i],'COLD ROOM',0,3.02,3.3,2.6,.45);}
 manifest(10,'سردخانه مستقل پشت هر غرفه با پنل، در و اواپراتور',3);

 // 11 / Three recognisable chilled counters and hygienic stainless prep workspaces.
 const protein=stage(11,'Butcher poultry fish stainless equipment');
 const proteinGoods=stage(18,'Fresh protein products');
 const meatMap=materials.foodTexture(3);const meat=new T.MeshPhysicalMaterial({map:meatMap,bumpMap:meatMap,bumpScale:.012,color:'#ffffff',roughness:.38,clearcoat:.2});const fat=new T.MeshStandardMaterial({color:'#e9c4ac',roughness:.5});const poultry=new T.MeshStandardMaterial({color:'#e8c4a0',roughness:.48});const fish=new T.MeshStandardMaterial({color:'#8caaa8',metalness:.55,roughness:.3});
 for(let i=0;i<3;i++){
  const x=-18+i*8;const prep=sub(protein,x,0,-11.65);legs(prep,5.8,1,.86);box(prep,0,.95,0,6,.1,1.1,M.steel);box(prep,0,.5,0,5.8,.06,.8,M.steel);box(prep,1.8,.98,0,1.1,.03,.7,M.black,true);box(prep,1.8,.88,0,.95,.2,.55,M.steel,true);pipe(prep,[[2.15,1,-.35],[2.15,1.5,-.35],[1.85,1.5,-.35],[1.85,1.3,-.2]],.025,M.steel);box(prep,-1.8,1.05,0,1.2,.04,.65,M.tile);cyl(prep,-.7,1.15,0,.22,.3,M.steel);box(prep,-.7,1.4,0,.5,.2,.15,M.steel);box(prep,-.7,1.6,0,.2,.15,.03,M.black);
  const counter=sub(protein,x,0,-8.6);box(counter,0,.55,0,6.7,.65,1.65,M.green,true);slats(counter,0,.7,.84,6.5,.55);box(counter,0,.35,0,6.6,.12,1.6,M.black);box(counter,0,1,0,6.7,.1,1.7,M.steel);box(counter,0,1.13,0,6.4,.06,1.4,M.tile);box(counter,0,1.67,-.7,6.7,.05,.3,M.steel);const front=box(counter,0,1.45,.72,6.6,.7,.025,M.displayGlass);front.rotation.x=-.18;box(counter,0,1.8,0,6.7,.025,1.4,M.displayGlass);for(const xx of [-3.3,3.3])box(counter,xx,1.45,0,.025,.7,1.5,M.displayGlass);strip(counter,0,1.71,-.56,6.4,.025,true);
  for(let n=0;n<7;n++){const px=x-2.7+n*.85,pz=-8.6;box(proteinGoods,px,1.19,pz,.76,.035,1.1,M.black,true);for(let k=0;k<3;k++){if(i===0){const steak=ellipsoid(proteinGoods,px+(k%2)*.2-.1,1.27,pz-.35+k*.3,.22,.065,.16,meat);steak.rotation.y=k*.7;pipe(proteinGoods,[[px-.15,1.33,pz-.35+k*.3],[px,1.335,pz-.4+k*.3],[px+.15,1.33,pz-.35+k*.3]],.009,fat)}else if(i===1){ellipsoid(proteinGoods,px,1.29,pz-.32+k*.32,.22,.1,.16,poultry);ellipsoid(proteinGoods,px+.16,1.27,pz-.32+k*.32,.13,.055,.07,poultry)}else{const f=ellipsoid(proteinGoods,px,1.28,pz-.32+k*.32,.29,.065,.08,fish);f.rotation.y=.1;ellipsoid(proteinGoods,px-.2,1.32,pz-.32+k*.32,.012,.012,.012,M.black);const tail=box(proteinGoods,px+.31,1.28,pz-.32+k*.32,.09,.015,.15,fish);tail.rotation.y=.6}}}
 }
 manifest(11,'میز، سینک، شیر، طبقه استیل، ترازو و ویترین گوشت و مرغ و ماهی',3);

 // 12 / Timber produce islands with actual stepped crates, slats, price rails and scales.
 const produce=stage(12,'Produce wood displays');const produceGoods=stage(18,'Fruit and vegetable stock');
 for(const z of [-3,3.6,9.6]){const island=sub(produce,-18,0,z);box(island,0,.6,0,6,.65,3.1,M.wood,true);slats(island,0,.65,1.58,5.9,.7);box(island,0,.34,0,6.1,.12,3.2,M.black);for(let row=0;row<3;row++)for(let col=0;col<4;col++){const xx=-2.2+col*1.45,zz=-.95+row*.9,yy=1+row*.17;box(island,xx,yy,zz,1.38,.08,.83,M.wood);for(const dx of [-.68,.68])box(island,xx+dx,yy+.09,zz,.035,.2,.85,M.wood);for(const dz of [-.4,.4])box(island,xx,yy+.1,zz+dz,1.38,.22,.035,M.wood);panel(island,textTexture('تازه‌چین','FRESH / DAILY','#141f19'),xx,yy+.09,zz+.43,.5,.13);for(let n=0;n<24;n++)products.fruit(produceGoods,-18+xx-.48+(n%6)*.19,yy+.16+Math.floor(n/6)*.015,z+zz-.25+Math.floor(n/6)*.16,(row+col)%6,.85+random()*.15)}}
 box(produce,-21,1.1,12.4,1.2,.15,.9,M.steel);box(produce,-21,1.5,12.4,.5,.5,.06,M.black);manifest(12,'استند چوبی طبقه‌دار، سبد، قیمت‌نما و ترازوی میوه',3);

 // 13 / Modular gondolas with slotted uprights, brackets, toe kicks and individual price tickets.
 const shelves=stage(13,'Gondola shelving');const shelfStock=stage(18,'Packaged merchandise');const shelfLocations=[];
 for(const x of [-9,-2,5,12])for(const z of [-1.5,6]){
  const g=sub(shelves,x,0,z);shelfLocations.push([x,z]);box(g,0,.4,0,2.2,.22,5.6,M.black);box(g,0,1.55,0,.075,2.4,5.6,M.shelf);
  for(const zz of [-2.75,0,2.75]){box(g,0,1.58,zz,.1,2.7,.1,M.black);for(let y=.65;y<2.8;y+=.12)box(g,.056,y,zz,.012,.045,.04,M.steel)}
  for(const side of [-1,1])for(let level=0;level<5;level++){const y=.55+level*.46;box(g,side*.58,y,0,1.05,.045,5.55,M.shelf);box(g,side*1.1,y+.025,0,.055,.08,5.6,M.black);for(const zz of [-2.6,0,2.6]){const bracket=box(g,side*.45,y-.045,zz,.8,.06,.04,M.steel);bracket.rotation.z=side*.05}for(let zz=-2.5;zz<2.7;zz+=.5){const ticket=panel(g,textTexture('۱۲۹٬۰۰۰','SELECT PRICE','#eee9d7','#15251f'),side*1.135,y+.03,zz,.32,.065,side*Math.PI/2);}
   for(let row=0;row<2;row++)for(let n=0;n<18;n++)products.product(shelfStock,x+side*(.32+row*.37),y+.025,z-2.5+n*.29,(n+level+Math.floor(x+10))%12,side===1?Math.PI/2:-Math.PI/2,.85);
  }
  for(const zz of [-2.9,2.9]){box(g,0,1.45,zz,2.25,2.1,.12,M.wood);for(let y=.55;y<2.6;y+=.5)box(g,0,y,zz+Math.sign(zz)*.35,2.2,.04,.6,M.shelf);}
 }
 manifest(13,'قفسه دوطرفه، طبقات، ریل قیمت، براکت و سرلاین',8);

 // 14 / Four genuinely different refrigeration types.
 const fridges=stage(14,'Upright open and closed refrigerated displays');const refrigeratedStock=stage(18,'Refrigerated goods');
 function upright(x,z,closed){const g=sub(fridges,x,0,z,-Math.PI/2);box(g,0,1.5,0,5.5,2.5,1.1,M.black,true);box(g,0,1.55,.57,5.1,2.05,.025,M.steel);box(g,0,2.85,.25,5.55,.3,1.55,M.green);for(let y=.65;y<2.6;y+=.47){box(g,0,y,.8,5.2,.035,.85,M.shelf);strip(g,0,y-.04,.9,5,.025,true);for(let n=0;n<20;n++)products.product(refrigeratedStock,x-.8,y+.025,z-2.4+n*.25,(n%2)?1:6,Math.PI/2,.8)}for(const xx of [-2.6,-.87,.87,2.6]){box(g,xx,1.7,1.25,.035,2,.035,M.steel)}if(closed)for(const xx of [-1.75,0,1.75]){box(g,xx,1.7,1.27,1.68,2,.018,M.glass);box(g,xx+.65,1.65,1.32,.025,.5,.045,M.steel)}else{for(let n=0;n<35;n++)box(g,-2.5+n*.15,2.76,1.15,.08,.035,.12,M.steel)}box(g,0,.42,1,5.4,.22,.2,M.black);return g}
 upright(22,-5,true);upright(22,3,false);upright(22,11,true);
 for(const [x,z,closed] of [[5,-5.8,true],[12,-5.8,false]]){const g=sub(fridges,x,0,z);box(g,0,.72,0,4.8,.86,2.1,M.green,true);box(g,0,1.15,0,4.65,.08,2,M.steel);box(g,0,1.18,0,4.3,.1,1.65,M.tile);for(const xx of [-2.3,2.3])box(g,xx,1.4,0,.06,.5,2,M.displayGlass);if(closed){box(g,-1.08,1.5,0,2.15,.025,1.9,M.glass);box(g,1.08,1.48,0,2.15,.025,1.9,M.glass);for(const xx of [-.15,.15])box(g,xx,1.53,0,.04,.035,.45,M.black)}else{for(const zz of [-.96,.96])box(g,0,1.28,zz,4.6,.2,.03,M.displayGlass)}strip(g,0,1.18,-.85,4.4,.02,true);for(let n=0;n<24;n++)products.product(refrigeratedStock,x-2+(n%12)*.36,1.22,z-.4+Math.floor(n/12)*.6,n%4,0,.6)}
 manifest(14,'ایستاده درب‌دار، ایستاده پرده هوا، فریزر خوابیده شیشه‌دار و جزیره سرد باز',5);

 // 15 / Bulk dispensers with transparent cylinders, filling lids, hoppers, levers and loose grains.
 const bulk=stage(15,'Bulk food and promotional islands');const bulkStock=stage(18,'Bulk grains');
 for(const x of [-9,-3]){const g=sub(bulk,x,0,-5.8);box(g,0,.8,0,4.5,1,2.2,M.wood,true);slats(g,0,.9,1.13,4.4,.9);box(g,0,1.34,0,4.6,.08,2.3,M.steel);for(let i=0;i<6;i++){const xx=-1.8+i*.72;cyl(g,xx,2.12,0,.27,1.05,M.glass);cyl(g,xx,2.67,0,.29,.045,M.black);cyl(g,xx,1.52,0,.12,.17,M.steel,.25);box(g,xx,1.43,.2,.05,.08,.25,M.black);box(g,xx,1.36,.38,.32,.025,.3,M.steel);cyl(bulkStock,x+xx,2.05,-5.8,.245,.8,new T.MeshStandardMaterial({color:['#a97c44','#cab080','#725b32','#ddc69c','#79633b','#d1a87a'][i],roughness:.85}));for(let n=0;n<32;n++)products.fruit(bulkStock,x+xx+(random()-.5)*.35,2.46+random()*.03,-5.8+(random()-.5)*.35,i%6,.12)}}
 const promo=sub(bulk,17,0,12);box(promo,0,.65,0,3.5,.65,2,M.wood,true);box(promo,0,1.05,0,3.6,.08,2.1,M.black);for(let n=0;n<30;n++)products.product(bulkStock,15.7+(n%10)*.29,1.1,11.5+Math.floor(n/10)*.4,n%12,0,.9);
 manifest(15,'مخزن فله، درپوش، قیف، اهرم، سینی و جزیره پروموشن');

 // 16 / Detailed checkouts, queue lanes, service desk, entry gates and wire shopping carts.
 const checkout=stage(16,'Checkout and customer service');const readiness=stage(19,'Checkout screens and operational software');
 for(let i=0;i<6;i++){const x=-14+i*5;const g=sub(checkout,x,0,14);box(g,0,.75,0,2.1,.85,3.5,M.green,true);box(g,0,1.22,0,2.2,.1,3.6,M.steel);box(g,0,1.28,-.65,1.5,.03,1.8,M.black);for(let n=0;n<13;n++)box(g,0,1.3,-1.4+n*.12,1.5,.009,.009,M.galvanized);box(g,0,1.29,.45,.6,.025,.55,M.black);box(g,0,1.31,.45,.45,.012,.1,M.red);box(g,-.75,1.5,.45,.05,.5,.05,M.black);box(g,-.75,1.78,.45,.75,.48,.08,M.black,true);panel(readiness,textTexture('صندوق آماده','PROTAIL / POS','#14292c','#d9f1ed'),x-.75,1.78,14.5,.66,.38);box(g,.7,1.45,.5,.4,.3,.3,M.black,true);box(g,.7,1.63,.6,.24,.13,.02,M.steel);const terminal=box(g,.75,1.48,-.05,.25,.12,.4,M.black,true);terminal.rotation.x=.3;box(g,.75,1.56,-.05,.19,.012,.2,M.blue);straight(g,[.8,.3,1.3],[.8,3.4,1.3],.025,M.steel);sign(g,String(i+1).padStart(2,'0'),'CHECKOUT',.8,3.5,1.3,.65,.65);}
 for(const x of [-18,16]){for(const z of [15,18])cyl(checkout,x,1,z,.06,1.4,M.steel);box(checkout,x,1.65,16.5,.035,.06,3,M.black)}
 for(const x of [-2,2]){box(checkout,x,1.15,18,.15,1.7,.6,M.steel,true);box(checkout,x/2,1.2,18,1.5,.035,.02,M.glass)}
 box(checkout,-21,1,15,3.5,1.35,1.8,M.wood,true);slats(checkout,-21,1,15.93,3.4,1.3);box(checkout,-21,1.72,15,3.6,.08,1.9,M.steel);
 for(let n=0;n<5;n++){const cart=sub(checkout,-22+n*.3,0,18);for(const x of [-.35,.35])for(const z of [-.5,.5]){cyl(cart,x,.42,z,.09,.06,M.black).rotation.z=Math.PI/2;straight(cart,[x,.45,z],[x,.65,z],.018,M.steel)}box(cart,0,.65,0,.72,.035,1.1,M.steel);for(let z=-.5;z<.6;z+=.1){straight(cart,[-.4,.7,z],[-.4,1.3,z],.009,M.steel);straight(cart,[.4,.7,z],[.4,1.3,z],.009,M.steel);straight(cart,[-.4,1.3,z],[.4,1.3,z],.009,M.steel)}for(const y of [.8,1,1.2])for(const x of [-.4,.4])straight(cart,[x,y,-.5],[x,y,.55],.009,M.steel);straight(cart,[-.4,1.45,.65],[.4,1.45,.65],.026,M.green);for(const x of [-.4,.4])straight(cart,[x,1.1,.4],[x,1.45,.65],.018,M.steel)}
 manifest(16,'صندوق کامل، اسکنر، پرینتر، کارت‌خوان، گیت، خدمات مشتری و چرخ خرید',6);

 // 17 / Identity is built into architecture: fascia, room signs, aisle signs and price systems.
 const identity=stage(17,'Complete environmental identity');
 box(identity,0,4.25,-12.6,47.5,1.35,.22,M.green);for(let i=0;i<3;i++){const x=-18+i*8;slats(identity,x,4.9,-12.43,7.4,.4);sign(identity,['گوشت تازه','مرغ و ماکیان','ماهی و آبزیان'][i],['BUTCHER / FRESH CUTS','POULTRY / DAILY FRESH','FISH / SEAFOOD'][i],x,4.2,-12.42,6.7,1.05);strip(identity,x,3.58,-12.4,6.5,.05)}
 sign(identity,'میوه و سبزیجات','FRUIT & VEGETABLES',-18,4.1,-5.9,6,1.05);sign(identity,'فله و تازه‌چین','BULK / SELECT YOUR OWN',-6,3.9,-6.5,5.5,.85);
 for(const [i,x] of [-9,-2,5,12].entries()){for(const z of [-4.6,10]){const g=sign(identity,['خواربار','نوشیدنی‌ها','صبحانه','خانه و بهداشت'][i],`${String(i+1).padStart(2,'0')} / EVERYDAY ESSENTIALS`,x,3.65,z,3.3,.75);for(const xx of [-1.3,1.3])straight(g,[xx,.4,0],[xx,2,0],.008,M.steel)}}
 sign(identity,'خدمات مشتری','CUSTOMER SERVICE',-21,3.2,14.8,3.4,.7);sign(identity,'خروج','EXIT →',-22,3.2,18.7,1.8,.5,Math.PI,'#195f43');sign(identity,'پیشنهادهای منتخب','SELECTED OFFERS',17,3,12,3.6,.7);
 manifest(17,'تابلو مستقل غرفه‌ها، فله، میوه، راهرو، خروج، خدمات، قیمت‌نما و گرافیک محیطی');

 // 19 / Operational and management tools have actual screens, clearly fictional content.
 const growth=stage(21,'Campaign and management screens');
 const campaign=sign(growth,'انتخابِ این هفته','WEEKLY SELECTION / DEMONSTRATION',17,2.15,12,2.6,1.1,0,'#8a3f2a');
 const dashCanvas=document.createElement('canvas');dashCanvas.width=1200;dashCanvas.height=680;const ctx=dashCanvas.getContext('2d');ctx.fillStyle='#0f2028';ctx.fillRect(0,0,1200,680);ctx.textAlign='right';ctx.direction='rtl';ctx.fillStyle='#d9eef2';ctx.font='40px Yekan';ctx.fillText('پروتیل / نمای مدیریتی',1140,70);ctx.font='20px Yekan';ctx.fillStyle='#72b9cc';ctx.fillText('داده نمایشی · بدون اتصال به سازمان',1140,112);for(let i=0;i<3;i++){ctx.fillStyle='#18333e';ctx.fillRect(60+i*375,150,340,130);ctx.fillStyle='#c5e9ee';ctx.font='25px Yekan';ctx.fillText(['فروش و روند','موجودی و تأمین','کمپین و اقدام'][i],365+i*375,190);ctx.strokeStyle='#57b7d8';ctx.lineWidth=3;ctx.beginPath();for(let j=0;j<9;j++){const x=90+i*375+j*32,y=250-((j*17+i*11)%50);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#17343e':'#142e38';ctx.fillRect(60,320+i*27,1080,22)}ctx.fillStyle='#90cdd9';ctx.font='24px Yekan';ctx.fillText('گزارش مدیریتی / ابزار تصمیم‌ساز / پیگیری اقدام',1110,630);const dashboardTexture=new T.CanvasTexture(dashCanvas);dashboardTexture.colorSpace=T.SRGBColorSpace;
 box(growth,-21.7,2.2,-10.2,3.3,1.9,.1,M.black,true);panel(growth,dashboardTexture,-21.7,2.2,-10.12,3.1,1.75);
 manifest(19,'نرم‌افزار صندوق و آمادگی افتتاح');manifest(21,'کمپین و نمایشگر گزارش مدیریتی با داده نمایشی');

 // 22 / Façade, transparent entrance, original logo, canopy, wood and metal cladding.
 const facade=stage(4,'Façade glass and cladding');
 const fascia=stage(22,'Main Protail identity');
 for(const x of [-22,-18,-14,-10,-6,6,10,14,18,22]){box(facade,x,2.9,19,.07,5.3,.12,M.black);box(facade,x+1.9,2.9,19,3.72,5.2,.025,M.glass)}
 for(const y of [.4,3.5,5.5])box(facade,0,y,19,48,.065,.12,M.black);
 for(const x of [-2,2]){box(facade,x,2.1,19,3.8,3.6,.025,M.glass);box(facade,x,2.1,19.06,.035,3.6,.04,M.steel);box(facade,x>0?.3:-.3,1.8,19.15,.035,.7,.06,M.steel)}
 box(facade,0,6.1,19.3,49,1.4,.55,M.black);box(facade,0,5.4,20.3,15,.18,3.2,M.black);strip(facade,0,5.27,21,13,.08);
 for(const x of [-24.25,24.25])box(facade,x,3.1,19.3,.5,5.8,.65,M.wood);
 new T.TextureLoader().load(logoUrl,t=>{t.colorSpace=T.SRGBColorSpace;panel(fascia,t,0,6.1,19.66,6.8,2.4);onChange()});
 // Logo sits on its own clean white sign plate to preserve its source colours.
 box(fascia,0,6.1,19.59,7.3,2.5,.05,M.tile);
 manifest(22,'نمای شیشه‌ای، ورودی، سایبان و لوگوی اصلی پروتیل');

 // 23 / Finished site: accessible parking, marked bays, roadway, loading and landscaping.
 const site=stage(23,'Parking landscaping and loading');
 box(site,0,.03,29,62,.15,17,M.asphalt);box(site,0,.12,20.4,53,.16,2.3,M.concrete);box(site,29,.04,-4,7,.15,49,M.asphalt);box(site,20,.04,-24,23,.15,6,M.asphalt);
 for(const x of [-29,29])box(site,x,.22,29,.2,.3,17,M.tile);
 for(let x=-27;x<=27;x+=3)box(site,x,.12,30,.055,.012,5.2,M.tile);
 box(site,0,.12,27.4,54,.015,.06,M.tile);for(let x=-5;x<6;x+=1.1)box(site,x,.13,23.7,.55,.01,3.5,M.tile);
 for(const z of [-21,13,36]){cyl(site,-28,3.2,z,.07,6,M.black);box(site,-27,6.2,z,2,.12,.5,M.black);strip(site,-27,6.12,z,1.8,.35)}
 for(const x of [-26,26])for(const z of [-19,-7,5,18,34]){box(site,x,.4,z,1.7,.45,1.7,M.concrete,true);cyl(site,x,1.7,z,.12,2.4,M.wood);for(let n=0;n<30;n++){const a=n*2.399,r=.25+random()*.85;const leaf=ellipsoid(site,x+Math.cos(a)*r,2.6+random()*1.2,z+Math.sin(a)*r,.5,.25,.35,M.leaf);leaf.rotation.y=a;}}
 const carColors=['#5d6b72','#d5d2c8','#163b4c','#712e2c','#a8b0b3'];
 for(let i=0;i<9;i++){const x=-25.4+i*5.8;if(Math.abs(x)<3)continue;const car=sub(site,x,.2,30.6,i%2?Math.PI:0),paint=new T.MeshPhysicalMaterial({color:carColors[i%5],metalness:.65,roughness:.23,clearcoat:1});box(car,0,.65,0,1.8,.6,4,paint,true);box(car,0,1.15,-.25,1.62,.65,2.15,paint,true);box(car,0,1.27,.65,1.48,.42,.025,M.glass).rotation.x=.45;box(car,0,1.28,-1.15,1.45,.4,.025,M.glass).rotation.x=-.4;for(const side of [-1,1]){box(car,side*.83,1.23,-.25,.025,.39,1.7,M.glass);box(car,side*.91,.7,0,.025,.025,3.3,M.steel);box(car,side*.96,1.1,.6,.18,.12,.24,paint,true);for(const z of [-1.25,1.25]){const wheel=cyl(car,side*.92,.47,z,.34,.18,M.black);wheel.rotation.z=Math.PI/2;const rim=cyl(car,side*1.02,.47,z,.23,.02,M.steel);rim.rotation.z=Math.PI/2;}}for(const side of [-1,1]){box(car,side*.55,.75,2.01,.45,.12,.025,M.light);box(car,side*.6,.77,-2.01,.35,.12,.025,M.red)}}
 manifest(23,'پارکینگ، خط‌کشی، مسیر عابر، محوطه، نور، خودرو و بارانداز');

 // Soft contact occlusion keeps fixtures grounded even beneath the roof, where the sun cannot reach.
 const aoCanvas=document.createElement('canvas');aoCanvas.width=aoCanvas.height=128;const aoCtx=aoCanvas.getContext('2d'),gradient=aoCtx.createRadialGradient(64,64,5,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.48)');gradient.addColorStop(.58,'rgba(0,0,0,.30)');gradient.addColorStop(1,'rgba(0,0,0,0)');aoCtx.fillStyle=gradient;aoCtx.fillRect(0,0,128,128);const aoMap=new T.CanvasTexture(aoCanvas);const aoMaterial=new T.MeshBasicMaterial({map:aoMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 function contact(parent,x,z,w,d){const mesh=new T.Mesh(new T.PlaneGeometry(w,d),aoMaterial);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.303,z);parent.add(mesh)}
 shelfLocations.forEach(([x,z])=>contact(shelves,x,z,3.7,7.1));for(const z of [-3,3.6,9.6])contact(produce,-18,z,7.5,4.6);for(let i=0;i<6;i++)contact(checkout,-14+i*5,14,3.5,5);for(let i=0;i<3;i++)contact(protein,-18+i*8,-8.6,8,3.1);for(const z of [-5,3,11])contact(fridges,22,z,3,6.8);for(const x of [-9,-3])contact(bulk,x,-5.8,5.8,3.5);
 const totalInstances=products.finish();
 // Batch static architectural parts by material. Individual labels and bolts should not cost a draw call each.
 scene.updateMatrixWorld(true);
 for(const g of stages){const buckets=new Map();const exclude=new Set([slab,finishFloor,backWall]);g.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||exclude.has(o)||o.parent===roof)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o)});for(const objects of buckets.values()){if(objects.length<2)continue;const geometries=objects.map(o=>{const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);return geometry});const combined=mergeGeometries(geometries,false);geometries.forEach(geo=>geo.dispose());if(!combined)continue;const mesh=new T.Mesh(combined,objects[0].material);mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;g.add(mesh);objects.forEach(o=>o.removeFromParent());}}
 const initialPositions=new Map();for(const g of stages)initialPositions.set(g,g.position.y);
 function update(p){
  for(const g of stages){const start=stops[g.userData.stage];const amount=T.MathUtils.smoothstep(p,start-.004,start+.022);g.visible=amount>0||g.userData.stage===0;g.position.y=(1-amount)*-.65;}
  const underground=p>=stops[5]-.005&&p<stops[6]-.005;
  slab.visible=!underground;finishFloor.visible=!underground;
  plan.visible=p>=stops[1]&&p<stops[4];
  // A cutaway reveals the overhead services until the camera enters the actual building.
  roof.visible=p>=.79;
  facade.visible=p>=stops[4]&&(p<.20||p>=.79);
  if(underground){below.position.y=.35;backWall.visible=false}else{backWall.visible=false}
  // Backroom inspection is framed from behind, while all equipment stays in the scene.
 }
 return {update,inventory,totalInstances,stages,M,roof};
}



