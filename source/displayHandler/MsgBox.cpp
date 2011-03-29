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

#include "MsgBox.h"

template<>
MsgBox *Singleton<MsgBox>::mySelf = NULL;

void MsgBox::MSGBOX_QuitButtonClick(CIwUIElement*) {
	this->SetVisible( false, true );
}

MsgBox::MsgBox() : Screen( "MsgBox" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "MsgBox", MsgBox, MSGBOX_QuitButtonClick, CIwUIElement*)

	IwGetUIView()->AddElementToLayout( this->myScreen );

	// Get reference to own alert dialog
	this->alertDialog = (CIwUIAlertDialog*) this->myScreen->GetChildNamed( "alert_dialog" );
}

MsgBox::~MsgBox() {
//	delete this->alertDialog;
}

void MsgBox::Show( std::string text ) {
	MsgBox::Self()->alertDialog->SetLabelCaption( text.c_str() );
	MsgBox::Self()->SetVisible( true, true );
}
