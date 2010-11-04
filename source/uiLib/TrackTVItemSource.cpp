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
			IwAssertMsg(UI, pDir, ("Failed to open track folder"));
			
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
