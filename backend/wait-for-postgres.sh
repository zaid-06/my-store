

#!/bin/sh

echo "⏳ Waiting for Postgres..."

until nc -z postgres 5432; do
  sleep 1
done

echo "✅ Postgres is ready!"
exec "$@"