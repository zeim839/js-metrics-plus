import { Metric, BaseMetric } from './metric'
import { Registry } from './registry'

/**
 * A counter represents a number that can be increased
 * or decreased in steps. The initial value is 0.
 *
 * @export
 * @interface Counter
 * @extends {Metric}
 */
export interface Counter extends Metric {
  /**
   * Clears the current count.
   *
   * @memberof Counter
   */
  clear(): void

  /**
   * Gets the current count.
   *
   * @returns {number}
   * @memberof Counter
   */
  count(): number

  /**
   * Decrements the current count by i.
   *
   * @param {number} i
   * @memberof Counter
   */
  dec(i: number): void

  /**
   * Increments the current count by i.
   *
   * @param {number} i
   * @memberof Counter
   */
  inc(i: number): void

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof Counter
   */
  snapshot(): any
}

/**
 * NullCounter is a no-op counter.
 *
 * @export
 * @class NullCounter
 * @extends {BaseMetric}
 * @implements {Counter}
 */
export class NullCounter extends BaseMetric implements Counter, Metric {

  /**
   * Creates an instance of NullCounter
   *
   * @param {string} [name] optional name of the counter.
   * @param {string} [desc] optional description of the counter.
   * @memberof NullCounter
   */
  public constructor(name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * clear is a no-op.
   *
   * @memberof NullCounter
   */
  public clear(): void {}

  /**
   * count is a no-op.
   *
   * @returns {number}
   * @memberof NullCounter
   */
  public count(): number { return 0 }

  /**
   * inc is a no-op.
   *
   * @param {number} i
   * @memberof NullCounter
   */
  public inc(i: number = 1) {}

  /**
   * dec is a no-op.
   *
   * @param {number} i
   * @memberof NullCounter
   */
  public dec(i: number = 1) {}

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof NullCounter
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      count: 0,
    }
  }
}

/**
 * A standard implementation of Counter.
 *
 * @export
 * @class StandardCounter
 * @extends {BaseMetric}
 * @implements {Counter}
 */
export class StandardCounter extends BaseMetric implements Counter, Metric {
  #count: number

  /**
   * Creates an instance of StandardCounter.
   *
   * @param {string} [name] optional name of the counter.
   * @param {string} [desc] optional description of the counter.
   * @memberof StandardCounter
   */
  public constructor(name?: string, desc?: string) {
    super()
    this.#count = 0
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * Clears the current count.
   *
   * @memberof StandardCounter
   */
  public clear(): void {
    this.#count = 0
  }

  /**
   * Gets the current count.
   *
   * @returns {number}
   * @memberof StandardCounter
   */
  public count(): number {
    return this.#count
  }

  /**
   * Increments the current count by i.
   *
   * @param {number} i
   * @memberof StandardCounter
   */
  public inc(i: number = 1) {
    this.#count += i
  }

  /**
   * Decrements the current count by i.
   *
   * @param {number} i
   * @memberof StandardCounter
   */
  public dec(i: number = 1) {
    this.inc(-i)
  }

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof StandardCounter
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      count: this.count(),
    }
  }
}
