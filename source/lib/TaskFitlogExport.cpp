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

#include "TaskFitlogExport.h"

TaskFitlogExport::TaskFitlogExport( std::string p_fileName, std::string p_exportFileName ) : Task(), TrackReader() {
	this->currentPoint = NULL;
	this->trackNode = NULL;
	this->lastProgressUpdate = 0;

	// Prepare the track reader part
	this->SetFile( (char*) p_fileName.c_str() );

	this->exportFileName = p_exportFileName;
}

void TaskFitlogExport::Start() {
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
		TiXmlElement *topNode = new TiXmlElement( "FitnessWorkbook" );
		topNode->SetAttribute( "xmlns", "http://www.zonefivesoftware.com/xmlschemas/FitnessLogbook/v2" );
		topNode->SetAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
		topNode->SetAttribute( "xmlns:xsd", "http://www.w3.org/2001/XMLSchema" );
		doc.LinkEndChild( topNode );

		TiXmlElement *athleteNode = new TiXmlElement( "AthleteLog" );
		topNode->LinkEndChild( athleteNode );

		TiXmlElement *activityNode = new TiXmlElement( "Activity" );
		activityNode->SetAttribute( "Id", this->GetUUID().c_str() );
		activityNode->SetAttribute( "StartTime", startTimeString );
		athleteNode->LinkEndChild( activityNode );

		this->trackNode = new TiXmlElement( "Track" );
		trackNode->SetAttribute( "StartTime", startTimeString );
		activityNode->LinkEndChild( trackNode );
	}
}

int TaskFitlogExport::Next() {
	// Check if we have a remaining point
	if( this->currentPoint == NULL ) return -1;

	this->trackNode->LinkEndChild( this->CreateFitlogPoint() );

	// Check if we have to anounce the progress
	int newProgress = (int) ( 100.0 / (float) this->GetFileSize() * (float) this->GetBytesRead() );
	if( newProgress > this->lastProgressUpdate ) {
		this->UpdateProgress( newProgress );
		this->lastProgressUpdate = newProgress;
	}

	// Read the next point
	DataPoint *newPoint = this->ReadNextPoint();
	if( newPoint == NULL ) return -1;
	
	this->currentPoint = newPoint;

	return 1;
}

void TaskFitlogExport::Stop() {
	// Save XML
	if( !doc.SaveFile( this->exportFileName.c_str() ) ) {
		this->UpdateProgress( -1 );
		return;
	}

	// We are done
	this->UpdateProgress( 100 );

	// Close file
	this->CloseFile();
	// Clear doc
	doc.Clear();
}

TiXmlElement *TaskFitlogExport::CreateFitlogPoint() {
	TiXmlElement *ptNode = new TiXmlElement( "pt" );
	ptNode->SetAttribute( "tm", this->currentPoint->unixtime - this->GetStartTime() );
	ptNode->SetDoubleAttribute( "lat", this->currentPoint->lat );
	ptNode->SetDoubleAttribute( "lon", this->currentPoint->lon );
	ptNode->SetDoubleAttribute( "ele", this->currentPoint->alt );
	ptNode->SetDoubleAttribute( "dist", this->currentPoint->dist );
	ptNode->SetAttribute( "hr", this->currentPoint->hr );

	return ptNode;
}
