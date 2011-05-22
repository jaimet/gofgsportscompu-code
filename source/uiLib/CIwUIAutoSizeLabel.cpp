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
	// Disable sizeToContent because else the font auto-sizing wont make any sense...
	this->SetProperty( "sizeToContent", false );

	// Initialize our fonts (Note: these are the standard fonts from iwui)
	// NOTE: Fonts MUST be ordered by size, so smaller ones come first
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_tiny", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_small", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_medium", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_large", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_huge", "CIwGxFont" ) );

	// Initialize our available size
	this->sizeAvailable = 0;
}

void CIwUIAutoSizeLabel::SetCaption( const char *pString ) {
	this->SetFont( this->fontTypes[this->fontTypes.size() - 1] );

	// Now check if the font of the label is in our managed list
	if( this->fontTypes.contains( this->GetFont() ) ) {
		int fontIndex = this->fontTypes.find( this->GetFont() );

		// Re-calculate available size
		CIwSVec2 labelMargin;
		this->GetProperty( "margin", labelMargin );
		this->sizeAvailable = this->GetSize().x - labelMargin.x;

		// Setup IwGxFont API to be ready for our measurements...
		IwGxFontSetRect( CIwRect( 0, 0, 10000, 10000 ) );
		IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_CENTRE );
		// Find & set our fitting font
		this->SetFont( this->GetSizedFont( fontIndex, pString ) );
	}

	CIwUILabel::SetCaption( pString );
}

CIwGxFont *CIwUIAutoSizeLabel::GetSizedFont( int fontIndex, const char *measureString, int lastFontIndex ) {
	// Measure the size of the measure string
	CIwGxFontPreparedData measureData;
	IwGxFontSetFont( this->fontTypes[fontIndex] );
	IwGxFontPrepareText( measureData, measureString );

	// Check if size is bigger or smaller than our label
	if( measureData.GetWidth() > this->sizeAvailable ) {
		// If size is to big, check if we have a smaller one available
		if( fontIndex > 0 ) {
			return this->GetSizedFont( fontIndex - 1, measureString, fontIndex );
		}
		// If not return the current one
		else {
			return this->fontTypes[fontIndex];
		}
	}
	else {
	//else if( measureData.GetWidth() < this->sizeAvailable ) {
		// This check is required to detect if the current font is the first one which is smaller than the one before (which means it the optimal one)
		if( lastFontIndex > fontIndex ) return this->fontTypes[fontIndex];

		// Check if a bigger font is available at all
		if( (uint32)(fontIndex + 1) < this->fontTypes.size() ) {
			return this->GetSizedFont( fontIndex + 1, measureString, fontIndex );
		}
		else {
			return this->fontTypes[fontIndex];
		}
	}

	// If the font should be the exact size of the label, return it
	//return this->fontTypes[fontIndex];
}

void CIwUIAutoSizeLabel::Clone( CIwUIElement *pTarget ) const {
	IW_UI_CLONE_SUPERCLASS(pTarget, CIwUIAutoSizeLabel, CIwUILabel);
}

IW_MANAGED_IMPLEMENT_FACTORY(CIwUIAutoSizeLabel);
