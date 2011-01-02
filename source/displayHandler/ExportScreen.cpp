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

void ExportScreen::SetVisible( bool p_bVisible, bool p_bNoAnim ) {
	if( p_bVisible ) {
		this->trackList->RecreateItemsFromSource();
		//this->trackList->SetSelection( 0 );
	}

	Screen::SetVisible( p_bVisible, p_bNoAnim );
}

ExportScreen::ExportScreen() : Screen( "ExportScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, CB_ESExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, CB_ESExportButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_HandleTrackSelection, CIwUIElement*,bool)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_ExportFormatChanged, CIwUIElement*,int16)
	
	// Initialize values
	strcpy( this->es_currentFile, "" );
	this->exportFormat = FITLOG;
	this->exportTask = NULL;

	((CIwUITabBar*) this->myScreen->GetChildNamed( "exportFormat" ))->SetSelected( SettingsHandler::Self()->GetInt( "DefaultExportType" ) );
	this->exportProgress = (CIwUIProgressBar*) this->myScreen->GetChildNamed( "exportProgress" );
	this->exportStatus = (CIwUILabel*) this->myScreen->GetChildNamed( "exportStatus" );
	this->trackList = (CIwUITableView*) this->myScreen->GetChildNamed( "TrackList" );
	this->exitButton = (CIwUIButton*) this->myScreen->GetChildNamed( "LeftButton" );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}

void ExportScreen::CB_ESExitButtonClick(CIwUIElement*)
{
	if( this->exportTask != NULL ) {
		if( this->exportTask->GetProcessID() > 0 ) {
			TaskHandler::Self()->Remove( this->exportTask );
		}

		delete this->exportTask;
		this->exportTask = NULL;

		// Enable all controls again
		this->SetEnabled( true );
	}

	this->SetVisible( false );
}

void ExportScreen::CB_ESExportButtonClick(CIwUIElement*) {
	if( strlen( this->es_currentFile ) > 0 ) {
//		s3eTimerSetTimer( 1, &ExportScreen::CB_StartExport, NULL );
		//char fullFileName[30];
		//char exportName[30];
		//char *extString;
		std::string baseFileName( ExportScreen::Self()->es_currentFile );

		std::ostringstream inputFileName;
		std::ostringstream exportFileName;

		baseFileName.replace( baseFileName.find_last_of( ".gsc" ), 4, "" );

		// Create the fileNames
		inputFileName << SettingsHandler::Self()->GetString( "TrackFolder" ) << baseFileName << ".gsc";
		exportFileName << SettingsHandler::Self()->GetString( "ExportFolder" ) << baseFileName;

		//sprintf( fullFileName, "tracks/%s", ExportScreen::Self()->es_currentFile );
		//sprintf( exportName, "%s", ExportScreen::Self()->es_currentFile );

		// Change extension
		//extString = strstr( exportName, ".gsc" );

		// Start the correct process
		switch( this->exportFormat ) {
		case FITLOG:
			//strcpy( extString, ".fitlog" );
			exportFileName << ".fitlog";
			this->exportTask = new TaskFitlogExport( inputFileName.str(), exportFileName.str() );
			break;
		case GOFG:
			TaskHTTPExport::Self()->SetFileName( inputFileName.str() );
			this->exportTask = TaskHTTPExport::Self();
			//TaskHandler::Self()->Add( TaskHTTPExport::Self() );
			break;
		case TCX:
		default:
			//strcpy( extString, ".tcx" );
			exportFileName << ".tcx";
			this->exportTask = new TaskTCXExport( inputFileName.str(), exportFileName.str() );
			break;
		}

		// Set progress callback & add the task to the taskhandler
		this->exportTask->SetProgressCallback( &ExportScreen::CB_UpdateProgress );
		TaskHandler::Self()->Add( this->exportTask );

		//this->DisableChildren( this->myScreen );

		// Disable all controls
		this->SetEnabled( false );
		// But keep exit button active
		this->exitButton->SetEnabled( true );

		//this->mysc
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
	case 2:
		this->exportFormat = GOFG;
		break;
	default:
		this->exportFormat = TCX;
		break;
	}
}

int32 ExportScreen::CB_UpdateProgress( void *systemData, void *userData  ) {
	int *percent = (int*) systemData;

	//iwfixed *progress = (iwfixed *) systemData;
	ExportScreen::Self()->exportProgress->SetProgress( IW_FIXED( (float) *percent / 100.0 ) );
	char *status = NULL;

	// Check if we have a custom message
	if( userData != NULL ) {
		status = (char *) userData;
	}
	// if not just display the percent
	else {
		char statusBuf[6];
		sprintf( statusBuf, "%d %%", *percent );

		status = statusBuf;
	}
	// Update status text
	ExportScreen::Self()->exportStatus->SetCaption( status );

	// If progress is 100%, then we switch on controls again
	if( *percent >= 100 ) {
		ExportScreen::Self()->SetEnabled( true );
	}

	// Manually call the drawing functions
	/*IwGxClear(IW_GX_COLOUR_BUFFER_F | IW_GX_DEPTH_BUFFER_F);
	IwGetUIView()->Render();
	IwGxFlush();
	IwGxSwapBuffers();*/

	return 0;
}

// Callback for calling the export function using a timer, the advantage is,
// that it then is called from s3eDeviceYield which allows calling the render functions
// from within the callback of the export
/*int32 ExportScreen::CB_StartExport( void *systemData, void *userData ) {
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
	// .. direct upload to GPSies.com ..
	else if( ExportScreen::Self()->exportFormat == GPSIES ) {
		//TrackExportHandler::Self()->exportToGPSies( fullFileName );
		TaskHTTPExport::Self()->SetFileName( fullFileName );
		TaskHTTPExport::Self()->SetProgressCallback( &ExportScreen::CB_UpdateProgress );

		TaskHandler::Self()->Add( TaskHTTPExport::Self() );
	}
	// or Garmin TCX
	else {
		strcpy( extString, ".tcx" );
		TaskTCXExport *tcxExport = new TaskTCXExport( fullFileName, exportName );
		tcxExport->SetProgressCallback( &ExportScreen::CB_UpdateProgress );

		TaskHandler::Self()->Add( tcxExport );
		//TrackExportHandler::Self()->exportToTCX( fullFileName, exportName );
	}

	return 0;
}*/
