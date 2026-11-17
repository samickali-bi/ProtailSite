import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function geometryKit(){
 const panelMaterials=new Map();
 const cube=new T.BoxGeometry(1,1,1),round=new RoundedBoxGeometry(1,1,1,2,.055),sphere=new T.SphereGeometry(1,20,12),cylinder=new T.CylinderGeometry(1,1,1,20);
 function box(g,x,y,z,w,h,d,m,rounded=false){const o=new T.Mesh(rounded?round:cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function ellipsoid(g,x,y,z,rx,ry,rz,m){const o=new T.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(rx,ry,rz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function cyl(g,x,y,z,r,h,m,r2=r){const geo=r2===r?cylinder:new T.CylinderGeometry(r,r2,h,24);const o=new T.Mesh(geo,m);o.position.set(x,y,z);if(r2===r)o.scale.set(r,h,r);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function pipe(g,points,r,m){const curve=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a)),false,'centripetal');const o=new T.Mesh(new T.TubeGeometry(curve,Math.max(2,points.length*8),r,10,false),m);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function straight(g,a,b,r,m){const va=new T.Vector3(...a),vb=new T.Vector3(...b),dir=vb.clone().sub(va);const o=new T.Mesh(cylinder,m);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize());o.scale.set(r,dir.length(),r);o.castShadow=true;g.add(o);return o}
 function line(g,points,color=0x62c8fa){const o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color}));g.add(o);return o}
 function panel(g,texture,x,y,z,w,h,rotation=0){if(!panelMaterials.has(texture.uuid))panelMaterials.set(texture.uuid,new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,transparent:true}));const o=new T.Mesh(new T.PlaneGeometry(w,h),panelMaterials.get(texture.uuid));o.position.set(x,y,z);o.rotation.y=rotation;g.add(o);return o}
 return {box,ellipsoid,cyl,pipe,straight,line,panel,cube,round,sphere,cylinder};
}
