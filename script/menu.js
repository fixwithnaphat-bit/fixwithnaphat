document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".side-menu button");
    const sections = document.querySelectorAll(".content-section");

    // ซ่อนทั้งหมดก่อน
    sections.forEach(section => section.style.display = "none");

    // แสดงอันแรก + active ค่าเริ่มต้น
    document.getElementById("objective").style.display = "block";
    buttons[0].classList.add("active");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");

            // ซ่อนเนื้อหาทั้งหมด
            sections.forEach(section => {
                section.style.display = "none";
            });

            // ลบ active จากปุ่มทั้งหมด
            buttons.forEach(btn => btn.classList.remove("active"));

            // แสดงเฉพาะที่เลือก
            document.getElementById(targetId).style.display = "block";

            // ใส่ active ให้ปุ่มที่กด
            this.classList.add("active");
        });
    });
});

function calculateDuration() {
    // วันที่เริ่ม (21 ธันวาคม พ.ศ. 2568 = ค.ศ. 2025)
    let start = new Date(2025, 11, 21); // เดือนเริ่มที่ 0
    let end = new Date();

    if (end < start) {
        document.getElementById("time").textContent = "(0 วัน)";
        return;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        let prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // กรณีไม่ถึง 1 วัน
    if (years === 0 && months === 0 && days === 0) {
        days = 0;
    }

    let result = [];

    if (years > 0) result.push(years + " ปี");
    if (months > 0) result.push(months + " เดือน");

    // วันแสดงเสมอ
    result.push(days + " วัน");

    document.getElementById("time").textContent = "(" + result.join(" ") + ")";
}

calculateDuration();