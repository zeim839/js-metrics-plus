import { Clock, StdClock } from './clock'
import { Metric } from './metric'
import { Counter, NullCounter, StandardCounter } from './counter'
import { Gauge, FunctionalGauge, StandardGauge, NullGauge } from './gauge'
import { HealthcheckFn, Healthcheck,
  StandardHealthcheck, NullHealthcheck } from './healthcheck'
import { Histogram, NullHistogram, StandardHistogram } from './histogram'
import { Meter, NullMeter, StandardMeter } from './meter'
import { Timer, StandardTimer, NullTimer } from './timer'
import { Sample } from './sample'

export type NameFactory = (baseName: string, metricName: string, metric: Metric) => string

var _useNullMetrics = false

/**
 * useNullMetrics is checked by the constructor functions
 * for all of the standard metrics. If it is true, the metric
 * returned is a stub. This is a global kill switch that helps
 * quantify the observer effect and improves performance when
 * metrics are of no concern.
 *
 * @export
 * @param {boolean} [t] whether to use null metrics.
 * @returns {boolean} the new value of useNullMetrics
 *
 */
export function useNullMetrics(t: boolean = true): boolean {
  _useNullMetrics = t
  return _useNullMetrics
}

/**
 * Proxy object for a metric.
 *
 * @export
 * @class Registration
 * @template T
 */
export class Registration<T extends Metric> {
  /**
   * The metric instance.
   *
   * @type {T}
   * @memberof Registration
   */
  public metricRef: T

  /**
   * The name the metric is registered with.
   *
   * @type {string}
   * @memberof Registration
   */
  public name: string

  /**
   * Creates an instance of Registration.
   *
   * @param {T} metricRef
   * @memberof Registration
   */
  public constructor(metricRef: T) {
    this.metricRef = metricRef
    this.name = metricRef.getName()
  }
}

/**
 * A registry manages metric instances.
 *
 * @export
 * @class Registry
 */
export class Registry {

  /**
   * Determines if the specified object is a {@link Counter} or references one.
   *
   * @static
   * @param {*} instance
   * @returns {instance is Counter}
   * @memberof Registry
   */
  public static isCounter(instance: any): instance is Counter {
    return instance instanceof StandardCounter
  }

  /**
   * Determines if the specified object is a {@link Gauge} or references one.
   *
   * @static
   * @param {*} instance
   * @returns {instance is Gauge}
   * @memberof Registry
   */
  public static isGauge(instance: any): instance is Gauge {
    return instance instanceof StandardGauge ||
      instance instanceof FunctionalGauge
  }

  /**
   * Determines if the specified object is a {@link Healthcheck} or
   * references one.
   *
   * @static
   * @param {*} instance
   * @returns {instance is Healthcheck}
   * @memberof Registry
   */
  public static isHealthcheck(instance: any): instance is Healthcheck {
    return instance instanceof StandardHealthcheck
  }

  /**
   * Determines if the specified object is a {@link Histogram} or references one.
   *
   * @static
   * @param {*} instance
   * @returns {instance is Histogram}
   * @memberof Registry
   */
  public static isHistogram(instance: any): instance is Histogram {
    return instance instanceof StandardHistogram
  }

  /**
   * Determines if the specified object is a {@link Meter} or references one.
   *
   * @static
   * @param {*} instance
   * @returns {instance is Meter}
   * @memberof Registry
   */
  public static isMeter(instance: any): instance is Meter {
    return instance instanceof StandardMeter
  }

  /**
   * Determines if the specified object is a {@link Timer} or references one.
   *
   * @static
   * @param {*} instance
   * @returns {instance is Timer}
   * @memberof Registry
   */
  public static isTimer(instance: any): instance is Timer {
    return instance instanceof StandardTimer
  }

  /**
   * Standard function to generate the name for a metric.
   *
   * @private
   * @static
   * @param {string} baseName
   * @param {string} metricName
   * @param {Metric} metric
   * @returns {string}
   * @memberof Registry
   */
  private static defaultNameFactory (baseName: string, metricName: string, metric: Metric): string {
    return baseName + '.' + metricName
  }

  /**
   * Default clock instance if no clock instance if provided.
   *
   * @private
   * @type {Clock}
   * @memberof Registry
   */
  #defaultClock: Clock = new StdClock()

  /**
   * A collection metric references.
   *
   * @private
   * @type {Array<Registration<Metric>>}
   * @memberof Registry
   */
  readonly #metrics: Array<Registration<Metric>> = []

