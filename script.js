document.addEventListener("DOMContentLoaded", () => {
    const CONTACT_EMAIL = "sujeevjohnthotakuri@gmail.com";

    const openMailClient = ({ name, email, message }) => {
        const subject = encodeURIComponent(`New portfolio inquiry from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nProject Details:\n${message}`
        );

        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    /* ================= CUSTOM CURSOR ================= */
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    const linksAndButtons = document.querySelectorAll("a, button, input, textarea");

    // Only activate custom cursor if not on a touch device
    if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
        window.addEventListener("mousemove", (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Adding slight delay to outline for smooth effect
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Hover effect for interactive elements
        linksAndButtons.forEach(el => {
            el.addEventListener("mouseenter", () => {
                cursorOutline.style.width = "60px";
                cursorOutline.style.height = "60px";
                cursorOutline.style.backgroundColor = "rgba(37, 117, 252, 0.1)";
            });
            el.addEventListener("mouseleave", () => {
                cursorOutline.style.width = "40px";
                cursorOutline.style.height = "40px";
                cursorOutline.style.backgroundColor = "transparent";
            });
        });
    }

    /* ================= NAVBAR SCROLL & ACTIVE LINK ================= */
    const navbar = document.querySelector(".navbar");
    const sections = document.querySelectorAll("section, header");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        // Sticky Navbar styling
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Active Link Highlighting
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    });

    /* ================= MOBILE MENU TOGGLE ================= */
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinksContainer = document.querySelector(".nav-links");

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener("click", () => {
            navLinksContainer.classList.toggle("mobile-active");
            const icon = menuToggle.querySelector("i");
            if(navLinksContainer.classList.contains("mobile-active")) {
                icon.classList.replace("ph-list", "ph-x");
            } else {
                icon.classList.replace("ph-x", "ph-list");
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navLinksContainer && menuToggle) {
                navLinksContainer.classList.remove("mobile-active");
                menuToggle.querySelector("i").classList.replace("ph-x", "ph-list");
            }
        });
    });

    /* ================= SCROLL REVEAL ANIMATION ================= */
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                
                // Trigger Progress Bar animation if inside About section
                const progressBars = entry.target.querySelectorAll(".progress");
                progressBars.forEach(bar => {
                    bar.style.width = bar.getAttribute("data-width");
                });

                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -100px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ================= COUNTER ANIMATION ================= */
    const counters = document.querySelectorAll(".counter");
    let hasCounted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasCounted) {
            hasCounted = true;
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute("data-target");
                    const count = +counter.innerText;
                    const speed = 200; // lower = faster
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
        }
    }, { threshold: 0.5 });

    const statsSection = document.querySelector("#stats");
    if(statsSection) {
        counterObserver.observe(statsSection);
    }

    /* ================= PARALLAX BACKGROUND EFFECT ================= */
    const heroSection = document.querySelector(".hero");
    const glows = document.querySelectorAll(".ambient-glow");

    if (heroSection && glows.length >= 2) {
        heroSection.addEventListener("mousemove", (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 90;
            const y = (window.innerHeight - e.pageY * 2) / 90;

            glows[0].style.transform = `translate(${x}px, ${y}px)`;
            glows[1].style.transform = `translate(${-x}px, ${-y}px)`;
        });
    }

    /* ================= FORM VALIDATION & RESEND API ================= */
    const form = document.getElementById("contactForm");
    const formStatus = document.querySelector(".form-status");

    if (form && formStatus) {
        form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (name && email && message) {
            const btn = form.querySelector("button");
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, message })
                });

                if (!response.ok) {
                    throw new Error("Contact API request failed");
                }

                const result = await response.json();

                if (result.success) {
                    formStatus.style.color = "#4ade80"; // Green color for success
                    formStatus.innerText = "Message sent successfully! I will get back to you soon.";
                    form.reset();
                    
                    // Clear message after 5 seconds
                    setTimeout(() => {
                        formStatus.innerText = "";
                    }, 5000);
                }
            } catch (error) {
                console.error("Error sending email:", error);
                openMailClient({ name, email, message });
                formStatus.style.color = "#facc15";
                formStatus.innerText = "Email service is unavailable right now, so your mail app has been opened instead.";
            } finally {
                btn.innerText = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;
            }
        } else {
            formStatus.style.color = "#f87171"; // Red color for error
            formStatus.innerText = "Please fill in all fields.";
        }
        });
    }

});
