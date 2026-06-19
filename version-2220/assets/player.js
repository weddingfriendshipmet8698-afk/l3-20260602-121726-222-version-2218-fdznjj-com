(function () {
  var video = document.getElementById("movie-player");
  var overlay = document.querySelector(".player-overlay");

  if (!video || !overlay) {
    return;
  }

  var source = video.getAttribute("data-stream");
  var hls = null;

  function bind() {
    if (!source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", source);
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      }
      return;
    }

    if (!video.getAttribute("src")) {
      video.setAttribute("src", source);
    }
  }

  function start() {
    bind();
    overlay.classList.add("is-hidden");

    var playTask = video.play();

    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
})();
