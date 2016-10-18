/* global s9, CKEDITOR, Handlebars, imagesLoaded, MathJax, mhe */
// W083: Don't make functions with a loop
// jshint -W083
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

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// http://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var myMathJaxTypeset = debounce(function() {
    MathJax.Hub.Queue(
        ["Typeset",MathJax.Hub]
    );
}, 1000);

//--------------------------------------------------------------------
// Global variables
//--------------------------------------------------------------------

var currentLayout = "LbotCbot";

var currentSlide = 0; //Note: this is a number defined by the order of the slides, not the identifiers.

var slideInfo = [];

var askConfirm = (function(){
    if (s9.initialParams.confirm) {
        return (s9.initialParams.confirm === 'true');
    } else {
        return true;
    }
})();

var blankImage = new Image();

var last = 0;
var lastStop = 0;

var imageNaturalHeights = [];
var imageNaturalWidths = [];

//--------------------------------------------------------------------
// Slide identifier helpers
//--------------------------------------------------------------------

/* function generateId() just gives consecutive numbers -
 * this is used for a separate identifier from the index/order of the slides
 * and shouldn't change when the order is changed. It should be used for
 * actions that may be interwoven with reordering actions. E.g. image uploads, deletions.
 */
function generateId() {
    if (typeof generateId.count === 'undefined'){
        generateId.count = 1;
    }
    return generateId.count++;
}

function getSlide(ident) {
    ident = parseInt(ident, 10);
    var entry = $.grep(slideInfo, function(e){ return e.identifier === ident; });
    return entry[0];
}

// function getIndex returns the index of the slide with identifier @param ident
// in slideInfo, i.e. one less than its number in the thumbnails.
function getIndex(ident) {
    ident = parseInt(ident, 10);
    for (var i = 0; i < slideInfo.length; i++){
        if (slideInfo[i].identifier === ident){
            return i;
        }
    }
    return -1;
}


//--------------------------------------------------------------------
// Data-saving functions
//--------------------------------------------------------------------

function sendData(){
    var payload = {
        'confirm': askConfirm
    };

    payload.layout = currentLayout;

    //console.log('MHE params added to payload to be sent via configuration api');
    if (widgetSize) {
        payload.widgetSize = widgetSize;
    } else {
        payload.widgetSize = '100%';
    }
    if (orientation) {
        payload.orientation = orientation;
    } else {
        payload.orientation = "horizontal";
    }

    if (s9.initialParams.labelFontFamily) {
        payload.labelFontFamily = s9.initialParams.labelFontFamily;
    } else {
        payload.labelFontFamily = "Arial, sans-serif";
    }

    if (s9.initialParams.labelFontSize) {
        payload.labelFontSize = s9.initialParams.labelFontSize;
    } else {
        payload.labelFontSize = "14px";
    }

    if (s9.initialParams.captionLineHeight) {
        payload.captionLineHeight = s9.initialParams.captionLineHeight;
    } else {
        payload.captionLineHeight = "normal";
    }

    if (s9.initialParams.captionFontFamily) {
        payload.captionFontFamily = s9.initialParams.captionFontFamily;
    } else {
        payload.captionFontFamily = "Arial, sans-serif";
    }

    if (s9.initialParams.captionFontSize) {
        payload.captionFontSize = s9.initialParams.captionFontSize;
    } else {
        payload.captionFontSize = "14px";
    }

    if (scale > 0 && scale <=1) {
        payload.scale = scale;
    } else {
        payload.scale = 1;
    }

    var i = 1;
    while (true){
        if (!slideInfo[i-1]) {
            break;
        }
        payload['image' + i] = slideInfo[i - 1].imgsrc;
        payload['label' + i] = slideInfo[i - 1].label;
        payload['caption' + i] = slideInfo[i - 1].caption;
        payload['slideShortDescription' + i] = slideInfo[i - 1].slideShortDescription;
        payload['slideLongDescription' + i] = slideInfo[i - 1].slideLongDescription;
        if (slideInfo[i - 1].hasOwnProperty('overlays')) {
            payload['overlays' + i] = JSON.stringify(slideInfo[i - 1].overlays);
        }
        if (typeof slideInfo[i - 1].scale !== 'undefined') {
            payload['scale' + i] = slideInfo[i - 1].scale;
        }
        payload['imageWidth' + i] = (slideInfo[i - 1].imageWidth >= 0) ? slideInfo[i - 1].imageWidth : null;
        payload['imageHeight' + i] = (slideInfo[i - 1].imageHeight >= 0) ? slideInfo[i - 1].imageHeight : null;
        i++;
    }

    var checkboxes = $('input:checkbox');
    var key;
    var value;
    for (i = 0; i < checkboxes.length; i++){
        key = checkboxes[i].id;
        value = $(checkboxes[i]).is(':checked') ? 'true' : 'false';
        payload[key] = value;
    }

    var menus = $('select');
    for (i = 0; i < menus.length; i++){
        key = menus[i].name;
        value = menus[i].value;
        payload[key] = value;
    }

    mhe.updateConfigFile({"json": payload});

}

//--------------------------------------------------------------------
// Initialization/setup functions
//--------------------------------------------------------------------

function displaySliderSize(size) {
    return size * 100;
}


function buildRadioButtonMenu(){

  var myhtml = '';
  var mylayoutInfo = getLayoutKeys();
  myhtml += '<label>Type Placement</label><br/>';
  myhtml += '<form action="">';
  myhtml += '<fieldset style="border:0;line-height:150%">';

  for( var obj in mylayoutInfo){
    myhtml += '<input type="radio" name="layoutchoice" value='+ mylayoutInfo[obj].name +' /> '+ mylayoutInfo[obj].desc+ ' <br/>';
  }

  myhtml += '</fieldset>';
  myhtml += '</form>';

  $("#radio_menu").html(myhtml);

}



function setLayoutType(p_Type){
   var radios  = $('input:radio[name=layoutchoice]');
   radios.filter("[value=" + p_Type + "]").prop('checked', true);
}


