function InterScoSeq(lms, onBeforeTerminate) {
	this._lms               = lms;
	this._onBeforeTerminate = onBeforeTerminate;
}

////////////////////// QUERIES ////////////////////////
InterScoSeq.prototype.CanExitForward = function() {
	return this._canDo("continue");
}
InterScoSeq.prototype.CanExitBackward = function() {
	return this._canDo("previous");
}
InterScoSeq.prototype.CanExitChoice = function(target) {
	return this._canDo("choice.{target=" + target + "}");
}

////////////////////// COMMANDS ////////////////////////
InterScoSeq.prototype.ExitForward = function() {
	return this._do("continue");
}
InterScoSeq.prototype.ExitBackward = function() {
	return this._do("previous");
}
InterScoSeq.prototype.ExitChoice = function(target) {
	return this._do("{target = " + target + "}choice");
}
InterScoSeq.prototype.ExitAll = function() {
	return this._do("exitAll");
}

////////////////////// PRIVATE  ////////////////////////
InterScoSeq.prototype._canDo = function(req) {
	if(lms) {
		if(req == "exitAll") {
			return true;
		}
		try {
			return (lms.GetValue('adl.nav.request_valid.' + req) == "true");
		} catch(e) {
			if(e.code != 401) { // something other than simple non-support
					    // for inter-sco sequencing
				throw e;
			}
		}
	}
	return false;
}

InterScoSeq.prototype._do = function(req) {
	if(!this._canDo(req)) {
		return false;
	}
	this._onBeforeTerminate();
	this._lms.SetValue("adl.nav.request", req);
	this._lms.Terminate();
	return true;
}

InterScoSeq.prototype._lms;
InterScoSeq.prototype._onBeforeTerminate;
