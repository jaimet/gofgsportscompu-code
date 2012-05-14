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

// Constructor for InfoWidget object
function InfoWidget( p_targetDiv, p_options ) {
    this.m_options = {};
    this.m_infoDivs = [];

    // Save options
    $.extend( this.m_options, InfoWidget.defaultOptions, p_options );

    // Check for size value
    if( this.m_options.sizeValue === null ) this.m_options.sizeValue = this.m_options.value;

    // Construct global measurement-div (if necessary)
    if( InfoWidget.measurementSpan === null ) {
        InfoWidget.measurementSpan = $( '<span>' );
        $('body').append( InfoWidget.measurementSpan );
    }

    // Fetch target div & apply standard CSS
    this.m_targetDiv = $( '#' + p_targetDiv );
    this.m_targetDiv.css( 'position', 'relative' ).addClass( 'ui-bar-c' );

    // Check for auto-width
    if( this.m_options.size.width === 'auto' ) this.m_options.size.width = this.m_targetDiv.width();

    // Adjust size values
    this.m_classBorder = parseInt(this.m_targetDiv.outerHeight( true ) - this.m_targetDiv.height());
    this.m_options.size.width -= this.m_classBorder;
    this.m_options.size.height -= this.m_classBorder;

    // Apply basic layout
    this.m_targetDiv.height( this.m_options.size.height + 'px' );

    // Create all the internal display divs
    this.m_unitDiv = $( '<div>' );
    this.m_valueDiv = $( '<div>' );

    // .. end append them to the target
    this.m_targetDiv.append( this.m_unitDiv ).append( this.m_valueDiv );

    // Calculate sizes for internal display divs
    var unitDivWidth = this.m_options.size.width;
    var unitDivHeight = (this.m_options.size.height * 0.25).toFixed(0);
    var valueDivWidth = this.m_options.size.width;
    var valueDivHeight = this.m_options.size.height;

    // Check if we need additional space for additional components
    if( this.m_options.showIndicator || this.m_options.showSubInfos ) {
        unitDivWidth = (this.m_options.size.width * 0.25).toFixed(0);
        valueDivWidth = (this.m_options.size.width * 0.5).toFixed(0);
        valueDivHeight = (this.m_options.size.height * 0.75).toFixed(0);
    }

    // Check if indicators should be shown
    if( this.m_options.showIndicator ) {
        // Create indicator components
        this.m_indicatorDiv = $( '<div>' ).appendTo( this.m_targetDiv );
        this.m_indicatorUp = $( '<span>&uarr;</span>' );
        this.m_indicatorDown = $( '<span>&darr;</span>' );
        // Fill indicator div
        this.m_indicatorDiv.css( 'position', 'absolute' )
        .css( 'top', this.m_unitDiv.height() + 'px' )
        .css( 'left', '0px' )
        .css( 'width', unitDivWidth )
        .css( 'text-align', 'center' )
        .append( this.m_indicatorUp )
        .append( $('<br/>&bull;<br/>') )
        .append( this.m_indicatorDown );
        // Calculate font size
        InfoWidget.applyFontSize( this.m_indicatorDiv, unitDivWidth, this.m_options.size.height - unitDivHeight );

        // Initial indicator-arrow setup
        this.m_indicatorUp.hide();
        this.m_indicatorDown.hide();
    }

    // Apply sizes to divs
    this.m_unitDiv.css( 'position', 'absolute' )
    .css( 'top', '0px' )
    .css( 'left', '5px' )
    .css( 'width', unitDivWidth )
    .css( 'text-align', 'left' )
    .html( this.m_options.unit );
    // Calculate font size
    InfoWidget.applyFontSize( this.m_unitDiv, unitDivWidth, unitDivHeight );

    this.m_valueDiv.css( 'position', 'absolute' )
    .css( 'top', '0px' )
    .css( 'left', ((this.m_options.size.width - valueDivWidth) / 2).toFixed(0) + 'px' )
    .css( 'width', valueDivWidth )
    .css( 'text-align', 'center' )
    .html( this.m_options.value );
    // Calculate font size
    InfoWidget.applyFontSize( this.m_valueDiv, valueDivWidth, valueDivHeight, this.m_options.sizeValue );
    // Vertically center the text
    this.m_valueDiv.css( 'margin-top', ((this.m_options.size.height - this.m_valueDiv.height()) / 2).toFixed(0) + 'px' );
}

