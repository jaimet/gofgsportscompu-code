/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

Cordova = {
    plugins: {},
    constructors: {},
    callbacks: [],
};

/*
 * Execute a callback function & remove it from the Cordova object
 */
Cordova.callback = function() {
    var scId = arguments[0];
    var callbackRef = null;

    var parameters = [];
    for( var i = 1; i < arguments.length; i++ ) {
        //debug.log( "Adding parameter " + arguments[i] );
        parameters[i-1] = arguments[i];
    }
    // Keep reference to callback
    callbackRef = Cordova.callbacks[scId];

    // Even IDs are success-, odd are error-callbacks - make sure we remove both
    if( (scId % 2) !== 0 ) {
        scId = scId - 1;
    }
    // Remove both the success as well as the error callback from the stack
    Cordova.callbacks.splice( scId, 2 );

    // Finally run the callback
    if( typeof callbackRef == "function" ) callbackRef.apply( this, parameters );
};

/*
 * Enable a plugin for use within Cordova
 */
Cordova.enablePlugin = function( pluginName ) {
    // Enable the plugin
    Cordova.plugins[pluginName] = true;

    // Run constructor for plugin if available
    if( typeof Cordova.constructors[pluginName] == "function" ) Cordova.constructors[pluginName]();
}

/*
 * Add a plugin-specific constructor function which is called once the plugin is loaded
 */
Cordova.addConstructor = function( pluginName, constructor ) {
    Cordova.constructors[pluginName] = constructor;
}

/**
 * Event interface - http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event
 */
Cordova.Event = function() {
};

Cordova.Event.CAPTURING_PHASE = 1;
Cordova.Event.AT_TARGET = 2;
Cordova.Event.BUBBLING_PHASE = 3;

Cordova.Event.prototype.type = "unknown";
Cordova.Event.prototype.target = Cordova;
Cordova.Event.prototype.currentTarget = Cordova;
Cordova.Event.prototype.eventPhase = Cordova.Event.AT_TARGET;
Cordova.Event.prototype.bubbles = false;
Cordova.Event.prototype.cancelable = false;
Cordova.Event.prototype.timeStamp = 0;

Cordova.Event.prototype.stopPropagation = function() {};
Cordova.Event.prototype.preventDefault = function() {};
Cordova.Event.prototype.initEvent = function( eventTypeArg, canBubbleArg, cancelableArg ) {
    this.type = eventTypeArg;
    this.timeStamp = (new Date()).getMilliseconds();
};

/*
 * EventHandler interface - handles one type of event
 * Not W3C defined, but required in order to handle our custom events
 */
Cordova.EventHandler = function( p_type ) {
    this.type = p_type
    this.listeners = []
}

Cordova.EventHandler.prototype.type = "unknown";
Cordova.EventHandler.prototype.listeners = [];
Cordova.EventHandler.prototype.addEventListener = function( p_listener, p_capture ) {
    if( p_capture ) {
        this.listeners.unshift( p_listener );
    }
    else {
        this.listeners.push( p_listener );
    }
};

Cordova.EventHandler.prototype.removeEventListener = function( p_listener, p_capture ) {
    // Try to find the event listener in our list
    for( var i = 0; i < this.listeners.length; i++ ) {
        if( this.listeners[i] == p_listener ) {
            // Remove the listener from our queue
            this.listeners.splice( i, 1 );
            return;
        }
    }
};

Cordova.EventHandler.prototype.dispatchEvent = function() {
    var event = new Cordova.Event();
    event.initEvent( this.type, false, false );

    // Notify all listeners about this event
    for( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[i].apply(Cordova, arguments);
    }
};

/*
 * Create the custom Cordova events
 */

Cordova.events = {
    deviceready: new Cordova.EventHandler( "deviceready" ),
    resume: new Cordova.EventHandler( "resume" ),
    pause: new Cordova.EventHandler( "pause" ),
    online: new Cordova.EventHandler( "online" ),
    offline: new Cordova.EventHandler( "offline" ),
    backbutton: new Cordova.EventHandler( "backbutton" ),
    batterycritical: new Cordova.EventHandler( "batterycritical" ),
    batterylow: new Cordova.EventHandler( "batterylow" ),
    batterystatus: new Cordova.EventHandler( "batterystatus" ),
    menubutton: new Cordova.EventHandler( "menubutton" ),
    searchbutton: new Cordova.EventHandler( "searchbutton" ),
    startcallbutton: new Cordova.EventHandler( "startcallbutton" ),
    endcallbutton: new Cordova.EventHandler( "endcallbutton" ),
    volumedownbutton: new Cordova.EventHandler( "volumedownbutton" ),
    volumeupbutton: new Cordova.EventHandler( "volumeupbutton" )
};

/*
 * EventTarget interface - http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */
//Keep references to the original EventTarget implementations
Cordova.doc_addEventListener = document.addEventListener;
Cordova.doc_removeEventListener = document.removeEventListener;
Cordova.doc_dispatchEvent = document.dispatchEvent;

