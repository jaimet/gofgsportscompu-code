#include "ExportScreen.h"

template<>
ExportScreen *Singleton<ExportScreen>::mySelf = NULL;

ExportScreen::ExportScreen()
{
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, ES_ExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "ExportScreen", ExportScreen, ES_ExportButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_HandleTrackSelection, CIwUIElement*,bool)
	IW_UI_CREATE_VIEW_SLOT2(this, "ExportScreen", ExportScreen, ES_ExportFormatChanged, CIwUIElement*,int16)
	
	strcpy( this->es_currentFile, "" );

	this->exportScreen = CIwUIElement::CreateFromResource( "ExportScreen" );
}

void ExportScreen::ES_ExitButtonClick(CIwUIElement*)
{
	this->exportScreen->SetVisible( false );
}

void ExportScreen::ES_ExportButtonClick(CIwUIElement*)
{
	if( strlen( this->es_currentFile ) > 0 ) {
		char fullFileName[30];
		char exportName[30];
		char *extString;

		sprintf( fullFileName, "tracks/%s", this->es_currentFile );
		sprintf( exportName, "%s", this->es_currentFile );

		// Change extension
		extString = strstr( exportName, ".gsc" );

		// Check for export format: Fitlog...
		if( this->es_format == 0 ) {
			strcpy( extString, ".fitlog" );
			TrackExportHandler::Self()->exportToFitlog( fullFileName, exportName );
		}
		// or Garmin TCX
		else {
			strcpy( extString, ".tcx" );
			TrackExportHandler::Self()->exportToTCX( fullFileName, exportName );
		}
	}
}

void ExportScreen::ES_HandleTrackSelection(CIwUIElement *pTrackEntry, bool bIsSelected)
{
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
	this->es_format = selection;
}

CIwUIElement *ExportScreen::GetScreen() {
	return this->exportScreen;
}
