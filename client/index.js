'use strict'

var humanize = require('humanize-number')
var bytes = require('bytes')
var colorCodes = {
  5: 'red',
  4: 'orange',
  3: 'royalblue',
  2: 'green',
  1: 'green'
}
// Check for console support.
var hasConsole = Boolean(window.console)
// Check for console.group support.
var hasGroup = hasConsole && typeof console.group === 'function'
// Check for console styling support.
var hasColors = hasConsole && Boolean(
  // is webkit? http://stackoverflow.com/a/16459606/376773
  ('WebkitAppearance' in document.documentElement.style) ||
  // is firebug? http://stackoverflow.com/a/398120/376773
  (console.firebug) ||
  // is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31)
)
var styleCode = hasColors ? '%c' : ''

module.exports = function (opts) {
  opts = opts || {}
  // Don't try to log without a console.
  if (!hasConsole) return
  // Use console.group if we have browser support and it is enabled.
  var method = hasGroup && opts.group ? 'group' : 'log'

  return function logger (ctx, next) {
    var req = ctx.req
    var res = ctx.res
    var start = new Date()
    var consoleText = (
      styleCode + '<--' +
      ' ' + styleCode + req.method +
      ' ' + styleCode + req.path
    )

    if (hasColors) {
      console[method](
        consoleText,
        'color:gray',
        'color:initial;font-weight:bold',
        'color:gray;font-weight:normal'
      )
    } else {
      console[method](consoleText)
    }

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
    ? isNaN(err.code) ? 500 : Number(err.code)
    : res.original.statusCode

  // Get color for status code.
  var color = colorCodes[status / 100 | 0] || 'red'

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

  var consoleText = (
    styleCode + startText +
    styleCode + ' ' + req.method +
    styleCode + ' ' + req.path +
    styleCode + ' ' + status +
    styleCode + ' ' + time(start) +
    styleCode + ' ' + length
  )

  if (hasColors) {
    console.log(
      consoleText,
      'color:' + startColor,
      'color:initial;font-weight:bold',
      'color:gray;font-weight:normal',
      'color:' + color,
      'color:gray',
      'color:gray'
    )
  } else {
    console.log(consoleText)
  }

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
