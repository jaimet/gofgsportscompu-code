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

#include "TrackExportHandler.h"

template<>
TrackExportHandler *Singleton<TrackExportHandler>::mySelf = NULL;

int TrackExportHandler::ReadNextPoint( s3eFile *inFile ) {
	static int next_unixtime = 0;

	// Reset the current dataPoint
	this->dataPoint.reset();

	// Store unixtime from last call in the datapoint reference
	this->dataPoint.unixtime = next_unixtime;
	
	// Buffer for reading the file content
	char myBuf[BUFFER_SIZE];
	// Count the bytes read from the file (to return them)
	int bytesRead = 0;

	while( s3eFileReadString( myBuf, BUFFER_SIZE, inFile ) != NULL ) {
		bytesRead += strlen(myBuf);

		// Start splitting the data line
		char *token = strtok( myBuf, ";" );
		if( token == NULL ) {
			this->announceProgress( 0, "Invalid Data-Line found (No recordType)" );
			return -1;
		}
		int recordType = atoi( token );
		// Now get the data-part
		char *data = strtok( NULL, ";" );
		if( data == NULL ) {
			this->announceProgress( 0, "Invalid Data-Line found (No data)" );
			return -1;
		}

		switch( recordType ) {
		// Time data-point
		case 1:
			// Save new timestamp
			next_unixtime = atoi( data );

			// Check if this is already the timestamp of the next data-point
			if( this->dataPoint.unixtime != 0 ) {
				return bytesRead;
			}
			break;
		// Position data-point
		case 2:
			token = strtok( data, ":" );
			if( token == NULL ) {
				this->announceProgress( 0, "Invalid Position info found (no lat)" );
				return -1;
			}
			this->dataPoint.lat = atof( token );
			token = strtok( NULL, ":" );
			if( token == NULL ) {
				this->announceProgress( 0, "Invalid Position info found (no lon)" );
				return -1;
			}
			this->dataPoint.lon = atof( token );
			token = strtok( NULL, ":" );
			if( token == NULL ) {
				this->announceProgress( 0, "Invalid Position info found (no alt)" );
				return -1;
			}
			this->dataPoint.alt = atof( token );
			break;
		// Distance data-point
		case 4:
			this->dataPoint.dist = atof( data );
			break;
		// This should never happen...
		default:
			break;
		}
	}

	return 0;
}

/*
	Add TCX Export
	TODO: Add file I/O error handling
*/
void TrackExportHandler::exportToTCX( char *fileName, char *tcxName ) {
	char myBuf[BUFFER_SIZE];

	// Reset progress
	this->announceProgress( 0 );

	// Read first line of file to get the start time
	s3eFile *inFile = s3eFileOpen( fileName, "r" );
	s3eFileReadString( myBuf, BUFFER_SIZE, inFile );
	char *timeData = strstr( myBuf, ";" );
	timeData++;
	int startTime = atoi( timeData );
	// Create a formatted time string out of it
	tm *stInfo = gmtime( (time_t *) &startTime );
	char startTimeString[25];
	strftime( startTimeString, 25, "%Y-%m-%dT%H:%M:%SZ", stInfo );

	// Rewind back to the start
	s3eFileSeek( inFile, 0, S3E_FILESEEK_SET );
	// Get the size of the file
	int32 totalBytes = s3eFileGetSize( inFile );
	int32 bytesRead = 0;

	// Start reading the document
	TiXmlDocument doc;
	TiXmlDeclaration *decl = new TiXmlDeclaration( "1.0", "", "" );
	doc.LinkEndChild( decl );

	TiXmlElement *topNode = new TiXmlElement( "TrainingCenterDatabase" );
	topNode->SetAttribute( "xmlns", "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" );
	topNode->SetAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
	topNode->SetAttribute( "xsi:schemaLocation", "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" );
	doc.LinkEndChild( topNode );

	TiXmlElement *athleteNode = new TiXmlElement( "Activities" );
	topNode->LinkEndChild( athleteNode );
	
	//2002-05-30T09:30:10Z
	TiXmlElement *activityNode = new TiXmlElement( "Activity" );
	activityNode->SetAttribute( "Sport", "Biking" );
	//activityNode->SetAttribute( "Id", time( NULL ) );
	//activityNode->SetAttribute( "StartTime", startTimeString );
	athleteNode->LinkEndChild( activityNode );

	TiXmlElement *idNode = new TiXmlElement( "Id" );
	idNode->LinkEndChild( new TiXmlText( startTimeString ) );
	activityNode->LinkEndChild( idNode );

	TiXmlElement *lapNode = new TiXmlElement( "Lap" );
	lapNode->SetAttribute( "StartTime", startTimeString );
	activityNode->LinkEndChild( lapNode );

	TiXmlElement *trackNode = new TiXmlElement( "Track" );
	trackNode->SetAttribute( "StartTime", startTimeString );

	int lastProgress = 0;
	while( 1 ) {
		int currBytes = this->ReadNextPoint( inFile );

		// Successful read
		if( currBytes > 0 ) {
			bytesRead += currBytes;

			trackNode->LinkEndChild( this->createTCXPoint() );
		}
		// <0 Only occurs if there was an error
		else if( currBytes < 0 ) {
			s3eFileClose( inFile );
			return;
		}
		// If the function returns 0, we are at the end of the file
		else {
			break;
		}

		// Update progress
		int currProgress = (int) (100.0 / (float) totalBytes * (float) bytesRead);
		// Only update the progress on full percentage changes
		if( currProgress > lastProgress ) {
			this->announceProgress( (int) (100.0 / (float) totalBytes * (float) bytesRead) );

			lastProgress = currProgress;
		}
	}
	// Add last data-point
	trackNode->LinkEndChild( this->createTCXPoint() );

	// Write total duration
	TiXmlElement *ttsNode = new TiXmlElement( "TotalTimeSeconds" );
	sprintf( myBuf, "%d", this->dataPoint.unixtime - startTime );
	ttsNode->LinkEndChild( new TiXmlText( myBuf ) );
	lapNode->LinkEndChild( ttsNode );
	// Write total distance
	TiXmlElement *distNode = new TiXmlElement( "DistanceMeters" );
	sprintf( myBuf, "%.2f", this->dataPoint.dist );
	distNode->LinkEndChild( new TiXmlText( myBuf ) );
	lapNode->LinkEndChild( distNode );

	// Finally link the track
	lapNode->LinkEndChild( trackNode );

	// Close file
	s3eFileClose( inFile );

	// Save XML
	if( !doc.SaveFile( tcxName ) ) {
		this->announceProgress( 0, "Error writing output file" );
		return;
	}

	// We are done
	this->announceProgress( 100 );
}

