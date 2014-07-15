/**
TR1CK CAROUSEL

This plugin requires:
	• Modernizr w/ Touch Events
	• TweenLite
**/
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "tr1ckCarousel",
			defaults = {
				timeout: 1000,
				speed: 1,
				continuous: true,
				caption: true,
				captionCls: null,
				onComplete: null,
				arrows: true,
				indicators: true,
				breakpoint: 768,
				onInit: function(origin, content) {},
				onReady: function(origin, content) {},
				arrowOmniture: {
					prev: null,
					next: null
				}
			};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.ele 			= $(element);
				this.settings 		= $.extend( {}, defaults, options );
				this._defaults 		= defaults;
				this._name 			= pluginName;

				this.touch 			= ( $('html.touch').length!==0 ) ? true : false; // Is the user on a touch device?
				this.ie				= ( $('html.lt-ie9').length!==0 ) ? true : false;

				// CAROUSEL
				this.wrapper 		= null; 				// This gets set when _init is triggered.
				this.slides 		= this.ele.children(); 	// Object containing all slide elements.
				this.numOfSlides 	= this.slides.length;  	// Number of total slides.
				this.firstSlide 	= this.slides.first(); 	// The first slide.
				this.lastSlide 		= this.slides.last();  	// The last slide.

				this.initW;
				this.initH;
				this.ratio;

				this.captionCls 	= ( this.settings.captionCls !== null ) ? this.settings.captionCls : 'caption'; // Set the class used for captions

				// INDICATORS
				this.indicators 	= null;
				this.indicatorsBtns	= [];

				// ARROWS
				this.arrowPrev		= null; // Set a variable for arrows if arrows are enabled.
				this.arrowNext		= null; //


				this.timer			= null; // Carousel timer.
				this.count			= 0; 	// Carousel counter.
				this.curIdx			= null;
				this.curslide		= null;

				this._init();
		}

		Plugin.prototype = {
				_init: function () {

						var _self = this;

						this.ele.wrap('<div class="carousel-wrapper"></div>');
						this.wrapper = $('.carousel-wrapper').css('overflow', 'hidden');

						//
						// #1 Set the following variables
						//
						this.initW 			= this.firstSlide.children('img').outerWidth(true); 	// Width of the first image.
						this.initH			= this.firstSlide.children('img').outerHeight(true); 	// Height of the first image.
						this.ratio			= this.initH / this.initW; 								// Image height to width ratio.

						//
						// #2 Clone first slide and update slide variable.
						//
						this.firstSlide.clone().appendTo( this.ele ); 				// Clone the first slide and append it to the end of the carousel.
						this.slides 		= this.ele.children();					// Update this.slides to include the cloned first slide.

						//
						// #3 Set the width of carousel
						//
						this.ele.width(
							Math.ceil((this.initW * (this.numOfSlides + 4)))
						); 															// Resize the carousel element so we can float all the slides hortizontal.
						this.slides.width(this.initW) 								// Set the initial slide width.


						// TEMPORARY - DO THIS A BETTER WAY!!!
						// Add in a preloader for each image.
						if(this.initW===0){
							this.temporaryReset();
						}

						/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
						Above: This creates one long panel with all the slide next to one another. This element slide
						across the X access to its new position when an arrow / button is clicked or the timer is triggered.
						We clone the first slide so when you reach the end we can shift the position backt to 0 without
						anyone noticing.
						!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */

						this.firstSlide.addClass('cur');		// Set the first slide the current slide.
						this.curIdx = this.firstSlide.index();	// Set the first slide the current index.
						this.curslide = this.firstSlide;		// Set current slide.

						/* ------------------------------------------------------------
						*	If Arrows is set to "true" add the arrows elements
						*	to the page.
						*/
						if(this.settings.arrows===true){

							if(this.settings.arrowOmniture.prev !== null && this.settings.arrowOmniture.next !== null){
								this.wrapper.prepend('<div class="nav-arrows prev" data-omniture="'+this.settings.arrowOmniture.prev+'"></div>');
								this.wrapper.prepend('<div class="nav-arrows next" data-omniture="'+this.settings.arrowOmniture.next+'"></div>');
							}
							else{
								this.wrapper.prepend('<div class="nav-arrows prev"></div>');
								this.wrapper.prepend('<div class="nav-arrows next"></div>');
							}

							this.arrowPrev = $('.nav-arrows.prev');
							this.arrowNext = $('.nav-arrows.next');

							this.arrowPrev.click(function(e){
								e.preventDefault();

								omn_rmaction($(this).data('omniture')); // Fire Omniture

								_self.stopAutoSlideshow();	// Clear Auto slideshow interval
								_self.animateTo(_self.curIdx - 1);
							});

							this.arrowNext.click(function(e){
								e.preventDefault();

								omn_rmaction(); // Fire Omniture

								_self.stopAutoSlideshow();	// Clear Auto slideshow interval
								_self.animateTo(_self.curIdx + 1);
							});
						}
						/* End
						------------------------------------------------------------*/

						/* ------------------------------------------------------------
						*	If indicators is set to "true" setup indictor navigations
						*/
						if(this.settings.indicators===true){

							// Make this optional in the future...
							// this.ele.append('<div id="indicators"></div>');

							this.indicators = $('#indicators');

							for (var i = this.numOfSlides - 1; i >= 0; i--) {
								var cls, tmp;

								cls = '';
								if(this.numOfSlides -1===i) cls = ' class="cur"';
								tmp = $('<a href="#"'+cls+'>&#8226;</a>');
								this.indicators.append( tmp );
							};

							for (var i = this.indicators.children().length - 1; i >= 0; i--) {
								var btn, thisIdx;

								btn = this.indicators.children().eq(i);
								btn.click(function(e){
									e.preventDefault();
									thisIdx = $(this).index();
									_self.stopAutoSlideshow(); // Clear Auto slideshow interval
									_self.animateTo(thisIdx);
								})
							};

						}
						/* End
						------------------------------------------------------------*/

						/* ------------------------------------------------------------
						*	If the user is on a touch device then we have to detect
						*	touch events.
						*	SwipeLeft, SwipeRight
						*/

						// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
						// NEEDS DEVELOPMENT
						// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

						/* End
						------------------------------------------------------------*/


						/* ------------------------------------------------------------
						*	If captions is set to "true" the make sure the captions
						*	show up.
						*/
						if(this.settings.caption===true){
							$('.'+this.settings.captionCls).show();
						}
						/* End
						------------------------------------------------------------*/

						//
						// Resize the elements when the browser resizes
						//
						$(window).resize(function(){ _self.resize(); });

						//
						// Start the slide show and initialize the resize.
						//
						this.startAutoSlideshow();
						this.resize();

						if( $.isFunction(this.settings.onInit) ){
							this.settings.onInit.call(this)
						}
				},
				temporaryReset: function(){
					var _self = this;
					window.setTimeout(function(){
						_self.initW = _self.firstSlide.children('img').outerWidth(true);
						_self.initH = _self.firstSlide.children('img').outerHeight(true);

						_self.curslide.height(_self.initH).width(_self.initW);
						_self.wrapper.height(_self.initH).width(_self.initW);
						_self.slides.height(_self.initH).width(_self.initW);
						_self.slides.find('img').height(_self.initH).width(_self.initW);
						_self.ele.height(_self.initH).width( (_self.initW * _self.numOfSlides) / 0.5 );

					}, 1000);
				},
				animateTo: function (idx) {
					var _self = this;
					var tweenOpts;

					if(idx>=0){
						this.curIdx = idx;

						this.indicators.find('a.cur').removeClass('cur');
						if(idx===this.numOfSlides){
							this.indicators.find('a').eq(0).addClass('cur');
						}
						else if(idx > this.numOfSlides){
							_self.resetCarousel();
							this.curIdx  = 0;
							this.indicators.find('a').eq(0).addClass('cur');
							return false;
						}
						else{
							this.indicators.find('a').eq(idx).addClass('cur');
						}

						if(this.ie){
							tweenOpts = {
								marginLeft: 0 - this.curslide.width() * idx
							}
						}
						else{
							tweenOpts = {
								x: 0 - this.curslide.width() * idx
							}
						}

						TweenLite.to(this.ele, this.settings.speed, {
							css: tweenOpts,
							ease: Power2.easeOut,
							onComplete: function(){


								if(idx === _self.numOfSlides){
									_self.resetCarousel();
									_self.indicators.find('a.cur').removeClass('cur');
									_self.indicators.find('a').eq(0).addClass('cur');
									idx = 0;
									_self.curIdx = idx;
								}
								else if(idx > _self.numOfSlides){
									idx = 0;
									_self.curIdx = idx;
									_self.resetCarousel();
									_self.indicators.find('a.cur').removeClass('cur');
									_self.indicators.find('a').eq(idx).addClass('cur');
								}

								_self.ele.find('.cur').removeClass('cur');
								_self.slides.eq(idx).addClass('cur');
								_self.curslide = _self.slides.eq(idx);

								_self.resize();
							}
						});
					}
				},
				resetCarousel: function(){
					var tweenOpts;
					if(this.ie){
						tweenOpts = {
							marginLeft: 0
						}
					}
					else{
						tweenOpts = {
							x: 0
						}
					}
					TweenLite.set(this.ele, { css: tweenOpts });

				},
				resize: function(){

					this.slides.width(this.wrapper.width()+1);
					this.ele.height( this.curslide.height() );
					this.wrapper.height( this.curslide.height() );

					var tweenOpts;
					if(this.ie){
						tweenOpts = {
							marginLeft: 0 - this.curslide.width() * this.curIdx
						}
					}
					else{
						tweenOpts = {
							x: 0 - this.curslide.width() * this.curIdx
						}
					}

					TweenLite.set(this.ele, { css: tweenOpts });
				},
				startAutoSlideshow: function(){
					var _self = this;
					this.timer = window.setInterval(function(){
						var loop = 0;
						_self.count++;

						if(_self.settings.continuous===true){
							loop = 1;
						}

						if(_self.count===_self.numOfSlides + loop) _self.count = 0;
						_self.animateTo(_self.count);

					}, this.settings.timeout);
				},
				stopAutoSlideshow: function(){
					clearInterval(this.timer);
					this.timer = 0;
				}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
			this.each(function() {
					if ( !$.data( this, "plugin_" + pluginName ) ) {
							$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
					}
			});

			// chain jQuery functions
			return this;
		};

})( jQuery, window, document );