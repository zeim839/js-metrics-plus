/**
 * Sample maintains a statistically-significant selection of
 * values from a stream.
 *
 * @export
 * @interface Sample
 */
export interface Sample {
  /**
   * Clears the sample.
   *
   * @memberof Sample
   */
  clear(): void

  /**
   * Gets the sample count.
   *
   * @returns {number}
   * @memberof Sample
   */
  count(): number

  /**
   * Gets the maximum value.
   *
   * @returns {number}
   * @memberof Sample
   */
  max(): number

  /**
   * Gets the sample mean.
   *
   * @returns {number}
   * @memberof Sample
   */
  mean(): number

  /**
   * Gets the sample minimum.
   *
   * @returns {number}
   * @memberof Sample
   */
  min(): number

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof Sample
   */
  percentile(p: number): number

  /**
   * Calculates the value of each ps percentile from the samples.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof Sample
   */
  percentiles(ps: number[]): number[]

  /**
   * Size returns the size of the sample, which is at
   * most the reservoir size.
   *
   * @returns {number}
   * @memberof Sample
   */
  size(): number

  /**
   * Snapshot returns a serializable JSON object of
   * the histogram's current state.
   *
   * @returns {any}
   * @memberof Sample
   */
  snapshot(): any

  /**
   * Returns the sample standard deviation.
   *
   * @returns {number}
   * @memberof Sample
   */
  stdDev(): number

  /**
   * Returns the sum of sample values.
   *
   * @returns {number}
   * @memberof Sample
   */
  sum(): number

  /**
   * Samples a new value.
   *
   * @param {number} [i] the new sample value.
   * @memberof Sample
   */
  update(i: number): void

  /**
   * Values returns a copy of the values in the sample.
   *
   * returns {Array<number>}
   * @memberof Sample
   */
  values(): number[]

  /**
   * Returns the sample variance.
   *
   * @returns {number}
   * @memberof Sample
   */
  variance(): number
}

/**
 * A UniformSample is a sample using Vitter's Algorithm R.
 * <http://www.cs.umd.edu/~samir/498/vitter.pdf>
 *
 * @export
 * @class UniformSample
 * @implements {Sample}
 */
export class UniformSample implements Sample {
  #reservoirSize:    number
  protected _count:  number
  protected _values: number[]

  /**
   * Creates an instance of UniformSample.
   *
   * @param {number} [reservoirSize] The number of statistically
   * significant observations to maintain.
   * @memberof UniformSample
   */
  constructor(reservoirSize: number) {
    this.#reservoirSize = reservoirSize
    this._values = []
    this._count = 0
  }

  /**
   * Clears the sample.
   *
   * @memberof UniformSample
   */
  public clear(): void {
    this._count = 0
    this._values = []
  }

  /**
   * Gets the sample count.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public count(): number {
    return this._count
  }

  /**
   * Gets the maximum value.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public max(): number {
    return sampleMax(this._values)
  }

  /**
   * Gets the sample mean.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public mean(): number {
    return sampleMean(this._values)
  }

  /**
   * Gets the sample minimum.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public min(): number {
    return sampleMin(this._values)
  }

  /**
   * Calculates the value of the p-th percentile from the samples.
   *
   * @param {number} [p] the percentile in question.
   * @returns {number}
   * @memberof UniformSample
   */
  public percentile(p: number): number {
    return samplePercentile(this._values, p)
  }

  /**
   * Calculates the value of each ps percentile from the samples.
   *
   * @param {Array<number>} [ps] the percentiles in question.
   * @returns {Array<number>}
   * @memberof UniformSample
   */
  public percentiles(ps: number[]): number[] {
    return samplePercentiles(this._values, ps)
  }

  /**
   * Size returns the size of the sample, which is at
   * most the reservoir size.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public size(): number {
    return this._values.length
  }

  /**
   * Snapshot returns a serializable JSON object of
   * the histogram's current state.
   *
   * @returns {any}
   * @memberof UniformSample
   */
  public snapshot(): any {
    return {
      count: this._count,
      values: this._values,
    }
  }

  /**
   * Returns the sample standard deviation.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public stdDev(): number {
    return sampleStdDev(this._values)
  }

  /**
   * Returns the sum of sample values.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public sum(): number {
    return sampleSum(this._values)
  }

  /**
   * Samples a new value.
   *
   * @param {number} [i] the new sample value.
   * @memberof UniformSample
   */
  public update(i: number): void {
    this._count++
    if (this.size() < this.#reservoirSize) {
      this._values.push(i)
      return
    }

    const r = Math.floor(Math.random() * this._count)
    if (r < this._values.length) {
      this._values[r] = i
    }
  }

  /**
   * Values returns a copy of the values in the sample.
   *
   * returns {Array<number>}
   * @memberof UniformSample
   */
  public values(): number[] {
    return Object.assign([], this._values)
  }

