// Longer scroll intervals for installation, with the longest interval for lifting ducts.
export const weights=[1,1.1,1.1,3.4,1.3,4,2.2,2.5,2,2,2,2.2,2,1.8,2.2,2.2,1.9,2.8,2.2,1];
export const starts=weights.map((_,i)=>weights.slice(0,i).reduce((a,b)=>a+b,0));
export const end=starts.at(-1);
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
export function phaseAt(progress){
 const distance=clamp(progress)*end;let phase=0;
 // Tolerate rounding to integer CSS scroll pixels at chapter boundaries.
 for(let i=1;i<starts.length;i++)if(distance+.003>=starts[i])phase=i;
 const local=phase===weights.length-1?0:clamp((distance-starts[phase])/weights[phase]);
 return {phase,local,position:phase+local};
}
export const progressFor=(phase,local=0)=>clamp((starts[clamp(phase,0,weights.length-1)]+weights[clamp(phase,0,weights.length-1)]*local)/end);
export function installationAt(local,reduced=false){
 if(reduced)return {main:1,branches:1,finish:1,stage:3};
 const main=smooth(.08,.50,local),branches=smooth(.35,.79,local),finish=smooth(.83,.94,local);
 return {main,branches,finish,stage:local<.35?0:local<.76?1:local<.94?2:3};
}
