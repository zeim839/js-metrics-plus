import { Reporter } from './reporter'
import { Registry } from './registry'
import { Metric } from './metric'
import { Counter } from './counter'
import { Gauge } from './gauge'
import { Meter } from './meter'
import { Timer } from './timer'
import { Histogram } from './histogram'

import axios, { AxiosError, AxiosResponse } from 'axios'

/**
 * Configuration type for InfluxDBv2 driver.
 *
 * @export
 * @type InfluxDBv2Config
 */
export type InfluxDBv2Config = {
  addr:           string,
  token:          string,
  org:            string,
  bucket:         string,
  flush_interval: number,
  registry:       Registry,
}

/**
 * InfluxDBv2 metrics driver.
 *
 * @export
 * @class InfluxDBv2
 * @extends {Reporter}
 */
export class InfluxDBv2 extends Reporter {
  #config:  InfluxDBv2Config
  #errorCb: (err: AxiosError) => void
  #resCb: (res: AxiosResponse) => void
  #caller: ReturnType<typeof axios.create>

  /**
   * Creates an instance of InfluxDBv2.
   *
   * @param {InfluxDBv2Config} [config] driver configuration.
   * @memberof InfluxDBv2
   */
  public constructor(config: InfluxDBv2Config) {
    super(config.registry, config.flush_interval)
    this.#errorCb = this.defaultErrorCb
    this.#resCb = this.defaultResCb
    this.#config = config

    const url = `${this.#config.addr}/api/v2/write?org=` +
      `${this.#config.org}&bucket=${this.#config.bucket}&precision=ms`

    this.#caller = axios.create({
      baseURL: url,
      timeout: 1000,
      headers: {
        "Authorization": `Token ${this.#config.token}`,
        "Content-Type": "text/plain",
        "Accept": "application/json"
      }
    })
  }

  /**
   * Writes all registry metrics to InfluxDB instance once.
   *
   * @memberof InfluxDBv2
   */
  public once(): void {
    let payload = ""
    const metrics = this.#config.registry.getMetricList()
    for (let i = 0; i < metrics.length; ++i) {
      payload += this.reporter(metrics[i])
    }

    this.#caller.post('', payload)
      .then(this.#resCb)
      .catch(this.#errorCb)
  }

  /**
   * Basic logger for InfluxDB API errors.
   *
   * @private
   * @param {AxiosError} [err] the error to log.
   * @memberof InfluxDBv2
   */
  private defaultErrorCb(err: AxiosError): void {
    console.log(`[INFLUXDBv2 ERROR] ${err.code}`)
  }

  /**
   * Callback for InfluxDB API request responses.
   * It does nothing because we want to ignore
   * response messages by default.
   *
   * @private
   * @param {AxiosResponse} [res] the response to log.
   * @memberof InfluxDBv2
   */
  private defaultResCb(res: AxiosResponse): void {}

  /**
   * Transforms a metric to InfluxDB line protocol to
   * prepare it for submission to InfluxDB write API.
   *
   * @private
   * @param {Metric} [metric] the metric to transform.
   * @memberof InfluxDBv2
   */
  private reporter(m: Metric): string {
    const ts = Date.now()
    const name = m.getName()
    if (Registry.isCounter(m)) {
      return `${name} counter=${(m as Counter).count()} ${ts}\n`
    }

    if (Registry.isGauge(m)) {
      return `${name} gauge=${(m as Gauge).value()} ${ts}\n`
    }

    if (Registry.isHistogram(m)) {
      const h = (m as Histogram).snapshot()
      return `${name} count=${h.count},min=${h.min},max=${h.max},` +
        `mean=${h.mean},sum=${h.sum},stddev=${h.stddev},` +
        `variance=${h.variance},median=${h.median},` +
        `percentile_75=${h.percentile._75},percentile_95=${h.percentile._95},` +
        `percentile_99=${h.percentile._99},percentile_99_9=${h.percentile._99_9} ${ts}\n`
    }

    if (Registry.isMeter(m)) {
      const s = (m as Meter).snapshot()
      return `${name} count=${s.count},rate_1min=${s.rate1},rate_5min=${s.rate5},`+
        `rate_15min=${s.rate15},rate_mean=${s.rateMean} ${ts}\n`
    }

    if (Registry.isTimer(m)) {
      const t = (m as Timer).snapshot()
      return `${name} count=${t.count},min=${t.min},max=${t.max},mean=${t.mean},` +
        `sum=${t.sum},stddev=${t.stddev},variance=${t.variance},median=${t.median},` +
        `percentile_75=${t.percentile._75},percentile_95=${t.percentile._95},` +
        `percentile_99=${t.percentile._99},percentile_99_9=${t.percentile._99_9},` +
        `rate_1min=${t.rate1},rate_5min=${t.rate5},rate_15min=${t.rate15},rate_mean=${t.rateMean}\n`
    }

    return ''
  }

  /**
   * Sets the callback for handling InfluxDBv2 API
   * errors.
   *
   * @public
   * @param {(err: AxiosError) => void} [fn] the callback.
   * @memberof InfluxDBv2
   */
  public onError(fn: (err: AxiosError) => void): void {
    this.#errorCb = fn
  }

  /**
   * Sets the callback for handling InfluxDBv2 API
   * responses.
   *
   * @public
   * @param {(err: AxiosResponse) => void} [fn] the callback.
   * @memberof InfluxDBv2
   */
  public onRes(fn: (res: AxiosResponse) => void): void {
    this.#resCb = fn
  }
}
