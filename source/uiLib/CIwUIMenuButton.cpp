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

/*#include "CIwUIMenuButton.h"

CIwUIMenuButton::CIwUIMenuButton() : CIwUIButton() {
	std::ostringstream startupName;
	startupName << "MenuButton_" << IwRand();

	CIwUIButton *templateButton = (CIwUIButton*) CIwUIElement::CreateFromResource( "MenuButton" );

	while( templateButton->GetNumChildren() > 0 ) {
	//for( int i = 0; i < templateButton->GetNumChildren(); i++ ) {
		CIwUIElement *childElement = templateButton->GetChild(0);
		templateButton->RemoveChild(childElement);
		this->AddChild( childElement );
	}

	//this->AddChild( CIwUIElement::CreateFromResource( "MenuButton" ) );

	// Get image & label for this menubutton
	this->ButtonIcon = (CIwUIImage*) this->GetChildNamed( "MB_ButtonIcon" );
	this->ButtonLabel = (CIwUILabel*) this->GetChildNamed( "MB_ButtonLabel" );

	// Finally rename our childs
	this->RenameChildren( startupName.str(), this );
}

void CIwUIMenuButton::SetCaption( const char *pString ) {
	this->ButtonLabel->SetCaption( pString );
}

void CIwUIMenuButton::SetTexture( CIwTexture *pTexture ) {
	this->ButtonIcon->SetTexture( pTexture );
}

void CIwUIMenuButton::Clone( CIwUIElement *pTarget ) const {
	IW_UI_CLONE_SUPERCLASS(pTarget, CIwUIMenuButton, CIwUIButton);
}

void CIwUIMenuButton::OnPropertyChanged( uint32 hashName ) {
	CIwUIButton::OnPropertyChanged( hashName );

	CIwPropertyString propertyString;
	//CIwPropertyString propertyTexture;

	if( this->GetProperty( "caption", propertyString ) ) {
		this->ButtonLabel->SetCaption( propertyString.c_str() );
	}
	if( this->GetProperty( "texture", propertyString ) ) {
		this->ButtonIcon->SetTexture( (CIwTexture*)IwGetResManager()->GetResNamed( propertyString.c_str(), IW_GX_RESTYPE_TEXTURE ) );
	}
	if( this->GetProperty( "name", propertyString ) ) {
		this->RenameChildren( propertyString.c_str(), this );
	}
}

void CIwUIMenuButton::RenameChildren( std::string baseName, CIwUIElement *pParent ) {
	std::ostringstream childName;

	for( int i = 0; i < pParent->GetNumChildren(); i++ ) {
		// Build new child name
		childName.clear();
		childName << baseName << "_" << i;

		// Rename the child
		pParent->GetChild(i)->SetName( childName.str().c_str() );

		// Rename all children below this child
		this->RenameChildren(childName.str(), pParent->GetChild(i) );
	}

}

IW_MANAGED_IMPLEMENT_FACTORY(CIwUIMenuButton);
*/