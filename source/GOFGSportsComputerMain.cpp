/*
 * This file is part of the Airplay SDK Code Samples.
 *
 * Copyright (C) 2001-2010 Ideaworks3D Ltd.
 * All Rights Reserved.
 *
 * This source code is intended only as a supplement to Ideaworks Labs
 * Development Tools and/or on-line documentation.
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 */
// UITutorial main file 
//-------------------------------------------------------------------------- 

#include "s3e.h"
#include "IwGx.h"

// Externs for functions which examples must implement 
void ExampleInit(); 
void ExampleShutDown(); 
void ExampleRender(); 
bool ExampleUpdate(); 

//-------------------------------------------------------------------------- 
// Main global function 
//-------------------------------------------------------------------------- 
int main()
{ 
#ifdef EXAMPLE_DEBUG_ONLY 
	// Test for Debug only examples 
#endif

	// Example main loop 
	ExampleInit(); 
	IwGxSetColClear(0x0, 0x0, 0x0, 0xff);

	while (1) 
	{ 
		s3eDeviceYield(0); 
		s3eKeyboardUpdate();
		s3ePointerUpdate();
		bool result = ExampleUpdate(); 
		if ( 
			(result == false) || 
			(s3eKeyboardGetState(s3eKeyEsc) & S3E_KEY_STATE_DOWN) 
			|| 
			(s3eKeyboardGetState(s3eKeyLSK) & S3E_KEY_STATE_DOWN) 
			|| 
			(s3eDeviceCheckQuitRequest()) 
			) 
			break; 
		ExampleRender(); 
		//s3eSurfaceShow(); 
	} 
	ExampleShutDown(); 
	return 0;
}