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

#include "IwUIDrawableAutoSizeText.h"

CIwUIDrawableAutoSizeText::CIwUIDrawableAutoSizeText(const CIwVec2 &size, const CIwPropertySet &propertySet) {
	this->m_fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_tiny", "CIwGxFont" ) );
	this->m_fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_small", "CIwGxFont" ) );
	this->m_fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_medium", "CIwGxFont" ) );
	this->m_fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_large", "CIwGxFont" ) );
	this->m_fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_huge", "CIwGxFont" ) );
	this->m_fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "verdana_30", "CIwGxFont" ) );

	propertySet.GetProperty( "caption", this->m_caption );

	this->m_rect = CIwUIRect::g_Zero;
	this->m_colour = CIwUIColour( 0, 0, 0 );
	//this->m_caption = CIwPropertyString( "No Caption" );
	this->m_font = NULL;

	this->SetSize( size );
}

void CIwUIDrawableAutoSizeText::Animate( const CIwUIAnimData &animData ) {
}

void CIwUIDrawableAutoSizeText::DebugDraw( CIwUIDebugGraphics &debugGraphics ) const {
}

void CIwUIDrawableAutoSizeText::Draw( CIwUIGraphics &graphics ) const {
	if( this->m_font == NULL ) return;

	graphics.DrawText( this->m_font, this->m_rect.GetPosition(), &this->m_preparedData, this->m_colour, true );
}

CIwUIRect CIwUIDrawableAutoSizeText::GetBounds() const {
	return this->m_rect;
}

CIwColour CIwUIDrawableAutoSizeText::GetColour() const {
	return this->m_colour;
}

CIwVec2 CIwUIDrawableAutoSizeText::GetPosition() const {
	return this->m_rect.GetPosition();
}

CIwVec2 CIwUIDrawableAutoSizeText::GetSize() const {
	return this->m_rect.GetSize();
}

bool CIwUIDrawableAutoSizeText::Intersects( const CIwVec2 &pos ) const {
	return this->m_rect.Intersects( pos );
}

CIwVec2 CIwUIDrawableAutoSizeText::Measure( const CIwVec2 &availableSize ) const {
	return this->GetStringSize( this->m_caption.c_str(), this->m_font );
	//return availableSize;
}

void CIwUIDrawableAutoSizeText::SetColour( const CIwColour &colour ) {
	this->m_colour = colour;
}

void CIwUIDrawableAutoSizeText::SetPosition( const CIwVec2 &pos ) {
	this->m_rect.SetPosition( pos );
}

void CIwUIDrawableAutoSizeText::SetSize( const CIwVec2 &size ) {
	this->m_rect.SetSize( size );

	this->m_font = this->GetSizedFont( this->m_fontTypes.size() - 1, this->m_caption.c_str(), size );

	// Now prepare IwGxData
	IwGxFontSetRect( CIwRect( this->m_rect.x, this->m_rect.y, this->m_rect.w, this->m_rect.h ) );
	IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_CENTRE );
	IwGxFontSetAlignmentVer( IW_GX_FONT_ALIGN_MIDDLE );
	IwGxFontSetFont( this->m_font );
	IwGxFontPrepareText( this->m_preparedData, this->m_caption.c_str() );
}

CIwGxFont *CIwUIDrawableAutoSizeText::GetSizedFont( int fontIndex, const char *measureString, CIwVec2 availableSize, int lastFontIndex ) const {
	// Measure the size of the measure string
	CIwVec2 stringSize = this->GetStringSize( measureString, this->m_fontTypes[fontIndex] );

	// Check if size is bigger or smaller than our label
	if( stringSize.x > availableSize.x || stringSize.y > availableSize.y ) {
		// If size is to big, check if we have a smaller one available
		if( fontIndex > 0 ) {
			return this->GetSizedFont( fontIndex - 1, measureString, availableSize, fontIndex );
		}
		// If not return the current one
		else {
			return this->m_fontTypes[fontIndex];
		}
	}
	else {
	//else if( measureData.GetWidth() < this->sizeAvailable ) {
		// This check is required to detect if the current font is the first one which is smaller than the one before (which means it the optimal one)
		if( lastFontIndex > fontIndex ) return this->m_fontTypes[fontIndex];

		// Check if a bigger font is available at all
		if( (uint32)(fontIndex + 1) < this->m_fontTypes.size() ) {
			return this->GetSizedFont( fontIndex + 1, measureString, availableSize, fontIndex );
		}
		else {
			return this->m_fontTypes[fontIndex];
		}
	}
}

