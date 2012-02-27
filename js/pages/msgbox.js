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
MsgBox.BUTTON_OK = 0x01;
MsgBox.BUTTON_CANCEL = 0x02;
MsgBox.BUTTON_YES = 0x04;
MsgBox.BUTTON_NO = 0x08;
MsgBox.BUTTON_CONTINUE = 0x10;

/**
 * Called when the page is inited
 */
MsgBox.prototype.oninit = function() {
            // Page events
            $( '#msgbox-page' ).bind( 'pagebeforeshow', pages.msgbox.onpagebeforeshow );

            // Button events
            $( 'a[name="msgbox-button"]' ).bind( 'tap', pages.msgbox._close );
}

/**
 * Function for showing the actual messagebox
 */
MsgBox.show = function( p_text, p_title, p_buttons ) {
            pages.msgbox.m_prevPage = $.mobile.activePage;

            pages.msgbox.m_text = p_text;
            pages.msgbox.m_title = p_title || "Info";
            pages.msgbox.m_buttons = p_buttons || MsgBox.BUTTON_OK;

            $.mobile.changePage( 'msgbox.html', { role: 'dialog' } );
}

/**
 * Called right before the page is shown
 */
MsgBox.prototype.onpagebeforeshow = function( prevPage ) {
            $( '#msgbox-title' ).html( pages.msgbox.m_title );
            $( '#msgbox-text' ).html( pages.msgbox.m_text );

            // Hide all buttons by default
            $( 'a[name="msgbox-button"]' ).hide();

            if( pages.msgbox.m_buttons & MsgBox.BUTTON_OK ) {
                $('#msgbox-ok-button').show();
            }
}

/**
 * Called when the ok or cancel button is clicked
 */
MsgBox.prototype._close = function() {
            $.mobile.changePage( pages.msgbox.m_prevPage );
}

new MsgBox();
