(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /* --- Mobile menu --- */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  var navWrapper = nav ? nav.closest('.site-header__nav-wrapper') : null;

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      if (navWrapper) navWrapper.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('is-open');
        if (navWrapper) navWrapper.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

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
          iframe.style.width = '100%';
          iframe.style.aspectRatio = '16/9';
          iframe.style.border = 'none';
          iframe.style.borderRadius = '12px';
        }
      }
    });
  });

  /* --- Testimonials slider --- */
  document.querySelectorAll('[data-testimonials-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-testimonials-track]');
    var slides = slider.querySelectorAll('[data-testimonial-slide]');
    var prevBtn = slider.querySelector('[data-testimonials-prev]');
    var nextBtn = slider.querySelector('[data-testimonials-next]');
    var dotsContainer = slider.querySelector('[data-testimonials-dots]');
    var current = 0;
    var visibleCount = 3;

    function getVisibleCount() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return Math.min(3, slides.length);
    }

    function updateSlider() {
      visibleCount = getVisibleCount();
      var slideWidth = 100 / visibleCount;
      slides.forEach(function (slide) {
        slide.style.flex = '0 0 ' + slideWidth + '%';
      });
      var maxIndex = Math.max(0, slides.length - visibleCount);
      if (current > maxIndex) current = maxIndex;
      track.style.transform = 'translateX(-' + (current * slideWidth) + '%)';
      updateDots();
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      var maxIndex = Math.max(0, slides.length - visibleCount);
      for (var i = 0; i <= maxIndex; i++) {
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
        var maxIndex = Math.max(0, slides.length - visibleCount);
        current = Math.min(maxIndex, current + 1);
        updateSlider();
      });
    }

    if (slides.length) {
      updateSlider();
      window.addEventListener('resize', updateSlider);
    }
  });
})();
