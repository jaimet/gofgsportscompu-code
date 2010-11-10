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

#include "TrackReader.h"

template<>
TrackReader *Singleton<TrackReader>::mySelf = NULL;

DataPoint *TrackReader::ReadNextPoint() {
	static int next_unixtime = 0;

	// Reset the current dataPoint
	this->dataPoint->reset();

	// Store unixtime from last call in the datapoint reference
	this->dataPoint->unixtime = next_unixtime;
	
	// Buffer for reading the file content
	char myBuf[BUFFER_SIZE];

	while( s3eFileReadString( myBuf, BUFFER_SIZE, this->inFile ) != NULL ) {
		bytesRead += strlen(myBuf);

		// Start splitting the data line
		char *token = strtok( myBuf, ";" );
		if( token == NULL ) {
			return NULL;
		}
		int recordType = atoi( token );
		// Now get the data-part
		char *data = strtok( NULL, ";" );
		if( data == NULL ) {
			return NULL;
		}

		switch( recordType ) {
		// Time data-point
		case 1:
			// Save new timestamp
			next_unixtime = atoi( data );

			// Check if this is already the timestamp of the next data-point
			if( this->dataPoint->unixtime != 0 ) {
				return this->dataPoint;
			}
			// This is the first datapoint
			else {
				this->dataPoint->unixtime = next_unixtime;
			}
			break;
		// Position data-point
		case 2:
			token = strtok( data, ":" );
			if( token == NULL ) {
				return NULL;
			}
			this->dataPoint->lat = atof( token );
			token = strtok( NULL, ":" );
			if( token == NULL ) {
				return NULL;
			}
			this->dataPoint->lon = atof( token );
			token = strtok( NULL, ":" );
			if( token == NULL ) {
				return NULL;
			}
			this->dataPoint->alt = atof( token );
			break;
		// Distance data-point
		case 4:
			this->dataPoint->dist = atof( data );
			break;
		// This should never happen...
		default:
			break;
		}
	}

	return NULL;
}

bool TrackReader::SetFile( char *p_fileName ) {
	this->inFile = s3eFileOpen( p_fileName, "r" );
	// Check if we have a valid file
	if( inFile != NULL ) {
		return true;
	}

	return false;
}

void TrackReader::CloseFile() {
	s3eFileClose( this->inFile );
}

int TrackReader::GetFileSize() {
	if( this->inFile == NULL ) return -1;

	return s3eFileGetSize( this->inFile );
}

TrackReader::TrackReader() {
	this->dataPoint = new DataPoint();
	this->inFile = NULL;
	this->bytesRead = 0;
}
