(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    var yearInput = filterRoot.querySelector('[data-filter-year]');
    var typeInput = filterRoot.querySelector('[data-filter-type]');
    var categoryInput = filterRoot.querySelector('[data-filter-category]');
    var countBox = filterRoot.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.catalog-item'));

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      var keyword = valueOf(keywordInput);
      var year = valueOf(yearInput);
      var type = valueOf(typeInput);
      var category = valueOf(categoryInput);
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-keywords') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [keywordInput, yearInput, typeInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var video = document.querySelector('[data-stream]');
  var playButton = document.querySelector('[data-play-button]');

  if (video) {
    var streamUrl = video.getAttribute('data-stream');
    var playerReady = false;
    var hlsPlayer = null;

    function attachVideo() {
      if (playerReady || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      playerReady = true;
    }

    function playVideo() {
      attachVideo();
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }

      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  }
})();
