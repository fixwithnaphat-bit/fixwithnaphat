// ระบบส่งข้อมูลไปยัง Google Sheets
// Google Apps Script URL - เปลี่ยนเป็น URL ของคุณหลัง deploy
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVKNwwydrVfO8s43avDvik5-Prt3iZdzaSnHwhFljXGct4AB6rkeqavP_L3gixGxrVmQ/exec';

// ข้อมูลสำหรับการแสดงผล
let supportersCount = 0;
const targetSupporters = 2500;
let supportersList = [];

// เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    console.log('ระบบหาเสียงเลือกตั้ง - โหลดแล้ว');
    
    // โหลดข้อมูลจาก Google Sheets
    loadInitialData();
    
    // จัดการฟอร์ม
    setupForm();
    
    // ตรวจสอบการเชื่อมต่อ
    checkConnectionStatus();
    
    // อัปเดตข้อมูลทุก 30 วินาที
    setInterval(updateStats, 30000);
});

// โหลดข้อมูลเริ่มต้น
async function loadInitialData() {
    try {
        const stats = await fetchStats();
        
        if (stats && stats.totalSupporters !== undefined) {
            supportersCount = stats.totalSupporters;
            supportersList = stats.recentSupporters || [];
            
            updateUI();
            console.log(`โหลดข้อมูลสำเร็จ: ${supportersCount} ผู้สนับสนุน`);
        }
    } catch (error) {
        console.error('โหลดข้อมูลล้มเหลว:', error);
        loadFromLocalStorage();
    }
}

