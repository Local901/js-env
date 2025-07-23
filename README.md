# js-env

Quick way to get typed environment variables.

```shell
npm install @local901/env
```

## How to use
```typescript
import { Env } from "@local901/env";

export const config = {
    debug: Env.boolean("DEBUG", false); // optional
    apiKey: Env.string("API_KEY"); // required
    apiUrl: Env.url("API_URL", "http://localhost:8080"); // Get a URL object
}
```
