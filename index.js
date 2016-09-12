
var zipkin = require('zipkin');
var Tracer = zipkin.Tracer
var BatchRecorder = zipkin.BatchRecorder
var ExplicitContext = zipkin.ExplicitContext
var Annotation = zipkin.Annotation

var HttpLogger = require('zipkin-transport-http').HttpLogger;

var zipkinBaseUrl = 'http://127.0.0.1:9411';
var recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: `${zipkinBaseUrl}/api/v1/spans`
  })
});
var ctxImpl = new ExplicitContext();
var tracer = new Tracer({ctxImpl, recorder});


var counter = 0;
var mainId;

function clientSend() {
  tracer.scoped(function test () {
    console.log('clientSend')

    tracer.setId(tracer.createRootId({sampled: true}));
    mainId = tracer.id;

    tracer.recordServiceName('client');
    tracer.recordRpc('GET');
    // tracer.recordBinary('counter', {counter: ++counter});
    // tracer.recordBinary('client send', {
    //   'something1': 'lorem',
    //   'something2': 'ipsum'
    // })
    tracer.recordAnnotation(new Annotation.ClientSend())

  });
}

function serverReceive() {
  tracer.scoped(function test () {
    console.log('serverReceive')

    tracer.setId(mainId);
    tracer.recordServiceName('server');
    tracer.recordRpc('GET');

    tracer.recordAnnotation(new Annotation.ServerRecv())

  });
}

function serverSend() {
  tracer.scoped(function test () {
    console.log('ServerSend')
    tracer.setId(mainId);
    tracer.recordServiceName('server');
    tracer.recordRpc('GET');

    tracer.recordAnnotation(new Annotation.ServerSend())
  });
}

function clientReceive() {
  tracer.scoped(function test () {
    console.log('clientReceive')
    tracer.setId(mainId);
    tracer.recordServiceName('client');
    tracer.recordRpc('GET');

    tracer.recordAnnotation(new Annotation.ClientRecv())
  });
}

function simulateRequest() {
  clientSend()
  // setTimeout(serverReceive, 200);
  // setTimeout(serverSend, 400);
  setTimeout(clientReceive, 600);
}

simulateRequest();
setTimeout(simulateRequest, 1000);
// setTimeout(simulateRequest, 2000);

setTimeout(function () {
  process.exit()
}, 2000)