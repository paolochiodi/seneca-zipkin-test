
# Zipkin and seneca test

## Setup

Clone (openzipkin/docker-zipkin)[https://github.com/openzipkin/docker-zipkin] and run with `docker-compose up`

Clone this project and `npm install` (currently tested only in node 6)

## Run

Run service1.js, service2.js and service3.js
When all three are up and running run client.js.
This will send the initial `a:1` message

## Message Flow

client.js calls `a:1`
server1.js handles `a:1` and calls `b:1`
server2.js handles `b:1` and calls `c:1`
server3.js respond to `c:1` with `{hello:'world'}

## Zipkin

Go to (http://localhost:8080/)[http://localhost:8080/], choose service1 (or service2/service3) and click "find traces".
You should see a list of traces. Click on one to see the details

## Info sent

Currently we are only sending the basic default annotations: client send, server receive, server send and client receive.
The name of each span is the pattern of the action (for security and privacy reasons the entire message shouldn't be sent)

## Current Limitations

- On plugin configuration need to explicitly define the traced actions
- Due to zipkin-js limitations can't track intra-process calls, please track only "transported" messages
- a `tracer` object is added to the acutal message: this could cause conflicts (names ending in $ get removed and meta can't be augmented becasue it is regenrated by the transport upon receiving a the message)

## What's next (some ideas)

- find better hooks into seneca that allow
  - auto-discovery of actions to track
  - in-process tracing
  - better ways hide `tracer` data
- explore possiblity to avoid zipkin-js
- measure performance costs of tracing?