  /**
   * The name factory to build metric names.
   *
   * @private
   * @type {NameFactory}
   * @memberof Registry
   */
  #nameFactory: NameFactory = Registry.defaultNameFactory

  /**
   * Sets the default name factory for metric instances.
   *
   * @param {NameFactory} nameFactory
   * @returns {this}
   * @memberof Registry
   */
  public setNameFactory (nameFactory: NameFactory): this {
    this.#nameFactory = nameFactory
    return this
  }

  /**
   * Gets the default clock.
   *
   * @returns {Clock}
   * @memberof Registry
   */
  public getDefaultClock (): Clock {
    return this.#defaultClock
  }

  /**
   * Sets the default clock.
   *
   * @param {Clock} defaultClock
   * @returns {this}
   * @memberof Registry
   */
  public setDefaultClock (defaultClock: Clock): this {
    this.#defaultClock = defaultClock
    return this
  }

  /**
   * Gets the list of all managed counter instances.
   *
   * @returns {Counter[]}
   * @memberof Registry
   */
  public getCounterList (): Counter[] {
    return this.#metrics
      .filter((m) => Registry.isCounter(m.metricRef))
      .map((registration) => registration.metricRef as Counter)
  }

  /**
   * Gets the list of all managed gauge instances.
   *
   * @returns {Array<Gauge<any>>}
   * @memberof Registry
   */
  public getGaugeList(): Gauge[] {
    return this.#metrics
      .filter((m) => Registry.isGauge(m.metricRef))
      .map((registration) => registration.metricRef as Gauge)
  }

  /**
   * Gets the list of all managed healthcheck instances.
   *
   * @returns {Healthcheck[]}
   * @memberof Registry
   */
  public getHealthcheckList(): Healthcheck[] {
    return this.#metrics
      .filter((m) => Registry.isHealthcheck(m.metricRef))
      .map((registration) => registration.metricRef as Healthcheck)
  }

  /**
   * Gets the list of all managed histogram instances.
   *
   * @returns {Histogram[]}
   * @memberof Registry
   */
  public getHistogramList(): Histogram[] {
    return this.#metrics
      .filter((m) => Registry.isHistogram(m.metricRef))
      .map((registration) => registration.metricRef as Histogram)
  }

  /**
   * Gets the list of all managed meter instances.
   *
   * @returns {Meter[]}
   * @memberof Registry
   */
  public getMeterList(): Meter[] {
    return this.#metrics
      .filter((m) => Registry.isMeter(m.metricRef))
      .map((registration) => registration.metricRef as Meter)
  }

  /**
   * Gets the list of all managed timer instances.
   *
   * @returns {Timer[]}
   * @memberof Registry
   */
  public getTimerList(): Timer[] {
    return this.#metrics
      .filter((m) => Registry.isTimer(m.metricRef))
      .map((registration) => registration.metricRef as Timer)
  }

  /**
   * Gets a list of all managed metric instances regardless of the type.
   *
   * @returns {Metric[]}
   * @memberof Registry
   */
  public getMetricList(): Metric[] {
    return this.#metrics.map((metric) => metric.metricRef)
  }