  /**
   * Returns the sample variance.
   *
   * @returns {number}
   * @memberof UniformSample
   */
  public variance(): number {
    return sampleVariance(this._values)
  }
}

/**
 * ExpDecaySample is an exponentially-decaying sample using a forward-decaying
 * priority reservoir. See Cormode et al's "Forward Decay: A Practical Time
 * Decay Model for Streaming Systems".
 *
 * <http://dimacs.rutgers.edu/~graham/pubs/papers/fwddecay.pdf>
 *
 * @export
 * @class ExpDecaySample
 * @implements {Sample}
 */
export class ExpDecaySample extends UniformSample implements Sample {
  #reservoirSize: number
  #alpha: number
  #t0: Date
  #t1: Date

  #values: {key: number, value: number}[]

  // one hour.
  static rescaleThreshold = 3600000

  /**
   * Creates an instance of ExpDecaySample.
   *
   * @param {number} [alpha] exponential decay alpha.
   * @param {number} [reservoirSize] The number of statistically
   * significant observations to maintain.
   * @memberof ExpDecaySample
   */
  constructor(alpha: number, reservoirSize: number) {
    super(reservoirSize)
    this.#reservoirSize = reservoirSize
    this.#alpha = alpha
    this.#values = []

    this.#t0 = new Date()
    this.#t1 = this.#t0
    this.#t1.setTime(this.#t1.getTime() +
      ExpDecaySample.rescaleThreshold)
  }

  /**
   * Clears the sample.
   *
   * @memberof ExpDecaySample
   */
  public clear(): void {
    super.clear()
    this.#t0 = new Date()
    this.#t1.setTime(this.#t1.getTime() +
      ExpDecaySample.rescaleThreshold)
  }

  /**
   * Samples a new value.
   *
   * @param {Date} [t} the sample timestamp.
   * @param {number} [i] the new sample value.
   * @memberof ExpDecaySample
   */
  public update(i: number): void {
    const t = new Date()
    this._count++
    if (this.size() === this.#reservoirSize) {
      this._values.pop()
    }

    const f = Math.floor(Math.random() * this._count)
    const elapsed = (t.getTime() - this.#t0.getTime())/1000
    this.#values.push({
      key: Math.exp(elapsed*this.#alpha) / f,
      value: i,
    })

    if (t > this.#t1) {
      const values = this.#values
      const t0 = this.#t0
      this.#values = []
      this.#t0 = t
      this.#t1.setTime(this.#t0.getTime() +
        ExpDecaySample.rescaleThreshold)
      for (let i = 0; i < values.length; ++i) {
        values[i].key = values[i].key *
          Math.exp(-this.#alpha * (this.#t0.getTime() - t0.getTime())/1000)
        this.#values.push(values[i])
      }
    }
  }
}

function sampleMax(vals: number[]): number {
  if (vals.length === 0) {
    return 0
  }
  let max = Number.MIN_SAFE_INTEGER
  for (let i = 0; i < vals.length; ++i) {
    if (max < vals[i]) {
      max = vals[i]
    }
  }
  return max
}

function sampleMean(vals: number[]): number {
  if (vals.length === 0) {
    return 0
  }
  return sampleSum(vals) / vals.length
}

function sampleMin(vals: number[]): number {
  if (vals.length === 0) {
    return 0
  }
  let min = Number.MAX_SAFE_INTEGER
  for (let i = 0; i < vals.length; ++i) {
    if (min > vals[i]) {
      min = vals[i]
    }
  }
  return min
}

function samplePercentile(vals: number[], p: number): number {
  return samplePercentiles(vals, [p])[0]
}

function samplePercentiles(vals: number[], ps: number[]): number[] {
  const scores = new Array<number>(ps.length)
  if (vals.length === 0) {
    for (let i = 0; i < ps.length; ++i) {
      scores[i] = 0
    }
    return scores
  }
  const len = vals.length
  if (len > 0) {
    vals.sort()
    for (let i = 0; i < ps.length; ++i) {
      const pos = ps[i] * (len + 1)
      if (pos < 1) {
        scores[i] = vals[0]
      } else if (pos >= len) {
        scores[i] = vals[len - 1]
      } else {
        const lower = vals[pos-1]
        const upper = vals[pos]
        scores[i] = lower + (pos-Math.floor(pos))*(upper-lower)
      }
    }
  }
  return scores
}

function sampleStdDev(vals: number[]): number {
  return Math.sqrt(sampleVariance(vals))
}

function sampleSum(vals: number[]): number {
  let sum = 0
  for (let i = 0; i < vals.length; ++i) {
    sum += vals[i]
  }
  return sum
}

function sampleVariance(vals: number[]): number {
  if (vals.length === 0) {
    return 0
  }
  const m = sampleMean(vals)
  let sum = 0
  for (let i = 0; i < vals.length; ++i) {
    const d = vals[i] - m
    sum += d * d
  }
  return sum / vals.length
}