// NOTE: This function must be called before any other interactions with the slide data!
function initSlideInfo() {
    if (s9) {
        if (s9.initialParams && s9.initialParams.configFile) {
            var configFileUrl = s9.initialParams.configFile;
            $.ajax({
                url: configFileUrl,
                dataType: 'json',
                success: function(iConfigFileContents) {
                    var JSONObject = iConfigFileContents.json;
                    var i = 1, imageWidth, imageHeight, slideShortDescription, slideLongDescription;

                    // catch prior instances where widget was built,
                    // but there was no layout choices available yet
                    if(JSONObject.layout){
                        currentLayout = JSONObject.layout;
                    }else{
                         currentLayout = "LbotCbot";
                    }

                    buildRadioButtonMenu();
                    setLayoutType(currentLayout);
                    while (true){
                        var image = new Image();
                        imgsrc = JSONObject['image' + i];
                        if (!imgsrc){
                            break;
                        }
                        image.src = imgsrc;
                        image.className = 'fullImage';
                        var label = JSONObject['label' + i];
                        var caption = JSONObject['caption' + i];
                        var overlays;
                        var imageScale;
                        slideShortDescription = (typeof JSONObject['slideShortDescription' + i] !== 'undefined') ? JSONObject['slideShortDescription' + i] : '';
                        slideLongDescription = (typeof JSONObject['slideLongDescription' + i] !== 'undefined') ? JSONObject['slideLongDescription' + i] : '';
                        if (JSONObject['overlays' + i]) {
                            overlays = JSON.parse(JSONObject['overlays' + i]);
                        } else {
                            overlays = [];
                        }
                        if (typeof JSONObject['scale' + i] !== 'undefined') {
                            imageScale = JSONObject['scale' + i];
                        } else {
                            imageScale = 1;
                        }
                        imageWidth = (JSONObject['imageWidth' + i] >= 0) ? JSONObject['imageWidth' + i] : null;
                        imageHeight = (JSONObject['imageHeight' + i] >= 0) ? JSONObject['imageHeight' + i] : null;
                        var ident = generateId();

                        slideInfo.push({
                            image: image,
                            imgsrc: imgsrc,
                            label: label,
                            caption: caption,
                            overlays: overlays,
                            originalIndex: i,
                            identifier: ident,
                            scale: imageScale,
                            imageWidth: imageWidth,
                            imageHeight: imageHeight,
                            slideShortDescription: slideShortDescription,
                            slideLongDescription: slideLongDescription
                        });
                        i++;
                    }
                    if (typeof JSONObject.widgetSize !== "undefined") {
                        widgetSize = JSONObject.widgetSize;
                    } else {
                        widgetSize = '100%';
                    }
                    $('#widgetSize').val(widgetSize);
                    if (JSONObject.orientation) {
                        orientation = JSONObject.orientation;
                    } else {
                        orientation = 'horizontal';
                    }
                    $('#orientation').val(orientation);
                    if (JSONObject.scale) {
                        scale = JSONObject.scale || 1;
                    } else {
                        scale = 1;
                    }
                    $('#scale').val(displaySliderSize(scale));
                    $(document).trigger('contentChanged');
                },
                error: function(iErr1, iErr2, iErr3) {
                }
            });
        } else if (s9.initialParams && !s9.initialParams.configFile) {
            currentLayout = "LbotCbot";
            buildRadioButtonMenu();
            setLayoutType(currentLayout);
            var i = 1, slideShortDescription, slideLongDescription, imageWidth, imageHeight, imageScale;
            while (true){
                var image = new Image();
                imgsrc = s9.initialParams['image' + i];
                if (!imgsrc){
                    break;
                }
                image.src = imgsrc;
                image.className = 'fullImage';
                var label = s9.initialParams['label' + i];
                var caption = s9.initialParams['caption' + i];
                var overlays;
                slideShortDescription = (typeof JSONObject['slideShortDescription' + i] !== 'undefined') ? JSONObject['slideShortDescription' + i] : '';
                slideLongDescription = (typeof JSONObject['slideLongDescription' + i] !== 'undefined') ? JSONObject['slideLongDescription' + i] : '';
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
                imageWidth = (s9.initialParams['imageWidth' + i] >= 0) ? s9.initialParams['imageWidth' + i] : null;
                imageHeight = (s9.initialParams['imageHeight' + i] >= 0) ? s9.initialParams['imageHeight' + i] : null;
                var ident = generateId();
                slideInfo.push({
                    image: image,
                    imgsrc: imgsrc,
                    label: label,
                    caption: caption,
                    overlays: overlays,
                    originalIndex: i,
                    identifier: ident,
                    scale: imageScale,
                    imageWidth: imageWidth,
                    imageHeight: imageHeight,
                    slideShortDescription: slideShortDescription,
                    slideLongDescription: slideLongDescription
                });
                i++;
            }
            if (typeof s9.initialParams.widgetSize !== 'undefined') {
                widgetSize = s9.initialParams.widgetSize;
            } else {
                widgetSize = '100%';
            }
            if (s9.initialParams.orientation) {
                $('#orientation[name=orientation]').val(s9.initialParams.orientation);
                orientation = s9.initialParams.orientation;
            } else {
                $('#orientation[name=orientation]').val("horizontal");
                orientation = 'horizontal';
            }

            if (s9.initialParams.scale) {
                scale = s9.initialParams.scale || 1;
            } else {
                scale = 1;
            }
            $('#scale').val(displaySliderSize(scale));
            $(document).trigger('contentChanged');
        }
    }

}

function convertSliderSize(percentage) {
    if ((percentage >= 10) && (percentage <= 100)) return (percentage / 100);
}

function showPreview() {
    $('.preview').css({"position": "relative", "left": "auto"});
}

function hidePreview() {
    $('.preview').css({"position": "absolute", "left": "-10000px"});
}

function drawThumbnails() {
    var slideTemplate = $('#slidelist-template').html().replace(/<\!\[CDATA\[|\]\]>/g, '');
    var slide = Handlebars.compile(slideTemplate);
    var data = {
        slideData: slideInfo
    };
    var olContainer = document.querySelector('.mediaContent');
    olContainer.innerHTML = slide(data);
    $('.panel').imagesLoaded(function() {
        $('.nav-slide img').each(function() {
            if (this.naturalWidth < $(this).parent().width()) {
                $(this).css({
                    "width": this.naturalWidth,
                    "height": "auto",
                    "display": "inherit",
                    "margin-left": "auto",
                    "margin-right": "auto"
                });
            }
        });
    });
}

function toggleWorkspace() {
    var leftOffset = $('.preview').css('left');
    if (leftOffset === '-10000px') {
        showPreview();
    } else {
        hidePreview();
    }
    $('.upload').toggle();
}

function displayImageSettings(ident) {
    var slideEntry = getSlide(ident);
    imagesLoaded('.wrapper-' + slideEntry.identifier + ' img.fullImage', function() {
        $('#image-settings').empty();
        var imageScale;
        var currentWidth = $('.wrapper-' + slideEntry.identifier + ' img.fullImage').width();
        var newImage = new Image();
        newImage.src = slideEntry.imgsrc;
        var imageScaleActual = Math.round(currentWidth / newImage.naturalWidth * 100);
        if (imageScaleActual > 100) {
            imageScaleActual = 100;
        }
        if (typeof slideEntry.scale === "undefined") {
            imageScale = imageScaleActual;
        } else {
            imageScale = Math.round(slideEntry.scale * 100);
        }
        var html = '<div style="margin-top: 20px;">' +
            '<label for="imageScale">Scale %</label>' +
            '<input name="imageScale" type="text" value="' +
            imageScale +
            '" data-name="imageScale" data-id="' + slideEntry.identifier + '">' +
            '<button data-name="imageScale" data-id="' + slideEntry.identifier + '" style="display: none;">Set</button>' +
            '<span id="imageScaleMax"></span></div>';
        $('#image-settings').append(html);
    });
}

