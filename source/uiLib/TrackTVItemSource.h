#ifndef TRACKTVITEMSOURCE
#define TRACKTVITEMSOURCE

/*
 * This file is part of the Airplay SDK Code Samples.
 *
 * Copyright (C) 2001-2010 Ideaworks3D Ltd.
 * All Rights Reserved.
 *
 * This source code is intended only as a supplement to Ideaworks Labs
 * Development Tools and/or on-line documentation.
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 */

#include "IwUITableViewItemSource.h"
#include "IwUIElement.h"
#include "IwPropertyString.h"

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
