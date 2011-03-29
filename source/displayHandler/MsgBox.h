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

#ifndef MSGBOX
#define MSGBOX

#include "Screen.h"
#include "../lib/Singleton.h"

#include <string>

#include <IwUIAlertDialog.h>

class MsgBox : public Screen, public Singleton<MsgBox> {
	friend class Singleton<MsgBox>;
public:
	void MSGBOX_QuitButtonClick(CIwUIElement*);

	static void Show( std::string text );

protected:
	MsgBox();
	~MsgBox();

	//CIwUIElement *tracksButton;
	CIwUIAlertDialog *alertDialog;
};

#endif
