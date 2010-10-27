/*
* Copyright (C) 2010 Wolfgang Koller
* 
* This file is part of GOFG Sports Computer.
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

#include "Screen.h"

Screen::Screen( char *screenName ) {
	this->myScreen = CIwUIElement::CreateFromResource( screenName );
	this->myScreen->SetVisible( false );
}

void Screen::SetVisible( bool p_bVisible, bool p_bNoAnim ) {
	if( p_bVisible ) {
		this->myScreen->SetVisible( true );

		// Only play animation if we should
		if( !p_bNoAnim ) {
			IwGetUIAnimManager()->StopAnim( this->myScreen );
			IwGetUIAnimManager()->PlayAnim("ScreenSlideIn", this->myScreen);
		}
	}
	else {
		// Play Slide-Out animation when we should
		if( !p_bNoAnim ) {
			IwGetUIAnimManager()->StopAnim( this->myScreen );
			uint32 outHandle = IwGetUIAnimManager()->PlayAnim("ScreenSlideOut", this->myScreen);
			IwGetUIAnimManager()->SetObserver( outHandle, this );
		}
		// Else just hide the screen
		else {
			this->myScreen->SetVisible( false );
		}
	}
}

void Screen::NotifyProgress( CIwUIAnimator *pAnimator ) {
}

void Screen::NotifyStopped( CIwUIAnimator *pAnimator ) {
	this->myScreen->SetVisible( false );
}
