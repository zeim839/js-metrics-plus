import { Metric, BaseMetric } from './metric'
import { Registry } from './registry'

/**
 * A Gauge tracks a numerical value over time.
 *
 * @export
 * @interface Gauge
 * @extends {Metric}
 */
export interface Gauge extends Metric {

  /**
   * Snapshot returns a serializable JSON object of
   * the metric's current state.
   *
   * @returns {*}
   * @memberof Gauge
   */
  snapshot(): any

  /**
   * records a new value and updates the gauge.
   *
   * @param {number} i
   * @memberof Gauge
   */
  update(i: number): void

  /**
   * Gets the current value of the gauge.
   *
   * @returns {number}
   * @memberof Gauge
   */
  value(): number
}

/**
 * A no-op implementation of Gauge.
 *
 * @export
 * @class NullGauge
 * @extends {BaseMetric}
 * @implements {Gauge}
 */
export class NullGauge extends BaseMetric implements Gauge, Metric {

  /**
   * Creates an instance of NullGauge.
   *
   * @param {string} [name] optional name of the gauge.
   * @param {string} [desc] optional description of the gauge.
   * @memberof NullGauge
   */
  public constructor(name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * update is a no-op.
   *
   * @param {number} [i] the new gauge value.
   * @memberof NullGauge
   */
  public update(i: number) {}

  /**
   * value returns 0.
   *
   * @returns {number}
   * @memberof NullGauge
   */
  public value(): number { return 0 }

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof NullGauge
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      gauge: 0,
    }
  }
}

/**
 * A standard implementation of Gauge.
 *
 * @export
 * @class StandardGauge
 * @extends {BaseMetric}
 * @implements {Gauge}
 */
export class StandardGauge extends BaseMetric implements Gauge, Metric {
  #value: number

  /**
   * Creates an instance of StandardGauge.
   *
   * @param {string} [name] optional name of the gauge.
   * @param {string} [desc] optional description of the gauge.
   * @memberof StandardGauge
   */
  public constructor(name?: string, desc?: string) {
    super()
    this.#value = 0
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * Updates the gauge's value.
   *
   * @param {number} [i] the new gauge value.
   * @memberof StandardGauge
   */
  public update(i: number) {
    this.#value = i
  }

  /**
   * Gets the current value.
   *
   * @returns {number}
   * @memberof StandardGauge
   */
  public value(): number {
    return this.#value
  }

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof StandardGauge.
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      gauge: this.value(),
    }
  }
}

/**
 * A functional implementation of Gauge, whose
 * value is evaluated via function call.
 *
 * @export
 * @class FunctionalGauge
 * @extends {BaseMetric}
 * @implements {Gauge}
 */
export class FunctionalGauge extends StandardGauge implements Gauge, Metric {
  #fn : Function

  /**
   * Creates an instance of FunctionalGauge.
   *
   * @param {Function} [fn] the value function.
   * @param {string} [name] optional name of the gauge.
   * @param {string} [desc] optional description of the gauge.
   * @memberof FunctionalGauge
   */
  public constructor(fn: Function, name?: string, desc?: string) {
    super(name, desc)
    this.#fn = fn
  }

  /**
   * Gets the current value of the gauge.
   *
   * @returns {number}
   * @memberof FunctionalGauge
   */
  public value(): number {
    return this.#fn()
  }

  // Do nothing. Value is determined by this.fn.
  public update(i: number) {}
}
