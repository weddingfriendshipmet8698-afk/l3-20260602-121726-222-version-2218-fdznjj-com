(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }

        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupSearch() {
        var inputs = qsa('.site-search, .local-search input');
        var cards = qsa('[data-search]');
        if (!inputs.length || !cards.length) {
            return;
        }

        function filter(value) {
            var keyword = String(value || '').trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hidden-by-search', keyword && haystack.indexOf(keyword) === -1);
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                filter(input.value);
                inputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            inputs.forEach(function (input) {
                input.value = q;
            });
            filter(q);
        }
    }

    function setupPlayers() {
        qsa('video[data-video-src]').forEach(function (video) {
            var src = video.getAttribute('data-video-src');
            var shell = video.closest('.player-shell');
            var button = shell ? qs('.play-button', shell) : null;
            var loaded = false;

            function mark(message) {
                var note = shell && shell.parentElement ? qs('.player-note', shell.parentElement) : null;
                if (note && message) {
                    note.textContent = message;
                }
            }

            function load() {
                if (loaded || !src) {
                    return Promise.resolve();
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (shell) {
                            shell.classList.add('loaded');
                        }
                        mark('视频源已加载，可使用播放器控制栏播放、暂停、全屏。');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            mark('网络错误，正在尝试重新加载视频源。');
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            mark('媒体错误，正在尝试恢复播放。');
                            hls.recoverMediaError();
                        } else {
                            mark('视频加载失败，请稍后重试。');
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    if (shell) {
                        shell.classList.add('loaded');
                    }
                    mark('视频源已加载，可使用播放器控制栏播放。');
                } else {
                    mark('当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器。');
                }
                return Promise.resolve();
            }

            function play() {
                load().then(function () {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            mark('点击播放器控制栏即可开始播放。');
                        });
                    }
                });
            }

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupSearch();
        setupPlayers();
    });
}());
