// All points use the 1672 × 941 master drawing. A person's anchor is the point
// between their shoes, never the top-left of a catalog sprite.
export const PEOPLE_SCALE=.8;
export const PERSON_HEIGHT=100*PEOPLE_SCALE;
export const technicalRooms={server:[550,180,59,113],electrical:[790,202,82,88]};
export const cashierStations=[[398,580],[518,602],[620,624]];
const box=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
export const floorObstacles=[
 {from:8,polygon:box(40,380,240,100)},
 {from:9,polygon:[[130,470],[173,493],[545,355],[530,320]]},
 ...[
  [[610,443],[641,456],[772,349],[742,336]],
  [[702,465],[733,479],[866,361],[835,349]],
  [[791,486],[823,502],[955,372],[924,358]],
  [[882,508],[914,525],[1054,387],[1023,372]],
  [[979,530],[1010,545],[1150,397],[1119,382]],
  [[1087,538],[1118,551],[1245,412],[1214,397]]
 ].map(polygon=>({from:11,polygon})),
 {from:11,polygon:box(538,503,95,51)},
 {from:11,polygon:box(636,532,193,59)},
 {from:11,polygon:box(839,554,141,57)},
 {from:10,polygon:[[1248,402],[1532,423],[1399,642],[1077,609]]},
 {from:12,polygon:[[958,338],[1605,407],[1600,429],[958,362]]},
 {from:12,polygon:[[539,364],[567,389],[695,341],[684,322]]},
 {from:13,polygon:[[341,565],[424,530],[641,581],[641,657],[575,685],[341,638]]},
 {from:13,polygon:box(643,632,260,111)},
 {from:18,polygon:[[307,502],[468,532],[523,499],[361,471]]}
];
export function pointInPolygon([x,y],polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [ax,ay]=polygon[i],[bx,by]=polygon[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside}return inside}
export function blockedFloor(point,phase,radius=7){if(phase>=13&&cashierStations.some(p=>Math.hypot(point[0]-p[0],point[1]-p[1])<13))return false;return [[0,0],[-radius,0],[radius,0],[0,-radius],[0,radius]].some(([dx,dy])=>floorObstacles.some(o=>phase>=o.from&&pointInPolygon([point[0]+dx,point[1]+dy],o.polygon)))}
export function safeFoot(anchor,phase,radius=7,occupied=[]){
 const valid=([x,y])=>x>=70&&x<=1570&&y>=285&&y<=890&&!blockedFloor([x,y],phase,radius)&&occupied.every(p=>Math.hypot(x-p[0],(y-p[1])*1.4)>25);
 if(valid(anchor))return anchor;
 for(let ring=8;ring<=120;ring+=8)for(let angle=0;angle<Math.PI*2;angle+=Math.PI/12){const p=[anchor[0]+Math.cos(angle)*ring,anchor[1]+Math.sin(angle)*ring];if(valid(p))return p}
 throw Error('No clear floor near '+anchor);
}
export const installationFeet={
 3:[[550,515],[1020,590],[1440,505]],
 4:[[750,290],[1120,360],[520,365]],
 5:[[1120,310],[760,330],[520,360]],
 6:[[1150,310],[750,330],[520,365]],
 7:[[601,315],[842,315],[460,350]],
 8:[[285,445],[220,500],[305,390]],
 9:[[290,450],[430,410],[540,380]],
 10:[[1345,655],[1100,615],[1485,455]],
 11:[[470,510],[830,615],[1090,600]],
 12:[[1250,445],[1510,450],[710,375]],
 13:[[375,540],[490,555],[650,690]]
};
export const stockingFeet={14:[[470,510],[830,615],[1025,570]],15:[[410,420],[1345,655],[1540,440]],16:[[340,520],[830,615],[1345,655]]};
// Eight customers form two checkout queues; the others spread through aisles.
export const queueFeet=[[380,535],[390,509],[400,483],[410,457],[465,525],[475,499],[485,473],[495,447]];
export const campaignQueueFeet=[[270,545],[250,523],[230,501],[210,479],[330,565],[310,545],[290,525],[270,505]];
const shoppingFeet=[[700,607],[740,635],[810,625],[890,625],[985,630],[1045,680],[1150,670],[1270,682],[1380,690],[1460,580],[1490,500],[1090,382],[1000,365],[900,340],[780,320],[650,345],[570,400],[650,455],[745,475],[840,500],[930,520],[1025,545],[1120,565],[1180,450]];
export const customerPaths=[...queueFeet,...shoppingFeet].map((end,i)=>[[1080+(i%3)*12,845+(i%4)*8],[1070,755],[1000,685],end]);
export function pathPoint(path,progress){const t=Math.max(0,Math.min(1,progress))*(path.length-1),i=Math.min(path.length-2,Math.floor(t)),f=t-i;return [path[i][0]+(path[i+1][0]-path[i][0])*f,path[i][1]+(path[i+1][1]-path[i][1])*f]}
