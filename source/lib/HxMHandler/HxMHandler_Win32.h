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
#include <s3eLibrary.h>

#include <sstream>
#include <wchar.h>

// Use own namespace for all our API functions from windows (don't polute our own namespace)
namespace WinAPI {
	// Defined in windows API
	#define INVALID_HANDLE_VALUE (void*)0xFFFFFFFF

	/**
	typedef struct _DCB {
	  DWORD DCBlength;
	  DWORD BaudRate;
	  DWORD fBinary  :1;
	  DWORD fParity  :1;
	  DWORD fOutxCtsFlow  :1;
	  DWORD fOutxDsrFlow  :1;
	  DWORD fDtrControl  :2;
	  DWORD fDsrSensitivity  :1;
	  DWORD fTXContinueOnXoff  :1;
	  DWORD fOutX  :1;
	  DWORD fInX  :1;
	  DWORD fErrorChar  :1;
	  DWORD fNull  :1;
	  DWORD fRtsControl  :2;
	  DWORD fAbortOnError  :1;
	  DWORD fDummy2  :17;
	  WORD  wReserved;
	  WORD  XonLim;
	  WORD  XoffLim;
	  BYTE  ByteSize;
	  BYTE  Parity;
	  BYTE  StopBits;
	  char  XonChar;
	  char  XoffChar;
	  char  ErrorChar;
	  char  EofChar;
	  char  EvtChar;
	  WORD  wReserved1;
	} DCB, *LPDCB;
	*/
	typedef struct _DCB {
	  unsigned long DCBlength;
	  unsigned long BaudRate;
	  unsigned long fBinary  :1;
	  unsigned long fParity  :1;
	  unsigned long fOutxCtsFlow  :1;
	  unsigned long fOutxDsrFlow  :1;
	  unsigned long fDtrControl  :2;
	  unsigned long fDsrSensitivity  :1;
	  unsigned long fTXContinueOnXoff  :1;
	  unsigned long fOutX  :1;
	  unsigned long fInX  :1;
	  unsigned long fErrorChar  :1;
	  unsigned long fNull  :1;
	  unsigned long fRtsControl  :2;
	  unsigned long fAbortOnError  :1;
	  unsigned long fDummy2  :17;
	  unsigned short  wReserved;
	  unsigned short  XonLim;
	  unsigned short  XoffLim;
	  unsigned char  ByteSize;
	  unsigned char  Parity;
	  unsigned char  StopBits;
	  char  XonChar;
	  char  XoffChar;
	  char  ErrorChar;
	  char  EofChar;
	  char  EvtChar;
	  unsigned short  wReserved1;
	} DCB, *LPDCB;

	/**
	BOOL WINAPI SetCommState(
	  __in  HANDLE hFile,
	  __in  LPDCB lpDCB
	);
	*/
	typedef int(*win_setCommState)(void*, LPDCB);

	/**
	BOOL WINAPI GetCommState(
	  __in     HANDLE hFile,
	  __inout  LPDCB lpDCB
	);
	*/
	typedef int(*win_getCommState)(void*, LPDCB);

	/**
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
	typedef void*(*win_createFile)(const wchar_t*, unsigned long, unsigned long, void*, unsigned long, unsigned long, void* );

	/**
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
	BOOL WINAPI CloseHandle(
	  __in  HANDLE hObject
	);
	*/
	typedef int(*win_closeHandle)(void*);

	/**
	DWORD WINAPI GetLastError(void);
	*/
	typedef unsigned long(*win_getLasterror)();
}


/**
 * <summary>	HxMHandler for Windows based devices (both windows and win mobile) </summary>
 *
 * <remarks>	Wkoller, 05.04.2011. </remarks>
 */
class HxMHandler_Win32 : public HxMHandler_Interface {
public:
	HxMHandler_Win32( const char* = "C:/Windows/System32/kernel32" );

	bool Open( const char* );
	unsigned long Read( char *, unsigned int );
	bool Close();
protected:
	s3eDLLHandle *windowsDll;
	WinAPI::win_createFile cfHandle;
	WinAPI::win_readFile rfHandle;
	WinAPI::win_closeHandle chHandle;
	WinAPI::win_getLasterror gleHandle;
	WinAPI::win_getCommState gcsHandle;
	WinAPI::win_setCommState scsHandle;
	WinAPI::DCB dcb;

	void *deviceHandle;
};

#endif
