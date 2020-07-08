# whatsep

## Usage

#### Local Computer
You need to set environment for PORT and WEBHOOK(for chatbot)

```bash
npm install
node app.js
```

#### Docker
```bash
docker build --tag whatsep .
docker run -p <PORT>:<CONTAINER PORT> -e PORT=<CONTAINER PORT> -d --name absen whatsep
```

## Disclaimer
This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.
