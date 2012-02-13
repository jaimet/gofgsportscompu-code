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

PhoneGap = {
    plugins: {},
    constructors: {},
    callbacks: [],
};

/*
 * Execute a callback function & remove it from the PhoneGap object
 */
PhoneGap.callback = function() {
    var scId = arguments[0];
    var callbackRef = null;

    var parameters = [];
    for( var i = 1; i < arguments.length; i++ ) {
        //debug.log( "Adding parameter " + arguments[i] );
        parameters[i-1] = arguments[i];
    }
    // Keep reference to callback
    callbackRef = PhoneGap.callbacks[scId];

    // Even IDs are success-, odd are error-callbacks - make sure we remove both
    if( (scId % 2) !== 0 ) {
        scId = scId - 1;
    }
    // Remove both the success as well as the error callback from the stack
    PhoneGap.callbacks.splice( scId, 2 );

    // Finally run the callback
    if( typeof callbackRef == "function" ) callbackRef.apply( this, parameters );
};

/*
 * Enable a plugin for use within PhoneGap
 */
PhoneGap.enablePlugin = function( pluginName ) {
    // Enable the plugin
    PhoneGap.plugins[pluginName] = true;

    // Run constructor for plugin if available
    if( typeof PhoneGap.constructors[pluginName] == "function" ) PhoneGap.constructors[pluginName]();
}

/*
 * Add a plugin-specific constructor function which is called once the plugin is loaded
 */
PhoneGap.addConstructor = function( pluginName, constructor ) {
    PhoneGap.constructors[pluginName] = constructor;
}

/**
 * Event interface - http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event
 */
PhoneGap.Event = function() {
};

PhoneGap.Event.CAPTURING_PHASE = 1;
PhoneGap.Event.AT_TARGET = 2;
PhoneGap.Event.BUBBLING_PHASE = 3;

PhoneGap.Event.prototype.type = "unknown";
PhoneGap.Event.prototype.target = PhoneGap;
PhoneGap.Event.prototype.currentTarget = PhoneGap;
PhoneGap.Event.prototype.eventPhase = PhoneGap.Event.AT_TARGET;
PhoneGap.Event.prototype.bubbles = false;
PhoneGap.Event.prototype.cancelable = false;
PhoneGap.Event.prototype.timeStamp = 0;

PhoneGap.Event.prototype.stopPropagation = function() {};
PhoneGap.Event.prototype.preventDefault = function() {};
PhoneGap.Event.prototype.initEvent = function( eventTypeArg, canBubbleArg, cancelableArg ) {
    this.type = eventTypeArg;
    this.timeStamp = (new Date()).getMilliseconds();
};

/*
 * EventHandler interface - handles one type of event
 * Not W3C defined, but required in order to handle our custom events
 */
PhoneGap.EventHandler = function( p_type ) {
    this.type = p_type;
}

PhoneGap.EventHandler.prototype.type = "unknown";
PhoneGap.EventHandler.prototype.listeners = [];
PhoneGap.EventHandler.prototype.addEventListener = function( p_listener, p_capture ) {
    if( p_capture ) {
        this.listeners.unshift( p_listener );
    }
    else {
        this.listeners.push( p_listener );
    }
};

PhoneGap.EventHandler.prototype.removeEventListener = function( p_listener, p_capture ) {
    // Try to find the event listener in our list
    for( var i = 0; i < this.listeners.length; i++ ) {
        if( this.listeners[i] == p_listener ) {
            // Remove the listener from our queue
            this.listeners.splice( i, 1 );
            return;
        }
    }
};

PhoneGap.EventHandler.prototype.dispatchEvent = function() {
    var event = new PhoneGap.Event();
    event.initEvent( this.type, false, false );

    // Translate arguments into an array including the custom event as first element
    var parameters = [ event ];
    for( var i = 0; i < arguments.length; i++ ) {
        parameters[i+1] = arguments[i];
    }

    // Notify all listeners about this event
    for( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[i].apply(PhoneGap, parameters);
    }
};

/*
 * Create the custom phonegap events
 */
