(function () {
  var Hls = window.Hls;
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play]');
    var src = video ? video.getAttribute('data-src') : '';
    var loaded = false;
    var hls = null;

    function load() {
      if (!video || !src || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        box.classList.add('player-error');
      }
    }

    function play() {
      load();
      box.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
