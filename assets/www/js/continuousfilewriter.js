function ContinuousFileWriter( p_fileEntry ) {
	// Define the member variables
	var m_writeStack = new Array();
	var m_fileEntry = p_fileEntry;
	var m_fileWriter = null;
	
	// Define our member functions
	this.writeLine = writeLine;
	this.write = write;
	this._checkWrite = _checkWrite;
	this._write = _write;
	this._fileWriter = _fileWriter;
	this._fileError = _fileError;

	// Create a writer for the file-entry
	m_fileEntry.createWriter( _fileWriter );
	
	function writeLine( p_lineText ) {
		write( p_lineText + "\n" );
	}
	
	function write( p_text ) {
		m_writeStack.push( p_text );
		
		_checkWrite();
	}

	function _checkWrite() {
//		console.log( "Checking write: " + m_fileWriter + " / " + m_fileWriter.readyState );
		
		if( m_fileWriter != null && m_fileWriter.readyState != FileWriter.WRITING ) _write();
	}
	
	function _write() {
		if( m_writeStack.length <= 0 ) return;
//		console.log( "Writing..." );
		
		m_fileWriter.write( m_writeStack.shift() );
	}
	
	// Callback once the writer is ready
	function _fileWriter( p_fileWriter ) {
//		console.log( "CFW: FileWriter ready" );
		
		m_fileWriter = p_fileWriter;
		m_fileWriter.onerror = _fileError;
		m_fileWriter.onwriteend = _checkWrite;
	}
	
	// Called whenever an error occurs
	function _fileError( p_fileError ) {
		console.log( "Error while handling file-writing: " + p_fileError.code );
	}
}
