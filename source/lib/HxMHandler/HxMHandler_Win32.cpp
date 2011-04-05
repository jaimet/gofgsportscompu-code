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
	if( this->windowsDll != NULL ) {
		this->cfHandle = (WinAPI::win_createFile) s3eExtLibraryGetSymbol( this->windowsDll, "CreateFileW" );
		this->rfHandle = (WinAPI::win_readFile) s3eExtLibraryGetSymbol( this->windowsDll, "ReadFile" );
		this->chHandle = (WinAPI::win_closeHandle) s3eExtLibraryGetSymbol( this->windowsDll, "CloseHandle" );
		this->gleHandle = (WinAPI::win_getLasterror) s3eExtLibraryGetSymbol( this->windowsDll, "GetLastError" );
		this->gcsHandle = (WinAPI::win_getCommState) s3eExtLibraryGetSymbol( this->windowsDll, "GetCommState" );
		this->scsHandle = (WinAPI::win_setCommState) s3eExtLibraryGetSymbol( this->windowsDll, "SetCommState" );
	}
	else {
		IwTrace( HXMHANDLER, ("Unable to load Windows Dll") );
		IwTrace( HXMHANDLER, (library) );
	}

	// Some trace information
	std::ostringstream traceInfo;
	traceInfo << "HxMHandler_Win32: " << this->windowsDll << " / " << this->cfHandle << " / " << this->rfHandle << " / " << this->chHandle << " / " << this->gleHandle << " / " << this->gcsHandle << " / " << this->scsHandle;
	IwTrace( HXMHANDLER, (traceInfo.str().c_str() ) );

	// Initialize the DCB structure
	this->dcb.DCBlength = sizeof(WinAPI::DCB);

	this->deviceHandle = NULL;
}

bool HxMHandler_Win32::Open( const char *device ) {
	if( this->windowsDll == NULL ) return false;	// Sanity check

	wchar_t *deviceName = (wchar_t*) malloc( sizeof(wchar_t) * (strlen(device) + 1) );

	// We need a 16bit wide name for the device, so do some conversion first
	for( unsigned int i = 0; i < strlen( device ); i++ ) {
		deviceName[i] = device[i];
	}
	deviceName[strlen(device)] = '\0';

	this->deviceHandle = this->cfHandle( (const wchar_t*) deviceName, 0x80000000, 0, NULL, 3, 0x80, 0 );

	// Free up memory for device name
	free( deviceName );

	// Check if opening the handle was a success
	if( this->deviceHandle == NULL || this->deviceHandle == INVALID_HANDLE_VALUE ) return false;

	// Get connection parameter (fill with default values)
	int success = this->gcsHandle( this->deviceHandle, &this->dcb );
	if( !success ) {
		this->Close();
		return false;
	}

	// Now change the relevant parameter
	this->dcb.BaudRate = 115200;	// 115200 baud
	this->dcb.ByteSize = 8;			// 8 data bits
	this->dcb.Parity = 0;			// no parity
	this->dcb.StopBits = 0;			// 1 stop bit

	// Finally apply the new settings
	success = this->scsHandle( this->deviceHandle, &this->dcb );
	if( !success ) {
		this->Close();
		return false;
	}

	return true;
}

unsigned long HxMHandler_Win32::Read( char *buffer, unsigned int maxLength ) {
	if( this->windowsDll == NULL ) return false;	// Sanity check

	unsigned long bytesRead = -1;

	this->rfHandle( this->deviceHandle, buffer, maxLength, &bytesRead, NULL );

	return bytesRead;
}

bool HxMHandler_Win32::Close() {
	if( this->windowsDll == NULL ) return false;	// Sanity check

	if( this->deviceHandle != NULL && this->deviceHandle != INVALID_HANDLE_VALUE ) this->chHandle( this->deviceHandle );
	this->deviceHandle = NULL;

	return true;
}
