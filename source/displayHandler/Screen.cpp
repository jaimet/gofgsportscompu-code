#include "Screen.h"

Screen::Screen( char *screenName ) {
	this->myScreen = CIwUIElement::CreateFromResource( screenName );
	this->myScreen->SetVisible( false );
}

void Screen::SetVisible( bool p_bVisible ) {
	if( p_bVisible ) {
		this->myScreen->SetVisible( true );

		// Only play animation if we should
		//if( !p_bNoAnim ) {
			IwGetUIAnimManager()->StopAnim( this->myScreen );
			IwGetUIAnimManager()->PlayAnim("ScreenSlideIn", this->myScreen);
		//}
	}
	else {
		// Play Slide-Out animation when we should
		//if( !p_bNoAnim ) {
			IwGetUIAnimManager()->StopAnim( this->myScreen );
			uint32 outHandle = IwGetUIAnimManager()->PlayAnim("ScreenSlideOut", this->myScreen);
			IwGetUIAnimManager()->SetObserver( outHandle, this );
		/*}
		// Else just hide the screen
		else {
			this->myScreen->SetVisible( false );
		}*/
	}
}

void Screen::NotifyProgress( CIwUIAnimator *pAnimator ) {
}

void Screen::NotifyStopped( CIwUIAnimator *pAnimator ) {
	this->myScreen->SetVisible( false );
}
