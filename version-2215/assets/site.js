(function () {
    var mobileNav = document.querySelector("[data-mobile-nav]");
    var menuToggle = document.querySelector("[data-menu-toggle]");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
        if (!lists.length) {
            return;
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var localSearch = document.querySelector("[data-local-search]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var categorySelect = document.querySelector("[data-filter-category]");
        var resetButton = document.querySelector("[data-filter-reset]");
        var headerInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function fillSelect(select, attr) {
            if (!select) {
                return;
            }
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute(attr);
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            values.sort(function (a, b) {
                return b.localeCompare(a, "zh-Hans-CN");
            });
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(regionSelect, "data-region");
        fillSelect(yearSelect, "data-year");

        function applyFilters() {
            var query = normalize(localSearch && localSearch.value);
            var region = regionSelect ? regionSelect.value : "all";
            var year = yearSelect ? yearSelect.value : "all";
            var category = categorySelect ? categorySelect.value : "all";

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var regionMatch = region === "all" || card.getAttribute("data-region") === region;
                var yearMatch = year === "all" || card.getAttribute("data-year") === year;
                var categoryMatch = category === "all" || card.getAttribute("data-category") === category;
                var queryMatch = !query || searchText.indexOf(query) !== -1;
                card.classList.toggle("is-hidden", !(regionMatch && yearMatch && categoryMatch && queryMatch));
            });
        }

        if (localSearch) {
            localSearch.addEventListener("input", applyFilters);
            if (initialQuery) {
                localSearch.value = initialQuery;
            }
        }

        headerInputs.forEach(function (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }
        });

        [regionSelect, yearSelect, categorySelect].forEach(function (select) {
            if (select) {
                select.addEventListener("change", applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (localSearch) {
                    localSearch.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "all";
                }
                if (yearSelect) {
                    yearSelect.value = "all";
                }
                if (categorySelect) {
                    categorySelect.value = "all";
                }
                applyFilters();
            });
        }

        applyFilters();
    }

    function setupSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        var canFilter = Boolean(document.querySelector("[data-local-search]"));

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("[data-search-input]");
                var value = input ? input.value.trim() : "";
                if (canFilter) {
                    event.preventDefault();
                    var localSearch = document.querySelector("[data-local-search]");
                    if (localSearch) {
                        localSearch.value = value;
                        localSearch.dispatchEvent(new Event("input", { bubbles: true }));
                        localSearch.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            });
        });
    }

    function attachStream(video) {
        var source = video.getAttribute("data-stream");
        if (!source) {
            return Promise.resolve();
        }

        if (video.getAttribute("src") === source || video.dataset.ready === "true") {
            return Promise.resolve();
        }

        video.dataset.ready = "true";

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            return new Promise(function (resolve) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    resolve();
                });
                video.hlsPlayer = hls;
            });
        }

        video.src = source;
        return Promise.resolve();
    }

    function playVideo(video) {
        if (!video) {
            return;
        }

        attachStream(video).then(function () {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        });
    }

    function setupPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        var videos = Array.prototype.slice.call(document.querySelectorAll(".video-player"));

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var video = document.getElementById(button.getAttribute("data-player"));
                button.classList.add("hidden");
                playVideo(video);
            });
        });

        videos.forEach(function (video) {
            attachStream(video);

            video.addEventListener("click", function () {
                if (video.paused) {
                    var overlay = document.querySelector('[data-player="' + video.id + '"]');
                    if (overlay) {
                        overlay.classList.add("hidden");
                    }
                    playVideo(video);
                }
            });
            video.addEventListener("play", function () {
                var overlay = document.querySelector('[data-player="' + video.id + '"]');
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupHero();
        setupFilters();
        setupSearchForms();
        setupPlayers();
    });
})();