document.addEventListener = function( type, listener, useCapture ) {
    if( typeof Cordova.events[type] != "undefined" ) {
        Cordova.events[type].addEventListener( listener, useCapture );
    }
    else {
        Cordova.doc_addEventListener.call(document, type, listener, useCapture);
    }
};

document.removeEventListener = function( type, listener, useCapture ) {
    if( typeof Cordova.events[type] != "undefined" ) {
        Cordova.events[type].removeEventListener( listener, useCapture );
    }
    else {
        Cordova.doc_removeEventListener.call(document, type, listener, useCapture);
    }
};

document.dispatchEvent = function( evt ) {
    if( typeof Cordova.events[evt.type] != "undefined" ) {
        Cordova.events[evt.type].dispatchEvent();
    }
    else {
        Cordova.doc_dispatchEvent.call(document, evt);
    }
};

/*
 * Trigger the global deviceready event - fired from native code
 */
Cordova.deviceready = function() {
    Cordova.events.deviceready.dispatchEvent();
}


Cordova.resumeOccured = function() {
            console.log("Cordova.resumeOccured")
            Cordova.events.resume.dispatchEvent();
        }
Cordova.pauseOccured = function() {
            console.log("Cordova.pauseOccured")
            Cordova.events.pause.dispatchEvent();
        }
Cordova.onlineOccured = function() {
            console.log("Cordova.onlineOccured")
            Cordova.events.online.dispatchEvent();
        }
Cordova.offlineOccured = function() {
            console.log("Cordova.offlineOccured")
            Cordova.events.offline.dispatchEvent();
        }


Cordova.batteryStatusChanged = function(level, isPlugged, forceStatus) {
    console.log("Cordova.batteryStatusChanged: " + level + ", " + isPlugged + ", " + forceStatus)
    if (level < 3 && !forceStatus)
        Cordova.events.batterycritical.dispatchEvent({level: level, isPlugged: isPlugged})
    else if (level < 40 && !forceStatus)
        Cordova.events.batterylow.dispatchEvent({level: level, isPlugged: isPlugged})
    Cordova.events.batterystatus.dispatchEvent({level: level, isPlugged: isPlugged})
}

Cordova.menuKeyPressed = function() {
            console.log("Cordova.menuKeyPressed")
            Cordova.events.menubutton.dispatchEvent();
        }
Cordova.backKeyPressed = function() {
            console.log("Cordova.backKeyPressed")
            Cordova.events.backbutton.dispatchEvent();
        }
Cordova.searchKeyPressed = function() {
            console.log("Cordova.searchKeyPressed")
            Cordova.events.searchbutton.dispatchEvent();
        }
Cordova.callKeyPressed = function() {
            console.log("Cordova.callKeyPressed")
            Cordova.events.startcallbutton.dispatchEvent();
        }
Cordova.hangupKeyPressed = function() {
            console.log("Cordova.hangupKeyPressed")
            Cordova.events.endcallbutton.dispatchEvent();
        }
Cordova.volumeUpKeyPressed = function() {
            console.log("Cordova.volumeUpKeyPressed")
            Cordova.events.volumeupbutton.dispatchEvent();
        }
Cordova.volumeDownKeyPressed = function() {
            console.log("Cordova.volumeDownKeyPressed")
            Cordova.events.volumedownbutton.dispatchEvent();
        }
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

Cordova.Qt = {};

/**
 * Execute a call to a plugin function
 * @return bool true on success, false on error (e.g. function doesn't exist)
 */
Cordova.Qt.exec = function( successCallback, errorCallback, pluginName, functionName, parameters ) {
    // Check if plugin is enabled
    if( Cordova.plugins[pluginName] !== true ) {
        return false;
    }

    // Store a reference to the callback functions
    var scId = Cordova.callbacks.length;
    var ecId = scId + 1;
    Cordova.callbacks[scId] = successCallback;
    Cordova.callbacks[ecId] = errorCallback;

    parameters.unshift( ecId );
    parameters.unshift( scId );

    window.qmlWrapper.callPluginFunction(pluginName, functionName, JSON.stringify(parameters))
    return true;
}

/**
 * Function which is called from the native bridge in order to register the QtWebKit bridge objects
 */
Cordova.Qt.objects = {};
Cordova.Qt.registerObject = function( pluginName, pluginObject ) {
    Cordova.Qt.objects[pluginName] = pluginObject;
}

Cordova.exec = Cordova.Qt.exec;
/*
 *  Copyright 2011  Integrated Computer Solutions - http://www.ics.com
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

//accelerometer interface http://docs.phonegap.com/en/1.0.0/phonegap_accelerometer_accelerometer.md.html


function Acceleration() {
};

Acceleration.cast = function( p_acceleration) {
    var acceleration = new Acceleration();
    acceleration.x = p_acceleration.x;
    acceleration.y = p_acceleration.y;
    acceleration.z = p_acceleration.z;
    acceleration.timestamp = p_acceleration.timestamp;
    return acceleration;
};

Acceleration.prototype.x = null;
Acceleration.prototype.y = null;
Acceleration.prototype.z = null;
Acceleration.prototype.timestamp = null;

Accelerometer.prototype.watchIds = [];

/**
 * Accelerometer interface
 */
