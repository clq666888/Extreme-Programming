#app py
from flask import Flask
from flask_cors import CORS
from controller.contacts import contacts_bp
import database

app = Flask(__name__)
CORS(app)

app.register_blueprint(contacts_bp, url_prefix="/contacts")

if __name__ == "__main__":
    database.init_db()
    app.run(debug=True)
