/*
* Copyright (C) 2011 Wolfgang Koller
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

#include "TaskGPXExport.h"

TaskGPXExport::TaskGPXExport( std::string p_fileName, std::string p_exportFileName ) : TaskFileExport( p_fileName, p_exportFileName ) {
	//this->lastProgressUpdate = 0;
	this->trksegNode = NULL;
}

void TaskGPXExport::Start() {
	// Start with the XML declaration
	doc.LinkEndChild( new TiXmlDeclaration( "1.0", "UTF-8", "" ) );

	// Create top level GPX node
	TiXmlElement *gpxNode = new TiXmlElement( "gpx" );
	gpxNode->SetAttribute( "version", "1.1" );
	gpxNode->SetAttribute( "creator", "GOFG Sports Computer (http://www.gofg.at/)" );
	doc.LinkEndChild( gpxNode );

	// Now create the metadata info
	TiXmlElement *metadataNode = new TiXmlElement( "metadata" );
	gpxNode->LinkEndChild( metadataNode );
	// Add name of gpx file
	TiXmlElement *mdInfoNode = new TiXmlElement( "name" );
	mdInfoNode->LinkEndChild( new TiXmlText( this->exportFileName.c_str() ) );
	metadataNode->LinkEndChild( mdInfoNode );
	// Add author info
	TiXmlElement *mdAuthorNode = new TiXmlElement( "author" );
	TiXmlElement *mdAuthorInfoNode = new TiXmlElement( "name" );
	mdAuthorInfoNode->LinkEndChild( new TiXmlText( "GOFG Sports Computer" ) );
	mdAuthorNode->LinkEndChild( mdAuthorInfoNode );
	mdAuthorInfoNode = new TiXmlElement( "link" );
	mdAuthorInfoNode->SetAttribute( "href", "http://www.gofg.at/" );
	mdAuthorNode->LinkEndChild( mdAuthorInfoNode );
	metadataNode->LinkEndChild( mdAuthorNode );
	// Add time info
	TiXmlElement *mdTimeNode = new TiXmlElement( "time" );
	mdTimeNode->LinkEndChild( new TiXmlText( "" ) );
	metadataNode->LinkEndChild( mdTimeNode );

	// Add the top-level track element
	TiXmlElement *trkNode = new TiXmlElement( "trk" );
	gpxNode->LinkEndChild( trkNode );
	// Now add the track-segment node which we will use for further processing
	this->trksegNode = new TiXmlElement( "trkseg" );
	trkNode->LinkEndChild( trksegNode );
}

int TaskGPXExport::Next() {
	// Read next point
	this->currentPoint = this->ReadNextPoint();

	// Check if we have a remaining point
	if( this->currentPoint == NULL ) return -1;

	this->trksegNode->LinkEndChild( this->CreateGPXPoint() );

	// Check if we have to anounce the progress
	this->UpdateProgress( (int) ( 100.0 / (float) this->GetFileSize() * (float) this->GetBytesRead() ) );
	/*int newProgress = (int) ( 100.0 / (float) this->GetFileSize() * (float) this->GetBytesRead() );
	if( newProgress > this->lastProgressUpdate ) {
		this->UpdateProgress( newProgress );
		this->lastProgressUpdate = newProgress;
	}*/

	return 1;
}

void TaskGPXExport::Stop() {
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

// Create a new GPX Xml-Element out of the current (internal) datapoint
TiXmlElement *TaskGPXExport::CreateGPXPoint() {
	char myBuf[25];
	std::ostringstream formatBuffer;

	// Create main track-point
	TiXmlElement *trkptNode = new TiXmlElement( "trkpt" );
	formatBuffer.str("");
	formatBuffer << std::setprecision( 9 ) << this->currentPoint->lat / M_PI * 180.0;
	trkptNode->SetAttribute( "lat", formatBuffer.str().c_str() );
	formatBuffer.str("");
	formatBuffer << std::setprecision( 9 ) << this->currentPoint->lon / M_PI * 180.0;
	trkptNode->SetAttribute( "lon", formatBuffer.str().c_str() );

	// Create elevation info
	TiXmlElement *eleNode = new TiXmlElement( "ele" );
	formatBuffer.str("");
	formatBuffer << this->currentPoint->alt;
	eleNode->LinkEndChild( new TiXmlText( formatBuffer.str().c_str() ) );
	trkptNode->LinkEndChild( eleNode );

	// Add time node
	TiXmlElement *timeNode = new TiXmlElement( "time" );
	tm *stInfo = gmtime( (time_t *) &this->currentPoint->unixtime );
	strftime( myBuf, 25, "%Y-%m-%dT%H:%M:%SZ", stInfo );
	timeNode->LinkEndChild( new TiXmlText( myBuf ) );
	trkptNode->LinkEndChild( timeNode );

	// We are done, return node
	return trkptNode;
}
