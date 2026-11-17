// Outlines use the same 1672 × 941 camera as the registered installation layers.
const building=[[0,706],[18,620],[18,283],[42,220],[470,35],[1618,190],[1652,202],[1652,457],[1667,459],[1662,493],[1490,876],[1150,941],[0,773]];
const site=[[0,709],[12,352],[27,246],[370,52],[378,24],[388,25],[388,51],[815,92],[817,76],[828,78],[829,94],[1270,153],[1272,132],[1283,134],[1284,155],[1632,211],[1634,192],[1644,194],[1645,215],[1660,242],[1646,516],[1483,894],[1150,941],[0,773]];
const foundation=[[0,711],[14,316],[36,245],[470,33],[1636,203],[1665,251],[1647,519],[1490,894],[1150,941],[0,773]];
export function sceneOutline(phase){return phase===0?site:phase===1?foundation:building}
export function clipSceneImage(image,phase){image.style.clipPath=`polygon(${sceneOutline(phase).map(([x,y])=>`${x/1672*100}% ${y/941*100}%`).join(',')})`}
export function drawClippedBase(ctx,image,phase,x,y,scale){
 ctx.save();ctx.beginPath();sceneOutline(phase).forEach(([px,py],i)=>ctx[i?'lineTo':'moveTo'](x+px*scale,y+py*scale));ctx.closePath();ctx.clip();ctx.drawImage(image,x,y,1672*scale,941*scale);ctx.restore();
}
export function floatingScene(stack){
 const art=document.createElement('div');art.className='scene-art';
 while(stack.firstChild)art.append(stack.firstChild);stack.append(art);
 const resize=()=>{const width=Math.min(stack.clientWidth,stack.clientHeight*1672/941);art.style.width=`${width}px`;art.style.height=`${width*941/1672}px`};
 new ResizeObserver(resize).observe(stack);resize();
 const backdrop=document.createElement('div');backdrop.className='floating-sketches';backdrop.setAttribute('aria-hidden','true');
 backdrop.innerHTML=`<svg class="scene-sketch sketch-duct" viewBox="0 0 600 300"><g><path d="M-40 32L350 136Q420 155 390 209L319 268M-40 100L320 196Q337 202 320 228L286 268M5 44Q38 80 5 112M66 60Q99 96 66 128M127 76Q160 112 127 144M188 92Q221 128 188 160M249 108Q282 144 249 176M310 124Q343 160 310 192M361 140Q392 178 351 205M50 0V56M270 0V115"/></g></svg>
 <svg class="scene-sketch sketch-cart" viewBox="0 0 440 400"><g><path d="M20 30H74L128 272H340L390 104L88 65M102 129L374 164M114 191L357 220M140 80L174 271M198 88L222 271M255 96L271 271M312 104L319 271M129 272L109 316H346M109 316L138 342M346 316L325 342"/><ellipse cx="150" cy="354" rx="23" ry="25"/><ellipse cx="312" cy="354" rx="23" ry="25"/></g></svg>
 <svg class="scene-sketch sketch-shelf" viewBox="0 0 650 450"><g><path d="M70 438V100L480 20V360M91 438V113L500 32V373M480 20L595 91V427M500 32L616 104V440M70 184L480 104L595 175M70 275L480 195L595 266M70 366L480 286L595 357M480 360L595 427M91 438L500 358L616 425"/><path d="M130 168V121L154 116V163M180 158V111L204 106V153M230 148V101L254 96V143M280 138V91L304 86V133M330 128V81L354 76V123M380 118V71L404 66V113M140 259V216L165 211V254M200 247V204L225 199V242M260 235V192L285 187V230M320 223V180L345 175V218M380 211V168L405 163V206"/></g></svg>`;
 document.querySelector('.pinned-scene').prepend(backdrop);
 const sketches=[...backdrop.children];
 return {art,update(progress,reduced){sketches.forEach((sketch,i)=>{const distance=innerHeight*(1.1+i*.45),loop=innerHeight*1.6,base=[.04,.72,.83][i]*innerHeight;let offset=reduced?0:-(progress*distance);if(base+offset < -innerHeight*.55)offset+=loop;sketch.style.transform=`translate3d(0,${offset}px,0)`});}};
}
