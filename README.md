# chat-service

A microservice for chat messaging.

## Resources
* [Diagram Class](https://drive.google.com/file/d/1x2E08UuK3i-zrPaa0mz-p8hxthyV-HCZ/view?usp=sharing)

* Inspired by [m3o chat api](https://m3o.com/chat/api)

## Env. variables

- *DATABASE_URL* : Database connection string. More information [here](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores#the-connection-url)
- *DATABASE_TYPE* : disk, mysql, postgres, mongo (default to disk)

## Usage

### Run docker image

```shell
docker run -it -p 80:1337 -e "DATABASE_TYPE=mongo" -e "DATABASE_URL=mongodb://localhost:27017/chat_service_db" --name chat-service darkpearl/chat-service
```

### Run using docker compose
See backend usage example in [docker-compose.test.yml](./docker-compose.test.yml) file.


## Get started for development

Install dependencies
```shell
npm install
```

Define environment variables
```shell
cp .env.example .env
```

Run in development mode
```shell
./scripts/start-dev.sh
```

Properly stop development mode after a Ctrl + C
```shell
./scripts/stop-dev.sh
```

API will be running at [http://localhost:1337](http://localhost:1337)
