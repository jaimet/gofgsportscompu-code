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

#ifndef CIWUIDRAWABLEAUTOSIZETEXT
#define CIWUIDRAWABLEAUTOSIZETEXT

#include <IwUIDrawableText.h>
#include <IwUIPropertySet.h>
#include <IwUIRect.h>
#include <IwUIColour.h>
#include <IwUIGraphics.h>

class CIwUIDrawableAutoSizeText : public IIwUIDrawable {
public:
	CIwUIDrawableAutoSizeText(const CIwVec2 &size, const CIwPropertySet &propertySet);

	virtual void Animate( const CIwUIAnimData &animData );
	virtual void DebugDraw( CIwUIDebugGraphics &debugGraphics ) const;
	virtual void Draw( CIwUIGraphics &graphics ) const;
	virtual CIwUIRect GetBounds() const;
	virtual CIwColour GetColour() const;
	virtual CIwVec2 GetPosition() const;
	virtual CIwVec2 GetSize() const;
	virtual bool Intersects( const CIwVec2 &pos ) const;
	virtual CIwVec2 Measure( const CIwVec2 &availableSize ) const;
	virtual void SetColour( const CIwColour &colour );
	virtual void SetPosition( const CIwVec2 &pos );
	virtual void SetSize( const CIwVec2 &size );

protected:
	CIwGxFont *GetSizedFont( int fontIndex, const char *measureString, CIwVec2 availableSize, int lastFontIndex = -1 ) const;
	CIwVec2 GetStringSize( const char *pString, CIwGxFont *font ) const;

private:
	CIwArray<CIwGxFont*> m_fontTypes;
	CIwUIRect m_rect;
	CIwUIColour m_colour;
	CIwPropertyString m_caption;
	CIwGxFontPreparedData m_preparedData;
	CIwGxFont *m_font;
};

#endif
