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

#ifndef HXMHANDLER
#define HXMHANDLER

#include "Singleton.h"

#include <s3eDevice.h>

/**
 * <summary>	Interface for a device specific implementation of the HxMHandler </summary>
 *
 * <remarks>	Wkoller, 30.03.2011. </remarks>
 */
class HxMHandler_Interface {
public:
	virtual bool Open( const char* ) = 0;
	virtual unsigned long Read( char*, unsigned int ) = 0;
	virtual bool Close() = 0;
};

/**
 * <summary>	HxMHandler Class which calls the device specific handler & functions </summary>
 *
 * <remarks>	Wkoller, 30.03.2011. </remarks>
 */
class HxMHandler : public Singleton<HxMHandler> {
	friend class Singleton<HxMHandler>;
protected:
	HxMHandler();

	HxMHandler_Interface *deviceInterface;
};

#endif
