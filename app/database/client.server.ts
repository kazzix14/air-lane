import type { DB } from './types'

import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

export const client = ( database: D1Database ) => new Kysely<DB>({ dialect: new D1Dialect({ database }) })
