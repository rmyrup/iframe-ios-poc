/* global s9, Handlebars, MathJax, mhe */
// W117: '...' is not defined
// jshint -W117

try {
  var iframe = window.frameElement,
      winParent = window.parent;
  $(winParent.document).ready(function() {
    var parent$ = winParent.jQuery;
    if (parent$) {
      parent$(iframe).trigger('iframeloading');
      $(function() {
        parent$(iframe).trigger('iframeready');
      });
    }
  });
}
catch(e) {
}


var scale = 1;
var ctrlOrientation = "horizontal";
var sliderHorizontalWidth;

var currentDocHeight, currentDocWidth;
var procrustes;
var localeLabels = {};

function handleLocaleChange() {
    localeLabels.previousSlide = mhe.i18n.tr('previous');
    localeLabels.nextSlide = mhe.i18n.tr('next');
    localeLabels.slideNum = mhe.i18n.tr('slide-num');
    $('#next[role="button"]').attr('aria-label', localeLabels.nextSlide);
    $('#previous[role="button"]').attr('aria-label', localeLabels.previousSlide);
    $('.ui-slider-tick-mark[role="button"]').each(function(index, el) {
        $(this).attr('aria-label', localeLabels.slideNum + ' ' + $(this).attr('data-slide-number'));
    });
}

mhe.i18n.init('../shared/').then(handleLocaleChange);


