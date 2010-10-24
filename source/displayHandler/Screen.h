#ifndef SCREEN
#define SCREEN

#include "IwUI.h"

class Screen {
public:
	Screen( char *screenName );

	void SetVisible( bool p_bVisible );

protected:
	CIwUIElement *myScreen;
};

#endif
