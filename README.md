# js-metrics-plus
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme) ![GitHub issues](https://img.shields.io/github/issues-raw/zeim839/js-metrics-plus) ![GitHub](https://img.shields.io/github/license/zeim839/js-metrics-plus) ![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/zeim839/js-metrics-plus/node.js.yml) ![GitHub package.json version](https://img.shields.io/github/package-json/v/zeim839/js-metrics-plus) ![NPM Version](https://img.shields.io/npm/v/js-metrics-plus)

A monitoring and metrics library for JavaScript/TypeScript, based on [DropWizard Metrics](https://metrics.dropwizard.io/4.2.0/). This library is a TypeScript port of [go-metrics-plus](https://github.com/zeim839/go-metrics-plus) for Golang.

## Table of Contents
 - [Install](#install)
 - [Usage](#usage)
     - [Enabling/disabling metrics](#enablingdisabling-metrics)
     - [Counter](#counter)
     - [Gauge](#gauge)
     - [Healthcheck](#healthcheck)
     - [Histogram](#histogram)
     - [Meter](#meter)
     - [Timer](#timer)
     - [Publishing metrics (graphite, influxdb)](#publishing-metrics-graphite-influxdb)
  - [Is it any good?](#is-it-any-good)
  - [License](#license)

## Install
This project requires [NodeJS](https://nodejs.org/en/). To use `js-metrics-plus` with your project, install from npm:
```bash
npm install js-metrics-plus
```

## Usage
In `js-metrics-plus`, all metrics are maintained and indexed by the Registry data structure; all metrics should belong to a registry. You may either use the default global-scope registry, or create your own:
```js
import * as metrics from 'js-metrics-plus'

// Create a new registry and register some metrics.
const reg = new metrics.Registry()
const myMeter0 = reg.getOrRegisterMeter('my-meter-00')
console.log(reg.getMeterList())

// Using the default registry:
metrics.getOrRegisterMeter('meter-in-global-registry')
console.log(metrics.getMeterList())
```

### Enabling/disabling metrics
Sometimes, you might want to disable metrics altogether. This might be useful if you want to study your program's observer effect: i.e. resource usage with vs. without metrics enabled. `js-metrics-plus` provides the `useNullMetrics()` kill-switch, which will cause all subsequent metrics to be duds (will conform to interfaces but won't implement any functionality).
```js
import * as metrics from 'js-metrics-plus'

// Call this before registering any metrics.
metrics.useNullMetrics()

const counter = metrics.getOrRegisterCounter('my-counter')
counter.inc(100) // set to non-zero.

// will always return 0 because metrics have been disabled.
console.log(counter.count())

// Re-enable metrics (you must re-register).
metrics.useNullMetrics(false)
counter = metrics.getOrRegisterCounter('my-counter')
```

### Counter
A counter is the simplest of all metrics, it represents a count that an be increased/decreased in steps.
```js
import { getOrRegisterCounter } from 'js-metrics-plus'

const counter = getOrRegisterCounter('my-counter')
counter.inc(420) // increment.
counter.dec(69) // decrement.
console.log("Count:", counter.count()) // return current count.
console.log("JSON:", counter.snapshot()) // return a JSON snapshot.
```
Output:
```
Count: 351
JSON: { id: 0, name: 'my-counter', description: '', count: 351
```

### Gauge
A Gauge tracks a numerical value over time.
```js
import { getOrRegisterGauge } from 'js-metrics-plus'

const gauge = getOrRegisterGauge('my-gauge')
gauge.update(777) // update the gauge's value.
console.log('Value:', gauge.value()) // retrieve the current gauge value.
console.log('JSON:', gauge.snapshot()) // retrieve a JSON snapshot
```
Output:
```
Value: 777
JSON: { id: 0, name: 'my-gauge', description: '', count: 777 }
```

### Healthcheck
Healthcheck holds an error value describing an arbitrary up/down status. It can be bound to a callback function and used to report the status of a service or API.
```js
import { getOrRegisterHealthcheck, runAllHealthchecks } from 'js-metrics-plus'

const hc = getOrRegisterHealthcheck('my-health', (healthcheck) => {
  if (true) { // some condition.
    // mark the service as unhealthy.
    healthcheck.unhealthy(new Error('something terrible happened...'))
    return
  }
  healthcheck.healthy() // mark the service as healthy.
})

// Run the healthcheck callback.
hc.check()
console.log("Status:", hc.error().message)
console.log("JSON:", hc.snapshot())

// Run all registered healthchecks.
runAllHealthchecks()
```
Output:
```
Status: something terrible happened...
JSON: {
  id: 0,
  name: 'my-health',
  description: '',
  healthy: false,
  error: "Error: something terrible happened..."
}
```

### Histogram
A histogram records a series of data values and computes their min/max, mean, std. deviation, variance, count, and percentile distributions.
```js
import { UniformSample, getOrRegisterHistogram } from 'js-metrics-plus'

// Sample some values (max sample size = 30)
const sample = new UniformSample(30)
sample.update(212)
sample.update(777)
sample.update(54)

// Register a histogram.
const hist = getOrRegisterHistogram('my-hist', sample)
console.log(hist.snapshot())
```
Output:
```
{
  id: 0,
  name: 'my-hist',
  description: '',
  count: 3,
  max: 777,
  mean: 347.66666667,
  min: 54,
  stdDev: 310.36143,
  sum: 1043,
  variance: 96324.2222223,
  percentile: { median: 54, _75: 777, _95: 777, _99: 777, _99_9: 777 }
}
```

### Meter
A meter tracks the number of occurences of an event, and an exponentially weighted moving average of their 1-minute, 5-minute, and 15-minute per-second rate of occurence.
```js
import { getOrRegisterMeter } from 'js-metrics-plus'

const meter = getOrRegisterMeter('mass-hysteria')

// mass hysteria happens every once in a while...
setInterval(() => meter.mark(1), 500)

// wait a while and inspect the snapshot.
setTimeout(() => console.log(meter.snapshot()), 10000)
```
Output:
```
{
  id: 0,
  name: 'mass-hysteria',
  description: '',
  count: 19,
  rate1: 1.81599111,
  rate5: 1.80330570,
  rate15: 1.80110803,
  rateMean: 1.726958734,
}
```

### Timer
Timer captures the duration and rate of events. It combines a histogram and meter.
```js
import { getOrRegisterTimer } from 'js-metrics-plus'

const timer = getOrRegisterTimer('my-timer')
timer.update(10000) // record a 10-second event.
timer.updateSince(new Date()) // record an event that happened in the past.

// measure the time it takes to execute a function.
timer.time(() => {
  for (let i = 0; i < 696969; i++) {}
})

console.log(timer.snapshot())
```
Output:
```js
{
  id: 0,
  name: 'my-timer',
  description: '',
  count: 3,
  max: 0,
  mean: 0,
  min: 0,
  stdDev: 0,
  sum: 0,
  variance: 0,
  percentile: { median: 0, _75: 0, _95: 0, _99: 0, _99_9: 0 },
  rate1: 0.04797335,
  rate5: 0.00991712,
  rate15: 0.00332409,
  rateMean: 0.23064503
}
```

### Publishing Metrics (graphite, influxdb)
`js-metrics-plus` supports publishing metrics to Graphite and InfluxDBv2. In the future, more platforms will be supported. 
```js
import { Graphite, InfluxDBv2, Registry } from 'js-metrics-plus'

const registry = new Registry()
const graphite = new Graphite({
  port: 2003,
  addr: '127.0.0.1',
  registry: registry,
  flush_interval: 5000, // upload every 5 seconds.
  prefix: 'my-prefix'
})

const influx = new InfluxDBv2({
  addr: 'http://localhost:8086',
  token: 'my-auth-api-token',
  org: 'my-org',
  bucket: 'my-bucket',
  flush_interval: 5000, // upload every 5 seconds.
  registry: registry
})

// Consume errors.
graphite.onError((error) => console.log(error))
influx.onError((error) => console.log(error))

// Reconnect (in case graphite TCP connection drops).
graphite.connect(2003, '127.0.0.1')

// Flush metrics once.
graphite.once()
influx.once()

// Flush metrics every flush_interval.
graphite.start()
influx.start()

// Stop flushing metrics.
graphite.stop()
influx.stop()
```

## Is it any good?
Yes.

## License
[MIT](LICENSE.md) <br/>
Copyright (C) 2024 Michail Zeipekki
