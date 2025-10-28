/***********************************************************
 ✅ Attendance System (Frontend) - Final Full Version
***********************************************************/
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwALCuYvqQSE27AKpfSQROuOsojsWxaC5BQsEXr7mMnB6mEVQPBxFDo0708G0WjcGZU/exec";

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const manualInput = document.getElementById('manualInput');
const submitManual = document.getElementById('submitManual');
const actionType = document.getElementById('actionType');
const scannedCountEl = document.getElementById('scannedCount');
const lastMsg = document.getElementById('lastMsg');
const previewElemId = 'preview';

const reportType = document.getElementById('reportType');
const employeeIdInput = document.getElementById('employeeId');
const dayDate = document.getElementById('dayDate');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const getReport = document.getElementById('getReport');
const downloadXLS = document.getElementById('downloadXLS');
const reportResult = document.getElementById('reportResult');

let html5QrcodeScanner = null;
let scanning = false;
let scannedCount = 0;

function updateCounter(){ scannedCountEl.textContent = scannedCount; }
function showMsg(text, error=false){ 
  lastMsg.textContent = text; 
  lastMsg.style.color = error ? 'red' : 'green'; 
  setTimeout(()=>{ lastMsg.textContent=''; }, 4000);
}

// ==================== المسح ====================
startBtn.addEventListener('click', function(){
  if (scanning) return;
  if (typeof Html5Qrcode === 'undefined') { showMsg('مكتبة المسح غير محمّلة', true); return; }

  html5QrcodeScanner = new Html5Qrcode(previewElemId);
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    function(decodedText){
      stopScanning();
      handleScanned(decodedText);
    }
  ).then(()=>{
    scanning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    showMsg('📷 جاهز للمسح...');
  }).catch(err=>{
    showMsg('⚠️ خطأ في الكاميرا', true);
    console.error(err);
  });
});

stopBtn.addEventListener('click', stopScanning);

function stopScanning(){
  if (html5QrcodeScanner && scanning){
    html5QrcodeScanner.stop().then(()=>{
      html5QrcodeScanner.clear();
      scanning = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      showMsg('تم إيقاف المسح');
    }).catch(console.error);
  }
}

function isNumericString(str){ return /^\d{1,14}$/.test(str); }

submitManual.addEventListener('click', ()=>{
  const val = manualInput.value.trim();
  if (!isNumericString(val)){ showMsg('أدخل رقم موظف صحيح (أرقام فقط)', true); return; }
  handleScanned(val);
  manualInput.value = '';
});

async function handleScanned(employeeNumber){
  const action = actionType.value;
  const payload = { employeeNumber, actionType: action };

  scannedCount++;
  updateCounter();

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify(payload)
    });
    showMsg('✅ تم الإرسال: ' + employeeNumber);
  } catch (e) {
    showMsg('❌ خطأ في الإرسال: ' + e.message, true);
  }
}

// ==================== التقارير ====================
getReport.addEventListener('click', async ()=>{
  let url = GOOGLE_SCRIPT_URL + '?type=' + reportType.value;
  if (reportType.value === 'employee') url += '&employee=' + encodeURIComponent(employeeIdInput.value.trim());
  if (reportType.value === 'day') url += '&date=' + dayDate.value.split('-').reverse().join('/');
  if (reportType.value === 'range') url += '&from=' + fromDate.value + '&to=' + toDate.value;

  try {
    const res = await fetch(url);
    const j = await res.json();
    if (j.status === 'ok') {
      renderReportTable(j.columns, j.rows);
      downloadXLS.disabled = false;
      window._lastReport = j;
      showMsg('📊 تم تحميل التقرير');
    } else showMsg('⚠️ لا توجد بيانات', true);
  } catch (e) {
    showMsg('❌ خطأ في تحميل التقرير', true);
  }
});

function renderReportTable(columns, rows){
  let html = '<table><thead><tr>';
  columns.forEach(c=> html += `<th>${c}</th>`);
  html += '</tr></thead><tbody>';
  rows.forEach(r=> html += `<tr>${r.map(c=>`<td>${c??''}</td>`).join('')}</tr>`);
  html += '</tbody></table>';
  reportResult.innerHTML = html;
}

downloadXLS.addEventListener('click', ()=>{
  const rep = window._lastReport;
  if (!rep) return;
  const csv = [rep.columns.join(',')]
    .concat(rep.rows.map(r=>r.map(c=>`"${(c??'').replace(/"/g,'""')}"`).join(',')))
    .join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'report.csv';
  a.click();
});
