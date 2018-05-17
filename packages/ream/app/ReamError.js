const captureStack =
  Error.captureStackTrace ||
  function(error) {
    const container = new Error()

    Object.defineProperty(error, 'stack', {
      configurable: true,
      get() {
        const stack = container.stack

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

function ReamError({ message, code }) {
  Object.defineProperty(this, 'name', {
    configurable: true,
    value: 'ReamError',
    writable: true
  })
  this.message = message
  this.code = code
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
