(function () {
  'use strict';

  var DEBOUNCE_MS = 300;
  var MIN_CHARS = 2;

  function debounce(fn, wait) {
    var timer;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  document.querySelectorAll('[data-predictive-search]').forEach(function (container) {
    var form = container.querySelector('[data-predictive-search-form]');
    var input = container.querySelector('[data-predictive-search-input]');
    var results = container.querySelector('[data-predictive-search-results]');
    if (!form || !input || !results) return;

    var predictiveUrl = container.dataset.predictiveSearchUrl;
    if (!predictiveUrl) return;

    var abortController = null;
    var activeIndex = -1;

    function setExpanded(isOpen) {
      input.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      results.hidden = !isOpen;
      container.classList.toggle('is-open', isOpen);
    }

    function closeResults() {
      activeIndex = -1;
      setExpanded(false);
      clearActiveOption();
    }

    function openResults() {
      if (!results.innerHTML.trim()) return;
      setExpanded(true);
    }

    function clearActiveOption() {
      results.querySelectorAll('.predictive-search__item.is-active').forEach(function (item) {
        item.classList.remove('is-active');
      });
    }

    function getOptions() {
      return Array.prototype.slice.call(results.querySelectorAll('.predictive-search__item'));
    }

    function setActiveOption(index) {
      var options = getOptions();
      if (!options.length) return;

      clearActiveOption();
      if (index < 0) index = options.length - 1;
      if (index >= options.length) index = 0;

      activeIndex = index;
      options[activeIndex].classList.add('is-active');
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function fetchResults() {
      var query = input.value.trim();

      if (query.length < MIN_CHARS) {
        results.innerHTML = '';
        closeResults();
        return;
      }

      if (abortController) abortController.abort();
      abortController = new AbortController();

      container.classList.add('is-loading');

      var params = new URLSearchParams();
      params.set('q', query);
      params.set('resources[type]', 'product,collection,page,article');
      params.set('resources[limit]', '6');
      params.set('resources[limit_scope]', 'each');
      params.set('section_id', 'predictive-search');

      fetch(predictiveUrl + '?' + params.toString(), { signal: abortController.signal })
        .then(function (response) {
          if (!response.ok) throw new Error('Predictive search failed');
          return response.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var section = doc.querySelector('#shopify-section-predictive-search');
          results.innerHTML = section ? section.innerHTML : '';
          activeIndex = -1;
          openResults();
        })
        .catch(function (error) {
          if (error.name === 'AbortError') return;
          results.innerHTML = '';
          closeResults();
        })
        .finally(function () {
          container.classList.remove('is-loading');
        });
    }

    var debouncedFetch = debounce(fetchResults, DEBOUNCE_MS);

    input.addEventListener('input', debouncedFetch);

    input.addEventListener('focus', function () {
      if (input.value.trim().length >= MIN_CHARS && results.innerHTML.trim()) {
        openResults();
      }
    });

    input.addEventListener('keydown', function (e) {
      var options = getOptions();

      if (e.key === 'Escape') {
        closeResults();
        return;
      }

      if (!options.length || results.hidden) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveOption(activeIndex + 1);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveOption(activeIndex - 1);
        return;
      }

      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        var link = options[activeIndex].querySelector('a');
        if (link) window.location.href = link.href;
      }
    });

    form.addEventListener('submit', function () {
      closeResults();
    });

    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) closeResults();
    });
  });
})();
