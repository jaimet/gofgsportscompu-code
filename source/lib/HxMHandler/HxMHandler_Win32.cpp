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

#include "HxMHandler_Win32.h"

HxMHandler_Win32::HxMHandler_Win32( const char *library ) {
	// Load DLL and get references to the necessary functions
	this->windowsDll = s3eExtLibraryOpen( library );
	this->cfHandle = (win_createFile) s3eExtLibraryGetSymbol( this->windowsDll, "CreateFileW" );
	this->rfHandle = (win_readFile) s3eExtLibraryGetSymbol( this->windowsDll, "ReadFile" );
	this->chHandle = (win_closeHandle) s3eExtLibraryGetSymbol( this->windowsDll, "CloseHandle" );

	std::ostringstream traceInfo;
	traceInfo << "HxMHandler_Win32: " << this->windowsDll << " / " << this->cfHandle << " / " << this->rfHandle << " / " << this->chHandle;
	IwTrace( HXMHANDLER, (traceInfo.str().c_str() ) );

	this->deviceHandle = NULL;
}

bool HxMHandler_Win32::Open( const char *device ) {
	wchar_t deviceName[100];	// TODO: Replace with something less static

	// We need a 16bit wide name for the device, so do some conversion first
	for( int i = 0; i < strlen( device ); i++ ) {
		deviceName[i] = device[i];
	}
	deviceName[strlen(device)] = '\0';

	this->deviceHandle = this->cfHandle( (const wchar_t*) deviceName, 0x80000000, 0, NULL, 3, 0x80, 0 );

	return true;
}

unsigned long HxMHandler_Win32::Read( char *buffer, unsigned int maxLength ) {
	unsigned long bytesRead = -1;

	this->rfHandle( this->deviceHandle, buffer, maxLength, &bytesRead, NULL );

	return bytesRead;
}

bool HxMHandler_Win32::Close() {
	if( this->deviceHandle != NULL ) this->chHandle( this->deviceHandle );
	this->deviceHandle = NULL;

	return true;
}
