/* =========================================
   ARIK MUKHERJEE — WEBSITE INTERACTIONS
   ========================================= */

(() => {
    "use strict";

    // -------------------------------------
    // 1. ANIMATED PARTICLES AND WAVE LINES
    // -------------------------------------

    const canvas = document.getElementById("ambient-canvas");
    const ctx = canvas.getContext("2d");

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let frame = 0;
    let animationId = null;

    const pointer = {
        x: -1000,
        y: -1000
    };

    function getParticleCount() {
        return Math.min(
            150,
            Math.floor((width * height) / 9500)
        );
    }

    function resizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        particles = Array.from(
            { length: getParticleCount() },
            () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.6 + 0.25,
                speed: Math.random() * 0.24 + 0.04,
                phase: Math.random() * Math.PI * 2,
                alpha: Math.random() * 0.48 + 0.12
            })
        );

        if (reduceMotion) {
            drawBackground();
        }
    }

    function drawWaves() {
        for (let layer = 0; layer < 7; layer++) {
            ctx.beginPath();

            const amplitude = height * (0.035 + layer * 0.012);
            const baseline = height * (0.22 + layer * 0.105);

            for (let x = 0; x <= width + 12; x += 12) {
                const wave =
                    Math.sin(
                        x * 0.0032 +
                        frame * (0.75 + layer * 0.05) +
                        layer * 0.8
                    ) * amplitude
                    +
                    Math.sin(
                        x * 0.007 +
                        frame * 0.6 +
                        layer
                    ) * amplitude * 0.25;

                const y = baseline + wave;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            const alpha = 0.045 + layer * 0.008;

            ctx.strokeStyle =
                `rgba(245, 245, 245, ${alpha})`;

            ctx.lineWidth = layer % 3 === 0 ? 1.2 : 0.6;

            ctx.shadowBlur = layer % 2 === 0 ? 13 : 0;
            ctx.shadowColor = "rgba(255, 255, 255, 0.12)";

            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }

    function drawParticles() {
        for (const particle of particles) {
            if (!reduceMotion) {
                particle.y -= particle.speed * 0.35;

                particle.x += Math.sin(
                    frame * 1.4 + particle.phase
                ) * 0.18;

                if (particle.y < -5) {
                    particle.y = height + 5;
                    particle.x = Math.random() * width;
                }
            }

            const dx = pointer.x - particle.x;
            const dy = pointer.y - particle.y;
            const distance = Math.hypot(dx, dy);

            const glow = distance < 130
                ? (1 - distance / 130) * 0.55
                : 0;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.radius + glow,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(245, 245, 245, ${
                    Math.min(0.85, particle.alpha + glow)
                })`;

            ctx.fill();

            if (glow > 0.08) {
                ctx.beginPath();

                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(pointer.x, pointer.y);

                ctx.strokeStyle =
                    `rgba(245, 245, 245, ${glow * 0.12})`;

                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    function drawBackground() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        ctx.clearRect(0, 0, width, height);

        if (!reduceMotion) {
            frame += 0.006;
        }

        drawWaves();
        drawParticles();

        if (!reduceMotion) {
            animationId = requestAnimationFrame(drawBackground);
        }
    }

    window.addEventListener("resize", resizeCanvas, {
        passive: true
    });

    window.addEventListener("pointermove", (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    }, {
        passive: true
    });

    document.addEventListener("pointerleave", () => {
        pointer.x = -1000;
        pointer.y = -1000;
    });

    resizeCanvas();
    drawBackground();


    // -------------------------------------
    // 2. WORKING HAMBURGER NAVIGATION
    // -------------------------------------

    const menuToggle = document.getElementById("menuToggle");
    const menuPanel = document.getElementById("menuPanel");

    function setMenuState(isOpen) {
        menuToggle.classList.toggle("active", isOpen);
        menuPanel.classList.toggle("open", isOpen);

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

        menuPanel.setAttribute(
            "aria-hidden",
            String(!isOpen)
        );

        menuPanel.inert = !isOpen;
    }

    function toggleMenu() {
        const isOpen = menuPanel.classList.contains("open");
        setMenuState(!isOpen);
    }

    menuToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    menuPanel.addEventListener("click", (event) => {
        event.stopPropagation();

        const link = event.target.closest("a");

        if (link) {
            setMenuState(false);
        }
    });

    document.addEventListener("click", (event) => {
        const clickedMenu = menuPanel.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (!clickedMenu && !clickedToggle) {
            setMenuState(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });


    // -------------------------------------
    // 3. ROTATING PROFESSIONAL ROLES
    // -------------------------------------

    const roles = [
        "Computer Vision",
        "Artificial Intelligence",
        "Software Development",
        "Machine Learning"
    ];

    const roleElement = document.getElementById("rotatingRole");

    if (!reduceMotion && roleElement) {
        let roleIndex = 0;

        window.setInterval(() => {
            roleIndex = (roleIndex + 1) % roles.length;

            roleElement.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(7px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 450,
                    easing: "ease-out"
                }
            );

            roleElement.textContent = roles[roleIndex];
        }, 2800);
    }


    // -------------------------------------
    // 4. AUTOMATIC COPYRIGHT YEAR
    // -------------------------------------

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

})();
