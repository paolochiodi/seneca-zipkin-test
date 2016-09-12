var seneca = require('seneca')
var tracer = require('./tracer')

seneca({
  tag: 'service2'
})
.client({
  type:'http',
  port:3002,
  pin: 'c:1'
})
.listen({
  type:'http',
  port:3001
})
.add('b:1', function (msg, done) {
  this.act('c:1', done)
})
.use(tracer, {
  pins: [
    'b:1',
    'c:1'
  ]
})