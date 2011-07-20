/*
 * Copyright (C) 2011 Wolfgang Koller
 * 
 * This file is part of GOFG Sports Computer - http://www.gofg.at/.
 * 
 * GOFG Sports Computer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * GOFG Sports Computer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with GOFG Sports Computer.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * jQuery plugin for setting up an infopanel on a given div
 */
(function( $ ){
  var methods = {
    init : function( options ) {
    	var settings = {
    		'value' : 'Value',
    		'maxSizeValue' : null,
    		'size' : { 'width' : 120, 'height' : 120 },
    		'image' : '',
    		'unit' : 'Unit',
    		'fontSizeStep' : 5,
    		'border' : 15,
    		'showStatistics' : false
    	};
    	
        return this.each(function() {
        	if( options ) $.extend( settings, options );
        	
        	// Check if there is a maximum size value
        	if( settings['maxSizeValue'] == null ) settings['maxSizeValue'] = settings['value'];
        	
        	var data = {
        		settings : settings,
        		image : $('<img>').width(24).height(24).css( 'float', 'left' ),
        		unitDiv : $('<div>').height(24).css( 'text-align', 'center' ),
        		currentDiv : $('<div>').css( 'text-align', 'center' ),
        		currentValue : $('<span>'),
        		statsDiv : $('<div>').css( 'text-align', 'center' ),
        		measureSpan : $( '<span>' ).css( 'visibility', 'hidden' ).css( 'display', 'none' )
        	};
        	// Append currentValue span to currentDiv
        	$(data.currentDiv).append(data.currentValue);
        	// Append measure span to the body
        	$('body').append(data.measureSpan);
        	// Check if we have to show the stats
        	if( settings['showStatistics'] ) $(data.currentDiv).append(data.statsDiv);
        	
        	// Create basic layout
        	$(this).html( '' );
        	$(this).addClass( 'ui-bar-c' );
        	$(this).append( data.image ).append( data.unitDiv ).append( data.currentDiv );
        	$(this).data( 'infopanel', data );
        	
        	// Setup the infopanel
        	var defaultVal = settings['value'];
        	methods.setValue.call( $(this), settings['maxSizeValue'] );
    		methods._sizeFont.call($(this), settings['size']['width'], settings['size']['height'] * ((settings['showStatistics']) ? 0.75 : 1.0) );
        	//methods.setSize.call( $(this), settings['size']['width'], settings['size']['height'] );
        	methods.setValue.call( $(this), defaultVal );
        	
        	methods.setImage.call( $(this), settings['image'] );
        	methods.setUnit.call( $(this), settings['unit'] );
        });
    },
    setValue : function( p_value ) {
    	return this.each(function() {
    		if( p_value == null || p_value == undefined ) p_value = "-";
    		
    		$(this).data('infopanel').settings['value'] = p_value;
    		$(this).data('infopanel').currentValue.html( p_value );

   			methods.setSize.call($(this), $(this).data( 'infopanel' ).settings['size']['width'], $(this).data( 'infopanel' ).settings['size']['height'] );
    	});
    },
    setStatistics : function( p_averageValue, p_maximumValue ) {
    	return this.each( function() {
    		$(this).data('infopanel').statsDiv.html( "&Oslash; " + p_averageValue + " / max. " + p_maximumValue );
    		
   			methods.setSize.call($(this), $(this).data( 'infopanel' ).settings['size']['width'], $(this).data( 'infopanel' ).settings['size']['height'] );
    	} );
    },
    setSize : function( p_width, p_height ) {
    	return this.each(function() {
    		$(this).data('infopanel').settings['size'] = { 'width' : p_width, 'height' : p_height };
    		
    		if( !$(this).is( ':visible' ) ) return;

    		// Now calculate the remaining space for the margin
    		var marginSize = (p_height - 2 - $(this).data( 'infopanel' ).currentDiv.outerHeight() - 24 );
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
    		if( !$(this).is( ':visible' ) ) return;
    		if( p_width == 'auto' ) p_width = $(this).width();
    		
			var maximumHeight = p_height - 24 - $(this).data('infopanel').settings['border'];
			var maximumWidth = p_width - $(this).data('infopanel').settings['border'];
			var fontSize = 40;
			var fontSizeStep = $(this).data( 'infopanel' ).settings['fontSizeStep'];
			
			// Show the measure-span
			$(this).data( 'infopanel' ).measureSpan.css( 'display', '' );
			// Set initial font-size
			$(this).data( 'infopanel' ).measureSpan.css( 'font-size', fontSize + 'px' );
			// Auto-Size the font to a maximum
			//$(this).data('infopanel').settings['value']
			$(this).data( 'infopanel' ).measureSpan.html( $(this).data('infopanel').settings['value'] );
			while( $(this).data( 'infopanel' ).measureSpan.height() < maximumHeight && $(this).data( 'infopanel' ).measureSpan.width() < maximumWidth ) {
				fontSize += fontSizeStep;
				$(this).data( 'infopanel' ).measureSpan.css( 'font-size', fontSize + 'px' );
			}
			fontSize -= fontSizeStep;
			//$(this).data( 'infopanel' ).measureSpan.css( 'font-size', fontSize + 'px' );
			$(this).data( 'infopanel' ).currentValue.css( 'font-size', fontSize + 'px' );
			
			// Hide the measure-span
			$(this).data( 'infopanel' ).measureSpan.css( 'display', 'none' );
			//console.log( "Final font-Size: " + fontSize );
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
