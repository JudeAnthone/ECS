# Database Reset
   ```
   psql -U postgres -d ecs_db -f "db-script/database.sql"
   psql -U postgres -d ecs_db -f "db-script/seed_admin.sql"
   ```

