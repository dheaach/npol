(function () {
  'use strict';

  var debounceTimers = {};

  function debounce(key, fn, delay) {
    clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(fn, delay);
  }

  function getCartRoot(target) {
    return target.closest('[data-section-type="main-cart"]');
  }

  function isAjaxEnabled(root) {
    return root && root.dataset.ajaxEnabled === 'true';
  }

  function getSectionId(root) {
    return root ? root.dataset.sectionId : '';
  }

  function showCartError(root, message) {
    var wrapper = root.querySelector('[data-cart-error-message-wrapper]');
    var text = root.querySelector('[data-cart-error-message]');
    if (!wrapper || !text) return;
    text.textContent = message;
    wrapper.classList.remove('hide');
  }

  function hideCartError(root) {
    var wrapper = root.querySelector('[data-cart-error-message-wrapper]');
    if (wrapper) wrapper.classList.add('hide');
  }

  function showQtyError(row, message) {
    if (!row) return;
    row.querySelectorAll('[data-cart-quantity-error-message-wrapper]').forEach(function (wrapper) {
      var text = wrapper.querySelector('[data-cart-quantity-error-message]');
      if (text) text.textContent = message;
      wrapper.classList.remove('hide');
    });
  }

  function hideQtyErrors(row) {
    if (!row) return;
    row.querySelectorAll('[data-cart-quantity-error-message-wrapper]').forEach(function (wrapper) {
      wrapper.classList.add('hide');
    });
  }

  function setCartStatus(root, message) {
    var status = root.querySelector('[data-cart-status]');
    if (status) status.textContent = message;
  }

  function replaceCartSection(sectionId, html) {
    var sectionEl = document.getElementById('shopify-section-' + sectionId);
    if (!sectionEl) return;

    var parsed = new DOMParser().parseFromString(html, 'text/html');
    var newSection = parsed.getElementById('shopify-section-' + sectionId);
    sectionEl.innerHTML = newSection ? newSection.innerHTML : html;
  }

  function refreshCartSection(root) {
    var sectionId = getSectionId(root);
    if (!sectionId) return Promise.resolve();

    var params = new URLSearchParams();
    params.set('sections', sectionId);

    return fetch(window.location.pathname + '?' + params.toString())
      .then(function (response) {
        if (!response.ok) throw new Error('Section fetch failed');
        return response.json();
      })
      .then(function (data) {
        if (data[sectionId]) {
          replaceCartSection(sectionId, data[sectionId]);
        }
      });
  }

  function getRoutesRoot() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  function changeLine(root, line, quantity) {
    hideCartError(root);
    return fetch(getRoutesRoot() + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw data;
          return data;
        });
      })
      .then(function () {
        return refreshCartSection(root);
      });
  }

  function updateNote(root, note) {
    hideCartError(root);
    return fetch(getRoutesRoot() + 'cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note })
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw data;
          return data;
        });
      });
  }

  function syncQuantityInputs(row, value) {
    if (!row) return;
    row.querySelectorAll('[data-quantity-input]').forEach(function (input) {
      input.value = value;
    });
  }

  document.addEventListener('change', function (event) {
    var input = event.target;
    if (!input.matches('[data-section-type="main-cart"] [data-quantity-input]')) return;

    var root = getCartRoot(input);
    if (!isAjaxEnabled(root)) return;

    var row = input.closest('[data-cart-item]');
    var line = parseInt(input.dataset.quantityItem, 10);
    var quantity = parseInt(input.value, 10);

    if (isNaN(quantity) || quantity < 0) {
      showQtyError(row, input.dataset.quantityErrorMessage || 'Invalid quantity');
      return;
    }

    hideQtyErrors(row);
    syncQuantityInputs(row, quantity);

    debounce('qty-' + line, function () {
      changeLine(root, line, quantity).catch(function (error) {
        var message = (error && error.description) || (error && error.message) || 'Could not update cart.';
        showQtyError(row, message);
        showCartError(root, message);
      });
    }, 300);
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-section-type="main-cart"] [data-cart-remove]');
    if (!link) return;

    var root = getCartRoot(link);
    if (!isAjaxEnabled(root)) return;

    event.preventDefault();

    var row = link.closest('[data-cart-item]');
    var line = row ? parseInt(row.dataset.cartItemIndex, 10) : NaN;
    if (isNaN(line)) return;

    changeLine(root, line, 0)
      .then(function () {
        setCartStatus(root, link.dataset.removedMessage || 'Item removed');
      })
      .catch(function (error) {
        var message = (error && error.description) || (error && error.message) || 'Could not remove item.';
        showCartError(root, message);
      });
  });

  document.addEventListener(
    'input',
    function (event) {
      var textarea = event.target;
      if (!textarea.matches('[data-section-type="main-cart"] [data-cart-notes]')) return;

      var root = getCartRoot(textarea);
      if (!isAjaxEnabled(root)) return;

      debounce('cart-note', function () {
        updateNote(root, textarea.value).catch(function (error) {
          var message = (error && error.description) || (error && error.message) || 'Could not save note.';
          showCartError(root, message);
        });
      }, 500);
    },
    true
  );
})();
