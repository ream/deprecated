const captureStack =
  Error.captureStackTrace ||
  function(error) {
    const container = new Error()

    Object.defineProperty(error, 'stack', {
      configurable: true,
      get() {
        const { stack } = container

        Object.defineProperty(this, 'stack', {
          value: stack
        })

        return stack
      }
    })
  }

function inherits(ctor, superCtor) {
  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
}

function ReamError(data) {
  Object.defineProperty(this, 'name', {
    configurable: true,
    value: 'ReamError',
    writable: true
  })
  for (const key of Object.keys(data)) {
    this[key] = data[key]
  }
  inherits(this, Error)
  captureStack(this)
}

export default ReamError

// Following code only works without babel
// Not sure why :(
// export default class ReamError extends Error {
//   constructor({ message, code }) {
//     super(message)
//     this.name = 'ReamError'
//     this.code = code
//     if (Error.captureStackTrace) {
//       Error.captureStackTrace(this, this.constructor)
//     }
//   }
// }
