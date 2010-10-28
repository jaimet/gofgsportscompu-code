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

#include "CIwUIAutoSizeLabel.h"

CIwUIAutoSizeLabel::CIwUIAutoSizeLabel() : CIwUILabel() {
	// Initialize our fonts
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_tiny", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_small", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_medium", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_large", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_huge", "CIwGxFont" ) );
}

void CIwUIAutoSizeLabel::SetCaption( const char *pString ) {
	// Check if the strlen of our caption changed
	// NOTE: I'm perfectly aware that this is not a save check for a new string size
	//		 but I want to prevent setting the font-size for each call of SetCaption
	if( strlen( this->GetCaption() ) != strlen( pString ) ) {
		// Now check if the font of the label is in our managed list
		if( this->fontTypes.contains( this->GetFont() ) ) {
			int fontIndex = this->fontTypes.find( this->GetFont() );
		}
	}

	CIwUILabel::SetCaption( pString );
}

CIwGxFont *CIwUIAutoSizeLabel::GetSizedFont( int fontIndex, char *measureString ) {
	// Measure the size of the measure string
	CIwGxFontPreparedData measureData;
	IwGxFontSetFont( this->fontTypes[fontIndex] );
	IwGxFontSetRect( CIwRect( 0, 0, 10000, 10000 ) );
	IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_LEFT );
	IwGxFontPrepareText( measureData, measureString, -1 );

	// Check if size is bigger or smaller than our label
	if( measureData.GetWidth() > this->GetSize().x ) {
		if( fontIndex > 0 ) {
			return this->GetSizedFont( fontIndex - 1, measureString );
		}
		else {
			return this->fontTypes[fontIndex];
		}
	}
	else if( measureData.GetWidth() < this->GetSize().x ) {
	}
}
