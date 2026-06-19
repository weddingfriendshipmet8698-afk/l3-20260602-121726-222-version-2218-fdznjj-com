(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  document.querySelectorAll("[data-filter-root]").forEach(function (root) {
    var input = root.querySelector("[data-search-input]");
    var list = document.querySelector("[data-card-list]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
    var ranks = Array.prototype.slice.call(document.querySelectorAll(".rank-list.wide .rank-item"));
    var activeYear = "";
    var activeRegion = "";

    function valueOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-channel"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var matched = true;

        if (query && valueOf(card).indexOf(query) === -1) {
          matched = false;
        }

        if (activeYear && card.getAttribute("data-year") !== activeYear) {
          matched = false;
        }

        if (activeRegion && card.getAttribute("data-region") !== activeRegion) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });

      ranks.forEach(function (item) {
        if (!query) {
          item.classList.remove("is-hidden");
          return;
        }

        item.classList.toggle("is-hidden", item.textContent.toLowerCase().indexOf(query) === -1);
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q) {
        input.value = q;
      }

      input.addEventListener("input", apply);
    }

    root.querySelectorAll("[data-filter-year]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = button.getAttribute("data-filter-year") || "";
        activeRegion = "";
        root.querySelectorAll(".filter-buttons button").forEach(function (btn) {
          btn.classList.remove("active");
        });
        button.classList.add("active");
        apply();
      });
    });

    root.querySelectorAll("[data-filter-region]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeRegion = button.getAttribute("data-filter-region") || "";
        activeYear = "";
        root.querySelectorAll(".filter-buttons button").forEach(function (btn) {
          btn.classList.remove("active");
        });
        button.classList.add("active");
        apply();
      });
    });

    root.querySelectorAll("[data-filter-all]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = "";
        activeRegion = "";
        root.querySelectorAll(".filter-buttons button").forEach(function (btn) {
          btn.classList.remove("active");
        });
        button.classList.add("active");
        apply();
      });
    });

    apply();
  });
})();
