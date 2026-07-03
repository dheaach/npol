(function () {
  'use strict';

  function formatMoney(cents, format) {
    if (typeof cents !== 'number') return '';
    var value = (cents / 100).toFixed(2);
    if (!format) return '$' + value;
    return format.replace(/\{\{\s*amount\s*\}\}/, value).replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100));
  }

  function getMoneyFormat() {
    if (window.Shopify && window.Shopify.formatMoney) {
      return function (cents) {
        return window.Shopify.formatMoney(cents, window.theme && window.theme.moneyFormat);
      };
    }
    return function (cents) {
      return formatMoney(cents);
    };
  }

  function MainProduct(section) {
    this.section = section;
    this.sectionId = section.dataset.sectionId;
    this.productJsonEl = document.getElementById('ProductJson-' + this.sectionId);
    this.form = section.querySelector('[data-product-form]');
    if (!this.productJsonEl || !this.form) return;

    this.product = JSON.parse(this.productJsonEl.textContent);
    this.variantSelect = this.form.querySelector('[data-product-variant-select]');
    this.optionSelectors = this.form.querySelectorAll('[data-product-option]');
    this.priceEl = section.querySelector('[data-product-price]');
    this.priceRegular = section.querySelector('[data-product-price-regular]');
    this.priceCompare = section.querySelector('[data-product-price-compare]');
    this.addButton = this.form.querySelector('[data-add-to-cart]');
    this.addButtonText = this.form.querySelector('[data-add-to-cart-text]');
    this.loader = this.form.querySelector('[data-product-loader]');
    this.errorWrapper = this.form.querySelector('[data-product-error]');
    this.statusEl = section.querySelector('[data-product-status]');
    this.pickupContainer = section.querySelector('[data-store-availability]');
    this.mediaItems = section.querySelectorAll('[data-product-media-item]');
    this.thumbnails = section.querySelectorAll('[data-product-thumbnail]');
    this.zoomEnabled = section.dataset.enableImageZoom === 'true';
    this.historyEnabled = section.dataset.enableHistoryState === 'true';
    this.money = getMoneyFormat();
    this.soldOutText = section.dataset.soldOutText || 'Sold Out';
    this.addToCartText = section.dataset.addToCartText || 'Add to Cart';

    this.bindEvents();
    this.onVariantChange();
  }

  MainProduct.prototype.getSelectedOptions = function () {
    var options = [];
    this.optionSelectors.forEach(function (select) {
      options.push(select.value);
    });
    return options;
  };

  MainProduct.prototype.getVariantFromOptions = function () {
    var options = this.getSelectedOptions();
    if (!options.length) return this.product.variants[0];

    return this.product.variants.find(function (variant) {
      return variant.options.every(function (option, index) {
        return option === options[index];
      });
    });
  };

  MainProduct.prototype.getVariantById = function (id) {
    return this.product.variants.find(function (variant) {
      return variant.id === id;
    });
  };

  MainProduct.prototype.setActiveMedia = function (mediaId) {
    if (!this.mediaItems.length) return;

    var targetId = mediaId ? String(mediaId) : null;
    var matched = false;

    this.mediaItems.forEach(function (item) {
      var isActive = targetId ? item.dataset.mediaId === targetId : !item.classList.contains('visually-hidden');
      if (targetId && item.dataset.mediaId === targetId) {
        matched = true;
      }
      item.classList.toggle('visually-hidden', targetId ? item.dataset.mediaId !== targetId : !isActive);
    });

    if (targetId && !matched && this.mediaItems[0]) {
      this.mediaItems.forEach(function (item, index) {
        item.classList.toggle('visually-hidden', index !== 0);
      });
    }

    var activeId = targetId || (this.mediaItems[0] && this.mediaItems[0].dataset.mediaId);
    this.thumbnails.forEach(function (thumb) {
      thumb.classList.toggle('is-active', thumb.dataset.thumbnailId === activeId);
    });
  };

  MainProduct.prototype.updatePickupAvailability = function (variant) {
    if (!this.pickupContainer || !variant) return;

    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    fetch(root + 'variants/' + variant.id + '/?section_id=pickup-availability')
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var content = parsed.querySelector('.pickup-availability');
        this.pickupContainer.innerHTML = content ? content.innerHTML : '';
      }.bind(this))
      .catch(function () {
        this.pickupContainer.innerHTML = '';
      }.bind(this));
  };

  MainProduct.prototype.updateVariant = function (variant) {
    if (!variant) return;

    if (this.variantSelect) {
      this.variantSelect.value = String(variant.id);
    }

    if (this.priceRegular) {
      this.priceRegular.textContent = this.money(variant.price);
    }

    if (this.priceCompare) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        this.priceCompare.textContent = this.money(variant.compare_at_price);
        this.priceCompare.style.display = '';
      } else {
        this.priceCompare.style.display = 'none';
      }
    }

    if (this.addButton) {
      if (variant.available) {
        this.addButton.removeAttribute('disabled');
        this.addButton.removeAttribute('aria-disabled');
      } else {
        this.addButton.setAttribute('disabled', 'disabled');
        this.addButton.setAttribute('aria-disabled', 'true');
      }
    }

    if (this.addButtonText) {
      this.addButtonText.textContent = variant.available ? this.addToCartText : this.soldOutText;
    }

    if (variant.featured_media) {
      this.setActiveMedia(variant.featured_media.id);
    }

    if (this.statusEl) {
      this.statusEl.textContent = this.addButtonText ? this.addButtonText.textContent + ' — ' + this.money(variant.price) : '';
    }

    if (this.historyEnabled && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }

    this.updatePickupAvailability(variant);
  };

  MainProduct.prototype.onVariantChange = function () {
    var variant;

    if (this.optionSelectors.length) {
      variant = this.getVariantFromOptions();
    } else if (this.variantSelect) {
      variant = this.getVariantById(parseInt(this.variantSelect.value, 10));
    } else {
      variant = this.product.variants[0];
    }

    this.updateVariant(variant);
  };

  MainProduct.prototype.showError = function (message) {
    if (!this.errorWrapper) return;
    var messageEl = this.errorWrapper.querySelector('[data-product-error-message]');
    if (messageEl) messageEl.textContent = message;
    this.errorWrapper.classList.remove('visually-hidden');
  };

  MainProduct.prototype.hideError = function () {
    if (!this.errorWrapper) return;
    this.errorWrapper.classList.add('visually-hidden');
  };

  MainProduct.prototype.setLoading = function (isLoading) {
    if (!this.addButton || !this.loader) return;
    this.addButton.disabled = isLoading;
    this.loader.classList.toggle('visually-hidden', !isLoading);
    if (this.addButtonText) {
      this.addButtonText.classList.toggle('visually-hidden', isLoading);
    }
  };

  MainProduct.prototype.bindEvents = function () {
    var self = this;

    this.optionSelectors.forEach(function (select) {
      select.addEventListener('change', function () {
        self.hideError();
        self.onVariantChange();
      });
    });

    if (this.variantSelect && !this.optionSelectors.length) {
      this.variantSelect.addEventListener('change', function () {
        self.hideError();
        self.onVariantChange();
      });
    }

    this.thumbnails.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        self.setActiveMedia(thumb.dataset.thumbnailId);
      });
    });

    if (this.zoomEnabled) {
      this.section.querySelectorAll('[data-product-zoom]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          var overlay = self.section.querySelector('[data-product-zoom-overlay]');
          var image = trigger.querySelector('img') || trigger;
          if (!overlay || !image.src) return;
          var zoomImage = overlay.querySelector('[data-product-zoom-image]');
          if (zoomImage) {
            zoomImage.src = image.currentSrc || image.src;
            zoomImage.alt = image.alt || '';
          }
          overlay.classList.remove('visually-hidden');
        });
      });

      var overlay = this.section.querySelector('[data-product-zoom-overlay]');
      if (overlay) {
        overlay.addEventListener('click', function () {
          overlay.classList.add('visually-hidden');
        });
      }
    }

    this.form.addEventListener('submit', function (event) {
      var quantityInput = self.form.querySelector('[data-quantity-input]');
      if (quantityInput && parseInt(quantityInput.value, 10) < 1) {
        event.preventDefault();
        self.showError(quantityInput.dataset.minimumMessage || 'Quantity must be 1 or more');
        return;
      }

      self.hideError();
      self.setLoading(true);
    });
  };

  document.querySelectorAll('[data-main-product]').forEach(function (section) {
    new MainProduct(section);
  });
})();
