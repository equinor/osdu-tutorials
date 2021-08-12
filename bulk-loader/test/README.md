## Before you start
1. Get client ID and client Secret from your platform admin.
2. Authorize once and get a Refresh Token
3. Determine an environment you are to test, copy and rename corresponding `(template)-file` by removing a `(template)` prefix and fill out values for listed keys:

```
{
    "key": "client_id",
    "value": "<your-client-id>",
}
{
    "key": "client_secret",
    "value": "<your-client-secret>",
}
{
    "key": "refresh_token",
    "value": "<your-refresh-token>",
}
{
    "key": "schema_version",
    "value": "<schema-version-to-test>",
}
```
4. install `newman` package

```
npm i -g newman
```

## Run tests
run `newman` against postman collection, accompanied by a desired environment with a command:
```
newman run "<postman_collection.json>" -e "<postman_environment.json>"
```

example for GCP:
```
newman run "R2 Integration Tests [TNO].postman_collection.json" -e "R2 QA [GCP-SLB].postman_environment.json"
```