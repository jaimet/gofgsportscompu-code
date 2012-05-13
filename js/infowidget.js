/*
 * Copyright (C) 2012 Wolfgang Koller
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

// Constructor for infoWidget object
function infoWidget( p_targetDiv, p_options ) {
    // Save options
    $.extend( this.m_options, infoWidget.defaultOptions, p_options );

    this.m_targetDiv = $( '#' + p_targetDiv );
    this.m_targetDiv.height( this.m_options.size.height + 'px' );
    this.m_targetDiv.css( 'position', 'relative' ).addClass( 'ui-bar-c' );

    // Check for auto-width
    if( this.m_options.size.width === 'auto' ) this.m_options.size.width = this.m_targetDiv.width();

    // Create all the internal display divs
    this.m_unitDiv = $( '<div>' );
    this.m_valueDiv = $( '<div>' );
    this.m_indicatorDiv = $( '<div>' );
    // .. end append them to the target
    this.m_targetDiv.append( this.m_unitDiv ).append( this.m_valueDiv ).append( this.m_indicatorDiv );

    // Calculate sizes for internal display divs
    var unitDivWidth = (this.m_options.size.width * 0.25).toFixed(0);
    var valueDivWidth = (this.m_options.size.width * 0.5).toFixed(0);

    // Apply sizes to divs
    this.m_unitDiv.css( 'position', 'absolute' )
    .css( 'top', '0px' )
    .css( 'left', '0px' )
    .css( 'width', unitDivWidth + 'px' )
    .css( 'text-align', 'center' )
    .html( this.m_options.unit );

    this.m_valueDiv.css( 'position', 'absolute' )
    .css( 'top', '0px' )
    .css( 'left', unitDivWidth + 'px' )
    .css( 'width', valueDivWidth + 'px' )
    .css( 'text-align', 'center' )
    .html( this.m_options.value );

    this.m_indicatorDiv.css( 'position', 'absolute' )
    .css( 'top', this.m_unitDiv.height() + 'px' )
    .css( 'left', '0px' )
    .css( 'width', unitDivWidth + 'px' )
    .css( 'text-align', 'center' )
    .html( '&uarr;<br/>&bull;<br/>&darr;' );

    this._sizeFonts();
}

// Defining the default options for an infoWidget
infoWidget.defaultOptions = {
    unit: 'noUnit',
    value: 'noValue',
    showIndicator: false,
    sizeValue: 'noValue',
    size : { width : 'auto', height : 120 }
};

// Define infoWidget properties
infoWidget.prototype.m_options = {};
infoWidget.prototype.m_targetDiv = null;
infoWidget.prototype.m_unitDiv = null;
infoWidget.prototype.m_valueDiv = null;
infoWidget.prototype.m_indicatorDiv = null;
infoWidget.prototype.m_infoDivs = [];

/**
 * Add a new sub-info to the infoWidget
 */
infoWidget.prototype.addSubInfo = function( p_value ) {
            var infoDiv = $( '<div>' );
            infoDiv.css( 'position', 'absolute' )
            .css( 'left', (this.m_valueDiv.position().left + this.m_valueDiv.width()) + 'px'  )
            .css( 'width', (this.m_options.size.width * 0.25).toFixed(0) + 'px' )
            .html( p_value );

            // Append to target & save in internal memory
            this.m_targetDiv.append(infoDiv);
            this.m_infoDivs.push( infoDiv );

            // Re-position all infoDivs
            var divHeight = (this.m_options.size.height / this.m_infoDivs.length).toFixed(0);
            for( var i = 0; i < this.m_infoDivs.length; i++ ) {
                this.m_infoDivs[i].css( 'top', (divHeight * i) + 'px' ).css( 'height', divHeight + 'px' );
            }

            return this.m_infoDivs.length;
        }

/**
 * Update value shown in a sub-info field
 */
infoWidget.prototype.setSubInfo = function( p_index, p_value ) {
            if( p_index >= this.m_infoDivs.length ) return;

            this.m_infoDivs[p_index].html( p_value );
        }

// Auto-size all fonts so that we stick to the configured size
infoWidget.prototype._sizeFonts = function() {
            var fontSize = parseInt(this.m_valueDiv.css( 'font-size' ));

            while( this.m_valueDiv.height() < this.m_options.size.height ) {
                this.m_valueDiv.css( 'font-size', fontSize + 'px' );

                fontSize += 5;
            }

            fontSize -= 5;
            this.m_valueDiv.css( 'font-size', fontSize + 'px' );
        }



