// Nav can function with or without an LMS. Without an LMS (lms==null in constructor)
// it simply displays the content

function Nav(pageUrls, contentDivId, lms, iss, asyncErrHandler, flashParams) {
	this._lms             = lms;
	this._iss             = iss || new InterScoSeq(lms);
	this._asyncErrHandler = asyncErrHandler
	                        || function(e) { alert(e.toString()) };
	this._contentDiv      = contentDivId;
	this._atPage          = -1;
	this._pages           = pageUrls;
	this._visited         = new Array();
	this._asyncErrHandler = asyncErrHandler;
	this._flashParams     = flashParams;

	// If already been in the SCO, then go back to page where user left off
	this.GotoPage(this.LoadLocation());
}

Nav.prototype.GotoPage = function(number) {
	if(number < 0 || number >= this.NumPages()) {
		return false;
	}
	this.OnBeforeMove();
	this._visited[number] = true;
	this._atPage = number;
	var url = this._pages[this.CurrentPageNum()];
	if(url.match(/\.swf/i)) {
		this._loadSWF(url);
	} else {
		this._loadHTML(url);
	}
	return true;
};

Nav.prototype.NextPage = function() {
	return (this.CurrentPageNum() == this.NumPages() - 1)
		? this._iss.ExitForward()
		: this.GotoPage(this._atPage + 1);
};

Nav.prototype.PrevPage = function() {
	return (this.CurrentPageNum() == 0)
		? this._iss.ExitBackward()
		: this.GotoPage(this._atPage - 1);
};

Nav.prototype.CurrentPageNum = function() {
	return this._atPage;
};

Nav.prototype.NumPages = function() {
	return this._pages.length;
};

Nav.prototype.SaveLocation = function() {
	if(this._lms) {
		var s = this.CurrentPageNum() + ",";
		for(var i = 0; i < this.NumPages(); i++) {
			s += this._visited[i] ? 't' : 'f';
		}
		this._lms.SetValue("cmi.location", s);
	}
};

Nav.prototype.LoadLocation = function() {
	var loc = 0;
	var i;
	try {
		if(!this._lms) {
			return 0;
		}
		var s = this._lms.GetValue("cmi.location").split(',');
		loc = Number(s[0]);
		for(i = 0; i < s[1].length; i++) {
			this._visited[i] = (s[1].charAt(i) == 't');
		}
	} catch(e) {
		if(e.code == 403) { // cmi.location uninitialized: first time in the SCO
			for(i = 0; i < this.NumPages(); i++) {
				this._visited[i] = false;
			}
		} else { // a real problem
			throw e;
		}		
	}
	return loc;
};

Nav.prototype.GetVisitedRatio = function() {
	var v=0;
	for(var i = 0; i < this.NumPages(); i++) {
		v += (this._visted[i] ? 1 : 0);
	}
	return this.NumPages() ? (v / this.NumPages()) : 1;
};

Nav.prototype.OnPageLoad = function(which) {};
Nav.prototype.OnBeforeMove = function() {};

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////// PRIVATE STUFF ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////

Nav.prototype._loadSWF = function(url) {
	var content = document.getElementById(this._contentDiv);
	content.innerHTML = "<div id='swfage' />";
	swfobject.embedSWF(url, "swfage", "100%", "100%", "9.0.0",
	                   "expressInstall.swf", {}, this._flashParams);
};

Nav.prototype._loadHTML = function(url) {
	var req = new XMLHttpRequest();
	var handler = this._asyncErrHandler;
	var divId = this._contentDiv;
	req.open("GET", url, true);
	var self = this;
	req.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if(this.status == 200 || this.status == 0) {
				var div = document.getElementById(divId);
				div.innerHTML = this.responseText;
				var scripts = div.getElementsByTagName('script');
				var head = document.getElementsByTagName('HEAD').item(0);
				for(var i = 0; i < scripts.length; i++) {
					var s = document.createElement("script");
					s.type = "text/javascript";
					if(scripts[i].src) {
						s.src = scripts[i].src;
					} else {
						s.text = scripts[i].innerHTML;
					}
					head.appendChild(s);
				}
				self.OnPageLoad(self.CurrentPageNum());
			} else {
				handler(new LibScormException(
					this.status,
					"Nav::GotoPage ajax callback",
					"HTTP request for " + url + " failed",
					"See HTTP spec to interpret error code"));
			}
		}
	};
	req.send(null); 
};

Nav.prototype._lms;
Nav.prototype._iss;
Nav.prototype._contentDiv;
Nav.prototype._atPage;
Nav.prototype._pages;
Nav.prototype._visited;
Nav.prototype._asyncErrHandler;
Nav.prototype._flashParams;
