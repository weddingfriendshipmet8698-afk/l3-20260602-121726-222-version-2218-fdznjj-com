(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  filterForms.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-no-results]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var ok = true;

        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }
        if (typeValue && cardType !== typeValue) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
