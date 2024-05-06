import { BaseMetric, Metric } from './metric'
import { Sample, UniformSample } from './sample'

/**
 * A histogram records a series of data values.
 *
 * @export
 * @interface Histogram
 * @extends {Metric}
 */
export interface Histogram extends Metric {

  /**
   * Clears the underlying sample.
   *
   * @memberof Histogram
   */
  clear(): void

  /**
   * Gets the sample count.
   *
   * @returns {number}
   * @memberof Histogram
   */
  count(): number

  /**
   * Gets the maximum value.
   *
   * @returns {number}
   * @memberof Histogram
   */
  max(): number

  /**
   * Gets the sample mean.
   *
   * @returns {number}
   * @memberof Histogram
   */
  mean(): number

  /**
   * Gets the sample minimum.
   *
   * @returns {number}
   * @memberof Histogram
   */
  min(): number

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof Histogram
   */
  percentile(p: number): number

  /**
   * Calculates the value of each ps percentile from the samples.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof Histogram
   */
  percentiles(ps: number[]): number[]

  /**
   * Returns the underlying sample.
   *
   * @returns {Sample}
   * @memberof Histogram
   */
  sample(): Sample

  /**
   * Snapshot returns a serializable JSON object of
   * the histogram's current state.
   *
   * @returns {any}
   * @memberof Histogram
   */
  snapshot(): any

  /**
   * Returns the sample standard deviation.
   *
   * @returns {number}
   * @memberof Histogram
   */
  stdDev(): number

  /**
   * Returns the sum of sample values.
   *
   * @returns {number}
   * @memberof Histogram
   */
  sum(): number

  /**
   * Samples a new value.
   *
   * @param {number} [v] the new sample value.
   * @memberof Histogram
   */
  update(v: number): void

  /**
   * Returns the sample variance.
   *
   * @returns {number}
   * @memberof Histogram
   */
  variance(): number
};

/**
 * A no-op implementation of Histogram.
 *
 * @export
 * @class NullHistogram
 * @extends {BaseMetric}
 * @implements {Histogram}
 */
export class NullHistogram extends BaseMetric implements Metric, Histogram {

  /**
   * Creates an instance of NullHistogram.
   *
   * @param {Sample} [sample] histogram sample data.
   * @param {string} [name] optional name of the histogram.
   * @param {string} [desc] optional description of the histogram.
   * @memberof NullHistogram
   */
  public constructor(sample: Sample, name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * Clear is a no-op.
   *
   * @memberof NullHistogram
   */
  public clear(): void {}

  /**
   * count is a no-op.
   *
   * @returns {number}
   * @memberof NullHistogram
   */
  public count(): number { return 0 }

  /**
   * max is a no-op.
   *
   * @returns {number}
   * @memberof NullHistogram
   */
  public max(): number { return 0 }

  /**
   * mean is a no-op.
   *
   * @returns {number}
   * @memberof NullHealthcheck
   */
  public mean(): number { return 0 }

  /**
   * min is a no-op.
   *
   * @returns {number}
   * @memberof NullHealthcheck.
   */
  public min(): number { return 0 }

  /**
   * percentile is a no-op.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof NullHealthcheck
   */
  public percentile(p: number): number { return 0 }

  /**
   * percentiles is a no-op.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof NullHealthcheck
   */
  public percentiles(ps: number[]): number[] { return [] }

  /**
   * sample is a no-op.
   *
   * @returns {Sample}
   * @memberof NullHealthcheck
   */
  public sample(): Sample { return new UniformSample(0) }

  /**
   * stdDev is a no-op.
   *
   * @returns {number}
   * @memberof NullHealthcheck
   */
  public stdDev(): number { return 0 }

  /**
   * sum is a no-op.
   *
   * @returns {number}
   * @memberof NullHealthcheck
   */
  public sum(): number { return 0 }

  /**
   * update is a no-op.
   *
   * @param {number} [v] the new sample value.
   * @memberof NullHealthcheck
   */
  public update(v: number): void {}

  /**
   * variance is a no-op.
   *
   * @returns {number}
   * @memberof NullHealthcheck
   */
  public variance(): number { return 0 }

  /**
   * Snapshot returns a serializable JSON object of
   * the histogram's current state.
   *
   * @returns {any}
   * @memberof NullHealthcheck
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      count:    0,
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
}

/**
 * A standard implementation of Histogram.
 *
 * @export
 * @class StandardHistogram
 * @extends {BaseMetric}
 * @implements {Histogram}
 */
export class StandardHistogram extends BaseMetric implements Metric, Histogram {
  #sample: Sample

  /**
   * Creates an instance of StandardHistogram.
   *
   * @param {Sample} [sample] histogram sample data.
   * @param {string} [name] optional name of the histogram.
   * @param {string} [desc] optional description of the histogram.
   * @memberof StandardHistogram
   */
  public constructor(sample: Sample, name?: string, desc?: string) {
    super()
    this.#sample = sample
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * Clears the underlying sample.
   *
   * @memberof StandardHistogram
   */
  public clear(): void {
    this.#sample.clear()
  }

  /**
   * Gets the sample count.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public count(): number {
    return this.#sample.count()
  }

  /**
   * Gets the maximum value.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public max(): number {
    return this.#sample.max()
  }

  /**
   * Gets the sample mean.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public mean(): number {
    return this.#sample.mean()
  }

  /**
   * Gets the sample minimum.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public min(): number {
    return this.#sample.min()
  }

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof StandardHistogram
   */
  public percentile(p: number): number {
    return this.#sample.percentile(p)
  }

  /**
   * Calculates the value of each ps percentile from the samples.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof StandardHistogram
   */
  public percentiles(ps: number[]): number[] {
    return this.#sample.percentiles(ps)
  }

  /**
   * Returns the underlying sample.
   *
   * @returns {Sample}
   * @memberof StandardHistogram
   */
  public sample(): Sample {
    return this.#sample
  }

  /**
   * Returns the sample standard deviation.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public stdDev(): number {
    return this.#sample.stdDev()
  }

  /**
   * Returns the sum of sample values.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public sum(): number {
    return this.#sample.sum()
  }

  /**
   * Samples a new value.
   *
   * @param {number} [v] the new sample value.
   * @memberof StandardHistogram
   */
  public update(v: number): void {
    this.#sample.update(v)
  }

  /**
   * Returns the sample variance.
   *
   * @returns {number}
   * @memberof StandardHistogram
   */
  public variance(): number {
    return this.#sample.variance()
  }

  /**
   * Snapshot returns a serializable JSON object of
   * the histogram's current state.
   *
   * @returns {any}
   * @memberof StandardHistogram
   */
  public snapshot(): any {
    const ps = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999])
    return {
      ...super.snapshot(),
      count:    this.count(),
      max:      this.max(),
      mean:     this.mean(),
      min:      this.min(),
      stdDev:   this.stdDev(),
      sum:      this.sum(),
      variance: this.variance(),
      percentile: {
        median: ps[0],
        _75:    ps[1],
        _95:    ps[2],
        _99:    ps[3],
        _99_9:  ps[4],
      }
    }
  }
}