function Accelerometer() {
};


Accelerometer.prototype.getCurrentAcceleration = function( successCallback, errorCallback) {
    // Check the callbacks
    if( typeof successCallback !== "function" ) return;
    if( typeof errorCallback !== "function" ) errorCallback = function() {};

    // Call the native function and query for the new x,y,z accel values
    var me = this;
    Cordova.exec( function( p_acceleration ) {
                      successCallback( p_acceleration );
                  }, errorCallback, "com.cordova.Accelerometer", "getCurrentAcceleration", [ {} ] );
};

Accelerometer.prototype.watchAcceleration = function( successCallback, errorCallback, options ) {
            // Check the callbacks
            if( typeof successCallback !== "function" ) return;
            if( typeof errorCallback !== "function" ) errorCallback = function() {};

            var watchId = this.watchIds.length + 1; // +1 in order to avoid 0 as watchId
            this.watchIds[watchId] = true;
            var me = this;

            var frequency=10000;

            if(options.frequency != null){frequency=options.frequency;}

            function doWatch() {
                me.getCurrentAcceleration( function( p_acceleration ) {
                                            if( !me.watchIds[watchId] ) return;

                                            successCallback( p_acceleration );

                                            // Wait some time before starting again
                                            setTimeout( doWatch, frequency );
                                        }, function( p_accelerationError ) {
                                            if( !me.watchIds[watchId] ) return;

                                            errorCallback( p_accelerationError );
                                            // Wait some time before starting again
                                            setTimeout( doWatch, frequency );
                                        });
            }

            setTimeout( doWatch, frequency );

            return watchId;
        };

Accelerometer.prototype.clearWatch = function( watchId ) {
            this.watchIds[watchId] = false;
};

/**
 * Add the accelerometer object to the navigator
 */
Cordova.addConstructor( "com.cordova.Accelerometer", function () {
                            navigator.accelerometer = new Accelerometer();
                        } );
/*
 *  Copyright 2011  Integrated Computer Solutions - http://www.ics.com
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

//compass interface http://docs.phonegap.com/en/1.0.0/phonegap_compass_compass.md.html


function Heading() {
};

Heading.cast = function( p_heading, p_accuracy ) {
    var heading = new Heading();
    heading.dir = p_heading;
    return heading;
};

Heading.prototype.dir = null;
Heading.prototype.accuracy = null;


//HeadingError

function HeadingError() {
};

HeadingError.cast = function( p_code, p_message ) {
    var headingError = new HeadingError();
    headingError.code = p_code;
    headingError.message = p_message;

    return headingError;
};

HeadingError.COMPASS_INTERNAL_ERR = 1;
HeadingError.COMPASS_NOT_SUPPORTED = 2;

HeadingError.prototype.code = 0;
HeadingError.prototype.message = "";

/**
 * HeadingOptions interface
 */
function HeadingOptions() {
};

//HeadingOptions.prototype.magneticHeading = 0;
//HeadingOptions.prototype.trueHeading = 0;//
//HeadingOptions.prototype.headingAccuracy = 0;
//HeadingOptions.prototype.timestamp = 0;


/**
 * Compass interface
 */
function Compass() {
};

Compass.prototype.watchIds = [];
Compass.prototype.cachedHeading = null;

Compass.prototype.getCurrentHeading = function( successCallback, errorCallback, options ) {
    // Check the callbacks
    if( typeof successCallback !== "function" ) return;
    if( typeof errorCallback !== "function" ) errorCallback = function() {};
    var headingOptions = new HeadingOptions();

    // Check the timestamp
    if( this.cachedHeading !== null &&
            (this.cachedHeading.timestamp <= (new Date()).getTime) ) {
        successCallback( this.cachedHeading );
        return;
    }

    // Call the native function and query for a new heading
    var me = this;
    Cordova.exec( function( p_heading ) {
                      received = true;
                      me.cachedHeading = p_heading;
                      successCallback( p_heading );
                  }, errorCallback, "com.cordova.Compass", "getCurrentHeading", [ headingOptions ] );
};

Compass.prototype.watchHeading = function( successCallback, errorCallback, options ) {
    // Check the callbacks
    if( typeof successCallback !== "function" ) return;
    if( typeof errorCallback !== "function" ) errorCallback = function() {};

    var watchId = this.watchIds.length + 1; // +1 in order to avoid 0 as watchId
    this.watchIds[watchId] = true;
    var me = this;

    function doWatch() {
        me.getCurrentHeading( function( p_heading ) {
                                    if( !me.watchIds[watchId] ) return;
                                    successCallback( p_heading );
                                    // Wait some time before starting again
                                    setTimeout( doWatch, 100 );
                                }, function( p_headingError ) {
                                    if( !me.watchIds[watchId] ) return;

                                    errorCallback( p_headingError );
                                    // Wait some time before starting again
                                    setTimeout( doWatch, 100 );
                                }, options );
    }

    // Start watching for heading changes (slight delay, in order to simulate asynchronous behaviour)
    setTimeout( doWatch, 100 );

    return watchId;
};

