/***********************************************************
 🟢 Attendance App Frontend (GitHub Pages)
***********************************************************/
const GOOGLE_SCRIPT_URL = "https://api.allorigins.win/raw?url=https://script.google.com/macros/s/AKfycbyLe-2HgTVyDDM2oeEmAZvl-5LXtULvrwI8aWKwXhnXkjoXlPVcdtnFhSy8b3SFdpls/exec";

// ✅ الدالة التي تُرسل البيانات إلى Google Sheet
async function sendAttendanceData(employeeNumber, action) {
  const today = new Date();
  const date = today.toLocaleDateString('en-GB');
  const time = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const payload = {
    employeeNumber: employeeNumber,
    action: action,
    date: date,
    time: time
  };

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("تم الإرسال بنجاح:", payload);
    alert("✅ تم تسجيل الحضور بنجاح!");

  } catch (error) {
    console.error("خطأ أثناء الإرسال:", error);
    alert("❌ حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.");
  }
}

// 🟢 مثال على الاستخدام (زر أو مسح QR)
document.getElementById("submitBtn").addEventListener("click", () => {
  const empNumber = document.getElementById("employeeNumber").value.trim();
  const actionType = document.querySelector("input[name='actionType']:checked").value;

  if (empNumber === "") {
    alert("⚠️ الرجاء إدخال رقم الموظف");
    return;
  }

  sendAttendanceData(empNumber, actionType);
});
