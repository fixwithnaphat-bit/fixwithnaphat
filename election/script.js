// ข้อมูลจำลองสำหรับการทดสอบ
let supportersCount = 7;
const targetSupporters = 500;
let supportersList = [
    { id: "64123456", time: "2 นาทีที่แล้ว" },
    { id: "64112233", time: "5 นาทีที่แล้ว" },
    { id: "64556677", time: "10 นาทีที่แล้ว" },
    { id: "64998877", time: "15 นาทีที่แล้ว" },
    { id: "64443322", time: "20 นาทีที่แล้ว" },
    { id: "64789012", time: "25 นาทีที่แล้ว" },
    { id: "64456789", time: "30 นาทีที่แล้ว" },
    { id: "64234509", time: "35 นาทีที่แล้ว" }
];

// รหัสนักศึกษาที่เคยส่งแล้ว (จำลองฐานข้อมูล)
const submittedIds = new Set([
    "64123456", "64112233", "64556677", 
    "64998877", "64443322", "64789012",
    "64456789", "64234509"
]);

// URL ของ Google Apps Script (ให้ใส่ URL จริงของคุณที่นี่)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYOUR_SCRIPT_ID/exec';

// ข้อมูลสำหรับจำลองการเชื่อมต่อกับ Google Sheets
let isConnectedToGoogleSheets = false;

// เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    console.log('หน้าเว็บโหลดเสร็จแล้ว');
    
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
    
    // เพิ่มปุ่มสำหรับทดสอบ
    addTestButton();
    
    // จำลองการเชื่อมต่อกับ Google Sheets
    simulateGoogleSheetsConnection();
});

// อัปเดตแถบความคืบหน้า
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const currentSupporters = document.getElementById('currentSupporters');
    
    // แสดงจำนวนผู้สนับสนุนในรูปแบบที่อ่านง่าย
    currentSupporters.textContent = supportersCount.toLocaleString();
    
    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    const progressPercent = (supportersCount / targetSupporters) * 100;
    const clampedPercent = Math.min(progressPercent, 100); // ไม่ให้เกิน 100%
    
    // อัปเดตแถบความคืบหน้า
    progressFill.style.width = `${clampedPercent}%`;
    
    // อัปเดตข้อความเปอร์เซ็นต์
    const progressText = document.querySelector('.progress-text span');
    progressText.textContent = `${clampedPercent.toFixed(1)}% ของเป้าหมาย`;
    
    console.log(`อัปเดตแถบความคืบหน้า: ${supportersCount}/${targetSupporters} (${clampedPercent.toFixed(1)}%)`);
}

// แสดงรายชื่อผู้สนับสนุนล่าสุด
function displaySupporters() {
    const supportersListElement = document.getElementById('supportersList');
    supportersListElement.innerHTML = '';
    
    // ตรวจสอบว่ามีผู้สนับสนุนหรือไม่
    if (supportersList.length === 0) {
        supportersListElement.innerHTML = `
            <div class="no-supporters">
                <i class="fas fa-users-slash"></i>
                <p>ยังไม่มีผู้สนับสนุนในขณะนี้</p>
            </div>
        `;
        return;
    }
    
    // แสดงผู้สนับสนุนล่าสุด
    supportersList.forEach(supporter => {
        const supporterItem = document.createElement('div');
        supporterItem.className = 'supporter-item';
        supporterItem.innerHTML = `
            <div class="supporter-id">${supporter.id}</div>
            <div class="supporter-time">${supporter.time}</div>
        `;
        supportersListElement.appendChild(supporterItem);
    });
    
    console.log(`แสดงรายชื่อผู้สนับสนุน ${supportersList.length} คน`);
}

