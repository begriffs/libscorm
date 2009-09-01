//////////////////// These variables are available to content pages ///////////////////
var dc, lms, iss, nav, objectives, interactions;
///////////////////////////////////////////////////////////////////////////////////////

function boilerplate_handleException(e) {
	dc.Error(e.toString());
	try {
		if(typeof(e.description) != "undefined") { // extra IE info
			dc.Error(e.description);
		}
	} catch(f) {}
	if(DC_popupErrors) {
		dc.Show();
	}
}

function boilerplate_load() {
	dc = new DebugConsole(DC_showConsoleIcon
	                       ? document.getElementById('debug') : null,
	                      true, DC_errorImg);
	try {
		lms = new LMS(window);
		if(LMS_trackSessionTime) {
			lms.StartSessionTimer();
		}
		objectives   = new CMIBag(lms, "objectives");
		interactions = new CMIBag(lms, "interactions");
	} catch(e) {
		boilerplate_handleException(e);
	}

	document.title = SCO_title;

	// The show can go on even if the LMS fails to connect, and we can show the
	// content offline. Hence a separate try...catch to construct the navigation.
	try {
		iss = new InterScoSeq(lms, boilerplate_beforeTerminate);
		if(ISS_noExitBeforeComplete) {
			iss = new NoExitBeforeComplete(iss);
		}
		nav = new Nav(NAV_pages, 'content', lms, iss, NAV_flashParams);
		if(NAV_show) {
			nav = new AddHTMLInterface(nav, boilerplate_handleException, "nav",
			      NAV_prevEnabledImg, NAV_prevDisabledImg, NAV_nextEnabledImg, NAV_nextDisabledImg,
			      NAV_pastTickImg, NAV_presentTickImg, NAV_futureTickImg);
		}
		if(NAV_trackProgress) {
			nav = new TrackProgress(nav);
		}
		if(NAV_trackCompletion) {
			nav = new TrackCompletion(nav);
		}
	} catch(e) {
		boilerplate_handleException(e);
	}
}

function boilerplate_unload() {
	try {
		boilerplate_beforeTerminate();
		if(lms) {
			lms.SetValue("cmi.exit", LMS_suspendOnExit ? "suspend" : "normal");
			lms.Terminate();
		}
	} catch(e) {
		boilerplate_handleException(e);
	}
}

function boilerplate_beforeTerminate() {
	if(lms) {
		if(LMS_suspendOnExit) {
			nav.SaveLocation();
		}
		if(LMS_trackSessionTime) {
			lms.RecordSessionTime();
		}
	}
}
