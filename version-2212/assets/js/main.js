(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
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

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
            });
        });

        window.setInterval(function() {
            showSlide(current + 1);
        }, 5600);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function cardMatchesSearch(card, query) {
        if (!query) {
            return true;
        }

        var content = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.textContent
        ].join(' ').toLowerCase();

        return content.indexOf(query) !== -1;
    }

    function cardMatchesSelects(card) {
        return filterSelects.every(function(select) {
            var value = normalize(select.value);
            var key = select.getAttribute('data-filter-key');

            if (!value || !key) {
                return true;
            }

            return normalize(card.getAttribute('data-' + key)) === value;
        });
    }

    function applyFilters() {
        var query = normalize(searchInputs.map(function(input) {
            return input.value;
        }).join(' '));

        cards.forEach(function(card) {
            var visible = cardMatchesSearch(card, query) && cardMatchesSelects(card);
            card.classList.toggle('is-hidden-card', !visible);
        });
    }

    searchInputs.forEach(function(input) {
        input.addEventListener('input', applyFilters);
    });

    filterSelects.forEach(function(select) {
        select.addEventListener('change', applyFilters);
    });

    Array.prototype.slice.call(document.querySelectorAll('.cover-image')).forEach(function(image) {
        image.addEventListener('error', function() {
            image.classList.add('is-hidden');
        });
    });
})();