Compass.prototype.clearWatch = function( watchId ) {
    this.watchIds[watchId] = false;
};

/**
 * Add the compass object to the navigator
 */
Cordova.addConstructor( "com.cordova.Compass", function () {
                            navigator.compass = new Compass();} );
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Connection() {
}

Connection.prototype.type = 0;
Connection.UNKNOWN = 1;
Connection.ETHERNET = 2;
Connection.WIFI = 3;
Connection.CELL_2G = 4;
Connection.CELL_3G = 5;
Connection.CELL_4G = 6;
Connection.NONE = 7;

/**
 * Internal function for listening to change events
 */
Connection.prototype.setChangeCallback = function() {
    var me = this;

    console.log( "connection - setChangeCallback" );

    Cordova.exec( function( p_type ) {
                      // Save new type
                      me.type = p_type;

                      console.log( "Connection - new type: " + p_type );

                      // Register new callback instance in order to receive future updates
                      setTimeout( navigator.network.connection.setChangeCallback, 100 );
                  }, null, "com.cordova.Connection", "setChangeCallback", [] );
}

Cordova.addConstructor( "com.cordova.Connection", function() {
                            if( typeof navigator.network === "undefined" ) navigator.network = {};

                            navigator.network.connection = new Connection();
                            navigator.network.connection.setChangeCallback();
                        } );
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Console() {
}

Console.prototype.log = function( p_message ) {
    Cordova.exec( null, null, "com.cordova.Console", "log", [p_message] );
}

Cordova.addConstructor( "com.cordova.Console", function() {
                            window.console = new Console();
                        } );
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Device() {
    var me = this;
    Cordova.exec( function( p_name, p_cordova, p_platform, p_uuid, p_version ) {
                      me.name = p_name;
                      me.cordova = p_cordova;
                      me.platform = p_platform;
                      me.uuid = p_uuid;
                      me.version = p_version;
                  }, null, "com.cordova.Device", "getInfo", [] );
};

Device.prototype.name = "";
Device.prototype.cordova = "";
Device.prototype.platform = "";
Device.prototype.uuid = "";
Device.prototype.version = "";

Cordova.addConstructor( "com.cordova.Device", function() {
                            window.device = new Device();
                        } );
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * FileError interface
 * http://www.w3.org/TR/file-system-api/#the-fileerror-interface
 */
function FileError() {
}

FileError.cast = function( p_code ) {
        var fe = new FileError();
        fe.code = p_code;

        return fe;
}
FileError.prototype.code = 0;
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

/**
 * FileException interface
 * http://www.w3.org/TR/FileAPI/#dfn-FileException
 */
function FileException() {
}

FileException.cast = function( p_code ) {
        var fe = new FileException();
        fe.code = p_code;

        return fe;
}
FileException.prototype.code = 0;
FileException.NOT_FOUND_ERR = 1;
FileException.SECURITY_ERR = 2;
FileException.ABORT_ERR = 3;
FileException.NOT_READABLE_ERR = 4;
FileException.ENCODING_ERR = 5;
FileException.NO_MODIFICATION_ALLOWED_ERR = 6;
FileException.INVALID_STATE_ERR = 7;
FileException.SYNTAX_ERR = 8;

/**
 * FileMetadata (Metadata) interface
 * http://www.w3.org/TR/file-system-api/#idl-def-Metadata
 */
function FileMetadata() {
}

FileMetadata.cast = function( p_modificationDate ) {
        var md = new FileMetadata();
        md.modificationTime = p_modificationDate;

        return md;
}
FileMetadata.prototype.modificationTime = null;

/**
 * Entry interface
 * http://www.w3.org/TR/file-system-api/#idl-def-Entry
 */
function Entry() {
}
Entry.prototype.isFile = false;
Entry.prototype.isDirectory = false;
Entry.prototype.name = "";
Entry.prototype.fullPath = "";
Entry.prototype.filesystem = null;
Entry.prototype.getMetadata = function( successCallback, errorCallback ) {
        // Get metadata for this entry
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getMetadata", [this.fullPath]);
}
Entry.prototype.moveTo = function( parent, newName, successCallback, errorCallback ) {
}
Entry.prototype.copyTo = function( parent, newName, successCallback, errorCallback ) {
}
Entry.prototype.toURL = function( mimeType ) {
        return "file://" + this.fullPath;
}
Entry.prototype.remove = function( successCallback, errorCallback ) {
        // Remove this entry
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "remove", [this.fullPath]);
}
Entry.prototype.getParent = function( successCallback, errorCallback ) {
        // Ask the system for our parent
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getParent", [this.fullPath]);
}

/**
 * FileInfo (File) interface
 * (had to call the 'File' object FileInfo since there were name conflicts)
 * http://dev.w3.org/2006/webapi/FileAPI/#dfn-file
 */
function FileInfo() {
}

