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

if (pages == undefined) {
    var pages = {};
}

function Page(p_name) {
    // Register page
    pages[p_name] = this;

    // Keep name for later use
    this.name = p_name;

    // Listen for the init & create event
    $('#' + p_name + '-page').live('pageinit', Utilities.getEvtHandler(this, this.init));
    $('#' + p_name + '-page').live('pagecreate', Utilities.getEvtHandler(this, this.create));

    // Listen to windows phone specific custom mouse events (used for simulating incomplete touch input)
    $('#' + p_name + '-page').live('wpmousedown', Utilities.getEvtHandler(this, this.wpmousedown));
    $('#' + p_name + '-page').live('wpmouseup', Utilities.getEvtHandler(this, this.wpmouseup));
    $('#' + p_name + '-page').live('wpmousemove', Utilities.getEvtHandler(this, this.wpmousemove));

    // Listen to gesture events
    $('#' + p_name + '-page').live('swipeleft', Utilities.getEvtHandler(this, this.swipeleft));
    $('#' + p_name + '-page').live('swiperight', Utilities.getEvtHandler(this, this.swiperight));

    // Listen to pagehide event
    $('#' + p_name + '-page').live('pagehide', Utilities.getEvtHandler(this, Page.addHistory, this));
}

Page.prototype.leftPage = null;
Page.prototype.rightPage = null;
Page.prototype.name = "";
Page.prototype.oninit = null;	// Hook for sub-classes to run additional code during init
Page.prototype.oncreate = null;	// Hook for sub-classes to run additional code during create
Page.prototype.m_bInHistory = true;	// Page should be included in history stack

Page.historyStack = [];	// Global history stack
Page.historyChangePage = false;

/**
 * Add a page to the history stack
 * @param p_page Page to add to the history stack
 */
Page.addHistory = function(p_page) {
    if (!Page.historyChangePage && p_page.m_bInHistory) {
        // do not add a page twice to the stack
        if( Page.historyStack[Page.historyStack.length - 1] !== p_page ) {
            Page.historyStack.push(p_page);
        }
    }
};

/**
 * Go back one item in history stack
 */
Page.backInHistory = function() {
    if (Page.historyStack.length > 0) {
        var page = Page.historyStack.pop();

        // Switch back to page in history stack (but prevent from hashing page again)
        Page.historyChangePage = true;
        $.mobile.changePage($('#' + page.name + '-page'));
        Page.historyChangePage = false;
    }
    else {
        if (device.platform.toLowerCase() == "android") {
            // Exit app on android
            var app = cordova.require("cordova/plugin/android/app");
            if (app != null) {
                app.exitApp();
            }
        }
        // Throw exception for windows phone
        else {
            throw "Last history item";
        }
    }
};

/**
 * Automatically called when the page is created
 */
Page.prototype.create = function() {
    // Register for translation
    Translator.register($('#' + this.name + '-page'));

    if (typeof this.oncreate === "function")
        this.oncreate();
};

/**
 * Automatically called when the page is inited
 */
Page.prototype.init = function() {
    // Register for translation
    Translator.register($('#' + this.name + '-page'));

    if (typeof this.oninit === "function")
        this.oninit();
};

/**
 * WP7 event for supporting swipe gestures
 */
Page.prototype.wpmousedown = function(evt) {
    // Check if there is a page
    if (this.leftPage != null || this.rightPage != null) {
        var mouse_evt = $.Event('mousedown', {originalEvent: evt, pageX: evt.clientX, pageY: evt.clientY});
        $('#' + this.name + '-page').trigger(mouse_evt);
    }
};

/**
 * WP7 event for supporting swipe gestures
 */
Page.prototype.wpmouseup = function(evt) {
    // Check if there is a page
    if (this.leftPage != null || this.rightPage != null) {
        var mouse_evt = $.Event('mouseup', {originalEvent: evt, pageX: evt.clientX, pageY: evt.clientY});
        $('#' + this.name + '-page').trigger(mouse_evt);
    }
};

/**
 * WP7 event for supporting swipe gestures
 */
Page.prototype.wpmousemove = function(evt) {
    // Check if there is a page
    if (this.leftPage != null || this.rightPage != null) {
        var mouse_evt = $.Event('mousemove', {originalEvent: evt, pageX: evt.clientX, pageY: evt.clientY});
        $('#' + this.name + '-page').trigger(mouse_evt);
    }
};

/**
 * Called when the user swipes to the left
 */
Page.prototype.swipeleft = function() {
    // No this is not an error, but swiping to the left means making the right side visible
    if (this.rightPage != null) {
        $.mobile.changePage(this.rightPage);
    }
};

/**
 * Called when the user swipes to the right
 */
Page.prototype.swiperight = function() {
    // No this is not an error, but swiping to the right means making the left side visible
    if (this.leftPage != null) {
        $.mobile.changePage(this.leftPage);
    }
};

Page.prototype.getEvtHandler = function(p_callback) {
    var me = this;
    return (function() {
        p_callback.call(me)
    });
};
