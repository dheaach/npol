(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /* --- Footer scroll to top --- */
  document.querySelectorAll('[data-scroll-to-top]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* --- Header menu (tablet + mobile) --- */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  var navWrapper = nav ? nav.closest('.site-header__nav-wrapper') : null;
  var mobileNavQuery = window.matchMedia('(max-width: 1023px)');

  function closeMainNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navWrapper) navWrapper.classList.remove('is-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.site-header__nav-item--has-children.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var toggle = item.querySelector('[data-subnav-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = nav.classList.toggle('is-open');
      if (navWrapper) navWrapper.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (menuToggle.contains(e.target)) return;
      if (navWrapper && navWrapper.contains(e.target)) return;
      closeMainNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMainNav();
    });

    nav.addEventListener('click', function (e) {
      if (!mobileNavQuery.matches) return;
      if (e.target.closest('[data-subnav-toggle]')) return;
      if (e.target.closest('.site-header__nav-link')) closeMainNav();
    });
  }

  document.querySelectorAll('[data-subnav-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (!mobileNavQuery.matches) return;
      e.preventDefault();
      e.stopPropagation();
      var item = btn.closest('.site-header__nav-item--has-children');
      if (!item) return;
      var isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
    });
  });

  /* --- Video deferred media --- */
  document.querySelectorAll('.video-showcase__poster').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var media = btn.closest('.video-showcase__media') || btn.closest('.video-showcase__player');
      if (!media) return;

      var template = media.querySelector('template');
      if (template) {
        var content = template.content.cloneNode(true);
        media.innerHTML = '';
        media.appendChild(content);
        var iframe = media.querySelector('iframe');
        if (iframe) {
          var player = media.closest('.video-showcase__player');
          var radius = player
            ? getComputedStyle(player).getPropertyValue('--video-showcase-media-radius').trim()
            : '';
          iframe.style.width = '100%';
          iframe.style.aspectRatio = '16/9';
          iframe.style.border = 'none';
          iframe.style.borderRadius = radius || '12px';
        }
      }
    });
  });

  /* --- Testimonials slider (1 centered slide, adjacent halves visible) --- */
  document.querySelectorAll('[data-testimonials-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-testimonials-track]');
    var slides = slider.querySelectorAll('[data-testimonial-slide]');
    var prevBtn = slider.querySelector('[data-testimonials-prev]');
    var nextBtn = slider.querySelector('[data-testimonials-next]');
    var dotsContainer = slider.querySelector('[data-testimonials-dots]');
    var current = 0;

    function updateSlider() {
      if (!track || !slides.length) return;
      var sliderWidth = slider.clientWidth;
      var slide = slides[current];
      var offset = slide.offsetLeft + slide.offsetWidth / 2 - sliderWidth / 2;
      var maxOffset = Math.max(0, track.scrollWidth - sliderWidth);
      offset = Math.max(0, Math.min(offset, maxOffset));
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (var i = 0; i < slides.length; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'testimonials__dot' + (i === current ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          current = parseInt(this.dataset.index, 10);
          updateSlider();
        });
        dotsContainer.appendChild(dot);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        current = Math.max(0, current - 1);
        updateSlider();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        current = Math.min(slides.length - 1, current + 1);
        updateSlider();
      });
    }

    if (slides.length) {
      updateSlider();
      window.addEventListener('resize', updateSlider);
    }
  });
})();
