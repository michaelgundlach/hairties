import sqlite3

sqlite_file = 'cards.sqlite'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

c.execute('PRAGMA encoding="utf-8"')
c.execute('CREATE TABLE cards (han TEXT, pinyin TEXT, english TEXT, pack_name TEXT, errors TEXT, id INTEGER PRIMARY KEY, created_date TEXT)')

conn.commit()
conn.close()
