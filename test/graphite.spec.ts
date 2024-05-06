import { expect } from "chai"
import { Registry } from "../src/registry"
import { Reporter } from "../src/reporter"
import { Graphite } from "../src/graphite"
import { UniformSample } from '../src/sample'
import { Healthcheck } from '../src/healthcheck'
import * as net from 'net'

describe('Graphite', () => {
  it('Should implement Reporter', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer()
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 10000,
        prefix: ""
      })

      // Silence error logging.
      graph.onError(() => {})

      server.close(() => resolve())
      expect(graph instanceof Reporter).to.equal(true)
    })
  })

  it('Should connect to graphite server', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.destroy()
        server.close(() => resolve())
      })

      server.listen(6969)
      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 10000,
        prefix: ""
      })

      // Silence error logging.
      graph.onError(() => {})
    })
  })

  it('Should submit metrics once', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          expect(data.toString().substring(0, 10))
            .to.equal('my-gauge 0')

          conn.destroy()
          server.close(() => resolve())
        })
      })

      server.listen(6969)
      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 10000,
        prefix: ""
      })

      reg.getOrRegisterGauge('my-gauge')
      graph.once()

      // Silence error logging.
      graph.onError(() => {})
    })
  })

  it('Should submit metrics every flush_interval', () => {
    return new Promise<void>((resolve) => {
      let graph : Graphite
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          expect(data.toString().substring(0, 10))
            .to.equal('my-gauge 0')

          conn.destroy()
          graph.stop()
          server.close(() => resolve())
        })
      })

      server.listen(6969)
      const reg = new Registry()
      graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      reg.getOrRegisterGauge('my-gauge')
      graph.start()

      // Silence error logging.
      graph.onError(() => {})
    })
  })

  it('Should emit close event', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer()
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      graph.onError((err) => {
        if (err.message === 'close') {
          resolve()
        }
      })
      server.close()
    })
  })

  it('Should submit healthcheck using plaintext protocol', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          const str = data.toString()
          expect(str.length).to.equal(63)

          expect(str.substring(0, 18)).to.equal('my-hc-good.healthy')
          expect(str.substring(32, 49)).to.equal('my-hc-bad.healthy')

          // Graphite does not support boolean types, so we
          // expect 'healthy' to be '1'.
          expect(str.substring(19,20)).to.equal('1')
          expect(str.substring(50,51)).to.equal('1')

          conn.destroy()
          server.close(() => resolve())
        })
      })
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      // silence error logging.
      graph.onError(() => {})

      reg.getOrRegisterHealthcheck('my-hc-good', (h: Healthcheck) => {
        h.healthy()
      })
      reg.getOrRegisterHealthcheck('my-hc-bad', (h: Healthcheck) => {
        h.unhealthy(new Error())
      })
      graph.once()
    })
  })

  it('Should submit counter using plaintext protocol', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          const str = data.toString()
          expect(str.length).to.equal(24)
          expect(str.substring(0,10)).to.equal('my-counter')
          expect(str.substring(11,12)).to.equal('5')
          conn.destroy()
          server.close(() => resolve())
        })
      })
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      // silence error logging.
      graph.onError(() => {})

      reg.getOrRegisterCounter('my-counter').inc(5)
      graph.once()
    })
  })

  it('Should submit gauge using plaintext protocol', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          const str = data.toString()
          expect(str.length).to.equal(22)
          expect(str.substring(0,8)).to.equal('my-gauge')
          expect(str.substring(9,10)).to.equal('7')
          conn.destroy()
          server.close(() => resolve())
        })
      })
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      // silence error logging.
      graph.onError(() => {})

      reg.getOrRegisterGauge('my-gauge').update(7)
      graph.once()
    })
  })

  it('Should submit histogram using plaintext protocol', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          const str = data.toString()
          expect(str.length).to.equal(367)

          expect(str.substring(0,13)).to.equal('my-hist.count')
          expect(str.substring(14,15)).to.equal('0')

          expect(str.substring(27,38)).to.equal('my-hist.max')
          expect(str.substring(39,40)).to.equal('0')

          expect(str.substring(52,64)).to.equal('my-hist.mean')
          expect(str.substring(65,66)).to.equal('0')

          // Other strings omitted for brevity.
          expect(str.substring(330, 353)).to.equal('my-hist.percentile.99_9')
          expect(str.substring(354, 355)).to.equal('0')

          conn.destroy()
          server.close(() => resolve())
        })
      })
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      // silence error logging.
      graph.onError(() => {})

      reg.getOrRegisterHistogram('my-hist', new UniformSample(0))
      graph.once()
    })
  })

  it('Should submit meter using plaintext protocol', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          const str = data.toString()

          // sometimes meter.rate.min gives unpredictable
          // unpredictable results like 6.99987...
          expect(str.length).to.be.greaterThan(141)

          expect(str.substring(0,11)).to.equal('meter.count')
          expect(str.substring(12,13)).to.equal('7')

          expect(str.substring(25,40)).to.equal('meter.rate.1min')
          expect(str.substring(41,42)).to.equal('0')

          expect(str.substring(54,69)).to.equal('meter.rate.5min')
          expect(str.substring(70,71)).to.equal('0')

          expect(str.substring(54,69)).to.equal('meter.rate.5min')
          expect(str.substring(70,71)).to.equal('0')

          expect(str.substring(83,99)).to.equal('meter.rate.15min')
          expect(str.substring(100,101)).to.equal('0')

          conn.destroy()
          server.close(() => resolve())
        })
      })
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      // silence error logging.
      graph.onError(() => {})

      reg.getOrRegisterMeter('meter').mark(7)
      graph.once()
    })
  })

  it('Should submit timer using plaintext protocol', () => {
    return new Promise<void>((resolve) => {
      const server = net.createServer((conn) => {
        conn.on('data', (data) => {
          const str = data.toString()
          expect(str.length).to.equal(465)

          expect(str.substring(0,11)).to.equal('timer.count')
          expect(str.substring(12,13)).to.equal('0')

          expect(str.substring(25,34)).to.equal('timer.min')
          expect(str.substring(35,36)).to.equal('0')

          expect(str.substring(48,57)).to.equal('timer.max')
          expect(str.substring(58,59)).to.equal('0')

          expect(str.substring(71,81)).to.equal('timer.mean')
          expect(str.substring(82,83)).to.equal('0')

          expect(str.substring(95,104)).to.equal('timer.sum')
          expect(str.substring(105,106)).to.equal('0')

          // other string omitted for brevity.

          conn.destroy()
          server.close(() => resolve())
        })
      })
      server.listen(6969)

      const reg = new Registry()
      const graph = new Graphite({
        port: 6969,
        addr: 'localhost',
        registry: reg,
        flush_interval: 500,
        prefix: ""
      })

      // silence error logging.
      graph.onError(() => {})

      reg.getOrRegisterTimer('timer')
      graph.once()
    })
  })
})
