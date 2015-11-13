var humanize   = require("humanize-number");
var bytes      = require("bytes");
var colorCodes = {
	5: "red",
	4: "orange",
	3: "cyan",
	2: "green",
	1: "green"
};

module.exports = function (opts) {
	return function logger (ctx, next) {
		var req = ctx.req;
		var res = ctx.res;
		var start = new Date;
		console.log(
			"%c" + "<--"
			+ " %c" + req.method
			+ " %c" + req.path,
			"color:gray",
			"color:initial;font-weight:bold",
			"color:gray;font-weight:normal"
		);


		res.original
			.once("finish", done.bind(null, "finish"))
			.once("close",  done.bind(null, "close"))

		return next()
			.catch(function (err) {
				// Log errors.
				log(ctx, start, null, err);
				throw err;
			});

		function done (event) { log(ctx, start, res.get("Content-Length"), null, event); }
	};
};

/**
 * Log helper.
 */
function log (ctx, start, len, err, event) {
	var req = ctx.req;
	var res = ctx.res;
	// Get the status code of the response.
	var status = err
		? (err.code || 500)
		: res.status;

	// Get color for status code.
	var color = colorCodes[status / 100 | 0];

	var length;
	if (~[204, 205, 304].indexOf(status)) {
		length = "";
	} else if (null == len) {
		length = "-";
	} else {
		length = bytes(len);
	}

	var startColor = "gray";
	var startText = "-->";

	if (err) {
		startColor = "red";
		startText  = "xxx";
	} else if (event === "close") {
		startColor = "orange";
		startText  = "-x-";
	}

	console.log(
		"%c" + startText
		+ "%c " + req.method
		+ "%c " + req.path
		+ "%c " + status
		+ "%c " + time(start)
		+ "%c " + length,
		"color:" + startColor,
		"color:initial;font-weight:bold",
		"color:gray;font-weight:normal",
		"color:" + color,
		"color:gray",
		"color:gray"
	);
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */
function time (start) {
	var delta = new Date - start;
	return humanize(
		delta < 10000
			? delta + "ms"
			: Math.round(delta / 1000) + "s"
	);
}