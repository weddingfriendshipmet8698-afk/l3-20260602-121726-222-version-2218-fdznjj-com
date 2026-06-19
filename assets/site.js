(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-slide-to]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-slide-to'), 10) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var cards = selectAll('[data-card]', scope);
            var input = scope.querySelector('[data-search-input]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var regionSelect = scope.querySelector('[data-filter-region]');
            var categorySelect = scope.querySelector('[data-filter-category]');
            var reset = scope.querySelector('[data-reset-filter]');
            var empty = scope.querySelector('[data-empty]');
            var years = [];
            var regions = [];

            cards.forEach(function (card) {
                var year = card.getAttribute('data-year') || '';
                var region = card.getAttribute('data-region') || '';
                if (year && years.indexOf(year) === -1) {
                    years.push(year);
                }
                if (region && regions.indexOf(region) === -1) {
                    regions.push(region);
                }
            });

            years.sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-Hans-CN', { numeric: true });
            });
            regions.sort(function (a, b) {
                return String(a).localeCompare(String(b), 'zh-Hans-CN');
            });
            fillSelect(yearSelect, years);
            fillSelect(regionSelect, regions);

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var region = regionSelect ? regionSelect.value : '';
                var category = categorySelect ? categorySelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-title') || '').toLowerCase();
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || card.getAttribute('data-year') === year;
                    var matchRegion = !region || card.getAttribute('data-region') === region;
                    var matchCategory = !category || card.getAttribute('data-category') === category;
                    var matched = matchKeyword && matchYear && matchRegion && matchCategory;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, yearSelect, regionSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    if (regionSelect) {
                        regionSelect.value = '';
                    }
                    if (categorySelect) {
                        categorySelect.value = '';
                    }
                    apply();
                });
            }

            var query = new URLSearchParams(window.location.search).get('q');
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    function initPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var source = player.getAttribute('data-src');
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play]');
        var jump = document.querySelector('[data-play-jump]');
        var hasBound = false;
        var hls = null;

        function bindSource() {
            if (hasBound || !video || !source) {
                return;
            }
            hasBound = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showPlaybackMessage();
                    }
                });
                return;
            }
            video.src = source;
            video.load();
        }

        function showPlaybackMessage() {
            if (!overlay) {
                return;
            }
            overlay.classList.remove('is-hidden');
            overlay.innerHTML = '<span class="play-circle">▶</span><strong>暂时无法播放，请稍后重试</strong>';
        }

        function play() {
            bindSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        function toggle() {
            if (!hasBound || video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', toggle);
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
        if (jump) {
            jump.addEventListener('click', function (event) {
                event.preventDefault();
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                play();
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
