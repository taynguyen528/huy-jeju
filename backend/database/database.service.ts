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
      CREATE TABLE IF NOT EXISTS content_translations (
        content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
        locale TEXT NOT NULL CHECK (locale IN ('vi', 'en', 'ko')),
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        body TEXT NOT NULL,
        translation_status TEXT NOT NULL DEFAULT 'draft' CHECK (translation_status IN ('draft', 'reviewed')),
        updated_at TEXT NOT NULL,
        PRIMARY KEY (content_id, locale)
      );
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
        name_vi TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_ko TEXT NOT NULL,
        description_vi TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_ko TEXT NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_destinations_featured
        ON destinations(featured DESC, name_vi ASC);
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-member', 'MEMBER', 'Thành viên');
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-admin', 'ADMIN', 'Quản trị viên');
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-editor', 'EDITOR', 'Biên tập viên');
      INSERT OR IGNORE INTO roles (id, code, name) VALUES ('role-moderator', 'MODERATOR', 'Kiểm duyệt viên');
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
    this.connection.prepare(`
      INSERT OR IGNORE INTO content_translations (content_id, locale, title, excerpt, body, translation_status, updated_at)
      SELECT id, 'vi', title, excerpt, body, 'reviewed', updated_at FROM contents
    `).run()
    this.seedDestinations()
  }

  private seedDestinations() {
    const now = new Date().toISOString()
    const destinations = [
      ['dest-seongsan', 'seongsan-ilchulbong', 'Đỉnh Seongsan Ilchulbong', 'Seongsan Ilchulbong', '성산일출봉', 'Miệng núi lửa ven biển, Di sản Thế giới UNESCO và điểm ngắm bình minh tiêu biểu của Jeju.', 'A UNESCO World Heritage volcanic cone and one of Jeju’s signature sunrise viewpoints.', '유네스코 세계유산으로 지정된 화산체이자 제주를 대표하는 일출 명소입니다.', 'nature', 'Seongsan', '1 Seongsan-ri, Seongsan-eup, Seogwipo-si', 33.4581, 126.9425, 'seongsan', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500349&menuId=DOM_000001917002000000', 1],
      ['dest-hallasan', 'hallasan-national-park', 'Vườn quốc gia Hallasan', 'Hallasan National Park', '한라산국립공원', 'Ngọn núi cao nhất Hàn Quốc với nhiều tuyến trekking, cảnh quan núi lửa và hệ sinh thái thay đổi theo độ cao.', 'Korea’s highest mountain, with volcanic scenery, seasonal trails and diverse ecosystems.', '대한민국 최고봉으로 화산 지형과 계절별 탐방로, 다양한 생태계를 만날 수 있습니다.', 'nature', 'Jeju City', '2070-61 1100-ro, Jeju-si', 33.3617, 126.5292, 'hallasan', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500685&menuId=DOM_000001917001000000', 1],
      ['dest-seopjikoji', 'seopjikoji', 'Mũi Seopjikoji', 'Seopjikoji', '섭지코지', 'Bờ biển phía đông với đồng cỏ, vách đá núi lửa và đường đi bộ nhìn ra biển.', 'An eastern coastal cape known for grasslands, volcanic cliffs and ocean walks.', '동쪽 해안의 초원과 화산 절벽, 바다 산책로로 유명한 명소입니다.', 'nature', 'Seongsan', '262 Seopjikoji-ro, Seongsan-eup, Seogwipo-si', 33.4237, 126.9296, 'seopjikoji', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500343&menuId=DOM_000001707009000000', 1],
      ['dest-manjanggul', 'manjanggul-lava-tube', 'Hang dung nham Manjanggul', 'Manjanggul Lava Tube', '만장굴', 'Một phần của hệ thống ống dung nham Geomunoreum được UNESCO công nhận, thể hiện cấu trúc địa chất núi lửa độc đáo.', 'A UNESCO-listed section of the Geomunoreum lava tube system with remarkable volcanic formations.', '거문오름 용암동굴계의 일부로 독특한 화산 지질 구조를 보여주는 유네스코 유산입니다.', 'heritage', 'Gujwa', '182 Manjanggul-gil, Gujwa-eup, Jeju-si', 33.5284, 126.7716, 'manjanggul', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500182&menuId=DOM_000001718002000000', 1],
      ['dest-folk-village', 'jeju-folk-village', 'Làng dân gian Jeju', 'Jeju Folk Village', '제주민속촌', 'Bảo tàng ngoài trời tái hiện nhà ở, nghề nghiệp và sinh hoạt truyền thống của người Jeju.', 'An open-air museum recreating traditional Jeju homes, trades and everyday life.', '제주의 전통 가옥과 생업, 생활문화를 재현한 야외 박물관입니다.', 'culture', 'Pyoseon', '631-34 Minsokhaean-ro, Pyoseon-myeon, Seogwipo-si', 33.3225, 126.8418, 'folk-village', 'https://m.visitjeju.net/en/detail/view?contentsid=CONT_000000000500553&menuId=DOM_000001817000000001', 0],
      ['dest-seongeup', 'seongeup-folk-village', 'Làng cổ Seongeup', 'Seongeup Folk Village', '성읍민속마을', 'Ngôi làng lịch sử lưu giữ kiến trúc nhà đá, văn hóa sinh hoạt và dấu tích hành chính xưa của Jeju.', 'A historic village preserving stone houses, local lifeways and Jeju’s former administrative heritage.', '제주의 돌집과 생활문화, 옛 행정 중심지의 흔적을 보존한 역사 마을입니다.', 'culture', 'Pyoseon', 'Seongeup-ri, Pyoseon-myeon, Seogwipo-si', 33.3848, 126.8004, 'seongeup', 'https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500351&menuId=DOM_000001817000000001', 0],
    ]
    const statement = this.connection.prepare(`INSERT OR IGNORE INTO destinations
      (id, slug, name_vi, name_en, name_ko, description_vi, description_en, description_ko, category, region, address, latitude, longitude, image_key, source_url, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const insertMany = this.connection.transaction((rows: unknown[][]) => {
      for (const row of rows) statement.run(...row, now, now)
    })
    insertMany(destinations)
  }

  onModuleDestroy() { this.connection.close() }
}
