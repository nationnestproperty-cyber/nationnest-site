
export const el=(s,r=document)=>r.querySelector(s);
export const fmt=(n)=> (typeof n==='number'? n.toLocaleString('th-TH',{style:'currency',currency:'THB',maximumFractionDigits:0}) : n);
export function haversine(lat1,lon1,lat2,lon2){
  const toRad=x=>x*Math.PI/180; const R=6371;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(a)));
}
export const TH_PROVINCES=window.TH_PROVINCES||[];
export const SUBAREAS=window.SUBAREAS||{};
