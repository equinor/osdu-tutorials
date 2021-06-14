## Before you start
1. Run a Backend on an accessible host
2. Authorize, using its `/login` url and gather cookie `osdu_quickstart_session_id` set to this host
3. Create an enviromnment file: copy and rename `(template)-file` by removing a `(template)` prefix and fill out values for listed keys:

```
{
    "key": "backend_host",
    "value": "<your-backend_host>",
}
{
    "key": "osdu_quickstart_session_id",
    "value": "<your-osdu_quickstart_session_id>",
}

```

4. install `newman` package

```
npm i -g newman
```

## Run tests
run `newman` against postman collection, accompanied by a desired environment with a command:
```
newman run backend.postman_collection.json -e backend.postman_environment.json
```
