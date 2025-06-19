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

### Running Tests

#### Running Regular Tests (without authentication)

```
npm run test -- <path to suite>
```

#### Running Tests with Authentication

```
npm run test:auth
```

> **Note:** The `npm run test:auth` command runs all tests with the `TEST_MODE=auth` environment variable. Tests in the `test/auth/` directory should pass successfully, while other tests will fail with the "Authorization is not implemented" error - this is expected behavior as they try to access protected resources without a token.

#### Running Token Refresh Tests

```
npm run test:refresh
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

### Building and running application using Docker

```bash
# Build the Docker images
docker-compose build

# Start the containers
docker-compose up -d
```

This will build the application image, then start both the application and PostgreSQL database in containers.

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

## Logging & Error Handling

The application includes a custom logging system with the following features:

- Different logging levels (ERROR, WARN, INFO, DEBUG, VERBOSE)
- Log file rotation based on file size
- Separate error log file
- Request and response logging
- Global exception handling

### Configuration

Logging can be configured using environment variables in your `.env` file:

```
# Logging level: ERROR, WARN, INFO, DEBUG, VERBOSE (default: INFO)
LOG_LEVEL=INFO

# Maximum log file size in bytes before rotation (default: 10MB)
MAX_LOG_FILE_SIZE=10485760
```

### Log Files

Log files are stored in the `logs` directory:

- `app.log` - Contains all logs
- `error.log` - Contains only error logs

When running in Docker, logs are also available via `docker-compose logs -f`.
