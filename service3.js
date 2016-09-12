var seneca = require('seneca')
var tracer = require('./tracer')

seneca({
  tag: 'service3'
})
.listen({
  type:'http',
  port:3002
})
.add('c:1', function (msg, done) {
  done(null, {hello:'world'})
})
.use(tracer, {
  pins: ['c:1']
})