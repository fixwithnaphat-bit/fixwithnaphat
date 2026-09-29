/* =========================================================
   TEAM อาสาพัฒนาไทย
   MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const header = document.getElementById("siteHeader");
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const backToTop = document.getElementById("backToTop");


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    function updateHeader() {

        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    updateHeader();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function openMenu() {

        menuToggle.classList.add("active");

        mobileMenu.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.style.overflow = "hidden";

    }


    function closeMenu() {

        menuToggle.classList.remove("active");

        mobileMenu.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.style.overflow = "";

    }


    menuToggle.addEventListener("click", () => {

        if (mobileMenu.classList.contains("active")) {

            closeMenu();

        } else {

            openMenu();

        }

    });


    /* ปิดเมนูเมื่อกดลิงก์ */

    document
        .querySelectorAll(".mobile-link, .mobile-join")
        .forEach(link => {

            link.addEventListener("click", closeMenu);

        });


    /* ปิดด้วย ESC */

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            mobileMenu.classList.contains("active")
        ) {

            closeMenu();

        }

    });


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    function updateBackToTop() {

        if (window.scrollY > 600) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    }


    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );


    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    updateBackToTop();


    /* =====================================================
       REVEAL ANIMATION
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".intro-grid, .value-card, .statement, .news-card, .join-content"
    );


    revealElements.forEach(element => {

        element.classList.add("reveal");

    });


    const revealObserver = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.12
        }

    );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });


    /* =====================================================
       STAGGER VALUE CARDS
    ===================================================== */

    document
        .querySelectorAll(".value-card")
        .forEach((card, index) => {

            card.style.transitionDelay =
                `${index * 100}ms`;

        });


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const currentYear = new Date().getFullYear();

    const footerYear = document.querySelector(
        ".footer-bottom span:first-child"
    );


    if (footerYear) {

        footerYear.innerHTML =
            `© ${currentYear} ทีมอาสาพัฒนาไทย`;

    }


    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    const heroImage =
        document.querySelector(".hero-image");


    window.addEventListener(
        "scroll",
        () => {

            if (
                !heroImage ||
                window.scrollY > window.innerHeight
            ) {
                return;
            }


            const movement =
                window.scrollY * 0.12;


            heroImage.style.transform =
                `translateY(${movement}px)`;

        },
        { passive: true }
    );


});
