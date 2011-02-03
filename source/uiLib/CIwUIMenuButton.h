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

/*#ifndef CIWUIMENUBUTTON
#define CIWUIMENUBUTTON

#include <IwUIButton.h>
#include <IwUIImage.h>
#include <IwUILabel.h>
#include <IwPropertyString.h>
#include <IwRandom.h>

#include <string>
#include <sstream>

class CIwUIMenuButton : public CIwUIButton {
public:
	IW_MANAGED_DECLARE(CIwUIMenuButton)
	CIwUIMenuButton();
	
	void SetCaption( const char *pString );
	void SetTexture( CIwTexture *pTexture );

protected:
	virtual void Clone( CIwUIElement *pTarget ) const;
	virtual void OnPropertyChanged( uint32 hashName );

	void RenameChildren( std::string baseName, CIwUIElement *pParent );

private:
	CIwUIImage *ButtonIcon;
	CIwUILabel *ButtonLabel;
};

#endif*/