/*
	Export a given Track to the FitLog Format
*/
void TrackExportHandler::exportToFitlog( char *fileName, char *fitlogName ) {
	char myBuf[BUFFER_SIZE];
	char *operationReturn = NULL;

	// Reset progress
	this->announceProgress( 0 );

	// Read first line of file to get the start time
	s3eFile *inFile = s3eFileOpen( fileName, "r" );
	// Check if we have a valid 
	if( inFile == NULL ) {
		this->announceProgress( 0, "Error opening input File" );
		return;
	}
	// Read the first line
	operationReturn = s3eFileReadString( myBuf, BUFFER_SIZE, inFile );
	if( operationReturn == NULL ) {
		this->announceProgress( 0, "Error Reading Initial Data" );
		s3eFileClose( inFile );
		return;
	}
	// Extract the pure time-data
	char *timeData = strstr( myBuf, ";" );
	timeData++;
	int startTime = atoi( timeData );
	// Create a formatted time string out of it
	tm *stInfo = gmtime( (time_t *) &startTime );
	char startTimeString[25];
	strftime( startTimeString, 25, "%Y-%m-%dT%H:%M:%SZ", stInfo );

	// Rewind back to the start
	s3eFileSeek( inFile, 0, S3E_FILESEEK_SET );
	// Get the size of the file
	int32 totalBytes = s3eFileGetSize( inFile );
	int32 bytesRead = 0;

	// Start reading the document
	TiXmlDocument doc;
	TiXmlDeclaration *decl = new TiXmlDeclaration( "1.0", "", "" );
	doc.LinkEndChild( decl );

	TiXmlElement *topNode = new TiXmlElement( "FitnessWorkbook" );
	topNode->SetAttribute( "xmlns", "http://www.zonefivesoftware.com/xmlschemas/FitnessLogbook/v2" );
	topNode->SetAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
	topNode->SetAttribute( "xmlns:xsd", "http://www.w3.org/2001/XMLSchema" );
	doc.LinkEndChild( topNode );

	TiXmlElement *athleteNode = new TiXmlElement( "AthleteLog" );
	topNode->LinkEndChild( athleteNode );
	
	//2002-05-30T09:30:10Z
	TiXmlElement *activityNode = new TiXmlElement( "Activity" );
	activityNode->SetAttribute( "Id", time( NULL ) );
	activityNode->SetAttribute( "StartTime", startTimeString );
	athleteNode->LinkEndChild( activityNode );

	TiXmlElement *trackNode = new TiXmlElement( "Track" );
	trackNode->SetAttribute( "StartTime", startTimeString );
	activityNode->LinkEndChild( trackNode );

	int lastProgress = 0;
	while( 1 ) {
		int currBytes = this->ReadNextPoint( inFile );

		// Successful read
		if( currBytes > 0 ) {
			bytesRead += currBytes;

			trackNode->LinkEndChild( this->createFitlogPoint( startTime ) );
		}
		// <0 Only occurs if there was an error
		else if( currBytes < 0 ) {
			s3eFileClose( inFile );
			return;
		}
		// If the function returns 0, we are at the end of the file
		else {
			break;
		}

		// Update progress
		int currProgress = (int) (100.0 / (float) totalBytes * (float) bytesRead);
		// Only update the progress on full percentage changes
		if( currProgress > lastProgress ) {
			this->announceProgress( (int) (100.0 / (float) totalBytes * (float) bytesRead) );

			lastProgress = currProgress;
		}
	}
	// Add last data-point
	trackNode->LinkEndChild( this->createFitlogPoint( startTime ) );

	// Close file
	s3eFileClose( inFile );

	// Save XML
	if( !doc.SaveFile( fitlogName ) ) {
		this->announceProgress( 0, "Error writing output file" );
		return;
	}

	// We are done
	this->announceProgress( 100 );
}