function displayOverlays(ident) {
    $('.overlay').remove();
    var slideEntry = getSlide(ident);
    if (slideEntry.hasOwnProperty('overlays')) {
        for (var i = 0; i < slideEntry.overlays.length; i++) {
            var thisOverlay = '<div class="draggable overlay overlays' + slideEntry.identifier + '" data-id="' + i + '" style="padding:1%;top: ' +
                    slideEntry.overlays[i].overlayPositionTop + '%; left: ' +
                    slideEntry.overlays[i].overlayPositionLeft + '%; position: absolute; ' +
                    'z-index: ' + slideEntry.identifier + '; opacity: 1;">' +
                    '<div class="handle" style="position: absolute;top: -7px;left: -7px;cursor: pointer;z-index: 1000;"><img src="img/handle.png"></div>'+
                    slideEntry.overlays[i].overlayContent +
                '</div>';
            $('#preview-image .wrapper-' + slideEntry.identifier).append(thisOverlay);
            $('.draggable').draggable({
                handle: ".handle",
                containment: 'parent',
                stop: function() {
                    var position = $(this).position(),
                        thisId = $(this).data("id"),
                        xPos = position.left,
                        yPos = position.top,
                        xPercent = Math.round((xPos * 100) / $("#preview-image").width()),
                        yPercent = Math.round((yPos * 100) / $("#preview-image").height());

                    slideEntry.overlays[thisId].overlayPositionLeft = xPercent;
                    slideEntry.overlays[thisId].overlayPositionTop = yPercent;
                    sendData();
                }
            });
        }
    }
}

function displayImageDescriptionEditors(ident) {
    $('#extraAccessibilityInfo').empty();
    var slideEntry = getSlide(ident);
    if (slideEntry.imgsrc === 'img/blank.svg') return;
    var $shortDescription = $('<div/>');
    $shortDescription.addClass('form-group')
        .append('<label for="slideShortDescription">Short Description</label><input id="slideShortDescription" type="text" value="' + slideEntry.slideShortDescription + '" class="form-control" data-id="' + ident + '"/>');
    var $longDescription = $('<div/>');
    $longDescription.addClass('form-group')
        .append('<label for="slideLongDescription">Long Description</label><textarea id="slideLongDescription" class="form-control" data-id="' + ident + '">' + slideEntry.slideLongDescription + '</textarea>');
    $('#extraAccessibilityInfo').append('<fieldset><legend>Accessibility</legend>');
    $('#extraAccessibilityInfo > fieldset').append($shortDescription);
    $('#extraAccessibilityInfo > fieldset').append($longDescription);
}

function displayOverlayEditors(ident) {
    $('.overlayEdit').remove();
    var slideEntry = getSlide(ident);
    if (slideEntry.hasOwnProperty('overlays')) {
        for (var i = 0; i < slideEntry.overlays.length; i++) {
            var thisOverlayEdit = '<div class="overlayEdit clearfix" data-name="overlay" data-id="' + i + '">' +
                    '<label for="overlayContent">Overlay Text</label>' +
                    '<br />' +
                    '<div class="ckeditor" contenteditable="true" name="overlayContent" data-name="overlayContent" data-id="' + i + '" style="width: 100%; min-height: 50px; background-color: white;">' + slideEntry.overlays[i].overlayContent + '</div>' +
                    '<button type="button" class="button icon-trash"></button>' +
                    '<div class="button icon icon-arrows"></div>' +
                    '<br />' +
                '</div>';
            $('#overlays').append(thisOverlayEdit);
        }
    }
    addCKEditor();
    $('#edit-area > #overlays').sortable({
        items: '.overlayEdit',
        containment: 'parent',
        handle: '.icon-arrows',
        update: function(event, ui) {
            var sortOrder = $(this).sortable('toArray', {
                attribute: 'data-id'
            });
            var newSortOrder = sortOrder.map(function(x) {
                return parseInt(x, 10);
            });
            var thisSlide = getSlide(currentSlide);
            var orderedArray = function(arr, order) {
                return order.map(function(itm) {
                    return arr[itm];
                });
            };
            var arr = orderedArray(thisSlide.overlays, newSortOrder);
            thisSlide.overlays = arr;
            sendData();
            $('#overlays .overlayEdit').each(function(index, el) {
                $(this).attr('data-id', index);
            });
            displayOverlays(currentSlide);
        }
    });
}

function removeCKEditor() {
    if (typeof CKEDITOR === 'undefined') return;
    for (var k in CKEDITOR.instances) {
        var instance = CKEDITOR.instances[k];
        instance.destroy();
    }
}

function addCKEditor() {
    removeCKEditor();
    var overlayConfig = {
        extraPlugins: 'widget,dialog,clipboard,lineutils,mathjax,mheliststyle,menu,contextmenu',
        toolbar: [
            ['FontSize'],
            ['Bold','Italic','Underline'],
            ['TextColor','BGColor'],
            {
                name: 'paragraph',
                groups: [ 'list', 'align' ],
                items: [ 'NumberedList', 'BulletedList', 'mheliststyle', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]
            },
            ['Mathjax']
        ],
        font_defaultLabel: 'Proxima Nova',
        floatSpacePinnedOffsetY: 200,
        fontSize_defaultLabel: '14',
        autoParagraph: true,
        enterMode: CKEDITOR.ENTER_P,
        mathJaxLib: '\/\/cdn.mathjax.org\/mathjax\/latest\/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
    };

    var labelCaptionConfig = {
        extraPlugins: 'widget,dialog,clipboard,lineutils,mathjax',
        toolbar: [
            ['FontSize'],
            ['Bold','Italic','Underline'],
            ['TextColor','BGColor'],
            ['Mathjax']
        ],
        font_defaultLabel: 'Proxima Nova',
        floatSpacePinnedOffsetY: 200,
        fontSize_defaultLabel: '14',
        mathJaxLib: '\/\/cdn.mathjax.org\/mathjax\/latest\/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
    };

    $('#preview-area').imagesLoaded(function() {
        mhe.configureCKEditor({
            ckeditorConfig: labelCaptionConfig,
            options: {
                wiris: true,
                editorSelector: '.ckeditor.item-text'
            }
        });
        mhe.configureCKEditor({
            ckeditorConfig: overlayConfig,
            options: {
                wiris: true,
                editorSelector: '.ckeditor[name="overlayContent"]'
            }
        });

        function ckeditorChangeHandler(event, iEl, iData, clientContext) {
            var data = iData;
            var el = iEl;
            var dataName = $(el).attr('data-name');
            var oldData;
            if ((dataName === 'label') || (dataName === 'caption')) {
                oldData = slideInfo[currentSlide - 1][dataName];
                slideInfo[currentSlide - 1][dataName] = data;
                sendData();
            } else if (dataName === 'overlayContent') {
                var dataID = parseInt($(el).attr('data-id'), 10);
                oldData = slideInfo[currentSlide - 1].overlays[dataID][dataName];
                slideInfo[currentSlide - 1].overlays[dataID][dataName] = data;
                displayOverlays(slideInfo[currentSlide - 1].identifier);
                myMathJaxTypeset();
                sendData();
            } else {
                console.log('CKEditor field type unknown.');
            }

        }

        mhe.ckeditorInstallHandlers({changeCallback: ckeditorChangeHandler});

        CKEDITOR.on('instanceReady', function(e) {
            e.removeListener();
            $.each(CKEDITOR.instances, function(i, editor) {
                var el = editor.element.$;
                var dataName = $(el).attr('data-name');
                var data;
                if ((dataName === 'overlayContent') && slideInfo[currentSlide - 1].hasOwnProperty('overlays')) {
                    var dataID = parseInt($(el).attr('data-id'), 10);
                    data = slideInfo[currentSlide - 1].overlays[dataID][dataName];
                } else {
                    data = slideInfo[currentSlide - 1][dataName];
                }
                editor.setData(data);
            });
        });
    });
}

