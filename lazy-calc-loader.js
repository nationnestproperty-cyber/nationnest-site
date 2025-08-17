
let loaded=false;
async function loadCalcs(){
  if(loaded) return; loaded=true;
  const [{initNetYield},{initPMT},{initTransfer}] = await Promise.all([
    import('./calc/netyield.js'), import('./calc/pmt.js'), import('./calc/transfer.js')
  ]);
  document.querySelectorAll('#calcGrid [data-calc]').forEach(m=>{
    if(m.dataset.calc==='netyield') initNetYield(m);
    if(m.dataset.calc==='pmt') initPMT(m);
    if(m.dataset.calc==='transfer') initTransfer(m);
  });
}
(function(){
  const grid=document.querySelector('#calcGrid');
  // 1) IntersectionObserver
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver((entries)=>{
      for(const e of entries){ if(e.isIntersecting){ loadCalcs(); io.disconnect(); break; } }
    },{threshold:0.2});
    io.observe(grid);
  } else { loadCalcs(); }
  // 2) Hash direct access
  if(location.hash==="#calc"){ setTimeout(loadCalcs, 200); }
  // 3) Click nav to #calc
  document.querySelectorAll('a[href="#calc"]').forEach(a=> a.addEventListener('click',()=> setTimeout(loadCalcs, 200)));
  // 4) Safety timeout
  setTimeout(()=>{ if(!loaded) loadCalcs(); }, 4000);
})();
