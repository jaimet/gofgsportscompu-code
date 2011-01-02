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

#include "TaskTCXExport.h"

TaskTCXExport::TaskTCXExport( std::string p_fileName, std::string p_exportFileName ) : Task(), TrackReader() {
	this->currentPoint = NULL;
	this->trackNode = NULL;
	this->lapNode = NULL;
	this->lastProgressUpdate = 0;

	// Prepare the track reader part
	this->SetFile( (char*) p_fileName.c_str() );

	this->exportFileName = p_exportFileName;
}

void TaskTCXExport::Start() {
	// Start with the XML declaration
	doc.LinkEndChild( new TiXmlDeclaration( "1.0", "", "" ) );

	// We need the first data point for time etc.
	this->currentPoint = this->ReadNextPoint();
	// Create the preface
	if( this->currentPoint != NULL ) {
		// Format the start time into a readable string
		char startTimeString[25];
		int startTime = this->GetStartTime();
		tm *stInfo = gmtime( (time_t *) &startTime );
		strftime( startTimeString, 25, "%Y-%m-%dT%H:%M:%SZ", stInfo );

		// Create top-level node
		TiXmlElement *topNode = new TiXmlElement( "TrainingCenterDatabase" );
		topNode->SetAttribute( "xmlns", "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" );
		topNode->SetAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
		topNode->SetAttribute( "xsi:schemaLocation", "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" );
		doc.LinkEndChild( topNode );

		// Add all required informational nodes
		TiXmlElement *athleteNode = new TiXmlElement( "Activities" );
		topNode->LinkEndChild( athleteNode );
	
		//2002-05-30T09:30:10Z
		TiXmlElement *activityNode = new TiXmlElement( "Activity" );
		activityNode->SetAttribute( "Sport", "Biking" );
		//activityNode->SetAttribute( "Id", time( NULL ) );
		//activityNode->SetAttribute( "StartTime", startTimeString );
		athleteNode->LinkEndChild( activityNode );

		TiXmlElement *idNode = new TiXmlElement( "Id" );
		idNode->LinkEndChild( new TiXmlText( this->GetUUID().c_str() ) );
		activityNode->LinkEndChild( idNode );

		this->lapNode = new TiXmlElement( "Lap" );
		this->lapNode->SetAttribute( "StartTime", startTimeString );
		activityNode->LinkEndChild( this->lapNode );

		this->trackNode = new TiXmlElement( "Track" );
		trackNode->SetAttribute( "StartTime", startTimeString );
	}
}

int TaskTCXExport::Next() {
	// Check if we have a remaining point
	if( this->currentPoint == NULL ) return -1;

	this->trackNode->LinkEndChild( this->CreateTCXPoint() );

	// Check if we have to anounce the progress
	int newProgress = (int) ( 100.0 / (float) this->GetFileSize() * (float) this->GetBytesRead() );
	if( newProgress > this->lastProgressUpdate ) {
		this->UpdateProgress( newProgress );
		this->lastProgressUpdate = newProgress;
	}

	// Read the next point
	// We need the check here because Stop() also references currentPoint so it MUST NOT be NULL
	DataPoint *newPoint = this->ReadNextPoint();
	if( newPoint == NULL ) return -1;
	this->currentPoint = newPoint;

	return 1;
}

void TaskTCXExport::Stop() {
	char formatBuffer[15];

	// Check if we have at least one data point
	if( this->currentPoint != NULL ) {
		// Write total duration
		TiXmlElement *ttsNode = new TiXmlElement( "TotalTimeSeconds" );
		sprintf( formatBuffer, "%d", this->currentPoint->unixtime - this->GetStartTime() );
		ttsNode->LinkEndChild( new TiXmlText( formatBuffer ) );
		this->lapNode->LinkEndChild( ttsNode );
		// Write total distance
		TiXmlElement *distNode = new TiXmlElement( "DistanceMeters" );
		sprintf( formatBuffer, "%.2f", this->currentPoint->dist );
		distNode->LinkEndChild( new TiXmlText( formatBuffer ) );
		this->lapNode->LinkEndChild( distNode );

		// Finally link the track
		this->lapNode->LinkEndChild( trackNode );

		// Save XML
		if( !doc.SaveFile( this->exportFileName.c_str() ) ) {
			this->UpdateProgress( -1 );
			return;
		}
	}

	// We are done
	this->UpdateProgress( 100 );

	// Close file
	this->CloseFile();
	// Clear doc
	doc.Clear();
}

// Create a new Fitlog Xml-Element out of the current (internal) datapoint
TiXmlElement *TaskTCXExport::CreateTCXPoint() {
	char myBuf[25];

	// Create root trackpoint node
	TiXmlElement *ptNode = new TiXmlElement( "Trackpoint" );

	// Add time node
	TiXmlElement *timeNode = new TiXmlElement( "Time" );
	tm *stInfo = gmtime( (time_t *) &this->currentPoint->unixtime );
	strftime( myBuf, 25, "%Y-%m-%dT%H:%M:%SZ", stInfo );
	timeNode->LinkEndChild( new TiXmlText( myBuf ) );
	ptNode->LinkEndChild( timeNode );

	// Add position node
	TiXmlElement *positionNode = new TiXmlElement( "Position" );
	ptNode->LinkEndChild( positionNode );
	// Add lat & lon information nodes
	TiXmlElement *latNode = new TiXmlElement( "LatitudeDegrees" );
	sprintf( myBuf, "%.9f", this->currentPoint->lat );
	latNode->LinkEndChild( new TiXmlText( myBuf ) );
	positionNode->LinkEndChild( latNode );
	TiXmlElement *lonNode = new TiXmlElement( "LongitudeDegrees" );
	sprintf( myBuf, "%.9f", this->currentPoint->lon );
	lonNode->LinkEndChild( new TiXmlText( myBuf ) );
	positionNode->LinkEndChild( lonNode );

	// Add altitude node
	TiXmlElement *altNode = new TiXmlElement( "AltitudeMeters" );
	sprintf( myBuf, "%.2f", this->currentPoint->alt );
	altNode->LinkEndChild( new TiXmlText( myBuf ) );
	ptNode->LinkEndChild( altNode );

	// Add distance node
	TiXmlElement *distNode = new TiXmlElement( "DistanceMeters" );
	sprintf( myBuf, "%.2f", this->currentPoint->dist );
	distNode->LinkEndChild( new TiXmlText( myBuf ) );
	ptNode->LinkEndChild( distNode );

	// Add heart-rate node
	TiXmlElement *hrNode = new TiXmlElement( "HeartRateBpm" );
	hrNode->SetAttribute( "xsi:type", "HeartRateInBeatsPerMinute_t" );
	ptNode->LinkEndChild( hrNode );
	TiXmlElement *hrvalNode = new TiXmlElement( "Value" );
	sprintf( myBuf, "%d", this->currentPoint->hr );
	hrvalNode->LinkEndChild( new TiXmlText( myBuf ) );
	hrNode->LinkEndChild( hrvalNode );

	// We are done, return node
	return ptNode;
}
