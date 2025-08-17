
export function initPMT(mount){
  mount.innerHTML = `<div class="form-row">
    <label>ยอดกู้ (บาท)<input type="number" id="pmt_principal" placeholder="5,000,000"></label>
    <label>ดอกเบี้ยต่อปี %<input type="number" id="pmt_rate" value="6.5"></label>
    <label>ระยะเวลากู้ (ปี)<input type="number" id="pmt_years" value="30"></label>
  </div>
  <button class="pill primary" id="pmt_btn">คำนวณ</button>
  <div class="calc-note">* สูตร PMT (คงที่)</div>
  <div class="result" id="pmt_out"></div>`;

  const g=id=>mount.querySelector('#'+id);
  const PMT=(principal, annualRate, years)=>{
    const r=(annualRate/100)/12;
    const n=years*12;
    if(r===0) return principal/n;
    return principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
  };
  g('pmt_btn').onclick=()=>{
    const p=+g('pmt_principal').value||0;
    const r=+g('pmt_rate').value||0;
    const y=+g('pmt_years').value||0;
    const m=PMT(p,r,y);
    const total=m*y*12;
    const interest=total-p;
    g('pmt_out').textContent = `ค่างวด/เดือน ≈ ${Math.round(m).toLocaleString('th-TH')} บาท • ดอกเบี้ยรวม ≈ ${Math.round(interest).toLocaleString('th-TH')} บาท`;
  };
}
