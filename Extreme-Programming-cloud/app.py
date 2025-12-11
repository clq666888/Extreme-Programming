from flask import Flask, send_from_directory
from flask_cors import CORS
import database
from controller.contacts import contacts_bp

app = Flask(__name__)
CORS(app)

# 注册联系人蓝图
app.register_blueprint(contacts_bp, url_prefix="/contacts")

# 首页
@app.route('/')
def index():
    return send_from_directory('templates', 'contacts.html')

# 静态资源
@app.route('/static/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    database.init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
