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

#ifndef SCREEN
#define SCREEN

#include <string>
#include <list>

#include "s3eSurface.h"

#include "IwUI.h"
#include "IwUIAnimManager.h"

class Screen : public IIwUIAnimatorObserver {
public:
	Screen( const char *screenName );
	virtual ~Screen();

	void SetVisible( bool p_bVisible, bool p_bNoAnim = false );		// Show / Hide the screen
	void SetEnabled( bool p_bEnabled );
	void SetAnimation( std::string p_animInName = "ScreenSlideIn", std::string p_animOutName = "ScreenSlideOut" );

	void NotifyProgress( CIwUIAnimator *pAnimator );
	void NotifyStopped( CIwUIAnimator *pAnimator );

	// Static control functions for singleton
	static void DeleteScreens();
	static int32 CB_SurfaceChange(void *systemData, void *userData);

protected:
	void SetChildrenEnabled( CIwUIElement *p_parent, bool p_bEnabled = false );

	virtual void SurfaceChanged( s3eSurfaceOrientation *surfaceOrientation );

	CIwUIElement *myScreen;
	CIwUIButton *background;

private:
	std::string animInName, animOutName;
	static std::list<Screen*> screens;
};

#endif
