// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Dark/light theme toggle. The current theme is applied before first paint by an
// inline script in _Layout.cshtml; this handles switching and persistence.
(function () {
    var toggle = document.getElementById("theme-toggle");
    if (!toggle) {
        return;
    }

    toggle.addEventListener("click", function () {
        var root = document.documentElement;
        var isLight = root.getAttribute("data-theme") === "light";

        if (isLight) {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", "light");
        }

        try {
            localStorage.setItem("theme", isLight ? "dark" : "light");
        } catch (e) { }
    });
})();

// Smooth scrolling for public pages. Lenis is used when the CDN is available;
// a small wheel fallback keeps the interaction smooth if the CDN is blocked.
(function () {
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || document.body.classList.contains("admin-body")) {
        return;
    }

    var headerOffset = 88;
    var lenis = null;

    function isLocalHashLink(link) {
        if (!link || !link.hash || link.origin !== window.location.origin) {
            return false;
        }

        return link.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "");
    }

    function getScrollTopForTarget(target) {
        return Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
    }

    function bindAnchorLinks() {
        document.addEventListener("click", function (event) {
            var link = event.target.closest("a[href^='#'], a[href*='/#']");

            if (!isLocalHashLink(link)) {
                return;
            }

            var target = document.querySelector(link.hash);

            if (!target) {
                return;
            }

            event.preventDefault();

            if (lenis) {
                lenis.scrollTo(target, {
                    offset: -headerOffset,
                    duration: 1.05
                });
            } else {
                window.scrollTo({
                    top: getScrollTopForTarget(target),
                    behavior: "smooth"
                });
            }

            history.pushState(null, "", link.hash);
        });
    }

    function isInsideScrollableElement(element) {
        var current = element;

        while (current && current !== document.body && current !== document.documentElement) {
            var style = window.getComputedStyle(current);
            var overflowY = style.overflowY;
            var canScrollY = (overflowY === "auto" || overflowY === "scroll") &&
                current.scrollHeight > current.clientHeight;

            if (canScrollY) {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }

    function initWheelFallback() {
        if (!window.matchMedia("(pointer: fine)").matches) {
            return;
        }

        var currentY = window.scrollY;
        var targetY = window.scrollY;
        var frame = 0;

        function maxScrollY() {
            return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        }

        function animate() {
            currentY += (targetY - currentY) * 0.18;

            if (Math.abs(targetY - currentY) < 0.5) {
                window.scrollTo(0, targetY);
                frame = 0;
                return;
            }

            window.scrollTo(0, currentY);
            frame = requestAnimationFrame(animate);
        }

        window.addEventListener("wheel", function (event) {
            if (
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                event.shiftKey ||
                Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
                isInsideScrollableElement(event.target)
            ) {
                return;
            }

            event.preventDefault();

            targetY = Math.max(0, Math.min(maxScrollY(), targetY + event.deltaY));

            if (!frame) {
                currentY = window.scrollY;
                frame = requestAnimationFrame(animate);
            }
        }, { passive: false });

        window.addEventListener("scroll", function () {
            if (!frame) {
                currentY = window.scrollY;
                targetY = window.scrollY;
            }
        }, { passive: true });
    }

    if (typeof Lenis !== "undefined") {
        lenis = new Lenis({
            duration: 1.25,
            easing: function (t) {
                return Math.min(1, 1.001 - Math.pow(2, -10 * t));
            },
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 0.85,
            touchMultiplier: 1.2
        });

        window.__xuanNhaLenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    } else {
        initWheelFallback();
    }

    bindAnchorLinks();
})();

// Click and Drag Horizontal Scroll Mechanics
document.addEventListener("DOMContentLoaded", function () {
    const sliders = document.querySelectorAll('.drag-scroll');
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;
        let startPageX;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            hasDragged = false;
            slider.classList.add('dragging');
            startX = e.pageX - slider.offsetLeft;
            startPageX = e.pageX;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                slider.classList.remove('dragging');
            }
        });

        slider.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                slider.classList.remove('dragging');
            }
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; // Speed multiplier
            
            if (Math.abs(e.pageX - startPageX) > 6) {
                hasDragged = true;
            }

            if (hasDragged) {
                e.preventDefault();
                slider.scrollLeft = scrollLeft - walk;
            }
        });

        // Prevent links from navigating if dragging occurred
        slider.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true); // Intercept during capture phase
    });
});

