#include "TrackExportHandler.h"

template<>
TrackExportHandler *Singleton<TrackExportHandler>::mySelf = NULL;

/*
	TODO: Add TCX Export
*/
void TrackExportHandler::exportToTCX( char *fileName, char *tcxName ) {
	char myBuf[BUFFER_SIZE];

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
	s3eFileSeekOrigin();

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
				trackNode->LinkEndChild( this->createTCXPoint( startTime ) );

				// Reset the data point
				this->dataPoint.reset();
			}

			// Save new timestamp
			this->dataPoint.unixtime = atoi( data ) - startTime;
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
	trackNode->LinkEndChild( this->createTCXPoint(startTime) );

	// Write total duration
	TiXmlElement *ttsNode = new TiXmlElement( "TotalTimeSeconds" );
	sprintf( myBuf, "%d", this->dataPoint.unixtime );
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
	doc.SaveFile( tcxName );
}

/*
	Export a given Track to the FitLog Format
	TODO: Add error handling for file operations & data conversions / splitting / etc.
*/
void TrackExportHandler::exportToFitlog( char *fileName, char *fitlogName ) {
	char myBuf[BUFFER_SIZE];

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
	s3eFileSeekOrigin();

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
				trackNode->LinkEndChild( this->createFitlogPoint() );

				// Reset the data point
				this->dataPoint.reset();
			}

			// Save new timestamp
			this->dataPoint.unixtime = atoi( data ) - startTime;
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
	trackNode->LinkEndChild( this->createFitlogPoint() );

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

// Create a new Fitlog Xml-Element out of the current (internal) datapoint
TiXmlElement *TrackExportHandler::createTCXPoint( int startTime ) {
	char myBuf[25];

	// Create root trackpoint node
	TiXmlElement *ptNode = new TiXmlElement( "Trackpoint" );

	// Add time node
	TiXmlElement *timeNode = new TiXmlElement( "Time" );
	int currTime = startTime + this->dataPoint.unixtime;
	tm *stInfo = gmtime( (time_t *) &currTime );
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
TrackExportHandler::TrackExportHandler() {
}