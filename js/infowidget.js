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
        .css( 'top', unitDivHeight + 'px' )
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

            // Re-position all infoDivs & calculate smallest font-size
            var divHeight = (this.m_options.size.height / this.m_infoDivs.length).toFixed(0);
            var fontSize = -1;
            for( var i = 0; i < this.m_infoDivs.length; i++ ) {
                this.m_infoDivs[i].css( 'top', (divHeight * i) + 'px' );
                var currFontSize = InfoWidget.applyFontSize( this.m_infoDivs[i], this.m_infoDivs[i].width(), divHeight, this.m_infoDivs[i].jqmData( 'sizeValue' ) );

                if( fontSize < 0 || currFontSize < fontSize ) fontSize = currFontSize;
            }

            // Apply smallest font-size to all info-widgets & center them vertically
            $( this.m_infoDivs ).each( function( index, value ) {
                                          value.css( 'font-size', fontSize + 'px' );
                                          value.css( 'margin-top', ((divHeight - value.height()) / 2.0).toFixed(0) + 'px' );
                                      } );

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

            // Substract last step & apply font-size
            fontSize -= 5;
            p_sizeDiv.css( 'font-size', fontSize + 'px' );

            return fontSize;
        }
