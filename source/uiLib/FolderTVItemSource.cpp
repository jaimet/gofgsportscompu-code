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

#include "FolderTVItemSource.h"
//-----------------------------------------------------------------------------

FolderTVItemSource::FolderTVItemSource() {
}

FolderTVItemSource::~FolderTVItemSource() {
}

bool FolderTVItemSource::IsRowAvailable(int32 row) const {
	return (0 <= row) && (row < (int32)m_Files.size());
}

CIwUIElement* FolderTVItemSource::CreateItem(int32 row) {
	CIwUIElement* pItem = CIwUIElement::CreateFromResource("folderItem");

	const CIwPropertyString& fileName = m_Files[row];

	pItem->SetName(fileName.c_str());
	pItem->GetChildNamed("fileName")->SetProperty("caption", fileName);

	return pItem;
}

void FolderTVItemSource::ReleaseItem(CIwUIElement* pItem, int32 row) {
	delete pItem;
}

int32 FolderTVItemSource::GetRowHeight(int32 row, int32 columnWidth) const {
	return 40;
}

void FolderTVItemSource::Activate(bool val) {
	CIwUITableViewItemSource::Activate(val);

	if (val) {
		std::string currPath = SettingsHandler::Self()->GetString( "SelectFolderPath" );

		DIR* pDir = opendir( currPath.c_str() );
		//IwAssertMsg(UI, pDir, ("Failed to open track folder"));

		// Always add the ".." as element
		
		if( currPath != "/" ) {
			m_Files.push_back( ".." );
		}
		
		if(pDir)
		{
			while(dirent* pDirEnt = readdir(pDir))
			{
				if (pDirEnt->d_type == DT_DIR)
				{
					std::string fileName(pDirEnt->d_name);
					//size_t 
					//if( fileName.rfind( ".gsc" ) == ( fileName.length() - 4 ) ) {
						m_Files.push_back( fileName.c_str() );
					//}

					/*if(!stricmp(fileName.substr(fileName.rfind('.')).c_str(), ".gsc"))
					{
						m_Files.push_back(fileName.c_str());
					}*/
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

void FolderTVItemSource::Clone(CIwUITableViewItemSource* pTarget) const {
	IW_UI_CLONE_SUPERCLASS(pTarget, FolderTVItemSource, CIwUITableViewItemSource);
}

IW_MANAGED_IMPLEMENT_FACTORY(FolderTVItemSource);
