# whatsep

# Usage

## Local Computer
You need to set environment for PORT and WEBHOOK(for chatbot)

```bash
npm install
node app.js
```

## Docker
```bash
docker build --tag whatsep .
docker run -p <PORT>:<CONTAINER PORT> -e PORT=<CONTAINER PORT> -d --name absen whatsep
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
