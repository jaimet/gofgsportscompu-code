/*
 * InfoPanel.cpp
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */

#include "InfoPanel.h"

InfoPanel::InfoPanel( char *unit, int x, int y, int width, int height, Widget *parent, bool bStats ) : Layout ( x, y, width, height, parent ) {
	this->setNumRows( 4 );
	this->setNumColumns( 1 );
	this->setPaddingTop( 1 );
	this->setPaddingRight( 1 );
	this->setPaddingBottom( 1 );
	this->setPaddingLeft( 1 );

	// Add the title row first
	Layout *titleLayout = new Layout( 0, 0, this->getWidth(), 24, this );
	titleLayout->setNumRows( 1 );
	titleLayout->setNumColumns( 2 );
	// Image for the title
	this->titleImage = new Image( 0, 0, titleLayout->getHeight(), titleLayout->getHeight(), titleLayout );
	//this->titleImage->setResource( IMAGE_HR24 );
	this->titleImage->setBackgroundColor( 0xFFFFFF );
	this->titleImage->setDrawBackground(true);
	// Label for the title
	this->unitLabel = new Label( 0, 0, titleLayout->getWidth() - titleImage->getWidth(), titleLayout->getHeight(), titleLayout, unit, 0xFFFFFF, new Font(FONT_VERA18) );
	this->unitLabel->setHorizontalAlignment( Label::HA_CENTER );
	this->unitLabel->setVerticalAlignment( Label::VA_CENTER );

	// Add the current label
	this->currentLabel = new Label( 0, 0, this->getWidth(), this->getHeight() - titleLayout->getHeight(), this, "0", 0xFFFFFF, new Font(FONT_VERA36B) );
	this->currentLabel->setHorizontalAlignment( Label::HA_CENTER );
	this->currentLabel->setVerticalAlignment( Label::VA_CENTER );

	// Check if we have to display statistics
	if( bStats ) {
		// Add layout for maximum value display
		Layout *maxValLayout = new Layout( 0, 0, this->getWidth(), 20, this );
		maxValLayout->setNumRows( 1 );
		maxValLayout->setNumColumns( 2 );
		// Add label for maximum value
		Label *maxValLabel = new Label( 0, 0, maxValLayout->getWidth() / 2, maxValLayout->getHeight(), maxValLayout, "Max", 0xFFFFFF, new Font(FONT_VERA14) );
		// Add maximum value label
		this->maxVal = new Label( 0, 0, maxValLayout->getWidth() / 2, maxValLayout->getHeight(), maxValLayout, "0", 0xFFFFFF, new Font(FONT_VERA14) );

		// Add layout for average value display
		Layout *avgValLayout = new Layout( 0, 0, this->getWidth(), 20, this );
		avgValLayout->setNumRows( 1 );
		avgValLayout->setNumColumns( 2 );
		// Add label for average value
		Label *avgValLabel = new Label( 0, 0, avgValLayout->getWidth() / 2, avgValLayout->getHeight(), avgValLayout, "Avg", 0xFFFFFF, new Font(FONT_VERA14) );
		// Add average value label
		this->avgVal = new Label( 0, 0, avgValLayout->getWidth() / 2, avgValLayout->getHeight(), avgValLayout, "0", 0xFFFFFF, new Font(FONT_VERA14) );

		// Resize current label to give space for statistic displaying
		this->currentLabel->setHeight( this->getHeight() - titleLayout->getHeight() - maxValLayout->getHeight() - avgValLayout->getHeight() );
	}
	else {
		this->maxVal = NULL;
		this->avgVal = NULL;
	}

	// Initialize statistics variables
	this->maximum = 0.0;
	this->average = 0.0;
	this->numPoints = 0;
	this->bStatistics = bStats;

	//titleLabel->setCaption( "Test" );
	//titleLabel->setBackgroundColor( 0xFFFFFF );

	//titleLayout->add(titleLabel);

	//this->add(titleLayout);
}

void InfoPanel::setImage( MAHandle image ) {
	this->titleImage->setResource( image );
}

void InfoPanel::setValue( char *newValue ) {
	this->currentLabel->setCaption( newValue );
}

void InfoPanel::setValue( int newValue ) {
	this->doSetValue( newValue, "%.0f" );
}

void InfoPanel::setValue( double newValue ) {
	this->doSetValue( newValue );
}

void InfoPanel::doSetValue( double newValue, char *formatString ) {
	char *strBuf = new char[10];

	if( this->bStatistics ) {
		// Check if this is a new maximum value
		if( newValue > this->maximum ) {
			this->maximum = newValue;

			// Display new maximum value
			sprintf( strBuf, formatString, this->maximum );
			this->maxVal->setCaption( strBuf );
		}

		// Calculate new average
		this->average = ( this->average * this->numPoints + newValue ) / ++this->numPoints;

		// Display new average value
		sprintf( strBuf, "%.1f", this->average );
		this->avgVal->setCaption( strBuf );
	}

	// Display new current value
	sprintf( strBuf, formatString, newValue );
	this->currentLabel->setCaption( strBuf );

	// Free up memory
	delete strBuf;
}

