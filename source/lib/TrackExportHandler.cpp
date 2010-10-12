#include "TrackExportHandler.h"

TrackExportHandler *TrackExportHandler::mySelf = NULL;

// Singleton getter
TrackExportHandler *TrackExportHandler::Self() {
	if( TrackExportHandler::mySelf == NULL ) {
		TrackExportHandler::mySelf = new TrackExportHandler();
	}

	return TrackExportHandler::mySelf;
}

void TrackExportHandler::exportToTCX( char *fileName ) {
}

/*
	Export a given Track to the FitLog Format
	TODO: Add error handling for file operations
*/
void TrackExportHandler::exportToFitlog( char *fileName, char *fitlogName ) {
	s3eFile *inFile = s3eFileOpen( fileName, "r" );

	TiXmlDocument doc;
	TiXmlDeclaration *decl = new TiXmlDeclaration( "1.0", "", "" );
	doc.LinkEndChild( decl );

	TiXmlElement *rootNode = new TiXmlElement( "FitnessWorkbook" );
	rootNode->SetAttribute( "xmlns", "http://www.zonefivesoftware.com/xmlschemas/FitnessLogbook/v2" );
	rootNode->SetAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
	rootNode->SetAttribute( "xmlns:xsd", "http://www.w3.org/2001/XMLSchema" );
	doc.LinkEndChild( rootNode );

	char myBuf[BUFFER_SIZE];
	while( s3eFileReadString( myBuf, BUFFER_SIZE, inFile ) != NULL ) {
		// Start splitting the data line
		char *token = strtok( myBuf, ";" );
		int recordType = atoi( token );
		char *data = strtok( NULL, ";" );

		switch( recordType ) {
		// Time data-point
		case 1:
			// Check if this is already the timestamp of the next data-point
			if( this->dataPoint.unixtime != 0 ) {
				rootNode->LinkEndChild( this->createFitlogPoint() );

				// Reset the data point
				this->dataPoint.reset();
			}

			// Save new timestamp
			this->dataPoint.unixtime = atoi( data );
			break;
		// Position data-point
		case 2:
			token = strtok( data, ":" );
			this->dataPoint.lat = atof( token );
			token = strtok( NULL, ":" );
			this->dataPoint.lon = atof( token );
			token = strtok( NULL, ":" );
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
	// Add last data-point
	rootNode->LinkEndChild( this->createFitlogPoint() );

	// Close file
	s3eFileClose( inFile );

	// Save XML
	doc.SaveFile( fitlogName );
}

// Create a new Fitlog Xml-Element out of the current (internal) datapoint
TiXmlElement *TrackExportHandler::createFitlogPoint() {
	TiXmlElement *ptNode = new TiXmlElement( "pt" );
	ptNode->SetAttribute( "tm", this->dataPoint.unixtime );
	ptNode->SetDoubleAttribute( "lat", this->dataPoint.lat );
	ptNode->SetDoubleAttribute( "lon", this->dataPoint.lon );
	ptNode->SetDoubleAttribute( "ele", this->dataPoint.alt );
	ptNode->SetDoubleAttribute( "dist", this->dataPoint.dist );
	ptNode->SetAttribute( "hr", this->dataPoint.hr );

	return ptNode;
}

TrackExportHandler::TrackExportHandler() {
}
