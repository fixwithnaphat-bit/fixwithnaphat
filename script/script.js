// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navList.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navList.classList.remove('active');
        });
    });
    
    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements to animate
    const elementsToAnimate = document.querySelectorAll('.news-card, .about h2, .about p, .news h2');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
});


(async function renderNewsFromGAS() {
  const url = 'https://script.google.com/macros/s/AKfycbzAlYAedv_LhQbAB-yom8PMSNRQhF3ZNfSWjUfBivPKSfll2OJp7pq35cy1DvGItRwHDQ/exec';
  const grid = document.querySelector('.news-grid');
  if (!grid) {
    console.error('ไม่พบ .news-grid ในหน้า');
    return;
  }

  // ใส่ loading placeholder (ถ้าต้องการ)
  const loadingEl = document.createElement('div');
  loadingEl.textContent = 'กำลังโหลด...';
  grid.innerHTML = '';
  grid.appendChild(loadingEl);

  // ฟังก์ชันแปลงสถานะ -> คลาสสี
  function statusClass(status) {
    if (!status) return 'status--red';
    const s = status.trim();
    if (s === 'เสร็จสิ้น') return 'status--green';
    if (s === 'ดำเนินการ') return 'status--yellow';
    if (s === 'รอรับเรื่อง') return 'status--red';
    // ค่าเริ่มต้น
    return 'status--red';
  }

  // ฟังก์ชันสร้างการ์ด
  function createCard(item) {
    // สร้าง container
    const card = document.createElement('div');
    card.className = 'news-card animate-in';

    // image
    const imgWrap = document.createElement('div');
    imgWrap.className = 'news-image';
    const img = document.createElement('img');
    img.src = item.images || 'https://via.placeholder.com/300x200?text=No+Image';
    img.alt = item.heading || 'ภาพข่าว';
    // fallback ถ้าภาพไม่โหลด
    img.onerror = () => { img.src = 'https://via.placeholder.com/300x200?text=No+Image'; };
    imgWrap.appendChild(img);

    // content
    const content = document.createElement('div');
    content.className = 'news-content';

    const h3 = document.createElement('h3');
    h3.textContent = item.heading || 'ไม่มีหัวข้อ';

    const p = document.createElement('p');
    // details | by , date
    const details = item.details ? item.details : '';
    const by = item.by ? item.by : '';
    const date = item.date ? item.date : '';
    p.textContent = [details, by, date].filter(Boolean).join(' | ');

    const statusP = document.createElement('p');
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status ' + statusClass(item.status);
    statusSpan.textContent = item.status || 'ไม่ระบุสถานะ';
    statusP.appendChild(statusSpan);

    const a = document.createElement('a');
    a.className = 'read-more';
    a.textContent = 'อ่านเพิ่มเติม';
    a.href = item.link || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    // ประกอบ
    content.appendChild(h3);
    content.appendChild(p);
    content.appendChild(statusP);
    content.appendChild(a);

    card.appendChild(imgWrap);
    card.appendChild(content);
    return card;
  }

  try {
    const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP error ' + resp.status);
    const data = await resp.json();

    // เคลียร์ loading
    grid.innerHTML = '';

    // ถ้า JSON เป็น object ที่มี array ใน field เช่น { items: [...] }
    const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
    if (!items.length) {
      const empty = document.createElement('div');
      empty.textContent = 'ไม่พบข้อมูลข่าวสาร';
      grid.appendChild(empty);
      return;
    }

    // สร้างการ์ดสำหรับแต่ละ item และเพิ่มลงใน grid
    items.forEach(item => {
      const card = createCard(item);
      grid.appendChild(card);
    });

  } catch (err) {
    console.error('เกิดข้อผิดพลาดขณะดึงข้อมูล:', err);
    grid.innerHTML = '';
    const errEl = document.createElement('div');
    errEl.textContent = 'เกิดข้อผิดพลาดในการโหลดข้อมูลข่าวสาร';
    grid.appendChild(errEl);
  }
})();
