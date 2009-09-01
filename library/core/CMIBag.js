// Examples of CMI bags: objectives and interactions. This code abstracts the
// array implementation details, and minimizes SCORM calls by caching.

function CMIBag(lms, bagname) {
	this._lms      = lms;
	this._bag      = bagname;
	this._idCache  = new Object();
	this._nCache   = -1;
	this._lastSeek = 0;
}

CMIBag.prototype.GetValue = function(id, elem) {
	var i = this.GetIndex(id);
	if(i == -1) {
		throw new LibScormException(-1, "CMIBag::GetElement",
			"Identifier '" + id + "' not found in collection 'cmi." + this._bag + "'.", "");
	}
	return this._lms.GetValue(["cmi", this._bag, i, elem].join("."));
}

CMIBag.prototype.SetValue = function(id, elem, val) {
	var i = this.GetIndex(id);
	if(i == -1) {
		i = this._addId(id);
	}
	this._lms.SetValue(["cmi", this._bag, i, elem].join("."), val);
}

CMIBag.prototype.GetElementList = function() {
	var ret = new Array(this._getCount());
	for(var i = 0; i < this._getCount(); i++) {
		ret[i] = this._lms.GetValue(["cmi", this._bag, i, "id"].join("."));
	}
	return ret;
}

CMIBag.prototype.GetIndex = function(id) {
	if(typeof this._idCache[id] != "undefined") {
		return this._idCache[id];
	}
	for( ; this._lastSeek < this._getCount(); this._lastSeek++) {
		var x = this._lms.GetValue(["cmi", this._bag, this._lastSeek, "id"].join("."));
		this._idCache[x] = this._lastSeek;
		if(x == id) {
			return this._lastSeek;
		}
	}
	return -1;
}

CMIBag.prototype._getCount = function() {
	if(this._nCache < 0) {
		this._nCache = this._lms.GetValue(["cmi", this._bag, "_count"].join("."));
	}
	return this._nCache;
}

CMIBag.prototype._addId = function(id) {
	this._lms.SetValue(["cmi", this._bag, this._getCount(), "id"].join("."), id);
	this._idCache[id] = this._getCount();
	return this._nCache++;
}

CMIBag.prototype._lms;
CMIBag.prototype._bag;
CMIBag.prototype._idCache;
CMIBag.prototype._nCache;
CMIBag.prototype._lastSeek;
