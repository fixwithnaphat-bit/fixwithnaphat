document.addEventListener('DOMContentLoaded', function() {
    // ควบคุมปุ่มเล่นเพลง
    const musicBtn = document.getElementById('musicBtn');
    const campaignSong = document.getElementById('campaignSong');
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    
    let isPlaying = false;
    
    musicBtn.addEventListener('click', function() {
        if (isPlaying) {
            campaignSong.pause();
            playIcon.textContent = '▶';
            playText.textContent = 'เปิดเพลงบ้านอธิรัฐ';
            musicBtn.classList.remove('playing');
        } else {
            campaignSong.play().catch(e => {
                console.log('การเล่นเสียงถูกบล็อก:', e);
                alert('กรุณาคลิกที่หน้าจอเพื่ออนุญาตการเล่นเสียง');
            });
            playIcon.textContent = '⏸';
            playText.textContent = 'หยุดเพลงบ้านอธิรัฐ';
            musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
    
    // Smooth scroll สำหรับ navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Toggle menu สำหรับมือถือ
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if (nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'rgba(15, 15, 15, 0.95)';
                nav.style.padding = '1rem';
                nav.style.gap = '1rem';
            }
        });
    }
    
    // เปลี่ยนสี header เมื่อ scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.main-header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 15, 15, 0.98)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(15, 15, 15, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
    
    // Animation สำหรับ policy cards เมื่อมองเห็น
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe policy cards
    document.querySelectorAll('.policy-card').forEach(card => {
        observer.observe(card);
    });
});