/* This function makes the slide indicated by @param which active.
 * @param which should be a div with the class "nav-slide")
 * directly containing the thumbnail image.
 * selectSlide highlights the thumbnail and shows the image and associated text.
 */
function selectSlide(which) {
    if (!$(which).hasClass('nav-slide')) {
        // if for some reason there's a bad argument, select first slide
        which = $('.nav-slide')[0];
    }
    var thumbs = $('.nav-slide');
    thumbs.removeClass('active');
    $(which).addClass('active');
    var li = $(which).closest('li');
    var ind = li.attr('data-index');
    var id = li.data('id');
    currentSlide = parseInt(ind, 10);
    var slideEntry = getSlide(id);
    if (!slideEntry) {
        /* If execution gets here, information for this slide doesn't exist.
         * This means something got messed up.
         * How should we handle this?
         */
        //console.log('no info for slide (slideEntry).');
        return;
    }

    var show =  $('.wrapper-' + slideEntry.identifier);
    show.stop(true,true).animate({opacity: 1, duration: 370});
    if (lastStop > 0 && lastStop <= slideInfo.length){
        var hide = $('.wrapper-' + slideInfo[Math.round(lastStop)-1].identifier);
        if (show[0] !== hide[0]) {
            hide.stop(true,true).animate({opacity: 0, duration: 370});
        }
    }
    lastStop = ind;

    // HACK (lilith): for some reason turning off animation and turning it back on
    // after setting value fixes jerky animation issue. Can't pinpoint why the problem exists in the first place
    // although it seems to be a known problem with jQuery slider
    $('#slider').slider('option', 'animate', false);
    $('#slider').slider('value', ind);
    $('#slider').slider('option', 'animate', true);

    $('.overlay').css({'opacity': 0});
    setTimeout(function() {
        //MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        myMathJaxTypeset();
        //addCKEditor();
    }, 750);
    imagesLoaded('.wrapper-' + slideEntry.identifier, function() {
        displayImageSettings(slideEntry.identifier);
        displayOverlays(slideEntry.identifier);
        displayOverlayEditors(slideEntry.identifier);
        displayImageDescriptionEditors(slideEntry.identifier);

        var leftOffset = $('.preview').css('left');
        if (leftOffset === '-10000px') {
            toggleWorkspace();
        }


    });

}

/* NOTE: This implementation assumes that the slideInfo array
 * is kept up to date with the thumbnail order.
 */
function orientThumbnails() {
    var thumb_imgs = $('.actual-image');
    $(thumb_imgs).each(function(i) {
        var image = slideInfo[i].image;
        if (!image) {
            return;
        }
        $(image).load( (function(thumb, image){
            return function() {
                var portrait = (image.naturalHeight > image.naturalWidth);
                if (portrait) {
                    $(thumb).removeClass('landscape');
                    $(thumb).addClass('portrait');
                } else {
                    $(thumb).removeClass('portrait');
                    $(thumb).addClass('landscape');
                }
            };
        })(this, image));

        if (image.complete) {
            $(image).load();
        }
    });
}

function renumberThumbnails(){
    var newCurrent = 0;
    var slides = document.querySelectorAll('#slides ol li');
    Array.prototype.forEach.call(slides, function(slide, arrayIdx){
        var idx = arrayIdx + 1;
        var oldIdx = slide.getAttribute('data-index');
        if (parseInt(oldIdx, 10) === parseInt(currentSlide, 10)) {
            newCurrent = idx;
        }
        slide.setAttribute('data-index', idx);

        var image = $(slide).find('.actual-image');
        $(image).removeClass('image' + oldIdx).addClass('image' + idx);
    });
    currentSlide = newCurrent;
}

function loadMediaTab(){
    drawThumbnails();

    if (currentSlide > 0){
        selectSlide($('.nav-slide')[currentSlide-1]);
    }

    $('.nav-slide .actual-image').each(function() {
        $(this).load(function() {
            $(this).hide();
            $(this).fadeIn(400);
        });
    });

    orientThumbnails();

    $('.sortableThumbs').sortable({
        update: function(event, ui){

            var old_ind = ui.item.attr('data-index');
            renumberThumbnails();
            var new_ind = ui.item.attr('data-index');
            var slide = slideInfo.splice(old_ind - 1, 1);
            slideInfo.splice(new_ind - 1, 0, slide[0]);
            for (var i = 1; i < slideInfo.length + 1; i++) {
                slideInfo[i - 1].originalIndex = i;
            }
            sendData();

            var id = $('.nav-slide.active').closest('li').attr('data-id');
            selectSlide($('.nav-slide.slide-' + id));
        },
        forcePlaceholderSize: true,
        placeholder: 'sortable-placeholder',
        scroll: false
    });
}

function drawDeck() {
    for (var i = 0 ; i < slideInfo.length; i++){
        var wrapper = $('<div/>');
        wrapper.addClass('image-wrapper');
        wrapper.addClass('wrapper-' + slideInfo[i].identifier);
        wrapper.append(slideInfo[i].image);
        $('#preview-image').append(wrapper);
    }
}


