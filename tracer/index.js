
var tracer = require('../zipkin');

function tracerPlugin(options) {
  var seneca = this;
  var service = seneca.private$.optioner.get().tag;

  options.pins.forEach(function register (pin) {
    seneca.add(pin, function (msg, done) {
      if (msg.transport$)
        return handle_as_server(this, pin, msg, done)

      handle_as_client(this, pin, msg, done)
    })
  })

  function handle_as_client(context, pin, msg, done) {
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
}

module.exports = tracerPlugin
