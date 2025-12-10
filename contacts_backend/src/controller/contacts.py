from flask import Blueprint, request, jsonify
from database import get_connection

contacts_bp = Blueprint('contacts', __name__)

@contacts_bp.route('', methods=['GET'])
def get_contacts():
    search = request.args.get('search', '').strip()
    favorite = request.args.get('favorite', '').lower() == 'true'
    conn = get_connection()
    c = conn.cursor()
    try:
        sql = "SELECT id, name, is_favorite FROM contacts WHERE 1=1"
        params = []
        if favorite:
            sql += " AND is_favorite = 1"
        if search:
            sql += " AND (name LIKE ? OR id IN (SELECT contact_id FROM contact_details WHERE value LIKE ?))"
            params = [f'%{search}%', f'%{search}%']
        c.execute(sql, params)
        rows = c.fetchall()
        result = []
        for row in rows:
            contact = dict(row)
            c.execute("SELECT type, value FROM contact_details WHERE contact_id = ? ORDER BY id", (contact['id'],))
            contact['details'] = [dict(r) for r in c.fetchall()]
            result.append(contact)
        return jsonify(result)
    finally:
        conn.close()

@contacts_bp.route('', methods=['POST'])
def add():
    data = request.json
    name = data.get('name','').strip()
    details = data.get('details', [])
    if not name or not details:
        return jsonify({"error": "必填"}), 400
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT INTO contacts (name) VALUES (?)", (name,))
    cid = c.lastrowid
    for d in details:
        if d.get('type') and d.get('value'):
            c.execute("INSERT INTO contact_details (contact_id,type,value) VALUES (?,?,?)",
                     (cid, d['type'], d['value']))
    conn.commit()
    conn.close()
    return jsonify({"msg": "ok"}), 201

@contacts_bp.route('/<int:cid>', methods=['PUT'])
def edit(cid):
    data = request.json
    name = data.get('name','').strip()
    details = data.get('details', [])
    if not name or not details:
        return jsonify({"error": "必填"}), 400
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE contacts SET name=? WHERE id=?", (name, cid))
    c.execute("DELETE FROM contact_details WHERE contact_id=?", (cid,))
    for d in details:
        if d.get('type') and d.get('value'):
            c.execute("INSERT INTO contact_details (contact_id,type,value) VALUES (?,?,?)",
                     (cid, d['type'], d['value']))
    conn.commit()
    conn.close()
    return jsonify({"msg": "ok"})

@contacts_bp.route('/<int:cid>', methods=['DELETE'])
def delete(cid):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM contacts WHERE id=?", (cid,))
    conn.commit()
    conn.close()
    return jsonify({"msg": "ok"})

@contacts_bp.route('/<int:cid>/favorite', methods=['PUT'])
def fav(cid):
    fav = request.json.get('is_favorite', False)
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE contacts SET is_favorite=? WHERE id=?", (1 if fav else 0, cid))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})