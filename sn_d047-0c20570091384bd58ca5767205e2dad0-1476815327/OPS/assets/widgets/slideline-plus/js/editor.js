//--------------------------------------------------------------------
// Sortable Menu List
//--------------------------------------------------------------------
(function( $ ) {

    $.fn.sortableMenu = function() {

       	this.height(this.height());
 		this.sortable({
	  		placeholder: "sort-placeholder"
		});

 		// Keep panel from scrolling while sorting
 		this.mousedown(function() {
 			$(this).parents('.panel-content').css({'overflow':'hidden'});
 		});
        return this;

    };

}( jQuery ));

//--------------------------------------------------------------------
// Selectable Menu List
//--------------------------------------------------------------------
(function( $ ) {

    $.fn.selectableMenu = function() {

       	this.selectable();

        return this;

    };

}( jQuery ));

//--------------------------------------------------------------------
// Editable Menu List
//--------------------------------------------------------------------
(function( $ ) {

    $.fn.editableMenu = function() {
 		var tempText;

       	this.on('click', '.btn-remove', function () {
    		$(this).parent().fadeOut(300, function() { $(this).remove(); });
		});

		this.on('click', '.btn-edit', function () {
			$(this).siblings( ".inner-text" ).attr('contentEditable',true).focus();
			$(this).parent().addClass( "editing" );
			tempText = $(this).siblings( ".inner-text" ).text();
			// $(this).parent().selectable({ disabled: true });
		});

		this.dblclick(function () {
			$(this).children(".inner-text" ).attr('contentEditable',true).focus();
			$(this).addClass( "editing" );
			tempText = $(this).children( ".inner-text" ).text();
			// $(this).parent().selectable({ disabled: true });
		});

		this.on('keydown', '.inner-text', function(e) {
	    	if(e.keyCode === 13)
	    	{
	        	e.preventDefault();
	        	$(this).attr('contentEditable',false);
	        	$(this).parent().removeClass( "editing" );
	    	}
	    	if (e.keyCode === 27) {
	    		e.preventDefault();
	    		$(this).attr('contentEditable',false);
	        	$(this).parent().removeClass( "editing" );
	        	$(this).text(tempText);
	        }
		});

		this.children('.inner-text').blur(function() {
			$(this).attr('contentEditable',false);
	        $(this).parent().removeClass( "editing" );
		});

        return this;

    };

}( jQuery ));

//--------------------------------------------------------------------
// Panel Tabs
//--------------------------------------------------------------------
(function( $ ) {

    $.fn.panelTabs = function() {

       		this.tabs();

			// Tab Menu Underline
			this.find('.menu-underline').width( $('.ui-state-active').width());

			/*this.find('.panel-tab').click(function() {
				$('.menu-underline').width($(this).width()).css({
		       	'-webkit-transform':'translateX('+$(this).position().left+'px)',
		       	'-moz-transform':'translateX('+$(this).position().left+'px)',
		       	'transform':'translateX('+$(this).position().left+'px)' });
		  	});*/

        return this;

    };

}( jQuery ));

//--------------------------------------------------------------------
// Facny Select Dropdown
//--------------------------------------------------------------------
function fancySelect() {
	$('html').click(function() {
		//Hide the menus if visibl
		$('.select-menu--faux .select-menu-list').fadeOut(100);
	});

	$('.select-menu').each(function() {
		var selectMenuFaux;

		selectMenuFaux = '<ul class="select-menu--faux"><li class="selected-value">select menu</li> <ul class="select-menu-list">';

		$(this).children("option").each(function() {
			if($(this).is(':selected')) {
				selectMenuFaux += '<li class="select-menu-option option--selected" data-value="' + this.value + '">' + this.text + '</li>';

			} else {
				selectMenuFaux += '<li class="select-menu-option" data-value="' + this.value + '">' + this.text + '</li>';
			}
		});

		selectMenuFaux += '</ul></span>';
		$(this).after(selectMenuFaux);

		$(this).next().children('.selected-value').text($(this).children(":selected").text());
	});


	$('.select-menu--faux').click(function () {
		event.stopPropagation();
	});

	// Fade in menu when selected label is clicked
	$('.selected-value').click(function () {
		$(this).parent().addClass('menu--active');
		$(this).siblings('.select-menu-list').fadeIn(100);
	});

	// When menu option is clicked, set both real and faux menus
	$('.select-menu-option').click(function() {
		var selectText = $(this).text();
		var selectedVal = $(this).attr('data-value');

		$(this).siblings().removeClass('option--selected');
		$(this).addClass('option--selected');
		// Change the faux selected text
		$(this).parent().siblings('.selected-value').text(selectText);
		// Change the original select box
		$(this).parent().parent().prev().val(selectedVal).change();
		$(this).parents('.select-menu--faux').removeClass('menu--active');
		$(this).parent('.select-menu-list').delay(200).fadeOut(100);
	});
}

function editorInit() {
	// Sortable
	$( ".sortable" ).sortableMenu();

	// Selectable
	$( ".selectable" ).selectableMenu();


	// Editable
	$( ".editable li" ).editableMenu();

	//editable for other things
	$( ".btn-edit" ).on('click', function () {
		$(this).siblings( ".inner-text" ).attr('contentEditable',true).focus();
		$(this).parent().addClass( "editing" );
		// $(this).parent().selectable({ disabled: true });
	});

	// Panel Tabs
	$( ".panel" ).panelTabs();

	// Select menus
	fancySelect();
}


$(function() {

	editorInit();

});
