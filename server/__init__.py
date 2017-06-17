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

def card_input_to_row_dict(card):
    """Convert card dict from user-inputed JSON, to a dict of keys and values
    in database format."""
    # Sanitize unsafe user input that we will eval later
    errors = [int(error) for error in card.get('errors', [])]
    card['errors'] = unicode(errors)
    return card

def card_row_dict_to_output(row):
    """Convert a sqlite3.Row from the 'cards' table to a dict ready to
    jsonify to send to the user."""
    card = dict((k, row[k]) for k in row.keys())
    card['errors'] = eval(row['errors'])
    return card

def update_fields_sql(row):
    """Return 'a=b, c=d, e=f' for the keys and values in the given card's
    data dict.  Clean column names to protect against sqlinjection."""
    # TODO hard coded to han|pinyin|english|errors, maybe fine.
    # If we ever read column names from the card (aka unsafe user input),
    # be sure to convert colnames to ''.join(c for c in colname if c.isalnum())
    return ("han=?,pinyin=?,english=?,pack_name=?,errors=?",
            (row['han'], row['pinyin'], row['english'], row['pack_name'], row['errors']))


@app.route("/cards/", methods=["GET"])
def cards():
    conn, c = db()
    c.execute('SELECT * from cards')
    all_rows = c.fetchall()
    conn.close()
    return jsonify([card_row_dict_to_output(row) for row in all_rows])

@app.route("/cards/", methods=["POST"])
def insert_card():
    card = request.get_json(force=True)
    card['created_date'] = unicode(datetime.datetime.utcnow())
    rowdata = card_input_to_row_dict(card)
    conn, c = db()
    sql = "INSERT INTO cards (han,pinyin,english,pack_name,errors,created_date) VALUES (?,?,?,?,?,?)"
    vals = [rowdata[k] for k in ['han', 'pinyin', 'english', 'pack_name', 'errors', 'created_date']]
    c.execute(sql, vals)
    card = card_row_dict_to_output(rowdata)
    card['id'] = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify(card)

@app.route("/cards/<int:cardid>", methods=["PUT"])
def put_card(cardid):
    card = request.get_json(force=True)
    rowdata = card_input_to_row_dict(card)
    conn, c = db()
    update_sql, params = update_fields_sql(rowdata)
    sql = "UPDATE cards SET {} WHERE id=?".format(update_sql)
    c.execute(sql, params + (cardid,))
    conn.commit()
    conn.close()
    return ""

@app.route("/cards/<int:cardid>", methods=["DELETE"])
def del_card(cardid):
    sql = "DELETE FROM cards WHERE id=?"
    conn, c = db()
    c.execute("DELETE FROM cards WHERE id=?", (cardid,))
    conn.commit()
    conn.close()
    return ""