/*
Below is how it *used* to be. Now (as of sprint 31) we let images be their
full, natural width.

This function sets the size of the preview image div to the tallest slide image.

Images with natural dimensions less than width and height of the preview image
div are displayed at their natural size.

If the natural width of an image is less than the preview image div width (702px),
it is displayed at its natural width, with a height less than or equal to the
height of the preview image div.

If the natural width of an image is greater than the preview image div
width (702px), it is scaled to 100% of the width of the preview image
div. If it's the tallest image, then it will fill the preview image
div; otherwise, there will be white space above and below, so that it's
centered vertically.
*/
function setPreviewSize() {
    $('#preview-image').css({height: '250px'}); //some minimum height
    var updateJSON = false;

    /*
    Get the natural widths and heights of all the images
    */
    $(slideInfo).each(function() {
        var imageScale;
        if (typeof this.scale !== 'undefined') {
            imageScale = this.scale;
        } else {
            imageScale = 1;
        }
        var thisImage = this.image.src;
        var slideIdentifier = this.identifier;
        $(this.image).load((function(thisImageScale, thisImageSrc, thisSlideIdentifier) {
            var newImage = new Image();
            newImage.src = thisImageSrc;
            var imgHeight = newImage.naturalHeight;
            var imgWidth = newImage.naturalWidth;
            var thisSlide = getSlide(thisSlideIdentifier);
            if (thisSlide.imageWidth !== imgWidth) {
                thisSlide.imageWidth = imgWidth;
                updateJSON = true;
            }
            if (thisSlide.imageHeight !== imgHeight) {
                thisSlide.imageHeight = imgHeight;
                updateJSON = true;
            }
            if (updateJSON) sendData();
            imgHeight = imgHeight * thisImageScale;
            imgWidth = imgWidth * thisImageScale;
            imageNaturalHeights.push(imgHeight);
            imageNaturalWidths.push(imgWidth);
        }(imageScale, thisImage, slideIdentifier)));
        if (this.image && this.image.complete) {
            $(this.image).load();
        }
    });

    $('.workspace').imagesLoaded(function() {
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
        var widestImage = Math.max.apply(null, imageNaturalWidths);
        /*
        Now (sprint 31) we're not going to limit the width of the canvas.
        Previously it was limited to 702px.
        */
        //if (widgetSize === 'fitImages' && widestImage <= 702) {
            //previewAreaWidth = widestImage;
        //} else {
        //    previewAreaWidth = 702;
        //}
        var imageScale = widestImage / tallestImageWidth;
        var slideHeight;
        if (imageScale <= 1) {
            slideHeight = tallestImageHeight * imageScale;
        } else {
            slideHeight = tallestImageHeight;
        }
        $('#preview-container').css({"width": widestImage + 'px'});
        $('#preview-image').css({
            "width": widestImage + 'px',
            "height": slideHeight + "px"
        });
        /*
        Fit all the images within the slide viewer, which is now optimized for the
        tallest image of the greatest width.
        */
        $('.image-wrapper .fullImage').each(function(index, el) {
            var slideWidth = widestImage;
            var userImageScale;
            if (typeof slideInfo[index].scale !== 'undefined' &&
                slideInfo[index].scale !== 1) {
                userImageScale = slideInfo[index].scale;
            } else {
                userImageScale = 1;
            }
            var imgHeight = this.naturalHeight;
            var imgWidth = this.naturalWidth;
            imgHeight = imgHeight * userImageScale;
            imgWidth = imgWidth * userImageScale;
            var scale = slideWidth / imgWidth;
            var newHeight = imgHeight * scale;
            var newWidth = imgWidth * scale;
            /*
            If the image will fit in the slide viewer at its natural size,
            then show it that way -- centered.
            */
            if (imgWidth <= slideWidth && imgHeight <= slideHeight) {
                $(el).parent().css({
                    "width": imgWidth + 'px',
                    "height": imgHeight + 'px',
                    "display": "inherit",
                    "left": ((slideWidth - imgWidth) / 2) + 'px',
                    "top": ((slideHeight - imgHeight) / 2) + 'px'
                });
                $(this).css({
                    "width": imgWidth + 'px',
                    "height": imgHeight + 'px',
                    "display": "inherit",
                    "margin-left": "auto",
                    "margin-right": "auto"
                });
            /*
            The image width fits but the height does not.
            */
            } else if (imgWidth <= slideWidth && newHeight > slideHeight) {
                $(el).parent().css({
                    "width": (slideHeight / imgHeight * imgWidth) + 'px',
                    "height": slideHeight + "px",
                    "display": "inherit",
                    "left": '0px',
                    "top": '0px'
                });
                $(this).css({
                    "width": (slideHeight / imgHeight * imgWidth) + 'px',
                    "height": slideHeight + "px",
                    "display": "inherit",
                    "margin-left": "auto",
                    "margin-right": "auto"
                });
            /*
            The behavior below has been changed as of sprint 31: display the
            image at its full, natural width.

            If the width of the scaled image is greater than the slider viewer width,
            display it at 100% of the width of the viewer, with its height set
            proportionally (preserving aspect ratio).
            */
            } else if (newWidth >= slideWidth && newHeight <= slideHeight) {
                $(el).parent().css({
                    "width": slideWidth + 'px',
                    "height": newHeight + "px",
                    "display": "inherit",
                    "left": '0px',
                    "top": ((slideHeight - newHeight) / 2) + 'px'
                });
                $(this).css({
                    "width": slideWidth + 'px',
                    "height": newHeight + "px",
                    "display": "inherit",
                    "margin-left": "auto",
                    "margin-right": "auto"
                });
            /*
            If the height of the image is greater than the slide viewer height, then
            display the image as tall as possible. The proportionally scaled width of
            the image is less than the width of the slider viewer, so it will fit --
            and be positioned in the horizontal center, with white space on the left
            and right.
            */
            } else if (newWidth <= slideWidth && newHeight > slideHeight) {
                $(el).parent().css({
                    "width":  (slideHeight / newHeight * newWidth) + "px",
                    "height": slideHeight + "px",
                    "display": "inherit",
                    "left": ((slideWidth - (slideHeight / newHeight * newWidth)) / 2) + 'px',
                    "top": '0px'
                });
                $(this).css({
                    "width":  (slideHeight / newHeight * newWidth) + "px",
                    "height": slideHeight + "px",
                    "display": "inherit",
                    "margin-left": "auto",
                    "margin-right": "auto"
                });
            }
        });
    });
}

function setSliderTicks(){
    var $slider =  $('#slider');
    var max =  $slider.slider("option", "max");
    var spacing;
    if (max > 1){
        spacing = 100 / (max - 1);
    } else {
        spacing = 50;
    }
    $slider.find('.ui-slider-tick-mark').remove();
    for (var i = 0; i < max ; i++) {
        $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
    }
}

//--------------------------------------------------------------------
// Slideline Navigation (slider)
//--------------------------------------------------------------------

function clearGhosts(start, end, animate) {
    for (var i = 0; i < slideInfo.length; i++){
        if (i === start || i === end) {
            continue;
        }
        var wrapper = $('.wrapper-' + slideInfo[i].identifier);
        if (animate) {
            wrapper.animate({opacity: 0, duration: 370});
        } else {
            wrapper.css({opacity: 0});
        }
    }
}

function buildSlider() {
    $("#slider").slider({
        animate: true,
        value: 1,
        min: 1,
        max: slideInfo.length,
        step: 0.01,
        slide: function (event, ui) {
            var sliderPos = (ui.value); //ex: 1.25
            var wholeSliderPos = Math.floor(sliderPos); //ex: 1
            var decVal = sliderPos - wholeSliderPos; // ex: 1.25 - 1 (=.25)
            var rangeStart = Math.floor(sliderPos);
            var rangeEnd = Math.ceil(sliderPos);

            if (lastStop !== rangeStart && lastStop !== rangeEnd && lastStop > 0 && lastStop <= slideInfo.length){
                var old = $('.wrapper-' + slideInfo[lastStop - 1].identifier);
                old.css('opacity', 0);
            }

            var currentImage = $('.wrapper-' + slideInfo[wholeSliderPos - 1].identifier);
            var nextImage = (wholeSliderPos < slideInfo.length ? $('.wrapper-' + slideInfo[wholeSliderPos].identifier) : []);

            if (ui.value > last) {
                $(currentImage).css("opacity", 1 - decVal);
                $(nextImage).css("opacity", decVal);
            }

            if (ui.value < last) {
                $(currentImage).css("opacity", 1 - decVal);
                $(nextImage).css("opacity", decVal);
            }

            if (Math.floor(last) !== wholeSliderPos) {
                clearGhosts(rangeStart - 1, rangeEnd - 1);
            }
            last = ui.value;
        },
        stop: function( event, ui ) {
            //addCKEditor();
            var wholeVal = Math.round(ui.value);
            $( "#slider" ).slider( 'value', wholeVal);

            clearGhosts(wholeVal - 1, undefined, true);
            var slideEntry = slideInfo[wholeVal - 1];
            currentSlide = wholeVal;
            selectSlide($('.nav-slide')[currentSlide - 1]);
            var thumb = $('.nav-slide.slide-' + slideEntry.identifier);

            var currentImage = $('.wrapper-' + slideEntry.identifier);
            $(currentImage).stop(true,true).animate({opacity: 1, duration: 370});

            $('.nav-slide').removeClass('active');
            thumb.addClass('active');
            last = wholeVal;
            lastStop = wholeVal;
        }

    });
}

