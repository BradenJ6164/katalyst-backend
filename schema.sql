create table if not exists users
(
    id       integer primary key autoincrement,
    email    text not null unique,
    password text not null,
    name     text not null
);
create table if not exists users_sessions
(
    session_id integer primary key autoincrement,
    user_id    integer not null
        constraint users_sessions_users_id_fk
            references users
            on update cascade on delete cascade,
    token      text not null,
    expires_at integer    not null
);

create table if not exists mdx_guides
(
    guide_id integer primary key autoincrement,
    name VARCHAR(255) not null,
    content LONGTEXT NOT NULL,
    last_save INTEGER DEFAULT (strftime('%s', 'now')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);