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

#include "TaskHTTPExport.h"

template<>
TaskHTTPExport *Singleton<TaskHTTPExport>::mySelf = NULL;

TaskHTTPExport::TaskHTTPExport() : Task(), TrackReader() {
	this->http = new CIwHTTP();
	this->http->SetRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );

	// Prepare the track reader part
	//this->SetFile( p_filename );
}

void TaskHTTPExport::Start() {
	this->sequence = 0;
	this->bRequestPending = false;
	this->sendBuffer = "a=b";

	if( !this->filename.empty() ) {
		this->SetFile( (char*) this->filename.c_str() );
	}
}

int TaskHTTPExport::Next() {
	if( this->bRequestPending ) return 1;

	DataPoint *myPoint = this->ReadNextPoint();
	if( myPoint == NULL ) {
		return -1;
	}

	// Format the post body
	// Add time information
	sprintf( this->formatBuffer, "&unixtime[%d]=%d", this->sequence, myPoint->unixtime );
	this->sendBuffer += this->formatBuffer;
	// Add position information
	sprintf( this->formatBuffer, "&lat[%d]=%.9f", this->sequence, myPoint->lat );
	this->sendBuffer += this->formatBuffer;
	sprintf( this->formatBuffer, "&lon[%d]=%.9f", this->sequence, myPoint->lon );
	this->sendBuffer += this->formatBuffer;
	sprintf( this->formatBuffer, "&alt[%d]=%.2f", this->sequence, myPoint->alt );
	this->sendBuffer += this->formatBuffer;
	// Add distance info
	sprintf( this->formatBuffer, "&distance[%d]=%.2f", this->sequence, myPoint->dist );
	this->sendBuffer += this->formatBuffer;
	// Add speed info
	//sprintf( this->formatBuffer, "&speed[%d]=%.2f", this->sequence, myPoint->speed );
	//this->sendBuffer += this->formatBuffer;
	// Add heartrate info
	sprintf( this->formatBuffer, "&hr[%d]=%d", this->sequence, myPoint->hr );
	this->sendBuffer += this->formatBuffer;

	// Increase sequence
	this->sequence++;

	// Always send 10 datapoints at once
	if( (this->sequence % 50) == 0 ) {
		sprintf( this->formatBuffer, "&trackUUID=%s", this->GetUUID() );
		this->sendBuffer += this->formatBuffer;	// Prefix to have a valid request string

		this->http->Post( "http://www.gofg.at/gofgst/index.php?mode=device_upload", this->sendBuffer.c_str(), strlen( this->sendBuffer.c_str() ), &TaskHTTPExport::CB_HeaderReceived, NULL );
		this->bRequestPending = true;
	}

	return 1;
}

void TaskHTTPExport::Stop() {
	this->http->Cancel();
	this->CloseFile();

	this->UpdateProgress( 100 );
}

void TaskHTTPExport::SetFileName( std::string p_filename ) {
	this->filename = p_filename;
}

// Called by the HTTP Object once the answer headers are received (and thus the request is finished)
// TODO: Add status checks for the request
int32 TaskHTTPExport::CB_HeaderReceived( void *systemData, void *userData ) {
	TaskHTTPExport::Self()->bRequestPending = false;
	//TaskHTTPExport::Self()->sendBuffer.clear();
	TaskHTTPExport::Self()->sendBuffer = "a=b";	// Prefix to have a valid request string

	TaskHTTPExport::Self()->UpdateProgress( (int) (100.0 / (float) TaskHTTPExport::Self()->GetFileSize() * (float) TaskHTTPExport::Self()->GetBytesRead()) );

	return 0;
}
