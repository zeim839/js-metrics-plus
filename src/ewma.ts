/**
 * An EWMA records an exponentially moving weighted average.
 *
 * @export
 * @interface EWMA
 */
export interface EWMA {
  /**
   * Returns the EWMA rate.
   *
   * @returns {number}
   * @memberof EWMA
   */
  rate(): number

  /**
   * records a new value and updates the EWMA
   * and rates.
   *
   * @param {number} i
   * @memberof EWMA
   */
  update(i: number): void
}

/**
 * Creates a new EWMA with the specified alpha.
 *
 * @export
 * @param {alpha} alpha
 * @returns {EWMA}
 */
export function newEWMA(alpha: number): EWMA {
  return new StandardEWMA(alpha)
}

// tslint:disable:max-line-length

/**
 * To read more on 1,5,15- minute EWMAs, see:
 *
 * https://web.archive.org/web/20110716195232/http://www.teamquest.com/pdfs/whitepaper/ldavg1.pdf
 * https://web.archive.org/web/20111011225355/http://teamquest.com/pdfs/whitepaper/ldavg2.pdf
 *
 * Instead of ticking, our implementation of EWMA is statically
 * updated when rate() or update() are called.
 */

// tslint:enable:max-line-length

/**
 * Creates a new EWMA for an exponentially weighted 1-minute
 * per-second moving average, which is equivalent to the
 * UNIX 1-minute load average.
 *
 *
 * @export
 * @returns {EWMA}
 */
export function newEWMA1(): EWMA {
  return new StandardEWMA(1 - Math.exp(-5.0 / 60.0 / 1))
}

/**
 * Creates a new EWMA for an exponentially weighted 5-minute
 * per-second moving average, which is equivalent to the
 * UNIX 5-minute load average.
 *
 * @export
 * @returns {EWMA}
 */
export function newEWMA5(): EWMA {
  return new StandardEWMA(1 - Math.exp(-5.0 / 60.0 / 5))
}

/**
 * Creates a new EWMA for an exponentially weighted 15-minute
 * per-second moving average, which is equivalent to the
 * UNIX 15-minute load average.
 *
 * @export
 * @returns {EWMA}
 */
export function newEWMA15(): EWMA {
  return new StandardEWMA(1 - Math.exp(-5.0 / 60.0 / 15))
}

/**
 * A standard implementation of EWMA.
 *
 * @export
 * @class StandardEWMA
 * @implements {EWMA}
 */
export class StandardEWMA implements EWMA {
  #alpha:  number
  #period: number
  #ts:     number  = Date.now()
  #ewma:   number  = 0
  #sample: number  = 0
  #init:   boolean = false

  /**
   * Creates an instance of StandardEWMA.
   *
   * @param {string} [number] weight of new samples.
   * @memberof StandardEWMA
   */
  public constructor(alpha: number, period: number = 5000) {
    this.#alpha = alpha
    this.#period = period
  }

  /**
   * rate returns the rate of events per second at the time
   * the snapshot was taken.
   *
   * @returns {number}
   * @memberof StandardEWMA
   */
  public rate(): number {
    let periods = (Date.now() - this.#ts) / this.#period
    if (periods < 1 || !this.#init) {
      return this.#ewma
    }

    const seconds = this.#period / 1000
    if (!this.#init) {
      this.#ewma = this.#sample / seconds
      this.#ts += this.#period
      this.#init = true
      this.#sample = 0
      periods -= 1
    }

    if (periods >= 1) {
      this.#ewma = (this.#alpha * (this.#sample / seconds)) +
        (1 - this.#alpha) * this.#ewma

      this.#sample = 0
      this.#ts += this.#period
      periods -= 1
    }

    while (periods >= 1) {
      this.#ewma = (1 - this.#alpha) * this.#ewma
      this.#ts += this.#period
      periods -= 1
    }

    return this.#ewma
  }

  /**
   * Samples a new number i.
   *
   * @param {number} [i] the new sample value.
   * @memberof StandardEWMA
   */
  public update(i: number): void {
    let periods = (Date.now() - this.#ts) / this.#period
    if (!this.#init && periods < 1) {
      this.#sample += i
      this.#ewma = 0
      return
    }

    if (periods < 1) {
      this.#sample += i
      return
    }

    const seconds = this.#period / 1000
    if (!this.#init) {
      this.#ewma = this.#sample / seconds
      this.#ts += this.#period
      this.#init = true
      this.#sample = 0
      periods -= 1
    }

    if (periods >= 1) {
      this.#ewma = (this.#alpha * (this.#sample / seconds)) +
        (1 - this.#alpha) * this.#ewma

      this.#sample = 0
      this.#ts += this.#period
      periods -= 1
    }

    while (periods >= 1) {
      this.#ewma = (1 - this.#alpha) * this.#ewma
      this.#ts += this.#period
      periods -= 1
    }

    this.#sample += i
  }
}
