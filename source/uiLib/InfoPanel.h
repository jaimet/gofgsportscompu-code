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

#ifndef INFOPANEL
#define INFOPANEL

#include <string>
#include <iostream>
#include <sstream>

#include "IwUI.h"

#include <IwUIElement.h>
#include <IwUILabel.h>
#include <IwUILayoutGrid.h>
#include <IwUILayoutSpacer.h>

#include "CIwUIAutoSizeLabel.h"

enum InfoPanelLayout {
	INFOPANEL_LAYOUT_TINY,
	INFOPANEL_LAYOUT_SMALL
};

class InfoPanel {
public:
	InfoPanel( const char *name, bool bNoStatistics = false );
	~InfoPanel();
	void Reset();

	void setUnit( const char *unit );
	void setValue( double value );
	void setValue( const char *value );
	void setValue( CIwTexture *valueTexture );
	void setValue( std::string value );

	void setAverage( double value );

	void setImage( CIwTexture *texture );

	void SetLayout( InfoPanelLayout layout = INFOPANEL_LAYOUT_SMALL );		// Set the layout for the infopanel (tiny / small)

	CIwUIElement *getInfoPanel();

	void Detach();
	void Update();		// Should be called when the infopanel should be forced to re-update all information to the UI

private:
	CIwUIElement *uiInfoPanel;

	CIwUILabel *unitLabel;
	CIwUILabel *currentLabel;
	CIwUILabel *averageLabel;
	CIwUILabel *maximumLabel;

	CIwUIImage *image;
	CIwUIImage *currentImage;

	CIwUILayoutSpacer *topSpacer;

	bool bNoStatistics;
	double maximum;
	double average;
	int numPoints;
};

#endif