PhoneGap.events = {
    deviceready: new PhoneGap.EventHandler( "deviceready" ),
    resume: new PhoneGap.EventHandler( "resume" ),
    pause: new PhoneGap.EventHandler( "pause" )
};

/*
 * EventTarget interface - http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */
//Keep references to the original EventTarget implementations
PhoneGap.doc_addEventListener = document.addEventListener;
PhoneGap.doc_removeEventListener = document.removeEventListener;
PhoneGap.doc_dispatchEvent = document.dispatchEvent;

document.addEventListener = function( type, listener, useCapture ) {
    if( typeof PhoneGap.events[type] != "undefined" ) {
        PhoneGap.events[type].addEventListener( listener, useCapture );
    }
    else {
        PhoneGap.doc_addEventListener.call(document, type, listener, useCapture);
    }
};

document.removeEventListener = function( type, listener, useCapture ) {
    if( typeof PhoneGap.events[type] != "undefined" ) {
        PhoneGap.events[type].removeEventListener( listener, useCapture );
    }
    else {
        PhoneGap.doc_removeEventListener.call(document, type, listener, useCapture);
    }
};

document.dispatchEvent = function( evt ) {
    if( typeof PhoneGap.events[evt.type] != "undefined" ) {
        PhoneGap.events[evt.type].dispatchEvent();
    }
    else {
        PhoneGap.doc_dispatchEvent.call(document, evt);
    }
};

/*
 * Trigger the global deviceready event - fired from native code
 */
PhoneGap.deviceready = function() {
    PhoneGap.events.deviceready.dispatchEvent();
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

PhoneGap.Qt = {};

/**
 * Execute a call to a plugin function
 * @return bool true on success, false on error (e.g. function doesn't exist)
 */
PhoneGap.Qt.exec = function( successCallback, errorCallback, pluginName, functionName, parameters ) {
    // Check if plugin is enabled
    if( PhoneGap.plugins[pluginName] !== true ) {
        return false;
    }

    // Check if we can find the function
    if( typeof PhoneGap.Qt.objects[pluginName][functionName] != "function" ) {
        return false;
    }

    // Store a reference to the callback functions
    var scId = PhoneGap.callbacks.length;
    var ecId = scId + 1;
    PhoneGap.callbacks[scId] = successCallback;
    PhoneGap.callbacks[ecId] = errorCallback;

    parameters.unshift( ecId );
    parameters.unshift( scId );

    // Call the function
    /*debug.log( "Call: " + pluginName + " / " + functionName );
    debug.log( "P-Obj: " + (typeof PhoneGap.plugins[pluginName]) );
    debug.log( "P-Func: " + (typeof PhoneGap.plugins[pluginName][functionName]) );*/
    //PhoneGap.plugins[pluginName][functionName](scId, ecId, parameters);
    PhoneGap.Qt.objects[pluginName][functionName].apply(this, parameters);

    return true;
}

/**
 * Function which is called from the native bridge in order to register the QtWebKit bridge objects
 */
PhoneGap.Qt.objects = {};
PhoneGap.Qt.registerObject = function( pluginName, pluginObject ) {
    PhoneGap.Qt.objects[pluginName] = pluginObject;
}

PhoneGap.exec = PhoneGap.Qt.exec;
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

    PhoneGap.exec( function( p_type ) {
                      // Save new type
                      me.type = p_type;

                      console.log( "Connection - new type: " + p_type );

                      // Register new callback instance in order to receive future updates
                      setTimeout( navigator.network.connection.setChangeCallback, 100 );
                  }, null, "com.phonegap.Connection", "setChangeCallback", [] );
}

