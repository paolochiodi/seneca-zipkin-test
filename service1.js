'use strict'

var seneca = require('seneca')
var tracer = require('./tracer')

seneca({
  tag: 'service1'
})
.client({
  type:'http',
  port:3001,
  pin: 'b:1'
})
.listen({
  type:'http',
  port:3000
})
.add('a:1', function (msg, done) {
  this.act('b:1', done)
})
.use(tracer, {
  pins: [
    'a:1',
    'b:1'
  ]
})