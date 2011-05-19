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

#include "CIwUIDynamicImage.h"

CIwUIDynamicImage::CIwUIDynamicImage( int p_x, int p_y ) {
	this->origSurface = NULL;
	this->drawSurface = Iw2DCreateSurface( p_x, p_y );
	this->surfaceImage = Iw2DCreateImage( this->drawSurface );
}

CIwTexture *CIwUIDynamicImage::GetTexture() {
	return this->surfaceImage->GetMaterial()->GetTexture();
}

void CIwUIDynamicImage::DrawLine( CIwSVec2 p_start, CIwSVec2 p_end, CIwColour p_colour ) {
	this->origSurface = Iw2DGetSurface();
	Iw2DSetSurface( this->drawSurface );
	Iw2DSetColour( p_colour );
	Iw2DDrawLine( p_start, p_end );
	Iw2DSetSurface( this->origSurface );
	this->origSurface = NULL;
}