function initSlider() {
    buildSlider();
    setSliderTicks();
}

function onLoaded() {
    initSlider();
    loadMediaTab();

    $('.panel').imagesLoaded(function() {
        drawDeck();
        setPreviewSize();

        if (slideInfo.length > 0) {
            currentSlide = 1;
            showPreview();
            $('.upload').hide();
            selectSlide($('.nav-slide')[0]);
        } else {
            hidePreview();
            $('.upload').show();
        }
    });
}

//--------------------------------------------------------------------
// Click functions
//--------------------------------------------------------------------

function clickAdd() {
    $('#image-uploader').click();
}

function clickReplace(id) {
    $('#image-replacer').data('id', id);
    $('#image-replacer').click();
}

function deleteSlide(ident) {
    var deleted = $('li.slide-' + ident)[0];
    var ind = getIndex(ident);
    // CAUTION: The above line is costly if there are many slides.
    if (ind > -1){
        $(slideInfo[ind].image).closest('.image-wrapper').remove();
        slideInfo.splice(ind, 1);
        sendData();
    }
    if (deleted){
        //remove from navigation
        var thumbInd = $(deleted).attr('data-index');
        var thumbs = $('.nav-slide');
        var next = thumbs[thumbInd];
        var prev = thumbs[thumbInd-2];
        $(deleted).animate({opacity: 0}, {duration: 50}).slideUp(100, function() {
            deleted.parentNode.removeChild(deleted);
            $('#slider').slider('option', 'max', slideInfo.length);


            var deleteActive = (thumbInd === currentSlide); //deleteActive must be recorded before renumbering!
            renumberThumbnails();
            setSliderTicks();

            //Below code switches focus if current slide was deleted.
            if (deleteActive){
                if (next) {
                    selectSlide(next);
                } else if (prev) {
                    selectSlide(prev);
                } else {
                    toggleWorkspace();
                }
            } else {
                $('#slider').slider('value', currentSlide);
            }
            if (slideInfo.length === 0) {
                currentSlide = 0;
            }
            setPreviewSize();


        });
    }
}

function confirmDelete(ident) {
    var overlay = $('.overlay-mask');
    var dialog = $('.dialog-box');
    dialog.show();
    overlay.addClass('overlay-mask-visible');
    var confirm = $('.confirmDelete');
    var cancel = $('.cancelDelete');

    confirm.on('click', function() {
        deleteSlide(ident);
        $(this).off('click');
        $('.confirmation').hide();
        $('.overlay-mask').removeClass('overlay-mask-visible');
    });
    cancel.on('click', function() {
        $(confirm).off('click');
    });
}

function clickDelete(ident) {
    if (askConfirm){
        confirmDelete(ident);
    } else {
        deleteSlide(ident);
    }
}

//--------------------------------------------------------------------
// Slide manipulation functions
//--------------------------------------------------------------------

function addSlide() {
    var slideNum = slideInfo.length + 1;
    var id = generateId();
    var image = new Image();
    image.src = 'img/blank.svg';
    image.className = 'fullImage';
    var newSlide = {
            image: image,
            originalIndex: slideNum,
            imgsrc: 'img/blank.svg',
            identifier: id,
            label: '',
            caption: '',
            slideShortDescription: '',
            slideLongDescription: ''
    };
    slideInfo.push(newSlide);

    sendData();

    loadMediaTab();
    $('#preview-image').empty();
    drawDeck();
    $('#slider').slider('option', 'max', slideInfo.length);
    setSliderTicks();

    setPreviewSize();
    var activeIndex = $('.nav-slide').length;
    if (slideInfo.length > 0) {
        currentSlide = parseInt(activeIndex, 10);
        showPreview();
        $('.upload').hide();
        setTimeout(function() {
            selectSlide($('.nav-slide.slide-' + currentSlide));
        }, 100);
    } else {
        hidePreview();
        $('.upload').show();
    }

}

function duplicateSlide(ident) {
    var activeIndex = $('.nav-slide.active').closest('li').attr('data-index');
    var id = generateId();
    // Make a "deep" copy of the source slide
    var newSlide = $.extend(true, {}, getSlide(ident));

    var image = new Image();
    image.src = newSlide.imgsrc;
    image.className = 'fullImage';
    newSlide.image = image;
    newSlide.originalIndex = parseInt(activeIndex, 10) + 1;
    newSlide.identifier = id;
    for (var i = 0; i < slideInfo.length; i++) {
        if (slideInfo[i].originalIndex >= parseInt(activeIndex, 10) + 1) {
            slideInfo[i].originalIndex = parseInt(slideInfo[i].originalIndex, 10) + 1;
        }
    }

    slideInfo.splice(parseInt(activeIndex, 10), 0, newSlide);

    sendData();

    loadMediaTab();
    $('#preview-image').empty();
    drawDeck();
    $('#slider').slider('option', 'max', slideInfo.length);
    setSliderTicks();

    setPreviewSize();
    if (slideInfo.length > 0) {
        currentSlide = parseInt(activeIndex, 10) + 1;
        showPreview();
        $('.upload').hide();
        setTimeout(function() {
            selectSlide($('.nav-slide')[parseInt(activeIndex, 10)]);
        }, 1);
    } else {
        hidePreview();
        $('.upload').show();
    }
}

function addOverlay() {
    var id = currentSlide - 1;
    var currentOverlay;
    if (slideInfo[id].hasOwnProperty('overlays')) {
        currentOverlay = slideInfo[id].overlays.length;
    } else {
        slideInfo[id].overlays = [];
        currentOverlay = 0;
    }
    slideInfo[id].overlays[currentOverlay] = {
        "overlayContent": "",
        "overlayPositionTop": 5,
        "overlayPositionLeft": 2
    };
    displayOverlayEditors(currentSlide);
}

function deleteOverlay(id) {
    // Remove overlay id of the current slide, then call selectSlide(which) to redraw
    slideInfo[currentSlide - 1].overlays.splice(id, 1);
    sendData();
    selectSlide($('.nav-slide')[currentSlide - 1]);
}

//--------------------------------------------------------------------
// Caption/label functions
//--------------------------------------------------------------------