  /**
   * Gets a mapping of all managed metric instances regardless of the type.
   *
   * @returns {Map<string, Metric>}
   * @memberof Registry
   */
  public getMetrics(): Map<string, Metric> {
    const map: Map<string, Metric> = new Map()
    this.#metrics.forEach((registration) => {
      map.set(registration.name, registration.metricRef)
    })

    return map
  }

  /**
   * Gets all managed metric instance by name.
   *
   * @param {string} name
   * @returns {Metric[]}
   * @memberof Registry
   */
  public getMetricsByName(name: string): Metric[] {
    return this.getByName(name)
  }

  /**
   * Gets all managed counter instances by name.
   *
   * @param {string} name
   * @returns {Counter[]}
   * @memberof Registry
   */
  public getCountersByName(name: string): Counter[] {
    return this.getByName<Counter>(name)
  }

  /**
   * Gets all managed gauge instances by name.
   *
   * @param {string} name
   * @returns {Array<Gauge<any>>}
   * @memberof Registry
   */
  public getGaugesByName(name: string): Gauge[] {
    return this.getByName<Gauge>(name)
  }

  /**
   * Gets all managed healthcheck instances by name.
   *
   * @param {string} name
   * @returns {Healthcheck[]}
   * @memberof Registry
   */
  public getHealthchecksByName(name: string): Healthcheck[] {
    return this.getByName<Healthcheck>(name)
  }

  /**
   * Gets all managed histogram instances by name.
   *
   * @param {string} name
   * @returns {Histogram[]}
   * @memberof Registry
   */
  public getHistogramsByName(name: string): Histogram[] {
    return this.getByName<Histogram>(name)
  }

  /**
   * Gets all managed meter instances by name.
   *
   * @param {string} name
   * @returns {Meter[]}
   * @memberof Registry
   */
  public getMetersByName(name: string): Meter[] {
    return this.getByName<Meter>(name)
  }

  /**
   * Gets all managed timer instances by name.
   *
   * @param {string} name
   * @returns {Timer[]}
   * @memberof Registry
   */
  public getTimersByName(name: string): Timer[] {
    return this.getByName<Timer>(name)
  }

  /**
   * Gets all metric instances by name.
   *
   * @private
   * @template T
   * @param {string} name
   * @returns {T[]}
   * @memberof Registry
   */
  private getByName<T extends Metric> (name: string): T[] {
    return this.#metrics
      .filter((metric) => metric.name === name)
      .map((metric) => metric.metricRef) as T[]
  }

  /**
   * Removes all managed metric instances by name regardless of the type.
   *
   * @param {string} name
   * @returns {this}
   * @memberof Registry
   */
  public removeMetrics (name: string): this {
    const metrics: Metric[] = this.getByName(name)
    metrics.forEach((metric) => {
      const index = this.#metrics
        .map((m) => m.metricRef)
        .indexOf(metric, 0)
      if (index > -1) {
        this.#metrics.splice(index, 1)
      }
    })
    return this
  }

  /**
   * Finds an existing counter or constructs and registers a new
   * StandardCounter.
   *
   * @param {string} [name] name of counter.
   * @param {string} [desc] description for counter (if creating).
   * @returns {Counter}
   * @memberof Registry
   */
  public getOrRegisterCounter(name: string, desc?: string): Counter {
    const hasName = this.getByName<Counter>(name).length !== 0
    if (!hasName && !_useNullMetrics) {
      this.registerMetric(new StandardCounter(name, desc))
    }
    if (!hasName && _useNullMetrics) {
      this.registerMetric(new NullCounter(name, desc))
    }
    return this.getByName<Counter>(name)[0]
  }

  /**
   * Finds an existing gauge or constructs and registers a new
   * StandardGauge.
   *
   * @param {string} [name] name of gauge.
   * @param {string} [desc] description for counter (if creating).
   * @returns {Gauge}
   * @memberof Registry
   */
  public getOrRegisterGauge(name: string, desc?: string): Gauge {
    const hasName = this.getByName<Gauge>(name).length !== 0
    if (!hasName && !_useNullMetrics) {
      this.registerMetric(new StandardGauge(name, desc))
    }
    if (!hasName && _useNullMetrics) {
      this.registerMetric(new NullGauge(name, desc))
    }
    return this.getByName<Gauge>(name)[0]
  }

  /**
   * Finds an existing healthcheck or constructs and registers a new
   * StandardHealthcheck.
   *
   * @param {string} [name] name of gauge.
   * @param {HealthcheckFn} [fn] the healthcheck function.
   * @param {string} [desc] description for counter (if creating).
   * @returns {Healthcheck}
   * @memberof Registry
   */
  public getOrRegisterHealthcheck(name: string, fn?: HealthcheckFn, desc?: string) : Healthcheck {
    const hasName = this.getByName<Healthcheck>(name).length !== 0
    if (!hasName && typeof fn === 'undefined') {
      throw new Error('expected fn to be defined for unregistered healthcheck')
    }
    if (!hasName && !_useNullMetrics) {
      this.registerMetric(new StandardHealthcheck(fn, name, desc))
    }
    if (!hasName && _useNullMetrics) {
      this.registerMetric(new NullHealthcheck(fn, name, desc))
    }
    return this.getByName<Healthcheck>(name)[0]
  }

  /**
   * Finds an existing histogram or constructs and registers a new
   * StandardHistogram.
   *
   * @param {string} [name] name of histogram.
   * @param {string} [s] sample for histogram (if creating).
   * @param {string} [desc] description for histogram (if creating).
   * @returns {Histogram}
   * @memberof Registry
   */
  public getOrRegisterHistogram(name: string, s?: Sample, desc?: string): Histogram {
    const hasName = this.getByName<Histogram>(name).length !== 0
    if (!hasName && typeof s === 'undefined') {
      throw new Error('expected sample to be defined for unregistered histogram')
    }
    if (!hasName && typeof s !== 'undefined' && !_useNullMetrics) {
      this.registerMetric(new StandardHistogram(s, name, desc))
    }
    if (!hasName && typeof s !== 'undefined' && _useNullMetrics) {
      this.registerMetric(new NullHistogram(s, name, desc))
    }
    return this.getByName<Histogram>(name)[0]
  }

  /**
   * Finds an existing meter or constructs and registers a new
   * StandardMeter.
   *
   * @param {string} [name] name of meter.
   * @param {string} [desc] description for meter (if creating).
   * @returns {Meter}
   * @memberof Registry
   */
  public getOrRegisterMeter(name: string, desc?: string): Meter {
    const hasName = this.getByName<Meter>(name).length !== 0
    if (!hasName && !_useNullMetrics) {
      this.registerMetric(new StandardMeter(name, desc))
    }
    if (!hasName && _useNullMetrics) {
      this.registerMetric(new NullMeter(name, desc))
    }
    return this.getByName<Meter>(name)[0]
  }

  /**
   * Finds an existing timer or constructs and registers a new
   * StandardTimer.
   *
   * @param {string} [name] name of timer.
   * @param {string} [desc] description for timer (if creating).
   * @returns {Timer}
   * @memberof Registry
   */
  public getOrRegisterTimer(name: string, desc?: string): Timer {
    const hasName = this.getByName<Timer>(name).length !== 0
    if (!hasName && !_useNullMetrics) {
      this.registerMetric(new StandardTimer(name, desc))
    }
    if (!hasName && _useNullMetrics) {
      this.registerMetric(new NullTimer(name, desc))
    }
    return this.getByName<Timer>(name)[0]
  }

  /**
   * Registers the given metric under it's name in this registry.
   *
   * @param {Metric} metric
   * @param {string} [group=null]
   * @returns {this}
   * @memberof Registry
   */
  public registerMetric(metric: Metric): this {
    if (this.getByName<Metric>(metric.getName()).length !== 0) {
      return this
    }
    this.#metrics.push(new Registration(metric))
    return this
  }

  /**
   * Runs all registered healthcheck functions.
   *
   * @memberof Registry
   */
  public runAllHealthchecks(): void {
    let hcs = this.getHealthcheckList()
    for (let i = 0; i < hcs.length; ++i) {
      hcs[i].check()
    }
  }
}

