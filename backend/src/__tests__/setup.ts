import { config } from 'dotenv';
import path from 'path';

// Load .env file
config({ path: path.resolve(process.cwd(), '.env') });

// Set default envs if missing (fallback for tests)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://user:pass@localhost:3306/db';
process.env.NODE_ENV = 'test';
