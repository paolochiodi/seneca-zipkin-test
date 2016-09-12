'use strict'

var seneca = require('seneca')
var tracer = require('./tracer')

seneca({
  tag: 'client1'
})
.client({
  type:'http',
  port:3000,
  pin: 'a:1'
})
.use(tracer, {
  pins: ['a:1']
})
.act('a:1', function (err, msg) {
  console.log(err, msg)
  setTimeout(process.exit, 2000)
});