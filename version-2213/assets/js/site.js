(function () {
  var menuButton = document.querySelector('[data-menu]');
  var nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  var input = document.querySelector('[data-filter-input]');
  var year = document.querySelector('[data-filter-year]');
  var type = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = input ? input.value.trim().toLowerCase() : '';
    var yearValue = year ? year.value : '';
    var typeValue = type ? type.value : '';

    cards.forEach(function (card) {
      var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
      var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
      card.classList.toggle('hidden-card', !(matchesKeyword && matchesYear && matchesType));
    });
  }

  if (input || year || type) {
    var q = getQueryParam('q');
    if (q && input) {
      input.value = q;
    }
    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }
})();
