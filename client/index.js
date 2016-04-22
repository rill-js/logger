var humanize = require('humanize-number')
var bytes = require('bytes')
var colorCodes = {
  5: 'red',
  4: 'orange',
  3: 'royalblue',
  2: 'green',
  1: 'green'
}

module.exports = function (opts) {
  opts = opts || {}
  opts.group = 'group' in opts ? opts.group : false
  var method = opts.group ? 'group' : 'log'

  return function logger (ctx, next) {
    var req = ctx.req
    var res = ctx.res
    var start = new Date()

    console[method](
      '%c' + '<--' +
      ' %c' + req.method +
      ' %c' + req.path,
      'color:gray',
      'color:initial;font-weight:bold',
      'color:gray;font-weight:normal'
    )

    res.original
      .once('finish', done.bind(null, 'finish'))
      .once('close', done.bind(null, 'close'))

    return next()
      .catch(function (err) {
        // Log errors.
        log(opts, ctx, start, null, err)
        throw err
      })

    function done (event) { log(opts, ctx, start, res.get('Content-Length'), null, event) }
  }
}

/**
 * Log helper.
 */
function log (opts, ctx, start, len, err, event, group) {
  var req = ctx.req
  var res = ctx.res
  // Get the status code of the response.
  var status = err
    ? typeof err.code === 'number' || typeof err.code === 'string' ? err.code : 500
    : res.original.statusCode

  // Get color for status code.
  var color = colorCodes[status / 100 | 0]

  var length
  if (~[204, 205, 304].indexOf(status) || req.method === 'HEAD') {
    length = ''
  } else if (!len) {
    length = '-'
  } else {
    length = bytes(len)
  }

  var startColor = 'gray'
  var startText = '-->'

  if (err) {
    startColor = 'red'
    startText = 'xxx'
  } else if (event === 'close') {
    startColor = 'orange'
    startText = '-x-'
  }

  console.log(
    '%c' + startText +
    '%c ' + req.method +
    '%c ' + req.path +
    '%c ' + status +
    '%c ' + time(start) +
    '%c ' + length,
    'color:' + startColor,
    'color:initial;font-weight:bold',
    'color:gray;font-weight:normal',
    'color:' + color,
    'color:gray',
    'color:gray'
  )

  if (opts.group) console.groupEnd()
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */
function time (start) {
  var delta = new Date() - start
  return humanize(
    delta < 10000
      ? delta + 'ms'
      : Math.round(delta / 1000) + 's'
  )
}