FileInfo.cast = function( p_name, p_fullPath, p_type, p_lastModifiedDate, p_size ) {
        var f = new FileInfo();
        f.name = p_name;
        f.fullPath = p_fullPath;
        f.type = p_type;
        f.lastModifiedDate = p_lastModifiedDate;
        f.size = p_size;

        return f;
}
FileInfo.prototype.name = "";
FileInfo.prototype.fullPath = "";
FileInfo.prototype.type = "unknown/unknown";
FileInfo.prototype.lastModifiedDate = null;
FileInfo.prototype.size = 0;

/**
 * FileSaver interface
 * http://www.w3.org/TR/file-writer-api/#idl-def-FileSaver
 */
function FileSaver() {
}

FileSaver.createEvent = function( p_type, p_target ) {
        var evt = {
                "type": p_type,
                "target": p_target
        };

        return evt;
}

FileSaver.prototype.abort = function() {
        if( this.readyState == FileSaver.INIT || this.readyState == FileSaver.DONE ) throw FileException.cast(FileException.INVALID_STATE_ERR);

        this.error = FileError.cast(FileError.ABORT_ERR);
        this.readyState = FileSaver.DONE;

        if( typeof this.onerror === "function" ) this.onerror(FileSaver.createEvent("error", this));
        if( typeof this.onabort === "function" ) this.onabort(FileSaver.createEvent("abort", this));
        if( typeof this.onwriteend === "function" ) this.onwriteend(FileSaver.createEvent("writeend", this));
}

FileSaver.INIT = 0;
FileSaver.WRITING = 1;
FileSaver.DONE = 2;

FileSaver.prototype.readyState = FileSaver.INIT;
FileSaver.prototype.error = new FileError();
FileSaver.prototype.onwritestart = null;
FileSaver.prototype.onprogress = null;
FileSaver.prototype.onwrite = null;
FileSaver.prototype.onabort = null;
FileSaver.prototype.onerror = null;
FileSaver.prototype.onwriteend = null;

FileSaver.prototype.fullPath = "";		// Not W3C conform, but we need the path for handling!

/**
 * FileWriter interface
 * (derives from FileSaver)
 * http://www.w3.org/TR/file-writer-api/#idl-def-FileWriter
 */
function FileWriter() {
}

FileWriter.cast = function( p_fullPath, p_length ) {
        var fw = new FileWriter();
        fw.fullPath = p_fullPath;
        fw.length = p_length;

        return fw;
}

FileWriter.prototype = new FileSaver();
FileWriter.prototype.position = 0;
FileWriter.prototype.length = 0;
FileWriter.prototype.write = function( data ) {
        //console.log( 'Calling write: ' + this.position + " / " + this.length );

        // Check if we are able to write
        if( this.readyState == FileSaver.WRITING ) throw FileException.cast(FileException.INVALID_STATE_ERR);
        // We are writing now
        this.readyState = FileSaver.WRITING;
        // Emit the start event
        if( typeof this.onwritestart === "function" ) this.onwritestart( FileSaver.createEvent("writestart", this) );

        // Finally do the writing
        var me = this;
        Cordova.exec(function(p_position, p_length) {
                // Update position & length for file
                me.position = p_position;
                me.length = p_length;

                // Update state
                me.readyState = FileSaver.DONE;

                // Dispatch missing events
                if( typeof me.onwrite === "function" ) me.onwrite( FileSaver.createEvent("write", me) );
                if( typeof me.onwriteend === "function" ) me.onwriteend( FileSaver.createEvent("writeend", me) );
        }, function( p_fileError, p_position, p_length ) {
                // Update position & length for file
                me.position = p_position;
                me.length = p_length;

                // Set error object & update state
                me.error = p_fileError;
                me.readyState = FileSaver.DONE;

                // Dispatch missing events
                if( typeof me.onerror === "function" ) me.onerror( FileWriter.createEvent("error", me) );
                if( typeof me.onwriteend === "function" ) me.onwriteend( FileWriter.createEvent("writeend", me) );
        }, "com.cordova.File", "write", [this.fullPath, this.position, data]);
}

FileWriter.prototype.seek = function( offset ) {
        //console.log( 'Calling seek: ' + offset + " / " + this.position + " / " + this.length + " / " + this.readyState );

        if( this.readyState == FileSaver.WRITING ) throw FileException.cast(FileException.INVALID_STATE_ERR);

        if( offset < 0 ) {
                this.position = offset + this.length;
        }
        else if( offset > this.length ) {
                this.position = this.length;
        }
        else {
                this.position = offset;
        }
}

