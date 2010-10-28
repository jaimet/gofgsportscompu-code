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

#include "s3e.h"
#include "IwGx.h"
#include "IwUI.h"

#include "uiLib/TrackTVItemSource.h"
#include "uiLib/CIwUIAutoSizeLabel.h"
#include "displayHandler/MainScreen.h"

/**
* Initialize our system
*/
void GOFGInit() {
	IwGxInit();
	IwUIInit();
	IW_CLASS_REGISTER(TrackTVItemSource);
	IW_CLASS_REGISTER(CIwUIAutoSizeLabel);

	//Instantiate the view and controller singletons.
	new CIwUIController;
	new CIwUIView;

	// Load the GOFG UI
	IwGetResManager()->LoadGroup("GOFGUI.group");

    //Set the default style sheet
    CIwResource* pResource = IwGetResManager()->GetResNamed("iwui", IW_UI_RESTYPE_STYLESHEET);
    IwGetUIStyleManager()->SetStylesheet(IwSafeCast<CIwUIStylesheet*>(pResource));

	// Instantiate our main screen and show it
	MainScreen::Self()->SetVisible( true, true );
}

/**
* Cleanup and exit
*/
void GOFGShutDown() {
	delete IwGetUIController();
	delete IwGetUIView();

	IwUITerminate();
	IwGxTerminate();
}

/**
* Update the View
*/
bool GOFGUpdate() {
	IwGetUIController()->Update();
	IwGetUIView()->Update(25);

	return true; 
}

/**
* Render our content (draw to screen)
*/
void GOFGRender() {
	IwGxClear(IW_GX_COLOUR_BUFFER_F | IW_GX_DEPTH_BUFFER_F);

	IwGetUIView()->Render();

	IwGxFlush();
	IwGxSwapBuffers();
}
