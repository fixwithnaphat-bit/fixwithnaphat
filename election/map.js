document.addEventListener("DOMContentLoaded", () => {

    const zoneText = {
        stadium: "สนามกีฬา",
        alumni: "สมาคมศิษย์เก่า สจล.",
        dormitory: "หอใน",
        medicine: "คณะแพทยศาสตร์",
        wellness: "KMITL Wellness & Sports Center",
        cmit_ami: "วิทยาลัยนวัตกรรมการผลิตขั้นสูง",
        kl_villa: "KL VILLA",
        Phrathep: "อาคารศูนย์เรียนรวมสมเด็จพระเทพ และคณะศิลปศาสตร์",
        kmids: "KMIDS",
        office_of_the_president: "สำนักงานอธิการบดี",
        kmitl_clinic: "โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร และวิทยาลัยเทคโนโลยีและนวัตกรรมวัสดุ",
        garden: "พื้นที่สีเขียว และลานพระจอม",
        dentistry: "คณะทันตแพทยศาสตร์",
        it: "คณะเทคโนโลยีสารสนเทศ และ KOSEN KMITL",
        siet: "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
        sci: "คณะวิทยาศาสตร์",
        business: "คณะบริหารธุรกิจ",
        iaai: "วิทยาลัยอุตสาหกรรมการบินนานาชาติ",
        parking: "ลานจอดรถ",
        agri: "คณะเทคโนโลยีการเกษตร",
        kllc: "KLLC สำนักการเรียนรู้ตลอดชีวิตพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
        nurse: "คณะพยาบาลศาสตร์",
        rimoa: "สถาบันวิจัยเกษตรอินทรีย์ยุคใหม่",
        hall: "หอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ (วร บุนนาค)",
        foodindustry: "คณะอุตสาหกรรมอาหาร",
        aad: "คณะสถาปัตยกรรม ศิลปะและการออกแบบ",
        eng_1: "คณะวิศวกรรมศาสตร์",
        eng_2: "คณะวิศวกรรมศาสตร์ (ฝั่งหอใน)"
    };

    const place = document.getElementById("place");

    fetch("https://th-dvt.pages.dev/images/KMITL_MAP.svg")
        .then(res => res.text())
        .then(svg => {
            document.getElementById("svg-map").innerHTML = svg;

            const zones = document.querySelectorAll("#svg-map g[zone]");

            zones.forEach(zone => {
                const zoneName = zone.getAttribute("zone");

                // hover
                zone.addEventListener("mouseenter", () => {
                    place.textContent = zoneText[zoneName] || "";
                });

                zone.addEventListener("mouseleave", () => {
                    place.textContent = "";
                });

                // click → ไปหน้า .html
                zone.addEventListener("click", () => {
                    window.location.href = `map/${zoneName}.html`;
                });
            });
        });
});