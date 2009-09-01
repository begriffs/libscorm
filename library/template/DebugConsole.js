function DebugConsole(iconDiv, showDebugLines, errorImg) {
	this._wnd     = null;
	this._visible = false;
	this._lines   = new Array();
	this._iconDiv = iconDiv;
	this._logDbg  = showDebugLines;
	this._hasErr  = false;
	this._errorImg   = errorImg;
	if(this._iconDiv) {
		var img = document.createElement("img");
		img.id  = "debugicon";
		img.alt = "No SCORM Errors";
		img.style.display = "none";
		var self = this;
		img.onclick = function() { self.Show(); return false; }
		this._iconDiv.appendChild(img);
	}
}

DebugConsole.prototype.Show = function() {
	if(this._visible) {
		return;
	}
	this._visible = true;

	this._wnd = window.open("", "DebugConsoleWnd", "width=500, height=400, resizable=yes, scrollbars=yes, status=no", false);
	if(this._wnd == null) {
		return false;
	}
	var self = this;
	var bye = function() { self._onUnload(); }
	if (typeof this._wnd.addEventListener != "undefined") { // DOM2
		this._wnd.addEventListener("unload", bye, false);
	} else if (typeof this._wnd.attachEvent != "undefined") { // IE
		this._wnd.attachEvent("onunload", bye);
	} else {
		this._wnd.onunload = bye;
	}
	
	var doc = this._wnd.document;
	doc.title = "SCORM Console";

	var l = doc.createElement("ul");
	l.setAttribute("id", "lines");
	// to remove list bullets, uncomment
	// l.setAttribute("style", "list-style:none");
	doc.getElementsByTagName("body")[0].appendChild(l);
	for(var i = 0; i < this._lines.length; i++) {
		this._showLine(this._lines[i]);
	}
}

DebugConsole.prototype.Hide = function() {
	if(this._visible) {
		this._wnd.close();
	}
}

DebugConsole.prototype.Error = function(line) {
	if(!this._hasErr && this._iconDiv) {
		document.getElementById("debugicon").style.display = 'block';
		document.getElementById("debugicon").src = this._errorImg;
		document.getElementById("debugicon").alt = "SCORM Errors";
	}
	this._hasErr = true;
	this._addLine({text: line, error: true});
}

DebugConsole.prototype.Dbg = function(line) {
	if(this._logDbg) {
		this._addLine({text: line, error: false});
	}
}

DebugConsole.prototype.HasError = function() {
	return this._hasErr;
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////// PRIVATE STUFF ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////

DebugConsole.prototype._wnd;
DebugConsole.prototype._visible;
DebugConsole.prototype._lines;
DebugConsole.prototype._logDbg;
DebugConsole.prototype._hasErr;
DebugConsole.prototype._iconDiv;
DebugConsole.prototype._errorImg;

DebugConsole.prototype._addLine = function(line) {
	if(this._iconDiv) {
		this._iconDiv.style.display = "inline";
	}
	this._lines.push(line);
	if(this._visible) {
		this._showLine(line);
	}
}

DebugConsole.prototype._showLine = function(line) {
	var doc = this._wnd.document;
	var li = doc.createElement("li");
	li.appendChild(doc.createTextNode(line.text));
	if(line.error) {
		li.style.color = "red";
	}
	doc.getElementById("lines").appendChild(li);
}

DebugConsole.prototype._onUnload = function() {
	this._visible = false;
}

