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

#include "MenuScreen.h"

template<>
MenuScreen *Singleton<MenuScreen>::mySelf = NULL;

void MenuScreen::CB_MSTracksButtonClick(CIwUIElement*) {
	//ExportScreen::Self()->GetScreen()->SetVisible(true);
	ExportScreen::Self()->SetVisible(true);

	//this->SetVisible( false );
}

void MenuScreen::CB_MSCloseButtonClick(CIwUIElement*) {
	//this->myScreen->SetVisible(false);
	//MainScreen::Self()->SetVisible( true );

	this->SetVisible(false);
}

void MenuScreen::CB_MSAboutButtonClick(CIwUIElement*) {
	AboutScreen::Self()->SetVisible(true);
}

/*void MenuScreen::SetVisible( bool p_bVisible ) {
	Screen::SetVisible( p_bVisible );

	if( p_bVisible ) {

		//IwGetUIAnimManager()->PlayAnim("MenuSlideIn", this->tracksButton);
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		IwGetUIAnimManager()->PlayAnim("MenuSlideIn", this->myScreen);
	}
	else {
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		IwGetUIAnimManager()->PlayAnim("MenuSlideOut", this->myScreen);
	}
}*/


MenuScreen::MenuScreen() : Screen( "MenuScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "MenuScreen", MenuScreen, CB_MSTracksButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MenuScreen", MenuScreen, CB_MSCloseButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MenuScreen", MenuScreen, CB_MSAboutButtonClick, CIwUIElement*)

	this->SetAnimation( "MenuSlideIn", "MenuSlideOut" );

	//this->myScreen = CIwUIElement::CreateFromResource( "MenuScreen" );

	//this->tracksButton = this->myScreen->GetChildNamed( "TracksButton" );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}
