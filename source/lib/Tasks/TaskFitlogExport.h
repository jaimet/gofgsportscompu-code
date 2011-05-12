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

#ifndef TASKFITLOGEXPORT_C
#define TASKFITLOGEXPORT_C

#include <string>
#include <tinyxml.h>
#include <math.h>

#include "TaskFileExport.h"

class TaskFitlogExport : public TaskFileExport {
public:
	TaskFitlogExport( std::string p_fileName, std::string p_exportFileName );

	void Start();
	int Next();
	void Stop();

protected:
	TiXmlElement *CreateFitlogPoint();

	TiXmlDocument doc;			// Reference to XML doc
	TiXmlElement *trackNode;	// TrackNode is the master-noder for all data-points

	//int lastProgressUpdate;		// Percent value the progress was last updated
};

#endif