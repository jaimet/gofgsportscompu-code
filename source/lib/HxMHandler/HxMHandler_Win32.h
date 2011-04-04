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

#ifndef HXMHANDLER_WIN32
#define HXMHANDLER_WIN32

#include "../HxMHandler.h"

#include <IwDebug.h>

#include <sstream>
#include <wchar.h>

//#define WINDOWS_LIBRARY "C:/Windows/System32/kernel32"

/**
Original Definition of CreateFile from kernel32

HANDLE WINAPI CreateFile(
  __in      LPCTSTR lpFileName,
  __in      DWORD dwDesiredAccess,
  __in      DWORD dwShareMode,
  __in_opt  LPSECURITY_ATTRIBUTES lpSecurityAttributes,
  __in      DWORD dwCreationDisposition,
  __in      DWORD dwFlagsAndAttributes,
  __in_opt  HANDLE hTemplateFile
);
*/
// SECURITY_ATTRIBUTES type definition, just to be sure
/*typedef struct _SECURITY_ATTRIBUTES {
  unsigned long  nLength;
  void *lpSecurityDescriptor;
  int   bInheritHandle;
} *LPSECURITY_ATTRIBUTES;*/
// Actual CreateFile Definition
typedef void*(*win_createFile)(const wchar_t*, unsigned long, unsigned long, void*, unsigned long, unsigned long, void* );

/**
Original Definition of ReadFile from kernel32

BOOL WINAPI ReadFile(
  __in         HANDLE hFile,
  __out        LPVOID lpBuffer,
  __in         DWORD nNumberOfBytesToRead,
  __out_opt    LPDWORD lpNumberOfBytesRead,
  __inout_opt  LPOVERLAPPED lpOverlapped
);
*/
typedef int(*win_readFile)(void*, void*, unsigned long, unsigned long*, void* );

/**
Original Definition of CloseHandle from kernel32

BOOL WINAPI CloseHandle(
  __in  HANDLE hObject
);
*/
typedef int(*win_closeHandle)(void*);

#include <s3eLibrary.h>

class HxMHandler_Win32 : public HxMHandler_Interface {
public:
	HxMHandler_Win32( const char* = "C:/Windows/System32/kernel32" );

	bool Open( const char* );
	unsigned long Read( char *, unsigned int );
	bool Close();
protected:
	s3eDLLHandle *windowsDll;
	win_createFile cfHandle;
	win_readFile rfHandle;
	win_closeHandle chHandle;

	void *deviceHandle;
	//wchar_t deviceName[100];	// Should be replaced with something more dynamic...
};

#endif
