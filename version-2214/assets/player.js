(function () {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-play-overlay]');
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (attached || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  }

  function playVideo() {
    attachSource();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
