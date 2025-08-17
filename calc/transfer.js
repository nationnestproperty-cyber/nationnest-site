
export function initTransfer(mount){
  mount.innerHTML = `<div class="form-row">
    <label>ราคาประเมิน/ขาย (บาท)<input type="number" id="tf_price" placeholder="3,900,000"></label>
    <label>ผู้จ่ายค่าโอน<select id="tf_payer"><option value="buyer">ผู้ซื้อ 100%</option><option value="split">หารสอง</option><option value="seller">ผู้ขาย 100%</option></select></label>
    <label>ถือครอง <select id="tf_hold"><option value=">5">มากกว่า 5 ปี</option><option value="<=5">ไม่เกิน 5 ปี</option></select></label>
    <label>ประเภทผู้ขาย<select id="tf_seller"><option value="บุคคลธรรมดา">บุคคลธรรมดา</option><option value="นิติบุคคล">นิติบุคคล</option></select></label>
  </div>
  <button class="pill primary" id="tf_btn">คำนวณ</button>
  <div class="calc-note">* ประมาณการหยาบ: ค่าโอน 2%, อากร 0.5%/SBT 3.3%</div>
  <div class="result" id="tf_out"></div>`;

  const g=id=>mount.querySelector('#'+id);
  g('tf_btn').onclick=()=>{
    const price=+g('tf_price').value||0;
    const payer=g('tf_payer').value;
    const hold=g('tf_hold').value;
    const seller=g('tf_seller').value;
    const transferFee = price*0.02;
    const sbt = (hold==='<=5' || seller==='นิติบุคคล') ? price*0.033 : 0;
    const stamp = sbt>0 ? 0 : price*0.005;
    let buyerShare=1;
    if(payer==='split') buyerShare=0.5;
    if(payer==='seller') buyerShare=0;
    const buyerPays = (transferFee+stamp)*buyerShare;
    const sellerPays = (transferFee+stamp+ sbt) - buyerPays;
    g('tf_out').textContent = `ค่าโอนรวม ≈ ${(transferFee).toLocaleString('th-TH')} • อากร/หรือ SBT ≈ ${(stamp||sbt).toLocaleString('th-TH')} • ผู้ซื้อ ≈ ${Math.round(buyerPays).toLocaleString('th-TH')} • ผู้ขาย ≈ ${Math.round(sellerPays).toLocaleString('th-TH')}`;
  };
}
