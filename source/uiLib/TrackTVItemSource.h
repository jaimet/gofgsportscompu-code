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

#ifndef TRACKTVITEMSOURCE
#define TRACKTVITEMSOURCE

#include "IwUITableViewItemSource.h"
#include "IwUIElement.h"
#include "IwPropertyString.h"

#include "../lib/SettingsHandler.h"

#include "dirent.h"
#include <string>
#include <vector>

//-----------------------------------------------------------------------------

class TrackTVItemSource : public CIwUITableViewItemSource
{
public:
	IW_MANAGED_DECLARE(TrackTVItemSource)
	TrackTVItemSource();

	virtual ~TrackTVItemSource();

private:
	// IwUITableViewItemSource virtuals
	virtual bool IsRowAvailable(int32 row) const;

	virtual CIwUIElement* CreateItem(int32 row);

	virtual void ReleaseItem(CIwUIElement* pItem, int32 row);

	virtual int32 GetRowHeight(int32 row, int32 columnWidth) const;

	virtual void Activate(bool val);

	virtual void Clone(CIwUITableViewItemSource* pTarget) const;

	std::vector<CIwPropertyString>	m_Files;
};

#endif
