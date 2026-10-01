(function () {
    'use strict';

    // ── EmailJS ──

    function initEmailJS() {
        if (typeof emailjs !== 'undefined' && window.EMAILJS_CONFIG) {
            emailjs.init(EMAILJS_CONFIG.userId);
        }
    }

    // ── Smooth scroll ──

    function scrollTo(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var top = el.getBoundingClientRect().top + window.pageYOffset
                  - document.querySelector('.header').offsetHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }

    // ── Active nav link ──

    function syncNav() {
        var sections = document.querySelectorAll('section[id]');
        var links = document.querySelectorAll('.nav-link');
        var current = '';

        sections.forEach(function (s) {
            if (window.scrollY >= s.offsetTop - 120) current = s.id;
        });

        links.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    }

    // ── Reveal on scroll ──

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    function initReveal() {
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // ── Gallery carousel ──

    function initGallery() {
        var track = document.querySelector('.gallery-track');
        var slides = document.querySelectorAll('.gallery-slide');
        var prev = document.querySelector('.gallery-prev');
        var next = document.querySelector('.gallery-next');
        var dotsWrap = document.querySelector('.gallery-dots');
        if (!track || !slides.length) return;

        var idx = 0;
        var perView = getPerView();
        var max = Math.max(0, slides.length - perView);

        function getPerView() {
            if (window.innerWidth <= 480) return 1;
            if (window.innerWidth <= 768) return 2;
            return 3;
        }

        function render() {
            track.style.transform = 'translateX(-' + (idx * (100 / perView)) + '%)';
            var dots = dotsWrap.querySelectorAll('.gallery-dot');
            dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
        }

        function buildDots() {
            dotsWrap.innerHTML = '';
            for (var i = 0; i <= max; i++) {
                var dot = document.createElement('button');
                dot.className = 'gallery-dot';
                dot.setAttribute('aria-label', 'Ir a ' + (i + 1));
                (function (n) {
                    dot.addEventListener('click', function () { go(n); });
                })(i);
                dotsWrap.appendChild(dot);
            }
        }

        function go(n) {
            idx = Math.max(0, Math.min(n, max));
            render();
        }

        prev.addEventListener('click', function () { go(idx <= 0 ? max : idx - 1); });
        next.addEventListener('click', function () { go(idx >= max ? 0 : idx + 1); });

        // Resize
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                perView = getPerView();
                max = Math.max(0, slides.length - perView);
                if (idx > max) idx = max;
                slides.forEach(function (s) { s.style.flex = '0 0 ' + (100 / perView) + '%'; });
                buildDots();
                render();
            }, 150);
        });

        // Touch
        var startX = 0;
        track.addEventListener('touchstart', function (e) {
            startX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', function (e) {
            var diff = startX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) go(diff > 0 ? idx + 1 : idx - 1);
        }, { passive: true });

        // Autoplay
        var timer = setInterval(function () { go(idx >= max ? 0 : idx + 1); }, 5000);
        var gallery = document.querySelector('.gallery');
        gallery.addEventListener('mouseenter', function () { clearInterval(timer); });
        gallery.addEventListener('mouseleave', function () {
            timer = setInterval(function () { go(idx >= max ? 0 : idx + 1); }, 5000);
        });

        // Init
        slides.forEach(function (s) { s.style.flex = '0 0 ' + (100 / perView) + '%'; });
        buildDots();
        render();
    }

    // ── Toast notifications ──

    function toast(msg, type) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();

        var el = document.createElement('div');
        el.className = 'toast toast-' + type;
        el.innerHTML = '<span>' + msg + '</span><button aria-label="Cerrar">&times;</button>';
        document.body.appendChild(el);

        el.querySelector('button').addEventListener('click', function () { el.remove(); });
        requestAnimationFrame(function () { el.classList.add('show'); });

        setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { el.remove(); }, 300);
        }, 4500);
    }

    // ── Contact form ──

    async function handleSubmit(e) {
        e.preventDefault();
        var input = document.getElementById('email');
        var email = input.value.trim();
        var btn = e.target.querySelector('button[type="submit"]');

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast('Por favor, ingresa un email válido.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Enviando...';

        // Demo: sin EmailJS, simula el envío con éxito.
        toast('¡Gracias! Te notificaremos cuando LÜM esté listo.', 'success');
        input.value = '';
        var subs = JSON.parse(localStorage.getItem('lum_subs') || '[]');
        if (subs.indexOf(email) === -1) {
            subs.push(email);
            localStorage.setItem('lum_subs', JSON.stringify(subs));
        }
        btn.disabled = false;
        btn.textContent = 'Suscribirse';
    }

    // ── Init ──

    document.addEventListener('DOMContentLoaded', function () {
        initEmailJS();
        initReveal();
        initGallery();

        // Nav smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                scrollTo(this.getAttribute('href').substring(1));
            });
        });

        // Scroll spy (throttled via rAF)
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () { syncNav(); ticking = false; });
                ticking = true;
            }
        }, { passive: true });

        // Form
        document.getElementById('contactForm').addEventListener('submit', handleSubmit);
    });
})();
