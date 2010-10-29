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

#include "ExportScreen.h"

template<>
ExportScreen *Singleton<ExportScreen>::mySelf = NULL;

ExportScreen::ExportScreen() : Screen( "ExportScreen" )
{
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, ES_ExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, ES_ExportButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_HandleTrackSelection, CIwUIElement*,bool)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_ExportFormatChanged, CIwUIElement*,int16)
	
	// Initialize values
	strcpy( this->es_currentFile, "" );
	this->exportFormat = FITLOG;

	((CIwUITabBar*) this->myScreen->GetChildNamed( "exportFormat" ))->SetSelected( 0 );
	this->exportProgress = (CIwUIProgressBar*) this->myScreen->GetChildNamed( "exportProgress" );
	this->exportStatus = (CIwUILabel*) this->myScreen->GetChildNamed( "exportStatus" );

	TrackExportHandler::Self()->SetProgressCallback( &ExportScreen::CB_UpdateProgress );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}

void ExportScreen::ES_ExitButtonClick(CIwUIElement*)
{
	//this->myScreen->SetVisible( false );
	this->SetVisible( false );
}

void ExportScreen::ES_ExportButtonClick(CIwUIElement*) {
	if( strlen( this->es_currentFile ) > 0 ) {
		s3eTimerSetTimer( 1, &ExportScreen::CB_StartExport, NULL );
	}
}

void ExportScreen::ES_HandleTrackSelection(CIwUIElement *pTrackEntry, bool bIsSelected) {
	if( bIsSelected ) {
		CIwPropertyString fileName;
		if (pTrackEntry->GetChildNamed("fileName")->GetProperty("caption", fileName))
		{
			//sprintf( this->es_currentFile, "tracks/%s", fileName.c_str() );
			strcpy( this->es_currentFile, fileName.c_str() );
		}
	}
}

void ExportScreen::ES_ExportFormatChanged(CIwUIElement*, int16 selection) {
	switch( selection ) {
	case 0:
		this->exportFormat = FITLOG;
		break;
	default:
		this->exportFormat = TCX;
		break;
	}
}

int32 ExportScreen::CB_UpdateProgress( void *systemData, void *userData  ) {
	iwfixed *progress = (iwfixed *) systemData;
	ExportScreen::Self()->exportProgress->SetProgress( *progress );
	char *status = NULL;

	// Check if we have a custom message
	if( userData != NULL ) {
		status = (char *) userData;
	}
	// if not just display the percent
	else {
		char statusBuf[6];
		sprintf( statusBuf, "%d %%", (int)(IW_FIXED_TO_FLOAT(*progress) * 100.0) );

		status = statusBuf;
	}
	// Update status text
	ExportScreen::Self()->exportStatus->SetCaption( status );

	// Manually call the drawing functions
	IwGxClear(IW_GX_COLOUR_BUFFER_F | IW_GX_DEPTH_BUFFER_F);
	IwGetUIView()->Render();
	IwGxFlush();
	IwGxSwapBuffers();

	return 0;
}

// Callback for calling the export function using a timer, the advantage is,
// that it then is called from s3eDeviceYield which allows calling the render functions
// from within the callback of the export
int32 ExportScreen::CB_StartExport( void *systemData, void *userData ) {
	char fullFileName[30];
	char exportName[30];
	char *extString;

	sprintf( fullFileName, "tracks/%s", ExportScreen::Self()->es_currentFile );
	sprintf( exportName, "%s", ExportScreen::Self()->es_currentFile );

	// Change extension
	extString = strstr( exportName, ".gsc" );

	// Check for export format: Fitlog...
	if( ExportScreen::Self()->exportFormat == FITLOG ) {
		strcpy( extString, ".fitlog" );
		TrackExportHandler::Self()->exportToFitlog( fullFileName, exportName );
	}
	// or Garmin TCX
	else {
		strcpy( extString, ".tcx" );
		TrackExportHandler::Self()->exportToTCX( fullFileName, exportName );
	}

	return 0;
}
