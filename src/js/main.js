$(document).ready(function () {
	// longpv
	//
	//
	//
	//
	//
	// vucoder
	//
	//
	//
	//
	//
	// ncd
	(function ($, window) {
		// Create a custom method to add a box
		WOW.prototype.addBox = function (element) {
			this.boxes.push(element);
		};
	
		// Initialize WOW.js
		new WOW().init();

		$('.carousel').slick({
			slidesToShow: 3,
			autoplay: true,
			autoplaySpeed: 4000,
			responsive: [
				{
					breakpoint: 1200,
					settings: {
						slidesToShow: 2
					}
				}
			]
		  });
	})(jQuery, window);
});
