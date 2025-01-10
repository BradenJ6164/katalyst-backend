create table if not exists users
(
    id                  TEXT not null unique primary key,
    joined_properties   TEXT,
    email               text not null unique,
    password            text not null,
    name                text not null,
    role                TEXT CHECK (role IN ('Guest', 'Admin', 'Owner')),
    avatar              TEXT,
    subscribed_property TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_id ON users (id);

create table if not exists users_sessions
(
    session_id integer primary key autoincrement,
    user_id    TEXT    not null
        constraint users_sessions_users_id_fk
            references users
            on update cascade on delete cascade,
    token      text    not null,
    expires_at integer not null
);

create table if not exists mdx_guides
(
    guide_id    TEXT         not null unique primary key,
    property_id TEXT         NOT NULL,
    name        VARCHAR(255) not null,
    content     LONGTEXT     NOT NULL,
    last_save   INTEGER DEFAULT (strftime('%s', 'now')),
    created_at  INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_mdx_guides_guide_id ON mdx_guides (guide_id);

CREATE TABLE IF NOT EXISTS property_settings
(
    property_id TEXT not null unique primary key,
    name        TEXT NOT NULL, -- Name of the property
    address     TEXT NOT NULL, -- Physical address of the property
    description TEXT,          -- Optional description of the property
    owner       TEXT not null,

    last_save   INTEGER DEFAULT (strftime('%s', 'now')),
    created_at  INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS property_permissions
(
    id               integer primary key autoincrement,
    property_id      TEXT    not null,
    user_id          TEXT    not null,
    permission_level INTEGER not null default 0
);
CREATE INDEX IF NOT EXISTS idx_property_permissions_property_id ON property_permissions (property_id);
CREATE INDEX IF NOT EXISTS idx_property_permissions_user_id ON property_permissions (user_id);

CREATE TABLE IF NOT EXISTS property_integration
(
    property_id      TEXT not null primary key,
    integration_type TEXT not null,
    integration_data TEXT not null
);
CREATE INDEX IF NOT EXISTS idx_property_integration_property_id ON property_integration (property_id);

CREATE TABLE IF NOT EXISTS reservations
(
    id             integer primary key autoincrement,
    reservation_id TEXT not null,
    property_id    TEXT NOT NULL,
    property       TEXT,
    phone          TEXT,
    email          TEXT,
    profile        TEXT,
    adults         INTEGER,
    children       INTEGER,
    check_in       INTEGER,
    check_out      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_id ON reservations (reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservations_property_id ON reservations (property_id);

