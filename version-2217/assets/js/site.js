(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function showSlide(index) {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        var next = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === next);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === next);
        });
        document.documentElement.setAttribute('data-hero-index', String(next));
    }

    function currentSlide() {
        var active = qs('.hero-slide.active');
        var slides = qsa('.hero-slide');
        return Math.max(0, slides.indexOf(active));
    }

    function setupHero() {
        var slides = qsa('.hero-slide');
        if (!slides.length) {
            return;
        }
        showSlide(0);
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(currentSlide() - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(currentSlide() + 1);
            });
        }
        qsa('.hero-dot').forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        window.setInterval(function () {
            showSlide(currentSlide() + 1);
        }, 5200);
    }

    function setupMenu() {
        var toggle = qs('.menu-toggle');
        var nav = qs('#mobileNav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupFilters() {
        var input = qs('[data-filter-input]');
        var year = qs('[data-filter-year]');
        var type = qs('[data-filter-type]');
        var region = qs('[data-filter-region]');
        var cards = qsa('.movie-card[data-title]');
        if (!input && !year && !type && !region) {
            return;
        }
        function read(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }
        function apply() {
            var q = read(input);
            var y = read(year);
            var t = read(type);
            var r = read(region);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && String(card.getAttribute('data-year')) !== y) {
                    ok = false;
                }
                if (t && String(card.getAttribute('data-type')) !== t) {
                    ok = false;
                }
                if (r && String(card.getAttribute('data-region')) !== r) {
                    ok = false;
                }
                card.classList.toggle('hidden', !ok);
            });
        }
        [input, year, type, region].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
    }

    window.initDetailPlayer = function (sourceUrl) {
        var video = document.getElementById('movieVideo');
        var cover = document.getElementById('playerCover');
        var button = document.getElementById('playButton');
        var message = document.getElementById('playerMessage');
        var loaded = false;
        var hls = null;
        if (!video) {
            return;
        }
        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('视频加载失败');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else {
                setMessage('视频加载失败');
            }
        }
        function start() {
            load();
            var playPromise = video.play();
            if (cover) {
                cover.classList.add('hidden');
            }
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove('hidden');
                    }
                });
            }
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('error', function () {
            setMessage('视频加载失败');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
