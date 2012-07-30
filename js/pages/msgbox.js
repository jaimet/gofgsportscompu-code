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

function MsgBox() {
}

MsgBox.prototype = new Page( "msgbox" );
MsgBox.prototype.m_title = '';
MsgBox.prototype.m_text = '';
MsgBox.prototype.m_buttons = '';
MsgBox.prototype.m_prevPage = null;
MsgBox.prototype.m_closeCallback = null;
MsgBox.prototype.m_bInHistory = false;
MsgBox.BUTTON_OK = 0x01;
MsgBox.BUTTON_CANCEL = 0x02;
MsgBox.BUTTON_YES = 0x04;
MsgBox.BUTTON_NO = 0x08;
MsgBox.BUTTON_CONTINUE = 0x10;
MsgBox.BUTTON_ALWAYS = 0x20;

/**
 * Called when the page is inited
 */
MsgBox.prototype.oninit = function() {
            // Page events
            $( '#msgbox-page' ).bind( 'pagebeforeshow', pages.msgbox.onpagebeforeshow );

            // Button events
            $( 'a[name="msgbox-button"]' ).each(function() {
                                                    $(this).bind( 'click', parseInt($(this).attr('id').split('-')[2]), Utilities.getEvtHandler(pages.msgbox, pages.msgbox._close) )
                                                } );
        }

/**
 * Function for showing the actual messagebox
 */
MsgBox.show = function( p_text, p_title, p_buttons, p_closeCallback ) {
            // Check if msgbox is already visible
            if( pages.msgbox.m_prevPage !== null ) return;

            pages.msgbox.m_prevPage = $.mobile.activePage;

            pages.msgbox.m_text = p_text;
            pages.msgbox.m_title = p_title || "";
            pages.msgbox.m_buttons = p_buttons || MsgBox.BUTTON_OK;
            pages.msgbox.m_closeCallback = p_closeCallback || null;

            $.mobile.changePage( 'msgbox.html', { role: 'dialog', transition: 'none' } );
        }

/**
 * Display confirm messagebox
 */
MsgBox.confirm = function( p_text, p_closeCallback ) {
            MsgBox.show( p_text, 'Confirm', MsgBox.BUTTON_YES | MsgBox.BUTTON_NO, p_closeCallback );
        }

/**
 * Display confirm messagebox
 */
MsgBox.confirmAlways = function( p_text, p_closeCallback ) {
            MsgBox.show( p_text, 'Confirm', MsgBox.BUTTON_YES | MsgBox.BUTTON_NO | MsgBox.BUTTON_ALWAYS, p_closeCallback );
        }

/**
 * Display error messagebox
 */
MsgBox.error = function( p_text, p_closeCallback ) {
            MsgBox.show( p_text, 'Error', MsgBox.BUTTON_OK, p_closeCallback );
        }

/**
 * Called right before the page is shown
 */
MsgBox.prototype.onpagebeforeshow = function( prevPage ) {
            $( '#msgbox-title' ).html( pages.msgbox.m_title );
            $( '#msgbox-text' ).html( pages.msgbox.m_text );

            // Hide all buttons by default
            $( 'a[name="msgbox-button"]' ).hide();

            // Show enabled buttons
            var mask = 0x1;
            while( mask <= 0x1000 ) {
                if( pages.msgbox.m_buttons & mask ) {
                    $('#msgbox-button-' + parseInt(mask) ).show();
                }
                mask = mask << 1;
            }
        }

/**
 * Called when the ok or cancel button is clicked
 */
MsgBox.prototype._close = function( evt ) {
            $.mobile.changePage( pages.msgbox.m_prevPage );
            pages.msgbox.m_prevPage = null;
            if( typeof pages.msgbox.m_closeCallback === "function" ) pages.msgbox.m_closeCallback(evt.data);
        }

new MsgBox();
