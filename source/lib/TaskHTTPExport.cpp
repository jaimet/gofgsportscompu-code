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

TaskHTTPExport::TaskHTTPExport( char *p_filename ) : Task(), TrackReader() {
	this->http = new CIwHTTP();
	this->sequence = 0;

	// Prepare the track reader part
	this->SetFile( p_filename );
}

void TaskHTTPExport::Start() {
}

int TaskHTTPExport::Next() {
	DataPoint *myPoint = this->ReadNextPoint();
	if( myPoint == NULL ) {
		return -1;
	}

	// Format the post body
	sprintf( this->sendBuffer, "sequence=%d&unixtime=%d&lat=%.4f&lon=%.4f&alt=%.4f&distance=%.2f&speed=%.2f&hr=%d", this->sequence++, myPoint->unixtime, myPoint->lat, myPoint->lon, myPoint->alt, myPoint->dist, myPoint->speed, myPoint->hr );
	this->http->Post( "http://www.senegate.at/post_test.php", this->sendBuffer, strlen( this->sendBuffer ), NULL, NULL );

	return 1;
}

void TaskHTTPExport::Stop() {
	this->CloseFile();
}
