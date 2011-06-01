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

#include "TaskHandler.h"

template<>
TaskHandler *Singleton<TaskHandler>::mySelf = NULL;

// TODO: Continue task handler here
int TaskHandler::Add( Task *p_Task ) {
	if( p_Task->GetProcessID() <= 0 ) {
		p_Task->SetProcessID( ++(this->processCounter) );
		this->tasks.push_back( p_Task );

		p_Task->Start();
	}

	return p_Task->GetProcessID();
}

void TaskHandler::Run() {
	for( list<Task*>::iterator it = this->tasks.begin(); it != this->tasks.end(); it++ ) {
		if( (*it)->Next() <= 0 ) {
			this->Remove( (*it) );
			//delete (*it);
			break;
		}
	}
}

bool TaskHandler::Remove( Task *p_Task ) {
	p_Task->Stop();
	p_Task->SetProcessID( 0 );
	this->tasks.remove( p_Task );

	//delete p_Task;

	return true;
}

TaskHandler::TaskHandler() {
	this->processCounter = 0;
}
