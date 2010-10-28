//////////////////////////////////////////////////////////////////////////////
// This library finds the DOM object API_1484_11 and wraps its API, throwing
// clear, detailed exceptions upon any error. This saves you from having to
// both constantly check for error codes and translate them when they appear.
//////////////////////////////////////////////////////////////////////////////

"use strict";

var LibScormException; /*global LibScormException: false */

function LMS(win) {
	this.Terminate = function() {
		if(this._terminated) {
			return;
		}
		this._terminated = true;
		this._wrap("Terminate", true, "");
	};

	this.IsTerminated = function() {
		return this._terminated;
	};

	this.GetValue = function(name) {
		return this._wrap("GetValue", false, name);
	};

	this.SetValue = function(name, value) {
		this._wrap("SetValue", true, name, value);
	};

	this.Commit = function() {
		this._wrap("Commit", true, "");
	};

	this.StartSessionTimer = function() {
		this._isTimePaused = false;
	};

	this.PauseSessionTimer = function() {
		this._isTimePaused = true;
	};

	this.RecordSessionTime = function() {
		this.SetValue("cmi.session_time", this._secondsToDuration(this._time));
	};

	//////////////////////////////////////////////////////////////////////////////
	//                              DISCOURAGED STUFF
	// You won't need these error info methods. Rely on exception handling in
	// JavaScript SCOs. The methods are included only for Flash SCOs (which
	// can't catch exceptions).
	//////////////////////////////////////////////////////////////////////////////

	this.GetLastError = function() {
		return this._api.GetLastError();
	};

	this.GetDiagnostic = function(errorCode) {
		return this._api.GetDiagnostic(errorCode);
	};

	this.GetErrorString = function(errorCode) {
		return this._api.GetErrorString(errorCode);
	};

	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////// PRIVATE STUFF ///////////////////////////////
	//////////////////////////////////////////////////////////////////////////////

	this._api          = null;
	this._time         = 0;
	this._isTimePaused = true;
	this._terminated   = false;

	// _wrap passes along any extra arguments
	this._wrap = function(func, isBoolean) {
		var args = [];
		for(var i = 2; i < arguments.length; i++) {
			// These arguments will appear in an eval, so we MUST
			// escape them since we're wrapping them in another quote layer
			args.push((typeof arguments[i] == 'string') ?
				'"' + this._quoteString(arguments[i]) + '"' :
				arguments[i]);
		}
		// You may wonder, "Why not simply use this._api[func].apply(...)?"
		// Certainly we wouldn't have to mess with quoting the arguments, etc.
		// The answer is that LiveConnect does not offer us a real object
		// with function members, e.g. typeof this._api["Initialize"] == undefined
		var result = eval("this._api." + func + "(" + args.join(",") + ");");

		// boolean functions afford us an optimization: if the function returns
		// true then we needn't GetLastError (another costly call to the LMS)
		if(!isBoolean || result != "true") {
			var err = this._api.GetLastError();
			if(err != 0) {
				throw new LibScormException(
					err,
					"LMS::" + func + "(" + args.join(",") + ")",
					this._api.GetErrorString(err),
					this._api.GetDiagnostic(err));
			}
		}
		return result;
	};

	this._quoteString = function(str) {
		str = str.replace(/(["'\\])/g,'\\$1');
		str = str.replace(/\x0D/g,"\\r");
		str = str.replace(/\x0A/g,"\\n");
		return str;
	};

	// _getAPI and _scanForAPI functions adapted from
	// http://www.ostyn.com/standards/scorm/samples/api_discovery_ff_issue.htm

	this._getAPI = function(win) {
		try {
			var ret = this._scanParentsForAPI(win);
			return ret ? ret : this._scanParentsForAPI(win.opener);
		} catch(e) {
			return null;
		}
	};

	this._scanParentsForAPI = function(win) {
		var api;
		do {
			api = win.API_1484_11 || null;
			if (win.parent === null || win.parent == win) {
				break;
			}
			win = win.parent;
		} while (!api);
		return api;
	};

	this._secondsToDuration = function(time) {
		var result;
		if(time === 0) {
			result = "PT0H0M0S";
		} else {
			result = "P";
			var tmp = time;
			var years = Math.floor(tmp / 31536000);
			tmp -= years * 31536000;
			var months = Math.floor(tmp / 2592000);
			tmp -= months * 2592000;
			var days = Math.floor(tmp / 86400);
			tmp -= days * 86400;
			var hours = Math.floor(tmp / 3600);
			tmp -= hours * 3600;
			var minutes = Math.floor(tmp / 60);
			tmp -= minutes * 60;
			var seconds = Math.floor(tmp);
			tmp -= seconds;
			//Now we are dealing with some fraction of seconds
			//We need to round it to 100ths
			var centisecs = Math.round(tmp * 100);

			if(years > 0) {
				result += years + "Y";
			}
			if(months > 0) {
				result += months + "M";
			}
			if(days > 0) {
				result += days + "D";
			}
			result += "T";
			result += hours + "H";
			result += minutes + "M";
			result += seconds + (centisecs > 0? "." + centisecs: "") + "S";
		}
		return result;
	};

	///// INITIALIZE /////////////////////////////////////////////////////////////

	this._api  = this._getAPI(win);
	if(this._api === null) {
		throw new LibScormException(
			-1, "LMS::LMS",
			"The SCORM API is not available.",
			"This SCO might not be running within an LMS environment.");
	}
	this._wrap("Initialize", true, "");

	var self = this;
	setInterval(function(){ if(!self._isTimePaused) { self._time++; } }, 1000);
}
