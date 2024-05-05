import { Registry } from './registry'
import { Metric } from './metric'
import { Counter } from './counter'
import { Gauge } from './gauge'
import { Meter } from './meter'
import { Timer } from './timer'
import { Histogram } from './histogram'

/**
 * A reporter periodically flushes metrics to
 * some consumer.
 *
 * @export
 * @class Reporter
 */
export abstract class Reporter {
  #process:       ReturnType<typeof setInterval>
  #flushInterval: number
  #reg:           Registry

  /**
   * Creates an instance of Reporter.
   *
   * @public
   * @param {Registry} [reg] the metrics registry.
   * @param {number} [flushInterval] how often to flush metrics.
   * @memberof Reporter
   */
  public constructor(reg: Registry, flushInterval: number) {
    if (flushInterval <= 0) {
      throw new Error('flushInterval must be > 0')
    }
    this.#flushInterval = flushInterval
    this.#reg = reg
  }

  /**
   * The default function for consuming metrics. It logs
   * all metric attributes to the console.
   *
   * @private
   * @param {Metric} [m] the metric to log.
   * @memberof Reporter
   */
  private defaultWriter(m: Metric): void {
    let name = m.getName()
    let ts = Math.floor(Date.now() / 1000)
    if (Registry.isCounter(m)) {
      console.log(`[METRIC] ${name} ${(m as Counter).count()} ${ts}`)
      return
    }

    if (Registry.isGauge(m)) {
      console.log(`[METRIC] ${name} ${(m as Gauge).value()} ${ts}`)
      return
    }

    if (Registry.isHistogram(m)) {
      let h = (m as Histogram).snapshot()
      console.log(`[METRIC] ${name}.count ${h.count} ${ts} \n`)
      console.log(`[METRIC] ${name}.min ${h.min} ${ts} \n`)
      console.log(`[METRIC] ${name}.max ${h.max} ${ts} \n`)
      console.log(`[METRIC] ${name}.mean ${h.mean} ${ts} \n`)
      console.log(`[METRIC] ${name}.sum ${h.sum} ${ts} \n`)
      console.log(`[METRIC] ${name}.stddev ${h.stddev} ${ts} \n`)
      console.log(`[METRIC] ${name}.variance ${h.variance} ${ts} \n`)
      console.log(`[METRIC] ${name}.median ${h.median} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.75 ${h.percentile._75} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.95 ${h.percentile._95} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.99 ${h.percentile._99} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.99_9 ${h.percentile._99_9} ${ts} \n`)
      return
    }

    if (Registry.isMeter(m)) {
      let s = (m as Meter).snapshot()
      console.log(`[METRIC] ${name}.count ${s.count} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.1min ${s.rate1} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.5min ${s.rate5} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.15min ${s.rate15} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.mean ${s.rateMean} ${ts} \n`)
      return
    }

    if (Registry.isTimer(m)) {
      let t = (m as Timer).snapshot()
      console.log(`[METRIC] ${name}.count ${t.count} ${ts} \n`)
      console.log(`[METRIC] ${name}.min ${t.min} ${ts} \n`)
      console.log(`[METRIC] ${name}.max ${t.max} ${ts} \n`)
      console.log(`[METRIC] ${name}.mean ${t.mean} ${ts} \n`)
      console.log(`[METRIC] ${name}.sum ${t.sum} ${ts} \n`)
      console.log(`[METRIC] ${name}.stddev ${t.stddev} ${ts} \n`)
      console.log(`[METRIC] ${name}.variance ${t.variance} ${ts} \n`)
      console.log(`[METRIC] ${name}.median ${t.median} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.75 ${t.percentile._75} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.95 ${t.percentile._95} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.99 ${t.percentile._99} ${ts} \n`)
      console.log(`[METRIC] ${name}.percentile.99_9 ${t.percentile._99_9} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.1min ${t.rate1} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.5min ${t.rate5} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.15min ${t.rate15} ${ts} \n`)
      console.log(`[METRIC] ${name}.rate.mean ${t.rateMean} ${ts} \n`)
      return
    }
  }

  /**
   * Flush metrics only once.
   *
   * @public
   * @memberof Reporter
   */
  public once(): void {
    let metrics = this.#reg.getMetricList()
    for (let i = 0; i < metrics.length; ++i) {
      this.defaultWriter(metrics[i])
    }
  }

  /**
   * Start flushing metrics every flushInterval.
   *
   * @public
   * @memberof Reporter
   */
  public async start() {
    clearInterval(this.#process)
    this.#process = setInterval(() => { this.once() },
      this.#flushInterval)
  }

  /**
   * Stop any running reporting routines.
   *
   * @public
   * @memberof Reporter
   */
  public stop(): void {
    clearInterval(this.#process)
  }
}
