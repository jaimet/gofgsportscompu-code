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

#ifndef CIWUIAUTOSIZELABEL
#define CIWUIAUTOSIZELABEL

#include <IwUILabel.h>
#include <IwGxFont.h>

class CIwUIAutoSizeLabel : public CIwUILabel {
public:
	IW_MANAGED_DECLARE(CIwUIAutoSizeLabel)
	CIwUIAutoSizeLabel();
	
	void SetCaption( const char *pString );

protected:
	virtual void Clone( CIwUIElement *pTarget ) const;

private:
	CIwGxFont *GetSizedFont( int fontIndex, const char *measureString, int lastFontIndex = -1 );
	CIwArray<CIwGxFont*> fontTypes;

	int32 sizeAvailable;
};

#endif
