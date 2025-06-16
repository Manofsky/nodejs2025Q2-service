# Home Library Service

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- Docker - [Download & Install Docker](https://docs.docker.com/engine/install/).

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

> **Note:** When running locally with `npm start`, the application will use the database connection from your `.env` file. Make sure it points to `localhost:5432` for local development. If you're running both the app and database in Docker, the connection should be `postgres:5432` instead.

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
npm run test
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging

## Docker

### Running application using Docker

```bash
docker-compose up -d
```

This will start both the application and PostgreSQL database in containers.

> **Note:** The application uses Prisma ORM to connect to the PostgreSQL database. The Docker setup automatically generates the Prisma client during the image build process and configures the proper database connection URL (`postgres:5432` instead of `localhost:5432`).

### Stopping containers

```bash
docker-compose down
```

### Viewing logs

```bash
docker-compose logs -f
```

### Docker Images

The Docker images are available on Docker Hub:
- Application: [clegrof/home-library-service](https://hub.docker.com/r/clegrof/home-library-service)
- PostgreSQL: [clegrof/home-library-postgres](https://hub.docker.com/r/clegrof/home-library-postgres)
