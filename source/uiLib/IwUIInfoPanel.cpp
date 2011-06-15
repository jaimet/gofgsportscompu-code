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

#include "IwUIInfoPanel.h"

CIwUIInfoPanel::CIwUIInfoPanel() {
	// Setup main layout
	this->SetLayout( new CIwUILayout() );
	this->GetLayout()->SetSizeToSpace( true );

	// Create our main components
	this->m_Grid = new CIwUIElement();
	this->m_Background = new CIwUIImage();

	// Add main components to our layout
	this->GetLayout()->AddElement( this->m_Background );
	this->GetLayout()->AddElement( this->m_Grid );

	// Set default type
	this->SetType();
}

void CIwUIInfoPanel::SetType( CIwUIInfoPanel_Type type ) {
	this->m_Type = type;

	// Create new base layout
	this->m_LayoutGrid = new CIwUILayoutGrid();
	this->m_Grid->SetLayout( this->m_LayoutGrid );
}

void CIwUIInfoPanel::Clone( CIwUIElement *pTarget ) const {
	IW_UI_CLONE_SUPERCLASS( pTarget, CIwUIInfoPanel, CIwUIElement );
}

IW_MANAGED_IMPLEMENT_FACTORY( CIwUIInfoPanel );