/**
 * jQuery plugin for setting up an info-widget on a given div
 */
//(function( $ ){
//     var methods = {
//         init : function( options ) {
//                    var defaultSettings = {
//                        'unit': 'noUnit',
//                        'value': 'noValue',
//                        'bShowIndicator': false,
//                        'sizeValue': 'noValue',
//                    };

//                    var settings = {
//                        'value' : 'Value',
//                        'maxSizeValue' : null,
//                        'size' : { 'width' : 120, 'height' : 120 },
//                        'image' : '',
//                        'unit' : 'Unit',
//                        'fontSizeStep' : 5,
//                        'border' : 5,
//                        'showStatistics' : false
//                    };

//                    return this.each(function() {
//                                         if( options ) $.extend( settings, options );

//                                         // Check if there is a maximum size value
//                                         if( settings['maxSizeValue'] == null ) settings['maxSizeValue'] = settings['value'];

//                                         var data = {
//                                             settings : settings,
//                                             image : $('<img>').width(24).height(24).css( 'float', 'left' ),
//                                             unitDiv : $('<div>').height(24).css( 'text-align', 'center' ),
//                                             currentDiv : $('<div>').css( 'text-align', 'center' ),
//                                             currentValue : $('<span>'),
//                                             currentValueImage : $('<img>').css( 'display', 'none' ),
//                                             statsDiv : $('<div>').css( 'text-align', 'center' ),
//                                             measureSpan : $( '<span>' ).css( 'visibility', 'hidden' ).css( 'display', 'none' )
//                                         };
//                                         // Append currentValue span to currentDiv
//                                         $(data.currentDiv).append(data.currentValue);
//                                         $(data.currentDiv).append(data.currentValueImage);
//                                         // Append measure span to the body
//                                         $('body').append(data.measureSpan);
//                                         // Check if we have to show the stats
//                                         if( settings['showStatistics'] ) $(data.currentDiv).append(data.statsDiv);

//                                         // Create basic layout
//                                         $(this).html( '' );
//                                         $(this).addClass( 'ui-bar-c' );
//                                         $(this).append( data.image ).append( data.unitDiv ).append( data.currentDiv );
//                                         $(this).jqmData( 'infopanel', data );

//                                         // Setup the infopanel
//                                         var defaultVal = settings['value'];
//                                         methods.setValue.call( $(this), settings['maxSizeValue'] );
//                                         methods.setImage.call( $(this), settings['image'] );
//                                         methods.setUnit.call( $(this), settings['unit'] );

//                                         methods._sizeFont.call($(this), settings['size']['width'], settings['size']['height'] * ((settings['showStatistics']) ? 0.75 : 1.0) );
//                                         //methods.setSize.call( $(this), settings['size']['width'], settings['size']['height'] );
//                                         methods.setValue.call( $(this), defaultVal );
//                                     });
//                },
//         setValue : function( p_value ) {
//                        return this.each(function() {
//                                             if( p_value == null || p_value == undefined ) p_value = "-";

//                                             $(this).jqmData('infopanel').settings['value'] = p_value;
//                                             $(this).jqmData('infopanel').currentValue.html( p_value );

//                                             methods.setSize.call($(this), $(this).jqmData( 'infopanel' ).settings['size']['width'], $(this).jqmData( 'infopanel' ).settings['size']['height'] );
//                                         });
//                    },

//         /**
//     * Set an image as value
//     */
//         setValueImage : function( p_imgUrl, p_imgHeight, p_imgWidth ) {
//                             $(this).jqmData('infopanel').currentValue.css( 'display', 'none' );
//                             $(this).jqmData('infopanel').currentValueImage.css( 'display', '' );
//                             $(this).jqmData('infopanel').currentValueImage.attr( 'src', p_imgUrl );
//                             $(this).jqmData('infopanel').currentValueImage.attr( 'width', p_imgHeight + 'px' );
//                             $(this).jqmData('infopanel').currentValueImage.attr( 'height', p_imgWidth + 'px' );

//                             // Now calculate the remaining space for the margin
//                             methods.setSize.call($(this), $(this).jqmData( 'infopanel' ).settings['size']['width'], $(this).jqmData( 'infopanel' ).settings['size']['height'] );
//                         },

//         /**
//     * Set the statistic values (auto-formatted by the function)
//     * @param p_averageValue Average value
//     * @param p_maximumValue Maximum value
//     */
//         setStatistics : function( p_averageValue, p_maximumValue ) {
//                             return this.each( function() {
//                                                  methods.setInfo.call($(this), "&Oslash; " + p_averageValue + " / max. " + p_maximumValue );
//                                              } );
//                         },

