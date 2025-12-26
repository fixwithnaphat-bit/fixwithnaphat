// ข้อมูลจำลองสำหรับการทดสอบ
let supportersCount = 1247;
const targetSupporters = 2500;
let supportersList = [
    { id: "6312345678", faculty: "คณะวิศวกรรมศาสตร์", time: "2 นาทีที่แล้ว" },
    { id: "6311122334", faculty: "คณะวิทยาศาสตร์", time: "5 นาทีที่แล้ว" },
    { id: "6315566778", faculty: "คณะบริหารธุรกิจ", time: "10 นาทีที่แล้ว" },
    { id: "6319988776", faculty: "คณะมนุษยศาสตร์", time: "15 นาทีที่แล้ว" },
    { id: "6314433221", faculty: "คณะสังคมศาสตร์", time: "20 นาทีที่แล้ว" },
    { id: "6317890123", faculty: "คณะแพทยศาสตร์", time: "25 นาทีที่แล้ว" },
    { id: "6314567890", faculty: "คณะนิติศาสตร์", time: "30 นาทีที่แล้ว" },
    { id: "6312345098", faculty: "คณะวิศวกรรมศาสตร์", time: "35 นาทีที่แล้ว" }
];

// รหัสนักศึกษาที่เคยส่งแล้ว (จำลองฐานข้อมูล)
const submittedIds = new Set([
    "6312345678", "6311122334", "6315566778", 
    "6319988776", "6314433221", "6317890123",
    "6314567890", "6312345098"
]);

// URL ของ Google Apps Script (ให้ใส่ URL จริงของคุณที่นี่)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYOUR_SCRIPT_ID/exec';

// เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    // อัปเดตแถบความคืบหน้า
    updateProgressBar();
    
    // แสดงรายชื่อผู้สนับสนุนล่าสุด
    displaySupporters();
    
    // จัดการฟอร์มส่งการสนับสนุน
    const supportForm = document.getElementById('supportForm');
    supportForm.addEventListener('submit', handleFormSubmit);
    
    // ตรวจสอบรหัสนักศึกษาเมื่อผู้ใช้พิมพ์
    const studentIdInput = document.getElementById('studentId');
    studentIdInput.addEventListener('input', validateStudentId);
});

// อัปเดตแถบความคืบหน้า
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = (supportersCount / targetSupporters) * 100;
    
    progressFill.style.width = `${progressPercent}%`;
    
    // อัปเดตข้อความเปอร์เซ็นต์
    const progressText = document.querySelector('.progress-text span');
    progressText.textContent = `${progressPercent.toFixed(1)}% ของเป้าหมาย`;
}

// แสดงรายชื่อผู้สนับสนุนล่าสุด
function displaySupporters() {
    const supportersListElement = document.getElementById('supportersList');
    supportersListElement.innerHTML = '';
    
    supportersList.forEach(supporter => {
        const supporterItem = document.createElement('div');
        supporterItem.className = 'supporter-item';
        supporterItem.innerHTML = `
            <div class="supporter-id">${supporter.id}</div>
            <div class="supporter-faculty">${supporter.faculty}</div>
            <div class="supporter-time">${supporter.time}</div>
        `;
        supportersListElement.appendChild(supporterItem);
    });
}

// ตรวจสอบความถูกต้องของรหัสนักศึกษา
function validateStudentId() {
    const studentIdInput = document.getElementById('studentId');
    const studentId = studentIdInput.value.trim();
    
    // ตรวจสอบรูปแบบรหัสนักศึกษา (ควรเป็นตัวเลข 10 หลัก)
    const studentIdPattern = /^\d{10}$/;
    
    if (studentId && !studentIdPattern.test(studentId)) {
        studentIdInput.style.borderColor = '#dc3545';
        return false;
    } else {
        studentIdInput.style.borderColor = '#ddd';
        return true;
    }
}

