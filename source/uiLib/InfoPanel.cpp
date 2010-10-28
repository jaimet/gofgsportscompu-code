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

#include "InfoPanel.h"

InfoPanel::InfoPanel( char *name, bool p_bNoStatistics ) {
	this->bNoStatistics = p_bNoStatistics;

	if( this->bNoStatistics ) {
		this->uiInfoPanel = CIwUIElement::CreateFromResource("InfoPanel_Small");
		this->maximumLabel = NULL;
		this->averageLabel = NULL;
	}
	else {
		this->uiInfoPanel = CIwUIElement::CreateFromResource("InfoPanel");
		this->maximumLabel = (CIwUILabel *)this->uiInfoPanel->GetChildNamed( "MaximumLabel" );
		this->averageLabel = (CIwUILabel *)this->uiInfoPanel->GetChildNamed( "AverageLabel" );
	}

	// Rename element
	this->uiInfoPanel->SetName( name );

	this->unitLabel = (CIwUILabel *)this->uiInfoPanel->GetChildNamed( "UnitLabel" );
	this->currentLabel = (CIwUILabel *)this->uiInfoPanel->GetChildNamed( "CurrentLabel" );
	this->image = (CIwUIImage *)this->uiInfoPanel->GetChildNamed( "Image" );

	// Initialize statistics vars
	this->maximum = 0.0;
	this->average = 0.0;
	this->numPoints = 0;

	// Check if we have no statistics, if yes remove any unused fields & resize
	/*if( bNoStatistics ) {
		this->SetSize( CIwVec2(120,60) );
		this->SetSizeMin( CIwVec2(120,60) );

		// Remove unused fields
		CIwUILayoutGrid *displayLayout = (CIwUILayoutGrid *)this->GetChildNamed( "Grid_0" )->GetLayout();
		CIwUIElement *element = this->GetChildNamed( "MaximumText" );
		displayLayout->RemoveElement( element );
		delete element;
		IwGetUIView()->RemoveElement( element );
		delete element;

		displayLayout->RemoveElement( this->GetChildNamed( "MaximumLabel" ) );
		displayLayout->RemoveElement( this->GetChildNamed( "AverageText" ) );
		displayLayout->RemoveElement( this->GetChildNamed( "AverageLabel" ) );
	}*/

	//this->SetProperty( "sizeToContent", true );
}

void InfoPanel::setUnit( char *unit ) {
	this->unitLabel->SetCaption( unit );
}

void InfoPanel::setValue( double value ) {
	char valueBuf[10];

	sprintf( valueBuf, "%.2f", value );
	this->currentLabel->SetCaption( valueBuf );

	if( !this->bNoStatistics ) {
		// Check if we have a valid value
		if( value > 0.0 ) {
			// Check if we have a new maximum
			if( value > this->maximum ) {
				this->maximum = value;

				// Update maximum label
				sprintf( valueBuf, "%.2f", this->maximum );
				this->maximumLabel->SetCaption( valueBuf );
			}

			// Calculate new average value
			/*double upAvg = this->average * (double) this->numPoints;
			upAvg = upAvg + value;
			upAvg = upAvg / (double)(++this->numPoints);
			this->average = upAvg;*/
			this->average = this->average * (double) this->numPoints;
			this->average += value;
			this->average = this->average / (double)(++this->numPoints);
			//this->average = (this->average * (double)this->numPoints + value) / (double)(++(this->numPoints));

			// Update average label
			sprintf( valueBuf, "%.2f", this->average );
			this->averageLabel->SetCaption( valueBuf );
		}
	}
}

void InfoPanel::setValue( char *value ) {
	this->currentLabel->SetCaption( value );
}

void InfoPanel::setImage( CIwTexture *texture ) {
	this->image->SetTexture( texture );
}

CIwUIElement *InfoPanel::getInfoPanel() {
	return this->uiInfoPanel;
}

/*CIwGxFont *InfoPanel::GetSizedFont( char *text, int sizeX ) {
	CIwGxFont *currentFont = this->currentLabel->GetFont();
	CIwGxFontPreparedData currentData;

	IwGxFontSetFont( currentFont );
	IwGxFontSetRect( CIwRect( 0, 0, 10000, 10000 ) );
	IwGxFontSetAlignmentHor( IW_GX_FONT_ALIGN_LEFT );
	IwGxFontPrepareText( currentData, text, -1 );

	const char *fontName = currentFont->DebugGetName();
	char *lastFontName = NULL;
	char *newFontName = NULL;

	if( currentData.GetWidth() > this->currentLabel->GetSize().x ) {
		IW_ARRAY_ITERATE(char*,it,this->fontTypes) {
			if( strcmp( fontName, *it ) == 0 ) {
				newFontName = lastFontName;
				break;
			}
			lastFontName = *it;
		}

		if( newFontName != NULL ) {
			this->currentLabel->SetFont( (CIwGxFont *)IwGetResManager()->GetResNamed( newFontName, "CIwGxFont" ) );
		}
	}

	return (CIwGxFont *)IwGetResManager()->GetResNamed( newFontName, "CIwGxFont" );
}
*/
