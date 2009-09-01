function NoExitBeforeComplete(iss) {
	this.CanExitForward = function() {
		return iss._lms
		       && (iss._lms.GetValue("cmi.completion_status")
		           == "completed")
		       && iss.CanExitForward();
	}
	this.CanExitBackward = function() {
		return iss._lms
		       && (iss._lms.GetValue("cmi.completion_status")
		           == "completed")
		       && iss.CanExitBackward();
	}
}

