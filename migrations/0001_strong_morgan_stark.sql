CREATE INDEX IF NOT EXISTS snippets_idx ON snippets (libsql_vector_idx(embedding));