// ตรวจสอบความถูกต้องของรหัสนักศึกษา
function validateStudentId() {
    const studentIdInput = document.getElementById('studentId');
    const studentId = studentIdInput.value.trim();
    
    // ตรวจสอบรูปแบบรหัสนักศึกษา (ควรเป็นตัวเลข 8 หลัก)
    const studentIdPattern = /^\d{8}$/;
    
    if (studentId && !studentIdPattern.test(studentId)) {
        studentIdInput.style.borderColor = '#dc3545';
        studentIdInput.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.2)';
        return false;
    } else {
        studentIdInput.style.borderColor = '#ddd';
        studentIdInput.style.boxShadow = 'none';
        
        // ตรวจสอบว่ารหัสนักศึกษาซ้ำหรือไม่ (แสดงคำเตือนทันที)
        if (studentIdPattern.test(studentId) && submittedIds.has(studentId)) {
            studentIdInput.style.borderColor = '#ffc107';
            studentIdInput.style.boxShadow = '0 0 0 2px rgba(255, 193, 7, 0.2)';
            
            // แสดงคำเตือนเล็กๆ
            const existingMessage = document.querySelector('.duplicate-warning');
            if (!existingMessage) {
                const warningMsg = document.createElement('div');
                warningMsg.className = 'duplicate-warning';
                warningMsg.style.color = '#856404';
                warningMsg.style.fontSize = '0.9rem';
                warningMsg.style.marginTop = '5px';
                warningMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> รหัสนักศึกษานี้ได้สนับสนุนไปแล้ว';
                
                const parent = studentIdInput.parentNode;
                if (parent.querySelector('.input-info')) {
                    parent.insertBefore(warningMsg, parent.querySelector('.input-info'));
                } else {
                    parent.appendChild(warningMsg);
                }
            }
        } else {
            // ลบคำเตือนถ้ามี
            const existingMessage = document.querySelector('.duplicate-warning');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
        
        return true;
    }
}

// จัดการการส่งฟอร์ม
function handleFormSubmit(event) {
    event.preventDefault();
    console.log('ฟอร์มถูกส่ง');
    
    // ตรวจสอบความถูกต้องของรหัสนักศึกษา
    if (!validateStudentId()) {
        showResponseMessage('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (ตัวเลข 8 หลัก)', 'error');
        return;
    }
    
    // ตรวจสอบว่าผู้ใช้ยอมรับข้อตกลงหรือไม่
    const agreeTerms = document.getElementById('agreeTerms').checked;
    if (!agreeTerms) {
        showResponseMessage('กรุณายอมรับข้อตกลงก่อนส่งการสนับสนุน', 'warning');
        return;
    }
    
    // รวบรวมข้อมูลจากฟอร์ม (เฉพาะรหัสนักศึกษา)
    const studentId = document.getElementById('studentId').value.trim();
    
    // ตรวจสอบว่ารหัสนักศึกษานี้เคยส่งแล้วหรือไม่
    if (submittedIds.has(studentId)) {
        showResponseMessage(`รหัสนักศึกษา ${studentId} ได้สนับสนุนไปแล้ว`, 'error');
        return;
    }
    
    // แสดงสถานะกำลังส่ง
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    const originalBtnWidth = submitBtn.offsetWidth + 'px';
    
    // ตั้งค่าขนาดปุ่มให้คงที่
    submitBtn.style.width = originalBtnWidth;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';
    submitBtn.disabled = true;
    
    // สร้างข้อมูลที่จะส่ง (เฉพาะรหัสนักศึกษา)
    const formData = {
        studentId: studentId,
        timestamp: new Date().toLocaleString('th-TH'),
        date: new Date().toISOString().split('T')[0]
    };
    
    console.log('กำลังส่งข้อมูล:', formData);
    
    // ส่งข้อมูลไปยัง Google Sheets (หรือจำลอง)
    submitToGoogleSheets(formData)
        .then(response => {
            console.log('ส่งข้อมูลสำเร็จ:', response);
            
            // เพิ่มรหัสนักศึกษาในรายการที่ส่งแล้ว
            submittedIds.add(studentId);
            
            // อัปเดตจำนวนผู้สนับสนุน
            supportersCount++;
            
            // อัปเดตแถบความคืบหน้า
            updateProgressBar();
            
            // เพิ่มผู้สนับสนุนใหม่ในรายการ
            const newSupporter = {
                id: studentId,
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
            
            // ลบคำเตือนซ้ำถ้ามี
            const duplicateWarning = document.querySelector('.duplicate-warning');
            if (duplicateWarning) {
                duplicateWarning.remove();
            }
            
            // แสดงแอนิเมชันเล็กน้อย
            animateSupportCount();
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาดในการส่ง:', error);
            showResponseMessage('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองอีกครั้ง', 'error');
        })
        .finally(() => {
            // คืนสถานะปุ่มกลับเป็นปกติ
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.width = ''; // ลบค่าความกว้างที่ตั้งไว้
        });
}

// ส่งข้อมูลไปยัง Google Sheets
function submitToGoogleSheets(formData) {
    return new Promise((resolve, reject) => {
        // ตรวจสอบว่ามี URL Google Script หรือไม่
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
            console.warn('ยังไม่ได้ตั้งค่า URL Google Script ใช้ระบบจำลองแทน');
            
            // ใช้ระบบจำลองถ้ายังไม่ได้ตั้งค่า
            simulateSubmitToGoogleSheets(formData)
                .then(resolve)
                .catch(reject);
            return;
        }
        
        // ส่งข้อมูลไปยัง Google Apps Script จริง
        console.log('กำลังส่งข้อมูลไปยัง Google Sheets...');
        
        // ใช้ FormData สำหรับส่งข้อมูล
        const formDataToSend = new FormData();
        formDataToSend.append('studentId', formData.studentId);
        formDataToSend.append('timestamp', formData.timestamp);
        formDataToSend.append('date', formData.date);
        formDataToSend.append('action', 'addSupporter');
        
        // ส่งข้อมูลด้วย fetch
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formDataToSend,
            mode: 'no-cors' // หมายเหตุ: no-cors จะจำกัดการเข้าถึง response
        })
        .then(() => {
            // เนื่องจากใช้ no-cors จึงไม่สามารถอ่าน response ได้
            // ให้ถือว่าสำเร็จและใช้ข้อมูลจากฟอร์ม
            resolve({ 
                status: 'success', 
                message: 'ข้อมูลถูกบันทึกลง Google Sheets แล้ว',
                data: formData
            });
        })
        .catch(error => {
            console.error('ส่งไปยัง Google Sheets ไม่สำเร็จ:', error);
            
            // ถ้าไม่สำเร็จ ให้ลองใช้ระบบจำลองแทน
            console.log('เปลี่ยนไปใช้ระบบจำลอง...');
            simulateSubmitToGoogleSheets(formData)
                .then(resolve)
                .catch(reject);
        });
    });
}

