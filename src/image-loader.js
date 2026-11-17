// Share network requests and decoded images across chapters and installation layers.
const requests=new Map();
export function imageAsset(url){
 if(requests.has(url))return requests.get(url);
 const request=new Promise((resolve,reject)=>{
  const image=new Image();image.decoding='async';
  image.onload=()=>resolve(image);
  image.onerror=()=>reject(Error(`Image failed: ${url}`));image.src=url;
 }).then(async image=>{try{await image.decode()}catch{if(!image.naturalWidth)throw Error(`Image decode failed: ${url}`)}return image}).catch(error=>{requests.delete(url);throw error});
 requests.set(url,request);return request;
}
