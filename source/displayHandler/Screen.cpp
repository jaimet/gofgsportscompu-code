#include "Screen.h"

Screen::Screen( char *screenName ) {
	this->myScreen = CIwUIElement::CreateFromResource( screenName );
	this->myScreen->SetVisible( false );
}

void Screen::SetVisible( bool p_bVisible ) {
	if( p_bVisible ) {
		this->myScreen->SetVisible( true );
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		IwGetUIAnimManager()->PlayAnim("ScreenSlideIn", this->myScreen);
	}
	else {
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		uint32 outHandle = IwGetUIAnimManager()->PlayAnim("ScreenSlideOut", this->myScreen);
		IwGetUIAnimManager()->SetObserver( outHandle, this );
	}
}

void Screen::NotifyProgress( CIwUIAnimator *pAnimator ) {
}

void Screen::NotifyStopped( CIwUIAnimator *pAnimator ) {
	this->myScreen->SetVisible( false );
}