// Create a new Fitlog Xml-Element out of the current (internal) datapoint
TiXmlElement *TrackExportHandler::createFitlogPoint( int startTime ) {
	TiXmlElement *ptNode = new TiXmlElement( "pt" );
	ptNode->SetAttribute( "tm", this->dataPoint.unixtime - startTime );
	ptNode->SetDoubleAttribute( "lat", this->dataPoint.lat );
	ptNode->SetDoubleAttribute( "lon", this->dataPoint.lon );
	ptNode->SetDoubleAttribute( "ele", this->dataPoint.alt );
	ptNode->SetDoubleAttribute( "dist", this->dataPoint.dist );
	ptNode->SetAttribute( "hr", this->dataPoint.hr );

	return ptNode;
}

// Create a new Fitlog Xml-Element out of the current (internal) datapoint
TiXmlElement *TrackExportHandler::createTCXPoint() {
	char myBuf[25];

	// Create root trackpoint node
	TiXmlElement *ptNode = new TiXmlElement( "Trackpoint" );

	// Add time node
	TiXmlElement *timeNode = new TiXmlElement( "Time" );
	tm *stInfo = gmtime( (time_t *) &this->dataPoint.unixtime );
	strftime( myBuf, 25, "%Y-%m-%dT%H:%M:%SZ", stInfo );
	timeNode->LinkEndChild( new TiXmlText( myBuf ) );
	ptNode->LinkEndChild( timeNode );

	// Add position node
	TiXmlElement *positionNode = new TiXmlElement( "Position" );
	ptNode->LinkEndChild( positionNode );
	// Add lat & lon information nodes
	TiXmlElement *latNode = new TiXmlElement( "LatitudeDegrees" );
	sprintf( myBuf, "%.9f", this->dataPoint.lat );
	latNode->LinkEndChild( new TiXmlText( myBuf ) );
	positionNode->LinkEndChild( latNode );
	TiXmlElement *lonNode = new TiXmlElement( "LongitudeDegrees" );
	sprintf( myBuf, "%.9f", this->dataPoint.lon );
	lonNode->LinkEndChild( new TiXmlText( myBuf ) );
	positionNode->LinkEndChild( lonNode );

	// Add altitude node
	TiXmlElement *altNode = new TiXmlElement( "AltitudeMeters" );
	sprintf( myBuf, "%.2f", this->dataPoint.alt );
	altNode->LinkEndChild( new TiXmlText( myBuf ) );
	ptNode->LinkEndChild( altNode );

	// Add distance node
	TiXmlElement *distNode = new TiXmlElement( "DistanceMeters" );
	sprintf( myBuf, "%.2f", this->dataPoint.dist );
	distNode->LinkEndChild( new TiXmlText( myBuf ) );
	ptNode->LinkEndChild( distNode );

	// Add heart-rate node
	TiXmlElement *hrNode = new TiXmlElement( "HeartRateBpm" );
	hrNode->SetAttribute( "xsi:type", "HeartRateInBeatsPerMinute_t" );
	ptNode->LinkEndChild( hrNode );
	TiXmlElement *hrvalNode = new TiXmlElement( "Value" );
	sprintf( myBuf, "%d", this->dataPoint.hr );
	hrvalNode->LinkEndChild( new TiXmlText( myBuf ) );
	hrNode->LinkEndChild( hrvalNode );

	// We are done, return node
	return ptNode;
}

void TrackExportHandler::SetProgressCallback( s3eCallback p_progressCallback ) {
	this->progressCallback = p_progressCallback;
}

// Calls the progress callback with the current progress
void TrackExportHandler::announceProgress( int percent, char *message ) {
	if( this->progressCallback != NULL ) {
		iwfixed progress = IW_FIXED( (float)percent / 100.0 );

		(*progressCallback)( &progress, message );
	}
}

TrackExportHandler::TrackExportHandler() {
	this->progressCallback = NULL;
}
