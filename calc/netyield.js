
export function initNetYield(mount){
  mount.innerHTML = `<div class="form-row">
    <label>ราคาทรัพย์ (บาท)<input type="number" id="ny_price" placeholder="6,900,000"></label>
    <label>ค่าเช่า/เดือน (บาท)<input type="number" id="ny_rent" placeholder="28,000"></label>
    <label>Vacancy %<input type="number" id="ny_vac" value="5"></label>
    <label>ค่าบริหาร %<input type="number" id="ny_mgmt" value="10"></label>
    <label>ค่าส่วนกลาง/เดือน (บาท)<input type="number" id="ny_fee" value="1500"></label>
    <label>ภาษี/ปี (บาท)<input type="number" id="ny_tax" value="0"></label>
  </div>
  <button class="pill primary" id="ny_btn">คำนวณ</button>
  <div class="calc-note">* ประมาณการเบื้องต้น</div>
  <div class="result" id="ny_out"></div>`;

  const g = id=>mount.querySelector('#'+id);
  const f = ()=>{
    const price=+g('ny_price').value||0;
    const rent=+g('ny_rent').value||0;
    const vac=(+g('ny_vac').value||0)/100;
    const mgmt=(+g('ny_mgmt').value||0)/100;
    const fee=+g('ny_fee').value||0;
    const tax=+g('ny_tax').value||0;
    const gross = rent*12;
    const vacancy = gross*vac;
    const mgmtFee = gross*mgmt;
    const common = fee*12;
    const netIncome = gross - vacancy - mgmtFee - common - tax;
    const yieldPct = price>0 ? (netIncome/price*100) : 0;
    g('ny_out').textContent = `รายได้สุทธิ/ปี ≈ ${netIncome.toLocaleString('th-TH')} บาท • Net Yield ≈ ${yieldPct.toFixed(2)}%`;
  };
  g('ny_btn').onclick=f;
}
