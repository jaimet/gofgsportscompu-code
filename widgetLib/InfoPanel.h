/*
 * InfoPanel.h
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */

#ifndef INFOPANEL_H_
#define INFOPANEL_H_

#include <MAUI/Layout.h>
#include <MAUI/Label.h>
#include <MAUI/Image.h>
#include <MAUI/Font.h>

#include <mavsprintf.h>

#include "MAHeaders.h"

using namespace MAUI;

class InfoPanel : public Layout {
public:
	InfoPanel( char *unit, int x, int y, int width, int height, Widget *parent = 0, bool bStats = false );

	void setImage( MAHandle image );

	void setValue( char *newValue );
	void setValue( int newValue );
	void setValue( double newValue );

private:
	void doSetValue( double newValue, char *formatString = "%.1f" );

	Image *titleImage;
	Label *unitLabel;
	Label *currentLabel;
	Label *maxVal;
	Label *avgVal;

	double maximum;
	double average;
	int numPoints;
	bool bStatistics;
};

#endif /* INFOPANEL_H_ */
