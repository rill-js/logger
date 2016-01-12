var Counter  = require("passthrough-counter");
var humanize = require("humanize-number");
var bytes    = require("bytes");
var chalk    = require("chalk");
var colorCodes = {
	5: "red",
	4: "yellow",
	3: "cyan",
	2: "green",
	1: "green"
};

module.exports = function (opts) {
	opts       = opts || {};
	opts.group = "group" in opts ? opts.group : false;
	var method = opts.group ? "group" : "log";

	// Shim console.group in node.
	if (opts.group) require("console-group").install();

	return function logger (ctx, next) {
		var req = ctx.req;
		var res = ctx.res;
		var start = new Date;
		console[method](
			"  " + chalk.gray("<--")
			+ " " + chalk.bold("%s")
			+ " " + chalk.gray("%s"),
			req.method,
			req.path
		);

		res.original
			.once("finish", done.bind(null, "finish"))
			.once("close",  done.bind(null, "close"))

		return next()
			.then(function () {
				// Track content length if not pre-defined.
				if (!isStream(res.body) || res.get("Content-Length")) return;	
				var counter = new Counter();
				res.body
					.pipe(counter)
					.once("finish", function () { res.set("Content-Length", counter.length); });
			})
			.catch(function (err) {
				// Log errors.
				log(opts, ctx, start, null, err);
				throw err;
			});

		function done (event) { log(opts, ctx, start, res.get("Content-Length"), null, event); }
	};
};

/**
 * Log helper.
 */
function log (opts, ctx, start, len, err, event) {
	var req = ctx.req;
	var res = ctx.res;
	// Get the status code of the response.
	var status = err && typeof err.code == "number"
		? (err.code || 500)
		: res.original.statusCode;

	// Get color for status code.
	var color = colorCodes[status / 100 | 0];

	var length;
	if (~[204, 205, 304].indexOf(status) || req.method === "HEAD") {
		length = "";
	} else if (!len) {
		length = "-";
	} else {
		length = bytes(len);
	}

	var upstream = err
		? chalk.red("xxx")
		: event === "close"
			? chalk.yellow("-x-")
			: chalk.gray("-->");

	console.log(
		"  " + upstream
		+ " " + chalk.bold("%s")
		+ " " + chalk.gray("%s")
		+ " " + chalk[color]("%s")
		+ " " + chalk.gray("%s")
		+ " " + chalk.gray("%s"),
		req.method,
		req.path,
		status,
		time(start),
		length
	);

	if (opts.group) console.groupEnd();
}

/**
 * Utility to test that a value is a stream.
 */
function isStream (val) {
	return val && typeof val.pipe === "function" && val.readable;
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
