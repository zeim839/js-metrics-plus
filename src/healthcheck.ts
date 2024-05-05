import { BaseMetric, Metric } from "./metric"

/**
 * Healthcheck holds an error value describing an arbitrary
 * up/down status.
 *
 * @export
 * @interface Healthcheck
 * @extends {Metric}
 */
export interface Healthcheck extends Metric {
  /**
   * Check runs the healthcheck function to update
   * the healthcheck's status.
   *
   * @memberof Healthcheck
   */
  check(): void

  /**
   * Error returns the healthcheck's status.
   *
   * @returns {Error | null}
   * @memberof Healthcheck
   */
  error(): Error | null

  /**
   * Healthy marks the healthcheck as healthy.
   *
   * @memberof Healthcheck
   */
  healthy(): void

  /**
   * Unhealthy marks the healthcheck as unhealthy. The error
   * is stored and may be retrieved by the Error method.
   *
   * @memberof Healthcheck
   */
  unhealthy(err: Error): void

  /**
   * Snapshot returns a serializable JSON object of
   * the healthcheck's current state.
   *
   * @returns {any}
   * @memberof Healthcheck
   */
  snapshot(): any
}

export interface HealthcheckFn {
  (h: Healthcheck): void
}

/**
 * A no-op implementation of Healthcheck
 *
 * @export
 * @class NullHealthcheck
 * @extends {BaseMetric}
 * @implements {Healthcheck}
 */
export class NullHealthcheck extends BaseMetric implements Metric, Healthcheck {

  /**
   * Creates an instance of NullHealthcheck.
   *
   * @param {HealthcheckFn} [fn] healthcheck function.
   * @param {string} [name] optional metric name.
   * @param {string} [description] optional metric description.
   * @memberof NullHealthcheck
   */
  public constructor(fn: HealthcheckFn, name?: string, desc?: string) {
    super()
    super.setName(name)
    super.setDescription(desc)
  }

  /**
   * check is a no-op.
   *
   * @returns {number}
   * @memberof NullHealthcheck
   */
  public check(): void {}

  /**
   * Error is a no-op.
   *
   * @returns {Error | null}
   * @memberof NullHealthcheck
   */
  public error(): Error | null { return null }

  /**
   * Healthy is a no-op.
   *
   * @memberof NullHealthcheck
   */
  public healthy(): void {}

  /**
   * Unhealthy is a no-op.
   *
   * @memberof NullHealthcheck.
   */
  public unhealthy(err: Error): void {}

  /**
   * Snapshot returns a serializable JSON object of
   * the healthcheck's current state.
   *
   * @returns {any}
   * @memberof NullHealthcheck
   */
  public snapshot(): any {
    return {
      ...super.snapshot(),
      healthy: true,
      error: null,
    }
  }
}

/**
 * A standard implementation of Healthcheck
 *
 * @export
 * @class StandardHealthcheck
 * @extends {BaseMetric}
 * @implements {Healthcheck}
 */
export class StandardHealthcheck extends BaseMetric implements Metric, Healthcheck {
  #err: Error | null = null
  #fn:  HealthcheckFn

  /**
   * Creates an instance of StandardHealthcheck.
   *
   * @param {HealthcheckFn} [fn] healthcheck function.
   * @param {string} [name] optional metric name.
   * @param {string} [description] optional metric description.
   * @memberof StandardHealthcheck
   */
  public constructor(fn: HealthcheckFn, name?: string, desc?: string) {
      super()
      super.setName(name)
      super.setDescription(desc)
      this.#fn = fn
  }

  /**
   * Check runs the healthcheck function to update
   * the healthcheck's status.
   *
   * @returns {number}
   * @memberof StandardHealthcheck
   */
  public check(): void {
    this.#fn(this)
  }

  /**
   * Error returns the healthcheck's status.
   *
   * @returns {Error | null}
   * @memberof StandardHealthcheck
   */
  public error(): Error | null {
    return this.#err
  }

  /**
   * Healthy marks the healthcheck as healthy.
   *
   * @memberof StandardHealthcheck
   */
  public healthy(): void {
    this.#err = null
  }

  /**
   * Unhealthy marks the healthcheck as unhealthy. The error
   * is stored and may be retrieved by the Error method.
   *
   * @memberof StandardHealthcheck
   */
  public unhealthy(err: Error): void {
    this.#err = err
  }

  /**
   * Snapshot returns a serializable JSON object of
   * the healthcheck's current state.
   *
   * @returns {any}
   * @memberof StandardHealthcheck
   */
  public snapshot(): any {
    let err = this.error()
    return {
      ...super.snapshot(),
      healthy: err === null,
      error: this.error(),
    }
  }
}
