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

#include "TaskFileExport.h"

TaskFileExport::TaskFileExport( std::string p_fileName, std::string p_exportFileName ) : Task(), TrackReader() {
	this->currentPoint = NULL;
	this->exportFileName = p_exportFileName;

	// Prepare the track reader part
	this->SetFile( p_fileName );
}

TaskFileExport::~TaskFileExport() {
	// Check if we are on an iphone, if yes we have to send the file per mail
	if( s3eDeviceGetInt( S3E_DEVICE_OS ) == S3E_OS_ID_IPHONE ) {
		std::string exportEmail = SettingsHandler::Self()->GetString( "ExportEmail" );
		if( exportEmail.length() <= 0 ) {
			this->UpdateProgress( 0, "Please specify an email address in the settings dialog first!" );
		}
		else {
			s3eEMail *email = new s3eEMail();
			email->m_subject = "[GOFG Sports Computer] Export Email";
			email->m_messageBody = "Please find attached the exported track file.";
			email->m_isHTML = false;
			const char *recipient = exportEmail.c_str();
			email->m_toRecipients = &recipient;
			email->m_numToRecipients = 1;
			email->m_numCcRecipients = 0;
			email->m_numBccRecipients = 0;
			email->m_numAttachments = 1;
	
			s3eEMailAttachment *attachment = new s3eEMailAttachment();
			attachment->m_fileName = this->exportFileName.c_str();
			attachment->m_mimeType = "text/plain";
			
			// Open output file for reading
			s3eFile *exportFile = s3eFileOpen( this->exportFileName.c_str(), "r" );
			int32 fileSize = s3eFileGetSize( exportFile );

			char *fileContent = (char*) malloc( sizeof(char) * fileSize );
			s3eFileRead( fileContent, sizeof(char), fileSize, exportFile );

			attachment->m_dataSize = fileSize;
			attachment->m_data = fileContent;

			email->m_attachments = attachment;

			s3eEMailSendMail( email );

			free( fileContent );
		}
	}
}
