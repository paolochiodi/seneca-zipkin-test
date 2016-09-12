
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

tracer.scoped(function () {
  console.log('is this even working?')
  var root = tracer.createRootId();
  tracer.setId(root);

  var child = tracer.createChildId();
  tracer.setId(child);

  var child2 = tracer.createChildId();
  tracer.setId(child2);

  console.log('yes');
});