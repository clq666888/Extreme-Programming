from flask import Blueprint, request, jsonify
from database import get_connection
import sqlite3

contacts_bp = Blueprint('contacts', __name__)

@contacts_bp.route('', methods=['GET'])
def get_contacts():
    search = request.args.get('search', '').strip()
    favorite = request.args.get('favorite', '').lower() == 'true'
    conn = get_connection()
    c = conn.cursor()
    try:
        query = "SELECT id, name, phone, is_favorite FROM contacts WHERE 1=1"
        params = []
        if favorite:
            query += " AND is_favorite = ?"
            params.append(True)
        if search:
            query += " AND (name LIKE ? OR phone LIKE ?)"
            params.extend([f'%{search}%', f'%{search}%'])
        c.execute(query, params)
        rows = c.fetchall()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@contacts_bp.route('', methods=['POST'])
def add_contact():
    data = request.json
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO contacts (name, phone) VALUES (?, ?)", (name, phone))
        conn.commit()
        return jsonify({"message": "联系人已添加"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Phone number already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("DELETE FROM contacts WHERE id=?", (contact_id,))
        conn.commit()
        return jsonify({"message": "联系人已删除"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@contacts_bp.route('/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    data = request.json
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("UPDATE contacts SET name=?, phone=? WHERE id=?", (name, phone, contact_id))
        conn.commit()
        return jsonify({"message": "联系人已修改"}), 200
    except sqlite3.IntegrityError:
        return jsonify({"error": "Phone number already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@contacts_bp.route('/<int:contact_id>/favorite', methods=['PUT'])
def toggle_favorite(contact_id):
    data = request.json
    is_favorite = data.get("is_favorite", False)
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("UPDATE contacts SET is_favorite=? WHERE id=?", (is_favorite, contact_id))
        conn.commit()
        return jsonify({"message": "收藏状态已更新"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()