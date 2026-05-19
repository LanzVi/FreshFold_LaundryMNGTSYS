from flask import Flask, send_from_directory
from db import init_db

app = Flask(__name__)
init_db()

@app.route('/style.css')
def serve_styles():
    """Serves the isolated style sheet asset directly to the layout canvas"""
    return send_from_directory('.', 'style.css')

@app.route('/app.js')
def serve_scripts():
    """Serves the central frontend core router script module directly"""
    return send_from_directory('.', 'app.js')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all_spa_router(path):
    """
    Ensures that any direct browser URL location tracking inputs, deep refreshes, 
    or path updates automatically hit index.html, allowing the client-side javascript 
    router engine to resolve view layouts correctly.
    """
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)