CIwVec2 CIwUIDrawableAutoSizeText::GetStringSize( const char *pString, CIwGxFont *font ) const {
	CIwVec2 stringSize = CIwVec2();

	// Setup IwGxFont API to be ready for our measurements...
	IwGxFontSetRect( CIwRect( 0, 0, 10000, 10000 ) );
	IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_CENTRE );
	CIwGxFontPreparedData measureData;
	IwGxFontSetFont( font );
	IwGxFontPrepareText( measureData, pString );

	stringSize.x = measureData.GetWidth();
	stringSize.y = measureData.GetHeight();

	return stringSize;
}

IWUI_DRAWABLE_FACTORY(CIwUIDrawableAutoSizeText)

/*CIwUIAutoSizeLabel::CIwUIAutoSizeLabel() : CIwUILabel() {
	// Disable sizeToContent because else the font auto-sizing wont make any sense...
	this->SetProperty( "sizeToContent", false );

	// Initialize our fonts (Note: these are the standard fonts from iwui)
	// NOTE: Fonts MUST be ordered by size, so smaller ones come first
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_tiny", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_small", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_medium", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_large", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "font_huge", "CIwGxFont" ) );
	this->fontTypes.append( (CIwGxFont*) IwGetResManager()->GetResNamed( "verdana_30", "CIwGxFont" ) );

	// Initialize our available size
	//this->sizeAvailable = 0;
}

void CIwUIAutoSizeLabel::SetCaption( const char *pString ) {
	this->SetFont( this->fontTypes[this->fontTypes.size() - 1] );

	// Now check if the font of the label is in our managed list
	if( this->fontTypes.contains( this->GetFont() ) ) {
		int fontIndex = this->fontTypes.find( this->GetFont() );

		// Re-calculate available size
		CIwSVec2 labelMargin;
		this->GetProperty( "margin", labelMargin );
		//this->sizeAvailable = this->GetSize().x - labelMargin.x;

		// Setup IwGxFont API to be ready for our measurements...
		IwGxFontSetRect( CIwRect( 0, 0, 10000, 10000 ) );
		IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_CENTRE );
		// Find & set our fitting font
		this->SetFont( this->GetSizedFont( fontIndex, pString, this->GetSize() - labelMargin ) );
	}

	CIwUILabel::SetCaption( pString );
}

CIwGxFont *CIwUIAutoSizeLabel::GetSizedFont( int fontIndex, const char *measureString, CIwVec2 availableSize, int lastFontIndex ) {
	// Measure the size of the measure string
	/*CIwGxFontPreparedData measureData;
	IwGxFontSetFont( this->fontTypes[fontIndex] );
	IwGxFontPrepareText( measureData, measureString );
	CIwVec2 stringSize = this->GetStringSize( measureString, this->fontTypes[fontIndex] );

	// Check if size is bigger or smaller than our label
	if( stringSize.x > availableSize.x || stringSize.y > availableSize.y ) {
		// If size is to big, check if we have a smaller one available
		if( fontIndex > 0 ) {
			return this->GetSizedFont( fontIndex - 1, measureString, availableSize, fontIndex );
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
			return this->GetSizedFont( fontIndex + 1, measureString, availableSize, fontIndex );
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

void CIwUIAutoSizeLabel::OnSizeChanged() {
//	this->SetCaption( this->GetCaption() );
}

CIwVec2 CIwUIAutoSizeLabel::GetStringSize( const char *pString, CIwGxFont *font ) const {
	CIwVec2 stringSize = CIwVec2();

	// Setup IwGxFont API to be ready for our measurements...
	IwGxFontSetRect( CIwRect( 0, 0, 10000, 10000 ) );
	IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_CENTRE );
	CIwGxFontPreparedData measureData;
	IwGxFontSetFont( font );
	IwGxFontPrepareText( measureData, pString );

	stringSize.x = measureData.GetWidth();
	stringSize.y = measureData.GetHeight();

	return stringSize;
}

IW_MANAGED_IMPLEMENT_FACTORY(CIwUIAutoSizeLabel);
*/