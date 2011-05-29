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

#include "CIwUIComboBox.h"

CIwUIComboBox::CIwUIComboBox() : CIwUIElement() {
	this->SetSize( CIwVec2( 64, 24 ) );
}

void CIwUIComboBox::Activate( bool val ) {
	CIwUIElement::Activate( val );

	if( val ) {
		CIwVec2 totalSize = this->GetSize();
		CIwVec2 textSize( totalSize.x - totalSize.y, totalSize.y );
		CIwVec2 buttonSize( totalSize.y, totalSize.y );

		CIwUIPropertySet *textField_background = (CIwUIPropertySet*) IwGetResManager()->GetResNamed( "<textField_background>", IW_UI_RESTYPE_PROPERTY_SET );
		CIwUIPropertySet *textField_inline = (CIwUIPropertySet*) IwGetResManager()->GetResNamed( "<textField_inline>", IW_UI_RESTYPE_PROPERTY_SET );
		CIwUIPropertySet *button_up = (CIwUIPropertySet*) IwGetResManager()->GetResNamed( "<button_up>", IW_UI_RESTYPE_PROPERTY_SET );

		this->m_textBorder = IwUICreateDrawable( textSize, *textField_background, "image" );
		this->m_text = (CIwUIDrawableText*) IwUICreateDrawable( textSize, *textField_inline, "text" );
		this->m_imageButton = IwUICreateDrawable( buttonSize, *button_up, "image" );
		this->m_imageButton->SetPosition( textSize );
	}
	else {
		this->m_textBorder = NULL;
		this->m_text = NULL;
		this->m_imageButton = NULL;
	}
}

void CIwUIComboBox::Clone( CIwUIElement *pTarget ) const {
	IW_UI_CLONE_SUPERCLASS(pTarget, CIwUIComboBox, CIwUIElement);
}

void CIwUIComboBox::RenderElement( CIwUIGraphics &graphics ) {
	CIwUIElement::RenderElement( graphics );

	this->m_textBorder->Draw( graphics );
	this->m_text->Draw( graphics );
	this->m_imageButton->Draw( graphics );
}

IW_MANAGED_IMPLEMENT_FACTORY(CIwUIComboBox);
