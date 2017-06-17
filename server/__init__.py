import datetime
import os
import sqlite3

from flask import Flask, jsonify, request
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sqlite_file = os.path.join(BASE_DIR, "cards.sqlite")

def db():
    conn = sqlite3.connect(sqlite_file)
    conn.row_factory = sqlite3.Row
    return (conn, conn.cursor())

def update_fields_sql(card):
    """Return 'a=b, c=d, e=f' for the keys and values in the given |card|'s
    data dict.  Clean column names to protect against sqlinjection."""
    # TODO hard coded to han|pinyin|english|errors, maybe fine.
    # If we ever read column names from the card (aka unsafe user input),
    # be sure to convert colnames to ''.join(c for c in colname if c.isalnum())
    return ("han=?,pinyin=?,english=?,pack_name=?,errors=?", (card['han'], card['pinyin'], card['english'], card['pack_name'], repr(card['errors'])))


@app.route("/cards/", methods=["GET"])
def cards():
    conn, c = db()
    c.execute('SELECT * from cards')
    all_rows = c.fetchall()
    conn.close()
    return jsonify([dict(zip(row.keys(), row)) for row in all_rows])

@app.route("/cards/", methods=["POST"])
def insert_card():
    card = request.get_json(force=True)
    conn, c = db()
    now = unicode(datetime.datetime.utcnow())
    sql = "INSERT INTO cards (han,pinyin,english,pack_name,errors,created_date) VALUES (?,?,?,?,?,?)"
    vals = [card[k] for k in ['han', 'pinyin', 'english', 'pack_name']]
    vals.append(unicode(repr(card['errors'])))
    vals.append(now)
    c.execute(sql, vals)
    card['id'] = c.lastrowid
    card['created_date'] = now
    conn.commit()
    conn.close()
    return jsonify(card)

@app.route("/cards/<int:cardid>", methods=["PUT"])
def put_card(cardid):
    card = request.get_json(force=True)
    conn, c = db()
    update_sql, params = update_fields_sql(card)
    sql = "UPDATE cards SET {} WHERE id=?".format(update_sql)
    c.execute(sql, params + (cardid,))
    conn.commit()
    conn.close()
    return ""
