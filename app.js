/***********************************************************
 ✅ Attendance System (2025) - Fixed for GitHub Pages
 ✅ Works perfectly with Google Apps Script + AllOrigins CORS proxy
***********************************************************/

// ضع هنا رابط Web App الذي نسخته من Google Apps Script 👇
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzL4t8dh0kZ_0cCEeiHflghv4vaHKOSfncoBWWi6REs0Yk_ImimlPqEzn2nhRvIfOYc/exec";

// حل مشكلة CORS باستخدام AllOrigins proxy
const GOOGLE_SCRIPT_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(SCRIPT_URL)}`;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const manualInput = document.getElementById('manualInput');
const submitManual = document.getElementById('submitManual');
const actionType = document.getElementById('actionType');
const scannedCountEl = document.getElementById('scannedCount');
const lastMsg = document.getElementById('lastMsg');
const previewElemId = 'preview';

let html5QrcodeScanner = null;
let scanning = false;
let scannedCount = 0;

function updateCounter(){ scannedCountEl.textContent = scannedCount; }
function showMsg(text, error=false){ 
  lastMsg.textContent = text; 
  lastMsg.style.color = error ? 'red' : 'green'; 
  setTimeout(()=>{ lastMsg.textContent=''; }, 5000);
}

startBtn.addEventListener('click', function(){
  if (scanning) return;
  if (typeof Html5Qrcode === 'undefined') { showMsg('📦 مكتبة المسح غير محمّلة', true); return; }
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
      showMsg('⛔ تم إيقاف المسح');
    }).catch(console.error);
  }
}

function isNumericString(str){ return /^\d{1,14}$/.test(str); }

submitManual.addEventListener('click', ()=>{
  const val = manualInput.value.trim();
  if (!isNumericString(val)){ showMsg('⚠️ أدخل رقم موظف صحيح (أرقام فقط)', true); return; }
  handleScanned(val);
  manualInput.value = '';
});

async function handleScanned(employeeNumber){
  const action = actionType.value;
  const now = new Date();
  const date = now.toLocaleDateString('en-GB');
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const payload = {
    employeeNumber: employeeNumber,
    actionType: action,
    date: date,
    time: time
  };

  scannedCount++;
  updateCounter();

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    try { var j = JSON.parse(text); } catch { var j = null; }

    if (res.ok && j && j.status === 'success') showMsg('✅ تم الإرسال: ' + employeeNumber);
    else if (res.ok && j) showMsg('⚠️ ' + (j.message || JSON.stringify(j)));
    else showMsg('❌ فشل الإرسال: ' + text, true);
  } catch (e) {
    showMsg('❌ خطأ في الإرسال: ' + e.message, true);
    console.error(e);
  }
}
