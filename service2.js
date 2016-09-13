var seneca = require('seneca')
var async = require('async')
var tracer = require('./tracer')

seneca({
  tag: 'service2'
})
.use(tracer)
.client({
  type:'http',
  port:3002,
  pin: 'c:1'
})
.listen({
  type:'http',
  port:3001
})
.add('internal:1', function (msg, done) {
  var seneca = this
  async.parallel({
    result: function (next) { seneca.act('c:1', next) },
    fake: function (next) { seneca.act('internal:2', next) }
  }, function (err, res) {
    done(err,res && res.result)
  })
})
.add('internal:2', function (msg, done) {
  process.nextTick(function () {
    done()
  })
})
.add('b:1', function (msg, done) {
  this.act('internal:1', done)
})