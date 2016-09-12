
var zipkin = require('zipkin');
var Tracer = zipkin.Tracer
var TraceId = zipkin.TraceId
var BatchRecorder = zipkin.BatchRecorder
var ConsoleRecorder = zipkin.ConsoleRecorder
var ExplicitContext = zipkin.ExplicitContext
var Annotation = zipkin.Annotation
var Some = zipkin.option.Some
var None = zipkin.option.None

var HttpLogger = require('zipkin-transport-http').HttpLogger;

var zipkinBaseUrl = 'http://127.0.0.1:9411';
var recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: `${zipkinBaseUrl}/api/v1/spans`
  })
});
// recorder = new ConsoleRecorder()
var ctxImpl = new ExplicitContext();
var tracer = new Tracer({ctxImpl, recorder});

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
    tracer.scoped(function () {

      var id = get_trace_id_for_child(context.fixedargs.tracer)
      tracer.setId(id)
      tracer.recordServiceName(service);
      tracer.recordRpc(pin);
      tracer.recordAnnotation(new Annotation.ClientSend())

      // msg.tracer = {
      //   traceId: id.traceId,
      //   spanId: id.spanId,
      //   parentId: id.parentId,
      //   sampled: id.sampled
      // }

      console.log('\n\nhandle_as_client\npin', pin, '\nOriginal', context.fixedargs.tracer, '\nNew', id)

      msg.tracer = context.fixedargs.tracer = {
        traceId: id.traceId,
        currentSpanId: id.spanId,
        parentId: id.parentId,
        sampled: id.sampled.value
      }

      context.prior(msg, function (err, msg) {
        tracer.scoped(function () {
          tracer.setId(id);
          tracer.recordServiceName(service);
          tracer.recordRpc(pin);
          tracer.recordAnnotation(new Annotation.ClientRecv())

          done(err, msg)
        })
      })
    })
  }

  function handle_as_server(context, pin, msg, done) {
    tracer.scoped(function () {

      var id = get_trace_id(msg.tracer)
      tracer.setId(id)
      tracer.recordServiceName(service);
      tracer.recordRpc(pin);
      tracer.recordAnnotation(new Annotation.ServerRecv())

      console.log('\n\nhandle as server\npin', pin, '\nOriginal', msg.tracer, '\nNew', id)

      msg.tracer = context.fixedargs.tracer = {
        traceId: id.traceId,
        parentId: id.parentId,
        currentSpanId: id.spanId,
        sampled: id.sampled.value
      }

      context.prior(msg, function (err, msg) {
        tracer.scoped(function () {
          tracer.setId(id);
          tracer.recordServiceName(service);
          tracer.recordRpc(pin);
          tracer.recordAnnotation(new Annotation.ServerSend())

          done(err, msg)
        })
      })

    })
  }

  function get_trace_id_for_child(data) {
    if (!data) {
      return tracer.createRootId({sampled: true})
    }

    tracer.setId(new TraceId ({
      traceId: new Some(data.traceId),
      parentId: data.parentId ? new Some(data.parentId) : None,
      spanId: data.currentSpanId,
      sampled: new Some(data.sampled)
    }))

    return tracer.createChildId()
  }

  function get_trace_id(data) {
    if (!data) {
      return tracer.createRootId({sampled: true})
    }

    return new TraceId({
      traceId: new Some(data.traceId),
      spanId: data.currentSpanId,
      parentId: new Some(data.parentId),
      sampled: new Some(data.sampled)
    })
  }
}

module.exports = tracerPlugin
