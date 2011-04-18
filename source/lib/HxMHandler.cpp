/*
* Copyright (C) 2011 Wolfgang Koller
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

#include "HxMHandler.h"

// Include all device specific implementations
#include "HxMHandler/HxMHandler_Win32.h"
#include "HxMHandler/HxMHandler_WinMobile.h"

template<>
HxMHandler *Singleton<HxMHandler>::mySelf = NULL;

bool HxMHandler::IsAvailable() {
	return false;
	//return (this->deviceInterface != NULL);
}

HxMHandler::HxMHandler() {
	this->deviceInterface = NULL;

	// Check what interface we have to create an instance of
	switch( s3eDeviceGetInt( S3E_DEVICE_OS ) ) {
	case S3E_OS_ID_WINDOWS:
		this->deviceInterface = new HxMHandler_Win32();
		break;
	case S3E_OS_ID_WINMOBILE:
		this->deviceInterface = new HxMHandler_WinMobile();
		break;
	}
}
