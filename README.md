# Kaven Public API

Lightweight Node.js API for resolving client external IP over HTTP and Kaven protocol.

Docker image: [kavenzero/kaven-public-api](https://hub.docker.com/r/kavenzero/kaven-public-api)

## Features

- Returns detected client IP as plain text over HTTP.
- Supports forwarded headers commonly set by reverse proxies:
  - `X-Real-IP`
  - `X-Forwarded-For` (first value)
- Supports a custom binary protocol used by Kaven clients.
- Logs request and socket transfer info for observability.

## Requirements

- Node.js LTS (Node 20+ recommended)
- npm or pnpm

## Quick Start (Local)

1. Install dependencies.

```sh
pnpm install
```

1. Create config file.

```sh
copy config.example.json config.json
```

1. Start server.

```sh
pnpm start
```

By default, it listens on `0.0.0.0:80`.

## Quick Start (Docker)

```sh
docker run --name kaven-public-api \
    -p 80:80 \
    -d kavenzero/kaven-public-api:latest
```

## Configuration

Configuration is loaded from `config.json` in the project root.

Example (`config.example.json`):

```json
{
    "host": "0.0.0.0",
    "port": 80
}
```

Fields:

- `host`: bind address
- `port`: bind port

## HTTP API

Send any HTTP request to the server, for example:

```sh
curl http://127.0.0.1/
```

Response:

```txt
203.0.113.10
```

The server resolves IP using this priority:

1. Public IP from `remoteAddress` / forwarding headers
2. Private IP fallback
3. First non-empty candidate

## Kaven Protocol Notes

The server can switch from HTTP parsing to a custom packet mode when a signature handshake is detected.

Packet types currently handled:

- `Initialize (91)` -> `InitializeOK (92)`
- `RequestExternalIP (101)` -> `RequestExternalIPOK (102)`
- Unknown type -> `Error (-1)`

## Scripts

- `pnpm start`: run `server.js`

## License

MIT
