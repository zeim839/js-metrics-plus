import { expect } from "chai"
import { Registry } from "../src/registry"
import { Reporter } from "../src/reporter"
import { InfluxDBv2 } from "../src/influxDBv2"
import * as http from "http"

const body = (req: http.IncomingMessage) => {
  return new Promise<string>((resolve) => {
    let body = ''
    req.on('data', (chunk) => {body += chunk})
    req.on('end', () => resolve(body))
  })
}

describe('InfluxDBv2', () => {
  it('Should implement Reporter', () => {
    return new Promise<void>((resolve) => {
      const server = http.createServer((req, res) => {
        res.end('okay')
      })

      server.listen(6969, '127.0.0.1', () => {
        const reg = new Registry()
        const influx = new InfluxDBv2({
          addr: '127.0.0.1',
          token: "",
          org: "my-org",
          bucket: "my-bucket",
          flush_interval: 10000,
          registry: reg,
        })

        expect(influx).to.be.instanceOf(Reporter)
        server.closeAllConnections()
        server.close(() => resolve())
      })
    })
  })

  it('Should send authorization token', () => {
    return new Promise<void>((resolve) => {
      const server = http.createServer((req, res) => {
        // req.headers renames 'Authorization' to 'authorization'
        expect(req.headers).to.have.property('authorization')
        expect(req.headers.authorization).to.equal('Token my-auth-token')
        server.closeAllConnections()
        server.close(() => resolve())
      })

      server.listen(6969, '127.0.0.1', () => {
        const reg = new Registry()
        const influx = new InfluxDBv2({
          addr: "http://127.0.0.1:6969",
          token: "my-auth-token",
          org: "my-org",
          bucket: "my-bucket",
          flush_interval: 10000,
          registry: reg,
        })
        // Silence error logging.
        influx.onError(() => {})
        influx.once()
      })
    })
  })

  it('Should include bucket, org, and precision in URL', () => {
    return new Promise<void>((resolve) => {
      const server = http.createServer((req, res) => {
        expect(req.url)
          .to.equal('/api/v2/write?org=my-org&bucket=my-bucket&precision=ms')

        server.closeAllConnections()
        server.close(() => resolve())
      })

      server.listen(6969, '127.0.0.1', () => {
        const reg = new Registry()
        const influx = new InfluxDBv2({
          addr: "http://127.0.0.1:6969",
          token: "my-auth-token",
          org: "my-org",
          bucket: "my-bucket",
          flush_interval: 10000,
          registry: reg,
        })
        // Silence error logging.
        influx.onError(() => {})
        influx.once()
      })
    })
  })

  it('Should emit error when address is invalid', () => {
    return new Promise<void>((resolve) => {
      const reg = new Registry()
      const influx = new InfluxDBv2({
        addr: "bad-address",
        token: "my-auth-token",
        org: "my-org",
        bucket: "my-bucket",
        flush_interval: 10000,
        registry: reg,
      })

      influx.onError((err) => {
        expect(err).to.have.property('code')
        expect(err.code).to.equal('ECONNREFUSED')
        resolve()
      })

      influx.once()
    })
  })

  it('Should submit metrics once', () => {
    return new Promise<void>((resolve, reject) => {
      const server = http.createServer((req, res) =>
        body(req).then((data) => {
          res.end()
          if (data.length !== 35) {
            server.closeAllConnections()
            server.close(() => reject(new Error('body length is not 35')))
            return
          }
          if (data.substring(0, 10) !== 'my-counter') {
            server.closeAllConnections()
            server.close(() =>
              reject(new Error('metric name is not "my-counter"')))
            return
          }
          if (data.substring(19, 20) !== '0') {
            server.closeAllConnections()
            server.close(() =>
              reject(new Error('counter value is not 0')))
            return
          }

          server.closeAllConnections()
          server.close(() => resolve())
        }))

      server.listen(6969, '127.0.0.1', () => {
        const reg = new Registry()
        const influx = new InfluxDBv2({
          addr: "http://127.0.0.1:6969",
          token: "my-auth-token",
          org: "my-org",
          bucket: "my-bucket",
          flush_interval: 10000,
          registry: reg,
        })

        // Silence error logging.
        influx.onError(() => {})

        reg.getOrRegisterCounter('my-counter')
        influx.once()
      })
    })
  })

  it('Should submit metrics every flush_interval', () => {
    return new Promise<void>((resolve, reject) => {
      const reg = new Registry()
      const influx = new InfluxDBv2({
        addr: "http://127.0.0.1:6969",
        token: "my-auth-token",
        org: "my-org",
        bucket: "my-bucket",
        flush_interval: 500,
        registry: reg,
      })

      // Silence error logging.
      influx.onError(() => {})
      reg.getOrRegisterCounter('my-counter')

      const server = http.createServer((req, res) =>
        body(req).then((data) => {
          res.end()
          influx.stop()
          if (data.length !== 35) {
            server.closeAllConnections()
            server.close(() => reject(new Error('body length is not 35')))
            return
          }
          if (data.substring(0, 10) !== 'my-counter') {
            server.closeAllConnections()
            server.close(() =>
              reject(new Error('metric name is not "my-counter"')))
            return
          }
          if (data.substring(19, 20) !== '0') {
            server.closeAllConnections()
            server.close(() =>
              reject(new Error('counter value is not 0')))
            return
          }

          server.closeAllConnections()
          server.close(() => resolve())
        }))

      server.listen(6969, '127.0.0.1', () => {
        influx.start()
      })
    })
  })

  it('Should submit counter using plaintext protocol', () => {
    // TODO
  })

  it('Should submit healthcheck using line protocol', () => {
    // TODO
  })

  it('Should submit gauge using line protocol', () => {
    // TODO
  })

  it('Should submit histogram using line protocol', () => {
    // TODO
  })

  it('Should submit meter using line protocol', () => {
    // TODO
  })

  it('Should submit timer using line protocol', () => {
    // TODO
  })
})