FileWriter.prototype.truncate = function( size ) {
        // Check if we are able to write
        if( this.readyState == FileSaver.WRITING ) throw FileException.cast(FileException.INVALID_STATE_ERR);
        // We are writing now
        this.readyState = FileSaver.WRITING;
        // Emit the start event
        if( typeof this.onwritestart === "function" ) this.onwritestart( FileSaver.createEvent("writestart", this) );

        // Finally do the writing
        var me = this;
        Cordova.exec(function(p_position, p_length) {
                // Update position & length for file
                me.position = p_position;
                me.length = p_length;

                // Update state
                me.readyState = FileSaver.DONE;

                // Dispatch missing events
                if( typeof me.onwrite === "function" ) me.onwrite( FileSaver.createEvent("write", me) );
                if( typeof me.onwriteend === "function" ) me.onwriteend( FileSaver.createEvent("writeend", me) );
        }, function( p_fileError, p_position, p_length ) {
                // Update position & length for file
                me.position = p_position;
                me.length = p_length;

                // Set error object & update state
                me.error = p_fileError;
                me.readyState = FileSaver.DONE;

                // Dispatch missing events
                if( typeof me.onerror === "function" ) me.onerror( FileSaver.createEvent("error", me) );
                if( typeof me.onwriteend === "function" ) me.onwriteend( FileSaver.createEvent("writeend", me) );
        }, "com.cordova.File", "truncate", [this.fullPath, size]);
}

/**
 * FileReader interface
 * http://www.w3.org/TR/FileAPI/#dfn-filereader
 */
function FileReader() {
}

FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

FileReader.prototype.readyState = FileReader.EMPTY;
FileReader.prototype.result = "";
FileReader.prototype.error = new FileError();
FileReader.prototype.onloadstart = null;
FileReader.prototype.onprogress = null;
FileReader.prototype.onload = null;
FileReader.prototype.onabort = null;
FileReader.prototype.onerror = null;
FileReader.prototype.onloadend = null;

FileReader.prototype.readAsArrayBuffer = function( file ) {
}
FileReader.prototype.readAsBinaryString = function( file ) {
}
FileReader.prototype.readAsText = function( file ) {
        this.readyState = FileReader.EMPTY;
        this.result = null;

        this.readyState = FileReader.LOADING;

        if( typeof this.onloadstart === "function" ) this.onloadstart( FileSaver.createEvent( "loadstart", this) );

        var me = this;

        // Lets read the file...
        Cordova.exec(function( p_data ) {
                me.readyState = FileReader.DONE;
                me.result = atob( p_data );

                if( typeof me.onload === "function" ) me.onload( FileSaver.createEvent( "load", me) );
                if( typeof me.onloadend === "function" ) me.onloadend( FileSaver.createEvent( "loadend", me) );
        }, function( p_fileError ) {
                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = p_fileError;

                if( typeof me.onloadend === "function" ) me.onloadend( FileSaver.createEvent( "loadend", me) );
                if( typeof me.onerror === "function" ) me.onerror( FileSaver.createEvent( "error", me) );
        }, "com.cordova.File", "readAsDataURL", [file.fullPath]);
}
FileReader.prototype.readAsDataURL = function( file ) {
        this.readyState = FileReader.EMPTY;
        this.result = null;

        this.readyState = FileReader.LOADING;

        if( typeof this.onloadstart === "function" ) this.onloadstart( FileSaver.createEvent( "loadstart", this) );

        var me = this;

        // Lets read the file...
        Cordova.exec(function( p_data ) {
                me.readyState = FileReader.DONE;
                me.result = p_data;

                if( typeof me.onloadend === "function" ) me.onloadend( FileSaver.createEvent( "loadend", me) );
        }, function( p_fileError ) {
                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = p_fileError;

                if( typeof me.onloadend === "function" ) me.onloadend( FileSaver.createEvent( "loadend", me) );
                if( typeof me.onerror === "function" ) me.onerror( FileSaver.createEvent( "error", me) );
        }, "com.cordova.File", "readAsDataURL", [file.fullPath]);
}
FileReader.prototype.abort = function() {
        this.readyState = FileReader.DONE;
        this.result = null;
        this.error = FileError.cast( FileError.ABORT_ERR );

        if( typeof this.onerror === "function" ) this.onerror( FileSaver.createEvent( "error", me) ) ;
        if( typeof this.onabort === "function" ) this.onabort( FileSaver.createEvent( "abort", me) ) ;
        if( typeof this.onloadend === "function" ) this.onloadend( FileSaver.createEvent( "loadend", me) ) ;
}


/**
 * FileEntry interface
 * (derives from Entry)
 * http://www.w3.org/TR/file-system-api/#the-fileentry-interface
 */
function FileEntry() {
        this.isFile = true;
        this.isDirectory = false;
}

FileEntry.cast = function( filename, path ) {
        var fe = new FileEntry();
        fe.name = filename;
        fe.fullPath = path;

        return fe;
}

FileEntry.prototype = new Entry();
FileEntry.prototype.createWriter = function( successCallback, errorCallback ) {
        this.file( function(p_file) {
                successCallback(FileWriter.cast(p_file.fullPath, p_file.size));
        }, errorCallback);
}
FileEntry.prototype.file = function( successCallback, errorCallback ) {
        // Lets get the fileinfo
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "file", [this.fullPath]);
}

/**
 * DirectoryReader interface
 * http://www.w3.org/TR/file-system-api/#the-directoryreader-interface
 */
function DirectoryReader() {
}

DirectoryReader.cast = function( p_fullPath ) {
        var dr = new DirectoryReader();
        dr.fullPath = p_fullPath;

        return dr;
}

