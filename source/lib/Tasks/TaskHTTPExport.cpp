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

#include "TaskHTTPExport.h"

/**
 * <summary>	Initialize the HTTP object. </summary>
 *
 * <remarks>	Wkoller, 17.03.2011. </remarks>
 */
TaskHTTPExport::TaskHTTPExport( std::string p_filename, std::string p_targetURL ) : Task(), TrackReader() {
	this->http = new CIwHTTP();
	this->http->SetRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );

	this->filename = p_filename;
	this->targetURL = p_targetURL;
}

/**
 * <summary>	Initializes the buffers & starts reading the input file. </summary>
 *
 * <remarks>	Wkoller, 17.03.2011. </remarks>
 */
void TaskHTTPExport::Start() {
	this->sequence = 0;
	this->bRequestPending = false;
	this->sendBuffer.clear();
	this->sendBuffer << "a=a";

	if( !this->filename.empty() ) {
		this->SetFile( (char*) this->filename.c_str() );
	}
}

/**
 * <summary>	Reads a single data-point from the file and saves it to the internal write buffer.</summary>
 *
 * <remarks>	Wkoller, 17.03.2011. </remarks>
 *
 * <returns>	-1 if last point, 1 if all was alright </returns>
 */
int TaskHTTPExport::Next() {
	if( this->bRequestPending ) return 1;

	DataPoint *myPoint = this->ReadNextPoint();
	if( myPoint == NULL ) {
		// Check if something is left to be sent
		if( this->sendBuffer.str().length() > 3 ) {
			this->sendData();
			return 1;
		}

		return -1;
	}

	// Format the post body
	// Add time information
	this->sendBuffer << "&unixtime[" << this->sequence << "]=" << myPoint->unixtime;
	// Add position information
	this->sendBuffer << "&lat[" << this->sequence << "]=" << myPoint->lat;
	this->sendBuffer << "&lon[" << this->sequence << "]=" << myPoint->lon;
	this->sendBuffer << "&alt[" << this->sequence << "]=" << myPoint->alt;
	// Add distance info
	this->sendBuffer << "&distance[" << this->sequence << "]=" << myPoint->dist;
	// Add heartrate info
	this->sendBuffer << "&hr[" << this->sequence << "]=" << myPoint->hr;

	// Increase sequence
	this->sequence++;

	// Always send 50 datapoints at once
	if( (this->sequence % 50) == 0 ) {
		this->sendData();
	}

	return 1;
}

/**
 * <summary>	Close HTTP Connection & File and announce done. </summary>
 *
 * <remarks>	Wkoller, 17.03.2011. </remarks>
 */
void TaskHTTPExport::Stop() {
	this->http->Cancel();
	this->CloseFile();

	this->UpdateProgress( 100 );
}

/**
 * <summary>	Callback for CIwHTTP once the answer has been received </summary>
 *
 * <remarks>	Wkoller, 17.03.2011. </remarks>
 *
 * <param name="systemData">	[in,out] Unused. </param>
 * <param name="userData">  	[in,out] Pointer to TaskHTTPExport object which calls the received function. </param>
 *
 * <returns>	. </returns>
 */
int32 TaskHTTPExport::CB_HeaderReceived( void *systemData, void *userData ) {
	TaskHTTPExport *httpExport = (TaskHTTPExport*) userData;

	// Update export task
	httpExport->bRequestPending = false;
	httpExport->sendBuffer.clear();
	httpExport->sendBuffer << "a=a";
	httpExport->UpdateProgress( (int) (100.0 / (float) httpExport->GetFileSize() * (float) httpExport->GetBytesRead()) );

	return 0;
}

/**
 * <summary>	Internal function for sending the POST data to the server. </summary>
 *
 * <remarks>	Wkoller, 17.03.2011. </remarks>
 */
void TaskHTTPExport::sendData() {
	this->sendBuffer << "&trackUUID=" << this->GetUUID().c_str();

	this->bRequestPending = true;
	this->http->Post( this->targetURL.c_str(), this->sendBuffer.str().c_str(), strlen( this->sendBuffer.str().c_str() ), &TaskHTTPExport::CB_HeaderReceived, this );
}
