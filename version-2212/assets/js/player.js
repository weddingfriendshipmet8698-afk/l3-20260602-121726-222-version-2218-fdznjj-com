(function() {
    var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    function setMessage(block, message) {
        var messageNode = block.querySelector('.player-message');

        if (messageNode) {
            messageNode.textContent = message || '';
        }
    }

    function prepareVideo(block, video) {
        if (!video || video.getAttribute('data-ready') === 'yes') {
            return;
        }

        var source = video.querySelector('source');
        var streamUrl = source ? source.getAttribute('src') : '';

        if (!streamUrl) {
            setMessage(block, '播放加载失败，请稍后再试');
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.setAttribute('data-ready', 'yes');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.setAttribute('data-ready', 'yes');
            return;
        }

        setMessage(block, '播放加载失败，请稍后再试');
    }

    playerBlocks.forEach(function(block) {
        var video = block.querySelector('video');
        var button = block.querySelector('.player-start');

        function startPlayback() {
            prepareVideo(block, video);

            if (!video) {
                return;
            }

            block.classList.add('is-playing');

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {
                    block.classList.remove('is-playing');
                    setMessage(block, '点击视频区域继续播放');
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    startPlayback();
                }
            });

            video.addEventListener('play', function() {
                block.classList.add('is-playing');
                setMessage(block, '');
            });
        }
    });
})();
