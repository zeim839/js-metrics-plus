import { BaseMetric, Metric } from "./metric"
import { Histogram, StandardHistogram } from './histogram'
import { Meter, StandardMeter } from './meter'
import { ExpDecaySample } from './sample'

/*
 * Timer captures the duration and rate of events.
 *
 * @export
 * @interface Timer
 * extends {Metric}
 */
export interface Timer extends Metric {
  /**
   * Gets the count of event reported.
   *
   * @readonly
   * @returns {number}
   * @memberof Timer
   */
  count(): number

  /**
   * Gets the maximum value.
   *
   * @returns {number}
   * @memberof Timer
   */
  max(): number

  /**
   * Gets the sample mean.
   *
   * @returns {number}
   * @memberof Timer
   */
  mean(): number

  /**
   * Gets the sample minimum.
   *
   * @returns {number}
   * @memberof Timer
   */
  min(): number,

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof Timer
   */
  percentile(p: number): number

  /**
   * Calculates the value of each ps percentile from the samples.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof Timer
   */
  percentiles(ps: number[]): number[]

  /**
   * Gets the 1-minute event rate.
   *
   * @returns {number}
   * @memberof Timer
   */
  rate1(): number

  /**
   * Gets the 5-minute event rate.
   *
   * @returns {number}
   * @memberof Timer
   */
  rate5(): number

  /**
   * Gets the 15-minute event rate.
   *
   * @returns {number}
   * @memberof Timer
   */
  rate15(): number

  /**
   * Gets the mean rate of events.
   *
   * @returns {number}
   * @memberof Timer
   */
  rateMean(): number

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {any}
   * @memberof Timer
   */
  snapshot(): any

  /**
   * Returns the sample standard deviation.
   *
   * @returns {number}
   * @memberof Timer
   */
  stdDev(): number

  /**
   * Returns the sum of sample values.
   *
   * @returns {number}
   * @memberof Timer
   */
  sum(): number

  /**
   * Records the duration of the execution of the given function.
   *
   * @param {Function} [f] the function to record
   * @memberof Timer
   */
  time(f: () => any): void

  /**
   * Records the duration of an event.
   *
   * @param {number} [t] the new sample value.
   * @memberof Timer
   */
  update(t: number): void

  /**
   * UpdateSince record the duration of an event that started
   * at the specified time and ends now.
   *
   * @param {Date} [t] the new sample date.
   * @memberof Timer
   */
  updateSince(t: Date): void

  /**
   * Variance returns the variance of the values in the sample.
   *
   * @returns {number}
   * @memberof Timer
   */
  variance(): number
}

/**
 * A no-op implementation of Timer.
 *
 * @export
 * @class NullTimer
 * @extends {BaseMetric}
 * @implements {Timer}
 */
export class NullTimer extends BaseMetric implements Metric, Timer {

  /**
   * Creates an instance of NullTimer.
   *
   * @param {string} [name] optional metric name.
   * @param {string} [description] optional metric description.
   * @memberof NullTimer
   */
  public constructor(name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * count is a no-op
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public count(): number { return 0 }

  /**
   * max is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public max(): number { return 0 }

  /**
   * mean is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public mean(): number { return 0 }

  /**
   * min is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public min(): number { return 0 }

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof NullTimer
   */
  public percentile(p: number): number { return 0 }

  /**
   * percentile is a no-op.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof NullTimer
   */
  public percentiles(ps: number[]): number[] { return [] }

  /**
   * rate1 is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public rate1(): number { return 0 }

  /**
   * rate5 is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public rate5(): number { return 0 }

  /**
   * rate15 is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public rate15(): number { return 0 }

  /**
   * rateMean is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public rateMean(): number { return 0 }

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {any}
   * @memberof NullTimer
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      count:    0,
      rate1:    0,
      rate5:    0,
      rate15:   0,
      rateMean: 0,
      max:      0,
      mean:     0,
      min:      0,
      stdDev:   0,
      sum:      0,
      variance: 0,
      percentile: {
        median: 0,
        _75:    0,
        _95:    0,
        _99:    0,
        _99_9:  0,
      }
    }
  }

  /**
   * stdDev is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public stdDev(): number { return 0 }

  /**
   * time is a no-op.
   *
   * @param {Function} [f] the function to record
   * @memberof NullTimer
   */
  public time(f: () => any): void {}

  /**
   * update is a no-op.
   *
   * @param {number} [t] the new sample value.
   * @memberof NullTimer
   */
  public update(t: number): void {}

  /**
   * updateSince is a no-op.
   *
   * @param {Date} [t] the new sample date.
   * @memberof NullTimer
   */
  public updateSince(t: Date): void {}

  /**
   * variance is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public variance(): number { return 0 }

  /**
   * sum is a no-op.
   *
   * @returns {number}
   * @memberof NullTimer
   */
  public sum(): number { return 0 }

}

/**
 * A standard implementation of Timer.
 *
 * @export
 * @class StandardTimer
 * @extends {BaseMetric}
 * @implements {Timer}
 */
export class StandardTimer extends BaseMetric implements Metric, Timer {
  #hist: Histogram
  #meter: Meter

