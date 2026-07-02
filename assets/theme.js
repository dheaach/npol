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
  var headerBottom = document.querySelector('[data-header-bottom]');
  var mobileNavQuery = window.matchMedia('(max-width: 1023px)');

  function closeMainNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navWrapper) navWrapper.classList.remove('is-open');
    if (headerBottom) headerBottom.classList.remove('is-open');
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
      if (headerBottom) headerBottom.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (menuToggle.contains(e.target)) return;
      if (navWrapper && navWrapper.contains(e.target)) return;
      if (headerBottom && headerBottom.contains(e.target)) return;
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
      if (!template) return;

      var content = template.content.cloneNode(true);
      media.innerHTML = '';
      media.appendChild(content);

      var player = media.closest('.video-showcase__player');
      var radius = player
        ? getComputedStyle(player).getPropertyValue('--video-showcase-media-radius').trim()
        : '';

      var iframe = media.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.aspectRatio = '16/9';
        iframe.style.border = 'none';
        iframe.style.borderRadius = radius || '12px';
        return;
      }

      var video = media.querySelector('video');
      if (video) {
        video.style.width = '100%';
        video.style.aspectRatio = '16/9';
        video.style.border = 'none';
        video.style.borderRadius = radius || '12px';
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
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
      var slideWidth = slides[0].offsetWidth;
      var edgePadding = Math.max(0, sliderWidth / 2 - slideWidth / 2);
      track.style.paddingLeft = edgePadding + 'px';
      track.style.paddingRight = edgePadding + 'px';

      var slide = slides[current];
      var firstSlide = slides[0];
      var lastSlide = slides[slides.length - 1];
      var offset = slide.offsetLeft + slide.offsetWidth / 2 - sliderWidth / 2;
      var minOffset = firstSlide.offsetLeft + firstSlide.offsetWidth / 2 - sliderWidth / 2;
      var maxOffset = lastSlide.offsetLeft + lastSlide.offsetWidth / 2 - sliderWidth / 2;
      offset = Math.max(minOffset, Math.min(offset, maxOffset));
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

  /* --- Product showcase filter & sort (delegated — survives section re-render) --- */
  function productShowcaseReplaceSection(shopifySection, sectionId, html) {
    var parsed = new DOMParser().parseFromString(html, 'text/html');
    var newSection = parsed.getElementById('shopify-section-' + sectionId);
    shopifySection.innerHTML = newSection ? newSection.innerHTML : html;
  }

  function productShowcaseSyncForm(form, params) {
    if (!form) return;
    params.forEach(function (value, key) {
      var field = form.elements[key];
      if (field && field.tagName === 'SELECT') {
        field.value = value;
      }
    });
  }

  function productShowcaseFetch(form, paramOverride) {
    var sectionIdInput = form.querySelector('input[name="section_id"]');
    var sectionId = sectionIdInput ? sectionIdInput.value : '';
    var shopifySection = sectionId ? document.getElementById('shopify-section-' + sectionId) : null;
    var collectionUrl = form.dataset.collectionUrl || form.getAttribute('action') || window.location.pathname;
    var collectionPath = collectionUrl.split('?')[0];

    var params;
    if (paramOverride) {
      params = new URLSearchParams(paramOverride);
      params.delete('page');
    } else {
      var formData = new FormData(form);
      formData.delete('section_id');
      formData.delete('page');
      params = new URLSearchParams();
      formData.forEach(function (value, key) {
        if (value !== '') {
          params.append(key, value);
        }
      });
    }

    var displayUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');

    if (!sectionId || !shopifySection) {
      window.location.href = collectionPath + (params.toString() ? '?' + params.toString() : '');
      return;
    }

    var fetchParams = new URLSearchParams(params);
    fetchParams.set('sections', sectionId);

    fetch(collectionPath + '?' + fetchParams.toString())
      .then(function (response) {
        if (!response.ok) throw new Error('Section fetch failed');
        return response.json();
      })
      .then(function (data) {
        if (data[sectionId]) {
          productShowcaseReplaceSection(shopifySection, sectionId, data[sectionId]);
          productShowcaseSyncForm(
            shopifySection.querySelector('[data-product-showcase-form]'),
            params
          );
          window.history.replaceState({}, '', displayUrl + '#product-showcase-' + sectionId);
          return;
        }
        window.location.href = collectionPath + (params.toString() ? '?' + params.toString() : '');
      })
      .catch(function () {
        window.location.href = collectionPath + (params.toString() ? '?' + params.toString() : '');
      });
  }

  document.addEventListener('change', function (event) {
    var select = event.target;
    if (!select.matches || !select.matches('[data-product-showcase-form] select')) return;

    var form = select.closest('[data-product-showcase-form]');
    if (!form) return;

    productShowcaseFetch(form);
  });

  document.querySelectorAll('[data-product-showcase-form]').forEach(function (form) {
    var urlParams = new URLSearchParams(window.location.search);
    var hasFilterOrSort = urlParams.has('sort_by') || Array.from(urlParams.keys()).some(function (key) {
      return key.indexOf('filter.') === 0;
    });
    if (!hasFilterOrSort) return;

    productShowcaseFetch(form, urlParams);
  });

  /* --- Product catalog: /collections/{grade}/{tag+tag}?sort_by= --- */
  function productCatalogParsePath(pathname) {
    var match = pathname.match(/^\/collections\/([^/]+)(?:\/([^/]+))?\/?$/);
    if (!match) {
      return { gradeHandle: '', tagHandles: [] };
    }
    var tagSegment = match[2] || '';
    var tagHandles = tagSegment
      ? tagSegment.split('+').map(function (tag) {
          return decodeURIComponent(tag);
        })
      : [];
    return { gradeHandle: match[1], tagHandles: tagHandles };
  }

  function productCatalogSyncFormFromPath(form, pathname, searchParams) {
    if (!form) return;
    var parsed = productCatalogParsePath(pathname);
    var gradeSelect = form.querySelector('[data-catalog-grade]');
    if (gradeSelect) {
      if (parsed.gradeHandle) {
        gradeSelect.value = parsed.gradeHandle;
      } else {
        var hasAllOption = false;
        for (var g = 0; g < gradeSelect.options.length; g++) {
          if (gradeSelect.options[g].value === 'all') {
            gradeSelect.value = 'all';
            hasAllOption = true;
            break;
          }
        }
        if (!hasAllOption) {
          gradeSelect.value = '';
        }
      }
    }
    form.querySelectorAll('[data-catalog-filter]').forEach(function (select) {
      var matched = false;
      for (var i = 0; i < select.options.length; i++) {
        var option = select.options[i];
        if (option.value && parsed.tagHandles.indexOf(option.value) !== -1) {
          select.value = option.value;
          matched = true;
          break;
        }
      }
      if (!matched) {
        var hasEmptyOption = select.querySelector('option[value=""]');
        if (hasEmptyOption) {
          select.value = '';
        } else if (select.options.length > 0) {
          select.value = select.options[0].value;
        }
      }
    });
    var sortSelect = form.querySelector('[name="sort_by"]');
    if (sortSelect && searchParams.has('sort_by')) {
      sortSelect.value = searchParams.get('sort_by');
    }
  }

  function productCatalogBuildCollectionPath(form) {
    var gradeSelect = form.querySelector('[data-catalog-grade]');
    if (!gradeSelect || !gradeSelect.value) return '';

    var tagHandles = [];
    form.querySelectorAll('[data-catalog-filter]').forEach(function (select) {
      if (select.value) tagHandles.push(select.value);
    });

    if (gradeSelect.value === 'all') {
      var allOption = gradeSelect.options[gradeSelect.selectedIndex];
      if (allOption && allOption.dataset.collectionUrl) {
        var allPath = allOption.dataset.collectionUrl.split('?')[0];
        if (tagHandles.length > 0) {
          return allPath + '/' + tagHandles.join('+');
        }
        return allPath;
      }
      return window.location.pathname;
    }

    var path = '/collections/' + gradeSelect.value;
    if (tagHandles.length > 0) {
      path += '/' + tagHandles.join('+');
    }
    return path;
  }

  function productCatalogBuildSortParams(form) {
    var params = new URLSearchParams();
    var sortSelect = form.querySelector('[name="sort_by"]');
    if (sortSelect && sortSelect.value) {
      params.set('sort_by', sortSelect.value);
    }
    return params;
  }

  function productCatalogFetch(form, paramOverride, pathOverride) {
    var sectionIdInput = form.querySelector('input[name="section_id"]');
    var sectionId = sectionIdInput ? sectionIdInput.value : '';
    var shopifySection = sectionId ? document.getElementById('shopify-section-' + sectionId) : null;
    var collectionPath = pathOverride || productCatalogBuildCollectionPath(form);
    var sortParams = new URLSearchParams();

    if (paramOverride) {
      paramOverride.forEach(function (value, key) {
        sortParams.append(key, value);
      });
      sortParams.delete('section_id');
    } else {
      sortParams = productCatalogBuildSortParams(form);
    }

    if (!paramOverride) {
      sortParams.delete('page');
    }

    var displayUrl = collectionPath + (sortParams.toString() ? '?' + sortParams.toString() : '');

    if (!collectionPath) {
      if (!sectionId || !shopifySection) {
        window.location.href = window.location.pathname;
        return;
      }

      var pageParams = new URLSearchParams();
      pageParams.set('sections', sectionId);
      fetch(window.location.pathname + '?' + pageParams.toString())
        .then(function (response) {
          if (!response.ok) throw new Error('Section fetch failed');
          return response.json();
        })
        .then(function (data) {
          if (data[sectionId]) {
            productShowcaseReplaceSection(shopifySection, sectionId, data[sectionId]);
            productCatalogSyncFormFromPath(
              shopifySection.querySelector('[data-product-catalog-form]'),
              window.location.pathname,
              new URLSearchParams()
            );
            window.history.replaceState({}, '', window.location.pathname + '#product-catalog-' + sectionId);
            return;
          }
          window.location.href = window.location.pathname;
        })
        .catch(function () {
          window.location.href = window.location.pathname;
        });
      return;
    }

    if (!sectionId || !shopifySection) {
      window.location.href = displayUrl;
      return;
    }

    var fetchParams = new URLSearchParams(sortParams);
    fetchParams.set('sections', sectionId);

    fetch(collectionPath + '?' + fetchParams.toString())
      .then(function (response) {
        if (!response.ok) throw new Error('Section fetch failed');
        return response.json();
      })
      .then(function (data) {
        if (data[sectionId]) {
          productShowcaseReplaceSection(shopifySection, sectionId, data[sectionId]);
          productCatalogSyncFormFromPath(
            shopifySection.querySelector('[data-product-catalog-form]'),
            collectionPath,
            sortParams
          );
          window.history.replaceState({}, '', displayUrl + '#product-catalog-' + sectionId);
          return;
        }
        window.location.assign(displayUrl);
      })
      .catch(function () {
        window.location.assign(displayUrl);
      });
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-product-catalog] .product-catalog__pagination-link[href]');
    if (!link) return;

    var catalogRoot = link.closest('[data-product-catalog]');
    var shopifySection = catalogRoot ? catalogRoot.closest('[id^="shopify-section-"]') : null;
    var form = catalogRoot ? catalogRoot.querySelector('[data-product-catalog-form]') : null;
    if (!form || !shopifySection) return;

    event.preventDefault();
    var linkUrl = new URL(link.href, window.location.origin);
    productCatalogFetch(form, new URLSearchParams(linkUrl.search), linkUrl.pathname);
  });

  document.addEventListener('change', function (event) {
    var select = event.target;
    if (!select.matches || !select.matches('[data-product-catalog-form] select')) return;

    var form = select.closest('[data-product-catalog-form]');
    if (!form) return;

    if (select.matches('[data-catalog-grade]')) {
      form.querySelectorAll('[data-catalog-filter]').forEach(function (filterSelect) {
        filterSelect.value = '';
      });
    }

    productCatalogFetch(form);
  });

  document.querySelectorAll('[data-product-catalog-form]').forEach(function (form) {
    var urlParams = new URLSearchParams(window.location.search);
    productCatalogSyncFormFromPath(
      form,
      window.location.pathname,
      urlParams
    );
    if (urlParams.has('page') || urlParams.has('sort_by')) {
      productCatalogFetch(form, urlParams, window.location.pathname);
    }
  });
})();
