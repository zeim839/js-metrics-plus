import { EWMA, newEWMA1, newEWMA15, newEWMA5 } from "./ewma"
import { BaseMetric, Metric } from "./metric"

/**
 * A meter tracks an event and its rate of occurrence.
 *
 * @export
 * @interface Meter
 * @extends {Metric}
 */
export interface Meter extends Metric {
  /**
   * Gets the count of event reported.
   *
   * @readonly
   * @returns {number}
   * @memberof Meter
   */
  count(): number

  /**
   * Increases the counter and updates the averages.
   *
   * @param {number} i
   * @returns {void}
   * @memberof Meter
   */
  mark(i: number): void

  /**
   * Gets the 1-minute event rate.
   *
   * @returns {number}
   * @memberof Meter
   */
  rate1(): number

  /**
   * Gets the 5-minute event rate.
   *
   * @returns {number}
   * @memberof Meter
   */
  rate5(): number

  /**
   * Gets the 15-minute event rate.
   *
   * @returns {number}
   * @memberof Meter
   */
  rate15(): number

  /**
   * Gets the mean rate of events.
   *
   * @returns {number}
   * @memberof Meter
   */
  rateMean(): number

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {any}
   * @memberof Meter
   */
  snapshot(): any
}

/**
 * A no-op implementation of Meter.
 *
 * @export
 * @class NullMeter
 * @extends {BaseMetric}
 * @implements {Meter}
 */
export class NullMeter extends BaseMetric implements Meter {

  /**
   * Creates an instance of NullMeter.
   *
   * @param {string} [name] optional metric name.
   * @param {string} [description] optional metric description.
   * @memberof NullMeter
   */
  public constructor(name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * count is a no-op.
   *
   * @returns {number}
   * @memberof NullMeter
   */
  public count(): number { return 0 }

  /**
   * mark is a no-op.
   *
   * @param {number} i
   * @memberof NullMeter
   */
  public mark(i: number): void {}

  /**
   * rate1 is a no-op.
   *
   * @returns {number}
   * @memberof NullMeter
   */
  public rate1(): number { return 0 }

  /**
   * rate5 is a no-op.
   *
   * @returns {number}
   * @memberof NullMeter
   */
  public rate5(): number { return 0 }

  /**
   * rate15 is a no-op.
   *
   * @returns {number}
   * @memberof NullMeter
   */
  public rate15(): number { return 0 }

  /**
   * rateMean is a no-op.
   *
   * @returns {number}
   * @memberof NullMeter
   */
  public rateMean(): number { return 0 }

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {any}
   * @memberof NullMeter
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      count:    0,
      rate1:    0,
      rate5:    0,
      rate15:   0,
      rateMean: 0,
    }
  }
}

/**
 * A standard implementation of Meter.
 *
 * @export
 * @class StandardMeter
 * @extends {BaseMetric}
 * @implements {Meter}
 */
export class StandardMeter extends BaseMetric implements Meter {
  /**
   * Count the number of events that have occurred.
   *
   * @private
   * @memberof StandardMeter
   */
  #count: number = 0

  /**
   * The 1-minute rate EWMA.
   *
   * @private
   * @memberof StandardMeter
   */
  #a1:    EWMA

  /**
   * The 5-minute rate EWMA.
   *
   * @private
   * @memberof StandardMeter
   */
  #a5:    EWMA

  /**
   * The 15-minute rate EWMA.
   *
   * @private
   * @memberof StandardMeter
   */
  #a15:   EWMA

  /**
   * The start time timestamp, for recording
   * rate of events.
   *
   * @private
   * @memberof StandardMeter
   */
  #start: Date

  /**
   * Creates an instance of Meter.
   *
   * @param {string} [name] optional metric name.
   * @param {string} [description] optional metric description.
   * @memberof StandardMeter
   */
  public constructor(name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
    this.#a1 = newEWMA1()
    this.#a5 = newEWMA5()
    this.#a15 = newEWMA15()
    this.#start = new Date()
  }

  /**
   * Gets the count of events reported.
   *
   * @returns {number}
   * @memberof StandardMeter
   */
  public count(): number {
    return this.#count
  }

  /**
   * Increases the counter and updates the averages.
   *
   * @param {number} i
   * @memberof StandardMeter
   */
  public mark(i: number): void {
    this.#count += i
    this.#a1.update(i)
    this.#a5.update(i)
    this.#a15.update(i)
  }

  /**
   * Gets the 1-minute event rate.
   *
   * @returns {number}
   * @memberof StandardMeter
   */
  public rate1(): number {
    return this.#a1.rate()
  }

  /**
   * Gets the 5-minute event rate.
   *
   * @returns {number}
   * @memberof StandardMeter
   */
  public rate5(): number {
    return this.#a5.rate()
  }

  /**
   * Gets the 15-minute event rate.
   *
   * @returns {number}
   * @memberof StandardMeter
   */
  public rate15(): number {
    return this.#a15.rate()
  }

  /**
   * Gets the mean rate of events.
   *
   * @returns {number}
   * @memberof StandardMeter
   */
  public rateMean(): number {
    // seconds elapsed.
    const elapsed = ((new Date()).getTime() - this.#start.getTime())/1000
    return this.count() / (1 + elapsed)
  }

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {any}
   * @memberof StandardMeter
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      count: this.count(),
      rate1: this.rate1(),
      rate5: this.rate5(),
      rate15: this.rate15(),
      rateMean: this.rateMean(),
    }
  }
}
