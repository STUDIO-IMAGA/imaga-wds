'use strict';

/**
 * Accordion block functionality
 *
 * @author Shannon MacMillan, Corey Collins
 */
window.accordionBlockToggle = {};
(function (window, $, app) {

	// Constructor
	app.init = function () {
		app.cache();

		// If we're in an ACF edit page.
		if (window.acf) {
			window.acf.addAction('render_block_preview', app.bindEvents);
		}

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things
	app.cache = function () {
		app.$c = {
			window: $(window),
			html: $('html'),
			accordion: $('.accordion'),
			items: $('.accordion-item'),
			headers: $('.accordion-item-header'),
			contents: $('.accordion-item-content'),
			button: $('.accordion-item-toggle'),
			anchorID: $(window.location.hash)
		};
	};

	// Combine all events
	app.bindEvents = function () {
		$('.accordion-item-header').on('click', app.toggleAccordion);
		$('.accordion-item-toggle').on('click', app.toggleAccordion);
		app.$c.window.on('load', app.openHashAccordion);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.accordion.length;
	};

	app.toggleAccordion = function () {

		// Add the open class to the item.
		$(this).parents('.accordion-item').toggleClass('open');

		// Is this one expanded?
		var isExpanded = $(this).parents('.accordion-item').hasClass('open');

		// Set this button's aria-expanded value.
		$(this).parents('.accordion-item').find('.accordion-item-toggle').attr('aria-expanded', isExpanded ? 'true' : 'false');

		// Set all other items in this block to aria-hidden=true.
		$(this).parents('.accordion-block').find('.accordion-item-content').not($(this).parents('.accordion-item')).attr('aria-hidden', 'true');

		// Set this item to aria-hidden=false.
		$(this).parents('.accordion-item').find('.accordion-item-content').attr('aria-hidden', isExpanded ? 'false' : 'true');

		// Hide the other panels.
		$(this).parents('.accordion-block').find('.accordion-item').not($(this).parents('.accordion-item')).removeClass('open');
		$(this).parents('.accordion-block').find('.accordion-item-toggle').not($(this)).attr('aria-expanded', 'false');

		return false;
	};

	app.openHashAccordion = function () {

		if (!app.$c.anchorID.selector) {
			return;
		}

		// Trigger a click on the button closest to this accordion.
		app.$c.anchorID.parents('.accordion-item').find('.accordion-item-toggle').trigger('click');

		// Not setting a cached variable as it doesn't seem to grab the height properly.
		var adminBarHeight = $('#wpadminbar').length ? $('#wpadminbar').height() : 0;

		// Animate to the div for a nicer experience.
		app.$c.html.animate({
			scrollTop: app.$c.anchorID.offset().top - adminBarHeight
		}, 'slow');
	};

	// Engage
	app.init();
})(window, jQuery, window.accordionBlockToggle);
'use strict';

/**
 * File carousel.js
 *
 * Deal with the Slick carousel.
 */
window.wdsCarousel = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		// If we're in an ACF edit page.
		if (window.acf) {
			app.doSlick();
		}

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			window: $(window),
			theCarousel: $('.carousel-block')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.doSlick);
		app.$c.window.on('load', app.doFirstAnimation);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.theCarousel.length;
	};

	// Animate the first slide on window load.
	app.doFirstAnimation = function () {

		// Get the first slide content area and animation attribute.
		var firstSlide = app.$c.theCarousel.find('[data-slick-index=0]'),
			firstSlideContent = firstSlide.find('.slide-content'),
			firstAnimation = firstSlideContent.attr('data-animation');

		// Add the animation class to the first slide.
		firstSlideContent.addClass(firstAnimation);
	};

	// Allow background videos to autoplay.
	app.playBackgroundVideos = function () {

		// Get all the videos in our slides object.
		$('video').each(function () {

			// Let them autoplay. TODO: Possibly change this later to only play the visible slide video.
			this.play();
		});
	};

	// Initialize our carousel.
	app.initializeCarousel = function () {

		$('.carousel-block').not('.slick-initialized').slick({
			autoplay: true,
			autoplaySpeed: 5000,
			arrows: true,
			dots: true,
			focusOnSelect: true,
			waitForAnimate: true
		});
	};

	// Kick off Slick.
	app.doSlick = function () {

		// Render on the frontend.
		$(document).ready(function () {
			app.playBackgroundVideos;
			app.initializeCarousel();
		});

		// Render on the backend.
		if (window.acf) {
			window.acf.addAction('render_block_preview', app.initializeCarousel);
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsCarousel);
'use strict';

/**
 * Show/Hide the Search Form in the header.
 *
 * @author Corey Collins
 */
window.ShowHideSearchForm = {};
(function (window, $, app) {

	// Constructor
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things
	app.cache = function () {
		app.$c = {
			window: $(window),
			body: $('body'),
			headerSearchToggle: $('.site-header-action .cta-button'),
			headerSearchForm: $('.site-header-action .form-container')
		};
	};

	// Combine all events
	app.bindEvents = function () {
		app.$c.headerSearchToggle.on('keyup click', app.showHideSearchForm);
		app.$c.body.on('keyup touchstart click', app.hideSearchForm);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.headerSearchToggle.length;
	};

	// Checks to see if the menu has been opened.
	app.searchIsOpen = function () {

		if (app.$c.body.hasClass('search-form-visible')) {
			return true;
		}

		return false;
	};

	// Adds the toggle class for the search form.
	app.showHideSearchForm = function () {
		app.$c.body.toggleClass('search-form-visible');

		app.toggleSearchFormAriaLabel();
		app.toggleSearchToggleAriaLabel();

		return false;
	};

	// Hides the search form if we click outside of its container.
	app.hideSearchForm = function (event) {

		if (!$(event.target).parents('div').hasClass('site-header-action')) {
			app.$c.body.removeClass('search-form-visible');
			app.toggleSearchFormAriaLabel();
			app.toggleSearchToggleAriaLabel();
		}
	};

	// Toggles the aria-hidden label on the form container.
	app.toggleSearchFormAriaLabel = function () {
		app.$c.headerSearchForm.attr('aria-hidden', app.searchIsOpen() ? 'false' : 'true');
	};

	// Toggles the aria-hidden label on the toggle button.
	app.toggleSearchToggleAriaLabel = function () {
		app.$c.headerSearchToggle.attr('aria-expanded', app.searchIsOpen() ? 'true' : 'false');
	};

	// Engage
	$(app.init);
})(window, jQuery, window.ShowHideSearchForm);
'use strict';

/**
 * File js-enabled.js
 *
 * If Javascript is enabled, replace the <body> class "no-js".
 */
document.body.className = document.body.className.replace('no-js', 'js');
'use strict';

/**
 * File: mobile-menu.js
 *
 * Create an accordion style dropdown.
 */
window.wdsMobileMenu = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			body: $('body'),
			window: $(window),
			subMenuContainer: $('.mobile-menu .sub-menu, .utility-navigation .sub-menu'),
			subSubMenuContainer: $('.mobile-menu .sub-menu .sub-menu'),
			subMenuParentItem: $('.mobile-menu li.menu-item-has-children, .utility-navigation li.menu-item-has-children'),
			offCanvasContainer: $('.off-canvas-container')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.addDownArrow);
		app.$c.subMenuParentItem.on('click', app.toggleSubmenu);
		app.$c.subMenuParentItem.on('transitionend', app.resetSubMenu);
		app.$c.offCanvasContainer.on('transitionend', app.forceCloseSubmenus);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.subMenuContainer.length;
	};

	// Reset the submenus after it's done closing.
	app.resetSubMenu = function () {

		// When the list item is done transitioning in height,
		// remove the classes from the submenu so it is ready to toggle again.
		if ($(this).is('li.menu-item-has-children') && !$(this).hasClass('is-visible')) {
			$(this).find('ul.sub-menu').removeClass('slideOutLeft is-visible');
		}
	};

	// Slide out the submenu items.
	app.slideOutSubMenus = function (el) {

		// If this item's parent is visible and this is not, bail.
		if (el.parent().hasClass('is-visible') && !el.hasClass('is-visible')) {
			return;
		}

		// If this item's parent is visible and this item is visible, hide its submenu then bail.
		if (el.parent().hasClass('is-visible') && el.hasClass('is-visible')) {
			el.removeClass('is-visible').find('.sub-menu').removeClass('slideInLeft').addClass('slideOutLeft');
			return;
		}

		app.$c.subMenuContainer.each(function () {

			// Only try to close submenus that are actually open.
			if ($(this).hasClass('slideInLeft')) {

				// Close the parent list item, and set the corresponding button aria to false.
				$(this).parent().removeClass('is-visible').find('.parent-indicator').attr('aria-expanded', false);

				// Slide out the submenu.
				$(this).removeClass('slideInLeft').addClass('slideOutLeft');
			}
		});
	};

	// Add the down arrow to submenu parents.
	app.addDownArrow = function () {

		app.$c.subMenuParentItem.find('a:first').after('<button type="button" aria-expanded="false" class="parent-indicator" aria-label="Open submenu"><span class="down-arrow"></span></button>');
	};

	// Deal with the submenu.
	app.toggleSubmenu = function (e) {

		var el = $(this),
			// The menu element which was clicked on.
		subMenu = el.children('ul.sub-menu'),
			// The nearest submenu.
		$target = $(e.target); // the element that's actually being clicked (child of the li that triggered the click event).

		// Figure out if we're clicking the button or its arrow child,
		// if so, we can just open or close the menu and bail.
		if ($target.hasClass('down-arrow') || $target.hasClass('parent-indicator')) {

			// First, collapse any already opened submenus.
			app.slideOutSubMenus(el);

			if (!subMenu.hasClass('is-visible')) {

				// Open the submenu.
				app.openSubmenu(el, subMenu);
			}

			return false;
		}
	};

	// Open a submenu.
	app.openSubmenu = function (parent, subMenu) {

		// Expand the list menu item, and set the corresponding button aria to true.
		parent.addClass('is-visible').find('.parent-indicator').attr('aria-expanded', true);

		// Slide the menu in.
		subMenu.addClass('is-visible animated slideInLeft');
	};

	// Force close all the submenus when the main menu container is closed.
	app.forceCloseSubmenus = function (event) {
		if ($(event.target).hasClass('off-canvas-container')) {

			// Focus offcanvas menu for a11y.
			app.$c.offCanvasContainer.focus();

			// The transitionend event triggers on open and on close, need to make sure we only do this on close.
			if (!$(this).hasClass('is-visible')) {
				app.$c.subMenuParentItem.removeClass('is-visible').find('.parent-indicator').attr('aria-expanded', false);
				app.$c.subMenuContainer.removeClass('is-visible slideInLeft');
				app.$c.body.css('overflow', 'visible');
				app.$c.body.unbind('touchstart');
			}

			if ($(this).hasClass('is-visible')) {
				app.$c.body.css('overflow', 'hidden');
				app.$c.body.bind('touchstart', function (e) {
					if (!$(e.target).parents('.contact-modal')[0]) {
						e.preventDefault();
					}
				});
			}
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsMobileMenu);
'use strict';

/**
 * File modal.js
 *
 * Deal with multiple modals and their media.
 */
window.wdsModal = {};
(function (window, $, app) {

	var $modalToggle = void 0,
		$focusableChildren = void 0,
		$player = void 0,
		$tag = document.createElement('script'),
		$firstScriptTag = document.getElementsByTagName('script')[0],
		YT = void 0;

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			$firstScriptTag.parentNode.insertBefore($tag, $firstScriptTag);
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			'body': $('body')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return $('.modal-trigger').length;
	};

	// Combine all events.
	app.bindEvents = function () {

		// Trigger a modal to open.
		app.$c.body.on('click', '.modal-trigger', app.openModal);

		// Trigger the close button to close the modal.
		app.$c.body.on('click', '.close', app.closeModal);

		// Allow the user to close the modal by hitting the esc key.
		app.$c.body.on('keydown', app.escKeyClose);

		// Allow the user to close the modal by clicking outside of the modal.
		app.$c.body.on('click', 'div.modal-open', app.closeModalByClick);

		// Listen to tabs, trap keyboard if we need to
		app.$c.body.on('keydown', app.trapKeyboardMaybe);
	};

	// Open the modal.
	app.openModal = function () {

		// Store the modal toggle element
		$modalToggle = $(this);

		// Figure out which modal we're opening and store the object.
		var $modal = $($(this).data('target'));

		// Display the modal.
		$modal.addClass('modal-open');

		// Add body class.
		app.$c.body.addClass('modal-open');

		// Find the focusable children of the modal.
		// This list may be incomplete, really wish jQuery had the :focusable pseudo like jQuery UI does.
		// For more about :input see: https://api.jquery.com/input-selector/
		$focusableChildren = $modal.find('a, :input, [tabindex]');

		// Ideally, there is always one (the close button), but you never know.
		if (0 < $focusableChildren.length) {

			// Shift focus to the first focusable element.
			$focusableChildren[0].focus();
		}

		return false;
	};

	// Close the modal.
	app.closeModal = function () {

		// Figure the opened modal we're closing and store the object.
		var $modal = $($('div.modal-open .close').data('target')),


		// Find the iframe in the $modal object.
		$iframe = $modal.find('iframe');

		// Only do this if there are any iframes.
		if ($iframe.length) {

			// Get the iframe src URL.
			var url = $iframe.attr('src');

			// Removing/Readding the URL will effectively break the YouTube API.
			// So let's not do that when the iframe URL contains the enablejsapi parameter.
			if (!url.includes('enablejsapi=1')) {

				// Remove the source URL, then add it back, so the video can be played again later.
				$iframe.attr('src', '').attr('src', url);
			} else {

				// Use the YouTube API to stop the video.
				$player.stopVideo();
			}
		}

		// Finally, hide the modal.
		$modal.removeClass('modal-open');

		// Remove the body class.
		app.$c.body.removeClass('modal-open');

		// Revert focus back to toggle element
		$modalToggle.focus();

		return false;
	};

	// Close if "esc" key is pressed.
	app.escKeyClose = function (event) {

		if (!app.$c.body.hasClass('modal-open')) {
			return;
		}

		if (27 === event.keyCode) {
			app.closeModal();
		}
	};

	// Close if the user clicks outside of the modal
	app.closeModalByClick = function (event) {

		// If the parent container is NOT the modal dialog container, close the modal
		if (!$(event.target).parents('div').hasClass('modal-dialog')) {
			app.closeModal();
		}
	};

	// Trap the keyboard into a modal when one is active.
	app.trapKeyboardMaybe = function (event) {

		// We only need to do stuff when the modal is open and tab is pressed.
		if (9 === event.which && 0 < $('.modal-open').length) {
			var $focused = $(':focus'),
				focusIndex = $focusableChildren.index($focused);

			if (0 === focusIndex && event.shiftKey) {

				// If this is the first focusable element, and shift is held when pressing tab, go back to last focusable element.
				$focusableChildren[$focusableChildren.length - 1].focus();
				event.preventDefault();
			} else if (!event.shiftKey && focusIndex === $focusableChildren.length - 1) {

				// If this is the last focusable element, and shift is not held, go back to the first focusable element.
				$focusableChildren[0].focus();
				event.preventDefault();
			}
		}
	};

	// Hook into YouTube <iframe>.
	app.onYouTubeIframeAPIReady = function () {
		var $modal = $('div.modal'),
			$iframeid = $modal.find('iframe').attr('id');

		$player = new YT.Player($iframeid, {
			events: {
				'onReady': app.onPlayerReady,
				'onStateChange': app.onPlayerStateChange
			}
		});
	};

	// Do something on player ready.
	app.onPlayerReady = function () {};

	// Do something on player state change.
	app.onPlayerStateChange = function () {

		// Set focus to the first focusable element inside of the modal the player is in.
		$(event.target.a).parents('.modal').find('a, :input, [tabindex]').first().focus();
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsModal);
'use strict';

/**
 * File: navigation-primary.js
 *
 * Helpers for the primary navigation.
 */
window.wdsPrimaryNavigation = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			window: $(window),
			subMenuContainer: $('.main-navigation .sub-menu'),
			subMenuParentItem: $('.main-navigation li.menu-item-has-children')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.addDownArrow);
		app.$c.subMenuParentItem.find('a').on('focusin focusout', app.toggleFocus);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.subMenuContainer.length;
	};

	// Add the down arrow to submenu parents.
	app.addDownArrow = function () {
		app.$c.subMenuParentItem.find('> a').append('<span class="caret-down" aria-hidden="true"></span>');
	};

	// Toggle the focus class on the link parent.
	app.toggleFocus = function () {
		$(this).parents('li.menu-item-has-children').toggleClass('focus');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsPrimaryNavigation);
