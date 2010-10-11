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

#include "TrackTVItemSource.h"
//-----------------------------------------------------------------------------

	TrackTVItemSource::TrackTVItemSource()
	{
	}

	TrackTVItemSource::~TrackTVItemSource()
	{
	}

	bool TrackTVItemSource::IsRowAvailable(int32 row) const
	{
		return (0 <= row) && (row < (int32)m_Files.size());
	}

	CIwUIElement* TrackTVItemSource::CreateItem(int32 row)
	{
		CIwUIElement* pItem = CIwUIElement::CreateFromResource("trackItem");

		const CIwPropertyString& fileName = m_Files[row];

		pItem->SetName(fileName.c_str());
		pItem->GetChildNamed("fileName")->SetProperty("caption", fileName);

		return pItem;
	}

	void TrackTVItemSource::ReleaseItem(CIwUIElement* pItem, int32 row)
	{
		delete pItem;
	}

	int32 TrackTVItemSource::GetRowHeight(int32 row, int32 columnWidth) const
	{
		return 40;
	}

	void TrackTVItemSource::Activate(bool val)
	{
		CIwUITableViewItemSource::Activate(val);

		if (val)
		{
			DIR* pDir = opendir("tracks");
			IwAssertMsg(UI, pDir, ("Failed to open music folder"));
			
			if(pDir)
			{
				while(dirent* pDirEnt = readdir(pDir))
				{
					if (pDirEnt->d_type == DT_REG)
					{
						std::string fileName(pDirEnt->d_name);
						if(!stricmp(fileName.substr(fileName.rfind('.')).c_str(), ".gsc"))
						{
							m_Files.push_back(fileName.c_str());
						}
					}
				}
				
				closedir(pDir);
			}
		}
		else
		{
			m_Files.clear();
		}
	}

	void TrackTVItemSource::Clone(CIwUITableViewItemSource* pTarget) const
	{
		IW_UI_CLONE_SUPERCLASS(pTarget, TrackTVItemSource, CIwUITableViewItemSource);
	}

	IW_MANAGED_IMPLEMENT_FACTORY(TrackTVItemSource);
