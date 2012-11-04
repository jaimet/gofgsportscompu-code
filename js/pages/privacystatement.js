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

function PrivacyStatement() {	
}
PrivacyStatement.prototype = new Page( "privacystatement" );
PrivacyStatement.prototype.m_bInHistory = false;

PrivacyStatement.prototype.oninit = function() {
	$('#privacystatement-page').find('#privacystatement-page_close').bind('click', function() { $.mobile.changePage( 'settings.html' ); return false; } );
}

new PrivacyStatement();