//         /**
//     * Uses the statistics div to display an arbitrary string
//     * @param p_infoValue String to display within the statistics div
//     */
//         setInfo : function( p_infoValue ) {
//                       return this.each( function() {
//                                            $(this).jqmData('infopanel').statsDiv.html( p_infoValue );

//                                            methods.setSize.call($(this), $(this).jqmData( 'infopanel' ).settings['size']['width'], $(this).jqmData( 'infopanel' ).settings['size']['height'] );
//                                        } );
//                   },

//         setSize : function( p_width, p_height ) {
//                       return this.each(function() {
//                                            $(this).jqmData('infopanel').settings['size'] = { 'width' : p_width, 'height' : p_height };

//                                            if( !$(this).is( ':visible' ) ) return;

//                                            // Now calculate the remaining space for the margin
//                                            var marginSize = (p_height - 2 - $(this).jqmData( 'infopanel' ).currentDiv.outerHeight() - 24 );
//                                            var marginTop = (marginSize / 2).toFixed(0);
//                                            var marginBottom = marginSize - marginTop;
//                                            // Finally apply the margin
//                                            $(this).jqmData( 'infopanel' ).currentDiv.css( 'margin-top', marginTop  + 'px' ).css( 'margin-bottom', marginBottom + 'px' );
//                                        });
//                   },
//         setImage : function( p_imgUrl ) {
//                        return this.each(function() {
//                                             $(this).jqmData('infopanel').settings['image'] = p_imgUrl;

//                                             $(this).jqmData( 'infopanel' ).image.attr( 'src', p_imgUrl );
//                                         });
//                    },
//         setUnit : function( p_unit ) {
//                       return this.each(function() {
//                                            $(this).jqmData('infopanel').settings['unit'] = p_unit;

//                                            $(this).jqmData( 'infopanel' ).unitDiv.html( p_unit );
//                                        });
//                   },
//         _sizeFont : function( p_width, p_height ) {
//                         return this.each(function() {
//                                              if( !$(this).is( ':visible' ) ) return;
//                                              if( p_width == 'auto' ) p_width = $(this).width();

//                                              var maximumHeight = p_height - $($(this).jqmData('infopanel').image).outerHeight(true) - 2 * $(this).jqmData('infopanel').settings['border'];
//                                              var maximumWidth = p_width - ($(this).outerWidth(true) - $(this).width()) - 2 * $(this).jqmData('infopanel').settings['border'];

//                                              var fontSize = 40;
//                                              var fontSizeStep = $(this).jqmData( 'infopanel' ).settings['fontSizeStep'];

//                                              // Show the measure-span
//                                              $(this).jqmData( 'infopanel' ).measureSpan.css( 'display', '' );
//                                              // Set initial font-size
//                                              $(this).jqmData( 'infopanel' ).measureSpan.css( 'font-size', fontSize + 'px' );
//                                              // Auto-Size the font to a maximum
//                                              //$(this).jqmData('infopanel').settings['value']
//                                              $(this).jqmData( 'infopanel' ).measureSpan.html( $(this).jqmData('infopanel').settings['value'] );
//                                              while( $(this).jqmData( 'infopanel' ).measureSpan.height() < maximumHeight && $(this).jqmData( 'infopanel' ).measureSpan.width() < maximumWidth ) {
//                                                  fontSize += fontSizeStep;
//                                                  $(this).jqmData( 'infopanel' ).measureSpan.css( 'font-size', fontSize + 'px' );
//                                              }
//                                              fontSize -= fontSizeStep;
//                                              //$(this).jqmData( 'infopanel' ).measureSpan.css( 'font-size', fontSize + 'px' );
//                                              $(this).jqmData( 'infopanel' ).currentValue.css( 'font-size', fontSize + 'px' );
//                                              $(this).jqmData( 'infopanel' ).statsDiv.css( 'font-size', (fontSize / 4).toFixed(0) + 'px' );

//                                              // Hide the measure-span
//                                              $(this).jqmData( 'infopanel' ).measureSpan.css( 'display', 'none' );
//                                          });
//                     }
//     };

//     $.fn.infowidget = function( method ) {
//                 // Method calling logic
//                 if ( methods[method] ) {
//                     return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
//                 } else if ( typeof method === 'object' || ! method ) {
//                     return methods.init.apply( this, arguments );
//                 } else {
//                     $.error( 'Method ' +  method + ' does not exist on jQuery.infowidget' );
//                 }
//             };
// })( jQuery );
