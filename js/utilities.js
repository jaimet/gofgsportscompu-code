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

function Utilities() {}

/**
 * Create a wrapped function for maintaining the original context when calling a callback
 */
Utilities.getEvtHandler = function( p_context, p_callback ) {
    var me = p_context;
    return (function() { p_callback.apply(me, arguments) } );
}

/**
 * Helper function for displaying handy user notifications
 */
Utilities.msgBox = function( p_text, p_title ) {
            console.log( 'Utilities.msgBox is deprecated, use MsgBox.show instead!' );
            MsgBox.show( p_text, p_title );
}
