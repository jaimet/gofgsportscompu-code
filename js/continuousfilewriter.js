/*
 * Copyright (C) 2011-2012 Wolfgang Koller
 * 
 * This file is part of GOFG Sports Computer - http://www.gofg.at/.
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

/**
 * Continuous filewriter for track content
 */
function ContinuousFileWriter( p_fileEntry ) {
	console.log( '[CFW] Create' );
	
	this.m_fileEntry = p_fileEntry;
	this.m_writeStack = [];
	
	// create writer for file object
	this.m_fileEntry.createWriter( Utilities.getEvtHandler(this, this._fileWriter), Utilities.getEvtHandler(this, this._fileError) );
}

ContinuousFileWriter.prototype.m_fileEntry = null;	// fileEntry originally passed
ContinuousFileWriter.prototype.m_fileWriter = null; // writer for file content
ContinuousFileWriter.prototype.m_writeStack = null;	// stack of content waiting to be written to file
ContinuousFileWriter.prototype.m_bWriting = false;	// is a write process currently running

/**
 * called when the fileWriter object is ready
 */
ContinuousFileWriter.prototype._fileWriter = function( p_fileWriter ) {
	console.log( '[CFW] fileWriter' );

	this.m_fileWriter = p_fileWriter;
	// setup event handlers
	this.m_fileWriter.onwrite = Utilities.getEvtHandler(this, this._write);
	this.m_fileWriter.onerror = Utilities.getEvtHandler(this, this._fileError);
	
	// check if stack is already populated
	this._checkWrite();
}

/**
 * called when an error occurs
 */
ContinuousFileWriter.prototype._fileError = function( p_fileError ) {
	MsgBox.error( 'Error while writing to file: ' + p_fileError.code );
}

/**
 * checks if writing should continue
 */
ContinuousFileWriter.prototype._checkWrite = function() {
	console.log( '[CFW] checkWrite' );

	if( this.m_fileWriter != null && !this.m_bWriting && this.m_writeStack.length > 0 ) {
		this.m_bWriting = true;
		this.m_fileWriter.write( this.m_writeStack.shift() );
	}
}

/**
 * called when writing has finished
 */
ContinuousFileWriter.prototype._write = function() {
	console.log( '[CFW] _write' );

	this.m_bWriting = false;
	this._checkWrite();
}

/**
 * write content to file
 */
ContinuousFileWriter.prototype.write = function( p_text ) {
	console.log( '[CFW] write' );

	this.m_writeStack.push( p_text );
	this._checkWrite();
}

/**
 * write content to file (including a newline at the end)
 */
ContinuousFileWriter.prototype.writeLine = function( p_text ) {
	console.log( '[CFW] writeLine' );

	this.m_writeStack.push( p_text + "\n" );
	this._checkWrite();
}
