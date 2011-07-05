package at.gofg.sportscomputer;

import android.os.Bundle;
import com.phonegap.*;

public class GOFGSportsComputerActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html", 5000);
    }
}