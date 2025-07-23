#!/usr/bin/env node

import { cli } from '@libcontext/cli';
import { migrate } from '@libcontext/db/migrations';

await migrate();

await cli.parseAsync();