function autoSize(elem, animate) {
    /* V1: This is the simple, less expensive way. It's not smooth, though,
     * and it goes back to textarea default size when you expand and then
     * shrink down to one line or less. This looks kind of weird because it's not the same
     * size as our initial size (doesn't match the label text field height).
     */
    // this.style.height = 'auto';
    // this.style.height = (this.scrollHeight) + 'px';


    /* V2: This method uses a hidden copy for shrinking when text is deleted.
     * It's an expensive thing to do, but we can do smooth animation of the resizing
     * and it can go back to the height we set initially when shrinking down to one line
     * or less.
     */
    var elemHeight = $(elem).outerHeight(true);
    if (elem.scrollHeight >= 150) { // 150px = max height before scrolling is activated
        elem.style.overflow = 'auto';
        if (animate){
            $(elem).animate({height: '150px'}, {duration: 200, easing: 'linear', queue: false});
        } else {
            elem.style.height = '150px';
        }
        return;
    }
    var copy = $(elem);
    copy.html(elem.html);
    copy.addClass('item-clone');
    $(elem.parentNode).append(copy[0]);
    var h = copy[0].scrollHeight;
    if (h < elemHeight) {
        h = elemHeight;
    }
    if (animate) {
        $(elem).animate({height: h.toString() + 'px'}, {duration: 200, easing: 'linear', queue: false});
    } else {
        elem.style.height = h.toString() + 'px';
    }
    copy.remove();
}

//--------------------------------------------------------------------
// Drag-and-drop upload
//--------------------------------------------------------------------
// Following tutorial at http://www.sitepoint.com/html5-file-drag-and-drop/

function dragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.type === 'dragover') {
        $(e.target).addClass('hovering');
        $('.dragText').addClass('ready-text');
        $('.dragText').text('Ready to Drop');
        $('.upload-instructions .details').text('Drop your files at any time.');
    } else {
        $(e.target).removeClass('hovering');
        $('.dragText').removeClass('ready-text');
        $('.dragText').text('Click to Upload Images');
        $('.upload-instructions .details').html('or drag and drop files from your desktop.<p/>* All images should have the same aspect ratio.');
    }
}

//--------------------------------------------------------------------
// Upload-related functions
//--------------------------------------------------------------------

function uploadHandler(e) {
    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var slideTemp = $('#slide-partial').html().replace(/<\!\[CDATA\[|\]\]>/g, '');
        var singleSlide = Handlebars.compile(slideTemp);
        var slideNum = slideInfo.length+1;
        var id = generateId();
        slideInfo.push({
            image: undefined,
            imgsrc: 'img/blank.svg',
            label: '',
            caption: '',
            originalIndex: slideNum,
            identifier: id,
            slideShortDescription: '',
            slideLongDescription: ''
        });
        var newSlide = singleSlide({
            originalIndex: (slideInfo.length),
            imgsrc: 'img/blank.svg',
            identifier: id
        });
        $('.sortableThumbs').append(newSlide);
        var newWrapper = $('<div/>');
        newWrapper.addClass('image-wrapper wrapper-' + id);
        newWrapper.append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
        $('#preview-image').append(newWrapper);
        $('li.slide-' + id + ' .nav-slide').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');

        $('#slider').slider('option', 'max', slideInfo.length);
        setSliderTicks();

        window.parent.postMessage({
            type: 'asset',
            method: 'image',
            payload: {
                data: file,
                id: id,
                progress: true
            }
        }, '*');
    }
}

function fileDrop(e) {
    dragHover(e);
    uploadHandler(e);
}

function dragInit() {
    // Initialize drag upload functionality
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
        var fileDrag = $('.drag-area')[0];
        fileDrag.addEventListener('dragover', dragHover, false);
        fileDrag.addEventListener('dragleave', dragHover, false);
        fileDrag.addEventListener('drop', fileDrop, false);

        $('.upload-instructions .details').show();
    }
}

window.addEventListener('message', function(evt){
    var data = evt.data;
    var id;
    if (data.type === 'asset' && data.method === 'image' && data.payload){
        var payload = data.payload;
        if (payload.progress === 1){
            if (payload.path){
                var imgsrc = payload.path;
                id = payload.id;
                var img = new Image();
                img.src = imgsrc;
                img.className = 'fullImage';
                var slideEntry = getSlide(id);
                if (!slideEntry) {
                    //This means the slide was deleted before image finished uploading.
                    return;
                }

                //update thumbnail
                var thumb = $('li.slide-' + id + ' .actual-image');
                $('.load-' + id + ' .load-progress').width('100%');
                thumb.attr('src', imgsrc);
                thumb.imagesLoaded(function() {
                //thumb.load(function() {
                    $('.load-' + id).fadeOut(400, function() {
                        $('.load-' + id).remove();
                        thumb.fadeIn(400);

                        slideEntry.image = img;
                        slideEntry.imgsrc = imgsrc;
                        sendData();
                        var imgWrapper = $('.wrapper-' + id);
                        imgWrapper.css({opacity: 0});
                        imgWrapper.empty().append(slideEntry.image);
                        imgWrapper.animate({opacity: 1, duration: 400});
                        displayOverlays(slideEntry.identifier);
                        orientThumbnails();
                        setPreviewSize();
                        selectSlide($('.nav-slide.slide-' + id));
                        //MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                        myMathJaxTypeset();
                    });
                    $(this).off('load');
                });

                renumberThumbnails();

            } else {
                // This means the upload failed.
                // Should we alert failure to load as log message?
                // Clean up thumbnails (remove failed uploads)?
                // What should be done if it's a replacement?
                console.log('upload failed.');
            }
        } else { //not done, making progress
            id = payload.id;
            var loadPercent = payload.progress * 100;
            $('.load-' + id + ' .load-progress').delay(1500).width(loadPercent + '%');
            if (currentSlide === 0){ //if going from empty to 1+ slide, set first slide active
                selectSlide($('.nav-slide')[0]);
            }
        }
    }
});


//--------------------------------------------------------------------
// On-load functions - listeners, etc.
//--------------------------------------------------------------------

