
import { el, fmt, haversine, TH_PROVINCES, SUBAREAS } from './utils.js';
import { STATIONS, POIS } from './bts-full.js';

const CATEGORIES=[
  {key:'คอนโด',icon:'🏙️'},{key:'บ้านเดี่ยว',icon:'🏡'},{key:'บ้านแฝด',icon:'🏠'},{key:'ทาวน์โฮม',icon:'🏘️'},
  {key:'วิลล่า',icon:'🌴'},{key:'ออฟฟิศ',icon:'🏢'},{key:'โฮมออฟฟิศ',icon:'🏢'},{key:'ร้านค้า',icon:'🛍️'},{key:'โกดัง/โรงงาน',icon:'🏭'},{key:'ที่ดิน',icon:'📍'},{key:'โรงแรม/เกสต์เฮาส์',icon:'🏨'}
];
const AREAS=[
  {key:'พระราม 9',img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop'},
  {key:'อโศก-ทองหล่อ',img:'https://images.unsplash.com/photo-1485770958101-9f2a5954978e?q=80&w=1200&auto=format&fit=crop'},
  {key:'รัชดา-ห้วยขวาง',img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop'},
  {key:'สาทร',img:'https://images.unsplash.com/photo-1526481280698-8fcc13fdab55?q=80&w=1200&auto=format&fit=crop'},
  {key:'บางนา-ตราด',img:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'},
  {key:'ป่าตอง',img:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop'},
  {key:'พัทยาเหนือ',img:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'},
  {key:'นิมมานฯ',img:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop'}
];

let PROPERTIES=[]; let MAP=null; let MARKERS=[]; let mapMode='iframe';

async function loadProperties(){
  const res=await fetch('properties.json'); PROPERTIES = res.ok? await res.json() : [];
  renderCategories(); renderPopular(); fillProvinces(); fillTypes(); bindPOIChips(); applyFilters(); setupMapsMode();
}
function renderCategories(){
  const row=el('#catRow'); row.innerHTML=''; CATEGORIES.forEach(c=>{
    const b=document.createElement('button'); b.className='chip'; b.innerHTML=`<span class='icon'>${c.icon}</span> ${c.key}`;
    b.onclick=()=>{ el('#fType').value=c.key; applyFilters(); location.hash='#listings'; }; row.appendChild(b);
  });
}
function renderPopular(){const row=el('#popularRow'); row.innerHTML=''; AREAS.forEach(a=>{const c=document.createElement('a'); c.href='#listings'; c.className='card-hero'; c.innerHTML=`<img loading='lazy' src='${a.img}' alt='${a.key}'><div class='overlay'><h3>${a.key}</h3></div>`; c.onclick=()=>{ el('#q').value=a.key; applyFilters(); }; row.appendChild(c);});}
function fillTypes(){ const sel=el('#fType'); const opts=['all',...CATEGORIES.map(c=>c.key)]; sel.innerHTML = opts.map((k,i)=> i?`<option>${k}</option>`:`<option value="all">ทุกประเภท</option>`).join(''); }
function fillProvinces(){
  const els=['#qsProvince','#province','#provincePost'].map(s=>document.querySelector(s)).filter(Boolean);
  els.forEach(s=>s.innerHTML='<option value="all">ทุกจังหวัด</option>'+TH_PROVINCES.map(p=>`<option>${p}</option>`).join(''));
  const subFilters=['#qsSubarea','#subarea'].map(s=>document.querySelector(s)).filter(Boolean);
  const handle=(pv)=>{ subFilters.forEach(sb=>{ const arr=SUBAREAS[pv]||[]; sb.innerHTML='<option value="all">ทำเลย่อย</option>'+arr.map(x=>`<option>${x}</option>`).join(''); }); };
  document.getElementById('qsProvince').addEventListener('input',e=>handle(e.target.value));
  document.getElementById('province').addEventListener('input',e=>handle(e.target.value));
}

function renderCards(items){
  const wrap=el('#cards'); wrap.innerHTML=''; el('#resultCount').textContent=`(${items.length} รายการ)`;
  if(!items.length){ el('#noResults').hidden=false; return; } el('#noResults').hidden=true;
  items.forEach(p=>{
    const firstImg=(p.images&&p.images[0])||p.image;
    const card=document.createElement('article'); card.className='card';
    card.innerHTML=`<div class="fav" title="Favorite">☆</div>
    <a href="property.html?id=${p.id}"><img loading='lazy' src='${firstImg}' alt='${p.name}'></a>
    <div class='card-body'>
      <div><span class='badge'>${p.ptype}</span> <span class='badge'>${p.deal==='sale'?'ขาย':'เช่า'}</span> <span class='badge'>${p.province}</span>${p.district?` <span class='badge'>${p.district}</span>`:''}</div>
      <a href="property.html?id=${p.id}"><h3>${p.name}</h3></a>
      <div class='price'>${p.deal==='sale'?fmt(p.price):fmt(p.price)+'/เดือน'}</div>
      <div class='meta'>
        <span>${p.location||''}</span> • 
        <span>${p.beds||'-'} นอน</span> • 
        <span>${p.baths||'-'} น้ำ</span> • 
        <span>${p.parking||'-'} จอด</span> • 
        <span>${p.size||'-'} ตร.ม.</span>
      </div>
      <div class='actions'><button class='pill' data-map>ดูบนแผนที่</button><span class='copy'>คัดลอก: ${p.id}</span></div>
    </div>`;
    card.querySelector('[data-map]').onclick=()=>focusMap(p);
    card.querySelector('.copy').onclick=()=>{ navigator.clipboard.writeText(p.id); alert('คัดลอกแล้ว'); };
    wrap.appendChild(card);
  });
  refreshMarkers(items);
}

function poiActive(){ const on=[...document.querySelectorAll('#poiChips .pill.active')].map(x=>x.dataset.poi); return on; }
function bindPOIChips(){ document.querySelectorAll('#poiChips .pill').forEach(ch=> ch.onclick=()=>{ ch.classList.toggle('active'); applyFilters(); }); }

function applyFilters(){
  const q=(el('#q').value||'').trim().toLowerCase(), province=el('#province').value, sub=el('#subarea').value, deal=el('#fDeal').value, type=el('#fType').value, sort=el('#sortBy').value, max=+el('#qsMax').value||Infinity;
  const line=el('#nearLine').value, radius=+el('#nearRadius').value||0;
  const onPOI=poiActive();
  let items=PROPERTIES.filter(p=>(deal==='all'||p.deal===deal)&&(type==='all'||p.ptype===type)&&(province==='all'||p.province===province)&&(sub==='all'||(p.district||'')===sub)&&((p.name+' '+(p.location||'')+' '+(p.district||'')+' '+(p.features||[]).join(' ')+' '+(p.transit||[]).join(' ')).toLowerCase().includes(q))&&(isFinite(max)?(p.price||0)<=max:true));
  // Transit radius filter
  if(line!=='any' && radius>0 && STATIONS[line]){
    items=items.filter(p=> (p.lat&&p.lng) && STATIONS[line].some(s=>haversine(p.lat,p.lng,s.lat,s.lng)<=radius) );
  }
  // POI filters (AND all active)
  if(onPOI.length){
    items=items.filter(p=>{
      if(!(p.lat&&p.lng)) return false;
      return onPOI.every(kind=> POIS[kind] && POIS[kind].some(s=>haversine(p.lat,p.lng,s.lat,s.lng) <= 2)); // 2 km default
    });
  }
  if(sort==='priceAsc') items.sort((a,b)=>a.price-b.price);
  if(sort==='priceDesc') items.sort((a,b)=>b.price-a.price);
  renderCards(items); if(items[0] && items[0].lat) focusMap(items[0]);
}

function setupMapsMode(){
  const key=document.body.dataset.gmapsKey;
  if(key){ document.getElementById('gmapEmbed').style.display='none'; document.getElementById('gmapJS').style.display='block';
    const s=document.createElement('script'); s.src=`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker`; s.onload=initMap; document.body.appendChild(s);
  } else {
    document.getElementById('gmapEmbed').style.display='block'; document.getElementById('gmapJS').style.display='none';
  }
}
function initMap(){ MAP=new google.maps.Map(document.getElementById('gmapJS'),{center:{lat:13.7563,lng:100.5018},zoom:11}); refreshMarkers(PROPERTIES); }
function refreshMarkers(list){
  if(!MAP) return;
  MARKERS.forEach(m=>m.setMap(null)); MARKERS=[];
  list.slice(0,100).forEach(p=>{ if(p.lat&&p.lng){ const m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map:MAP,title:p.name}); m.addListener('click',()=>{ window.location.href='property.html?id='+p.id; }); MARKERS.push(m);} });
}
function focusMap(p){
  const key=document.body.dataset.gmapsKey;
  if(key && MAP){ MAP.setCenter({lat:p.lat,lng:p.lng}); MAP.setZoom(15); }
  else { document.getElementById('gmapEmbed').src=`https://www.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`; }
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('year')?.appendChild(document.createTextNode(new Date().getFullYear()));
  document.getElementById('btnQuick').addEventListener('click',()=>{
    el('#fDeal').value=el('#qsDeal').value; el('#province').value=el('#qsProvince').value; el('#subarea').value=el('#qsSubarea').value; el('#q').value=el('#qsQ').value; applyFilters();
  });
  document.getElementById('btnSearch').addEventListener('click',applyFilters);
  ['#fDeal','#fType','#province','#subarea','#sortBy','#nearLine','#nearRadius'].forEach(s=>document.querySelector(s).addEventListener('input',applyFilters));
  document.getElementById('btnOpenSubmit').onclick=()=>document.getElementById('submitModal').showModal();
  // Cloudinary upload
  document.getElementById('imageFiles').addEventListener('change',async (e)=>{
    const cloud=document.body.dataset.cloudName; const preset=document.body.dataset.uploadPreset; const msg=document.getElementById('uploadMsg');
    if(!cloud||!preset){ alert('กรุณาใส่ Cloud Name/Upload Preset'); return; }
    msg.textContent='กำลังอัปโหลด...';
    const ups=[...e.target.files].slice(0,8).map(f=>{ const fd=new FormData(); fd.append('file',f); fd.append('upload_preset',preset); return fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`,{method:'POST',body:fd}).then(r=>r.json()); });
    try{ const arr=await Promise.all(ups); const urls=arr.map(d=>d.secure_url).filter(Boolean); document.getElementById('imageUrls').value=urls.join(','); msg.textContent='อัปโหลดสำเร็จ ✓'; }catch{ msg.textContent='อัปโหลดไม่สำเร็จ'; }
  });
  // Submit property
  document.getElementById('submitForm').addEventListener('submit',(e)=>{
    e.preventDefault(); const fd=new FormData(e.target); const p=Object.fromEntries(fd.entries());
    const ll=(p.latlng||'').split(',').map(x=>+x.trim()); p.lat=ll[0]; p.lng=ll[1];
    p.transit=(p.transit||'').split(',').map(s=>s.trim()).filter(Boolean);
    p.features=(p.features||'').split(',').map(s=>s.trim()).filter(Boolean);
    p.images=(p.images||'').split(',').map(s=>s.trim()).filter(Boolean); p.image=p.images[0]||'';
    ['price','size','beds','baths','parking'].forEach(k=>p[k]=+p[k]||0); p.id='UP-'+Date.now(); p.status='pending';
    const state=JSON.parse(localStorage.getItem('NN_STATE')||'{}'); state.pending=state.pending||[]; state.pending.unshift(p); localStorage.setItem('NN_STATE',JSON.stringify(state));
    document.getElementById('submitMsg').textContent='ส่งฝากทรัพย์แล้ว (เข้าสู่คิว Pending ใน Admin)'; setTimeout(()=>document.getElementById('submitModal').close(),800);
  });

  loadProperties();
});