// จัดการการส่งฟอร์ม
function handleFormSubmit(event) {
    event.preventDefault();
    
    // ตรวจสอบความถูกต้องของรหัสนักศึกษา
    if (!validateStudentId()) {
        showResponseMessage('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (ตัวเลข 10 หลัก)', 'error');
        return;
    }
    
    // ตรวจสอบว่าผู้ใช้ยอมรับข้อตกลงหรือไม่
    const agreeTerms = document.getElementById('agreeTerms').checked;
    if (!agreeTerms) {
        showResponseMessage('กรุณายอมรับข้อตกลงก่อนส่งการสนับสนุน', 'warning');
        return;
    }
    
    // รวบรวมข้อมูลจากฟอร์ม
    const studentId = document.getElementById('studentId').value.trim();
    const faculty = document.getElementById('faculty').value;
    const year = document.getElementById('year').value;
    
    // ตรวจสอบว่ารหัสนักศึกษานี้เคยส่งแล้วหรือไม่
    if (submittedIds.has(studentId)) {
        showResponseMessage(`รหัสนักศึกษา ${studentId} ได้สนับสนุนไปแล้ว`, 'error');
        return;
    }
    
    // แสดงสถานะกำลังส่ง
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';
    submitBtn.disabled = true;
    
    // สร้างข้อมูลที่จะส่ง
    const formData = {
        studentId: studentId,
        faculty: faculty,
        year: year,
        timestamp: new Date().toISOString()
    };
    
    // จำลองการส่งข้อมูลไปยัง Google Sheets
    simulateSubmitToGoogleSheets(formData)
        .then(response => {
            // เพิ่มรหัสนักศึกษาในรายการที่ส่งแล้ว
            submittedIds.add(studentId);
            
            // อัปเดตจำนวนผู้สนับสนุน
            supportersCount++;
            document.getElementById('currentSupporters').textContent = supportersCount.toLocaleString();
            
            // อัปเดตแถบความคืบหน้า
            updateProgressBar();
            
            // เพิ่มผู้สนับสนุนใหม่ในรายการ
            const facultyNames = {
                'engineering': 'คณะวิศวกรรมศาสตร์',
                'science': 'คณะวิทยาศาสตร์',
                'business': 'คณะบริหารธุรกิจ',
                'humanities': 'คณะมนุษยศาสตร์',
                'social': 'คณะสังคมศาสตร์',
                'medicine': 'คณะแพทยศาสตร์',
                'law': 'คณะนิติศาสตร์'
            };
            
            const newSupporter = {
                id: studentId,
                faculty: facultyNames[faculty] || faculty,
                time: 'เมื่อสักครู่'
            };
            
            // เพิ่มผู้สนับสนุนใหม่ที่ต้นรายการ
            supportersList.unshift(newSupporter);
            
            // แสดงผู้สนับสนุนล่าสุด 8 คนแรก
            if (supportersList.length > 8) {
                supportersList = supportersList.slice(0, 8);
            }
            
            // อัปเดตแสดงรายชื่อผู้สนับสนุน
            displaySupporters();
            
            // แสดงข้อความสำเร็จ
            showResponseMessage(`ขอบคุณสำหรับการสนับสนุน! รหัสนักศึกษา ${studentId} ถูกบันทึกแล้ว`, 'success');
            
            // รีเซ็ตฟอร์ม
            document.getElementById('supportForm').reset();
        })
        .catch(error => {
            console.error('Error:', error);
            showResponseMessage('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองอีกครั้ง', 'error');
        })
        .finally(() => {
            // คืนสถานะปุ่มกลับเป็นปกติ
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
}

// จำลองการส่งข้อมูลไปยัง Google Sheets
function simulateSubmitToGoogleSheets(formData) {
    return new Promise((resolve, reject) => {
        // ในสภาพแวดล้อมจริง คุณจะต้องส่งข้อมูลไปยัง Google Apps Script
        // ตัวอย่างโค้ดสำหรับการส่งข้อมูลจริง:
        /*
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => resolve(response))
        .catch(error => reject(error));
        */
        
        // จำลองการหน่วงเวลาในการส่งข้อมูล
        setTimeout(() => {
            // จำลองโอกาสความล้มเหลว 10%
            if (Math.random() < 0.1) {
                reject(new Error('การเชื่อมต่อล้มเหลว'));
            } else {
                resolve({ status: 'success', message: 'ข้อมูลถูกบันทึกแล้ว' });
            }
        }, 1500);
    });
}

// แสดงข้อความตอบกลับ
function showResponseMessage(message, type) {
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.textContent = message;
    responseMessage.className = 'response-message ' + type;
    
    // ซ่อนข้อความหลังจาก 5 วินาที
    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
}

// ฟังก์ชันสำหรับทดสอบการเพิ่มผู้สนับสนุน
function addTestSupporter() {
    // สร้างรหัสนักศึกษาสุ่มสำหรับทดสอบ
    const randomId = '63' + Math.floor(10000000 + Math.random() * 90000000);
    
    // เพิ่มในรายการส่งแล้ว
    submittedIds.add(randomId);
    
    // อัปเดตจำนวนผู้สนับสนุน
    supportersCount++;
    document.getElementById('currentSupporters').textContent = supportersCount.toLocaleString();
    
    // อัปเดตแถบความคืบหน้า
    updateProgressBar();
    
    // เพิ่มผู้สนับสนุนใหม่ในรายการ
    const faculties = [
        'คณะวิศวกรรมศาสตร์',
        'คณะวิทยาศาสตร์',
        'คณะบริหารธุรกิจ',
        'คณะมนุษยศาสตร์',
        'คณะสังคมศาสตร์',
        'คณะแพทยศาสตร์',
        'คณะนิติศาสตร์'
    ];
    
    const randomFaculty = faculties[Math.floor(Math.random() * faculties.length)];
    const newSupporter = {
        id: randomId,
        faculty: randomFaculty,
        time: 'เมื่อสักครู่'
    };
    
    // เพิ่มผู้สนับสนุนใหม่ที่ต้นรายการ
    supportersList.unshift(newSupporter);
    
    // แสดงผู้สนับสนุนล่าสุด 8 คนแรก
    if (supportersList.length > 8) {
        supportersList = supportersList.slice(0, 8);
    }
    
    // อัปเดตแสดงรายชื่อผู้สนับสนุน
    displaySupporters();
    
    // แสดงข้อความสำเร็จ
    showResponseMessage(`เพิ่มผู้สนับสนุนทดสอบ: ${randomId}`, 'success');
}
