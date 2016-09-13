
var tracer = require('../zipkin');

function handler(msg, done) {
  var pin = msg.meta$.pattern
  if (msg.transport$)
    return handle_as_server(this, pin, msg, done)

  handle_as_client(this, pin, msg, done)
}

function wrap_add(seneca) {
  var root = seneca;
  var api_add = root.add;
  root.add = function (pattern, cb, data) {
    api_add.apply(this, arguments)
    api_add.call(seneca, pattern, handler)
  }
}

function internal_action(action) {
  return  action.match.role === 'seneca' || action.match.role === 'transport' || action.match.role === 'options'
}

function override_actions(seneca) {
  var actions = seneca.private$.actrouter.list()
  for (var i = 0; i < actions.length; i++) {
    var action = actions[i]

    if (!internal_action(action)) {
      seneca.add(action.match, handler)
    }
  }
}

function handle_as_client(context, pin, msg, done) {
  var service = context.private$.optioner.get().tag
  var trace_data = tracer.get_child(context.fixedargs.tracer)
  tracer.client_send(trace_data, {
    service: service,
    name: pin
  })

  context.fixedargs.tracer = trace_data

  context.prior(msg, function (err, msg) {
    tracer.client_recv(trace_data, {
      service: service,
      name: pin
    })

    done(err, msg)
  })
}

function handle_as_server(context, pin, msg, done) {
  var service = context.private$.optioner.get().tag
  var trace_data = tracer.get_data(msg.tracer)
  tracer.server_recv(trace_data, {
    service: service,
    name: pin
  })

  msg.tracer = context.fixedargs.tracer = trace_data

  context.prior(msg, function (err, msg) {
    tracer.server_send(trace_data, {
      service: service,
      name: pin
    })

    done(err, msg)
  })
}

function tracerPlugin(options) {
  var seneca = this

  override_actions(seneca)
  wrap_add(seneca)

  // options.pins.forEach(function register (pin) {
  //   seneca.add(pin, function (msg, done) {
  //     if (msg.transport$)
  //       return handle_as_server(this, pin, msg, done)

  //     handle_as_client(this, pin, msg, done)
  //   })
  // })

}

module.exports = tracerPlugin