PhoneGap.addConstructor( "com.phonegap.Connection", function() {
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
    PhoneGap.exec( null, null, "com.phonegap.Console", "log", [p_message] );
}

PhoneGap.addConstructor( "com.phonegap.Console", function() {
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
    PhoneGap.exec( function( p_name, p_phonegap, p_platform, p_uuid, p_version ) {
                      me.name = p_name;
                      me.phonegap = p_phonegap;
                      me.platform = p_platform;
                      me.uuid = p_uuid;
                      me.version = p_version;
                  }, null, "com.phonegap.Device", "getInfo", [] );
};

Device.prototype.name = "";
Device.prototype.phonegap = "";
Device.prototype.platform = "";
Device.prototype.uuid = "";
Device.prototype.version = "";

PhoneGap.addConstructor( "com.phonegap.Device", function() {
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
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "getMetadata", [this.fullPath]);
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
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "remove", [this.fullPath]);
}
Entry.prototype.getParent = function( successCallback, errorCallback ) {
        // Ask the system for our parent
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "getParent", [this.fullPath]);
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
        PhoneGap.exec(function(p_position, p_length) {
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
        }, "com.phonegap.File", "write", [this.fullPath, this.position, data]);
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
        PhoneGap.exec(function(p_position, p_length) {
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
        }, "com.phonegap.File", "truncate", [this.fullPath, size]);
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
        PhoneGap.exec(function( p_data ) {
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
        }, "com.phonegap.File", "readAsDataURL", [file.fullPath]);
}
FileReader.prototype.readAsDataURL = function( file ) {
        this.readyState = FileReader.EMPTY;
        this.result = null;

        this.readyState = FileReader.LOADING;

        if( typeof this.onloadstart === "function" ) this.onloadstart( FileSaver.createEvent( "loadstart", this) );

        var me = this;

        // Lets read the file...
        PhoneGap.exec(function( p_data ) {
                me.readyState = FileReader.DONE;
                me.result = p_data;

                if( typeof me.onloadend === "function" ) me.onloadend( FileSaver.createEvent( "loadend", me) );
        }, function( p_fileError ) {
                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = p_fileError;

                if( typeof me.onloadend === "function" ) me.onloadend( FileSaver.createEvent( "loadend", me) );
                if( typeof me.onerror === "function" ) me.onerror( FileSaver.createEvent( "error", me) );
        }, "com.phonegap.File", "readAsDataURL", [file.fullPath]);
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
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "file", [this.fullPath]);
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
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "readEntries", [this.fullPath]);
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
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "getFile", [requestPath, options]);
}
DirectoryEntry.prototype.getDirectory = function( path, options, successCallback, errorCallback ) {
        var requestPath = path;

        // Check for a relative path
        if( requestPath.charAt(0) != '/' ) requestPath = this.fullPath + requestPath;
        // Make sure we have a trailing slash
        if( requestPath.charAt(requestPath.length - 1) != '/' ) requestPath = requestPath + "/";

        // Lets get the directory
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "getDirectory", [requestPath, options]);
}
DirectoryEntry.prototype.removeRecursively = function( successCallback, errorCallback ) {
        // Remove the directory
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "removeRecursively", [this.fullPath]);
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
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "requestFileSystem", [type, size]);
}
LocalFileSystem.prototype.resolveLocalFileSystemURL = function( url, successCallback, errorCallback ) {
        PhoneGap.exec(successCallback, errorCallback, "com.phonegap.File", "resolveLocalFileSystemURL", [url]);
}

/**
 * Let window implement the localfilesystem
 */
PhoneGap.addConstructor( "com.phonegap.File", function () {
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
    PhoneGap.exec( function( p_position ) {
                      received = true;

                      // Cancel timeout
                      if( timeoutId > 0 ) {
                          window.clearTimeout( timeoutId );
                      }

                      // Cache the new position
                      me.cachedPosition = p_position;

                      // Execute the successCallback if not timed out
                      if( !timedOut ) successCallback( p_position );
                  }, errorCallback, "com.phonegap.Geolocation", "getCurrentPosition", [ positionOptions ] );
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
PhoneGap.addConstructor( "com.phonegap.Geolocation", function () {
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
    PhoneGap.exec( null, null, "com.phonegap.Notification", "beep", [times] );
}

Notification.prototype.vibrate = function( milliseconds ) {
    PhoneGap.exec( null, null, "com.phonegap.Notification", "vibrate", [milliseconds] );
}

/**
 * Add the notification object to the navigator
 */
PhoneGap.addConstructor( "com.phonegap.Notification", function () {
                            navigator.notification = new Notification();
                        } );
