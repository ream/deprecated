# Custom server with `http`

## How to use

```bash
git clone https://github.com/ream/ream.git
```

Install dependencies:

```bash
cd examples/custom-server-http
yarn
```

Run it:

```bash
# Start development server
yarn dev

# Start production server
yarn build && yarn start
```

## The idea behind this example

Replace `ream dev` and `ream start` with your own custom server, e.g. `http.createServer`.