// จำลองการส่งข้อมูลไปยัง Google Sheets
function simulateSubmitToGoogleSheets(formData) {
    return new Promise((resolve, reject) => {
        console.log('จำลองการส่งข้อมูลไปยัง Google Sheets:', formData);
        
        // จำลองการหน่วงเวลาในการส่งข้อมูล (1-3 วินาที)
        const delay = 1000 + Math.random() * 2000;
        
        setTimeout(() => {
            // จำลองโอกาสความล้มเหลว 5% สำหรับการทดสอบ
            if (Math.random() < 0.05) {
                const error = new Error('การเชื่อมต่อกับเซิร์ฟเวอร์มีปัญหา');
                reject(error);
            } else {
                resolve({ 
                    status: 'success', 
                    message: 'ข้อมูลถูกบันทึกในระบบจำลองแล้ว',
                    data: formData,
                    simulated: true
                });
            }
        }, delay);
    });
}

// จำลองการเชื่อมต่อกับ Google Sheets
function simulateGoogleSheetsConnection() {
    console.log('กำลังตรวจสอบการเชื่อมต่อกับ Google Sheets...');
    
    setTimeout(() => {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
            console.log('ใช้ระบบจำลอง: ไม่พบ URL Google Script');
            isConnectedToGoogleSheets = false;
            
            // แสดงสถานะในคอนโซล
            const statusElement = document.createElement('div');
            statusElement.id = 'connection-status';
            statusElement.style.position = 'fixed';
            statusElement.style.bottom = '10px';
            statusElement.style.right = '10px';
            statusElement.style.background = 'rgba(255, 193, 7, 0.9)';
            statusElement.style.color = '#856404';
            statusElement.style.padding = '5px 10px';
            statusElement.style.borderRadius = '4px';
            statusElement.style.fontSize = '0.8rem';
            statusElement.style.zIndex = '1000';
            statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ใช้ระบบจำลอง';
            document.body.appendChild(statusElement);
        } else {
            console.log('เชื่อมต่อกับ Google Sheets แล้ว');
            isConnectedToGoogleSheets = true;
        }
    }, 1500);
}