// Defining the default options for an InfoWidget
InfoWidget.defaultOptions = {
    unit: 'noUnit',
    value: 'noValue',
    showIndicator: false,
    showSubInfos: false,
    sizeValue: null,
    size : { width : 'auto', height : 120 }
};

// Helper-Span used for auto-sizing the font
InfoWidget.measurementSpan = null;

// Define InfoWidget properties
InfoWidget.prototype.m_options = null;
InfoWidget.prototype.m_targetDiv = null;
InfoWidget.prototype.m_unitDiv = null;
InfoWidget.prototype.m_valueDiv = null;
InfoWidget.prototype.m_indicatorDiv = null;
InfoWidget.prototype.m_indicatorUp = null;
InfoWidget.prototype.m_indicatorDown = null;
InfoWidget.prototype.m_infoDivs = null;
InfoWidget.prototype.m_classBorder = 0;

/**
 * Add a new sub-info to the InfoWidget
 */
InfoWidget.prototype.addSubInfo = function( p_value, p_sizeValue ) {
            if( typeof p_sizeValue === "undefined" ) p_sizeValue = p_value;

            var infoDiv = $( '<div>' );
            infoDiv.css( 'position', 'absolute' )
            .css( 'right', '0px'  )
            .css( 'width', (this.m_options.size.width * 0.20).toFixed(0) + 'px' )
            .html( p_value )
            .jqmData( 'sizeValue', p_sizeValue );

            // Append to target & save in internal memory
            this.m_targetDiv.append(infoDiv);
            this.m_infoDivs.push( infoDiv );

            // Re-position all infoDivs
            var divHeight = (this.m_options.size.height / this.m_infoDivs.length).toFixed(0);
            for( var i = 0; i < this.m_infoDivs.length; i++ ) {
                this.m_infoDivs[i].css( 'top', (divHeight * i) + 'px' );
                InfoWidget.applyFontSize( this.m_infoDivs[i], this.m_infoDivs[i].width(), divHeight, this.m_infoDivs[i].jqmData( 'sizeValue' ) );
            }

            return this.m_infoDivs.length;
        }

/**
 * Update value shown in a sub-info field
 */
InfoWidget.prototype.setSubInfo = function( p_index, p_value ) {
            if( p_index >= this.m_infoDivs.length ) return;

            this.m_infoDivs[p_index].html( p_value );
        }

/**
 * Update display of indicator arrows
 */
InfoWidget.prototype.setIndicator = function( p_up, p_down ) {
            // Widget was not set up for indicators
            if( this.m_indicatorUp === null ) return;

            // Update indicator display
            if( p_up ) {
                this.m_indicatorUp.show();
            }
            else {
                this.m_indicatorUp.hide();
            }
            // Update indicator display
            if( p_down ) {
                this.m_indicatorDown.show();
            }
            else {
                this.m_indicatorDown.hide();
            }
        }

/**
 * Update display value
 */
InfoWidget.prototype.setValue = function( p_value ) {
            this.m_valueDiv.html( p_value );
        }

/**
 * Update unit value
 */
InfoWidget.prototype.setUnit = function( p_unit ) {
            this.m_unitDiv.html( p_unit );
        }

/**
 * Calculate the font-size for a given container and maximum size
 */
InfoWidget.applyFontSize = function( p_sizeDiv, p_maxWidth, p_maxHeight, p_sizeString ) {
            // Make sure we have the correct parameter types
            p_maxWidth = parseInt(p_maxWidth);
            p_maxHeight = parseInt(p_maxHeight);
            // Size-String is optional
            if( typeof p_sizeString === "undefined" ) p_sizeString = p_sizeDiv.html();

            var fontSize = 10;
            InfoWidget.measurementSpan.css( 'font-size', fontSize + 'px' )
            .css( 'font-family', p_sizeDiv.css( 'font-family' ) )
            .css( 'font-weight', p_sizeDiv.css( 'font-weight' ) )
            .html( p_sizeString );

            // Size the font until we reach the limit
            while( InfoWidget.measurementSpan.width() < p_maxWidth && InfoWidget.measurementSpan.height() < p_maxHeight ) {
                fontSize += 5;

                InfoWidget.measurementSpan.css( 'font-size', fontSize + 'px' );
            }

            fontSize -= 5;
            p_sizeDiv.css( 'font-size', fontSize + 'px' );
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
