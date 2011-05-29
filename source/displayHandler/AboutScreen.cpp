/*
* Copyright (C) 2011 Wolfgang Koller
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

#include "AboutScreen.h"

template<>
AboutScreen *Singleton<AboutScreen>::mySelf = NULL;

void AboutScreen::CB_ASExitButtonClick(CIwUIElement*) {
	this->SetVisible(false);
}

AboutScreen::AboutScreen() : Screen( "AboutScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "AboutScreen", AboutScreen, CB_ASExitButtonClick, CIwUIElement*)

	//int app_version = 0;
	char app_caption[S3E_CONFIG_STRING_MAX];
	s3eConfigGetString( "S3E", "app_version", app_caption );

	std::ostringstream app_name;
	//app_name << app_caption << " " << (( app_version & 0x00FF0000 ) >> 16) << "." << (( app_version & 0x0000FF00 ) >> 8) << "." << ( app_version & 0x000000FF ) << ".";
	app_name << "GOFG Sports Computer " << app_caption;

	((CIwUILabel*) this->myScreen->GetChildNamed( "GOFG_Version" ))->SetCaption( app_name.str().c_str() );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}
