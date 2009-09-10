function TrackCompletion(nav) {
	this.GotoPage = function(number) {
		var ret = nav.GotoPage(number);
		if(ret && nav._lms) {
			nav._lms.SetValue("cmi.completion_status",
				(nav.GetVisitedRatio() == 1) ? "completed" : "incomplete");
			nav._lms.Commit();
		}
		return ret;
	}
}

function TrackProgress(nav) {
	this.GotoPage = function(number) {
		var ret = nav.GotoPage(number);
		if(ret && nav._lms) {
			nav._lms.SetValue("cmi.progress_measure", nav.GetVisitedRatio());
			nav._lms.Commit();
		}
		return ret;
	}
}

function AddHTMLInterface(nav,             navDivId,       prevEnabledImg,
                          prevDisabledImg, nextEnabledImg, nextDisabledImg,
                          pastTickImg,     presentTickImg, futureTickImg) {
	var self = this; // used in upcoming scopes
	var x;
	var navDiv = document.getElementById(navDivId);
	if(nav.NumPages() > 1 || nav._iss.CanExitBackward()) {
		x           = new Image();
		x.id        = "prev";
		navDiv.appendChild(x);
	}
	if(nav.NumPages() > 1) { // A single page needs no navigation
		for(var i = 0; i < nav.NumPages(); i++) {
			x           = new Image();
			x.id        = "p"+i;
			x.onclick   = (function(i) { return function() { 
				try { self.GotoPage(i) } catch(e) { nav._asyncErrHandler(e) }
			} })(i);
			x.className = "tick";
			navDiv.appendChild(x);
		}
	}
	if(nav.NumPages() > 1 || nav._iss.CanExitForward()) {
		x           = new Image();
		x.id        = "next";
		navDiv.appendChild(x);
	}

	///////////////////////////////////////////////////////////////////////

	this.UpdateInterface = function() {
		if(nav.NumPages() < 2) {
			return; // A single page needs no navigation
		}
		// Update "tick" marks
		for(var i = 0; i < nav.NumPages(); i++) {
			document.getElementById("p"+i).src =
				(nav._visited[i] ? pastTickImg : futureTickImg);
		}
		document.getElementById("p"+nav.CurrentPageNum()).src = presentTickImg;
		// Set the back/forward arrows' responsiveness
		var p = document.getElementById("prev");
		var n = document.getElementById("next");
		if(p) {
			if(nav.CurrentPageNum() > 0 || nav._iss.CanExitBackward()) {
				p.onclick   = function() {
					try { self.PrevPage(); } catch(e) { nav._asyncErrHandler(e); }
				};
				p.src       = prevEnabledImg;
				p.className = "enabled";
			} else {
				p.onclick   = null;
				p.src       = prevDisabledImg;
				p.className = "disabled";
			}
		}
		if(n) {
			if(nav.CurrentPageNum() < nav.NumPages() - 1 || nav._iss.CanExitForward()) {
				n.onclick   = function() {
					try { self.NextPage(); } catch(e) { nav._asyncErrHandler(e); }
				};
				n.src       = nextEnabledImg;
				n.className = "enabled";
			} else {
				n.onclick   = null;
				n.src       = nextDisabledImg;
				n.className = "disabled";
			}
		}
	}

	this.GotoPage = function(number) {
		if(nav.GotoPage(number)) {
			this.UpdateInterface();
			return true;
		}
		return false;
	}

	this.PrevPage = function() {
		if(nav.PrevPage()) {
			this.UpdateInterface();
			return true;
		}
		return false;
	}

	this.NextPage = function() {
		if(nav.NextPage()) {
			this.UpdateInterface();
			return true;
		}
		return false;
	}
	///////////////////////////////////////////////////////////////////////

	this.UpdateInterface();
}
