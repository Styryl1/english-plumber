import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ cacheDir: '/home/styryl/dev/bob/tina/__generated__/.cache/1771348067910', url: 'http://localhost:4001/graphql', token: 'undefined', queries,  });
export default client;
  