DirectoryReader.prototype.fullPath = "";	// Not W3C conform, but required
DirectoryReader.prototype.readEntries = function( successCallback, errorCallback ) {
        // Get all entries for the directory
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "readEntries", [this.fullPath]);
}

/**
 * DirectoryEntry interface
 * (derives from Entry)
 * http://www.w3.org/TR/file-system-api/#the-directoryentry-interface
 */
function DirectoryEntry() {
        this.isFile = false;
        this.isDirectory = true;
}

DirectoryEntry.cast = function( dirname, path ) {
        var de = new DirectoryEntry();
        de.name = dirname;
        de.fullPath = path;

        return de;
}

DirectoryEntry.prototype = new Entry();
DirectoryEntry.prototype.createReader = function() {
        return DirectoryReader.cast(this.fullPath);
}
DirectoryEntry.prototype.getFile = function( path, options, successCallback, errorCallback ) {
        var requestPath = path;

        // Check for a relative path
        if( requestPath.charAt(0) != '/' ) requestPath = this.fullPath + requestPath;

        // Lets get the file
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getFile", [requestPath, options]);
}
DirectoryEntry.prototype.getDirectory = function( path, options, successCallback, errorCallback ) {
        var requestPath = path;

        // Check for a relative path
        if( requestPath.charAt(0) != '/' ) requestPath = this.fullPath + requestPath;
        // Make sure we have a trailing slash
        if( requestPath.charAt(requestPath.length - 1) != '/' ) requestPath = requestPath + "/";

        // Lets get the directory
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getDirectory", [requestPath, options]);
}
DirectoryEntry.prototype.removeRecursively = function( successCallback, errorCallback ) {
        // Remove the directory
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "removeRecursively", [this.fullPath]);
}

/**
 * FileSystem interface
 * http://www.w3.org/TR/file-system-api/#the-filesystem-interface
 */
function FileSystem() {
}

FileSystem.cast = function( fsname, dirname, path ) {
        var fs = new FileSystem();
        fs.name = fsname;
        fs.root = DirectoryEntry.cast(dirname, path);

        return fs;
}

FileSystem.prototype.name = "";
FileSystem.prototype.root = null;	// Should be a DirectoryEntry

/**
 * LocalFileSystem interface
 * http://www.w3.org/TR/file-system-api/#using-localfilesystem
 */
function LocalFileSystem() {
}

LocalFileSystem.TEMPORARY = 0;
LocalFileSystem.PERSISTENT = 1;

LocalFileSystem.prototype.requestFileSystem = function( type, size, successCallback, errorCallback ) {
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "requestFileSystem", [type]);
}
LocalFileSystem.prototype.resolveLocalFileSystemURL = function( url, successCallback, errorCallback ) {
        Cordova.exec(successCallback, errorCallback, "com.cordova.File", "resolveLocalFileSystemURL", [url]);
}

/**
 * Let window implement the localfilesystem
 */
Cordova.addConstructor( "com.cordova.File", function () {
    var localFileSystem = new LocalFileSystem();
    window.requestFileSystem = localFileSystem.requestFileSystem;
    window.resolveLocalFileSystemURI = localFileSystem.resolveLocalFileSystemURL;
} );
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * Coordinates interface - http://www.w3.org/TR/geolocation-API/#coordinates
 */
function Coordinates() {
};

Coordinates.cast = function( p_latitude, p_longitude, p_altitude, p_accuracy, p_altitudeAccuracy, p_heading, p_speed ) {
    var coordinates = new Coordinates();

    coordinates.latitude = p_latitude;
    coordinates.longitude = p_longitude;
    coordinates.altitude = p_altitude;
    coordinates.accuracy = p_accuracy;
    coordinates.altitudeAccuracy = p_altitudeAccuracy;
    coordinates.heading = p_heading;
    coordinates.speed = p_speed;

    return coordinates;
};

Coordinates.prototype.latitude = 0;
Coordinates.prototype.longitude = 0;
Coordinates.prototype.altitude = 0;
Coordinates.prototype.accuracy = 0;
Coordinates.prototype.altitudeAccuracy = 0;
Coordinates.prototype.heading = 0;
Coordinates.prototype.speed = 0;

/**
 * Position interface - http://www.w3.org/TR/geolocation-API/#position
 */
function Position() {
};

Position.cast = function( p_coords, p_timestamp ) {
    // The timestamp is optional and can be auto-generated on creation
    if( typeof p_timestamp == "undefined" ) p_timestamp = (new Date()).getMilliseconds();

    var position = new Position();

    position.coords = p_coords;
    position.timestamp = p_timestamp;

    return position;
};

Position.prototype.coords = null;
Position.prototype.timestamp = 0;

/**
 * PositionError interface - http://www.w3.org/TR/geolocation-API/#position-error
 */
function PositionError() {
};

PositionError.cast = function( p_code, p_message ) {
    var positionError = new PositionError();
    positionError.code = p_code;
    positionError.message = p_message;

    return positionError;
};

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

PositionError.prototype.code = 0;
PositionError.prototype.message = "";

/**
 * PositionOptions interface - http://www.w3.org/TR/geolocation-API/#position_options_interface
 */