// แสดงข้อความตอบกลับ
function showResponseMessage(message, type) {
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.textContent = message;
    responseMessage.className = 'response-message ' + type;
    responseMessage.style.display = 'block';
    
    // ซ่อนข้อความหลังจาก 5 วินาที
    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
    
    console.log(`แสดงข้อความ: ${message} (${type})`);
}

// แอนิเมชันเมื่อเพิ่มจำนวนผู้สนับสนุน
function animateSupportCount() {
    const countElement = document.getElementById('currentSupporters');
    const originalCount = supportersCount - 1; // เพราะเพิ่งเพิ่มไป
    const newCount = supportersCount;
    
    // แอนิเมชันตัวเลข
    let current = originalCount;
    const increment = (newCount - originalCount) / 20; // แบ่งเป็น 20 ขั้น
    const interval = setInterval(() => {
        current += increment;
        if (current >= newCount) {
            current = newCount;
            clearInterval(interval);
        }
        countElement.textContent = Math.floor(current).toLocaleString();
    }, 50);
    
    // แอนิเมชันแถบความคืบหน้า
    const progressFill = document.getElementById('progressFill');
    const originalWidth = ((originalCount / targetSupporters) * 100);
    const newWidth = ((newCount / targetSupporters) * 100);
    
    let width = originalWidth;
    const widthIncrement = (newWidth - originalWidth) / 20;
    const widthInterval = setInterval(() => {
        width += widthIncrement;
        if (width >= newWidth) {
            width = newWidth;
            clearInterval(widthInterval);
        }
        progressFill.style.width = `${width}%`;
    }, 50);
}

// เพิ่มปุ่มสำหรับทดสอบ
function addTestButton() {
    // สร้างปุ่มทดสอบ (เฉพาะในโหมดพัฒนา)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const testButton = document.createElement('button');
        testButton.id = 'testButton';
        testButton.innerHTML = '<i class="fas fa-vial"></i> เพิ่มผู้สนับสนุนทดสอบ';
        testButton.style.position = 'fixed';
        testButton.style.bottom = '10px';
        testButton.style.left = '10px';
        testButton.style.background = '#66cb41';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.padding = '8px 15px';
        testButton.style.borderRadius = '4px';
        testButton.style.cursor = 'pointer';
        testButton.style.zIndex = '1000';
        testButton.style.fontFamily = "'Kanit', sans-serif";
        testButton.style.fontSize = '0.9rem';
        testButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        testButton.addEventListener('click', addTestSupporter);
        document.body.appendChild(testButton);
        
        console.log('เพิ่มปุ่มทดสอบแล้ว');
    }
}

// เพิ่มผู้สนับสนุนทดสอบ
function addTestSupporter() {
    // สร้างรหัสนักศึกษาสุ่ม 8 หลัก
    const randomId = '64' + Math.floor(100000 + Math.random() * 900000);
    
    // ตรวจสอบว่าไม่ซ้ำ
    if (submittedIds.has(randomId)) {
        // ถ้าซ้ำให้ลองใหม่
        addTestSupporter();
        return;
    }
    
    // เพิ่มในรายการส่งแล้ว
    submittedIds.add(randomId);
    
    // อัปเดตจำนวนผู้สนับสนุน
    supportersCount++;
    
    // อัปเดตแถบความคืบหน้า
    updateProgressBar();
    
    // เพิ่มผู้สนับสนุนใหม่ในรายการ
    const newSupporter = {
        id: randomId,
        time: 'เมื่อสักครู่ (ทดสอบ)'
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
    
    // แสดงแอนิเมชัน
    animateSupportCount();
    
    console.log(`เพิ่มผู้สนับสนุนทดสอบ: ${randomId}`);
}

// เพิ่มสไตล์ CSS สำหรับข้อความเตือนซ้ำ
function addDuplicateWarningStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .duplicate-warning {
            color: #856404;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 5px 10px;
            margin-top: 5px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .no-supporters {
            text-align: center;
            padding: 30px;
            color: #666;
        }
        
        .no-supporters i {
            font-size: 3rem;
            margin-bottom: 15px;
            color: #ddd;
        }
    `;
    document.head.appendChild(style);
}

// เพิ่มสไตล์เมื่อโหลดหน้าเว็บ
addDuplicateWarningStyle();

// ส่งออกฟังก์ชันสำหรับการทดสอบ
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateStudentId,
        updateProgressBar,
        displaySupporters,
        addTestSupporter
    };
}
