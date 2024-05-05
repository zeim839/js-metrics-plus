/**
 * Representation of a metric.
 *
 * @export
 * @interface Metric
 */
export interface Metric {
  /**
   * Gets the name of the metric.
   *
   * @returns {string}
   * @memberof Metric
   */
  getName(): string

  /**
   * Sets the name of the metric.
   *
   * @param {string} name
   * @returns {this}
   * @memberof Metric
   */
  setName(name: string): this

  /**
   * Gets the description of the metric.
   *
   * @returns {string}
   * @memberof Metric
   */
  getDescription(): string

  /**
   * Sets the description of the metric.
   *
   * @param {string} description
   * @returns {this}
   * @memberof Metric
   */
  setDescription(description: string): this

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof Metric
   */
  snapshot(): any
}

export abstract class BaseMetric implements Metric {
  /**
   * A static number instance to give an unique id within an application instance.
   * This counter is only unique per process, forked processes start from 0.
   *
   * @private
   * @static
   * @memberof BaseMetric
   */
  private static COUNTER = 0;

  /**
   * The unique id of this metric instance.
   *
   * @type {number}
   * @memberof BaseMetric
   */
  public readonly id: number = BaseMetric.COUNTER++;

  /**
   * The name of this metric.
   *
   * @type {string}
   * @memberof BaseMetric
   */
  public name: string = "";

  /**
   * The description of this metric.
   *
   * @type {string}
   * @memberof BaseMetric
   */
  public description: string = "";

  /**
   * Gets the name of the metric.
   *
   * @returns {string}
   * @memberof BaseMetric
   */
  getName() {
    return this.name;
  }

  /**
   * Sets the name of the metric.
   *
   * @param {string} name
   * @returns {this}
   * @memberof BaseMetric
   */
  setName(name: string | undefined) {
    if (typeof name === 'undefined') {
      this.name = ""
      return this
    }
    this.name = name
    return this
  }

  /**
   * Gets the description of the metric.
   *
   * @returns {string}
   * @memberof Metric
   */
  getDescription() {
    return this.description
  }

  /**
   * Sets the description of the metric.
   *
   * @param {string} description
   * @returns {this}
   * @memberof Metric
   */
  setDescription(description: string | undefined) {
    if (typeof description === 'undefined') {
      this.description = ""
      return this
    }
    this.description = description
    return this
  }

  /**
   * Generates a serialized version of this metric.
   *
   * @returns {*}
   * @memberof BaseMetric
   */
  snapshot() {
    return {
      id: this.id,
      name: this.getName(),
      description: this.getDescription(),
    }
  }
}