function PositionOptions() {
};

PositionOptions.prototype.enableHighAccuracy = false;
PositionOptions.prototype.timeout = -1;  // Timeout by default negative, which means no timeout
PositionOptions.prototype.maximumAge = 0;

/**
 * Geolocation interface - http://www.w3.org/TR/geolocation-API/#geolocation_interface
 */
function Geolocation() {
};

Geolocation.prototype.watchIds = [];
Geolocation.prototype.cachedPosition = null;

Geolocation.prototype.getCurrentPosition = function( successCallback, errorCallback, options ) {
    // Check the callbacks
    if( typeof successCallback !== "function" ) return;
    if( typeof errorCallback !== "function" ) errorCallback = function() {};

    // This is a workaround as we allow passing any object in as options (for convenience)
    var positionOptions = new PositionOptions();
    if( typeof options.maximumAge != "undefined" && options.maximumAge > 0 ) positionOptions.maximumAge = options.maximumAge;
    if( typeof options.timeout != "undefined" ) {
        if( options.timeout > 0 ) {
            positionOptions.timeout = options.timeout;
        }
        else {
            positionOptions.timeout = 0;
        }
    }
    if( typeof options.enableHighAccuracy != "undefined" ) positionOptions.enableHighAccuracy = options.enableHighAccuracy;

    // Check if the cached object is sufficient
    if( this.cachedPosition !== null && this.cachedPosition.timestamp > ((new Date()).getTime() - positionOptions.maximumAge) ) {
        successCallback( this.cachedPosition );
        return;
    }

    // Check if the timeout is 0, if yes invoke the ErrorCallback immediately
    if( positionOptions.timeout == 0 ) {
        errorCallback( PositionError.cast( PositionError.TIMEOUT, "Timeout" ) );
        return;
    }

    var timedOut = false;   // Flag for indicating a timeout
    var timeoutId = 0;   // Flag for indicating a successful location receive

    // Handle the timeout in javascript - no need for native handling
    if( options.timeout > 0 ) {
        timeoutId = window.setTimeout( function() {
                                          // Request timed out, set status and execute errorCallback
                                          timedOut = true;
                                          timeoutId = 0;
                                          errorCallback( PositionError.cast( PositionError.TIMEOUT, "Timeout" ) );
                          }, options.timeout );
    }

    // Call the native function and query for a new position
    var me = this;
    Cordova.exec( function( p_position ) {
                      received = true;

                      // Cancel timeout
                      if( timeoutId > 0 ) {
                          window.clearTimeout( timeoutId );
                      }

                      // Cache the new position
                      me.cachedPosition = p_position;

                      // Execute the successCallback if not timed out
                      if( !timedOut ) successCallback( p_position );
                  }, errorCallback, "com.cordova.Geolocation", "getCurrentPosition", [ positionOptions ] );
};

Geolocation.prototype.watchPosition = function( successCallback, errorCallback, options ) {
    // Check the callbacks
    if( typeof successCallback !== "function" ) return;
    if( typeof errorCallback !== "function" ) errorCallback = function() {};

    var watchId = this.watchIds.length + 1; // +1 in order to avoid 0 as watchId
    this.watchIds[watchId] = true;
    var me = this;

    function doWatch() {
        me.getCurrentPosition( function( p_position ) {
                                    if( !me.watchIds[watchId] ) return;

                                    successCallback( p_position );

                                    // Wait some time before starting again
                                    setTimeout( doWatch, 100 );
                                }, function( p_positionError ) {
                                    if( !me.watchIds[watchId] ) return;

                                    errorCallback( p_positionError );
                                    // Wait some time before starting again
                                    setTimeout( doWatch, 100 );
                                }, options );
    }

    // Start watching for position changes (slight delay, in order to simulate asynchronous behaviour)
    setTimeout( doWatch, 100 );

    // Return watchId
    return watchId;
};

Geolocation.prototype.clearWatch = function( watchId ) {
    this.watchIds[watchId] = false;
};

/**
 * Add the geolocation object to the navigator
 */
Cordova.addConstructor( "com.cordova.Geolocation", function () {
                            navigator.geolocation = new Geolocation();
} );
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * Notification
 * http://docs.phonegap.com/phonegap_notification_notification.md.html
 */
function Notification() {
}

Notification.prototype.alert = function( message, alertCallback, title, buttonNamne ) {
    alert( message );
    alertCallback();
}

Notification.prototype.confirm = function( message, confirmCallback, title, buttonLabels ) {
    var result = confirm( message );
    if( result ) {
        result = 1;
    }
    else {
        result = 0;
    }
    confirmCallback(result);
}

Notification.prototype.beep = function( times ) {
    Cordova.exec( null, null, "com.cordova.Notification", "beep", [times] );
}

Notification.prototype.vibrate = function( milliseconds ) {
    Cordova.exec( null, null, "com.cordova.Notification", "vibrate", [milliseconds] );
}

/**
 * Add the notification object to the navigator
 */
Cordova.addConstructor( "com.cordova.Notification", function () {
                            navigator.notification = new Notification();
                        } );
