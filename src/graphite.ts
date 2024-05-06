import { Reporter } from './reporter'
import { Registry } from './registry'
import { Metric } from './metric'
import { Counter } from './counter'
import { Gauge } from './gauge'
import { Meter } from './meter'
import { Timer } from './timer'
import { Histogram } from './histogram'
import { Socket } from 'net'
import { Healthcheck } from './healthcheck'

/**
 * Configuration type for graphite driver.
 *
 * @export
 * @type GraphiteConfig
 */
export type GraphiteConfig = {
  port:           number
  addr:           string
  registry:       Registry
  flush_interval: number
  prefix:         string
}

/**
 * Graphite metrics driver.
 *
 * @export
 * @class Graphite
 * @extends {Reporter}
 */
export class Graphite extends Reporter {
  #config: GraphiteConfig
  #socket: Socket = new Socket()
  #errorCb: (err: Error) => void = this.defaultErrorCb

  /**
   * Creates an instance of Graphite.
   *
   * @param {GraphiteConfig} [config] driver configuration.
   * @memberof Graphite
   */
  public constructor(config: GraphiteConfig) {
    super(config.registry, config.flush_interval)
    this.#config = config

    this.#socket.on('connectionAttemptFailed', () => {
      this.#errorCb(new Error('connectionAttemptFailed'))
      this.#socket.destroy()
    })

    this.#socket.on('connectionAttemptTimeout', () => {
      this.#errorCb(new Error('connectionAttemptTimeout'))
      this.#socket.destroy()
    })

    this.#socket.on('drop', () => {
      this.#errorCb(new Error('drop'))
      this.#socket.destroy()
    })

    this.#socket.on('close', () => {
      this.#errorCb(new Error('close'))
      this.#socket.destroy()
    })

    this.#socket.on('error', (err) => {
      this.#errorCb(new Error(err.name))
    })

    this.#socket.on('timeout', () => {
      this.#errorCb(new Error('timeout'))
      this.#socket.destroy()
    })

    this.#socket.connect(this.#config.port, this.#config.addr)
    this.#socket.setKeepAlive(true, 2000)
  }

  /**
   * Re-attempt to connect to Graphite using the specified
   * port and host address.
   *
   * @public
   * @param {number} [port] the graphite server port.
   * @param {string} [addr] the graphite server hostname.
   * @memberof Graphite
   */
  public connect(port: number, addr: string): void {
    this.#config.port = port
    this.#config.addr = addr
    this.#socket.connect(port, addr)
  }

  /**
   * Basic logger for Graphite errors.
   *
   * @private
   * @param {Error} [err] the error to log.
   * @memberof Graphite
   */
  private defaultErrorCb(err: Error): void {
    console.log(`[GRAPHITE ERROR] ${err}`)
  }

  /**
   * Sets the callback for handling Graphite server
   * connection errors.
   *
   * @public
   * @param {(err: Error) => void} [fn] the callback.
   * @memberof Graphite
   */
  public onError(fn: (err: Error) => void): void {
    this.#errorCb = fn
  }

  /**
   * Writes all registry metrics to the Graphite instance once.
   *
   * @memberof Graphite
   */
  public once(): void {
    const metrics = this.#config.registry.getMetricList()
    for (let i = 0; i < metrics.length; ++i) {
      this.reporter(metrics[i])
    }
  }


  public stop(): void {
    super.stop()
    this.#socket.destroy()
  }

  /**
   * Fetch the metric's proper name and add prefix (if applicable).
   *
   * @private
   * @param {Metric} [metric] the metric in question.
   * @memberof Graphite
   */
  private getProperName(metric: Metric) {
    if (this.#config.prefix !== "") {
      return `${this.#config.prefix}.${metric.getName()}`
    }
    return `${metric.getName()}`
  }

  /**
   * Report the given metric to Graphite.
   *
   * @private
   * @param {Metric} [metric] the metric in question.
   * @memberof Graphite
   */
  private reporter(m: Metric) {
    const name = this.getProperName(m)
    const ts = Math.floor(Date.now() / 1000)
    if (Registry.isCounter(m)) {
      this.#socket.write(`${name} ${(m as Counter).count()} ${ts}\n`)
      return
    }

    if (Registry.isGauge(m)) {
      this.#socket.write(`${name} ${(m as Gauge).value()} ${ts}\n`)
      return
    }

    if (Registry.isHealthcheck(m)) {
      const hc = (m as Healthcheck).snapshot()
      this.#socket.write(`${name}.healthy ${(hc.healthy) ? 1 : 0} ${ts}\n`)
    }

    if (Registry.isHistogram(m)) {
      const h = (m as Histogram).snapshot()
      this.#socket.write(`${name}.count ${h.count} ${ts}\n`)
      this.#socket.write(`${name}.max ${h.max} ${ts}\n`)
      this.#socket.write(`${name}.mean ${h.mean} ${ts}\n`)
      this.#socket.write(`${name}.min ${h.min} ${ts}\n`)
      this.#socket.write(`${name}.stdDev ${h.stdDev} ${ts}\n`)
      this.#socket.write(`${name}.sum ${h.sum} ${ts}\n`)
      this.#socket.write(`${name}.variance ${h.variance} ${ts}\n`)
      this.#socket.write(`${name}.percentile.median ${h.percentile.median} ${ts}\n`)
      this.#socket.write(`${name}.percentile.75 ${h.percentile._75} ${ts}\n`)
      this.#socket.write(`${name}.percentile.95 ${h.percentile._95} ${ts}\n`)
      this.#socket.write(`${name}.percentile.99 ${h.percentile._99} ${ts}\n`)
      // tslint:disable-next-line
      this.#socket.write(`${name}.percentile.99_9 ${h.percentile._99_9} ${ts}\n`)
      return
    }

    if (Registry.isMeter(m)) {
      const s = (m as Meter).snapshot()
      this.#socket.write(`${name}.count ${s.count} ${ts}\n`)
      this.#socket.write(`${name}.rate.1min ${s.rate1} ${ts}\n`)
      this.#socket.write(`${name}.rate.5min ${s.rate5} ${ts}\n`)
      this.#socket.write(`${name}.rate.15min ${s.rate15} ${ts}\n`)
      this.#socket.write(`${name}.rate.mean ${s.rateMean} ${ts}\n`)
      return
    }

    if (Registry.isTimer(m)) {
      const t = (m as Timer).snapshot()
      this.#socket.write(`${name}.count ${t.count} ${ts}\n`)
      this.#socket.write(`${name}.min ${t.min} ${ts}\n`)
      this.#socket.write(`${name}.max ${t.max} ${ts}\n`)
      this.#socket.write(`${name}.mean ${t.mean} ${ts}\n`)
      this.#socket.write(`${name}.sum ${t.sum} ${ts}\n`)
      this.#socket.write(`${name}.stddev ${t.stddev} ${ts}\n`)
      this.#socket.write(`${name}.variance ${t.variance} ${ts}\n`)
      this.#socket.write(`${name}.median ${t.median} ${ts}\n`)
      this.#socket.write(`${name}.percentile.75 ${t.percentile._75} ${ts}\n`)
      this.#socket.write(`${name}.percentile.95 ${t.percentile._95} ${ts}\n`)
      this.#socket.write(`${name}.percentile.99 ${t.percentile._99} ${ts}\n`)
      // tslint:disable-next-line
      this.#socket.write(`${name}.percentile.99_9 ${t.percentile._99_9} ${ts}\n`)
      this.#socket.write(`${name}.rate.1min ${t.rate1} ${ts}\n`)
      this.#socket.write(`${name}.rate.5min ${t.rate5} ${ts}\n`)
      this.#socket.write(`${name}.rate.15min ${t.rate15} ${ts}\n`)
      this.#socket.write(`${name}.rate.mean ${t.rateMean} ${ts}\n`)
      return
    }
  }
}
