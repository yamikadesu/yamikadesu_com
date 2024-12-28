(function() {

	// Main.
		var	on = addEventListener,
			off = removeEventListener,
			$ = function(q) { return document.querySelector(q) },
			$$ = function(q) { return document.querySelectorAll(q) },
			$body = document.body,
			$inner = $('.inner'),
			client = (function() {
		
				var o = {
						browser: 'other',
						browserVersion: 0,
						os: 'other',
						osVersion: 0,
						mobile: false,
						canUse: null,
						flags: {
							lsdUnits: false,
						},
					},
					ua = navigator.userAgent,
					a, i;
		
				// browser, browserVersion.
					a = [
						[
							'firefox',
							/Firefox\/([0-9\.]+)/
						],
						[
							'edge',
							/Edge\/([0-9\.]+)/
						],
						[
							'safari',
							/Version\/([0-9\.]+).+Safari/
						],
						[
							'chrome',
							/Chrome\/([0-9\.]+)/
						],
						[
							'chrome',
							/CriOS\/([0-9\.]+)/
						],
						[
							'ie',
							/Trident\/.+rv:([0-9]+)/
						]
					];
		
					for (i=0; i < a.length; i++) {
		
						if (ua.match(a[i][1])) {
		
							o.browser = a[i][0];
							o.browserVersion = parseFloat(RegExp.$1);
		
							break;
		
						}
		
					}
		
				// os, osVersion.
					a = [
						[
							'ios',
							/([0-9_]+) like Mac OS X/,
							function(v) { return v.replace('_', '.').replace('_', ''); }
						],
						[
							'ios',
							/CPU like Mac OS X/,
							function(v) { return 0 }
						],
						[
							'ios',
							/iPad; CPU/,
							function(v) { return 0 }
						],
						[
							'android',
							/Android ([0-9\.]+)/,
							null
						],
						[
							'mac',
							/Macintosh.+Mac OS X ([0-9_]+)/,
							function(v) { return v.replace('_', '.').replace('_', ''); }
						],
						[
							'windows',
							/Windows NT ([0-9\.]+)/,
							null
						],
						[
							'undefined',
							/Undefined/,
							null
						]
					];
		
					for (i=0; i < a.length; i++) {
		
						if (ua.match(a[i][1])) {
		
							o.os = a[i][0];
							o.osVersion = parseFloat( a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1 );
		
							break;
		
						}
		
					}
		
					// Hack: Detect iPads running iPadOS.
						if (o.os == 'mac'
						&&	('ontouchstart' in window)
						&&	(
		
							// 12.9"
								(screen.width == 1024 && screen.height == 1366)
							// 10.2"
								||	(screen.width == 834 && screen.height == 1112)
							// 9.7"
								||	(screen.width == 810 && screen.height == 1080)
							// Legacy
								||	(screen.width == 768 && screen.height == 1024)
		
						))
							o.os = 'ios';
		
				// mobile.
					o.mobile = (o.os == 'android' || o.os == 'ios');
		
				// canUse.
					var _canUse = document.createElement('div');
		
					o.canUse = function(property, value) {
		
						var style;
		
						// Get style.
							style = _canUse.style;
		
						// Property doesn't exist? Can't use it.
							if (!(property in style))
								return false;
		
						// Value provided?
							if (typeof value !== 'undefined') {
		
								// Assign value.
									style[property] = value;
		
								// Value is empty? Can't use it.
									if (style[property] == '')
										return false;
		
							}
		
						return true;
		
					};
		
				// flags.
					o.flags.lsdUnits = o.canUse('width', '100dvw');
		
				return o;
		
			}()),
			trigger = function(t) {
				dispatchEvent(new Event(t));
			},
			cssRules = function(selectorText) {
		
				var ss = document.styleSheets,
					a = [],
					f = function(s) {
		
						var r = s.cssRules,
							i;
		
						for (i=0; i < r.length; i++) {
		
							if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches)
								(f)(r[i]);
							else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText)
								a.push(r[i]);
		
						}
		
					},
					x, i;
		
				for (i=0; i < ss.length; i++)
					f(ss[i]);
		
				return a;
		
			},
			thisHash = function() {
		
				var h = location.hash ? location.hash.substring(1) : null,
					a;
		
				// Null? Bail.
					if (!h)
						return null;
		
				// Query string? Move before hash.
					if (h.match(/\?/)) {
		
						// Split from hash.
							a = h.split('?');
							h = a[0];
		
						// Update hash.
							history.replaceState(undefined, undefined, '#' + h);
		
						// Update search.
							window.location.search = a[1];
		
					}
		
				// Prefix with "x" if not a letter.
					if (h.length > 0
					&&	!h.match(/^[a-zA-Z]/))
						h = 'x' + h;
		
				// Convert to lowercase.
					if (typeof h == 'string')
						h = h.toLowerCase();
		
				return h;
		
			},
			scrollToElement = function(e, style, duration) {
		
				var y, cy, dy,
					start, easing, offset, f;
		
				// Element.
		
					// No element? Assume top of page.
						if (!e)
							y = 0;
		
					// Otherwise ...
						else {
		
							offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
		
							switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
		
								case 'default':
								default:
		
									y = e.offsetTop + offset;
		
									break;
		
								case 'center':
		
									if (e.offsetHeight < window.innerHeight)
										y = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset;
									else
										y = e.offsetTop - offset;
		
									break;
		
								case 'previous':
		
									if (e.previousElementSibling)
										y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
									else
										y = e.offsetTop + offset;
		
									break;
		
							}
		
						}
		
				// Style.
					if (!style)
						style = 'smooth';
		
				// Duration.
					if (!duration)
						duration = 750;
		
				// Instant? Just scroll.
					if (style == 'instant') {
		
						window.scrollTo(0, y);
						return;
		
					}
		
				// Get start, current Y.
					start = Date.now();
					cy = window.scrollY;
					dy = y - cy;
		
				// Set easing.
					switch (style) {
		
						case 'linear':
							easing = function (t) { return t };
							break;
		
						case 'smooth':
							easing = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 };
							break;
		
					}
		
				// Scroll.
					f = function() {
		
						var t = Date.now() - start;
		
						// Hit duration? Scroll to y and finish.
							if (t >= duration)
								window.scroll(0, y);
		
						// Otherwise ...
							else {
		
								// Scroll.
									window.scroll(0, cy + (dy * easing(t / duration)));
		
								// Repeat.
									requestAnimationFrame(f);
		
							}
		
					};
		
					f();
		
			},
			scrollToTop = function() {
		
				// Scroll to top.
					scrollToElement(null);
		
			},
			loadElements = function(parent) {
		
				var a, e, x, i;
		
				// IFRAMEs.
		
					// Get list of unloaded IFRAMEs.
						a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
		
					// Step through list.
						for (i=0; i < a.length; i++) {
		
							// Load.
								a[i].contentWindow.location.replace(a[i].dataset.src);
		
							// Save initial src.
								a[i].dataset.initialSrc = a[i].dataset.src;
		
							// Mark as loaded.
								a[i].dataset.src = '';
		
						}
		
				// Video.
		
					// Get list of videos (autoplay).
						a = parent.querySelectorAll('video[autoplay]');
		
					// Step through list.
						for (i=0; i < a.length; i++) {
		
							// Play if paused.
								if (a[i].paused)
									a[i].play();
		
						}
		
				// Autofocus.
		
					// Get first element with data-autofocus attribute.
						e = parent.querySelector('[data-autofocus="1"]');
		
					// Determine type.
						x = e ? e.tagName : null;
		
						switch (x) {
		
							case 'FORM':
		
								// Get first input.
									e = e.querySelector('.field input, .field select, .field textarea');
		
								// Found? Focus.
									if (e)
										e.focus();
		
								break;
		
							default:
								break;
		
						}
		
				// Deferred script tags.
		
					// Get list of deferred script tags.
						a = parent.querySelectorAll('deferred-script');
		
					// Step through list.
						for (i=0; i < a.length; i++) {
		
							// Create replacement script tag.
								x = document.createElement('script');
		
							// Set deferred data attribute (so we can unload this element later).
								x.setAttribute('data-deferred', '');
		
							// Set "src" attribute (if present).
								if (a[i].getAttribute('src'))
									x.setAttribute('src', a[i].getAttribute('src'));
		
							// Set text content (if present).
								if (a[i].textContent)
									x.textContent = a[i].textContent;
		
							// Replace.
								a[i].replaceWith(x);
		
						}
		
			},
			unloadElements = function(parent) {
		
				var a, e, x, i;
		
				// IFRAMEs.
		
					// Get list of loaded IFRAMEs.
						a = parent.querySelectorAll('iframe[data-src=""]');
		
					// Step through list.
						for (i=0; i < a.length; i++) {
		
							// Don't unload? Skip.
								if (a[i].dataset.srcUnload === '0')
									continue;
		
							// Mark as unloaded.
		
								// IFRAME was previously loaded by loadElements()? Use initialSrc.
									if ('initialSrc' in a[i].dataset)
										a[i].dataset.src = a[i].dataset.initialSrc;
		
								// Otherwise, just use src.
									else
										a[i].dataset.src = a[i].src;
		
							// Unload.
								a[i].contentWindow.location.replace('about:blank');
		
						}
		
				// Video.
		
					// Get list of videos.
						a = parent.querySelectorAll('video');
		
					// Step through list.
						for (i=0; i < a.length; i++) {
		
							// Pause if playing.
								if (!a[i].paused)
									a[i].pause();
		
						}
		
				// Autofocus.
		
					// Get focused element.
						e = $(':focus');
		
					// Found? Blur.
						if (e)
							e.blur();
		
				// Deferred script tags.
				// NOTE: Disabled for now. May want to bring this back later.
				/*
		
					// Get list of (previously deferred) script tags.
						a = parent.querySelectorAll('script[data-deferred]');
		
					// Step through list.
						for (i=0; i < a.length; i++) {
		
							// Create replacement deferred-script tag.
								x = document.createElement('deferred-script');
		
							// Set "src" attribute (if present).
								if (a[i].getAttribute('src'))
									x.setAttribute('src', a[i].getAttribute('src'));
		
							// Set text content (if present).
								if (a[i].textContent)
									x.textContent = a[i].textContent;
		
							// Replace.
								a[i].replaceWith(x);
		
						}
		
				*/
		
			};
		
			// Expose scrollToElement.
				window._scrollToTop = scrollToTop;
	
	// "On Load" animation.
		// Create load handler.
			var loadHandler = function() {
				setTimeout(function() {
		
					// Unmark as loading.
						$body.classList.remove('is-loading');
		
					// Mark as playing.
						$body.classList.add('is-playing');
		
					// Wait for animation complete.
						setTimeout(function() {
		
							// Unmark as playing.
								$body.classList.remove('is-playing');
		
							// Mark as ready.
								$body.classList.add('is-ready');
		
						}, 1000);
		
				}, 100);
			};
		
		// Load event.
			on('load', loadHandler);
	
	// Sections.
		(function() {
		
			var initialSection, initialScrollPoint, initialId,
				header, footer, name, hideHeader, hideFooter, disableAutoScroll,
				h, e, ee, k,
				locked = false,
				scrollPointParent = function(target) {
		
					while (target) {
		
						if (target.parentElement
						&&	target.parentElement.tagName == 'SECTION')
							break;
		
						target = target.parentElement;
		
					}
		
					return target;
		
				},
				scrollPointSpeed = function(scrollPoint) {
		
					let x = parseInt(scrollPoint.dataset.scrollSpeed);
		
					switch (x) {
		
						case 5:
							return 250;
		
						case 4:
							return 500;
		
						case 3:
							return 750;
		
						case 2:
							return 1000;
		
						case 1:
							return 1250;
		
						default:
							break;
		
					}
		
					return 750;
		
				},
				doNextScrollPoint = function(event) {
		
					var e, target, id;
		
					// Determine parent element.
						e = scrollPointParent(event.target);
		
						if (!e)
							return;
		
					// Find next scroll point.
						while (e && e.nextElementSibling) {
		
							e = e.nextElementSibling;
		
							if (e.dataset.scrollId) {
		
								target = e;
								id = e.dataset.scrollId;
								break;
		
							}
		
						}
		
						if (!target
						||	!id)
							return;
		
					// Redirect.
						if (target.dataset.scrollInvisible == '1')
							scrollToElement(target, 'smooth', scrollPointSpeed(target));
						else
							location.href = '#' + id;
		
				},
				doPreviousScrollPoint = function(e) {
		
					var e, target, id;
		
					// Determine parent element.
						e = scrollPointParent(event.target);
		
						if (!e)
							return;
		
					// Find previous scroll point.
						while (e && e.previousElementSibling) {
		
							e = e.previousElementSibling;
		
							if (e.dataset.scrollId) {
		
								target = e;
								id = e.dataset.scrollId;
								break;
		
							}
		
						}
		
						if (!target
						||	!id)
							return;
		
					// Redirect.
						if (target.dataset.scrollInvisible == '1')
							scrollToElement(target, 'smooth', scrollPointSpeed(target));
						else
							location.href = '#' + id;
		
				},
				doFirstScrollPoint = function(e) {
		
					var e, target, id;
		
					// Determine parent element.
						e = scrollPointParent(event.target);
		
						if (!e)
							return;
		
					// Find first scroll point.
						while (e && e.previousElementSibling) {
		
							e = e.previousElementSibling;
		
							if (e.dataset.scrollId) {
		
								target = e;
								id = e.dataset.scrollId;
		
							}
		
						}
		
						if (!target
						||	!id)
							return;
		
					// Redirect.
						if (target.dataset.scrollInvisible == '1')
							scrollToElement(target, 'smooth', scrollPointSpeed(target));
						else
							location.href = '#' + id;
		
				},
				doLastScrollPoint = function(e) {
		
					var e, target, id;
		
					// Determine parent element.
						e = scrollPointParent(event.target);
		
						if (!e)
							return;
		
					// Find last scroll point.
						while (e && e.nextElementSibling) {
		
							e = e.nextElementSibling;
		
							if (e.dataset.scrollId) {
		
								target = e;
								id = e.dataset.scrollId;
		
							}
		
						}
		
						if (!target
						||	!id)
							return;
		
					// Redirect.
						if (target.dataset.scrollInvisible == '1')
							scrollToElement(target, 'smooth', scrollPointSpeed(target));
						else
							location.href = '#' + id;
		
				},
				doNextSection = function() {
		
					var section;
		
					section = $('#main > .inner > section.active').nextElementSibling;
		
					if (!section || section.tagName != 'SECTION')
						return;
		
					location.href = '#' + section.id.replace(/-section$/, '');
		
				},
				doPreviousSection = function() {
		
					var section;
		
					section = $('#main > .inner > section.active').previousElementSibling;
		
					if (!section || section.tagName != 'SECTION')
						return;
		
					location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
		
				},
				doFirstSection = function() {
		
					var section;
		
					section = $('#main > .inner > section:first-of-type');
		
					if (!section || section.tagName != 'SECTION')
						return;
		
					location.href = '#' + section.id.replace(/-section$/, '');
		
				},
				doLastSection = function() {
		
					var section;
		
					section = $('#main > .inner > section:last-of-type');
		
					if (!section || section.tagName != 'SECTION')
						return;
		
					location.href = '#' + section.id.replace(/-section$/, '');
		
				},
				resetSectionChangeElements = function(section) {
		
					var ee, e, x;
		
					// Get elements with data-reset-on-section-change attribute.
						ee = section.querySelectorAll('[data-reset-on-section-change="1"]');
		
					// Step through elements.
						for (e of ee) {
		
							// Determine type.
								x = e ? e.tagName : null;
		
								switch (x) {
		
									case 'FORM':
		
										// Reset.
											e.reset();
		
										break;
		
									default:
										break;
		
								}
		
						}
		
				},
				activateSection = function(section, scrollPoint) {
		
					var sectionHeight, currentSection, currentSectionHeight,
						name, hideHeader, hideFooter, disableAutoScroll,
						ee, k;
		
					// Section already active?
						if (!section.classList.contains('inactive')) {
		
							// Get options.
								name = (section ? section.id.replace(/-section$/, '') : null);
								disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
		
							// Scroll to scroll point (if applicable).
								if (scrollPoint)
									scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
		
							// Otherwise, just scroll to top (if not disabled for this section).
								else if (!disableAutoScroll)
									scrollToElement(null);
		
							// Bail.
								return false;
		
						}
		
					// Otherwise, activate it.
						else {
		
							// Lock.
								locked = true;
		
							// Clear index URL hash.
								if (location.hash == '#main')
									history.replaceState(null, null, '#');
		
							// Get options.
								name = (section ? section.id.replace(/-section$/, '') : null);
								hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader) : false;
								hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter) : false;
								disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
		
							// Deactivate current section.
		
								// Hide header and/or footer (if necessary).
		
									// Header.
										if (header && hideHeader) {
		
											header.classList.add('hidden');
											header.style.display = 'none';
		
										}
		
									// Footer.
										if (footer && hideFooter) {
		
											footer.classList.add('hidden');
											footer.style.display = 'none';
		
										}
		
								// Deactivate.
									currentSection = $('#main > .inner > section:not(.inactive)');
									currentSection.classList.add('inactive');
									currentSection.classList.remove('active');
									currentSection.style.display = 'none';
		
								// Unload elements.
									unloadElements(currentSection);
		
								// Reset section change elements.
									resetSectionChangeElements(currentSection);
		
							// Activate target section.
		
								// Show header and/or footer (if necessary).
		
									// Header.
										if (header && !hideHeader) {
		
											header.style.display = '';
											header.classList.remove('hidden');
		
										}
		
									// Footer.
										if (footer && !hideFooter) {
		
											footer.style.display = '';
											footer.classList.remove('hidden');
		
										}
		
								// Activate.
									section.classList.remove('inactive');
									section.classList.add('active');
									section.style.display = '';
		
							// Trigger 'resize' event.
								trigger('resize');
		
							// Load elements.
								loadElements(section);
		
							// Scroll to scroll point (if applicable).
								if (scrollPoint)
									scrollToElement(scrollPoint, 'instant');
		
							// Otherwise, just scroll to top (if not disabled for this section).
								else if (!disableAutoScroll)
									scrollToElement(null, 'instant');
		
							// Unlock.
								locked = false;
		
						}
		
				},
				sections = {};
		
			// Expose doNextScrollPoint, doPreviousScrollPoint, doFirstScrollPoint, doLastScrollPoint.
				window._nextScrollPoint = doNextScrollPoint;
				window._previousScrollPoint = doPreviousScrollPoint;
				window._firstScrollPoint = doFirstScrollPoint;
				window._lastScrollPoint = doLastScrollPoint;
		
			// Expose doNextSection, doPreviousSection, doFirstSection, doLastSection.
				window._nextSection = doNextSection;
				window._previousSection = doPreviousSection;
				window._firstSection = doFirstSection;
				window._lastSection = doLastSection;
		
			// Override exposed scrollToTop.
				window._scrollToTop = function() {
		
					var section, id;
		
					// Scroll to top.
						scrollToElement(null);
		
					// Section active?
						if (!!(section = $('section.active'))) {
		
							// Get name.
								id = section.id.replace(/-section$/, '');
		
								// Index section? Clear.
									if (id == 'main')
										id = '';
		
							// Reset hash to section name (via new state).
								history.pushState(null, null, '#' + id);
		
						}
		
				};
		
			// Initialize.
		
				// Set scroll restoration to manual.
					if ('scrollRestoration' in history)
						history.scrollRestoration = 'manual';
		
				// Header, footer.
					header = $('#header');
					footer = $('#footer');
		
				// Show initial section.
		
					// Determine target.
						h = thisHash();
		
						// Contains invalid characters? Might be a third-party hashbang, so ignore it.
							if (h
							&&	!h.match(/^[a-zA-Z0-9\-]+$/))
								h = null;
		
						// Scroll point.
							if (e = $('[data-scroll-id="' + h + '"]')) {
		
								initialScrollPoint = e;
								initialSection = initialScrollPoint.parentElement;
								initialId = initialSection.id;
		
							}
		
						// Section.
							else if (e = $('#' + (h ? h : 'main') + '-section')) {
		
								initialScrollPoint = null;
								initialSection = e;
								initialId = initialSection.id;
		
							}
		
						// Missing initial section?
							if (!initialSection) {
		
								// Default to index.
									initialScrollPoint = null;
									initialSection = $('#' + 'main' + '-section');
									initialId = initialSection.id;
		
								// Clear index URL hash.
									history.replaceState(undefined, undefined, '#');
		
							}
		
					// Get options.
						name = (h ? h : 'main');
						hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader) : false;
						hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter) : false;
						disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
		
					// Deactivate all sections (except initial).
		
						// Initially hide header and/or footer (if necessary).
		
							// Header.
								if (header && hideHeader) {
		
									header.classList.add('hidden');
									header.style.display = 'none';
		
								}
		
							// Footer.
								if (footer && hideFooter) {
		
									footer.classList.add('hidden');
									footer.style.display = 'none';
		
								}
		
						// Deactivate.
							ee = $$('#main > .inner > section:not([id="' + initialId + '"])');
		
							for (k = 0; k < ee.length; k++) {
		
								ee[k].className = 'inactive';
								ee[k].style.display = 'none';
		
							}
		
					// Activate initial section.
						initialSection.classList.add('active');
		
					// Load elements.
						loadElements(initialSection);
		
						if (header)
							loadElements(header);
		
						if (footer)
							loadElements(footer);
		
					// Scroll to top (if not disabled for this section).
						if (!disableAutoScroll)
							scrollToElement(null, 'instant');
		
				// Load event.
					on('load', function() {
		
						// Scroll to initial scroll point (if applicable).
					 		if (initialScrollPoint)
								scrollToElement(initialScrollPoint, 'instant');
		
					});
		
			// Hashchange event.
				on('hashchange', function(event) {
		
					var section, scrollPoint,
						h, e;
		
					// Lock.
						if (locked)
							return false;
		
					// Determine target.
						h = thisHash();
		
						// Contains invalid characters? Might be a third-party hashbang, so ignore it.
							if (h
							&&	!h.match(/^[a-zA-Z0-9\-]+$/))
								return false;
		
						// Scroll point.
							if (e = $('[data-scroll-id="' + h + '"]')) {
		
								scrollPoint = e;
								section = scrollPoint.parentElement;
		
							}
		
						// Section.
							else if (e = $('#' + (h ? h : 'main') + '-section')) {
		
								scrollPoint = null;
								section = e;
		
							}
		
						// Anything else.
							else {
		
								// Default to index.
									scrollPoint = null;
									section = $('#' + 'main' + '-section');
		
								// Clear index URL hash.
									history.replaceState(undefined, undefined, '#');
		
							}
		
					// No section? Bail.
						if (!section)
							return false;
		
					// Activate section.
						activateSection(section, scrollPoint);
		
					return false;
		
				});
		
				// Hack: Allow hashchange to trigger on click even if the target's href matches the current hash.
					on('click', function(event) {
		
						var t = event.target,
							tagName = t.tagName.toUpperCase(),
							scrollPoint, section;
		
						// Find real target.
							switch (tagName) {
		
								case 'IMG':
								case 'SVG':
								case 'USE':
								case 'U':
								case 'STRONG':
								case 'EM':
								case 'CODE':
								case 'S':
								case 'MARK':
								case 'SPAN':
		
									// Find ancestor anchor tag.
										while ( !!(t = t.parentElement) )
											if (t.tagName == 'A')
												break;
		
									// Not found? Bail.
										if (!t)
											return;
		
									break;
		
								default:
									break;
		
							}
		
						// Target is an anchor *and* its href is a hash?
							if (t.tagName == 'A'
							&&	t.getAttribute('href') !== null
							&&	t.getAttribute('href').substr(0, 1) == '#') {
		
								// Hash matches an invisible scroll point?
									if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
		
										// Prevent default.
											event.preventDefault();
		
										// Get section.
											section = scrollPoint.parentElement;
		
										// Section is inactive?
											if (section.classList.contains('inactive')) {
		
												// Reset hash to section name (via new state).
													history.pushState(null, null, '#' + section.id.replace(/-section$/, ''));
		
												// Activate section.
													activateSection(section, scrollPoint);
		
											}
		
										// Otherwise ...
											else {
		
												// Scroll to scroll point.
													scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
		
											}
		
									}
		
								// Hash matches the current hash?
									else if (t.hash == window.location.hash) {
		
										// Prevent default.
											event.preventDefault();
		
										// Replace state with '#'.
											history.replaceState(undefined, undefined, '#');
		
										// Replace location with target hash.
											location.replace(t.hash);
		
									}
		
							}
		
					});
		
		})();
	
	// Browser hacks.
		// Init.
			var style, sheet, rule;
		
			// Create <style> element.
				style = document.createElement('style');
				style.appendChild(document.createTextNode(''));
				document.head.appendChild(style);
		
			// Get sheet.
				sheet = style.sheet;
		
		// Mobile.
			if (client.mobile) {
		
				// Prevent overscrolling on Safari/other mobile browsers.
				// 'vh' units don't factor in the heights of various browser UI elements so our page ends up being
				// a lot taller than it needs to be (resulting in overscroll and issues with vertical centering).
					(function() {
		
						// Lsd units available?
							if (client.flags.lsdUnits) {
		
								document.documentElement.style.setProperty('--viewport-height', '100svh');
								document.documentElement.style.setProperty('--background-height', '100lvh');
		
							}
		
						// Otherwise, use innerHeight hack.
							else {
		
								var f = function() {
									document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
									document.documentElement.style.setProperty('--background-height', (window.innerHeight + 250) + 'px');
								};
		
								on('load', f);
								on('orientationchange', function() {
		
									// Update after brief delay.
										setTimeout(function() {
											(f)();
										}, 100);
		
								});
		
							}
		
					})();
		
			}
		
		// Android.
			if (client.os == 'android') {
		
				// Prevent background "jump" when address bar shrinks.
				// Specifically, this fix forces the background pseudoelement to a fixed height based on the physical
				// screen size instead of relying on "vh" (which is subject to change when the scrollbar shrinks/grows).
					(function() {
		
						// Insert and get rule.
							sheet.insertRule('body::after { }', 0);
							rule = sheet.cssRules[0];
		
						// Event.
							var f = function() {
								rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
							};
		
							on('load', f);
							on('orientationchange', f);
							on('touchmove', f);
		
					})();
		
				// Apply "is-touch" class to body.
					$body.classList.add('is-touch');
		
			}
		
		// iOS.
			else if (client.os == 'ios') {
		
				// <=11: Prevent white bar below background when address bar shrinks.
				// For some reason, simply forcing GPU acceleration on the background pseudoelement fixes this.
					if (client.osVersion <= 11)
						(function() {
		
							// Insert and get rule.
								sheet.insertRule('body::after { }', 0);
								rule = sheet.cssRules[0];
		
							// Set rule.
								rule.style.cssText = '-webkit-transform: scale(1.0)';
		
						})();
		
				// <=11: Prevent white bar below background when form inputs are focused.
				// Fixed-position elements seem to lose their fixed-ness when this happens, which is a problem
				// because our backgrounds fall into this category.
					if (client.osVersion <= 11)
						(function() {
		
							// Insert and get rule.
								sheet.insertRule('body.ios-focus-fix::before { }', 0);
								rule = sheet.cssRules[0];
		
							// Set rule.
								rule.style.cssText = 'height: calc(100% + 60px)';
		
							// Add event listeners.
								on('focus', function(event) {
									$body.classList.add('ios-focus-fix');
								}, true);
		
								on('blur', function(event) {
									$body.classList.remove('ios-focus-fix');
								}, true);
		
						})();
		
				// Apply "is-touch" class to body.
					$body.classList.add('is-touch');
		
			}
	
	// Visibility.
		(function() {
		
			var	elements = $$('[data-visibility]');
		
			// Initialize elements.
				elements.forEach(function(e) {
		
					var	p = e.parentElement,
						state = false,
						nextSibling = null,
						ne, query;
		
					// Determine next element.
						for (ne = e.nextSibling; ne; ne = ne.nextSibling) {
		
							// Not a node? Skip.
								if (ne.nodeType != 1)
									continue;
		
							// No visibility setting? Found our next element so bail.
								if (!ne.dataset.visibility)
									break;
		
						}
		
					// Determine media query at which to hide element.
						switch (e.dataset.visibility) {
		
							case 'mobile':
								query = '(min-width: 737px)';
								break;
		
							case 'desktop':
								query = '(max-width: 736px)';
								break;
		
							default:
								return;
		
						}
		
					// Create handler.
						f = function() {
		
							// Matches media query?
								if (window.matchMedia(query).matches) {
		
									// Hasn't been applied yet?
										if (!state) {
		
											// Mark as applied.
												state = true;
		
											// Hide element (= remove from DOM).
												p.removeChild(e);
		
										}
		
								}
		
							// Otherwise ...
								else {
		
									// Previously applied?
										if (state) {
		
											// Unmark as applied.
												state = false;
		
											// Show element (= reinsert before next element).
												p.insertBefore(e, ne);
		
										}
		
								}
		
						};
		
					// Add event listeners.
						on('resize', f);
						on('orientationchange', f);
						on('load', f);
						on('fullscreenchange', f);
		
				});
		
		})();
	
	// Scroll events.
		var scrollEvents = {
		
			/**
			 * Items.
			 * @var {array}
			 */
			items: [],
		
			/**
			 * Adds an event.
			 * @param {object} o Options.
			 */
			add: function(o) {
		
				this.items.push({
					element: o.element,
					triggerElement: (('triggerElement' in o && o.triggerElement) ? o.triggerElement : o.element),
					enter: ('enter' in o ? o.enter : null),
					leave: ('leave' in o ? o.leave : null),
					mode: ('mode' in o ? o.mode : 4),
					threshold: ('threshold' in o ? o.threshold : 0.25),
					offset: ('offset' in o ? o.offset : 0),
					initialState: ('initialState' in o ? o.initialState : null),
					state: false,
				});
		
			},
		
			/**
			 * Handler.
			 */
			handler: function() {
		
				var	height, top, bottom, scrollPad;
		
				// Determine values.
					if (client.os == 'ios') {
		
						height = document.documentElement.clientHeight;
						top = document.body.scrollTop + window.scrollY;
						bottom = top + height;
						scrollPad = 125;
		
					}
					else {
		
						height = document.documentElement.clientHeight;
						top = document.documentElement.scrollTop;
						bottom = top + height;
						scrollPad = 0;
		
					}
		
				// Step through items.
					scrollEvents.items.forEach(function(item) {
		
						var	elementTop, elementBottom, viewportTop, viewportBottom,
							bcr, pad, state, a, b;
		
						// No enter/leave handlers? Bail.
							if (!item.enter
							&&	!item.leave)
								return true;
		
						// No trigger element? Bail.
							if (!item.triggerElement)
								return true;
		
						// Trigger element not visible?
							if (item.triggerElement.offsetParent === null) {
		
								// Current state is active *and* leave handler exists?
									if (item.state == true
									&&	item.leave) {
		
										// Reset state to false.
											item.state = false;
		
										// Call it.
											(item.leave).apply(item.element);
		
										// No enter handler? Unbind leave handler (so we don't check this element again).
											if (!item.enter)
												item.leave = null;
		
									}
		
								// Bail.
									return true;
		
							}
		
						// Get element position.
							bcr = item.triggerElement.getBoundingClientRect();
							elementTop = top + Math.floor(bcr.top);
							elementBottom = elementTop + bcr.height;
		
						// Determine state.
		
							// Initial state exists?
								if (item.initialState !== null) {
		
									// Use it for this check.
										state = item.initialState;
		
									// Clear it.
										item.initialState = null;
		
								}
		
							// Otherwise, determine state from mode/position.
								else {
		
									switch (item.mode) {
		
										// Element falls within viewport.
											case 1:
											default:
		
												// State.
													state = (bottom > (elementTop - item.offset) && top < (elementBottom + item.offset));
		
												break;
		
										// Viewport midpoint falls within element.
											case 2:
		
												// Midpoint.
													a = (top + (height * 0.5));
		
												// State.
													state = (a > (elementTop - item.offset) && a < (elementBottom + item.offset));
		
												break;
		
										// Viewport midsection falls within element.
											case 3:
		
												// Upper limit (25%-).
													a = top + (height * (item.threshold));
		
													if (a - (height * 0.375) <= 0)
														a = 0;
		
												// Lower limit (-75%).
													b = top + (height * (1 - item.threshold));
		
													if (b + (height * 0.375) >= document.body.scrollHeight - scrollPad)
														b = document.body.scrollHeight + scrollPad;
		
												// State.
													state = (b > (elementTop - item.offset) && a < (elementBottom + item.offset));
		
												break;
		
										// Viewport intersects with element.
											case 4:
		
												// Calculate pad, viewport top, viewport bottom.
													pad = height * item.threshold;
													viewportTop = (top + pad);
													viewportBottom = (bottom - pad);
		
												// Compensate for elements at the very top or bottom of the page.
													if (Math.floor(top) <= pad)
														viewportTop = top;
		
													if (Math.ceil(bottom) >= (document.body.scrollHeight - pad))
														viewportBottom = bottom;
		
												// Element is smaller than viewport?
													if ((viewportBottom - viewportTop) >= (elementBottom - elementTop)) {
		
														state =	(
																(elementTop >= viewportTop && elementBottom <= viewportBottom)
															||	(elementTop >= viewportTop && elementTop <= viewportBottom)
															||	(elementBottom >= viewportTop && elementBottom <= viewportBottom)
														);
		
													}
		
												// Otherwise, viewport is smaller than element.
													else
														state =	(
																(viewportTop >= elementTop && viewportBottom <= elementBottom)
															||	(elementTop >= viewportTop && elementTop <= viewportBottom)
															||	(elementBottom >= viewportTop && elementBottom <= viewportBottom)
														);
		
												break;
		
									}
		
								}
		
						// State changed?
							if (state != item.state) {
		
								// Update state.
									item.state = state;
		
								// Call handler.
									if (item.state) {
		
										// Enter handler exists?
											if (item.enter) {
		
												// Call it.
													(item.enter).apply(item.element);
		
												// No leave handler? Unbind enter handler (so we don't check this element again).
													if (!item.leave)
														item.enter = null;
		
											}
		
									}
									else {
		
										// Leave handler exists?
											if (item.leave) {
		
												// Call it.
													(item.leave).apply(item.element);
		
												// No enter handler? Unbind leave handler (so we don't check this element again).
													if (!item.enter)
														item.leave = null;
		
											}
		
									}
		
							}
		
					});
		
			},
		
			/**
			 * Initializes scroll events.
			 */
			init: function() {
		
				// Bind handler to events.
					on('load', this.handler);
					on('resize', this.handler);
					on('scroll', this.handler);
		
				// Do initial handler call.
					(this.handler)();
		
			}
		};
		
		// Initialize.
			scrollEvents.init();
	
	// "On Visible" animation.
		var onvisible = {
		
			/**
			 * Effects.
			 * @var {object}
			 */
			effects: {
				'blur-in': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'filter ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.filter = 'blur(' + (0.25 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.filter = 'none';
					},
				},
				'zoom-in': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'scale(' + (1 - ((alt ? 0.25 : 0.05) * intensity)) + ')';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'zoom-out': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'scale(' + (1 + ((alt ? 0.25 : 0.05) * intensity)) + ')';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'slide-left': {
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.transform = 'translateX(100vw)';
					},
					play: function() {
						this.style.transform = 'none';
					},
				},
				'slide-right': {
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.transform = 'translateX(-100vw)';
					},
					play: function() {
						this.style.transform = 'none';
					},
				},
				'flip-forward': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateX(' + ((alt ? 45 : 15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'flip-backward': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateX(' + ((alt ? -45 : -15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'flip-left': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateY(' + ((alt ? 45 : 15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'flip-right': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateY(' + ((alt ? -45 : -15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'tilt-left': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'rotate(' + ((alt ? 45 : 5) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'tilt-right': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'rotate(' + ((alt ? -45 : -5) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-right': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateX(' + (-1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-left': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateX(' + (1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-down': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateY(' + (-1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-up': {
					transition: function (speed, delay) {
						return  'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateY(' + (1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-in': {
					transition: function (speed, delay) {
						return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.opacity = 0;
					},
					play: function() {
						this.style.opacity = 1;
					},
				},
				'fade-in-background': {
					custom: true,
					transition: function (speed, delay) {
		
						this.style.setProperty('--onvisible-speed', speed + 's');
		
						if (delay)
							this.style.setProperty('--onvisible-delay', delay + 's');
		
					},
					rewind: function() {
						this.style.removeProperty('--onvisible-background-color');
					},
					play: function() {
						this.style.setProperty('--onvisible-background-color', 'rgba(0,0,0,0.001)');
					},
				},
				'zoom-in-image': {
					target: 'img',
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.transform = 'scale(1)';
					},
					play: function(intensity) {
						this.style.transform = 'scale(' + (1 + (0.1 * intensity)) + ')';
					},
				},
				'zoom-out-image': {
					target: 'img',
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.transform = 'scale(' + (1 + (0.1 * intensity)) + ')';
					},
					play: function() {
						this.style.transform = 'none';
					},
				},
				'focus-image': {
					target: 'img',
					transition: function (speed, delay) {
						return  'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'filter ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.transform = 'scale(' + (1 + (0.05 * intensity)) + ')';
						this.style.filter = 'blur(' + (0.25 * intensity) + 'rem)';
					},
					play: function(intensity) {
						this.style.transform = 'none';
						this.style.filter = 'none';
					},
				},
				'wipe-up': {
					transition: function (speed, delay) {
						return	'mask-size ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.maskComposite = 'exclude';
						this.style.maskRepeat = 'no-repeat';
						this.style.maskImage = 'linear-gradient(0deg, black 100%, transparent 100%)';
						this.style.maskPosition = '0% 100%';
						this.style.maskSize = '100% 0%';
					},
					play: function() {
						this.style.maskSize = '110% 110%';
					},
				},
				'wipe-down': {
					transition: function (speed, delay) {
						return	'mask-size ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.maskComposite = 'exclude';
						this.style.maskRepeat = 'no-repeat';
						this.style.maskImage = 'linear-gradient(0deg, black 100%, transparent 100%)';
						this.style.maskPosition = '0% 0%';
						this.style.maskSize = '100% 0%';
					},
					play: function() {
						this.style.maskSize = '110% 110%';
					},
				},
				'wipe-left': {
					transition: function (speed, delay) {
						return	'mask-size ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.maskComposite = 'exclude';
						this.style.maskRepeat = 'no-repeat';
						this.style.maskImage = 'linear-gradient(90deg, black 100%, transparent 100%)';
						this.style.maskPosition = '100% 0%';
						this.style.maskSize = '0% 100%';
					},
					play: function() {
						this.style.maskSize = '110% 110%';
					},
				},
				'wipe-right': {
					transition: function (speed, delay) {
						return	'mask-size ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.maskComposite = 'exclude';
						this.style.maskRepeat = 'no-repeat';
						this.style.maskImage = 'linear-gradient(90deg, black 100%, transparent 100%)';
						this.style.maskPosition = '0% 0%';
						this.style.maskSize = '0% 100%';
					},
					play: function() {
						this.style.maskSize = '110% 110%';
					},
				},
				'wipe-diagonal': {
					transition: function (speed, delay) {
						return	'mask-size ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.maskComposite = 'exclude';
						this.style.maskRepeat = 'no-repeat';
						this.style.maskImage = 'linear-gradient(45deg, black 50%, transparent 50%)';
						this.style.maskPosition = '0% 100%';
						this.style.maskSize = '0% 0%';
					},
					play: function() {
						this.style.maskSize = '220% 220%';
					},
				},
				'wipe-reverse-diagonal': {
					transition: function (speed, delay) {
						return	'mask-size ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.maskComposite = 'exclude';
						this.style.maskRepeat = 'no-repeat';
						this.style.maskImage = 'linear-gradient(135deg, transparent 50%, black 50%)';
						this.style.maskPosition = '100% 100%';
						this.style.maskSize = '0% 0%';
					},
					play: function() {
						this.style.maskSize = '220% 220%';
					},
				},
			},
		
			/**
			 * Regex.
			 * @var {RegExp}
			 */
			regex: new RegExp('([a-zA-Z0-9\.\,\-\_\"\'\?\!\:\;\#\@\#$\%\&\(\)\{\}]+)', 'g'),
		
			/**
			 * Adds one or more animatable elements.
			 * @param {string} selector Selector.
			 * @param {object} settings Settings.
			 */
			add: function(selector, settings) {
		
				var	_this = this,
					style = settings.style in this.effects ? settings.style : 'fade',
					speed = parseInt('speed' in settings ? settings.speed : 1000) / 1000,
					intensity = ((parseInt('intensity' in settings ? settings.intensity : 5) / 10) * 1.75) + 0.25,
					delay = parseInt('delay' in settings ? settings.delay : 0) / 1000,
					replay = 'replay' in settings ? settings.replay : false,
					stagger = 'stagger' in settings ? (parseInt(settings.stagger) >= 0 ? (parseInt(settings.stagger) / 1000) : false) : false,
					staggerOrder = 'staggerOrder' in settings ? settings.staggerOrder : 'default',
					staggerSelector = 'staggerSelector' in settings ? settings.staggerSelector : null,
					threshold = parseInt('threshold' in settings ? settings.threshold : 3),
					state = 'state' in settings ? settings.state : null,
					effect = this.effects[style],
					scrollEventThreshold;
		
				// Determine scroll event threshold.
					switch (threshold) {
		
						case 1:
							scrollEventThreshold = 0;
							break;
		
						case 2:
							scrollEventThreshold = 0.125;
							break;
		
						default:
						case 3:
							scrollEventThreshold = 0.25;
							break;
		
						case 4:
							scrollEventThreshold = 0.375;
							break;
		
						case 5:
							scrollEventThreshold = 0.475;
							break;
		
					}
		
				// Step through selected elements.
					$$(selector).forEach(function(e) {
		
						var children, enter, leave, targetElement, triggerElement;
		
						// Stagger in use, and stagger selector is "all children"? Expand text nodes.
							if (stagger !== false
							&&	staggerSelector == ':scope > *')
								_this.expandTextNodes(e);
		
						// Get children.
							children = (stagger !== false && staggerSelector) ? e.querySelectorAll(staggerSelector) : null;
		
						// Define handlers.
							enter = function(staggerDelay=0) {
		
								var _this = this,
									transitionOrig;
		
								// Target provided? Use it instead of element.
									if (effect.target)
										_this = this.querySelector(effect.target);
		
								// Not a custom effect?
									if (!effect.custom) {
		
										// Save original transition.
											transitionOrig = _this.style.transition;
		
										// Apply temporary styles.
											_this.style.setProperty('backface-visibility', 'hidden');
		
										// Apply transition.
											_this.style.transition = effect.transition(speed, delay + staggerDelay);
		
									}
		
								// Otherwise, call custom transition handler.
									else
										effect.transition.apply(_this, [speed, delay + staggerDelay]);
		
								// Play.
									effect.play.apply(_this, [intensity, !!children]);
		
								// Not a custom effect?
									if (!effect.custom)
										setTimeout(function() {
		
											// Remove temporary styles.
												_this.style.removeProperty('backface-visibility');
		
											// Restore original transition.
												_this.style.transition = transitionOrig;
		
										}, (speed + delay + staggerDelay) * 1000 * 2);
		
							};
		
							leave = function() {
		
								var _this = this,
									transitionOrig;
		
								// Target provided? Use it instead of element.
									if (effect.target)
										_this = this.querySelector(effect.target);
		
								// Not a custom effect?
									if (!effect.custom) {
		
										// Save original transition.
											transitionOrig = _this.style.transition;
		
										// Apply temporary styles.
											_this.style.setProperty('backface-visibility', 'hidden');
		
										// Apply transition.
											_this.style.transition = effect.transition(speed);
		
									}
		
								// Otherwise, call custom transition handler.
									else
										effect.transition.apply(_this, [speed]);
		
								// Rewind.
									effect.rewind.apply(_this, [intensity, !!children]);
		
								// Not a custom effect?
									if (!effect.custom)
										setTimeout(function() {
		
											// Remove temporary styles.
												_this.style.removeProperty('backface-visibility');
		
											// Restore original transition.
												_this.style.transition = transitionOrig;
		
										}, speed * 1000 * 2);
		
							};
		
						// Initial rewind.
		
							// Determine target element.
								if (effect.target)
									targetElement = e.querySelector(effect.target);
								else
									targetElement = e;
		
							// Children? Rewind each individually.
								if (children)
									children.forEach(function(targetElement) {
										effect.rewind.apply(targetElement, [intensity, true]);
									});
		
							// Otherwise. just rewind element.
								else
									effect.rewind.apply(targetElement, [intensity]);
		
						// Determine trigger element.
							triggerElement = e;
		
							// Has a parent?
								if (e.parentNode) {
		
									// Parent is an onvisible trigger? Use it.
										if (e.parentNode.dataset.onvisibleTrigger)
											triggerElement = e.parentNode;
		
									// Otherwise, has a grandparent?
										else if (e.parentNode.parentNode) {
		
											// Grandparent is an onvisible trigger? Use it.
												if (e.parentNode.parentNode.dataset.onvisibleTrigger)
													triggerElement = e.parentNode.parentNode;
		
										}
		
								}
		
						// Add scroll event.
							scrollEvents.add({
								element: e,
								triggerElement: triggerElement,
								initialState: state,
								threshold: scrollEventThreshold,
								enter: children ? function() {
		
									var staggerDelay = 0,
										childHandler = function(e) {
		
											// Apply enter handler.
												enter.apply(e, [staggerDelay]);
		
											// Increment stagger delay.
												staggerDelay += stagger;
		
										},
										a;
		
									// Default stagger order?
										if (staggerOrder == 'default') {
		
											// Apply child handler to children.
												children.forEach(childHandler);
		
										}
		
									// Otherwise ...
										else {
		
											// Convert children to an array.
												a = Array.from(children);
		
											// Sort array based on stagger order.
												switch (staggerOrder) {
		
													case 'reverse':
		
														// Reverse array.
															a.reverse();
		
														break;
		
													case 'random':
		
														// Randomly sort array.
															a.sort(function() {
																return Math.random() - 0.5;
															});
		
														break;
		
												}
		
											// Apply child handler to array.
												a.forEach(childHandler);
		
										}
		
								} : enter,
								leave: (replay ? (children ? function() {
		
									// Step through children.
										children.forEach(function(e) {
		
											// Apply leave handler.
												leave.apply(e);
		
										});
		
								} : leave) : null),
							});
		
					});
		
			},
		
			/**
			 * Expand text nodes within an element into <text-node> elements.
			 * @param {DOMElement} e Element.
			 */
			expandTextNodes: function(e) {
		
				var s, i, w, x;
		
				// Step through child nodes.
					for (i = 0; i < e.childNodes.length; i++) {
		
						// Get child node.
							x = e.childNodes[i];
		
						// Not a text node? Skip.
							if (x.nodeType != Node.TEXT_NODE)
								continue;
		
						// Get node value.
							s = x.nodeValue;
		
						// Convert to <text-node>.
							s = s.replace(
								this.regex,
								function(x, a) {
									return '<text-node>' + a + '</text-node>';
								}
							);
		
						// Update.
		
							// Create wrapper.
								w = document.createElement('text-node');
		
							// Populate with processed text.
							// This converts our processed text into a series of new text and element nodes.
								w.innerHTML = s;
		
							// Replace original element with wrapper.
								x.replaceWith(w);
		
							// Step through wrapper's children.
								while (w.childNodes.length > 0) {
		
									// Move child after wrapper.
										w.parentNode.insertBefore(
											w.childNodes[0],
											w
										);
		
								}
		
							// Remove wrapper (now that it's no longer needed).
								w.parentNode.removeChild(w);
		
						}
		
			},
		
		};
	
	// Initialize "On Visible" animations.
		onvisible.add('.image.style2', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('h1.style2, h2.style2, h3.style2, p.style2', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('h1.style1, h2.style1, h3.style1, p.style1', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('h1.style3, h2.style3, h3.style3, p.style3', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('.buttons.style1', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('#table01', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('.icons.style1', { style: 'fade-up', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('h1.style4, h2.style4, h3.style4, p.style4', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('#video01', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });
		onvisible.add('#list02', { style: 'fade-down', speed: 1000, intensity: 0, threshold: 3, delay: 0, state: true, replay: false });




		let currentPage = 0;
		const maxPointsPerPage = 4;

		// Timeline Configuración
		const timelineData = [
			{
				date: "2021-12-29",
				name : "Anima MemoriA",
				image: "assets/latestRelease/Anima Memoria 2.0.png",
				audio: "assets/latestRelease/Anima MemoriA.mp3",
				youtube: "https://youtu.be/8SKOE_SFINA",
				spotify: "https://open.spotify.com/track/68ph2GFUoZMw5vj2MjwtJ1",
				apple: "https://music.apple.com/us/album/anima-memoria-anniversary-edition/1661769494",
				scale: 1,
				xOffset: -1180,
				yOffset: -2500,
				//xOffset: -40,
				//yOffset: -78.5,
			},
			{
				date: "2022-07-10",
				name : "Anima EuphoriA",
				image: "assets/latestRelease/AnimaEuphoriA3000.png",
				audio: "assets/latestRelease/Anima EuphoriA.mp3",
				youtube: "https://youtu.be/EgQXvosQ9pE",
				spotify: "https://open.spotify.com/track/5TnPuEwpLFYjTFJeEFlh55",
				apple: "https://music.apple.com/us/album/anima-euphoria-feat-nikki-simmons/1659233229",
				scale: 1,
				xOffset: 0,
				yOffset: -1800,
				//xOffset: -12.6,
				//yOffset: -60.5,
			},
			{
				date: "2022-11-20",
				name : "Dreams",
				image: "assets/latestRelease/PortadaDreams4.PNG",
				audio: "assets/latestRelease/Dreams.mp3",
				youtube: "https://youtu.be/YeJzRmBI3_w",
				spotify: "https://open.spotify.com/track/4wi5hs2Dy4gStomYwm7RJ3",
				apple: "https://music.apple.com/us/album/dreams-feat-%E6%98%A5%E6%9D%A5/1675428981",
				scale: 1,
				xOffset: -700,
				yOffset: -800,
				//xOffset: -32.6,
				//yOffset: -24.5,
			},
			{
				date: "2023-05-30",
				name : "Estrellita Radiante",
				image: "assets/latestRelease/EstrellitaRadiante.png",
				audio: "assets/latestRelease/Estrellita Radiante.mp3",
				youtube: "https://youtu.be/bDA41tWyfEM",
				spotify: "https://open.spotify.com/track/0aQabzpBFPuPOOGC1eL3Az",
				apple: "https://music.apple.com/us/album/estrellita-radiante-feat-nekane/1690380013",
				scale: 1,
				xOffset: -2700,
				yOffset: -2700,
				//xOffset: -70, //xOffset: -67,
				//yOffset: -72, //yOffset: -75.5,
			},
			{
				date: "2023-08-23",
				name : "Summer Sunrise",
				image: "assets/latestRelease/SummerSunrise.png",
				audio: "assets/latestRelease/Summer Sunrise (Remix).mp3",
				youtube: "https://youtu.be/0nM-oybwcG0",
				spotify: "https://open.spotify.com/track/2gLXh6SduGpcKWy9Hww6rt",
				apple: "https://music.apple.com/us/album/summer-sunrise-single/1712516005",
				scale: 1,
				xOffset: -1780,
				yOffset: -2500,
				//xOffset: -60,
				//yOffset: -78.5,
			},
			{
				date: "2024-02-16",
				name : "A Star in the Sky",
				image: "assets/latestRelease/A Star in the Sky.png",
				audio: "assets/latestRelease/A Star in the Sky.mp3",
				youtube: "https://www.youtube.com/watch?v=-UcHLFdHlA0&list=OLAK5uy_nv0huGBrSmJHL3NlJKOgh_xsPVYbnPyvk",
				spotify: "https://open.spotify.com/album/3AmLPLsQccTleKikGku8fV",
				apple: "https://music.apple.com/us/album/a-star-in-the-sky-ep/1773693185",
				scale: 1,
				xOffset: -1780,
				yOffset: -2000,
				//xOffset: -60,
				//yOffset: -65.5,
			},
			{
				date: "2024-05-13",
				name : "Nana de los Lirios",
				image: "assets/latestRelease/NanaDeLosLirios.png",
				audio: "assets/latestRelease/Nana de los Lirios.mp3",
				youtube: "https://www.youtube.com/watch?v=0mB-4Xb93B8&list=OLAK5uy_kL3KabriCaKlBsWGFfCg0YwW75mWY5368",
				spotify: "https://open.spotify.com/album/0FxuxYUhxGVbJhHi7t8S16",
				apple: "https://music.apple.com/us/album/nana-de-los-lirios-single/1745926206",
				scale: 1,
				xOffset: 0,
				yOffset: -2500,
				//xOffset: -32.6,
				//yOffset: -78.5,
			},
			{
				date: "2024-06-06",
				name : "Parasites",
				image: "assets/latestRelease/parasites_2 3000.png",
				audio: "assets/latestRelease/Parasites.mp3",
				youtube: "https://www.youtube.com/watch?v=dbTAHNilLw0&list=OLAK5uy_lLVd-dqyw5l3OQgLw5JsuzeymAabih3fM",
				spotify: "https://open.spotify.com/album/0E8ajiSwtVTreu8uWT03GE",
				apple: "https://music.apple.com/us/album/parasites-single/1745943392",
				scale: 1,
				xOffset: -1780,
				yOffset: -1000,
				//xOffset: -60,
				//yOffset: -35.5,
			},
			{
				date: "2024-12-29",
				name : "Limitless Skies",
				image: "assets/latestRelease/limitless skies fondo_con_logo_2650x2650(final).png",
				audio: "assets/latestRelease/Limitless Skies (Official Version).mp3",
				youtube: "https://www.youtube.com/@yamikadesu",
				spotify: "https://open.spotify.com/artist/0MNjBbWyyQQtJtDIRn2930",
				apple: "https://music.apple.com/us/artist/yamikadesu/1594208065",
				scale: 1,
				xOffset: -1320,
				yOffset: -1700,
				//xOffset: -40,
				//yOffset: -65.5,
			},
		];

		function manualPause() {
			const backgroundMusic = document.getElementById('background-music');
			backgroundMusic.pause();
			shouldPlayMusic = false; // Evita que se reproduzca automáticamente
		}
		
		function manualPlay() {
			const backgroundMusic = document.getElementById('background-music');
			backgroundMusic.play();
			shouldPlayMusic = true; // Permite la reproducción automática al volver
		}

		let currentXOffset = -1600; // Posición actual de xOffset
		let currentYOffset = -800; // Posición actual de yOffset
		let currentScale = 1;   // Escala actual del fondo

		function updateBackground(scale, xOffset, yOffset) {
			const backgroundImage = document.getElementById('background-image');
			
			
			// Cambiar imagen de fondo
			//backgroundContainer.style.backgroundImage = `url(assets/latestRelease/limitless skies fondo.png)`;
			
			// Simular desplazamiento y zoom (valores ejemplo; pueden ajustarse)
			//const zoomLevel = 1.5; // Nivel de zoom
			//const xOffset = Math.random() * 50 - 25; // Desplazamiento horizontal
			//const yOffset = Math.random() * 50 - 25; // Desplazamiento vertical
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			
			// Límite inferior dinámico
			const minXOffset = -viewportWidth / 2.0; // Punto inicial siempre es -viewportWidth/2
			const minYOffset = -viewportHeight / 2.0; // Punto inicial siempre es -viewportHeight/2
			
			// Desplazamientos máximos para evitar bordes negros
			const maxXOffset = 0.5 * viewportWidth - 3000;
    		const maxYOffset = 0.5 * viewportHeight - 3000;
			
			// Limitar desplazamientos
			//const clampedX = Math.min(maxXOffset, Math.max(-maxXOffset, xOffset));
			//const clampedY = Math.min(maxYOffset, Math.max(-maxYOffset, yOffset));
			//const clampedX = Math.max(-maxXOffset, Math.min(maxXOffset, xOffset));
    		//const clampedY = Math.max(-maxYOffset, Math.min(maxYOffset, yOffset));
			// Desplazamientos ajustados
			const clampedX = Math.min(minXOffset, Math.max(xOffset, maxXOffset));
			const clampedY = Math.min(minYOffset, Math.max(yOffset, maxYOffset));
			
			// Actualizar las variables actuales
			currentXOffset = clampedX;
			currentYOffset = clampedY;
			currentScale = scale;

			backgroundImage.style.setProperty('--from-scale', getComputedStyle(backgroundImage).getPropertyValue('--to-scale') || 1);
			backgroundImage.style.setProperty('--from-xOffset', getComputedStyle(backgroundImage).getPropertyValue('--to-xOffset') || '-1600px');
			backgroundImage.style.setProperty('--from-yOffset', getComputedStyle(backgroundImage).getPropertyValue('--to-yOffset') || '-800px');
			backgroundImage.style.setProperty('--to-scale', scale);
			backgroundImage.style.setProperty('--to-xOffset', `${clampedX}px`);
			backgroundImage.style.setProperty('--to-yOffset', `${clampedY}px`);
			backgroundImage.style.opacity = 0.8;

			// Calcular el desplazamiento
			//const offset = scale * 50;

			backgroundImage.classList.remove('start-animation-background');
			backgroundImage.classList.remove('animated-background');
			// Actualizar transformación y posición			
			//backgroundImage.style.transform = `scale(${scale}) translate(${xOffset}%, ${yOffset}%)`;
			//backgroundImage.style.top = `${offset}%`;
			//backgroundImage.style.left = `${offset}%`;
			void backgroundImage.offsetWidth; // Forzar reflujo para reiniciar la animación
    		backgroundImage.classList.add('animated-background');
		}

		// Función para formatear la fecha
		function formatDate(dateString) {
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			const date = new Date(dateString);
			const day = date.getDate().toString().padStart(2, "0");
			const month = months[date.getMonth()];
			const year = date.getFullYear();
			return `${day} ${month} ${year}`;
		}

		// Función para cerrar información de otros puntos
		function closeAllPoints() {
			const openPointsInfo = document.querySelectorAll(".timeline-info");
			const openPointsDate = document.querySelectorAll(".timeline-date");
			const openPointsAudio = document.querySelector("#timeline-audio");
			if(openPointsAudio){
				if (openPointsAudio.parentElement) {
					openPointsAudio.parentElement.removeChild(openPointsAudio);
				}
			}
			/*openPointsAudio.forEach((element) => {
				if (element) { // Verificar si el elemento existe antes de manipularlo
					if (element.parentElement) {
						element.parentElement.removeChild(element);
					}
					//element.style.display = "none"; // Ocultar imágenes y fechas abiertas
					//const parent = element.parentElement;
					//if (parent) {
					//	parent.innerHTML = ""; // Limpiar contenido del punto
					//}
				}
			});*/
			openPointsInfo.forEach((element) => {
				if (element) { // Verificar si el elemento existe antes de manipularlo
					element.style.animation = "slideDownInfo 0.5s cubic-bezier(0.56, 0, 0.89, 0.67) forwards, fadeOutOpacity 0.4s ease-out forwards"
					// Esperar a que termine la animación
					element.addEventListener("animationend", () => {
						// Eliminar el elemento del DOM después de la animación
						if (element.parentElement) {
							element.parentElement.removeChild(element);
						}
					}, { once: true }); // Ejecutar el listener solo una vez
					//element.style.display = "none"; // Ocultar imágenes y fechas abiertas
					//const parent = element.parentElement;
					//if (parent) {
					//	parent.innerHTML = ""; // Limpiar contenido del punto
					//}
				}
			});
			openPointsDate.forEach((element) => { 
				if (element) { // Verificar si el elemento existe antes de manipularlo 
					element.style.animation = "slideUpDate 0.5s cubic-bezier(0.56, 0, 0.89, 0.67) forwards, fadeOutOpacity 0.4s ease-out forwards"
					// Esperar a que termine la animación
					element.addEventListener("animationend", () => {
						// Eliminar el elemento del DOM después de la animación
						if (element.parentElement) {
							element.parentElement.removeChild(element);
						}
					}, { once: true }); // Ejecutar el listener solo una vez
				}
			});
		}

		// Crear la timeline dinámica con animaciones
		function createTimeline(data) {
			const container = document.getElementById("timeline-container");
			container.innerHTML = ""; // Limpiar el contenedor
			manualPlay();
		
			// Crear la flecha izquierda
			if (currentPage > 0) {
				const leftArrow = document.createElement("div");
				leftArrow.classList.add("timeline-arrow", "timeline-arrow-left");
				leftArrow.innerHTML = `
					<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="m13.789 7.155c.141-.108.3-.157.456-.157.389 0 .755.306.755.749v8.501c0 .445-.367.75-.755.75-.157 0-.316-.05-.457-.159-1.554-1.203-4.199-3.252-5.498-4.258-.184-.142-.29-.36-.29-.592 0-.23.107-.449.291-.591 1.299-1.002 3.945-3.044 5.498-4.243z" fill="white"/>
					</svg>`; // Flecha izquierda
				leftArrow.style.animation = "fadeInArrowLeft 2s ease-out forwards"; // Animación inicial
				leftArrow.addEventListener("click", () => {
					currentPage--;
					createTimeline(data);
				});
				container.appendChild(leftArrow);
			} else {
				const leftPlaceholder = document.createElement("div");
				leftPlaceholder.classList.add("timeline-arrow");
				container.appendChild(leftPlaceholder); // Espacio vacío si no hay flecha
			}
		
			// Crear la zona central para los puntos y la línea
			const content = document.createElement("div");
			content.classList.add("timeline-content");
		
			// Calcular los datos de la página actual
			const startIndex = currentPage * maxPointsPerPage;
			const endIndex = Math.min(data.length, startIndex + maxPointsPerPage);
			const pageData = data.slice(startIndex, endIndex);
			const centerIndex = (pageData.length - 1) / 2; // Centro de los datos de la página actual

			// Si hay más de un punto, agregar la línea con animación
			if (data.length > 1) {
				const line = document.createElement("div");
				line.classList.add("timeline-line");
				if(pageData.length > 1){
					line.style.animation = "lineExpandCenter 2s cubic-bezier(0.4, 0.0, 0.2, 1) forwards";
				}
				else{
					line.style.animation = "lineExpandCenterOne 2s cubic-bezier(0.4, 0.0, 0.2, 1) forwards";
				}
				content.appendChild(line);
			}
		
		
			// Crear los puntos de la página actual con animación retardada
			pageData.forEach((item, index) => {
				const point = document.createElement("div");
				point.classList.add("timeline-point");
				point.style.setProperty("--from-center", `0`);
		
				if (pageData.length === 1) {
					point.classList.add("timeline-point-only");
					point.style.animation = `pointAppearFromCenter 1s ease-out forwards`;
				} else if (pageData.length > 1) {
					const fromCenter = Math.abs(centerIndex - index); // Distancia al centro
					const animationDelay = (fromCenter * 0.3).toFixed(2); // Tiempo basado en la distancia
					point.style.animationDelay = `${animationDelay}s`;
		
					setTimeout(() => {
						point.style.animation = `pointAppearFromCenter 1s ease-out forwards`;
					}, animationDelay * 900);
				}
		
				// Añadir evento al clic en cada punto
				point.addEventListener("click", () => handleTimelineClick(item, point));
				content.appendChild(point);
			});
		
			container.appendChild(content);
		
			// Crear la flecha derecha
			if (endIndex < data.length) {
				const rightArrow = document.createElement("div");
				rightArrow.classList.add("timeline-arrow", "timeline-arrow-right");
				rightArrow.innerHTML = `
					<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="m10.211 7.155c-.141-.108-.3-.157-.456-.157-.389 0-.755.306-.755.749v8.501c0 .445.367.75.755.75.157 0 .316-.05.457-.159 1.554-1.203 4.199-3.252 5.498-4.258.184-.142.29-.36.29-.592 0-.23-.107-.449-.291-.591-1.299-1.002-3.945-3.044-5.498-4.243z" fill="white"/>
					</svg>`; // Flecha derecha
				rightArrow.style.animation = "fadeInArrowRight 2s ease-out forwards"; // Animación inicial
				rightArrow.addEventListener("click", () => {
					currentPage++;
					createTimeline(data);
				});
				container.appendChild(rightArrow);
			} else {
				const rightPlaceholder = document.createElement("div");
				rightPlaceholder.classList.add("timeline-arrow");
				container.appendChild(rightPlaceholder); // Espacio vacío si no hay flecha
			}
		}
		let activeAudio = null;

		function handleTimelineClick(item, point) {
			const existingImage = point.querySelector("img");
			const existingDate = point.querySelector(".timeline-date");
			const existingVideo = point.querySelector("iframe");
			//const timelineContainer = document.getElementById("timeline-container");
			//const audioElement = document.getElementById("background-music");
			activeAudio = null;
			// Cerrar otros puntos abiertos
			closeAllPoints();
		
			manualPlay();
			// Si ya hay contenido visible en este punto, cerrarlo
			if (existingImage || existingDate || existingVideo) {
			//if (backgroundMusic) {
				//point.innerHTML = ""; // Limpiar contenido del punto
				//timelineContainer.style.marginTop = "30px"; // Resetear margen
				//audioElement.play(); // Reanudar música de fondo
				return;
			}
		
			// Crear la imagen y el texto con animación
			const imageElement = document.createElement("img");
			imageElement.src = item.image;
			imageElement.classList.add("timeline-info");
			//imageElement.style.animation = "imageSlideUp 0.5s cubic-bezier(0, 0, 0, 1)"; // Animación al aparecer
			point.appendChild(imageElement);
			
			imageElement.addEventListener('click', (event) => {
				event.stopPropagation();
				// Si hay un video abierto, lo cerramos
				if (activeAudio != null) {
					if (activeAudio.parentElement) {
						activeAudio.parentElement.removeChild(activeAudio);
					}
					imageElement.classList.remove("timeline-info-audio");
					activeAudio = null;
					manualPlay();
					return;
				}
		
				const audioElement = document.createElement("audio");
				audioElement.id = "timeline-audio";
				audioElement.src = `${item.audio}`;
				audioElement.loop = true;
				imageElement.appendChild(audioElement);
				imageElement.classList.add("timeline-info-audio");
				/*imageElement.innerHTML = `
					<iframe 
						class="timeline-video"
						src="${item.video}?autoplay=1" 
						frameborder="0" 
						allow="autoplay; encrypted-media"
						allowfullscreen>
					</iframe>
				`;*/

				/*if (imageElement.parentElement) {
					imageElement.parentElement.removeChild(imageElement);
				}*/

				manualPause(); // Pausar la música de fondo
				/*if (item.date === "2024-12-29") {
					window.open("", "_blank"); // TODO!
					return;
				}*/
				activeAudio = audioElement; // Marcar el punto como activo
				activeAudio.play();
			});




			const dateElement = document.createElement("div");
			dateElement.classList.add("timeline-date");
			const txtNameElement = document.createElement("div");
			txtNameElement.classList.add("timeline-inner-name");
			txtNameElement.innerHTML = `${item.name}`; // Formatear la fecha
			const txtDateElement = document.createElement("div");
			txtDateElement.classList.add("timeline-inner-date");
			txtDateElement.innerHTML = `${formatDate(item.date)}`;
			//dateElement.style.animation = "dateSlideDown 0.5s cubic-bezier(0, 0, 0, 1)"; // Animación al aparecer

			// Crear el contenedor de los iconos
			const iconsContainer = document.createElement("div");
			iconsContainer.classList.add("icons-container");

			// Iconos individuales
			const youtubeIcon = document.createElement("a");
			youtubeIcon.href = item.youtube;
			youtubeIcon.target = "_blank"; // Abrir en una nueva pestaña
			youtubeIcon.innerHTML = `<svg aria-labelledby="icon-title"><title id="icon-title">YouTube</title><use xlink:href="assets/icons.svg#youtube-alt"></use></svg>`;
			// Configurar el color del SVG para YouTube
			//const youtubeSvg = youtubeIcon.querySelector("svg");
			//youtubeSvg.setAttribute("fill", "#FF0000"); // Rojo de YouTube

			youtubeIcon.addEventListener("click", (event) => {
				event.stopPropagation();
				const backgroundMusic = document.getElementById('background-music'); // Asegúrate de que exista este elemento
				if(activeAudio != null && !activeAudio.paused){
					activeAudio.pause();
				}
				else if (!backgroundMusic.paused) {
					shouldPlayMusic = true; // Registrar que la música debe reproducirse al volver
					backgroundMusic.pause(); // Pausar música
				}
			});
			
			const spotifyIcon = document.createElement("a");
			spotifyIcon.href = item.spotify;
			spotifyIcon.target = "_blank"; // Abrir en una nueva pestaña
			spotifyIcon.innerHTML = `<svg aria-labelledby="icon-title"><title id="icon-title">Spotify</title><use xlink:href="assets/icons.svg#spotify"></use></svg>`;
			// Configurar el color del SVG para Spotify
			//const spotifySvg = spotifyIcon.querySelector("svg");
			//spotifySvg.setAttribute("fill", "#1DB954"); // Verde de Spotify
			spotifyIcon.addEventListener("click", (event) => {
				event.stopPropagation();
				const backgroundMusic = document.getElementById('background-music'); // Asegúrate de que exista este elemento
				if(activeAudio != null && !activeAudio.paused){
					activeAudio.pause();
				}
				else if (!backgroundMusic.paused) {
					shouldPlayMusic = true; // Registrar que la música debe reproducirse al volver
					backgroundMusic.pause(); // Pausar música
				}
			});

			const appleMusicIcon = document.createElement("a");
			appleMusicIcon.href = item.apple;
			appleMusicIcon.target = "_blank"; // Abrir en una nueva pestaña
			appleMusicIcon.innerHTML = `<svg aria-labelledby="icon-title"><title id="icon-title">Apple</title><use xlink:href="assets/icons.svg#apple"></use></svg>`;
			// Configurar el color del SVG para Apple Music
			//const appleSvg = appleMusicIcon.querySelector("svg");
			//appleSvg.setAttribute("fill", "#A3AAAE"); // Gris de Apple Music
			appleMusicIcon.addEventListener("click", (event) => {
				event.stopPropagation();
				const backgroundMusic = document.getElementById('background-music'); // Asegúrate de que exista este elemento
				if(activeAudio != null && !activeAudio.paused){
					activeAudio.pause();
				}
				else if (!backgroundMusic.paused) {
					shouldPlayMusic = true; // Registrar que la música debe reproducirse al volver
					backgroundMusic.pause(); // Pausar música
				}
			});

			// Agregar los iconos al contenedor
			iconsContainer.appendChild(youtubeIcon);
			iconsContainer.appendChild(spotifyIcon);
			iconsContainer.appendChild(appleMusicIcon);

			dateElement.appendChild(txtNameElement);
			dateElement.appendChild(txtDateElement);
			dateElement.appendChild(iconsContainer);

			point.appendChild(dateElement);
		
			// Mostrar la imagen y el texto
			imageElement.style.display = "block";
			dateElement.style.display = "block";
		
			updateBackground(item.scale, item.xOffset, item.yOffset);

			// Mover la timeline hacia abajo
			//timelineContainer.style.marginTop = "100px"; // Ajustar margen para dejar espacio
		
			// Evento al hacer clic en la imagen
			/*imageElement.addEventListener("click", (event) => {
				event.stopPropagation(); // Evitar que el evento del punto se dispare
				window.open(item.video, "_blank"); // Abrir el video en una nueva ventana
			});*/
		}
		
		
		// Variable para controlar si la música debería estar activa
		let shouldPlayMusic = false;

		// Detectar cuando la pestaña gana o pierde foco
		window.addEventListener("focus", () => {
			const backgroundMusic = document.getElementById('background-music'); // Asegúrate de que exista este elemento
			if (document.visibilityState === "visible") {
				if(activeAudio != null && activeAudio.paused){
					activeAudio.play();
				}
				else if(shouldPlayMusic){
					backgroundMusic.play(); // Reproducir música al volver a la pestaña
				}
			}
		});

		window.addEventListener("blur", () => {
			/*const backgroundMusic = document.getElementById('background-music'); // Asegúrate de que exista este elemento
			if(activeAudio != null && !activeAudio.paused){
				activeAudio.pause();
			}
			else if (!backgroundMusic.paused) {
				shouldPlayMusic = true; // Registrar que la música debe reproducirse al volver
				backgroundMusic.pause(); // Pausar música
			}*/
		});

		// Detectar cambios en la visibilidad del documento
		document.addEventListener("visibilitychange", () => {
			const backgroundMusic = document.getElementById('background-music'); // Asegúrate de que exista este elemento
			if (document.visibilityState === "visible") {
				if(activeAudio != null && activeAudio.paused){
					activeAudio.play();
				}
				else if(shouldPlayMusic){
					backgroundMusic.play(); // Reproducir música al volver a la pestaña
				}
			} 
			/*else if (document.visibilityState === "hidden") {
				if(activeAudio != null && !activeAudio.paused){
					activeAudio.pause();
				}
				else if (!backgroundMusic.paused) {
					shouldPlayMusic = true; // Registrar que la música debe reproducirse al volver
					backgroundMusic.pause(); // Pausar música
				}
			}*/
		});

		let intervalId;

		function startRelease(){
			const main = document.getElementById("main");
			const hiddenContainer = document.getElementById("hidden-container");
			const timelineContainer = document.getElementById("timeline-container");
			const audio = document.getElementById("background-music");
			const countdownElement = document.getElementById("countdown");
			const backgroundImage = document.getElementById('background-image');
			function updateCountdown() {
				const now = new Date();
				// Obtener el desfase en minutos (negativo si estás por delante de UTC, positivo si estás por detrás)
				const offsetMinutes = now.getTimezoneOffset();

				// Ajustar la fecha local sumando el desfase (convertido a milisegundos)
				const nowUTC = new Date(now.getTime() + offsetMinutes * 60 * 1000);
			
				//console.log("Hora local:", now.toISOString());
				//console.log("Hora UTC:", nowUTC.toISOString());
				const targetDateUTC = Date.UTC(2024, 11, 28, 23, 0, 0); // 2024-12-29 00:00:00 en UTC+1

				// Ajustar manualmente para UTC+1
				//const targetDate = new Date('2024-12-29T00:00:00'); // Cambia esta fecha según sea necesario

				const difference = targetDateUTC - nowUTC;
	
				if (difference < 0) {
					//countdownElement.textContent = "00:00:00:00";
					countdownElement.innerHTML = `
						<img class="countdown-image" src="assets/latestRelease/logoRecortado.png"/>
					`;
					return false;
				}
	
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
				const minutes = Math.floor((difference / (1000 * 60)) % 60);
				const seconds = Math.floor((difference / 1000) % 60);
	
				countdownElement.textContent = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
				return true;
			}
			
			//console.log("DEBUG TEXT")
			// Reproducir música inmediatamente
			audio.play();
		
			// Desvanecer el div principal
			main.classList.add("fade-out");
		
			// Mostrar el contenedor del contador con animación de opacidad
			setTimeout(() => {
				const wrapper = document.getElementById("wrapper");
				wrapper.style.display = "none";
				main.style.display = "none";
				hiddenContainer.style.display = "flex";
				document.body.style.overflow = 'hidden';
				
				document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
				window.addEventListener('wheel', function(event) {
					event.preventDefault(); // Prevenir el scroll
				}, { passive: false });

				window.addEventListener('contextmenu', function(event) {
					event.preventDefault(); // Prevenir el menú contextual
				}, { passive: false });

				// Detectar fin de la animación del contenedor
				hiddenContainer.addEventListener("animationend", () => {
					backgroundImage.style.setProperty('--from-scale', getComputedStyle(backgroundImage).getPropertyValue('--to-scale') || 1);
					backgroundImage.style.setProperty('--from-xOffset', getComputedStyle(backgroundImage).getPropertyValue('--to-xOffset') || '-1600px');
					backgroundImage.style.setProperty('--from-yOffset', getComputedStyle(backgroundImage).getPropertyValue('--to-yOffset') || '-800px');
					backgroundImage.style.setProperty('--to-scale', 1);
					backgroundImage.style.setProperty('--to-xOffset', `-1600px`);
					backgroundImage.style.setProperty('--to-yOffset', `-800px`);
					countdownElement.classList.add("start-animation"); // Añadir la clase de animación
					updateCountdown();
					intervalId = setInterval(()=>{
						if(!updateCountdown()){
							clearInterval(intervalId);
						}
					}, 500); // Actualiza cada segundo
					setTimeout(() => {
						backgroundImage.classList.add("start-animation-background");
						backgroundImage.addEventListener("animationend", () => {
							// Evento resize para ajustar los límites dinámicamente
							window.addEventListener('resize', () => {
								const viewportWidth = window.innerWidth;
								const viewportHeight = window.innerHeight;

								// Límite inferior dinámico
								const minXOffset = -viewportWidth / 2.0;
								const minYOffset = -viewportHeight / 2.0;

								// Desplazamientos máximos para evitar bordes negros
								const maxXOffset = 0.5 * viewportWidth - 3000;
								const maxYOffset = 0.5 * viewportHeight - 3000;

								// Recalcular y ajustar los valores actuales de offset
								const clampedX = Math.min(minXOffset, Math.max(currentXOffset, maxXOffset));
								const clampedY = Math.min(minYOffset, Math.max(currentYOffset, maxYOffset));

								// Actualizar el fondo con los nuevos valores
								updateBackground(currentScale, clampedX, clampedY);
							});
						}, { once: true });
						timelineContainer.style.opacity = "1";
						createTimeline(timelineData);
					}, 4000); // Asegura que el contador se haya mostrado
				}, { once: true });
			}, 2000); // Tiempo de desvanecimiento del `main`
		}

		// Inicialización al mostrar el contador
		/*document.getElementById("latest-release-button").addEventListener("click", () => {
			setTimeout(() => {
				const timelineContainer = document.getElementById("timeline-container");
				timelineContainer.style.opacity = "1"; // Mostrar la Timeline con transición
				createTimeline(timelineData);
				}, 2000); // Después de la animación del contador
				});*/
				
				//Código para el Contador
		document.getElementById("latest-release-button").addEventListener("click", function () {
			startRelease();
		}, { once: true });
})();