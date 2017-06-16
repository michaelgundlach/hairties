import datetime
import os
import sqlite3

from flask import Flask, jsonify, request
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sqlite_file = os.path.join(BASE_DIR, "cards.sqlite")

def db():
    conn = sqlite3.connect(sqlite_file)
    return (conn, conn.cursor())

# Project against SQL injection: only alphanum chars allowed in
# sanitized user inputted column names.
def clean_colname(colname):
    return ''.join(char for char in colname if char.isalnum())

def update_fields_sql(card):
    """Return 'a=b, c=d, e=f' for the keys and values in the given |card|'s
    data dict.  Clean column names to protect against sqlinjection."""
    # TODO hard coded to han|pinyin|english|errors, maybe fine
    # if we ever expand this, use clean_colname on the colnames.
    return ("han=?,pinyin=?,english=?,errors=?,id=?", (card['data']['han'], card['data']['pinyin'], card['data']['english'], repr(card['errors']), card['id']))

@app.route("/cards/", methods=["GET"])
def cards():
    conn, c = db()
    c.execute('SELECT * from cards')
    all_rows = c.fetchall()
    conn.close()
    return repr(all_rows)

@app.route("/cards/", methods=["POST"])
def insert_card():
    card = request.get_json(force=True)
    conn, c = db()
    now = unicode(datetime.datetime.utcnow())
    sql = "INSERT INTO cards (han,pinyin,english,errors,created_date) VALUES (?,?,?,?,?)"
    data = card['data']
    vals = [card['data'][k] for k in ['han', 'pinyin', 'english']]
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