/**
 * The default metrics registry.
 *
 * @export
 */
export var defaultRegistry = new Registry()

/**
 * Gets the list of all managed counter instances.
 *
 * @export
 * @returns {Counter[]}
 */
export function getCounterList (): Counter[] {
  return defaultRegistry.getCounterList()
}

/**
 * Gets the list of all managed gauge instances.
 *
 * @exports
 * @returns {Array<Gauge<any>>}
 */
export function getGaugeList(): Gauge[] {
  return defaultRegistry.getGaugeList()
}

/**
 * Gets the list of all managed healthcheck instances.
 *
 * @exports
 * @returns {Healthcheck[]}
 */
export function getHealthcheckList(): Healthcheck[] {
  return defaultRegistry.getHealthcheckList()
}

/**
 * Gets the list of all managed histogram instances.
 *
 * @exports
 * @returns {Histogram[]}
 */
export function getHistogramList(): Histogram[] {
  return defaultRegistry.getHistogramList()
}

/**
 * Gets the list of all managed meter instances.
 *
 * @exports
 * @returns {Meter[]}
 */
export function getMeterList(): Meter[] {
  return defaultRegistry.getMeterList()
}

/**
 * Gets the list of all managed timer instances.
 *
 * @export
 * @returns {Timer[]}
 */
export function getTimerList(): Timer[] {
  return defaultRegistry.getTimerList()
}

/**
 * Gets a mapping of all managed metric instances regardless of the type.
 *
 * @export
 * @returns {Map<string, Metric>}
 */
export function getMetrics(): Map<string, Metric> {
  return defaultRegistry.getMetrics()
}

/**
 * Gets all managed metric instance by name.
 *
 * @export
 * @param {string} name
 * @returns {Metric[]}
 */
export function getMetricsByName(name: string): Metric[] {
  return defaultRegistry.getMetricsByName(name)
}

/**
 * Gets all managed counter instances by name.
 *
 * @export
 * @param {string} name
 * @returns {Counter[]}
 */
export function getCountersByName(name: string): Counter[] {
  return defaultRegistry.getCountersByName(name)
}

