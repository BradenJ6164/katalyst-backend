create table if not exists users
(
    id       integer primary key autoincrement,
    email    text not null unique,
    password text not null,
    name     text not null,
    role     TEXT CHECK (role IN ('Guest', 'Admin', 'Owner')),
    avatar   TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_id ON users (id);

create table if not exists users_sessions
(
    session_id integer primary key autoincrement,
    user_id    integer not null
        constraint users_sessions_users_id_fk
            references users
            on update cascade on delete cascade,
    token      text    not null,
    expires_at integer not null
);

create table if not exists mdx_guides
(
    guide_id   integer primary key autoincrement,
    name       VARCHAR(255) not null,
    content    LONGTEXT     NOT NULL,
    last_save  INTEGER DEFAULT (strftime('%s', 'now')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_guides_guide_id ON mdx_guides (guide_id);

CREATE TABLE if not exists property_config
(
    id          INTEGER          NOT NULL DEFAULT 1 CHECK (ID = 1) PRIMARY KEY,
    property_id UNIQUEIDENTIFIER NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    data        LONGTEXT         NOT NULL
);

