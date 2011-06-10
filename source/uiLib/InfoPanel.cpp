/*
* Copyright (C) 2010-2011 Wolfgang Koller
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

InfoPanel::InfoPanel( const char *name, bool p_bNoStatistics ) {
	this->bNoStatistics = p_bNoStatistics;

	if( this->bNoStatistics ) {
		this->uiInfoPanel = CIwUIElement::CreateFromResource("InfoPanel_Small");
		this->maximumLabel = NULL;
		this->averageLabel = NULL;

		this->topSpacer = new CIwUILayoutSpacer();
		((CIwUILayoutGrid*) this->uiInfoPanel->GetChildNamed( "CurrentLayout" )->GetLayout())->AddLayoutItem( this->topSpacer, 0, 0 );
		this->topSpacer->SetMin( CIwVec2( 0, 0 ) );
		this->topSpacer->SetMax( CIwVec2( 0, 0 ) );
	}
	else {
		this->uiInfoPanel = CIwUIElement::CreateFromResource("InfoPanel");
		this->maximumLabel = (CIwUILabel*) this->uiInfoPanel->GetChildNamed( "MaximumLabel" );
		this->averageLabel = (CIwUILabel*) this->uiInfoPanel->GetChildNamed( "AverageLabel" );

		this->topSpacer = NULL;
	}

	// Rename element
	this->uiInfoPanel->SetName( name );

	this->unitLabel = (CIwUILabel*) this->uiInfoPanel->GetChildNamed( "UnitLabel" );
	this->currentLabel = (CIwUILabel*) this->uiInfoPanel->GetChildNamed( "CurrentLabel" );
	this->image = (CIwUIImage*) this->uiInfoPanel->GetChildNamed( "Image" );
	this->currentImage = (CIwUIImage*) this->uiInfoPanel->GetChildNamed( "CurrentImage" );

	// Initialize statistics vars
	this->Reset();

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

InfoPanel::~InfoPanel() {
	/*delete this->uiInfoPanel;

	delete this->unitLabel;
	delete this->currentLabel;
	delete this->averageLabel;
	delete this->maximumLabel;

	delete this->image;
	delete this->currentImage;*/
}

void InfoPanel::Reset() {
	this->maximum = 0.0;
	this->average = 0.0;
	this->numPoints = 0;

	this->currentLabel->SetCaption( "0.0" );
	if( this->maximumLabel != NULL ) this->maximumLabel->SetCaption( "0.00" );
	if( this->averageLabel != NULL ) this->averageLabel->SetCaption( "0.00" );
}

void InfoPanel::setUnit( const char *unit ) {
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

void InfoPanel::setValue( const char *value ) {
	this->currentLabel->SetCaption( value );
}

void InfoPanel::setValue( CIwTexture *valueTexture ) {
	if( !this->currentImage->IsVisible() ) {
		this->currentImage->SetVisible( true );
		this->currentLabel->SetVisible( false );

		//this->currentImage->SetSize( CIwVec2( valueTexture->GetWidth(), valueTexture->GetHeight() ) );
		//this->currentImage->SetSizeMin( CIwVec2( valueTexture->GetWidth(), valueTexture->GetHeight() ) );
		this->currentImage->SetSizeMax( CIwVec2( valueTexture->GetWidth(), valueTexture->GetHeight() ) );
		this->currentImage->SetSizeHint( CIwVec2( valueTexture->GetWidth(), valueTexture->GetHeight() ) );
	}

	this->currentImage->SetTexture( valueTexture );
}

void InfoPanel::setValue( std::string value ) {
	this->currentLabel->SetCaption( value.c_str() );
}

void InfoPanel::setAverage( double value ) {
	std::ostringstream averageString;

	// Format the value
	averageString.precision(2);
	averageString << value;

	this->averageLabel->SetCaption( averageString.str().c_str() );
}

void InfoPanel::setImage( CIwTexture *texture ) {
	this->image->SetTexture( texture );
}

// Set the layout for the infopanel (tiny / small)
void InfoPanel::SetLayout( InfoPanelLayout layout ) {
	if( this->topSpacer != NULL ) {
		switch( layout ) {
		case INFOPANEL_LAYOUT_TINY:
			this->topSpacer->SetMax( CIwVec2( 0, 16 ) );
			this->topSpacer->SetMin( CIwVec2( 0, 16 ) );
			this->uiInfoPanel->SetSizeHint( CIwVec2( 120, 60 ) );
			break;
		case INFOPANEL_LAYOUT_SMALL:
		default:
			this->topSpacer->SetMax( CIwVec2::g_Zero );
			this->topSpacer->SetMin( CIwVec2::g_Zero );
			this->uiInfoPanel->SetSizeHint( CIwVec2( 120, 120 ) );
			break;
		}
	}
}

CIwUIElement *InfoPanel::getInfoPanel() {
	return this->uiInfoPanel;
}

void InfoPanel::Detach() {
	CIwUIElement *parent = this->uiInfoPanel->GetParent();
	if( parent != NULL ) {
		parent->RemoveChild( this->uiInfoPanel );
	}

	// Reset back to default layout
	this->SetLayout();
}

// Should be called when the infopanel should be forced to re-update all information to the UI
void InfoPanel::Update() {
	if( !this->currentImage->IsVisible() ) {
		this->currentLabel->SetCaption( this->currentLabel->GetCaption() );
	}
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