/**
 * Gets all managed gauge instances by name.
 *
 * @export
 * @param {string} name
 * @returns {Array<Gauge<any>>}
 */
export function getGaugesByName(name: string): Gauge[] {
  return defaultRegistry.getGaugesByName(name)
}

/**
 * Gets all managed healthcheck instances by name.
 *
 * @export
 * @param {string} name
 * @returns {Healthcheck[]}
 */
export function getHealthchecksByName(name: string): Healthcheck[] {
  return defaultRegistry.getHealthchecksByName(name)
}

/**
 * Gets all managed histogram instances by name.
 *
 * @export
 * @param {string} name
 * @returns {Histogram[]}
 */
export function getHistogramsByName(name: string): Histogram[] {
  return defaultRegistry.getHistogramsByName(name)
}

/**
 * Gets all managed meter instances by name.
 *
 * @export
 * @param {string} name
 * @returns {Meter[]}
 */
export function getMetersByName(name: string): Meter[] {
  return defaultRegistry.getMetersByName(name)
}

/**
 * Gets all managed timer instances by name.
 *
 * @export
 * @param {string} name
 * @returns {Timer[]}
 */
export function getTimersByName(name: string): Timer[] {
  return defaultRegistry.getTimersByName(name)
}

/**
 * Removes all managed metric instances by name regardless of the type.
 *
 * @export
 * @param {string} name
 * @returns {Registry}
 */
export function removeMetrics(name: string): Registry {
  return defaultRegistry.removeMetrics(name)
}

/**
 * Finds an existing counter or constructs and registers a new
 * StandardCounter.
 *
 * @export
 * @param {string} [name] name of counter.
 * @param {string} [desc] description for counter (if creating).
 * @returns {Counter}
 */
export function getOrRegisterCounter(name: string, desc?: string): Counter {
  return defaultRegistry.getOrRegisterCounter(name, desc)
}

/**
 * Finds an existing gauge or constructs and registers a new
 * StandardGauge.
 *
 * @export
 * @param {string} [name] name of gauge.
 * @param {string} [desc] description for counter (if creating).
 * @returns {Gauge}
 */
export function getOrRegisterGauge(name: string, desc?: string): Gauge {
  return defaultRegistry.getOrRegisterGauge(name, desc)
}

/**
 * Finds an existing healthcheck or constructs and registers a new
 * StandardHealthcheck.
 *
 * @export
 * @param {string} [name] name of healthcheck.
 * @param {HealthcheckFn} [fn] function for healthcheck (if creating).
 * @param {string} [desc] description for healthcheck (if creating).
 * @returns {Healthcheck}
 */
export function getOrRegisterHealthcheck(name: string,
  fn?: HealthcheckFn, desc?: string): Healthcheck {
    return defaultRegistry.getOrRegisterHealthcheck(name, fn, desc)
}

/**
 * Finds an existing histogram or constructs and registers a new
 * StandardHistogram.
 *
 * @export
 * @param {string} [name] name of histogram.
 * @param {string} [s] sample for histogram (if creating).
 * @param {string} [desc] description for histogram (if creating).
 * @returns {Histogram}
 */
export function getOrRegisterHistogram(name: string, s?: Sample, desc?: string): Histogram {
  return defaultRegistry.getOrRegisterHistogram(name, s, desc)
}

/**
 * Finds an existing meter or constructs and registers a new
 * StandardMeter.
 *
 * @export
 * @param {string} [name] name of meter.
 * @param {string} [desc] description for meter (if creating).
 * @returns {Meter}
 */
export function getOrRegisterMeter(name: string, desc?: string): Meter {
  return defaultRegistry.getOrRegisterMeter(name, desc)
}

/**
 * Finds an existing timer or constructs and registers a new
 * StandardTimer.
 *
 * @export
 * @param {string} [name] name of timer.
 * @param {string} [desc] description for timer (if creating).
 * @returns {Timer}
 */
export function getOrRegisterTimer(name: string, desc?: string): Timer {
  return defaultRegistry.getOrRegisterTimer(name, desc)
}

/**
 * Registers the given metric under it's name in this registry.
 *
 * @export
 * @param {Metric} metric
 * @param {string} [group=null]
 * @returns {Registry}
 */
export function registerMetric(metric: Metric): Registry {
  return defaultRegistry.registerMetric(metric)
}

/**
 * Runs all registered healthcheck functions.
 *
 * @memberof Registry
 */
export function runAllHealthchecks(): void {
  defaultRegistry.runAllHealthchecks()
}
