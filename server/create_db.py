import sqlite3

sqlite_file = 'cards.sqlite'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

c.execute('PRAGMA encoding="utf-8"')
c.execute('CREATE TABLE cards (han TEXT not null, pinyin TEXT not null, english TEXT not null, pack_name TEXT not null, errors TEXT not null, id INTEGER PRIMARY KEY, created_date TEXT not null)')

conn.commit()
conn.close()
