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

#ifndef CIWUIDYNAMICIMAGE
#define CIWUIDYNAMICIMAGE

#include <Iw2D.h>
#include <IwMaterial.h>

class CIwUIDynamicImage {
public:
	CIwUIDynamicImage( int p_x, int p_y );

	CIwTexture *GetTexture();
	void DrawLine( CIwSVec2 p_start, CIwSVec2 p_end, CIwColour p_colour );

private:
	CIw2DSurface *drawSurface;
	CIw2DSurface *origSurface;
	CIw2DImage *surfaceImage;
};

#endif
