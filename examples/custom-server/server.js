const app = require('express')()
const unvue = require('unvue')

unvue(app, {
  // do not build before starting production server
  // instead run `npm run build` before `npm start` yourself
  // because if you're deploying it to service like `now.sh`
  // you're only allowed to write files outside `npm run build` script
  build: false,
  postCompile() {
    console.log(`> Open http://localhost:3000`)
  }
})

app.listen(3000)
