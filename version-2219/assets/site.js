(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  function normalized(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var search = document.querySelector(".search-field");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    if (!search && !selects.length) {
      return;
    }
    if (!scopes.length) {
      scopes = [document];
    }

    function apply() {
      var query = normalized(search ? search.value : "");
      var year = "";
      var type = "";
      selects.forEach(function (select) {
        if (select.getAttribute("data-filter") === "year") {
          year = normalized(select.value);
        }
        if (select.getAttribute("data-filter") === "type") {
          type = normalized(select.value);
        }
      });

      scopes.forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalized([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.textContent
          ].join(" "));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = !year || normalized(card.getAttribute("data-year")).indexOf(year) !== -1;
          var matchesType = !type || normalized(card.getAttribute("data-type")).indexOf(type) !== -1;
          var show = matchesQuery && matchesYear && matchesType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  function createPlayback(video, streamUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return hls;
    }
    video.src = streamUrl;
    return null;
  }

  window.initPlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var started = false;
    var playback = null;

    function begin() {
      if (!video || !streamUrl) {
        return;
      }
      if (!started) {
        playback = createPlayback(video, streamUrl);
        started = true;
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }
    shell.addEventListener("click", function (event) {
      if (event.target === video && video.paused) {
        begin();
      }
    });
    window.addEventListener("pagehide", function () {
      if (playback && typeof playback.destroy === "function") {
        playback.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
