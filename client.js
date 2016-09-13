'use strict'

var seneca = require('seneca')
var tracer = require('./tracer')

seneca({
  tag: 'client1'
})
.use(tracer)
.client({
  type:'http',
  port:3000,
  pin: 'a:1'
})
.ready(function () {
  this.act('a:1', function (err, msg) {
    console.log(err, msg)
    setTimeout(process.exit, 2000)
  });
})