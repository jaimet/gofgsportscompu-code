/*
* Copyright (C) 2010-2011 Wolfgang Koller
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
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, CB_ESLoadButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_HandleTrackSelection, CIwUIElement*,bool)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_ExportFormatChanged, CIwUIElement*,int16)
	
	// Initialize values
	//strcpy( this->es_currentFile, "" );
	this->selectedTrackName.clear();
	this->exportFormat = FITLOG;
	this->exportTask = NULL;

	this->exportFormatTabBar = (CIwUITabBar*) this->myScreen->GetChildNamed( "exportFormat" );
	this->exportProgress = (CIwUIProgressBar*) this->myScreen->GetChildNamed( "exportProgress" );
	this->exportStatus = (CIwUILabel*) this->myScreen->GetChildNamed( "exportStatus" );
	this->trackList = (CIwUITableView*) this->myScreen->GetChildNamed( "TrackList" );
	this->exitButton = (CIwUIButton*) this->myScreen->GetChildNamed( "LeftButton" );

	this->exportFormatTabBar->SetSelected( SettingsHandler::Self()->GetInt( "DefaultExportType" ) );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}

void ExportScreen::CB_ESExitButtonClick(CIwUIElement*)
{
	if( this->exportTask != NULL ) {
		if( this->exportTask->GetProcessID() > 0 ) {
			TaskHandler::Self()->Remove( this->exportTask );
		}

		//delete this->exportTask;
		this->exportTask = NULL;

		// Enable all controls again
		this->SetEnabled( true );
	}

	this->SetVisible( false );
}

void ExportScreen::CB_ESExportButtonClick(CIwUIElement*) {
	if( this->selectedTrackName.length() <= 0 ) {
		MsgBox::Show( "Please select a file for export!" );
		return;
	}

	//s3eTimerSetTimer( 1, &ExportScreen::CB_StartExport, NULL );
	//char fullFileName[30];
	//char exportName[30];
	//char *extString;
	/*std::string baseFileName( this->currentFile );


	baseFileName.replace( baseFileName.find_last_of( "." ), 4, "" );*/

	// Create the fileNames
	std::ostringstream inputFileName;
	std::ostringstream exportFileName;
	// Construct file-names from selected track
	inputFileName << SettingsHandler::Self()->GetString( "TrackFolder" ) << this->selectedTrackName << ".gsc";
	exportFileName << SettingsHandler::Self()->GetString( "ExportFolder" ) << this->selectedTrackName;

	//sprintf( fullFileName, "tracks/%s", ExportScreen::Self()->es_currentFile );
	//sprintf( exportName, "%s", ExportScreen::Self()->es_currentFile );

	// Change extension
	//extString = strstr( exportName, ".gsc" );

	// Start the correct process
	switch( this->exportFormat ) {
	case FITLOG:
		exportFileName << ".fitlog";
		this->exportTask = new TaskFitlogExport( inputFileName.str(), exportFileName.str() );
		break;
	case GOFG:
		this->exportTask = new TaskHTTPExport( inputFileName.str(), "http://www.gofg.at/gofgst/index.php?mode=device_upload" );
		break;
	case GSC_LOAD:
		this->exportTask = new TaskTrackLoad( inputFileName.str() );
		break;
	case GPX:
		exportFileName << ".gpx";
		this->exportTask = new TaskGPXExport( inputFileName.str(), exportFileName.str() );
		break;
	case TCX:
	default:
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
}

// Run a special loading task
void ExportScreen::CB_ESLoadButtonClick(CIwUIElement*) {
//	ExportFormat oldExportFormat = this->exportFormat;

	this->exportFormat = GSC_LOAD;
	this->CB_ESExportButtonClick(NULL);
//	this->exportFormat = oldExportFormat;
}

void ExportScreen::ES_HandleTrackSelection(CIwUIElement *pTrackEntry, bool bIsSelected) {
	if( bIsSelected ) {
		CIwPropertyString trackName;
		if (pTrackEntry->GetChildNamed("fileName")->GetProperty("trackName", trackName)) {
			this->selectedTrackName = trackName.c_str();
			
			//sprintf( this->es_currentFile, "tracks/%s", fileName.c_str() );
			//strcpy( this->es_currentFile, fileName.c_str() );
		}
	}
}

void ExportScreen::ES_ExportFormatChanged(CIwUIElement*, int16 selection) {
	switch( selection ) {
	case 0:
		this->exportFormat = FITLOG;
		break;
	case 2:
		this->exportFormat = GPX;
		break;
	case 3:
		this->exportFormat = GOFG;
		break;
	case 1:
	default:
		this->exportFormat = TCX;
		break;
	}
}

int32 ExportScreen::CB_UpdateProgress( void *systemData, void *userData  ) {
	int *percent = (int*) systemData;

	//iwfixed *progress = (iwfixed *) systemData;
	ExportScreen::Self()->exportProgress->SetProgress( IW_FIXED( (float) *percent / 100.0 ) );
	const char *status = NULL;

	// Check if we have a custom message
	if( userData != NULL ) {
		status = (const char *) userData;
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

		if( ExportScreen::Self()->exportFormat == GSC_LOAD ) {
			ExportScreen::Self()->ES_ExportFormatChanged( NULL, ExportScreen::Self()->exportFormatTabBar->GetSelected() );
			MsgBox::Show( "File successfully loaded - go back to main screen to view it!" );
		}
		else {
			MsgBox::Show( "File successfully exported!" );
		}
	}

	// Manually call the drawing functions
	/*IwGxClear(IW_GX_COLOUR_BUFFER_F | IW_GX_DEPTH_BUFFER_F);
	IwGetUIView()->Render();
	IwGxFlush();
	IwGxSwapBuffers();*/

	return 0;
}

ExportScreen::~ExportScreen() {
/*	delete this->exportProgress;
	delete this->exportStatus;
	delete this->trackList;
	delete this->exitButton;*/
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
