#ifndef SCREEN
#define SCREEN

#include "IwUI.h"
#include "IwUIAnimManager.h"

class Screen : public IIwUIAnimatorObserver {
public:
	Screen( char *screenName );

	void SetVisible( bool p_bVisible );

	void NotifyProgress( CIwUIAnimator *pAnimator );
	void NotifyStopped( CIwUIAnimator *pAnimator );

protected:
	CIwUIElement *myScreen;
};

#endif
