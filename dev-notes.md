# dev notes added by `umer naeem` in the process of trying to figure out this repo

## Issues

1. pnpm lock was in root messed up so it needed to be uninstalled
2. src/utils/validation-error.utils
3. See [apps/backend/src/infra/config](apps/backend/src/infra/config) directory for config files, and set variables appropriately in `.env`
4. when we try to access /docs path on backend dev server, it asks for username, password as basic auth is implemented so, the username for that would be `docs` and password would be the same what you have as your env variable `DOCS_AUTH_PASS`, found this in [file](apps/backend/src/web/utils/openapidocs.handler.ts)
5. file for registering stuff in Dependency Injection [apps/backend/src/infra/di/index.ts](apps/backend/src/infra/di/index.ts)
6. for db setup, first you actually need to install some pg driver, i installed `pg` library in backend, then ran `bun db:migrate` to run the migrations, then i was able to interact with db and better auth
7. for auth, using scalar, one of the common issue is that the better auth instance is actually hosted under `/auth` path as seen [here](apps/backend/src/infra/auth/create-instance.ts), however scalar docs do not reflects this and tries requests on `/` causing 404 errors.
8. limit and page filters have validation because effect schema does not coerce the string inputs to numbers, so added `Coerced Number Feature`. also need to dervice typed using `Schema.Type` instead of `Schema.Encoded` so `limit` and `page` property is infered as `number` instead of `string`.

## Todos

- [] Redo Seed Script apps/backend/src/scripts/seed.ts

## Contribution Points

all the contribution points will be marked with token `$CONTRIB` and Find in All Files method for this token should be able to find all points where potential contributions lives inside the code.

1. Refer to Issue#7, We explicitly specify that base path for better auth routes is `/auth` [OpenAPI Docs File](apps/backend/src/web/utils/openapidocs.handler.ts)
2. bearer auth plugin added to enable token based authentication
3. refer to Issue#8
