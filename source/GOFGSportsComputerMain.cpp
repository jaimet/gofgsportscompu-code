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

// NOTE: Parts of the code in this file are based on the SDK Examples from Airplay - see http://www.airplaysdk.com/

#include "s3e.h"
#include "IwGx.h"

// Pre-Define our main functions for GOFG
void GOFGInit(); 
void GOFGShutDown(); 
void GOFGRender(); 
bool GOFGUpdate( int32 deltaMs );

/**
* Main Function for program flow control
*/
int main() {
	// Start with the main loop
	GOFGInit(); 
	IwGxSetColClear(0x0, 0x0, 0x0, 0xff);

	int64 updateTime = s3eTimerGetUST();

	// Do this until asked to stop
	while (1) {
		s3eDeviceYield(); 
		s3eKeyboardUpdate();
		s3ePointerUpdate();

		int64 currTime = s3eTimerGetUST();

		bool result = GOFGUpdate( (int32) (currTime - updateTime) );
		updateTime = currTime;
		if( (result == false)
			|| (s3eKeyboardGetState(s3eKeyEsc) & S3E_KEY_STATE_DOWN) 
			|| (s3eKeyboardGetState(s3eKeyLSK) & S3E_KEY_STATE_DOWN) 
			|| (s3eDeviceCheckQuitRequest()) 
			) {
				break;
		}

		// Render content
		GOFGRender(); 
	} 

	// Do the shutdown
	GOFGShutDown(); 
	return 0;
}
