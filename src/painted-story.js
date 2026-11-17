export const chapters=[
 {at:0,kicker:'یک ایده، یک تصویر',title:'این تصویر، قرار است زندگی کند.',copy:'از یک فضای فکرشده شروع می‌کنیم؛ و قدم‌به‌قدم وارد داستان یک فروشگاه می‌شویم.'},
 {at:.13,kicker:'طراحی و معماری',title:'به فضا نزدیک‌تر شویم.',copy:'ورودی، مسیر خرید و بخش‌های پشتیبان؛ اجزای یک تجربه که از همان ابتدا کنار هم طراحی می‌شوند.',role:true},
 {at:.27,kicker:'زیرساخت و تأسیسات',title:'بالای سر، دقت جریان دارد.',copy:'لوله‌ها، کانال‌ها، برق و روشنایی؛ زیرساختی هماهنگ برای روزهایی که فروشگاه زنده است.',role:true},
 {at:.40,kicker:'تجهیز و مسیر خرید',title:'حالا، قدم به داخل بگذاریم.',copy:'از میان راهروها عبور می‌کنیم؛ تجهیزات، غرفه‌ها و زنجیرهٔ سرد در امتداد مسیر خرید قرار می‌گیرند.'},
 {at:.56,kicker:'چیدمان و آمادگی',title:'رنگ، وارد فروشگاه می‌شود.',copy:'کالا، تازگی و حضور تیم؛ جزئیاتی که یک فضای مجهز را به تجربه‌ای برای خرید تبدیل می‌کنند.'},
 {at:.71,kicker:'افتتاح و تجربهٔ مشتری',title:'فروشگاه با آدم‌ها کامل می‌شود.',copy:'یک ورود روشن، یک مسیر روان و یک تجربهٔ خرید؛ حاصل همهٔ تصمیم‌هایی که پیش از این گرفته‌ایم.'},
 {at:.88,kicker:'همراهی پس از افتتاح',title:'پایان ساخت، آغاز همراهی.',copy:'از طراحی و تجهیز تا عملیات و توسعهٔ فروش؛ داستان پروتیل با بازشدن درهای فروشگاه تمام نمی‌شود.'}
];
export const artwork=[
 {id:'overview',src:'/painted/overview.webp',alt:'نقاشی معماری فروشگاه در مرحلهٔ آماده‌سازی و تجهیز',from:0,to:.35,enter:[0,0,1.02],exit:[-5,-3,1.35],focus:48},
 {id:'aisle',src:'/painted/aisle.webp',alt:'نمای نقاشی‌شده از داخل فروشگاه و راهروهای خالی با تأسیسات سقفی',from:.27,to:.65,enter:[1,3,1.10],exit:[-5,-3,1.30],focus:43},
 {id:'alive',src:'/painted/alive.webp',alt:'فضای داخلی نقاشی‌شده با کالاهای چیده‌شده، پرسنل و مشتریان متناسب با تجهیزات',from:.57,to:.90,enter:[-3,1,1.12],exit:[3,-3,1.25],focus:55},
 {id:'finale',src:'/painted/finale.webp',alt:'نمای کلی نقاشی‌شدهٔ فروشگاه کامل پروتیل در زمینهٔ تیره',from:.83,to:1,enter:[-1,-1,1.10],exit:[0,0,1.01],focus:48}
];
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
const fadeWindows=[[.27,.35],[.57,.65],[.83,.90]];
export function sceneAt(p,mobile=false,reduced=false){
 p=clamp(p);
 const blends=fadeWindows.map(([a,b])=>reduced?Number(p>=(a+b)/2):ease((p-a)/(b-a)));
 return artwork.map((a,i)=>{
  const t=ease((p-a.from)/(a.to-a.from)),factor=mobile?.52:1;
  return {id:a.id,opacity:i===0?1:blends[i-1],visible:(i===3||blends[i]<.9999)&&(i===0||blends[i-1]>.0001),
   x:reduced?0:(a.enter[0]+(a.exit[0]-a.enter[0])*t)*factor,
   y:reduced?0:(a.enter[1]+(a.exit[1]-a.enter[1])*t)*factor,
   scale:reduced?1:1+((a.enter[2]+(a.exit[2]-a.enter[2])*t)-1)*(mobile?.7:1),
   focus:mobile?a.focus+(i===2?12:0):50};
 });
}
