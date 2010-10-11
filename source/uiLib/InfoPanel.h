#ifndef INFOPANEL
#define INFOPANEL

#include "IwUI.h"

#include <IwUIElement.h>
#include <IwUILabel.h>
#include <IwUILayoutGrid.h>

class InfoPanel {
public:
	InfoPanel( char *name, bool bNoStatistics = false );

	void setUnit( char *unit );
	void setValue( double value );
	void setValue( char *value );

	void setImage( CIwTexture *texture );

	CIwUIElement *getInfoPanel();

private:
	CIwUILabel *unitLabel;
	CIwUILabel *currentLabel;
	CIwUILabel *averageLabel;
	CIwUILabel *maximumLabel;

	CIwUIImage *image;

	bool bNoStatistics;
	double maximum;
	double average;
	int numPoints;

	CIwUIElement *uiInfoPanel;
};

#endif