$(document).ready(function() {


    function receiveMessage(event) {
        var message = event.data;
        var type = message.action || message.type;
        switch (type) {
            case 'widget-display-context':
                if(message.properties.themeCssFile){
                  mhe.linkToThemeCSS(message.properties.themeCssFile);
                }
                break;
            case 'locale':
                mhe.i18n.changeToLocale(message.properties.locale)
                    .then(handleLocaleChange);
                break;
        }
    }

    window.addEventListener('message', receiveMessage, true);

	var lastTickMark; // equal to number of images

	// variables for values
	var decVal;

	var last = 0;
	var lastStop = 0;

	// variables for each element
	var prevImage;
	var currentImage;
	var nextImage;
	var prevLabel;
	var currentLabel;
	var nextLabel;
	var prevCaption;
	var currentCaption;
	var nextCaption;

	var imageNaturalHeights = [];
	var imageNaturalWidths = [];

	var layoutInfo = getLayoutKeys();


	function clearGhosts(start, end) {
        $('.image').each(function() {
        	if (this.getAttribute('id') === 'image' + start || this.getAttribute('id') === 'image' + end) {
        		return;
        	}
        	$(this).css({opacity: 0});
        });
    }

  function runHandleBars(){
    // Extract the text from the template .html() is the jquery helper method for that
    image_template = $('#image-temp').html().replace(/\/\/<\!\[CDATA\[|\/\/\]\]>/g, '');
    label_template = $('#label-temp').html().replace(/\/\/<\!\[CDATA\[|\/\/\]\]>/g, '');
    caption_template = $('#caption-temp').html().replace(/\/\/<\!\[CDATA\[|\/\/\]\]>/g, '');
    // Compile that into an handlebars template
    imageTemplate = Handlebars.compile(image_template);
    labelTemplate = Handlebars.compile(label_template);
    captionTemplate = Handlebars.compile(caption_template);
    // Retrieve the placeHolder where the Posts will be displayed
    imageHolder = $("#slide_images");
    labelHolder = $("#slide_labels");
    captionHolder = $("#slide_captions");
  }


  function writeSlideAndTextContainersIntoLayout(aLetter){

  	// find the object with the appropritae letter....
  	var currObject = layoutInfo.filter(function(obj) {
        return obj.name === aLetter;
    })[0];

   // add the corresponding html as string
    $('#widget_container').append(currObject.htmlString);

  }

// ********************************************************************************************
// start accessibility mode code

  var currTargetIndex = 0;
  var isHiliteShowing = false;
  var accessTargets = [];
  var lastIndex;

  function goToNextMarker(){
    var s = $("#slider"), val = s.slider("value"), step = 1;
    lastTickMark = $('#slide_images .image').length;
    if (val < lastTickMark){
      s.slider("value", val + step);
      slideStop(s.ui);
    }
  }


  function goToPreviousMarker(){
	  var s = $("#slider"), val = s.slider("value"), step = 1;
    s.slider("value", val - step);
    slideStop(s.ui);
  }


  // if background is clicked, this gets rid of accessibility mode
  $(document).on("click", function(){
	  $(".hilites").remove();
	  isHiliteShowing = false;
  });


  function hideMarkerHilight(){
	  $(".hilites").remove();
	  isHiliteShowing = false;
  }


  document.onkeydown = function(e){
  	e.preventDefault();
    e = e || window.event;
	  var charCode = e.charCode || e.keyCode;
	  // filter which key events can come through
	  var allowedKeys = [9,13,40,38];
    if(ctrlOrientation === "horizontal"){
		  allowedKeys = [9,13,37,39];
    }

	  // 37 - left arrow, 39 - right arrow,
    if($.inArray(charCode,allowedKeys) === -1){
	  // filter wrong keys....
    // only allow valid keys to get through
      return;
    }

    if ((charCode === 13 )&& (!isHiliteShowing)){
      // do not allow enter to be processed if there
      // is nothing showing yet
      return;
    }

	  // build array of targets on first keydone
	  // needs to be built this way
    if(accessTargets.length === 0){
      accessTargets = $("#slider").children("span").toArray();

      // after css changes, pulsing cursor is now a span and
      // first in the div, so remove it from array of targets
      accessTargets.shift();

	    if(ctrlOrientation === "vertical-up"){
		    accessTargets.reverse();
	    }
	    // add start and finish buttons
      accessTargets.unshift($("#previous"));
      accessTargets.push($("#next"));
      lastIndex = accessTargets.length - 1;

      if (ctrlOrientation === "vertical"){
		    currTargetIndex = accessTargets.length - 1;
      }else{
		    currTargetIndex = 0;
      }
    }

     // process left/right/up/down tab here.....
    if(charCode === 37){
	    hideMarkerHilight();
      goToPreviousMarker();
      return;
    }else if (charCode === 39){
	    hideMarkerHilight();
	    goToNextMarker();
      return;
   	}else if(charCode === 40){
	    hideMarkerHilight();
	    goToPreviousMarker();
	    return;
	  }else if(charCode === 38){
      hideMarkerHilight();
	    goToNextMarker();
	    return;
	  }

    // handle the enter key here...
    // assumes there is already a vaild target showing
    if ((charCode === 13) && (isHiliteShowing === true)){

      if (currTargetIndex === 0){
		    // next button
	      goToPreviousMarker();

      }else if (currTargetIndex === lastIndex){
    	  // previous button
		    goToNextMarker();

      }else{
        var tNum = (lastIndex - currTargetIndex);
        var s = $("#slider");

        if ((ctrlOrientation === "horizontal")||(ctrlOrientation === "vertical-up")){
          s.slider({}, {"value": currTargetIndex});
	      }else if (ctrlOrientation === "vertical"){
		      s.slider("value",  -1 * tNum);
	      }
        slideStop(s.ui);
      }
        // do not render a change in highlite position
    	return;
    }


    // determine changes to the target index
    if (charCode === 9){
    // user hit enter, with shift key, so
	  // go backward
      if(e.shiftKey){
    	  if (isHiliteShowing === true){
     	 // remove last highlights
     	 // increment the index, to be handled below
        $(".hilites").remove();

		    if ((ctrlOrientation === "horizontal")||(ctrlOrientation === "vertical-up")){
			    if (currTargetIndex > 0 ){
	     	    currTargetIndex--;
	     	  }
		    }else if (ctrlOrientation === "vertical"){
			    if (currTargetIndex < lastIndex ){
			      currTargetIndex++;
			    }
	      }

      }else{
     	 // no highlight so do not increment
     	 isHiliteShowing = true;
      }

    }else{
	  // user hit enter, but not with shift key, so
	  // go forward
      if (isHiliteShowing === true){
     	   // remove last highlights
         $(".hilites").remove();

		    if ((ctrlOrientation === "horizontal")||(ctrlOrientation === "vertical-up")){
     	     if (currTargetIndex < lastIndex ){
     	   	   currTargetIndex++;
     	     }
        }else if (ctrlOrientation === "vertical"){
			    if (currTargetIndex > 0 ){
	     	    currTargetIndex--;
	     	  }
        }
      }else{
     	  // no highlight so do not increment
     	  isHiliteShowing = true;
      }
     }
    }


	// implement the actions determined by the target index input above
	if(ctrlOrientation === "horizontal"){
		if(currTargetIndex === 0){
	     	// add to left side
	    $("#previous").prepend("<div id='hilite' class='hilites' style='height:30px;width:30px;border:4px solid red;border-style: dotted;top:4px;left:-6px;position:absolute'><div>");
	  }else if (currTargetIndex >= lastIndex){
	     	// add to right side
	    $("#next").prepend("<div id='hilite' class='hilites' style='height:30px;width:30px;border:4px solid red;border-style: dotted;top:4px;left:-6px;position:absolute'><div>");
	  }else{
	     	// middle
	    $(accessTargets[currTargetIndex]).append("<div id='hilite' class='hilites' style='height:25px;width:25px;'><div>");
			$("#hilite").append("<div id='innerhilite' style='height:30px;width:30px;border:4px solid red;border-style: dotted;top:-10px;left:-10px;position:absolute;'><div>");
	  }
	}else if((ctrlOrientation === "vertical") ||(ctrlOrientation === "vertical-up") ) {

	  if(currTargetIndex === 0){
	    // add to bottom
	    $("#previous").prepend("<div id='hilite' class='hilites' style='height:20px;width:20px;border:4px solid red;border-style: dotted;top:-1px;left:-1px;position:absolute'><div>");
	  }else if (currTargetIndex >= lastIndex){
	    // add to top
	    $("#next").prepend("<div id='hilite' class='hilites' style='height:20px;width:20px;border:4px solid red;border-style: dotted;top:-1px;left:-1px;position:absolute'><div>");
	  }else{
	     	// middle
	    $(accessTargets[currTargetIndex]).append("<div id='hilite' class='hilites' style='height:20px;width:20px;'><div>");
			$("#hilite").append("<div id='innerhilite' style='height:20px;width:20px;border:4px solid red;border-style: dotted;top:-5px;left:-5px;position:absolute;'><div>");
	  }
	}
};

// stop accessibility mode code
//********************************************************************************************

	function slideStart (ui) {
		$('.image').css({"visibility": "visible"})
				   .attr('aria-hidden', true);
		$('.label').css({"visibility": "hidden"});
		$('.caption').css({"visibility": "hidden"});
		$('.overlay').css({"visibility": "hidden"});
	}

	function slideStop( ui ) {
		$('.ui-slider-handle').removeClass('pulsing');
		var wholeVal = Math.abs(Math.round($('#slider').slider("value")));
		if (ctrlOrientation === "vertical") {
			$( "#slider" ).slider( "value", -wholeVal );
		} else {
			$( "#slider" ).slider( "value", wholeVal );
		}
		prevImage = document.getElementById('image' + (wholeVal - 1));
		currentImage = document.getElementById('image' + wholeVal);
		nextImage = document.getElementById('image' + (wholeVal + 1));

		prevLabel = document.getElementById('label' + (wholeVal - 1));
		currentLabel = document.getElementById('label' + wholeVal);
		nextLabel = document.getElementById('label' + (wholeVal + 1));

		prevCaption = document.getElementById('caption' + (wholeVal - 1));
		currentCaption = document.getElementById('caption' + wholeVal);
		nextCaption = document.getElementById('caption' + (wholeVal + 1));

		var currentOverlays = $('.overlays' + wholeVal);


		$('.image').css({"opacity": 0, "visibility": "hidden"});
		$('.label').css({"opacity": 0, "visibility": "hidden"});
		$('.caption').css({"opacity": 0, "visibility": "hidden"});
		$('.overlay').css({"opacity": 0, "visibility": "hidden"});
		//$('[aria-hidden="false"]').attr('aria-hidden', true);

		$(currentImage).css({"opacity": 1, "visibility": "visible"})
				   	   .attr('aria-hidden', false);
		//$(currentImage).parents('.image-wrapper').css('visibility', 'visible');
		$(currentLabel).css({"opacity": 1, "visibility": "visible"});
		$(currentCaption).css({"opacity": 1, "visibility": "visible"});
		$(currentOverlays).css({"opacity": 1, "visibility": "visible"});

		last = wholeVal;
		lastStop = wholeVal;
	}


    function buildSlider(){
		$('#slide_images #image1').css({"opacity": 1, "visibility": "visible"});
		$('#slide_labels #label1').css({"opacity": 1, "visibility": "visible"});
		$('#slide_captions #caption1').css({"opacity": 1, "visibility": "visible"});
		$('#slide_images .overlay').css({"opacity": 0, "visibility": "hidden"});
		$('#slide_images .overlays1').css({"opacity": 1, "visibility": "visible"});

		currentImage = document.getElementById('image1');
		currentLabel = document.getElementById('label1');
		currentCaption = document.getElementById('caption1');

		var sliderConfig = {
			height: "400px",
			animate: true,
			value: 1,
			step: 0.01,
			start: function(event, ui) {
				slideStart(ui);
			},
			slide: function (event, ui) {
			    var sliderPos, wholeSliderPos;
				$('.ui-slider-handle').removeClass('pulsing');
				sliderPos = Math.abs((ui.value)); //ex: 1.25
				wholeSliderPos = Math.floor(sliderPos); //ex: 1
				decVal = sliderPos - wholeSliderPos; // ex: 1.25 - 1 (=.25)

				var rangeStart = Math.floor(sliderPos);
                var rangeEnd = Math.ceil(sliderPos);

                if (lastStop > 0 && lastStop !== rangeStart && lastStop !== rangeEnd){
                    var old = $('#image' + lastStop);
                    old.css('opacity', 0);
                }

				prevImage = document.getElementById('image' + (wholeSliderPos - 1));
				currentImage = document.getElementById('image' + wholeSliderPos);
				nextImage = document.getElementById('image' + (wholeSliderPos + 1));

				prevLabel = document.getElementById('label' + (wholeSliderPos - 1));
				currentLabel = document.getElementById('label' + wholeSliderPos);
				nextLabel = document.getElementById('label' + (wholeSliderPos + 1));

				prevCaption = document.getElementById('caption' + (wholeSliderPos - 1));
				currentCaption = document.getElementById('caption' + wholeSliderPos);
				nextCaption = document.getElementById('caption' + (wholeSliderPos + 1));


		        if (Math.abs(ui.value) > last) {
		        	$(currentImage).css("opacity", 1 - decVal);
		        	$(nextImage).css("opacity", decVal);
		        }

		        if (Math.abs(ui.value) < last) {
		        	$(currentImage).css("opacity", 1 - decVal);
		        	$(nextImage).css("opacity", decVal);
		        }

		        if (Math.floor(last) !== wholeSliderPos) {
                    clearGhosts(rangeStart, rangeEnd);
                }
		        last = Math.abs(ui.value);
			},
			stop: function(event, ui) {
				slideStop(ui);
		    },
            change: function( ) {
                sendCaliperNavigationEvent( );
            }

		};
		if (ctrlOrientation.indexOf("vertical") !== -1) {
			sliderConfig.orientation = "vertical";
		} else {
			sliderConfig.orientation = "horizontal";
		}
		if (ctrlOrientation === "vertical") {
			sliderConfig.min = -$('#slide_images .image').size();
			sliderConfig.max = -1;
		} else {
			sliderConfig.min = 1;
			sliderConfig.max = $('#slide_images .image').size();
		}
		$("#slider").slider(sliderConfig);

	}

	//This function draws the tick marks/pips for the slider. It must be called after the slider's max is set.
    function setSliderTicks(){
	    var offsetDirection;
	    var spacing;
	    if (ctrlOrientation.indexOf('vertical') !== -1) {
	    	offsetDirection = 'top';
	    } else {
	    	offsetDirection = 'left';
	    }
	    var $slider =  $('#slider');
	    var max =  Math.abs($slider.slider("option", "max"));
	    var min =  Math.abs($slider.slider("option", "min"));
	    if (min > max) {
	    	max = min;
	    }
	    if (max > 1) {
	    	spacing =  100 / (max -1);
	    } else {
	    	spacing = 50;
	    }

	    $slider.find('.ui-slider-tick-mark').remove();
	    if (ctrlOrientation === 'vertical') {
		    for (var i = (max - 1); i >= 0 ; i--) {
		        $('<span class="ui-slider-tick-mark" role="button" tabindex="0" data-slide-number="' + (i + 1) + '"></span>').css(offsetDirection, (spacing * i) +  '%').appendTo($slider);
		    }
	    	$('.ui-slider-tick-mark').addClass('ui-slider-tick-mark-vertical');
	    } else if (ctrlOrientation === "vertical-up") {
		    for (var j = 0; j < max ; j++) {
		        $('<span class="ui-slider-tick-mark" role="button" tabindex="0" data-slide-number="' + (j + 1) + '"></span>').css(offsetDirection, (spacing * j) +  '%').appendTo($slider);
		    }
		    $('.ui-slider-tick-mark').addClass('ui-slider-tick-mark-vertical');
	    } else {
		    for (var k = 0; k < max ; k++) {
		        $('<span class="ui-slider-tick-mark" role="button" tabindex="0" data-slide-number="' + (k + 1) + '"></span>').css(offsetDirection, (spacing * k) +  '%').appendTo($slider);
		    }
		    $('.ui-slider-tick-mark').addClass('ui-slider-tick-mark-horizontal');
	    }

	}


	//Size the image div to the tallest slide image
	//If not in procrustes mode, set width to widest slide image
	function imageSizing() {
		//Determine the natural height and width of each image
		var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
		$('#widget_container').imagesLoaded(function() {
			$('.image img').each(function(index, el) {
				var imgWidth, imgHeight;
	        	var userImageScale;
	        	var isSVGTest = /\.svg$/i;
	        	var imageSrcValue = $(this).attr('src');
	        	var isSVG = isSVGTest.test(imageSrcValue);
	        	if (isSVG) {
	        		$(this).css({
	        			'width': '100%',
	        			'height': 'auto'
	        		});
	        	}

	        	if ((typeof slideInfo.slideData[index].scale !== 'undefined') &&
	        		(slideInfo.slideData[index].scale > 0) && (slideInfo.slideData[index].scale < 1)) {
		        	userImageScale = slideInfo.slideData[index].scale;
	        	} else {
	        		userImageScale = 1;
	        	}
	        	if (this.naturalWidth !== 0 && !isSafari) {
		        	// Safari gives natural dimensions for SVGs but they're
		        	// not accurate
		        	imgHeight = this.naturalHeight;
		        	imgWidth = this.naturalWidth;
	        	}
	        	else {
	        		// IE will give dimensions for SVGs but they're not the
	        		// "natural" dimensions
	        		imgHeight = this.offsetHeight;
	        		imgWidth = this.offsetWidth;
	        	}
	        	// If image dimensions have been stored, use them. This is
	        	// because IE and Safari don't make accurate width and height
	        	// available for SVGs. So, we use values that were determined
	        	// when authoring in Chrome.
	        	imgWidth = (slideInfo.slideData[index].imageWidth > 0) ? slideInfo.slideData[index].imageWidth : imgWidth;
	        	imgHeight = (slideInfo.slideData[index].imageHeight > 0) ? slideInfo.slideData[index].imageHeight : imgHeight;
				imgHeight = imgHeight * userImageScale;
				imgWidth = imgWidth * userImageScale;
				imageNaturalHeights.push(imgHeight);
				imageNaturalWidths.push(imgWidth);
			});
			var tallestImageHeight = 0;
			var tallestImageWidth = 0;
			/*
			Figure out which is the tallest image. If there's more than one image
			with a height equal to the height of the tallest image, then use the one with
			greatest width.
			*/
			for (var i = 0; i < imageNaturalHeights.length; i++) {
				if ((imageNaturalHeights[i] > tallestImageHeight) ||
					((imageNaturalHeights[i] === tallestImageHeight) &&
						(imageNaturalWidths[i] > tallestImageWidth))) {
					tallestImageHeight = imageNaturalHeights[i];
					tallestImageWidth = imageNaturalWidths[i];
				}
			}
			/*
			By how much does the tallest image of the greatest width have to be scaled in
			order to fit within current slide viewer? Use that scale factor to set the
			height of the slider viewer. This will show that "maximum" image proportionally
			and fill up the slide viewer.
			*/
			var imageScale = $('#slide_images').width() / tallestImageWidth;
			var slideHeight, widgetWidth;
	        if (imageScale <= 1) {
	            slideHeight = tallestImageHeight * imageScale;
	        } else {
	            slideHeight = tallestImageHeight;
	        }
        	var maxImageWidth = Math.max.apply(null, imageNaturalWidths);
        	var windowWidth = $(window).width();
	        var verticalNavWidth = 0;
	        if (ctrlOrientation.indexOf('vertical') !== -1) {
	        	verticalNavWidth = $('#slide_nav.slide_nav-vertical').outerWidth(true);
	        	maxImageWidth = maxImageWidth - verticalNavWidth;
	        }
	        // The "Fit Page Width" option = "procrustes"
	        if (procrustes || maxImageWidth > windowWidth) {
	        	widgetWidth = windowWidth;
	        	$('#slide_images').css({'width': widgetWidth - verticalNavWidth + 'px'});
				$('#widget_container').css({width: '100%'});
	        } else {
	        	widgetWidth = maxImageWidth + verticalNavWidth;
	        	$('#slide_images').width(maxImageWidth);
				$('#widget_container').css({width: widgetWidth + 'px'});
	        }
	        var slideImagesWidth = $('#slide_images').width();
			$('#slide_images').css({"height": slideHeight + "px"});
	        /*
	        Fit all the images within the slide viewer, which is now optimized for the
	        tallest image of the greatest width.
	        */
	        $('.image img').each(function(index, el) {
	        	var imgWidth, imgHeight;
	        	var re = /\D+(\d+)/;
	        	var id = $(this).parent().attr("id").match(re)[1];
	        	var userImageScale;

	        	if (typeof slideInfo.slideData[index].scale !== 'undefined' &&
	        		slideInfo.slideData[index].scale !== 1) {
		        	userImageScale = slideInfo.slideData[index].scale;
	        	} else {
	        		userImageScale = 1;
	        	}
	        	if (this.naturalWidth !== 0 && !isSafari) {
		        	imgHeight = this.naturalHeight;
		        	imgWidth = this.naturalWidth;
	        	}
	        	else {
	        		imgHeight = this.offsetHeight;
	        		imgWidth = this.offsetWidth;
	        	}
	        	// If image dimensions have been stored, use them. This is
	        	// because IE and Safari don't make accurate width and height
	        	// available for SVGs. So, we use values that were determined
	        	// when authoring in Chrome.
	        	imgWidth = (slideInfo.slideData[index].imageWidth > 0) ? slideInfo.slideData[index].imageWidth : imgWidth;
	        	imgHeight = (slideInfo.slideData[index].imageHeight > 0) ? slideInfo.slideData[index].imageHeight : imgHeight;
				imgHeight = imgHeight * userImageScale;
				imgWidth = imgWidth * userImageScale;

	        	var scale = slideImagesWidth / imgWidth;
	        	var newHeight = imgHeight * scale;
	        	var newWidth = imgWidth * scale;
	        	/*
	        	If the image will fit in the slide viewer at its natural size,
	        	then show it that way -- centered.
	        	*/
	        	if (imgWidth <= slideImagesWidth && imgHeight <= slideHeight) {
	        		$(this).parent().parent().css({
			    		"width": imgWidth,
			    		"height": imgHeight,
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto",
			    		"position": "absolute",
			    		"top": "50%",
			    		"left": "50%",
			    		"transform": "translate(-50%, -50%)"
	        		});
	        		$(this).parent().css({
			    		"width": imgWidth,
			    		"height": imgHeight
	        		});
	        		$(this).css({
			    		"width": imgWidth,
			    		"height": imgHeight,
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto"
			    	});
			    	$(this).parent().attr("data-scale", 1);
		        	$(".overlays" + id).css({
			        	'transform': 'scale(' + 1 + ')',
			        	'transform-origin': '0% 0%',
			        	'width': '100%'
			        });
		        /*
		        The image width fits but the height does not.
		        */
			    } else if (imgWidth <= slideImagesWidth && newHeight > slideHeight) {
	        		$(this).parent().parent().css({
			    		"width":  (slideHeight / imgHeight * imgWidth) + "px",
			    		"height": slideHeight + "px",
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto",
			    		"position": "absolute",
			    		"top": "50%",
			    		"left": "50%",
			    		"transform": "translate(-50%, -50%)"
	        		});
	        		$(this).parent().css({
			    		"width": (slideHeight / imgHeight * imgWidth) + "px",
			    		"height": slideHeight + "px"
	        		});
	        		$(this).css({
			    		"width":  (slideHeight / imgHeight * imgWidth) + "px",
			    		"height": slideHeight + "px",
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto"
			    	});
			    	$(this).parent().attr("data-scale", (slideHeight / imgHeight));
		        	$(".overlays" + id).css({
			        	'transform': 'scale(' + (slideHeight / imgHeight) + ')',
			        	'transform-origin': '0% 0%',
			        	'width': newWidth + 'px'
			        });
        		/*
        		If the width of the scaled image is greater than the slider viewer width,
        		display it at 100% of the width of the viewer, with its height set
        		proportionally (preserving aspect ratio).
        		*/
	        	} else if (newWidth >= slideImagesWidth && newHeight <= slideHeight) {
	        		$(this).parent().parent().css({
			    		"width": slideImagesWidth + "px",
			    		"height": (slideImagesWidth / imgWidth * imgHeight) + "px",
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto",
			    		"position": "absolute",
			    		"top": "50%",
			    		"left": "50%",
			    		"transform": "translate(-50%, -50%)"
	        		});
	        		$(this).parent().css({
			    		"width": slideImagesWidth + "px",
			    		"height": (slideImagesWidth / imgWidth * imgHeight) + "px"
	        		});
	        		$(this).css({
			    		"width": slideImagesWidth + "px",
			    		"height": (slideImagesWidth / imgWidth * imgHeight) + "px",
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto"
			    	});
			    	$(this).parent().attr("data-scale", (slideImagesWidth / imgWidth));
		        	$(".overlays" + id).css({
			        	'transform': 'scale(' + (slideImagesWidth / imgWidth) + ')',
			        	'transform-origin': '0% 0%',
			        	'width': (slideImagesWidth * imgWidth / maxImageWidth) + 'px'
			        });
	        	/*
	        	If the height of the image is greater than the slide viewer height, then
	        	display the image as tall as possible. The proportionally scaled width of
	        	the image is less than the width of the slider viewer, so it will fit --
	        	and be positioned in the horizontal center, with white space on the left
	        	and right.
	        	*/
	        	} else if (newWidth <= slideImagesWidth && newHeight >= slideHeight) {
	        		$(this).parent().parent().css({
			    		"width":  (slideHeight / newHeight * newWidth) + "px",
			    		"height": slideHeight + "px",
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto",
			    		"position": "absolute",
			    		"top": "50%",
			    		"left": "50%",
			    		"transform": "translate(-50%, -50%)"
	        		});
	        		$(this).parent().css({
			    		"width": (slideHeight / newHeight * newWidth) + "px",
			    		"height": slideHeight + "px"
	        		});
	        		$(this).css({
			    		"width":  (slideHeight / newHeight * newWidth) + "px",
			    		"height": slideHeight + "px",
			    		"display": "inherit",
			    		"margin-left": "auto",
			    		"margin-right": "auto"
			    	});
			    	$(this).parent().attr("data-scale", (slideHeight / newHeight));
		        	$(".overlays" + id).css({
			        	'transform': 'scale(' + (slideHeight / newHeight) + ')',
			        	'transform-origin': '0% 0%',
			        	'width': newWidth + 'px'
			        });
	        	}
	        });

	        /*
	        Size the slider
	        "scale" is a global variable set by the author to make the slider
	        narrower or shorter. Default value is 1.
	        */
	        if (ctrlOrientation.indexOf('vertical') !== -1) {
				// Slider orientation is vertical
    			var slideImagesHeight = $('#slide_images').height();
    			/*
    			The height of the slider is the height of the slide viewer, minus
    			some space for the up and down arrows.
    			*/
    			var previousHeight = $('#previous').outerHeight(true);
    			var nextHeight = $('#next').outerHeight(true);
    			var sliderHeight = (slideImagesHeight - previousHeight - nextHeight) * scale;
    			$('#slider').height(sliderHeight);
    			/*
    			If the slider is scaled down, add a top margin to the slider container,
    			so that the up arrow is close to the slider.
    			*/
    			var marginTop = (slideImagesHeight - $('#slide_nav').outerHeight(true)) / 2;
    			$('#slide_nav').css({
    				"padding-top": marginTop + 'px',
                    "height": slideImagesHeight + 'px'
    			});
			} else {
				// Slider orientation is horizontal
				/*
				The slider width is equal to the width of the slide viewer, minus
				some space for the left and right arrows (scaled if necessary).
				The 95 is to account for the previous and next arrows.
				*/
				sliderHorizontalWidth = $('#slide_images').outerWidth(true) * scale - 95;
				$('#slider').outerWidth(sliderHorizontalWidth);
			}
		});
	}

	//This function sets the size of the caption area to the longest caption
	//Added sizing for labels
	function slideSizing() {
		$('#slide_captions').css({'height': 0});
	    var heights_array = [];
		$('.caption').each(function() {
			var captionHeight = $(this).children('p').outerHeight(true);
			heights_array.push(captionHeight);
		});

		var tallestSlide = Math.max.apply(Math,heights_array);
		heights_array = [];
		$('#slide_captions').css({'height': tallestSlide + 20});

		$('#slide_labels').css({'height': 0});
		$('.label').each(function() {
			var labelHeight = $(this).children('p').outerHeight(true);
			heights_array.push(labelHeight);
		});

		var tallestLabel = Math.max.apply(Math, heights_array);
		heights_array = [];
		//$('#slide_labels').css({'height': tallestLabel + 20});
    $('#slide_labels').css({'height': tallestLabel });
	}

	$(window).resize(function() {
		doOnWindowResize();
	});

	function doOnWindowResize() {
		imageNaturalWidths = [];
		imageNaturalHeights = [];
		imageSizing();
		slideSizing();
		// setSize();
	}

	$(window).load(function() {
		$('.ui-slider-handle').addClass('pulsing').attr('aria-hidden', true);
		setTimeout(function() {
			MathJax.Hub.Queue(
				["Typeset",MathJax.Hub],
				doOnWindowResize
			);
		}, 1000);
	});

	function setSize() {
        /*
        Set the size of the widget. Only call the size() function if the
        last-stored document height (currentDocHeight) doesn't equal the
        newDocHeight.
        */
        var newDocHeight, newDocWidth;
		$('#widget_container').imagesLoaded(function() {
	        var windowWidth = $(window).width();
			newDocHeight = $(document.body).outerHeight(true);
			newDocWidth = $(document.body).outerWidth(true);
			if (procrustes || (newDocWidth > windowWidth)) {
				newDocWidth = windowWidth;
			}
			if ((currentDocHeight !== newDocHeight && currentDocHeight !== (newDocHeight + 1)) || (currentDocWidth !== newDocWidth)) {
				s9.view.size({
		    		width: '100%',
		    		height: newDocHeight
		    	});
        $('body').addClass('loaded');
				currentDocHeight = newDocHeight;
				currentDocWidth = newDocWidth;
	    	}
    	});
    }

	$('#widget_container').on("click", '#previous', function(e) {
		$('.image').attr('aria-hidden', true);
		var s = $("#slider"),
			val = s.slider("value"),
			step = 1;
		s.slider("value", val - step);
		slideStop(s.ui);
	});

	$('#widget_container').on("click", '#next', function(e) {
		$('.image').attr('aria-hidden', true);
		var s = $("#slider"),
			val = s.slider("value"),
			step = 1;
		lastTickMark = $('#slide_images .image').length;
		if (val < lastTickMark) {
			s.slider("value", val + step);
			slideStop(s.ui);
		}
	});

  	var slideInfo = {
		'slideData': []
	};
	var i, image, label, caption, overlays, imageScale;
	var image_template, label_template, caption_template, imageTemplate,labelTemplate,captionTemplate,imageHolder,labelHolder,captionHolder;

	function onLoaded() {
		/*
		Set up the slider (vertical or horizontal)
		*/
		if (ctrlOrientation.indexOf('vertical') !== -1) {
      // vertical
			$('#slide_images').prepend('<div id="slide_nav" role="navigation" style="float:right"><div id="next" role="button" aria-label="' + localeLabels.nextSlide + '" tabindex="0"></div><div id="slider"></div><div id="previous" role="button" aria-label="' + localeLabels.previousSlide + '" tabindex="0"></div></div>');
			$('#next').addClass('next-vertical');
			$('#previous').addClass('previous-vertical');
      $('#next').addClass('icon-chevron-up');
      $('#previous').addClass('icon-chevron-down'); // get rid of translation?

			$('#slide_nav').addClass('slide_nav-vertical');
			$('#slide_images').addClass('slide_images-vertical');
			$('#slider').addClass('slider-vertical');
			$('#slider').addClass('ui-slider-vertical-background');
			$('#slide_labels').addClass('slide_labels-vertical');
		} else {
      // horizontal
			$('.slide_info.slider_location').append('<div id="slide_nav" role="navigation"><div id="previous" role="button" aria-label="' + localeLabels.previousSlide + '" tabindex="0"></div><div id="slider"></div><div id="next" role="button" aria-label="' + localeLabels.nextSlide + '" tabindex="0"></div></div>');
			$('#slide_nav').addClass('slide_nav-horizontal');
			$('#slider').addClass('ui-slider-horizontal-background');
			$('#previous').addClass('previous-horizontal');
      $('#previous').addClass('icon-chevron-left');
			$('#next').addClass('next-horizontal');
      $('#next').addClass('icon-chevron-right');
			$('#slider').addClass('slider-horizontal');
		}

		/*
		If this is a virgin instance, show placeholders
		*/
		if (slideInfo.slideData.length === 0){
			//Show default - placeholder images.
			slideInfo.slideData = [{
				image: 'img/placeholder-image1.svg',
				caption: 'Caption 1',
				label: 'Label 1',
				index: 1
			},
			{	image: 'img/placeholder-image2.svg',
				caption: 'Caption 2',
				label: 'Label 2',
				index: 2
			},
			{
				image: 'img/placeholder-image3.svg',
				caption: 'Caption 3',
				label: 'Label 3',
				index: 3
			}];

		}

		//Add each of the slide images, labels, and captions to the DOM
		$.each(slideInfo.slideData, function(index, element){
	    	// Generate the HTML for each post
	    	var imagehtml = imageTemplate(element);
	    	var labelhtml = labelTemplate(element);
	    	var captionhtml = captionTemplate(element);
	    	var overlaysHTML = '';
	    	// Render the posts into the page
	    	var imageAndOverlays;
	      	if (element.label){
	      	 	labelHolder.append(labelhtml);
	      	}
	    	if (element.caption) {
	    		captionHolder.append(captionhtml);
	    	}
	    	// Add the slide's overlays
	    	if (element.hasOwnProperty('overlays')) {
		    	for (var i = 0; i < element.overlays.length; i++) {
		    		overlaysHTML += '<div class="overlay overlays' + (index + 1) + '" style="top: ' +
		    			element.overlays[i].overlayPositionTop + '%; left: ' +
		    			element.overlays[i].overlayPositionLeft + '%; position: absolute; ' +
		    			'z-index: ' + (i + 1) + '; padding: 1%; width: auto;">' +
		    			element.overlays[i].overlayContent +
		    			'</div>';
	    			//$('.wrapper-' + (index + 1)).append(overlaysHTML);
		    	}
		    	imageAndOverlays = $(imagehtml).append(overlaysHTML);
		    	imageHolder.append(imageAndOverlays);
	    	}
	    	else {
		    	imageHolder.append(imagehtml);
		    }
		});

		/*
		If there is no label or caption, don't show their containers
		*/
		if ($('.label').length === 0){
			$('#slide_labels').hide();
			$('#slide_captions').css({'border-top': 'none'});
		}
		if ($('.caption').length === 0){
			$('#slide_captions').hide();
		} else {
			slideSizing();
		}



    // for each label, get its size and name
    if ($('.label').length){
      var tHeight = parseInt($('#slide_labels').css("height"),10);

      $('.label').each(function() {
          var tLabelHeight = parseInt($(this).css("height"),10);
          var difference = (tHeight - tLabelHeight)/2;
          if (difference > 0){
            difference += "px";
            $(this).css("padding-top", difference);
          }
      });
    }


		// build the slideline slider
		buildSlider();

		//add ticks to slideline slider
		setSliderTicks();

		//set heights of image container
		imageSizing();

		$('body').addClass('loaded');
		debouncedResize();
		// setSize();


	}

    if (typeof s9 !== "undefined") {
        if (s9.initialParams && s9.initialParams.configFile) {
            var configFileUrl = s9.initialParams.configFile;
            mhe.getConfigFile(configFileUrl, function(iConfigFileContents) {
	            var JSONObject = iConfigFileContents.json, imageWidth, imageHeight, image, label, caption, overlays, imageScale, slideShortDescription, slideLongDescription;
	            var i = 1;
	            while (true){
	                image = JSONObject['image' + i];
	                if (!image){
	                    break;
	                }
	                label = JSONObject['label' + i];
	                caption = JSONObject['caption' + i];
	                slideShortDescription = (JSONObject['slideShortDescription' + i]) ? JSONObject['slideShortDescription' + i] : '';
	                slideLongDescription = (JSONObject['slideLongDescription' + i]) ? JSONObject['slideLongDescription' + i] : '';
	                if (JSONObject['overlays' + i]) {
	                    overlays = JSON.parse(JSONObject['overlays' + i]);
	                } else {
	                    overlays = [];
	                }

	                if (JSONObject['scale' + i]) {
	                	imageScale = JSONObject['scale' + i];
	                } else {
	                	imageScale = 1;
	                }

	                imageWidth = (JSONObject['imageWidth' + i] >= 0) ? JSONObject['imageWidth' + i] : null;
	                imageHeight = (JSONObject['imageHeight' + i] >= 0) ? JSONObject['imageHeight' + i] : null;

	                slideInfo.slideData.push({
	                    image: image,
	                    label: label,
	                    caption: caption,
	                    overlays: overlays,
	                    index: i,
	                    scale: imageScale,
	                    imageWidth: imageWidth,
	                    imageHeight: imageHeight,
	                    slideShortDescription: slideShortDescription,
	                    slideLongDescription: slideLongDescription
	                });
	                i++;
	            }

	            if (typeof JSONObject.widgetSize !== "undefined" && JSONObject.widgetSize === 'fitImages') {
	            	procrustes = false;
	            } else {
	            	procrustes = true;
	            }
	            if (JSONObject.orientation) {
	            	ctrlOrientation = JSONObject.orientation;
	            } else {
	            	ctrlOrientation = 'horizontal';
	            }

	            if (JSONObject.scale) {
	            	scale = JSONObject.scale;
	            } else {
	            	scale = 1;
	            }

              	// catch prior instances where widget was built,
              	// but there was no layout choices available yet
              	if(JSONObject.layout){
                	writeSlideAndTextContainersIntoLayout(JSONObject.layout);
              	}else{
                	writeSlideAndTextContainersIntoLayout("LbotCbot");
              	}

	          	//writeSlideAndTextContainersIntoLayout(JSONObject.layout);

				runHandleBars();

	          	onLoaded();

            }, function(iErr1, iErr2, iErr3) {
	            console.log('Error loading configuration file.');
            });
        } else if (s9.initialParams && !s9.initialParams.configFile) {
            i = 1;
            var slideShortDescription, slideLongDescription;
            while (true){
                image = s9.initialParams['image' + i];
                if (!image){
                    break;
                }
                label = s9.initialParams['label' + i];
                caption = s9.initialParams['caption' + i];
                slideShortDescription = (s9.initialParams['slideShortDescription' + i]) ? s9.initialParams['slideShortDescription' + i] : '';
                slideLongDescription = (s9.initialParams['slideLongDescription' + i]) ? s9.initialParams['slideLongDescription' + i] : '';
                if (s9.initialParams['overlays' + i]) {
                    overlays = JSON.parse(s9.initialParams['overlays' + i]);
                } else {
                    overlays = [];
                }

                if (typeof s9.initialParams['scale' + i] !== 'undefined') {
                	imageScale = s9.initialParams['scale' + i];
                } else {
                	imageScale = 1;
                }

                slideInfo.slideData.push({
                    image: image,
                    label: label,
                    caption: caption,
                    overlays: overlays,
                    index: i,
                    scale: imageScale,
                    slideShortDescription: slideShortDescription,
                    slideLongDescription: slideLongDescription
                });
                i++;
            }

            writeSlideAndTextContainersIntoLayout("LbotCbot");

			runHandleBars();

            onLoaded();
        }
    }
});
