function LibScormException(code, where, desc, diag) {
	this.code  = code; // -1 means no code
	this.where = where;
	this.desc  = desc;
	this.diag  = diag;
}

LibScormException.prototype.toString = function() {
	return this.where + ": " + this.desc + ". " + this.diag
	                  + (this.code != -1 ? " (error code " + this.code + ")" : "");
}
