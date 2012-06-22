/*
 * Copyright (C) 2011-2012 Wolfgang Koller
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

if( pages == undefined ) {
	var pages = {};
}

function Page( p_name ) {
	// Register page
	pages[p_name] = this;
	
	// Keep name for later use
	this.name = p_name;
	
    // Listen for the init & create event
    $( '#' + p_name + '-page' ).live( 'pageinit', this.getEvtHandler(this.init) );
    $( '#' + p_name + '-page' ).live( 'pagecreate', this.getEvtHandler(this.create) );

	// Listen to windows phone specific custom mouse events (used for simulating incomplete touch input)
	$( '#' + p_name + '-page' ).live( 'wpmousedown', Utilities.getEvtHandler(this, this.wpmousedown) );
	$( '#' + p_name + '-page' ).live( 'wpmouseup', Utilities.getEvtHandler(this, this.wpmouseup) );
	$( '#' + p_name + '-page' ).live( 'wpmousemove', Utilities.getEvtHandler(this, this.wpmousemove) );

	// Listen to gesture events
	$( '#' + p_name + '-page' ).live( 'swipeleft', this.getEvtHandler(this.swipeleft) );
	$( '#' + p_name + '-page' ).live( 'swiperight', this.getEvtHandler(this.swiperight) );
}

Page.prototype.leftPage = null;
Page.prototype.rightPage = null;
Page.prototype.name = "";
Page.prototype.oninit = null;	// Hook for sub-classes to run additional code during init

/**
 * Automatically called when the page is created
 */
Page.prototype.create = function() {
    // Register for translation
    Translator.register( $('#' + this.name + '-page') );
}

/**
 * Automatically called when the page is inited
 */
Page.prototype.init = function() {
	// Register for translation
	Translator.register( $('#' + this.name + '-page') );
	
    if( typeof this.oninit === "function" ) this.oninit();
}

Page.prototype.wpmousedown = function(evt) {
	console.log( 'wpmousedown' );

	// Check if there is a page
	if( this.leftPage != null || this.rightPage != null ) {
		console.log( 'triggering mousedown' );

		var mouse_evt = $.Event('mousedown', evt);
		$( '#' + this.name + '-page' ).trigger( mouse_evt );
	}
}

Page.prototype.wpmouseup = function(evt) {
	console.log( 'wpmouseup' );
	// Check if there is a page
	if( this.leftPage != null || this.rightPage != null ) {
		console.log( 'triggering mouseup' );
		var mouse_evt = $.Event('mouseup', evt);
		$( '#' + this.name + '-page' ).trigger( mouse_evt );
	}
}

Page.prototype.wpmousemove = function(evt) {
	console.log( 'wpmousemove' );
	// Check if there is a page
	if( this.leftPage != null || this.rightPage != null ) {
		console.log( 'triggering mousemove' );
		var mouse_evt = $.Event('mousemove', evt);
		$( '#' + this.name + '-page' ).trigger( mouse_evt );
	}
}

/**
 * Called when the user swipes to the left
 */
Page.prototype.swipeleft = function() {
	// No this is not an error, but swiping to the left means making the right side visible
	if( this.rightPage != null ) {
		$.mobile.changePage( this.rightPage );
	}
}

/**
 * Called when the user swipes to the right
 */
Page.prototype.swiperight = function() {
	// No this is not an error, but swiping to the right means making the left side visible
	if( this.leftPage != null ) {
		$.mobile.changePage( this.leftPage );
	}
}

Page.prototype.getEvtHandler = function( p_callback ) {
	var me = this;
	return (function() { p_callback.call(me) } );
}