  /**
   * Creates an instance of StandardTimer.
   *
   * @param {string} [name] optional metric name.
   * @param {string} [description] optional metric description.
   * @memberof StandardTimer
   */
  public constructor(name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)

    this.#meter = new StandardMeter()
    this.#hist = new StandardHistogram(new ExpDecaySample(0.015, 1028))
  }

  /**
   * Gets the count of event reported.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public count(): number {
    return this.#hist.count()
  }

  /**
   * Gets the maximum value.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public max(): number {
    return this.#hist.max()
  }

  /**
   * Gets the sample mean.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public mean(): number {
    return this.#hist.mean()
  }

  /**
   * Gets the sample minimum.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public min(): number {
    return this.#hist.min()
  }

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof StandardTimer
   */
  public percentile(p: number): number {
    return this.#hist.percentile(p)
  }

  /**
   * Calculates the value of each ps percentile from the samples.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof StandardTimer
   */
  public percentiles(ps: number[]): number[] {
    return this.#hist.percentiles(ps)
  }

  /**
   * Gets the 1-minute event rate.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public rate1(): number {
    return this.#meter.rate1()
  }

  /**
   * Gets the 5-minute event rate.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public rate5(): number {
    return this.#meter.rate5()
  }

  /**
   * Gets the 15-minute event rate.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public rate15(): number {
    return this.#meter.rate15()
  }

  /**
   * Gets the mean rate of events.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public rateMean(): number {
    return this.#meter.rateMean()
  }

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {any}
   * @memberof StandardTimer
   */
  public snapshot(): any {
    return {
      ...this.#hist.snapshot(),
      ...this.#meter.snapshot(),
      ...super.snapshot(),
    }
  }

  /**
   * Returns the sample standard deviation.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public stdDev(): number {
    return this.#hist.stdDev()
  }

  /**
   * Records the duration of the execution of the given function.
   *
   * @param {Function} [f] the function to record
   * @memberof StandardTimer
   */
  public time(f: () => any): void {
    const now = new Date()
    f()
    this.updateSince(now)
  }

  /**
   * Records the duration of an event.
   *
   * @param {number} [t] the new sample value.
   * @memberof StandardTimer
   */
  public update(t: number): void {
    this.#hist.update(t)
    this.#meter.mark(1)
  }

  /**
   * UpdateSince record the duration of an event that started
   * at the specified time and ends now.
   *
   * @param {Date} [t] the new sample date.
   * @memberof StandardTimer
   */
  public updateSince(t: Date): void {
    this.#hist.update((new Date()).getTime() - t.getTime())
    this.#meter.mark(1)
  }

  /**
   * Variance returns the variance of the values in the sample.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public variance(): number {
    return this.#hist.variance()
  }

  /**
   * Returns the sum of sample values.
   *
   * @returns {number}
   * @memberof StandardTimer
   */
  public sum(): number {
    return this.#hist.sum()
  }
}