// ดึงข้อมูลจาก Google Sheets
async function fetchStats() {
    try {
        const url = `${GOOGLE_SCRIPT_URL}?action=getStats&t=${Date.now()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message || data.error);
        }
        
        return data;
    } catch (error) {
        console.error('fetchStats error:', error);
        throw error;
    }
}

// โหลดจาก Local Storage
function loadFromLocalStorage() {
    const savedCount = localStorage.getItem('localSupportersCount');
    const savedList = localStorage.getItem('localSupportersList');
    
    if (savedCount) {
        supportersCount = parseInt(savedCount);
    }
    
    if (savedList) {
        supportersList = JSON.parse(savedList);
    }
    
    updateUI();
}

// จัดการฟอร์ม
function setupForm() {
    const form = document.getElementById('supportForm');
    const studentIdInput = document.getElementById('studentId');
    
    if (!form) return;
    
    // ตรวจสอบรหัสนักศึกษาแบบ real-time
    studentIdInput.addEventListener('input', function() {
        validateStudentIdInput(this.value);
    });
    
    // ส่งฟอร์ม
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        await submitForm();
    });
    
    // ตรวจสอบ checkbox
    const agreeCheckbox = document.getElementById('agreeTerms');
    if (agreeCheckbox) {
        agreeCheckbox.addEventListener('change', function() {
            updateSubmitButtonState();
        });
    }
}

// ตรวจสอบรหัสนักศึกษา
function validateStudentIdInput(value) {
    const input = document.getElementById('studentId');
    const isValid = /^\d{8}$/.test(value.trim());
    
    if (value && !isValid) {
        input.classList.add('error');
        return false;
    } else {
        input.classList.remove('error');
        return true;
    }
}

// อัปเดตสถานะปุ่มส่ง
function updateSubmitButtonState() {
    const studentId = document.getElementById('studentId').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const submitBtn = document.querySelector('.submit-btn');
    
    const isValidId = /^\d{8}$/.test(studentId);
    submitBtn.disabled = !(isValidId && agreeTerms);
}

// ส่งฟอร์ม
async function submitForm() {
    const studentId = document.getElementById('studentId').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // ตรวจสอบข้อมูล
    if (!/^\d{8}$/.test(studentId)) {
        showMessage('กรุณากรอกรหัสนักศึกษา 8 หลักให้ถูกต้อง', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('กรุณายอมรับข้อตกลงก่อนส่ง', 'warning');
        return;
    }
    
    // แสดงสถานะกำลังส่ง
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
    submitBtn.disabled = true;
    
    try {
        // ส่งข้อมูลไปยัง Google Sheets
        const result = await submitToGoogleSheets(studentId);
        
        if (result.success) {
            // อัปเดตข้อมูล
            supportersCount = result.totalSupporters || supportersCount + 1;
            
            // เพิ่มในรายการล่าสุด
            supportersList.unshift({
                id: studentId,
                time: 'เมื่อสักครู่',
                timestamp: new Date().toLocaleString('th-TH')
            });
            
            // จำกัดจำนวนรายการ
            if (supportersList.length > 10) {
                supportersList = supportersList.slice(0, 10);
            }
            
            // อัปเดต UI
            updateUI();
            
            // แสดงข้อความสำเร็จ
            showMessage(`ขอบคุณ! รหัสนักศึกษา ${studentId} ถูกบันทึกแล้ว`, 'success');
            
            // รีเซ็ตฟอร์ม
            document.getElementById('supportForm').reset();
            
            // บันทึกลง Local Storage
            saveToLocalStorage();
            
        } else if (result.duplicate) {
            // กรณีข้อมูลซ้ำ
            showMessage(`รหัสนักศึกษา ${studentId} ได้สนับสนุนไปแล้ว`, 'error');
        } else {
            // กรณีอื่นๆ
            showMessage(result.message || 'เกิดข้อผิดพลาด', 'error');
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        
        // ลองใช้ระบบสำรอง
        const backupSuccess = await backupSubmit(studentId);
        
        if (backupSuccess) {
            showMessage('บันทึกข้อมูลชั่วคราวสำเร็จ (ระบบออฟไลน์)', 'warning');
        } else {
            showMessage('ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่', 'error');
        }
        
    } finally {
        // คืนสถานะปุ่ม
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        updateSubmitButtonState();
    }
}

// ส่งข้อมูลไปยัง Google Sheets
async function submitToGoogleSheets(studentId) {
    const timestamp = new Date().toLocaleString('th-TH');
    const date = new Date().toLocaleDateString('th-TH');
    
    // สร้าง FormData
    const formData = new URLSearchParams();
    formData.append('studentId', studentId);
    formData.append('timestamp', timestamp);
    formData.append('date', date);
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Submit to Google Sheets failed:', error);
        throw error;
    }
}

// ระบบสำรอง (Local Storage)
async function backupSubmit(studentId) {
    try {
        // บันทึกลง Local Storage
        const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
        
        pendingSubmissions.push({
            studentId: studentId,
            timestamp: new Date().toLocaleString('th-TH'),
            date: new Date().toLocaleDateString('th-TH'),
            submittedAt: new Date().toISOString()
        });
        
        localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));
        
        // อัปเดตจำนวนผู้สนับสนุนท้องถิ่น
        supportersCount++;
        const localCount = parseInt(localStorage.getItem('localSupportersCount') || '0') + 1;
        localStorage.setItem('localSupportersCount', localCount.toString());
        
        // เพิ่มในรายการ
        supportersList.unshift({
            id: studentId,
            time: 'เมื่อสักครู่ (ออฟไลน์)'
        });
        
        if (supportersList.length > 10) {
            supportersList = supportersList.slice(0, 10);
        }
        
        // อัปเดต UI
        updateUI();
        
        // พยายามส่งใหม่ภายหลัง
        setTimeout(retryPendingSubmissions, 5000);
        
        return true;
        
    } catch (error) {
        console.error('Backup submit failed:', error);
        return false;
    }
}

// พยายามส่งข้อมูลที่ค้างอยู่
async function retryPendingSubmissions() {
    const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    
    if (pendingSubmissions.length === 0) return;
    
    console.log(`พยายามส่งข้อมูลที่ค้างอยู่ ${pendingSubmissions.length} รายการ`);
    
    const successful = [];
    
    for (const submission of pendingSubmissions) {
        try {
            const result = await submitToGoogleSheets(submission.studentId);
            
            if (result.success) {
                successful.push(submission);
                
                // อัปเดตจำนวนจาก server
                if (result.totalSupporters) {
                    supportersCount = result.totalSupporters;
                    updateUI();
                }
            }
        } catch (error) {
            console.error(`Retry failed for ${submission.studentId}:`, error);
        }
    }
    
    // ลบรายการที่ส่งสำเร็จ
    if (successful.length > 0) {
        const newPending = pendingSubmissions.filter(p => 
            !successful.some(s => s.studentId === p.studentId)
        );
        
        localStorage.setItem('pendingSubmissions', JSON.stringify(newPending));
        console.log(`ส่งสำเร็จ ${successful.length} รายการ`);
    }
}

// อัปเดต UI
function updateUI() {
    // อัปเดตจำนวนผู้สนับสนุน
    const countElement = document.getElementById('currentSupporters');
    if (countElement) {
        countElement.textContent = supportersCount.toLocaleString();
    }
    
    // อัปเดตแถบความคืบหน้า
    updateProgressBar();
    
    // อัปเดตรายชื่อผู้สนับสนุนล่าสุด
    updateRecentSupporters();
}

// อัปเดตแถบความคืบหน้า
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.querySelector('.progress-text span');
    
    if (!progressFill) return;
    
    const percentage = Math.min((supportersCount / targetSupporters) * 100, 100);
    progressFill.style.width = `${percentage}%`;
    
    if (progressText) {
        progressText.textContent = `${percentage.toFixed(1)}% ของเป้าหมาย`;
    }
}

// อัปเดตรายชื่อผู้สนับสนุนล่าสุด
function updateRecentSupporters() {
    const container = document.getElementById('supportersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (supportersList.length === 0) {
        container.innerHTML = `
            <div class="no-supporters">
                <i class="fas fa-users"></i>
                <p>ยังไม่มีผู้สนับสนุน</p>
            </div>
        `;
        return;
    }
    
    supportersList.forEach(supporter => {
        const div = document.createElement('div');
        div.className = 'supporter-item';
        div.innerHTML = `
            <div class="supporter-id">${supporter.id}</div>
            <div class="supporter-time">${supporter.time}</div>
        `;
        container.appendChild(div);
    });
}

// บันทึกลง Local Storage
function saveToLocalStorage() {
    localStorage.setItem('localSupportersCount', supportersCount.toString());
    localStorage.setItem('localSupportersList', JSON.stringify(supportersList));
}

// อัปเดตข้อมูลสถิติ
async function updateStats() {
    try {
        const stats = await fetchStats();
        
        if (stats && stats.totalSupporters !== undefined) {
            // อัปเดตจำนวนถ้ามีการเปลี่ยนแปลง
            if (stats.totalSupporters !== supportersCount) {
                supportersCount = stats.totalSupporters;
                supportersList = stats.recentSupporters || [];
                updateUI();
                console.log('อัปเดตข้อมูลจาก server');
            }
        }
    } catch (error) {
        console.log('อัปเดตข้อมูลล้มเหลว (อาจออฟไลน์)');
    }
}

// ตรวจสอบสถานะการเชื่อมต่อ
async function checkConnectionStatus() {
    try {
        await fetchStats();
        showConnectionStatus(true);
    } catch (error) {
        showConnectionStatus(false);
    }
}

// แสดงสถานะการเชื่อมต่อ
function showConnectionStatus(connected) {
    // ลบสถานะเก่า
    const oldStatus = document.getElementById('connection-status');
    if (oldStatus) oldStatus.remove();
    
    // สร้างสถานะใหม่
    const status = document.createElement('div');
    status.id = 'connection-status';
    status.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        opacity: 0.9;
        transition: all 0.3s;
    `;
    
    if (connected) {
        status.style.backgroundColor = 'rgba(102, 203, 65, 0.9)';
        status.style.color = 'white';
        status.innerHTML = '<i class="fas fa-wifi"></i> ออนไลน์';
    } else {
        status.style.backgroundColor = 'rgba(255, 193, 7, 0.9)';
        status.style.color = '#856404';
        status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ออฟไลน์';
    }
    
    document.body.appendChild(status);
}

// แสดงข้อความ
function showMessage(text, type) {
    const messageDiv = document.getElementById('responseMessage');
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = `response-message ${type}`;
    messageDiv.style.display = 'block';
    
    // ซ่อนข้อความหลังจาก 5 วินาที
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// เพิ่ม CSS สำหรับ error state
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #studentId.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25) !important;
        }
        
        .no-supporters {
            text-align: center;
            padding: 20px;
            color: #666;
            grid-column: 1 / -1;
        }
        
        .no-supporters i {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #ddd;
        }
        
        #connection-status {
            font-family: 'Kanit', sans-serif;
        }
    `;
    document.head.appendChild(style);
}

// เริ่มต้น
addCustomStyles();

// เปิดใช้งานฟังก์ชันทดสอบใน development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    window.testSystem = async function() {
        console.log('=== ระบบทดสอบ ===');
        console.log('Supporters Count:', supportersCount);
        console.log('Supporters List:', supportersList);
        console.log('Local Storage:', {
            localCount: localStorage.getItem('localSupportersCount'),
            pending: JSON.parse(localStorage.getItem('pendingSubmissions') || '[]').length
        });
        
        try {
            const stats = await fetchStats();
            console.log('Server Stats:', stats);
        } catch (error) {
            console.log('Server unreachable');
        }
    };
    
    // เพิ่มปุ่มทดสอบ
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 50px;
        right: 10px;
        padding: 5px 10px;
        background: #0A427C;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 1000;
        opacity: 0.7;
    `;
    testBtn.onclick = window.testSystem;
    document.body.appendChild(testBtn);
}
