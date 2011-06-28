/**
 * jQuery plugin for setting up an infopanel on a given div
 */
(function( $ ){

  var methods = {
    init : function( options ) {
    	var settings = {
    		'value' : 'Value',
    		'size' : { 'width' : 120, 'height' : 120 },
    		'image' : '',
    		'unit' : 'Unit',
    		'fontSizeStep' : 5,
    		'border' : 15
    	};
    	
        return this.each(function() {
        	if( options ) $.extend( settings, options );
        	
        	var data = {
        		settings : settings,
        		image : $('<img>').width(24).height(24).css( 'float', 'left' ),
        		unitDiv : $('<div>').height(24).css( 'text-align', 'center' ),
        		currentDiv : $('<div>').css( 'text-align', 'center' ),
        		currentSpan : $('<span>')
        	};
        	// Append span for measuring font to the div
        	data.currentDiv.append( data.currentSpan );
        	
        	// Create basic layout
        	$(this).html( '' );
        	$(this).addClass( 'ui-bar-c' );
        	$(this).append( data.image ).append( data.unitDiv ).append( data.currentDiv );
        	$(this).data( 'infopanel', data );
        	
        	// Setup the infopanel
        	methods.setValue.call($(this), settings['value'] );
        	methods.setSize.call($(this), settings['size']['width'], settings['size']['height'] );
        	methods.setImage.call($(this), settings['image'] );
        	methods.setUnit.call($(this), settings['unit'] );
        });
    },
    setValue : function( p_value ) {
    	return this.each(function() {
    		$(this).data('infopanel').settings['value'] = p_value;
    		
    		$(this).data('infopanel').currentSpan.html( p_value );

    		methods.setSize.call($(this), $(this).data( 'infopanel' ).settings['size']['width'], $(this).data( 'infopanel' ).settings['size']['height'] );
    	});
    },
    setSize : function( p_width, p_height ) {
    	return this.each(function() {
    		$(this).data('infopanel').settings['size'] = { 'width' : p_width, 'height' : p_height };
    		
    		// If width is auto, find it out ourselves
    		if( p_width == 'auto' ) p_width = $(this).width();
    		// Re-size the font (to make it fit)
    		methods._sizeFont.call($(this), p_width, p_height );
    		
    		// Now calculate the remaining space for the margin
    		var marginSize = (p_height - 2 - $(this).data( 'infopanel' ).currentSpan.outerHeight() - $(this).data('infopanel').image.outerHeight() );
    		var marginTop = (marginSize / 2).toFixed(0);
    		var marginBottom = marginSize - marginTop;
    		// Finally apply the margin
    		$(this).data( 'infopanel' ).currentDiv.css( 'margin-top', marginTop  + 'px' ).css( 'margin-bottom', marginBottom + 'px' );
    	});
    },
    setImage : function( p_imgUrl ) {
    	return this.each(function() {
    		$(this).data('infopanel').settings['image'] = p_imgUrl;

    		$(this).data( 'infopanel' ).image.attr( 'src', p_imgUrl );
    	});
    },
    setUnit : function( p_unit ) {
    	return this.each(function() {
    		$(this).data('infopanel').settings['unit'] = p_unit;
    		
    		$(this).data( 'infopanel' ).unitDiv.html( p_unit );
    	});
    },
    _sizeFont : function( p_width, p_height ) {
    	return this.each(function() {
			var maximumHeight = p_height - $(this).data('infopanel').image.outerHeight() - $(this).data('infopanel').settings['border'];
			var maximumWidth = p_width - $(this).data('infopanel').settings['border'];
			var fontSize = 20;
			
			$(this).data( 'infopanel' ).currentSpan.css( 'font-size', fontSize + 'px' );
			// Auto-Size the font to a maximum
			while( $(this).data( 'infopanel' ).currentSpan.height() < maximumHeight && $(this).data( 'infopanel' ).currentSpan.width() < maximumWidth ) {
				fontSize = fontSize + $(this).data( 'infopanel' ).settings['fontSizeStep'];
				$(this).data( 'infopanel' ).currentSpan.css( 'font-size', fontSize + 'px' );
			}
    	});
    }
  };

  $.fn.infopanel = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.infopanel' );
    }    
  };
})( jQuery );
