'use strict'

var fs = require('fs')
var agent = require('supertest')
var Rill = require('rill')
var logger = require('../server')

describe('Rill/Logger', function () {
  it('should work on the server', function (done) {
    var request = agent(
      Rill()
        .use(logger({ group: true }))
        .use(function (ctx, next) {
          ctx.res.body = fs.createReadStream(__filename)
          return next()
        })
        .get('/', respond(200))
        .listen()
    )

    request
      .get('/')
      .expect(200)
      .end(done)
  })
})

function respond (status, test) {
  return function (ctx) {
    ctx.res.status = status
    if (typeof test === 'function') test(ctx)
  }
}