'use strict';

/**
 * File: off-canvas.js
 *
 * Help deal with the off-canvas mobile menu.
 */
window.wdsoffCanvas = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			body: $('body'),
			offCanvasClose: $('.off-canvas-close'),
			offCanvasContainer: $('.off-canvas-container'),
			offCanvasOpen: $('.off-canvas-open'),
			offCanvasScreen: $('.off-canvas-screen')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.body.on('keydown', app.escKeyClose);
		app.$c.offCanvasClose.on('click', app.closeoffCanvas);
		app.$c.offCanvasOpen.on('click', app.toggleoffCanvas);
		app.$c.offCanvasScreen.on('click', app.closeoffCanvas);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.offCanvasContainer.length;
	};

	// To show or not to show?
	app.toggleoffCanvas = function () {

		if ('true' === $(this).attr('aria-expanded')) {
			app.closeoffCanvas();
		} else {
			app.openoffCanvas();
		}
	};

	// Show that drawer!
	app.openoffCanvas = function () {
		app.$c.offCanvasContainer.addClass('is-visible');
		app.$c.offCanvasOpen.addClass('is-visible');
		app.$c.offCanvasScreen.addClass('is-visible');

		app.$c.offCanvasOpen.attr('aria-expanded', true);
		app.$c.offCanvasContainer.attr('aria-hidden', false);
	};

	// Close that drawer!
	app.closeoffCanvas = function () {
		app.$c.offCanvasContainer.removeClass('is-visible');
		app.$c.offCanvasOpen.removeClass('is-visible');
		app.$c.offCanvasScreen.removeClass('is-visible');

		app.$c.offCanvasOpen.attr('aria-expanded', false);
		app.$c.offCanvasContainer.attr('aria-hidden', true);

		app.$c.offCanvasOpen.focus();
	};

	// Close drawer if "esc" key is pressed.
	app.escKeyClose = function (event) {
		if (27 === event.keyCode) {
			app.closeoffCanvas();
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsoffCanvas);
'use strict';

/**
 * File skip-link-focus-fix.js.
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
(function () {
	var isWebkit = -1 < navigator.userAgent.toLowerCase().indexOf('webkit'),
		isOpera = -1 < navigator.userAgent.toLowerCase().indexOf('opera'),
		isIe = -1 < navigator.userAgent.toLowerCase().indexOf('msie');

	if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) {
		window.addEventListener('hashchange', function () {
			var id = location.hash.substring(1),
				element;

			if (!/^[A-z0-9_-]+$/.test(id)) {
				return;
			}

			element = document.getElementById(id);

			if (element) {
				if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
					element.tabIndex = -1;
				}

				element.focus();
			}
		}, false);
	}
})();
'use strict';

/**
 * Make tables responsive again.
 *
 * @author Haris Zulfiqar
 */
window.wdsTables = {};
(function (window, $, app) {

	// Constructor
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things
	app.cache = function () {
		app.$c = {
			window: $(window),
			table: $('table')
		};
	};

	// Combine all events
	app.bindEvents = function () {
		app.$c.window.on('load', app.addDataLabel);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.table.length;
	};

	// Adds data-label to td based on th.
	app.addDataLabel = function () {
		var table = app.$c.table;
		var tableHeaders = table.find('thead th');
		var tableRow = table.find('tbody tr');

		tableRow.each(function () {
			var td = $(this).find('td');

			td.each(function (index) {
				if ($(tableHeaders.get(index))) {
					$(this).attr('data-label', $(tableHeaders.get(index)).text());
				}
			});
		});

		return false;
	};

	// Engage
	$(app.init);
})(window, jQuery, window.wdsTables);
'use strict';

/**
 * Video Playback Script.
 */
window.WDSVideoBackgroundObject = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			window: $(window),
			videoButton: $('.video-toggle')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.videoButton.on('click', app.doTogglePlayback);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.videoButton.length;
	};

	// Video Playback.
	app.doTogglePlayback = function () {
		$(this).parents('.content-block').toggleClass('video-toggled');

		if ($(this).parents('.content-block').hasClass('video-toggled')) {
			$(this).siblings('.video-background').trigger('pause');
		} else {
			$(this).siblings('.video-background').trigger('play');
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.WDSVideoBackgroundObject);
'use strict';

/**
 * File window-ready.js
 *
 * Add a "ready" class to <body> when window is ready.
 */
window.wdsWindowReady = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();
		app.bindEvents();
	};

	// Cache document elements.
	app.cache = function () {
		app.$c = {
			'window': $(window),
			'body': $(document.body)
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.load(app.addBodyClass);
	};

	// Add a class to <body>.
	app.addBodyClass = function () {
		app.$c.body.addClass('ready');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsWindowReady);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY29yZGlvbi5qcyIsImNhcm91c2VsLmpzIiwiaGVhZGVyLWJ1dHRvbi5qcyIsImpzLWVuYWJsZWQuanMiLCJtb2JpbGUtbWVudS5qcyIsIm1vZGFsLmpzIiwibmF2aWdhdGlvbi1wcmltYXJ5LmpzIiwib2ZmLWNhbnZhcy5qcyIsInNraXAtbGluay1mb2N1cy1maXguanMiLCJ0YWJsZS5qcyIsInZpZGVvLmpzIiwid2luZG93LXJlYWR5LmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFjY29yZGlvbkJsb2NrVG9nZ2xlIiwiJCIsImFwcCIsImluaXQiLCJjYWNoZSIsImFjZiIsImFkZEFjdGlvbiIsImJpbmRFdmVudHMiLCJtZWV0c1JlcXVpcmVtZW50cyIsIiRjIiwiaHRtbCIsImFjY29yZGlvbiIsIml0ZW1zIiwiaGVhZGVycyIsImNvbnRlbnRzIiwiYnV0dG9uIiwiYW5jaG9ySUQiLCJsb2NhdGlvbiIsImhhc2giLCJvbiIsInRvZ2dsZUFjY29yZGlvbiIsIm9wZW5IYXNoQWNjb3JkaW9uIiwibGVuZ3RoIiwicGFyZW50cyIsInRvZ2dsZUNsYXNzIiwiaXNFeHBhbmRlZCIsImhhc0NsYXNzIiwiZmluZCIsImF0dHIiLCJub3QiLCJyZW1vdmVDbGFzcyIsInNlbGVjdG9yIiwidHJpZ2dlciIsImFkbWluQmFySGVpZ2h0IiwiaGVpZ2h0IiwiYW5pbWF0ZSIsInNjcm9sbFRvcCIsIm9mZnNldCIsInRvcCIsImpRdWVyeSIsIndkc0Nhcm91c2VsIiwiZG9TbGljayIsInRoZUNhcm91c2VsIiwiZG9GaXJzdEFuaW1hdGlvbiIsImZpcnN0U2xpZGUiLCJmaXJzdFNsaWRlQ29udGVudCIsImZpcnN0QW5pbWF0aW9uIiwiYWRkQ2xhc3MiLCJwbGF5QmFja2dyb3VuZFZpZGVvcyIsImVhY2giLCJwbGF5IiwiaW5pdGlhbGl6ZUNhcm91c2VsIiwic2xpY2siLCJhdXRvcGxheSIsImF1dG9wbGF5U3BlZWQiLCJhcnJvd3MiLCJkb3RzIiwiZm9jdXNPblNlbGVjdCIsIndhaXRGb3JBbmltYXRlIiwiZG9jdW1lbnQiLCJyZWFkeSIsIlNob3dIaWRlU2VhcmNoRm9ybSIsImJvZHkiLCJoZWFkZXJTZWFyY2hUb2dnbGUiLCJoZWFkZXJTZWFyY2hGb3JtIiwic2hvd0hpZGVTZWFyY2hGb3JtIiwiaGlkZVNlYXJjaEZvcm0iLCJzZWFyY2hJc09wZW4iLCJ0b2dnbGVTZWFyY2hGb3JtQXJpYUxhYmVsIiwidG9nZ2xlU2VhcmNoVG9nZ2xlQXJpYUxhYmVsIiwiZXZlbnQiLCJ0YXJnZXQiLCJjbGFzc05hbWUiLCJyZXBsYWNlIiwid2RzTW9iaWxlTWVudSIsInN1Yk1lbnVDb250YWluZXIiLCJzdWJTdWJNZW51Q29udGFpbmVyIiwic3ViTWVudVBhcmVudEl0ZW0iLCJvZmZDYW52YXNDb250YWluZXIiLCJhZGREb3duQXJyb3ciLCJ0b2dnbGVTdWJtZW51IiwicmVzZXRTdWJNZW51IiwiZm9yY2VDbG9zZVN1Ym1lbnVzIiwiaXMiLCJzbGlkZU91dFN1Yk1lbnVzIiwiZWwiLCJwYXJlbnQiLCJhZnRlciIsImUiLCJzdWJNZW51IiwiY2hpbGRyZW4iLCIkdGFyZ2V0Iiwib3BlblN1Ym1lbnUiLCJmb2N1cyIsImNzcyIsInVuYmluZCIsImJpbmQiLCJwcmV2ZW50RGVmYXVsdCIsIndkc01vZGFsIiwiJG1vZGFsVG9nZ2xlIiwiJGZvY3VzYWJsZUNoaWxkcmVuIiwiJHBsYXllciIsIiR0YWciLCJjcmVhdGVFbGVtZW50IiwiJGZpcnN0U2NyaXB0VGFnIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJZVCIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJvcGVuTW9kYWwiLCJjbG9zZU1vZGFsIiwiZXNjS2V5Q2xvc2UiLCJjbG9zZU1vZGFsQnlDbGljayIsInRyYXBLZXlib2FyZE1heWJlIiwiJG1vZGFsIiwiZGF0YSIsIiRpZnJhbWUiLCJ1cmwiLCJpbmNsdWRlcyIsInN0b3BWaWRlbyIsImtleUNvZGUiLCJ3aGljaCIsIiRmb2N1c2VkIiwiZm9jdXNJbmRleCIsImluZGV4Iiwic2hpZnRLZXkiLCJvbllvdVR1YmVJZnJhbWVBUElSZWFkeSIsIiRpZnJhbWVpZCIsIlBsYXllciIsImV2ZW50cyIsIm9uUGxheWVyUmVhZHkiLCJvblBsYXllclN0YXRlQ2hhbmdlIiwiYSIsImZpcnN0Iiwid2RzUHJpbWFyeU5hdmlnYXRpb24iLCJ0b2dnbGVGb2N1cyIsImFwcGVuZCIsIndkc29mZkNhbnZhcyIsIm9mZkNhbnZhc0Nsb3NlIiwib2ZmQ2FudmFzT3BlbiIsIm9mZkNhbnZhc1NjcmVlbiIsImNsb3Nlb2ZmQ2FudmFzIiwidG9nZ2xlb2ZmQ2FudmFzIiwib3Blbm9mZkNhbnZhcyIsImlzV2Via2l0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwiaXNPcGVyYSIsImlzSWUiLCJnZXRFbGVtZW50QnlJZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpZCIsInN1YnN0cmluZyIsImVsZW1lbnQiLCJ0ZXN0IiwidGFnTmFtZSIsInRhYkluZGV4Iiwid2RzVGFibGVzIiwidGFibGUiLCJhZGREYXRhTGFiZWwiLCJ0YWJsZUhlYWRlcnMiLCJ0YWJsZVJvdyIsInRkIiwiZ2V0IiwidGV4dCIsIldEU1ZpZGVvQmFja2dyb3VuZE9iamVjdCIsInZpZGVvQnV0dG9uIiwiZG9Ub2dnbGVQbGF5YmFjayIsInNpYmxpbmdzIiwid2RzV2luZG93UmVhZHkiLCJsb2FkIiwiYWRkQm9keUNsYXNzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7OztBQUtBQSxPQUFPQyxvQkFBUCxHQUE4QixFQUE5QjtBQUNFLFdBQVVELE1BQVYsRUFBa0JFLENBQWxCLEVBQXFCQyxHQUFyQixFQUEyQjs7QUFFNUI7QUFDQUEsS0FBSUMsSUFBSixHQUFXLFlBQVc7QUFDckJELE1BQUlFLEtBQUo7O0FBRUE7QUFDQSxNQUFLTCxPQUFPTSxHQUFaLEVBQWtCO0FBQ2pCTixVQUFPTSxHQUFQLENBQVdDLFNBQVgsQ0FBc0Isc0JBQXRCLEVBQThDSixJQUFJSyxVQUFsRDtBQUNBOztBQUVELE1BQUtM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Q0QsRUFSRDs7QUFVQTtBQUNBL0IsR0FBR0MsSUFBSUMsSUFBUDtBQUVBLENBM0NDLEVBMkNDSixNQTNDRCxFQTJDU3dDLE1BM0NULEVBMkNpQnhDLE9BQU93Syx3QkEzQ3hCLENBQUY7OztBQ0pBOzs7OztBQUtBeEssT0FBTzRLLGNBQVAsR0FBd0IsRUFBeEI7QUFDRSxXQUFVNUssTUFBVixFQUFrQkUsQ0FBbEIsRUFBcUJDLEdBQXJCLEVBQTJCOztBQUU1QjtBQUNBQSxLQUFJQyxJQUFKLEdBQVcsWUFBVztBQUNyQkQsTUFBSUUsS0FBSjtBQUNBRixNQUFJSyxVQUFKO0FBQ0EsRUFIRDs7QUFLQTtBQUNBTCxLQUFJRSxLQUFKLEdBQVksWUFBVztBQUN0QkYsTUFBSU8sRUFBSixHQUFTO0FBQ1IsYUFBVVIsRUFBR0YsTUFBSCxDQURGO0FBRVIsV0FBUUUsRUFBRzBELFNBQVNHLElBQVo7QUFGQSxHQUFUO0FBSUEsRUFMRDs7QUFPQTtBQUNBNUQsS0FBSUssVUFBSixHQUFpQixZQUFXO0FBQzNCTCxNQUFJTyxFQUFKLENBQU9WLE1BQVAsQ0FBYzZLLElBQWQsQ0FBb0IxSyxJQUFJMkssWUFBeEI7QUFDQSxFQUZEOztBQUlBO0FBQ0EzSyxLQUFJMkssWUFBSixHQUFtQixZQUFXO0FBQzdCM0ssTUFBSU8sRUFBSixDQUFPcUQsSUFBUCxDQUFZZixRQUFaLENBQXNCLE9BQXRCO0FBQ0EsRUFGRDs7QUFJQTtBQUNBOUMsR0FBR0MsSUFBSUMsSUFBUDtBQUNBLENBNUJDLEVBNEJDSixNQTVCRCxFQTRCU3dDLE1BNUJULEVBNEJpQnhDLE9BQU80SyxjQTVCeEIsQ0FBRiIsImZpbGUiOiJwcm9qZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEFjY29yZGlvbiBibG9jayBmdW5jdGlvbmFsaXR5XHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhbm5vbiBNYWNNaWxsYW4sIENvcmV5IENvbGxpbnNcclxuICovXHJcbndpbmRvdy5hY2NvcmRpb25CbG9ja1RvZ2dsZSA9IHt9O1xyXG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcclxuXHJcblx0Ly8gQ29uc3RydWN0b3JcclxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLmNhY2hlKCk7XHJcblxyXG5cdFx0Ly8gSWYgd2UncmUgaW4gYW4gQUNGIGVkaXQgcGFnZS5cclxuXHRcdGlmICggd2luZG93LmFjZiApIHtcclxuXHRcdFx0d2luZG93LmFjZi5hZGRBY3Rpb24oICdyZW5kZXJfYmxvY2tfcHJldmlldycsIGFwcC5iaW5kRXZlbnRzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcclxuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBDYWNoZSBhbGwgdGhlIHRoaW5nc1xyXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjID0ge1xyXG5cdFx0XHR3aW5kb3c6ICQoIHdpbmRvdyApLFxyXG5cdFx0XHRodG1sOiAkKCAnaHRtbCcgKSxcclxuXHRcdFx0YWNjb3JkaW9uOiAkKCAnLmFjY29yZGlvbicgKSxcclxuXHRcdFx0aXRlbXM6ICQoICcuYWNjb3JkaW9uLWl0ZW0nICksXHJcblx0XHRcdGhlYWRlcnM6ICQoICcuYWNjb3JkaW9uLWl0ZW0taGVhZGVyJyApLFxyXG5cdFx0XHRjb250ZW50czogJCggJy5hY2NvcmRpb24taXRlbS1jb250ZW50JyApLFxyXG5cdFx0XHRidXR0b246ICQoICcuYWNjb3JkaW9uLWl0ZW0tdG9nZ2xlJyApLFxyXG5cdFx0XHRhbmNob3JJRDogJCggd2luZG93LmxvY2F0aW9uLmhhc2ggKVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvLyBDb21iaW5lIGFsbCBldmVudHNcclxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0JCggJy5hY2NvcmRpb24taXRlbS1oZWFkZXInICkub24oICdjbGljaycsIGFwcC50b2dnbGVBY2NvcmRpb24gKTtcclxuXHRcdCQoICcuYWNjb3JkaW9uLWl0ZW0tdG9nZ2xlJyApLm9uKCAnY2xpY2snLCBhcHAudG9nZ2xlQWNjb3JkaW9uICk7XHJcblx0XHRhcHAuJGMud2luZG93Lm9uKCAnbG9hZCcsIGFwcC5vcGVuSGFzaEFjY29yZGlvbiApO1xyXG5cdH07XHJcblxyXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cclxuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBhcHAuJGMuYWNjb3JkaW9uLmxlbmd0aDtcclxuXHR9O1xyXG5cclxuXHRhcHAudG9nZ2xlQWNjb3JkaW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBvcGVuIGNsYXNzIHRvIHRoZSBpdGVtLlxyXG5cdFx0JCggdGhpcyApLnBhcmVudHMoICcuYWNjb3JkaW9uLWl0ZW0nICkudG9nZ2xlQ2xhc3MoICdvcGVuJyApO1xyXG5cclxuXHRcdC8vIElzIHRoaXMgb25lIGV4cGFuZGVkP1xyXG5cdFx0bGV0IGlzRXhwYW5kZWQgPSAkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24taXRlbScgKS5oYXNDbGFzcyggJ29wZW4nICk7XHJcblxyXG5cdFx0Ly8gU2V0IHRoaXMgYnV0dG9uJ3MgYXJpYS1leHBhbmRlZCB2YWx1ZS5cclxuXHRcdCQoIHRoaXMgKS5wYXJlbnRzKCAnLmFjY29yZGlvbi1pdGVtJyApLmZpbmQoICcuYWNjb3JkaW9uLWl0ZW0tdG9nZ2xlJyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgaXNFeHBhbmRlZCA/ICd0cnVlJyA6ICdmYWxzZScgKTtcclxuXHJcblx0XHQvLyBTZXQgYWxsIG90aGVyIGl0ZW1zIGluIHRoaXMgYmxvY2sgdG8gYXJpYS1oaWRkZW49dHJ1ZS5cclxuXHRcdCQoIHRoaXMgKS5wYXJlbnRzKCAnLmFjY29yZGlvbi1ibG9jaycgKS5maW5kKCAnLmFjY29yZGlvbi1pdGVtLWNvbnRlbnQnICkubm90KCAkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24taXRlbScgKSApLmF0dHIoICdhcmlhLWhpZGRlbicsICd0cnVlJyApO1xyXG5cclxuXHRcdC8vIFNldCB0aGlzIGl0ZW0gdG8gYXJpYS1oaWRkZW49ZmFsc2UuXHJcblx0XHQkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24taXRlbScgKS5maW5kKCAnLmFjY29yZGlvbi1pdGVtLWNvbnRlbnQnICkuYXR0ciggJ2FyaWEtaGlkZGVuJywgaXNFeHBhbmRlZCA/ICdmYWxzZScgOiAndHJ1ZScgKTtcclxuXHJcblx0XHQvLyBIaWRlIHRoZSBvdGhlciBwYW5lbHMuXHJcblx0XHQkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24tYmxvY2snICkuZmluZCggJy5hY2NvcmRpb24taXRlbScgKS5ub3QoICQoIHRoaXMgKS5wYXJlbnRzKCAnLmFjY29yZGlvbi1pdGVtJyApICkucmVtb3ZlQ2xhc3MoICdvcGVuJyApO1xyXG5cdFx0JCggdGhpcyApLnBhcmVudHMoICcuYWNjb3JkaW9uLWJsb2NrJyApLmZpbmQoICcuYWNjb3JkaW9uLWl0ZW0tdG9nZ2xlJyApLm5vdCggJCggdGhpcyApICkuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnICk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH07XHJcblxyXG5cdGFwcC5vcGVuSGFzaEFjY29yZGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdGlmICggISBhcHAuJGMuYW5jaG9ySUQuc2VsZWN0b3IgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUcmlnZ2VyIGEgY2xpY2sgb24gdGhlIGJ1dHRvbiBjbG9zZXN0IHRvIHRoaXMgYWNjb3JkaW9uLlxyXG5cdFx0YXBwLiRjLmFuY2hvcklELnBhcmVudHMoICcuYWNjb3JkaW9uLWl0ZW0nICkuZmluZCggJy5hY2NvcmRpb24taXRlbS10b2dnbGUnICkudHJpZ2dlciggJ2NsaWNrJyApO1xyXG5cclxuXHRcdC8vIE5vdCBzZXR0aW5nIGEgY2FjaGVkIHZhcmlhYmxlIGFzIGl0IGRvZXNuJ3Qgc2VlbSB0byBncmFiIHRoZSBoZWlnaHQgcHJvcGVybHkuXHJcblx0XHRjb25zdCBhZG1pbkJhckhlaWdodCA9ICQoICcjd3BhZG1pbmJhcicgKS5sZW5ndGggPyAkKCAnI3dwYWRtaW5iYXInICkuaGVpZ2h0KCkgOiAwO1xyXG5cclxuXHRcdC8vIEFuaW1hdGUgdG8gdGhlIGRpdiBmb3IgYSBuaWNlciBleHBlcmllbmNlLlxyXG5cdFx0YXBwLiRjLmh0bWwuYW5pbWF0ZSgge1xyXG5cdFx0XHRzY3JvbGxUb3A6IGFwcC4kYy5hbmNob3JJRC5vZmZzZXQoKS50b3AgLSBhZG1pbkJhckhlaWdodFxyXG5cdFx0fSwgJ3Nsb3cnICk7XHJcblx0fTtcclxuXHJcblx0Ly8gRW5nYWdlXHJcblx0YXBwLmluaXQoKTtcclxuXHJcbn0gKCB3aW5kb3csIGpRdWVyeSwgd2luZG93LmFjY29yZGlvbkJsb2NrVG9nZ2xlICkgKTtcclxuIiwiLyoqXHJcbiAqIEZpbGUgY2Fyb3VzZWwuanNcclxuICpcclxuICogRGVhbCB3aXRoIHRoZSBTbGljayBjYXJvdXNlbC5cclxuICovXHJcbndpbmRvdy53ZHNDYXJvdXNlbCA9IHt9O1xyXG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcclxuXHJcblx0Ly8gQ29uc3RydWN0b3IuXHJcblx0YXBwLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC5jYWNoZSgpO1xyXG5cclxuXHRcdC8vIElmIHdlJ3JlIGluIGFuIEFDRiBlZGl0IHBhZ2UuXHJcblx0XHRpZiAoIHdpbmRvdy5hY2YgKSB7XHJcblx0XHRcdGFwcC5kb1NsaWNrKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcclxuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBDYWNoZSBhbGwgdGhlIHRoaW5ncy5cclxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYyA9IHtcclxuXHRcdFx0d2luZG93OiAkKCB3aW5kb3cgKSxcclxuXHRcdFx0dGhlQ2Fyb3VzZWw6ICQoICcuY2Fyb3VzZWwtYmxvY2snIClcclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxyXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMud2luZG93Lm9uKCAnbG9hZCcsIGFwcC5kb1NsaWNrICk7XHJcblx0XHRhcHAuJGMud2luZG93Lm9uKCAnbG9hZCcsIGFwcC5kb0ZpcnN0QW5pbWF0aW9uICk7XHJcblx0fTtcclxuXHJcblx0Ly8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xyXG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIGFwcC4kYy50aGVDYXJvdXNlbC5sZW5ndGg7XHJcblx0fTtcclxuXHJcblx0Ly8gQW5pbWF0ZSB0aGUgZmlyc3Qgc2xpZGUgb24gd2luZG93IGxvYWQuXHJcblx0YXBwLmRvRmlyc3RBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHQvLyBHZXQgdGhlIGZpcnN0IHNsaWRlIGNvbnRlbnQgYXJlYSBhbmQgYW5pbWF0aW9uIGF0dHJpYnV0ZS5cclxuXHRcdGxldCBmaXJzdFNsaWRlID0gYXBwLiRjLnRoZUNhcm91c2VsLmZpbmQoICdbZGF0YS1zbGljay1pbmRleD0wXScgKSxcclxuXHRcdFx0Zmlyc3RTbGlkZUNvbnRlbnQgPSBmaXJzdFNsaWRlLmZpbmQoICcuc2xpZGUtY29udGVudCcgKSxcclxuXHRcdFx0Zmlyc3RBbmltYXRpb24gPSBmaXJzdFNsaWRlQ29udGVudC5hdHRyKCAnZGF0YS1hbmltYXRpb24nICk7XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBhbmltYXRpb24gY2xhc3MgdG8gdGhlIGZpcnN0IHNsaWRlLlxyXG5cdFx0Zmlyc3RTbGlkZUNvbnRlbnQuYWRkQ2xhc3MoIGZpcnN0QW5pbWF0aW9uICk7XHJcblx0fTtcclxuXHJcblx0Ly8gQWxsb3cgYmFja2dyb3VuZCB2aWRlb3MgdG8gYXV0b3BsYXkuXHJcblx0YXBwLnBsYXlCYWNrZ3JvdW5kVmlkZW9zID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0Ly8gR2V0IGFsbCB0aGUgdmlkZW9zIGluIG91ciBzbGlkZXMgb2JqZWN0LlxyXG5cdFx0JCggJ3ZpZGVvJyApLmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0Ly8gTGV0IHRoZW0gYXV0b3BsYXkuIFRPRE86IFBvc3NpYmx5IGNoYW5nZSB0aGlzIGxhdGVyIHRvIG9ubHkgcGxheSB0aGUgdmlzaWJsZSBzbGlkZSB2aWRlby5cclxuXHRcdFx0dGhpcy5wbGF5KCk7XHJcblx0XHR9ICk7XHJcblx0fTtcclxuXHJcblx0Ly8gSW5pdGlhbGl6ZSBvdXIgY2Fyb3VzZWwuXHJcblx0YXBwLmluaXRpYWxpemVDYXJvdXNlbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdCQoICcuY2Fyb3VzZWwtYmxvY2snICkubm90KCAnLnNsaWNrLWluaXRpYWxpemVkJyApLnNsaWNrKCB7XHJcblx0XHRcdGF1dG9wbGF5OiB0cnVlLFxyXG5cdFx0XHRhdXRvcGxheVNwZWVkOiA1MDAwLFxyXG5cdFx0XHRhcnJvd3M6IHRydWUsXHJcblx0XHRcdGRvdHM6IHRydWUsXHJcblx0XHRcdGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcblx0XHRcdHdhaXRGb3JBbmltYXRlOiB0cnVlXHJcblx0XHR9ICk7XHJcblx0fTtcclxuXHJcblx0Ly8gS2ljayBvZmYgU2xpY2suXHJcblx0YXBwLmRvU2xpY2sgPSBmdW5jdGlvbigpIHtcclxuXHJcblxyXG5cdFx0Ly8gUmVuZGVyIG9uIHRoZSBmcm9udGVuZC5cclxuXHRcdCQoIGRvY3VtZW50ICkucmVhZHkoIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRhcHAucGxheUJhY2tncm91bmRWaWRlb3M7XHJcblx0XHRcdGFwcC5pbml0aWFsaXplQ2Fyb3VzZWwoKTtcclxuXHRcdH0gKTtcclxuXHJcblx0XHQvLyBSZW5kZXIgb24gdGhlIGJhY2tlbmQuXHJcblx0XHRpZiAoIHdpbmRvdy5hY2YgKSB7XHJcblx0XHRcdHdpbmRvdy5hY2YuYWRkQWN0aW9uKCAncmVuZGVyX2Jsb2NrX3ByZXZpZXcnLCBhcHAuaW5pdGlhbGl6ZUNhcm91c2VsICk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gRW5nYWdlIVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcbn0gKCB3aW5kb3csIGpRdWVyeSwgd2luZG93Lndkc0Nhcm91c2VsICkgKTtcclxuIiwiLyoqXHJcbiAqIFNob3cvSGlkZSB0aGUgU2VhcmNoIEZvcm0gaW4gdGhlIGhlYWRlci5cclxuICpcclxuICogQGF1dGhvciBDb3JleSBDb2xsaW5zXHJcbiAqL1xyXG53aW5kb3cuU2hvd0hpZGVTZWFyY2hGb3JtID0ge307XHJcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xyXG5cclxuXHQvLyBDb25zdHJ1Y3RvclxyXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuY2FjaGUoKTtcclxuXHJcblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xyXG5cdFx0XHRhcHAuYmluZEV2ZW50cygpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzXHJcblx0YXBwLmNhY2hlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMgPSB7XHJcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXHJcblx0XHRcdGJvZHk6ICQoICdib2R5JyApLFxyXG5cdFx0XHRoZWFkZXJTZWFyY2hUb2dnbGU6ICQoICcuc2l0ZS1oZWFkZXItYWN0aW9uIC5jdGEtYnV0dG9uJyApLFxyXG5cdFx0XHRoZWFkZXJTZWFyY2hGb3JtOiAkKCAnLnNpdGUtaGVhZGVyLWFjdGlvbiAuZm9ybS1jb250YWluZXInICksXHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdC8vIENvbWJpbmUgYWxsIGV2ZW50c1xyXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMuaGVhZGVyU2VhcmNoVG9nZ2xlLm9uKCAna2V5dXAgY2xpY2snLCBhcHAuc2hvd0hpZGVTZWFyY2hGb3JtICk7XHJcblx0XHRhcHAuJGMuYm9keS5vbiggJ2tleXVwIHRvdWNoc3RhcnQgY2xpY2snLCBhcHAuaGlkZVNlYXJjaEZvcm0gKTtcclxuXHR9O1xyXG5cclxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XHJcblx0YXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gYXBwLiRjLmhlYWRlclNlYXJjaFRvZ2dsZS5sZW5ndGg7XHJcblx0fTtcclxuXHJcblx0Ly8gQ2hlY2tzIHRvIHNlZSBpZiB0aGUgbWVudSBoYXMgYmVlbiBvcGVuZWQuXHJcblx0YXBwLnNlYXJjaElzT3BlbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdGlmICggYXBwLiRjLmJvZHkuaGFzQ2xhc3MoICdzZWFyY2gtZm9ybS12aXNpYmxlJyApICkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fTtcclxuXHJcblx0Ly8gQWRkcyB0aGUgdG9nZ2xlIGNsYXNzIGZvciB0aGUgc2VhcmNoIGZvcm0uXHJcblx0YXBwLnNob3dIaWRlU2VhcmNoRm9ybSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjLmJvZHkudG9nZ2xlQ2xhc3MoICdzZWFyY2gtZm9ybS12aXNpYmxlJyApO1xyXG5cclxuXHRcdGFwcC50b2dnbGVTZWFyY2hGb3JtQXJpYUxhYmVsKCk7XHJcblx0XHRhcHAudG9nZ2xlU2VhcmNoVG9nZ2xlQXJpYUxhYmVsKCk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH07XHJcblxyXG5cdC8vIEhpZGVzIHRoZSBzZWFyY2ggZm9ybSBpZiB3ZSBjbGljayBvdXRzaWRlIG9mIGl0cyBjb250YWluZXIuXHJcblx0YXBwLmhpZGVTZWFyY2hGb3JtID0gZnVuY3Rpb24oIGV2ZW50ICkge1xyXG5cclxuXHRcdGlmICggISAkKCBldmVudC50YXJnZXQgKS5wYXJlbnRzKCAnZGl2JyApLmhhc0NsYXNzKCAnc2l0ZS1oZWFkZXItYWN0aW9uJyApICkge1xyXG5cdFx0XHRhcHAuJGMuYm9keS5yZW1vdmVDbGFzcyggJ3NlYXJjaC1mb3JtLXZpc2libGUnICk7XHJcblx0XHRcdGFwcC50b2dnbGVTZWFyY2hGb3JtQXJpYUxhYmVsKCk7XHJcblx0XHRcdGFwcC50b2dnbGVTZWFyY2hUb2dnbGVBcmlhTGFiZWwoKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBUb2dnbGVzIHRoZSBhcmlhLWhpZGRlbiBsYWJlbCBvbiB0aGUgZm9ybSBjb250YWluZXIuXHJcblx0YXBwLnRvZ2dsZVNlYXJjaEZvcm1BcmlhTGFiZWwgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy5oZWFkZXJTZWFyY2hGb3JtLmF0dHIoICdhcmlhLWhpZGRlbicsIGFwcC5zZWFyY2hJc09wZW4oKSA/ICdmYWxzZScgOiAndHJ1ZScgKTtcclxuXHR9O1xyXG5cclxuXHQvLyBUb2dnbGVzIHRoZSBhcmlhLWhpZGRlbiBsYWJlbCBvbiB0aGUgdG9nZ2xlIGJ1dHRvbi5cclxuXHRhcHAudG9nZ2xlU2VhcmNoVG9nZ2xlQXJpYUxhYmVsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMuaGVhZGVyU2VhcmNoVG9nZ2xlLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgYXBwLnNlYXJjaElzT3BlbigpID8gJ3RydWUnIDogJ2ZhbHNlJyApO1xyXG5cdH07XHJcblxyXG5cdC8vIEVuZ2FnZVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcblxyXG59ICggd2luZG93LCBqUXVlcnksIHdpbmRvdy5TaG93SGlkZVNlYXJjaEZvcm0gKSApO1xyXG4iLCIvKipcclxuICogRmlsZSBqcy1lbmFibGVkLmpzXHJcbiAqXHJcbiAqIElmIEphdmFzY3JpcHQgaXMgZW5hYmxlZCwgcmVwbGFjZSB0aGUgPGJvZHk+IGNsYXNzIFwibm8tanNcIi5cclxuICovXHJcbmRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUucmVwbGFjZSggJ25vLWpzJywgJ2pzJyApO1xyXG4iLCIvKipcclxuICogRmlsZTogbW9iaWxlLW1lbnUuanNcclxuICpcclxuICogQ3JlYXRlIGFuIGFjY29yZGlvbiBzdHlsZSBkcm9wZG93bi5cclxuICovXHJcbndpbmRvdy53ZHNNb2JpbGVNZW51ID0ge307XHJcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xyXG5cclxuXHQvLyBDb25zdHJ1Y3Rvci5cclxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLmNhY2hlKCk7XHJcblxyXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcclxuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBDYWNoZSBhbGwgdGhlIHRoaW5ncy5cclxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYyA9IHtcclxuXHRcdFx0Ym9keTogJCggJ2JvZHknICksXHJcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXHJcblx0XHRcdHN1Yk1lbnVDb250YWluZXI6ICQoICcubW9iaWxlLW1lbnUgLnN1Yi1tZW51LCAudXRpbGl0eS1uYXZpZ2F0aW9uIC5zdWItbWVudScgKSxcclxuXHRcdFx0c3ViU3ViTWVudUNvbnRhaW5lcjogJCggJy5tb2JpbGUtbWVudSAuc3ViLW1lbnUgLnN1Yi1tZW51JyApLFxyXG5cdFx0XHRzdWJNZW51UGFyZW50SXRlbTogJCggJy5tb2JpbGUtbWVudSBsaS5tZW51LWl0ZW0taGFzLWNoaWxkcmVuLCAudXRpbGl0eS1uYXZpZ2F0aW9uIGxpLm1lbnUtaXRlbS1oYXMtY2hpbGRyZW4nICksXHJcblx0XHRcdG9mZkNhbnZhc0NvbnRhaW5lcjogJCggJy5vZmYtY2FudmFzLWNvbnRhaW5lcicgKVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvLyBDb21iaW5lIGFsbCBldmVudHMuXHJcblx0YXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy53aW5kb3cub24oICdsb2FkJywgYXBwLmFkZERvd25BcnJvdyApO1xyXG5cdFx0YXBwLiRjLnN1Yk1lbnVQYXJlbnRJdGVtLm9uKCAnY2xpY2snLCBhcHAudG9nZ2xlU3VibWVudSApO1xyXG5cdFx0YXBwLiRjLnN1Yk1lbnVQYXJlbnRJdGVtLm9uKCAndHJhbnNpdGlvbmVuZCcsIGFwcC5yZXNldFN1Yk1lbnUgKTtcclxuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIub24oICd0cmFuc2l0aW9uZW5kJywgYXBwLmZvcmNlQ2xvc2VTdWJtZW51cyApO1xyXG5cdH07XHJcblxyXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cclxuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBhcHAuJGMuc3ViTWVudUNvbnRhaW5lci5sZW5ndGg7XHJcblx0fTtcclxuXHJcblx0Ly8gUmVzZXQgdGhlIHN1Ym1lbnVzIGFmdGVyIGl0J3MgZG9uZSBjbG9zaW5nLlxyXG5cdGFwcC5yZXNldFN1Yk1lbnUgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHQvLyBXaGVuIHRoZSBsaXN0IGl0ZW0gaXMgZG9uZSB0cmFuc2l0aW9uaW5nIGluIGhlaWdodCxcclxuXHRcdC8vIHJlbW92ZSB0aGUgY2xhc3NlcyBmcm9tIHRoZSBzdWJtZW51IHNvIGl0IGlzIHJlYWR5IHRvIHRvZ2dsZSBhZ2Fpbi5cclxuXHRcdGlmICggJCggdGhpcyApLmlzKCAnbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbicgKSAmJiAhICQoIHRoaXMgKS5oYXNDbGFzcyggJ2lzLXZpc2libGUnICkgKSB7XHJcblx0XHRcdCQoIHRoaXMgKS5maW5kKCAndWwuc3ViLW1lbnUnICkucmVtb3ZlQ2xhc3MoICdzbGlkZU91dExlZnQgaXMtdmlzaWJsZScgKTtcclxuXHRcdH1cclxuXHJcblx0fTtcclxuXHJcblx0Ly8gU2xpZGUgb3V0IHRoZSBzdWJtZW51IGl0ZW1zLlxyXG5cdGFwcC5zbGlkZU91dFN1Yk1lbnVzID0gZnVuY3Rpb24oIGVsICkge1xyXG5cclxuXHRcdC8vIElmIHRoaXMgaXRlbSdzIHBhcmVudCBpcyB2aXNpYmxlIGFuZCB0aGlzIGlzIG5vdCwgYmFpbC5cclxuXHRcdGlmICggZWwucGFyZW50KCkuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICYmICEgZWwuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWYgdGhpcyBpdGVtJ3MgcGFyZW50IGlzIHZpc2libGUgYW5kIHRoaXMgaXRlbSBpcyB2aXNpYmxlLCBoaWRlIGl0cyBzdWJtZW51IHRoZW4gYmFpbC5cclxuXHRcdGlmICggZWwucGFyZW50KCkuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICYmIGVsLmhhc0NsYXNzKCAnaXMtdmlzaWJsZScgKSApIHtcclxuXHRcdFx0ZWwucmVtb3ZlQ2xhc3MoICdpcy12aXNpYmxlJyApLmZpbmQoICcuc3ViLW1lbnUnICkucmVtb3ZlQ2xhc3MoICdzbGlkZUluTGVmdCcgKS5hZGRDbGFzcyggJ3NsaWRlT3V0TGVmdCcgKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGFwcC4kYy5zdWJNZW51Q29udGFpbmVyLmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0Ly8gT25seSB0cnkgdG8gY2xvc2Ugc3VibWVudXMgdGhhdCBhcmUgYWN0dWFsbHkgb3Blbi5cclxuXHRcdFx0aWYgKCAkKCB0aGlzICkuaGFzQ2xhc3MoICdzbGlkZUluTGVmdCcgKSApIHtcclxuXHJcblx0XHRcdFx0Ly8gQ2xvc2UgdGhlIHBhcmVudCBsaXN0IGl0ZW0sIGFuZCBzZXQgdGhlIGNvcnJlc3BvbmRpbmcgYnV0dG9uIGFyaWEgdG8gZmFsc2UuXHJcblx0XHRcdFx0JCggdGhpcyApLnBhcmVudCgpLnJlbW92ZUNsYXNzKCAnaXMtdmlzaWJsZScgKS5maW5kKCAnLnBhcmVudC1pbmRpY2F0b3InICkuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSApO1xyXG5cclxuXHRcdFx0XHQvLyBTbGlkZSBvdXQgdGhlIHN1Ym1lbnUuXHJcblx0XHRcdFx0JCggdGhpcyApLnJlbW92ZUNsYXNzKCAnc2xpZGVJbkxlZnQnICkuYWRkQ2xhc3MoICdzbGlkZU91dExlZnQnICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9ICk7XHJcblx0fTtcclxuXHJcblx0Ly8gQWRkIHRoZSBkb3duIGFycm93IHRvIHN1Ym1lbnUgcGFyZW50cy5cclxuXHRhcHAuYWRkRG93bkFycm93ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0YXBwLiRjLnN1Yk1lbnVQYXJlbnRJdGVtLmZpbmQoICdhOmZpcnN0JyApLmFmdGVyKCAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCIgY2xhc3M9XCJwYXJlbnQtaW5kaWNhdG9yXCIgYXJpYS1sYWJlbD1cIk9wZW4gc3VibWVudVwiPjxzcGFuIGNsYXNzPVwiZG93bi1hcnJvd1wiPjwvc3Bhbj48L2J1dHRvbj4nICk7XHJcblx0fTtcclxuXHJcblx0Ly8gRGVhbCB3aXRoIHRoZSBzdWJtZW51LlxyXG5cdGFwcC50b2dnbGVTdWJtZW51ID0gZnVuY3Rpb24oIGUgKSB7XHJcblxyXG5cdFx0bGV0IGVsID0gJCggdGhpcyApLCAvLyBUaGUgbWVudSBlbGVtZW50IHdoaWNoIHdhcyBjbGlja2VkIG9uLlxyXG5cdFx0XHRzdWJNZW51ID0gZWwuY2hpbGRyZW4oICd1bC5zdWItbWVudScgKSwgLy8gVGhlIG5lYXJlc3Qgc3VibWVudS5cclxuXHRcdFx0JHRhcmdldCA9ICQoIGUudGFyZ2V0ICk7IC8vIHRoZSBlbGVtZW50IHRoYXQncyBhY3R1YWxseSBiZWluZyBjbGlja2VkIChjaGlsZCBvZiB0aGUgbGkgdGhhdCB0cmlnZ2VyZWQgdGhlIGNsaWNrIGV2ZW50KS5cclxuXHJcblx0XHQvLyBGaWd1cmUgb3V0IGlmIHdlJ3JlIGNsaWNraW5nIHRoZSBidXR0b24gb3IgaXRzIGFycm93IGNoaWxkLFxyXG5cdFx0Ly8gaWYgc28sIHdlIGNhbiBqdXN0IG9wZW4gb3IgY2xvc2UgdGhlIG1lbnUgYW5kIGJhaWwuXHJcblx0XHRpZiAoICR0YXJnZXQuaGFzQ2xhc3MoICdkb3duLWFycm93JyApIHx8ICR0YXJnZXQuaGFzQ2xhc3MoICdwYXJlbnQtaW5kaWNhdG9yJyApICkge1xyXG5cclxuXHRcdFx0Ly8gRmlyc3QsIGNvbGxhcHNlIGFueSBhbHJlYWR5IG9wZW5lZCBzdWJtZW51cy5cclxuXHRcdFx0YXBwLnNsaWRlT3V0U3ViTWVudXMoIGVsICk7XHJcblxyXG5cdFx0XHRpZiAoICEgc3ViTWVudS5oYXNDbGFzcyggJ2lzLXZpc2libGUnICkgKSB7XHJcblxyXG5cdFx0XHRcdC8vIE9wZW4gdGhlIHN1Ym1lbnUuXHJcblx0XHRcdFx0YXBwLm9wZW5TdWJtZW51KCBlbCwgc3ViTWVudSApO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHR9O1xyXG5cclxuXHQvLyBPcGVuIGEgc3VibWVudS5cclxuXHRhcHAub3BlblN1Ym1lbnUgPSBmdW5jdGlvbiggcGFyZW50LCBzdWJNZW51ICkge1xyXG5cclxuXHRcdC8vIEV4cGFuZCB0aGUgbGlzdCBtZW51IGl0ZW0sIGFuZCBzZXQgdGhlIGNvcnJlc3BvbmRpbmcgYnV0dG9uIGFyaWEgdG8gdHJ1ZS5cclxuXHRcdHBhcmVudC5hZGRDbGFzcyggJ2lzLXZpc2libGUnICkuZmluZCggJy5wYXJlbnQtaW5kaWNhdG9yJyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgdHJ1ZSApO1xyXG5cclxuXHRcdC8vIFNsaWRlIHRoZSBtZW51IGluLlxyXG5cdFx0c3ViTWVudS5hZGRDbGFzcyggJ2lzLXZpc2libGUgYW5pbWF0ZWQgc2xpZGVJbkxlZnQnICk7XHJcblx0fTtcclxuXHJcblx0Ly8gRm9yY2UgY2xvc2UgYWxsIHRoZSBzdWJtZW51cyB3aGVuIHRoZSBtYWluIG1lbnUgY29udGFpbmVyIGlzIGNsb3NlZC5cclxuXHRhcHAuZm9yY2VDbG9zZVN1Ym1lbnVzID0gZnVuY3Rpb24oIGV2ZW50ICkge1xyXG5cdFx0aWYgKCAkKCBldmVudC50YXJnZXQgKS5oYXNDbGFzcyggJ29mZi1jYW52YXMtY29udGFpbmVyJyApICkge1xyXG5cclxuXHRcdFx0Ly8gRm9jdXMgb2ZmY2FudmFzIG1lbnUgZm9yIGExMXkuXHJcblx0XHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIuZm9jdXMoKTtcclxuXHJcblx0XHRcdC8vIFRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50IHRyaWdnZXJzIG9uIG9wZW4gYW5kIG9uIGNsb3NlLCBuZWVkIHRvIG1ha2Ugc3VyZSB3ZSBvbmx5IGRvIHRoaXMgb24gY2xvc2UuXHJcblx0XHRcdGlmICggISAkKCB0aGlzICkuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICkge1xyXG5cdFx0XHRcdGFwcC4kYy5zdWJNZW51UGFyZW50SXRlbS5yZW1vdmVDbGFzcyggJ2lzLXZpc2libGUnICkuZmluZCggJy5wYXJlbnQtaW5kaWNhdG9yJyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKTtcclxuXHRcdFx0XHRhcHAuJGMuc3ViTWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcyggJ2lzLXZpc2libGUgc2xpZGVJbkxlZnQnICk7XHJcblx0XHRcdFx0YXBwLiRjLmJvZHkuY3NzKCAnb3ZlcmZsb3cnLCAndmlzaWJsZScgKTtcclxuXHRcdFx0XHRhcHAuJGMuYm9keS51bmJpbmQoICd0b3VjaHN0YXJ0JyApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoICQoIHRoaXMgKS5oYXNDbGFzcyggJ2lzLXZpc2libGUnICkgKSB7XHJcblx0XHRcdFx0YXBwLiRjLmJvZHkuY3NzKCAnb3ZlcmZsb3cnLCAnaGlkZGVuJyApO1xyXG5cdFx0XHRcdGFwcC4kYy5ib2R5LmJpbmQoICd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oIGUgKSB7XHJcblx0XHRcdFx0XHRpZiAoICEgJCggZS50YXJnZXQgKS5wYXJlbnRzKCAnLmNvbnRhY3QtbW9kYWwnIClbMF0gKSB7XHJcblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9ICk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBFbmdhZ2UhXHJcblx0JCggYXBwLmluaXQgKTtcclxuXHJcbn0oIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzTW9iaWxlTWVudSApICk7XHJcbiIsIi8qKlxyXG4gKiBGaWxlIG1vZGFsLmpzXHJcbiAqXHJcbiAqIERlYWwgd2l0aCBtdWx0aXBsZSBtb2RhbHMgYW5kIHRoZWlyIG1lZGlhLlxyXG4gKi9cclxud2luZG93Lndkc01vZGFsID0ge307XHJcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xyXG5cclxuXHRsZXQgJG1vZGFsVG9nZ2xlLFxyXG5cdFx0JGZvY3VzYWJsZUNoaWxkcmVuLFxyXG5cdFx0JHBsYXllcixcclxuXHRcdCR0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc2NyaXB0JyApLFxyXG5cdFx0JGZpcnN0U2NyaXB0VGFnID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdzY3JpcHQnIClbMF0sXHJcblx0XHRZVDtcclxuXHJcblx0Ly8gQ29uc3RydWN0b3IuXHJcblx0YXBwLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC5jYWNoZSgpO1xyXG5cclxuXHRcdGlmICggYXBwLm1lZXRzUmVxdWlyZW1lbnRzKCkgKSB7XHJcblx0XHRcdCRmaXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggJHRhZywgJGZpcnN0U2NyaXB0VGFnICk7XHJcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXHJcblx0YXBwLmNhY2hlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMgPSB7XHJcblx0XHRcdCdib2R5JzogJCggJ2JvZHknIClcclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0Ly8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xyXG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuICQoICcubW9kYWwtdHJpZ2dlcicgKS5sZW5ndGg7XHJcblx0fTtcclxuXHJcblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxyXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0Ly8gVHJpZ2dlciBhIG1vZGFsIHRvIG9wZW4uXHJcblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrJywgJy5tb2RhbC10cmlnZ2VyJywgYXBwLm9wZW5Nb2RhbCApO1xyXG5cclxuXHRcdC8vIFRyaWdnZXIgdGhlIGNsb3NlIGJ1dHRvbiB0byBjbG9zZSB0aGUgbW9kYWwuXHJcblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrJywgJy5jbG9zZScsIGFwcC5jbG9zZU1vZGFsICk7XHJcblxyXG5cdFx0Ly8gQWxsb3cgdGhlIHVzZXIgdG8gY2xvc2UgdGhlIG1vZGFsIGJ5IGhpdHRpbmcgdGhlIGVzYyBrZXkuXHJcblx0XHRhcHAuJGMuYm9keS5vbiggJ2tleWRvd24nLCBhcHAuZXNjS2V5Q2xvc2UgKTtcclxuXHJcblx0XHQvLyBBbGxvdyB0aGUgdXNlciB0byBjbG9zZSB0aGUgbW9kYWwgYnkgY2xpY2tpbmcgb3V0c2lkZSBvZiB0aGUgbW9kYWwuXHJcblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrJywgJ2Rpdi5tb2RhbC1vcGVuJywgYXBwLmNsb3NlTW9kYWxCeUNsaWNrICk7XHJcblxyXG5cdFx0Ly8gTGlzdGVuIHRvIHRhYnMsIHRyYXAga2V5Ym9hcmQgaWYgd2UgbmVlZCB0b1xyXG5cdFx0YXBwLiRjLmJvZHkub24oICdrZXlkb3duJywgYXBwLnRyYXBLZXlib2FyZE1heWJlICk7XHJcblxyXG5cdH07XHJcblxyXG5cdC8vIE9wZW4gdGhlIG1vZGFsLlxyXG5cdGFwcC5vcGVuTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHQvLyBTdG9yZSB0aGUgbW9kYWwgdG9nZ2xlIGVsZW1lbnRcclxuXHRcdCRtb2RhbFRvZ2dsZSA9ICQoIHRoaXMgKTtcclxuXHJcblx0XHQvLyBGaWd1cmUgb3V0IHdoaWNoIG1vZGFsIHdlJ3JlIG9wZW5pbmcgYW5kIHN0b3JlIHRoZSBvYmplY3QuXHJcblx0XHRsZXQgJG1vZGFsID0gJCggJCggdGhpcyApLmRhdGEoICd0YXJnZXQnICkgKTtcclxuXHJcblx0XHQvLyBEaXNwbGF5IHRoZSBtb2RhbC5cclxuXHRcdCRtb2RhbC5hZGRDbGFzcyggJ21vZGFsLW9wZW4nICk7XHJcblxyXG5cdFx0Ly8gQWRkIGJvZHkgY2xhc3MuXHJcblx0XHRhcHAuJGMuYm9keS5hZGRDbGFzcyggJ21vZGFsLW9wZW4nICk7XHJcblxyXG5cdFx0Ly8gRmluZCB0aGUgZm9jdXNhYmxlIGNoaWxkcmVuIG9mIHRoZSBtb2RhbC5cclxuXHRcdC8vIFRoaXMgbGlzdCBtYXkgYmUgaW5jb21wbGV0ZSwgcmVhbGx5IHdpc2ggalF1ZXJ5IGhhZCB0aGUgOmZvY3VzYWJsZSBwc2V1ZG8gbGlrZSBqUXVlcnkgVUkgZG9lcy5cclxuXHRcdC8vIEZvciBtb3JlIGFib3V0IDppbnB1dCBzZWU6IGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vaW5wdXQtc2VsZWN0b3IvXHJcblx0XHQkZm9jdXNhYmxlQ2hpbGRyZW4gPSAkbW9kYWwuZmluZCggJ2EsIDppbnB1dCwgW3RhYmluZGV4XScgKTtcclxuXHJcblx0XHQvLyBJZGVhbGx5LCB0aGVyZSBpcyBhbHdheXMgb25lICh0aGUgY2xvc2UgYnV0dG9uKSwgYnV0IHlvdSBuZXZlciBrbm93LlxyXG5cdFx0aWYgKCAwIDwgJGZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCApIHtcclxuXHJcblx0XHRcdC8vIFNoaWZ0IGZvY3VzIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudC5cclxuXHRcdFx0JGZvY3VzYWJsZUNoaWxkcmVuWzBdLmZvY3VzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHR9O1xyXG5cclxuXHQvLyBDbG9zZSB0aGUgbW9kYWwuXHJcblx0YXBwLmNsb3NlTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHQvLyBGaWd1cmUgdGhlIG9wZW5lZCBtb2RhbCB3ZSdyZSBjbG9zaW5nIGFuZCBzdG9yZSB0aGUgb2JqZWN0LlxyXG5cdFx0bGV0ICRtb2RhbCA9ICQoICQoICdkaXYubW9kYWwtb3BlbiAuY2xvc2UnICkuZGF0YSggJ3RhcmdldCcgKSApLFxyXG5cclxuXHRcdFx0Ly8gRmluZCB0aGUgaWZyYW1lIGluIHRoZSAkbW9kYWwgb2JqZWN0LlxyXG5cdFx0XHQkaWZyYW1lID0gJG1vZGFsLmZpbmQoICdpZnJhbWUnICk7XHJcblxyXG5cdFx0Ly8gT25seSBkbyB0aGlzIGlmIHRoZXJlIGFyZSBhbnkgaWZyYW1lcy5cclxuXHRcdGlmICggJGlmcmFtZS5sZW5ndGggKSB7XHJcblxyXG5cdFx0XHQvLyBHZXQgdGhlIGlmcmFtZSBzcmMgVVJMLlxyXG5cdFx0XHRsZXQgdXJsID0gJGlmcmFtZS5hdHRyKCAnc3JjJyApO1xyXG5cclxuXHRcdFx0Ly8gUmVtb3ZpbmcvUmVhZGRpbmcgdGhlIFVSTCB3aWxsIGVmZmVjdGl2ZWx5IGJyZWFrIHRoZSBZb3VUdWJlIEFQSS5cclxuXHRcdFx0Ly8gU28gbGV0J3Mgbm90IGRvIHRoYXQgd2hlbiB0aGUgaWZyYW1lIFVSTCBjb250YWlucyB0aGUgZW5hYmxlanNhcGkgcGFyYW1ldGVyLlxyXG5cdFx0XHRpZiAoICEgdXJsLmluY2x1ZGVzKCAnZW5hYmxlanNhcGk9MScgKSApIHtcclxuXHJcblx0XHRcdFx0Ly8gUmVtb3ZlIHRoZSBzb3VyY2UgVVJMLCB0aGVuIGFkZCBpdCBiYWNrLCBzbyB0aGUgdmlkZW8gY2FuIGJlIHBsYXllZCBhZ2FpbiBsYXRlci5cclxuXHRcdFx0XHQkaWZyYW1lLmF0dHIoICdzcmMnLCAnJyApLmF0dHIoICdzcmMnLCB1cmwgKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0Ly8gVXNlIHRoZSBZb3VUdWJlIEFQSSB0byBzdG9wIHRoZSB2aWRlby5cclxuXHRcdFx0XHQkcGxheWVyLnN0b3BWaWRlbygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmluYWxseSwgaGlkZSB0aGUgbW9kYWwuXHJcblx0XHQkbW9kYWwucmVtb3ZlQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xyXG5cclxuXHRcdC8vIFJlbW92ZSB0aGUgYm9keSBjbGFzcy5cclxuXHRcdGFwcC4kYy5ib2R5LnJlbW92ZUNsYXNzKCAnbW9kYWwtb3BlbicgKTtcclxuXHJcblx0XHQvLyBSZXZlcnQgZm9jdXMgYmFjayB0byB0b2dnbGUgZWxlbWVudFxyXG5cdFx0JG1vZGFsVG9nZ2xlLmZvY3VzKCk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHR9O1xyXG5cclxuXHQvLyBDbG9zZSBpZiBcImVzY1wiIGtleSBpcyBwcmVzc2VkLlxyXG5cdGFwcC5lc2NLZXlDbG9zZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHJcblx0XHRpZiAoICEgYXBwLiRjLmJvZHkuaGFzQ2xhc3MoICdtb2RhbC1vcGVuJyApICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCAyNyA9PT0gZXZlbnQua2V5Q29kZSApIHtcclxuXHRcdFx0YXBwLmNsb3NlTW9kYWwoKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBDbG9zZSBpZiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBvZiB0aGUgbW9kYWxcclxuXHRhcHAuY2xvc2VNb2RhbEJ5Q2xpY2sgPSBmdW5jdGlvbiggZXZlbnQgKSB7XHJcblxyXG5cdFx0Ly8gSWYgdGhlIHBhcmVudCBjb250YWluZXIgaXMgTk9UIHRoZSBtb2RhbCBkaWFsb2cgY29udGFpbmVyLCBjbG9zZSB0aGUgbW9kYWxcclxuXHRcdGlmICggISAkKCBldmVudC50YXJnZXQgKS5wYXJlbnRzKCAnZGl2JyApLmhhc0NsYXNzKCAnbW9kYWwtZGlhbG9nJyApICkge1xyXG5cdFx0XHRhcHAuY2xvc2VNb2RhbCgpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIFRyYXAgdGhlIGtleWJvYXJkIGludG8gYSBtb2RhbCB3aGVuIG9uZSBpcyBhY3RpdmUuXHJcblx0YXBwLnRyYXBLZXlib2FyZE1heWJlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xyXG5cclxuXHRcdC8vIFdlIG9ubHkgbmVlZCB0byBkbyBzdHVmZiB3aGVuIHRoZSBtb2RhbCBpcyBvcGVuIGFuZCB0YWIgaXMgcHJlc3NlZC5cclxuXHRcdGlmICggOSA9PT0gZXZlbnQud2hpY2ggJiYgMCA8ICQoICcubW9kYWwtb3BlbicgKS5sZW5ndGggKSB7XHJcblx0XHRcdGxldCAkZm9jdXNlZCA9ICQoICc6Zm9jdXMnICksXHJcblx0XHRcdFx0Zm9jdXNJbmRleCA9ICRmb2N1c2FibGVDaGlsZHJlbi5pbmRleCggJGZvY3VzZWQgKTtcclxuXHJcblx0XHRcdGlmICggMCA9PT0gZm9jdXNJbmRleCAmJiBldmVudC5zaGlmdEtleSApIHtcclxuXHJcblx0XHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQsIGFuZCBzaGlmdCBpcyBoZWxkIHdoZW4gcHJlc3NpbmcgdGFiLCBnbyBiYWNrIHRvIGxhc3QgZm9jdXNhYmxlIGVsZW1lbnQuXHJcblx0XHRcdFx0JGZvY3VzYWJsZUNoaWxkcmVuWyAkZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoIC0gMSBdLmZvY3VzKCk7XHJcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0fSBlbHNlIGlmICggISBldmVudC5zaGlmdEtleSAmJiBmb2N1c0luZGV4ID09PSAkZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoIC0gMSApIHtcclxuXHJcblx0XHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgbGFzdCBmb2N1c2FibGUgZWxlbWVudCwgYW5kIHNoaWZ0IGlzIG5vdCBoZWxkLCBnbyBiYWNrIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudC5cclxuXHRcdFx0XHQkZm9jdXNhYmxlQ2hpbGRyZW5bMF0uZm9jdXMoKTtcclxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gSG9vayBpbnRvIFlvdVR1YmUgPGlmcmFtZT4uXHJcblx0YXBwLm9uWW91VHViZUlmcmFtZUFQSVJlYWR5ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRsZXQgJG1vZGFsID0gJCggJ2Rpdi5tb2RhbCcgKSxcclxuXHRcdFx0JGlmcmFtZWlkID0gJG1vZGFsLmZpbmQoICdpZnJhbWUnICkuYXR0ciggJ2lkJyApO1xyXG5cclxuXHRcdCRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCAkaWZyYW1laWQsIHtcclxuXHRcdFx0ZXZlbnRzOiB7XHJcblx0XHRcdFx0J29uUmVhZHknOiBhcHAub25QbGF5ZXJSZWFkeSxcclxuXHRcdFx0XHQnb25TdGF0ZUNoYW5nZSc6IGFwcC5vblBsYXllclN0YXRlQ2hhbmdlXHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHR9O1xyXG5cclxuXHQvLyBEbyBzb21ldGhpbmcgb24gcGxheWVyIHJlYWR5LlxyXG5cdGFwcC5vblBsYXllclJlYWR5ID0gZnVuY3Rpb24oKSB7XHJcblx0fTtcclxuXHJcblx0Ly8gRG8gc29tZXRoaW5nIG9uIHBsYXllciBzdGF0ZSBjaGFuZ2UuXHJcblx0YXBwLm9uUGxheWVyU3RhdGVDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHQvLyBTZXQgZm9jdXMgdG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IGluc2lkZSBvZiB0aGUgbW9kYWwgdGhlIHBsYXllciBpcyBpbi5cclxuXHRcdCQoIGV2ZW50LnRhcmdldC5hICkucGFyZW50cyggJy5tb2RhbCcgKS5maW5kKCAnYSwgOmlucHV0LCBbdGFiaW5kZXhdJyApLmZpcnN0KCkuZm9jdXMoKTtcclxuXHR9O1xyXG5cclxuXHJcblx0Ly8gRW5nYWdlIVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcbn0oIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzTW9kYWwgKSApO1xyXG4iLCIvKipcclxuICogRmlsZTogbmF2aWdhdGlvbi1wcmltYXJ5LmpzXHJcbiAqXHJcbiAqIEhlbHBlcnMgZm9yIHRoZSBwcmltYXJ5IG5hdmlnYXRpb24uXHJcbiAqL1xyXG53aW5kb3cud2RzUHJpbWFyeU5hdmlnYXRpb24gPSB7fTtcclxuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XHJcblxyXG5cdC8vIENvbnN0cnVjdG9yLlxyXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuY2FjaGUoKTtcclxuXHJcblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xyXG5cdFx0XHRhcHAuYmluZEV2ZW50cygpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzLlxyXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjID0ge1xyXG5cdFx0XHR3aW5kb3c6ICQoIHdpbmRvdyApLFxyXG5cdFx0XHRzdWJNZW51Q29udGFpbmVyOiAkKCAnLm1haW4tbmF2aWdhdGlvbiAuc3ViLW1lbnUnICksXHJcblx0XHRcdHN1Yk1lbnVQYXJlbnRJdGVtOiAkKCAnLm1haW4tbmF2aWdhdGlvbiBsaS5tZW51LWl0ZW0taGFzLWNoaWxkcmVuJyApXHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdC8vIENvbWJpbmUgYWxsIGV2ZW50cy5cclxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjLndpbmRvdy5vbiggJ2xvYWQnLCBhcHAuYWRkRG93bkFycm93ICk7XHJcblx0XHRhcHAuJGMuc3ViTWVudVBhcmVudEl0ZW0uZmluZCggJ2EnICkub24oICdmb2N1c2luIGZvY3Vzb3V0JywgYXBwLnRvZ2dsZUZvY3VzICk7XHJcblx0fTtcclxuXHJcblx0Ly8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xyXG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIGFwcC4kYy5zdWJNZW51Q29udGFpbmVyLmxlbmd0aDtcclxuXHR9O1xyXG5cclxuXHQvLyBBZGQgdGhlIGRvd24gYXJyb3cgdG8gc3VibWVudSBwYXJlbnRzLlxyXG5cdGFwcC5hZGREb3duQXJyb3cgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy5zdWJNZW51UGFyZW50SXRlbS5maW5kKCAnPiBhJyApLmFwcGVuZCggJzxzcGFuIGNsYXNzPVwiY2FyZXQtZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj4nICk7XHJcblx0fTtcclxuXHJcblx0Ly8gVG9nZ2xlIHRoZSBmb2N1cyBjbGFzcyBvbiB0aGUgbGluayBwYXJlbnQuXHJcblx0YXBwLnRvZ2dsZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcblx0XHQkKCB0aGlzICkucGFyZW50cyggJ2xpLm1lbnUtaXRlbS1oYXMtY2hpbGRyZW4nICkudG9nZ2xlQ2xhc3MoICdmb2N1cycgKTtcclxuXHR9O1xyXG5cclxuXHQvLyBFbmdhZ2UhXHJcblx0JCggYXBwLmluaXQgKTtcclxuXHJcbn0oIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzUHJpbWFyeU5hdmlnYXRpb24gKSApO1xyXG4iLCIvKipcclxuICogRmlsZTogb2ZmLWNhbnZhcy5qc1xyXG4gKlxyXG4gKiBIZWxwIGRlYWwgd2l0aCB0aGUgb2ZmLWNhbnZhcyBtb2JpbGUgbWVudS5cclxuICovXHJcbndpbmRvdy53ZHNvZmZDYW52YXMgPSB7fTtcclxuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XHJcblxyXG5cdC8vIENvbnN0cnVjdG9yLlxyXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuY2FjaGUoKTtcclxuXHJcblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xyXG5cdFx0XHRhcHAuYmluZEV2ZW50cygpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzLlxyXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjID0ge1xyXG5cdFx0XHRib2R5OiAkKCAnYm9keScgKSxcclxuXHRcdFx0b2ZmQ2FudmFzQ2xvc2U6ICQoICcub2ZmLWNhbnZhcy1jbG9zZScgKSxcclxuXHRcdFx0b2ZmQ2FudmFzQ29udGFpbmVyOiAkKCAnLm9mZi1jYW52YXMtY29udGFpbmVyJyApLFxyXG5cdFx0XHRvZmZDYW52YXNPcGVuOiAkKCAnLm9mZi1jYW52YXMtb3BlbicgKSxcclxuXHRcdFx0b2ZmQ2FudmFzU2NyZWVuOiAkKCAnLm9mZi1jYW52YXMtc2NyZWVuJyApXHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdC8vIENvbWJpbmUgYWxsIGV2ZW50cy5cclxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjLmJvZHkub24oICdrZXlkb3duJywgYXBwLmVzY0tleUNsb3NlICk7XHJcblx0XHRhcHAuJGMub2ZmQ2FudmFzQ2xvc2Uub24oICdjbGljaycsIGFwcC5jbG9zZW9mZkNhbnZhcyApO1xyXG5cdFx0YXBwLiRjLm9mZkNhbnZhc09wZW4ub24oICdjbGljaycsIGFwcC50b2dnbGVvZmZDYW52YXMgKTtcclxuXHRcdGFwcC4kYy5vZmZDYW52YXNTY3JlZW4ub24oICdjbGljaycsIGFwcC5jbG9zZW9mZkNhbnZhcyApO1xyXG5cdH07XHJcblxyXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cclxuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBhcHAuJGMub2ZmQ2FudmFzQ29udGFpbmVyLmxlbmd0aDtcclxuXHR9O1xyXG5cclxuXHQvLyBUbyBzaG93IG9yIG5vdCB0byBzaG93P1xyXG5cdGFwcC50b2dnbGVvZmZDYW52YXMgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRpZiAoICd0cnVlJyA9PT0gJCggdGhpcyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJyApICkge1xyXG5cdFx0XHRhcHAuY2xvc2VvZmZDYW52YXMoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFwcC5vcGVub2ZmQ2FudmFzKCk7XHJcblx0XHR9XHJcblxyXG5cdH07XHJcblxyXG5cdC8vIFNob3cgdGhhdCBkcmF3ZXIhXHJcblx0YXBwLm9wZW5vZmZDYW52YXMgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIuYWRkQ2xhc3MoICdpcy12aXNpYmxlJyApO1xyXG5cdFx0YXBwLiRjLm9mZkNhbnZhc09wZW4uYWRkQ2xhc3MoICdpcy12aXNpYmxlJyApO1xyXG5cdFx0YXBwLiRjLm9mZkNhbnZhc1NjcmVlbi5hZGRDbGFzcyggJ2lzLXZpc2libGUnICk7XHJcblxyXG5cdFx0YXBwLiRjLm9mZkNhbnZhc09wZW4uYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCB0cnVlICk7XHJcblx0XHRhcHAuJGMub2ZmQ2FudmFzQ29udGFpbmVyLmF0dHIoICdhcmlhLWhpZGRlbicsIGZhbHNlICk7XHJcblx0fTtcclxuXHJcblx0Ly8gQ2xvc2UgdGhhdCBkcmF3ZXIhXHJcblx0YXBwLmNsb3Nlb2ZmQ2FudmFzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMub2ZmQ2FudmFzQ29udGFpbmVyLnJlbW92ZUNsYXNzKCAnaXMtdmlzaWJsZScgKTtcclxuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLnJlbW92ZUNsYXNzKCAnaXMtdmlzaWJsZScgKTtcclxuXHRcdGFwcC4kYy5vZmZDYW52YXNTY3JlZW4ucmVtb3ZlQ2xhc3MoICdpcy12aXNpYmxlJyApO1xyXG5cclxuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKTtcclxuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIuYXR0ciggJ2FyaWEtaGlkZGVuJywgdHJ1ZSApO1xyXG5cclxuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLmZvY3VzKCk7XHJcblx0fTtcclxuXHJcblx0Ly8gQ2xvc2UgZHJhd2VyIGlmIFwiZXNjXCIga2V5IGlzIHByZXNzZWQuXHJcblx0YXBwLmVzY0tleUNsb3NlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xyXG5cdFx0aWYgKCAyNyA9PT0gZXZlbnQua2V5Q29kZSApIHtcclxuXHRcdFx0YXBwLmNsb3Nlb2ZmQ2FudmFzKCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gRW5nYWdlIVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcblxyXG59KCB3aW5kb3csIGpRdWVyeSwgd2luZG93Lndkc29mZkNhbnZhcyApICk7XHJcbiIsIi8qKlxyXG4gKiBGaWxlIHNraXAtbGluay1mb2N1cy1maXguanMuXHJcbiAqXHJcbiAqIEhlbHBzIHdpdGggYWNjZXNzaWJpbGl0eSBmb3Iga2V5Ym9hcmQgb25seSB1c2Vycy5cclxuICpcclxuICogTGVhcm4gbW9yZTogaHR0cHM6Ly9naXQuaW8vdldkcjJcclxuICovXHJcbiggZnVuY3Rpb24oKSB7XHJcblx0dmFyIGlzV2Via2l0ID0gLTEgPCBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ3dlYmtpdCcgKSxcclxuXHRcdGlzT3BlcmEgPSAtMSA8IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnb3BlcmEnICksXHJcblx0XHRpc0llID0gLTEgPCBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ21zaWUnICk7XHJcblxyXG5cdGlmICggKCBpc1dlYmtpdCB8fCBpc09wZXJhIHx8IGlzSWUgKSAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciApIHtcclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnaGFzaGNoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgaWQgPSBsb2NhdGlvbi5oYXNoLnN1YnN0cmluZyggMSApLFxyXG5cdFx0XHRcdGVsZW1lbnQ7XHJcblxyXG5cdFx0XHRpZiAoICEgKCAvXltBLXowLTlfLV0rJC8gKS50ZXN0KCBpZCApICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBpZCApO1xyXG5cclxuXHRcdFx0aWYgKCBlbGVtZW50ICkge1xyXG5cdFx0XHRcdGlmICggISAoIC9eKD86YXxzZWxlY3R8aW5wdXR8YnV0dG9ufHRleHRhcmVhKSQvaSApLnRlc3QoIGVsZW1lbnQudGFnTmFtZSApICkge1xyXG5cdFx0XHRcdFx0ZWxlbWVudC50YWJJbmRleCA9IC0xO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZWxlbWVudC5mb2N1cygpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCBmYWxzZSApO1xyXG5cdH1cclxufSgpICk7XHJcbiIsIi8qKlxyXG4gKiBNYWtlIHRhYmxlcyByZXNwb25zaXZlIGFnYWluLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEhhcmlzIFp1bGZpcWFyXHJcbiAqL1xyXG53aW5kb3cud2RzVGFibGVzID0ge307XHJcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xyXG5cclxuXHQvLyBDb25zdHJ1Y3RvclxyXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuY2FjaGUoKTtcclxuXHJcblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xyXG5cdFx0XHRhcHAuYmluZEV2ZW50cygpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzXHJcblx0YXBwLmNhY2hlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMgPSB7XHJcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXHJcblx0XHRcdHRhYmxlOiAkKCAndGFibGUnIClcclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzXHJcblx0YXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy53aW5kb3cub24oICdsb2FkJywgYXBwLmFkZERhdGFMYWJlbCApO1xyXG5cdH07XHJcblxyXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cclxuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBhcHAuJGMudGFibGUubGVuZ3RoO1xyXG5cdH07XHJcblxyXG5cdC8vIEFkZHMgZGF0YS1sYWJlbCB0byB0ZCBiYXNlZCBvbiB0aC5cclxuXHRhcHAuYWRkRGF0YUxhYmVsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRjb25zdCB0YWJsZSA9IGFwcC4kYy50YWJsZTtcclxuXHRcdGNvbnN0IHRhYmxlSGVhZGVycyA9IHRhYmxlLmZpbmQoICd0aGVhZCB0aCcgKTtcclxuXHRcdGNvbnN0IHRhYmxlUm93ID0gdGFibGUuZmluZCggJ3Rib2R5IHRyJyApO1xyXG5cclxuXHRcdHRhYmxlUm93LmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjb25zdCB0ZCA9ICQoIHRoaXMgKS5maW5kKCAndGQnICk7XHJcblxyXG5cdFx0XHR0ZC5lYWNoKCBmdW5jdGlvbiggaW5kZXggKSB7XHJcblx0XHRcdFx0aWYgKCAkKCB0YWJsZUhlYWRlcnMuZ2V0KCBpbmRleCApICkgKSB7XHJcblx0XHRcdFx0XHQkKCB0aGlzICkuYXR0ciggJ2RhdGEtbGFiZWwnLCAkKCB0YWJsZUhlYWRlcnMuZ2V0KCBpbmRleCApICkudGV4dCgpICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ICk7XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH07XHJcblxyXG5cdC8vIEVuZ2FnZVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcblxyXG59ICggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNUYWJsZXMgKSApO1xyXG4iLCIvKipcclxuICogVmlkZW8gUGxheWJhY2sgU2NyaXB0LlxyXG4gKi9cclxud2luZG93LldEU1ZpZGVvQmFja2dyb3VuZE9iamVjdCA9IHt9O1xyXG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcclxuXHJcblx0Ly8gQ29uc3RydWN0b3IuXHJcblx0YXBwLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC5jYWNoZSgpO1xyXG5cclxuXHRcdGlmICggYXBwLm1lZXRzUmVxdWlyZW1lbnRzKCkgKSB7XHJcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXHJcblx0YXBwLmNhY2hlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHAuJGMgPSB7XHJcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXHJcblx0XHRcdHZpZGVvQnV0dG9uOiAkKCAnLnZpZGVvLXRvZ2dsZScgKVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvLyBDb21iaW5lIGFsbCBldmVudHMuXHJcblx0YXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy52aWRlb0J1dHRvbi5vbiggJ2NsaWNrJywgYXBwLmRvVG9nZ2xlUGxheWJhY2sgKTtcclxuXHR9O1xyXG5cclxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XHJcblx0YXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gYXBwLiRjLnZpZGVvQnV0dG9uLmxlbmd0aDtcclxuXHR9O1xyXG5cclxuXHQvLyBWaWRlbyBQbGF5YmFjay5cclxuXHRhcHAuZG9Ub2dnbGVQbGF5YmFjayA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0JCggdGhpcyApLnBhcmVudHMoICcuY29udGVudC1ibG9jaycgKS50b2dnbGVDbGFzcyggJ3ZpZGVvLXRvZ2dsZWQnICk7XHJcblxyXG5cdFx0aWYgKCAkKCB0aGlzICkucGFyZW50cyggJy5jb250ZW50LWJsb2NrJyApLmhhc0NsYXNzKCAndmlkZW8tdG9nZ2xlZCcgKSApIHtcclxuXHRcdFx0JCggdGhpcyApLnNpYmxpbmdzKCAnLnZpZGVvLWJhY2tncm91bmQnICkudHJpZ2dlciggJ3BhdXNlJyApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JCggdGhpcyApLnNpYmxpbmdzKCAnLnZpZGVvLWJhY2tncm91bmQnICkudHJpZ2dlciggJ3BsYXknICk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gRW5nYWdlIVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcblxyXG59KCB3aW5kb3csIGpRdWVyeSwgd2luZG93LldEU1ZpZGVvQmFja2dyb3VuZE9iamVjdCApICk7XHJcbiIsIi8qKlxyXG4gKiBGaWxlIHdpbmRvdy1yZWFkeS5qc1xyXG4gKlxyXG4gKiBBZGQgYSBcInJlYWR5XCIgY2xhc3MgdG8gPGJvZHk+IHdoZW4gd2luZG93IGlzIHJlYWR5LlxyXG4gKi9cclxud2luZG93Lndkc1dpbmRvd1JlYWR5ID0ge307XHJcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xyXG5cclxuXHQvLyBDb25zdHJ1Y3Rvci5cclxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLmNhY2hlKCk7XHJcblx0XHRhcHAuYmluZEV2ZW50cygpO1xyXG5cdH07XHJcblxyXG5cdC8vIENhY2hlIGRvY3VtZW50IGVsZW1lbnRzLlxyXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjID0ge1xyXG5cdFx0XHQnd2luZG93JzogJCggd2luZG93ICksXHJcblx0XHRcdCdib2R5JzogJCggZG9jdW1lbnQuYm9keSApXHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdC8vIENvbWJpbmUgYWxsIGV2ZW50cy5cclxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwLiRjLndpbmRvdy5sb2FkKCBhcHAuYWRkQm9keUNsYXNzICk7XHJcblx0fTtcclxuXHJcblx0Ly8gQWRkIGEgY2xhc3MgdG8gPGJvZHk+LlxyXG5cdGFwcC5hZGRCb2R5Q2xhc3MgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcC4kYy5ib2R5LmFkZENsYXNzKCAncmVhZHknICk7XHJcblx0fTtcclxuXHJcblx0Ly8gRW5nYWdlIVxyXG5cdCQoIGFwcC5pbml0ICk7XHJcbn0oIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzV2luZG93UmVhZHkgKSApO1xyXG4iXX0=
