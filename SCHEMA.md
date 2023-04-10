### developers

```sql
CREATE TABLE developers (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(500) NOT NULL
)
```

### apiKeys

```sql
CREATE TABLE apiKeys (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
	key VARCHAR(100) NOT NULL UNIQUE
)
```

### apiKeys

```sql
CREATE TABLE devClients (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE SET NULL,
	apiKey_id INTEGER NOT NULL REFERENCES apiKeys(id) ON DELETE SET NULL,
	username VARCHAR(100) UNIQUE,
	email VARCHAR(100) UNIQUE,
	password VARCHAR(500) NOT NULL,
	CHECK(COALESCE(developer_id::BOOLEAN::INTEGER, 0) + COALESCE(apiKey_id::BOOLEAN::INTEGER, 0) = 1)
)
```