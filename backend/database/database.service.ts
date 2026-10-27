import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly connection: Database.Database

  constructor() {
    const file = resolve(process.cwd(), process.env.DATABASE_PATH || 'data/jeju-ai.sqlite')
    mkdirSync(dirname(file), { recursive: true })
    this.connection = new Database(file)
    this.connection.pragma('journal_mode = WAL')
    this.connection.pragma('foreign_keys = ON')
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TEXT NOT NULL,
        PRIMARY KEY (user_id, role_id)
      );
      CREATE TABLE IF NOT EXISTS contents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
        excerpt TEXT NOT NULL,
        body TEXT NOT NULL,
        topic TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'published', 'archived')),
        author TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_contents_status_updated_at
        ON contents(status, updated_at DESC);
      CREATE TABLE IF NOT EXISTS itineraries (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        travelers INTEGER NOT NULL DEFAULT 1,
        interests TEXT NOT NULL DEFAULT '[]',
        pace TEXT,
        transport TEXT,
        budget_amount REAL,
        budget_currency TEXT NOT NULL DEFAULT 'KRW',
        ai_content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COMPLETED', 'ARCHIVED')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_itineraries_owner_updated_at
        ON itineraries(owner_id, updated_at DESC);
      CREATE TABLE IF NOT EXISTS destinations (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        region TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        image_key TEXT NOT NULL,
        source_url TEXT NOT NULL,
        featured INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS geocoded_places (
        query TEXT PRIMARY KEY COLLATE NOCASE,
        name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        source TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-member', 'MEMBER', 'Member');
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-admin', 'ADMIN', 'Administrator');
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-editor', 'EDITOR', 'Editor');
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-moderator', 'MODERATOR', 'Moderator');
    `)
    const userColumns = this.connection.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>
    if (!userColumns.some((column) => column.name === 'username')) {
      this.connection.exec("ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''")
      this.connection.exec("UPDATE users SET username = lower(substr(email, 1, instr(email, '@') - 1)) WHERE username = ''")
    }
    if (!userColumns.some((column) => column.name === 'email_verified')) {
      this.connection.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0')
      this.connection.exec('UPDATE users SET email_verified = 1')
    }
    this.connection.exec(`
      UPDATE roles SET name = 'Member' WHERE code = 'MEMBER';
      UPDATE roles SET name = 'Administrator' WHERE code = 'ADMIN';
      UPDATE roles SET name = 'Editor' WHERE code = 'EDITOR';
      UPDATE roles SET name = 'Moderator' WHERE code = 'MODERATOR';
    `)
    this.connection.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username COLLATE NOCASE);
      CREATE TABLE IF NOT EXISTS email_verification_codes (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_sent_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_sent_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)
    const contentColumns = this.connection.prepare('PRAGMA table_info(contents)').all() as Array<{ name: string }>
    if (!contentColumns.some((column) => column.name === 'cover_image_url')) {
      this.connection.exec("ALTER TABLE contents ADD COLUMN cover_image_url TEXT NOT NULL DEFAULT ''")
    }
    const translationTable = this.connection.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='content_translations'").get()
    if (translationTable) {
      this.connection.exec(`
        UPDATE contents SET
          title = COALESCE((SELECT title FROM content_translations WHERE content_id = contents.id AND locale = 'en' AND translation_status = 'reviewed'), title),
          excerpt = COALESCE((SELECT excerpt FROM content_translations WHERE content_id = contents.id AND locale = 'en' AND translation_status = 'reviewed'), excerpt),
          body = COALESCE((SELECT body FROM content_translations WHERE content_id = contents.id AND locale = 'en' AND translation_status = 'reviewed'), body);
        DROP TABLE content_translations;
      `)
    }
    const destinationColumns = this.connection.prepare('PRAGMA table_info(destinations)').all() as Array<{ name: string }>
    if (destinationColumns.some((column) => column.name === 'name_en')) {
      this.connection.exec(`
        DROP INDEX IF EXISTS idx_destinations_featured;
        ALTER TABLE destinations RENAME TO destinations_multilingual;
        CREATE TABLE destinations (
          id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
          description TEXT NOT NULL, category TEXT NOT NULL, region TEXT NOT NULL, address TEXT NOT NULL,
          latitude REAL, longitude REAL, image_key TEXT NOT NULL, source_url TEXT NOT NULL,
          featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
        );
        INSERT INTO destinations (id, slug, name, description, category, region, address, latitude, longitude, image_key, source_url, featured, created_at, updated_at)
          SELECT id, slug, name_en, description_en, category, region, address, latitude, longitude, image_key, source_url, featured, created_at, updated_at FROM destinations_multilingual;
        DROP TABLE destinations_multilingual;
        CREATE INDEX idx_destinations_featured ON destinations(featured DESC, name ASC);
      `)
    }
    this.connection.exec('CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured DESC, name ASC)')
    this.seedDestinations()
  }

  private seedDestinations() {
    const now = new Date().toISOString()
    const destinations = [
      ['dest-seongsan', 'seongsan-ilchulbong', 'Seongsan Ilchulbong', 'A UNESCO World Heritage volcanic cone and one of Jeju’s signature sunrise viewpoints.', 'nature', 'Seongsan', '1 Seongsan-ri, Seongsan-eup, Seogwipo-si', 33.4581, 126.9425, 'seongsan', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500349&menuId=DOM_000001917002000000', 1],
      ['dest-hallasan', 'hallasan-national-park', 'Hallasan National Park', 'Korea’s highest mountain, with volcanic scenery, seasonal trails and diverse ecosystems.', 'nature', 'Jeju City', '2070-61 1100-ro, Jeju-si', 33.3617, 126.5292, 'hallasan', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500685&menuId=DOM_000001917001000000', 1],
      ['dest-seopjikoji', 'seopjikoji', 'Seopjikoji', 'An eastern coastal cape known for grasslands, volcanic cliffs and ocean walks.', 'nature', 'Seongsan', '262 Seopjikoji-ro, Seongsan-eup, Seogwipo-si', 33.4237, 126.9296, 'seopjikoji', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500343&menuId=DOM_000001707009000000', 1],
      ['dest-manjanggul', 'manjanggul-lava-tube', 'Manjanggul Lava Tube', 'A UNESCO-listed section of the Geomunoreum lava tube system with remarkable volcanic formations.', 'heritage', 'Gujwa', '182 Manjanggul-gil, Gujwa-eup, Jeju-si', 33.5284, 126.7716, 'manjanggul', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500182&menuId=DOM_000001718002000000', 1],
      ['dest-folk-village', 'jeju-folk-village', 'Jeju Folk Village', 'An open-air museum recreating traditional Jeju homes, trades and everyday life.', 'culture', 'Pyoseon', '631-34 Minsokhaean-ro, Pyoseon-myeon, Seogwipo-si', 33.3225, 126.8418, 'folk-village', 'https://m.visitjeju.net/en/detail/view?contentsid=CONT_000000000500553&menuId=DOM_000001817000000001', 0],
      ['dest-seongeup', 'seongeup-folk-village', 'Seongeup Folk Village', 'A historic village preserving stone houses, local lifeways and Jeju’s former administrative heritage.', 'culture', 'Pyoseon', 'Seongeup-ri, Pyoseon-myeon, Seogwipo-si', 33.3848, 126.8004, 'seongeup', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500351&menuId=DOM_000001817000000001', 0],
    ]
    const statement = this.connection.prepare(`INSERT OR IGNORE INTO destinations
      (id, slug, name, description, category, region, address, latitude, longitude, image_key, source_url, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const insertMany = this.connection.transaction((rows: unknown[][]) => {
      for (const row of rows) statement.run(...row, now, now)
    })
    insertMany(destinations)
  }

  onModuleDestroy() { this.connection.close() }
}
