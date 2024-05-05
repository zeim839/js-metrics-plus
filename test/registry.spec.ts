import { expect } from "chai"

import {
  Registry, useNullMetrics, getOrRegisterCounter,
  getOrRegisterGauge, getOrRegisterHistogram,
  getOrRegisterMeter, getOrRegisterTimer,
  getOrRegisterHealthcheck
} from "../src/registry"

import { UniformSample } from "../src/sample"
import { NullCounter } from '../src/counter'
import { NullGauge } from "../src/gauge"
import { NullHistogram } from "../src/histogram"
import { NullMeter } from "../src/meter"
import { NullTimer } from "../src/timer"
import { Healthcheck, NullHealthcheck } from "../src/healthcheck"

describe("Registry", () => {
  it("Should return all counters through getCounterList()", () => {
    let reg = new Registry()
    let t1 = reg.getOrRegisterCounter('my-metric-1')
    let t2 = reg.getOrRegisterCounter('my-metric-2')
    let t3 = reg.getOrRegisterGauge('my-metric-3')

    let list = reg.getCounterList()
    expect(list.length).to.equal(2)
    for (let i = 0; i < list.length; ++i) {
      let name = list[i].getName()
      expect(name === 'my-metric-1' || name === 'my-metric-2')
        .to.equal(true)

      expect(Registry.isCounter(list[i])).to.be.true
    }

    reg.removeMetrics('my-metric-1')
    list = reg.getCounterList()
    expect(list.length).to.equal(1)
    expect(list[0].getName()).to.equal('my-metric-2')
    expect(Registry.isCounter(list[0])).to.be.true
  })

  it("Should return all gauges through getGaugeList()", () => {
    let reg = new Registry()
    let t1 = reg.getOrRegisterGauge('my-metric-1')
    let t2 = reg.getOrRegisterGauge('my-metric-2')
    let t3 = reg.getOrRegisterCounter('my-metric-3')

    let list = reg.getGaugeList()
    expect(list.length).to.equal(2)
    for (let i = 0; i < list.length; ++i) {
      let name = list[i].getName()
      expect(name === 'my-metric-1' || name === 'my-metric-2')
        .to.equal(true)

      expect(Registry.isGauge(list[i])).to.be.true
    }

    reg.removeMetrics('my-metric-1')
    list = reg.getGaugeList()
    expect(list.length).to.equal(1)
    expect(list[0].getName()).to.equal('my-metric-2')
    expect(Registry.isGauge(list[0])).to.be.true
  })

  it("Should return all histograms through getHistogramList()", () => {
    let reg = new Registry()
    let t1 = reg.getOrRegisterHistogram('my-metric-1', new UniformSample(0))
    let t2 = reg.getOrRegisterHistogram('my-metric-2', new UniformSample(0))
    let t3 = reg.getOrRegisterCounter('my-metric-3')

    let list = reg.getHistogramList()
    expect(list.length).to.equal(2)
    for (let i = 0; i < list.length; ++i) {
      let name = list[i].getName()
      expect(name === 'my-metric-1' || name === 'my-metric-2')
        .to.equal(true)

      expect(Registry.isHistogram(list[i])).to.be.true
    }

    reg.removeMetrics('my-metric-1')
    list = reg.getHistogramList()
    expect(list.length).to.equal(1)
    expect(list[0].getName()).to.equal('my-metric-2')
    expect(Registry.isHistogram(list[0])).to.be.true
  })

  it("Should return all timers through getTimerList()", () => {
    let reg = new Registry()
    let t1 = reg.getOrRegisterTimer('my-metric-1')
    let t2 = reg.getOrRegisterTimer('my-metric-2')
    let t3 = reg.getOrRegisterCounter('my-metric-3')

    let list = reg.getTimerList()
    expect(list.length).to.equal(2)
    for (let i = 0; i < list.length; ++i) {
      let name = list[i].getName()
      expect(name === 'my-metric-1' || name === 'my-metric-2')
        .to.equal(true)

      expect(Registry.isTimer(list[i])).to.be.true
    }

    reg.removeMetrics('my-metric-1')
    list = reg.getTimerList()
    expect(list.length).to.equal(1)
    expect(list[0].getName()).to.equal('my-metric-2')
    expect(Registry.isTimer(list[0])).to.be.true
  })

  it("Should return all metrics through getMetricList()", () => {
    let reg = new Registry()
    expect(reg.getMetricList().length).to.equal(0)

    let m1 = reg.getOrRegisterMeter('my-metric-1')
    let m2 = reg.getOrRegisterCounter('my-metric-2')

    let list = reg.getMetricList()
    expect(list.length).to.equal(2)
    for (let i = 0; i < list.length; ++i) {
      let name = list[i].getName()
      expect(name === 'my-metric-1' || name === 'my-metric-2')
        .to.equal(true)
    }

    reg.removeMetrics('my-metric-1')
    list = reg.getMetricList()
    expect(list.length).to.equal(1)
    for (let i = 0; i < list.length; ++i) {
      let name = list[i].getName()
      expect(name).to.equal('my-metric-2')
    }
  })

  it("Should return all metrics through getMetrics()", () => {
    let reg = new Registry()
    expect([ ...reg.getMetrics().keys() ].length).to.equal(0)

    let m1 = reg.getOrRegisterCounter('my-metric-1')
    let m2 = reg.getOrRegisterTimer('my-metric-2')
    let m3 = reg.getOrRegisterHistogram('my-metric-3', new UniformSample(0))
    let m4 = reg.getOrRegisterMeter('my-metric-4')

    let map = reg.getMetrics()
    expect([...map.keys() ].length).to.equal(4)
    for (let key of map) {
      expect(key[0] === 'my-metric-1' ||
        key[0] === 'my-metric-2' ||
        key[0] === 'my-metric-3' ||
        key[0] === 'my-metric-4')
        .to.be.true
    }

    reg.removeMetrics('my-metric-1')
    reg.removeMetrics('my-metric-4')

    map = reg.getMetrics()
    expect([...map.keys() ].length).to.equal(2)
    for (let key of map) {
      expect(key[0] === 'my-metric-2' ||
        key[0] === 'my-metric-3')
        .to.be.true
    }
  })

  it("Should return metrics by name", () => {
    let reg = new Registry()
    let names = ['1', '2', '3', '4', '5', '6', '7']
    for (let i = 0; i < names.length; ++i) {
      reg.getOrRegisterCounter(names[i])
      expect(reg.getMetricsByName(names[i]).length).to.equal(1)
      expect(Registry.isCounter(reg.getMetricsByName(names[i])[0])).to.be.true
    }
  })

  it("Should return metrics by name and type", () => {
    let reg = new Registry()
    reg.getOrRegisterCounter('my-counter')
    reg.getOrRegisterGauge('my-gauge')
    reg.getOrRegisterHistogram('my-histogram', new UniformSample(0))
    reg.getOrRegisterMeter('my-meter')
    reg.getOrRegisterTimer('my-timer')

    // Counter.
    expect(reg.getCountersByName('my-counter').length).to.equal(1)
    expect(Registry.isCounter(reg.getCountersByName('my-counter')[0]))
      .to.be.true
    expect(reg.getCountersByName('my-counter')[0].getName())
      .to.equal('my-counter')

    // Gauge.
    expect(reg.getGaugesByName('my-gauge').length).to.equal(1)
    expect(Registry.isGauge(reg.getGaugesByName('my-gauge')[0]))
      .to.be.true
    expect(reg.getGaugesByName('my-gauge')[0].getName())
      .to.equal('my-gauge')

    // Histogram.
    expect(reg.getHistogramsByName('my-histogram').length).to.equal(1)
    expect(Registry.isHistogram(reg.getHistogramsByName('my-histogram')[0]))
      .to.be.true
    expect(reg.getHistogramsByName('my-histogram')[0].getName())
      .to.equal('my-histogram')

    // Meter.
    expect(reg.getMetersByName('my-meter').length).to.equal(1)
    expect(Registry.isMeter(reg.getMeterList('my-meter')[0]))
      .to.be.true
    expect(reg.getMetersByName('my-meter')[0].getName())
      .to.equal('my-meter')

    // Timer.
    expect(reg.getTimersByName('my-timer').length).to.equal(1)
    expect(Registry.isTimer(reg.getTimerList('my-timer')[0]))
      .to.be.true
    expect(reg.getTimersByName('my-timer')[0].getName())
      .to.equal('my-timer')
  })

  it("Should not return metrics that don't exist", () => {
    let reg = new Registry()
    let names = ['1', '2', '3', '4', '5', '6', '7', '8']
    for (let i = 0; i < 4; ++i) {
      reg.getOrRegisterCounter(names[i])
    }

    for (let i = 4; i < 9; ++i) {
      expect(reg.getMetricsByName(names[i]).length).to.equal(0)
    }
  })

  it("Should use null imports when specified", () => {
    useNullMetrics()
    expect(getOrRegisterCounter('my-counter')).to.be.instanceOf(NullCounter)
    expect(getOrRegisterGauge('my-gauge')).to.be.instanceOf(NullGauge)
    expect(getOrRegisterHealthcheck('my-hc', (h: Healthcheck)=>{}))
      .to.be.instanceOf(NullHealthcheck)
    expect(getOrRegisterHistogram('my-hist', new UniformSample(0)))
      .to.be.instanceOf(NullHistogram)
    expect(getOrRegisterMeter('my-meter')).to.be.instanceOf(NullMeter)
    expect(getOrRegisterTimer('my-timer')).to.be.instanceOf(NullTimer)
    useNullMetrics(false)
  })

  it("Should run all healthchecks", () => {
    return new Promise((resolve) => {
      let reg = new Registry()
      reg.getOrRegisterHealthcheck('my-hc', (h: Healthcheck) => {
        resolve()
      })
      reg.runAllHealthchecks()
    })
  })
})
