var seneca = require('seneca')
var tracer = require('./tracer')

seneca({
  tag: 'service3'
})
.use(tracer)
.listen({
  type:'http',
  port:3002
})
.add('c:1', function (msg, done) {
  done(null, {hello:'world'})
})