// Called after loading the JSON contents, for instance
window.addEventListener('load', function() {
    if (window.File && window.FileList && window.FileReader){
        dragInit();
    }

    $('#extraAccessibilityInfo').on('change', ':input', function(event) {
        var ident = $(this).attr('data-id');
        var slideEntry = getSlide(ident);
        slideEntry[$(this).attr('id')] = $(this).val();
        sendData();
    });

    $('input[type="radio"]').on('change', function(e) {
        currentLayout = e.target.value;
        //alert("clicked" + currentLayout);
    });

    $('.cancelDelete').click(function(){
        $('.confirmation').hide();
        $('.overlay-mask').removeClass('overlay-mask-visible');
    });

    $('#showDelConf').change(function() {
        if ($(this).is(':checked')){
            askConfirm = false;
        } else {
            askConfirm = true;
        }
        sendData();
    });

    $('body').on('click', '.add-image', function() {
        clickAdd();
    });

    $('body').on('click', '.add-slide', function() {
        addSlide();
    });

    $('.add-overlay').on('click', function() {
        addOverlay();
    });

    $('.btn-delete').on('click', function() {
        clickDelete(slideInfo[currentSlide-1].identifier);
        return false;
    });

    $('body').on('click', '.btn-trash', function(event) {
        var identifier = $(event.currentTarget).attr('data-id');
        clickDelete(identifier);
        return false;
    });

    $('.btn-replace').on('click', function() {
        clickReplace(slideInfo[currentSlide-1].identifier);
        return false;
    });

    $('.btn-duplicate').on('click', function() {
        duplicateSlide(slideInfo[currentSlide-1].identifier);
        return false;
    });

    $('.drag-area').on('click', function() {
        clickAdd();
    });

    $('.slide-caption').on('input paste', function() {
        autoSize(this, true);
    });

    $('.panel').on('click', '.icon-trash', function() {
        clickDelete( $(this).closest('li').data('id') );
        return false;
    });

    $('.panel').on('click', '.nav-slide', function() {
        selectSlide(this);
    });

    $('#image-uploader').change(function(e){
        uploadHandler(e);
        $(this).val('');
    });

    $('#image-replacer').change(function(){
        var file = document.getElementById('image-replacer').files[0];
        var id = $(this).data('id');
        var slideInd = getIndex(id);
        //TODO: THIS MIGHT NEED TO BE CHANGED - CHECK
        slideInfo[slideInd].image = undefined;

        // fade out thumbnail
        $('li.slide-' + id + ' .actual-image').fadeOut(400);
        // add loader spans
        $('li.slide-' + id + ' .nav-slide').append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
        $('.wrapper-' + id).empty().append('<span class="load-' + id + ' load-container"><span class="load-progress"></span></span>');
        $(this).val('');

        window.parent.postMessage({
            type: 'asset',
            method: 'image',
            payload: {
                data: file,
                id: id,
                progress: true
            }
        }, '*');

    });

    $('.marker').on("click", function(){
        if($(this).hasClass('expanded')){
            $('#settings').hide();
            $(this).removeClass('expanded').addClass('contracted');
        }
        else if($(this).hasClass('contracted')){
            $('#settings').show();
            $(this).removeClass('contracted').addClass('expanded');
        }
    });

    $('#settings :input').on("change", function(e) {
        var currentInput = $(e.currentTarget).attr("name");
        switch (currentInput) {
            case "widgetSize":
                widgetSize = $(e.currentTarget).val();
                setPreviewSize();
                break;
            case "orientation":
                orientation = $(e.currentTarget).val();
                break;
            case "scale":
                scale = convertSliderSize($(e.currentTarget).val());
                break;
        }
        sendData();
    });

    $('.content').delegate('.overlayEdit .icon-trash', 'click', function(e) {
        deleteOverlay($(e.currentTarget).closest('div').attr('data-id'));
        return false;
    });

    $('.content').delegate('#overlays input', "keyup change", function(e) {
        var currentInputName = $(e.currentTarget).attr('data-name');
        if (currentInputName !== 'overlayContent') {
            var currentInputID = $(e.currentTarget).attr('data-id');
            var newData = $(e.currentTarget).val();
            var oldData = slideInfo[currentSlide - 1].overlays[parseInt(currentInputID, 10)][currentInputName];
            if (newData !== oldData) {
                slideInfo[currentSlide - 1].overlays[parseInt(currentInputID, 10)][currentInputName] = newData;
                displayOverlays(slideInfo[currentSlide - 1].identifier);
                sendData();
            }
        }
    });

    /*
    Support dragging within a CKEditor editor instance
    */
    $('.content').on('dragend', '.ckeditor', function(e) {
        var editor = $(e.currentTarget).ckeditorGet();
        var data = editor.getData();
        var el = editor.element.$;
        var dataName = $(el).attr('data-name');
        var oldData;
        if (dataName === 'label' || dataName === 'caption') {
            oldData = slideInfo[currentSlide - 1][dataName];
            if (data !== oldData) {
                slideInfo[currentSlide - 1][dataName] = data;
                sendData();
            }
        } else if (dataName === 'overlayContent') {
            var dataID = parseInt($(el).attr('data-id'), 10);
            oldData = slideInfo[currentSlide - 1].overlays[dataID][dataName];
            if (data !== oldData) {
                slideInfo[currentSlide - 1].overlays[dataID][dataName] = data;
                displayOverlays(slideInfo[currentSlide - 1].identifier);
                //MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                myMathJaxTypeset();
                sendData();
            }
        } else {
            alert('Shouldn\'t be here.');
        }
    });

    $('.content').on('keyup', '#image-settings input', function(e) {
        var id = $(e.currentTarget).attr('data-id');
        $('#image-settings button[data-id="' + id + '"]').show();
    });

    $('.content').on('click', '#image-settings button', function(e) {

        var id = $(e.currentTarget).attr('data-id');
        var slideEntry = getSlide(id);
        var currentInputName = $(e.currentTarget).attr('data-name');
        if (currentInputName === 'imageScale') {
            var newValue = $('#image-settings input[data-id="' + id + '"]').val();
            if (newValue > 0 && newValue <= 100) {
                var newImageScale = newValue / 100;
                slideEntry.scale = newImageScale;
                imageNaturalWidths = [];
                imageNaturalHeights = [];
                sendData();
                $('#preview-image').empty();
                drawDeck();
                setPreviewSize();
                selectSlide($('.nav-slide.slide-' + id));
                displayOverlays(slideEntry.identifier);
            } else if (newValue > 100) {
                $('#imageScaleMax').text('Maximum: 100%');
            } else {
                $('#imageScaleMax').text('');
            }
        }
    });

});

$(window).resize(function(){
    setPreviewSize();
    var panelContentWidth = 315;
    // .panel--active .content padding left, right = 28px
    var panelSidePadding = 28 * 2;
    var buttonMenuWidth = 70;
    var windowWidth = $(window).width();
    var previewEditAreaWidth = windowWidth - panelContentWidth - panelSidePadding - buttonMenuWidth;

    $('#preview-container').css({"width": (windowWidth - panelContentWidth) + 'px'});
    $('#preview-area').css({
        //'width': ($(window).width() - 315 - 40 - 100) + 'px',
        "width": previewEditAreaWidth + 'px',
        "overflow": "scroll"
    });
    $('#edit-area').css({
        'width': previewEditAreaWidth + 'px',
        'margin-left': '76px'
    });
});

//--------------------------------------------------------------------
// DOM on-load functions
//--------------------------------------------------------------------

//window.addEventListener('DOMContentLoaded', function(){
$(document).ready(function() {
    $(document).on('contentChanged', function() {
        imagesLoaded(document.body, onLoaded);
    });


    Handlebars.registerPartial('slide', $('#slide-partial').html().replace(/<\!\[CDATA\[|\]\]>/g, ''));

    CKEDITOR.disableAutoInline = true;

    $('.workspace').on('scroll', function(e) {
        var editor = CKEDITOR.currentInstance;
        if (editor) {
            editor.focusManager.blur('noDelay');
            $('.ckeditor').blur();
        }
    });


    initSlideInfo();

    blankImage.src = 'img/blank.svg';
    $(blankImage).addClass('load-placeholder');
    $(window).trigger('resize');
});
