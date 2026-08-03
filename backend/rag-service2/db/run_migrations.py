"""
db/run_migrations.py

Executes SQL migration files against PostgreSQL.
Safe to run multiple times (all migrations use IF NOT EXISTS).

Usage:
    python db/run_migrations.py
"""

import os
import sys
import glob

# Add parent directory to path for config imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


def run_migrations():
    """Execute all SQL migration files in order."""
    migrations_dir = os.path.dirname(os.path.abspath(__file__))
    migration_files = sorted(glob.glob(os.path.join(migrations_dir, "migration_*.sql")))

    if not migration_files:
        print("[INFO] No migration files found.")
        return

    print(f"[INFO] Found {len(migration_files)} migration file(s).")

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )
        conn.autocommit = False
        cursor = conn.cursor()

        for migration_file in migration_files:
            filename = os.path.basename(migration_file)
            print(f"[RUNNING] {filename}...")

            with open(migration_file, "r", encoding="utf-8") as f:
                sql = f.read()

            try:
                cursor.execute(sql)
                conn.commit()
                print(f"[SUCCESS] {filename} applied successfully.")
            except Exception as e:
                conn.rollback()
                print(f"[ERROR] {filename} failed: {e}")
                raise

        cursor.close()
        conn.close()
        print("\n[DONE] All migrations completed successfully.")

    except psycopg2.OperationalError as e:
        print(f"[ERROR] Cannot connect to PostgreSQL: {e}")
        print("[INFO] Make sure PostgreSQL is running and connection settings in .env are correct.")
        sys.exit(1)


if __name__ == "__main__":
    run_migrations()
