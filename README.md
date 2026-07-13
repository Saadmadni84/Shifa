## Database Setup

1. Install PostgreSQL
2. Create DB:
   createdb shifa_db

3. Start the backend so Flyway applies the migrations automatically.

If you previously loaded the dump, drop and recreate `shifa_db` before starting the app so Flyway can build the schema from scratch.
