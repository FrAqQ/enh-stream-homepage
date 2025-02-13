
from flask import Blueprint, request, jsonify
import requests
import psutil
from flask_cors import CORS

# Blueprint für API-Routen erstellen
api_blueprint = Blueprint('api', __name__)
CORS(api_blueprint, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

@api_blueprint.route('/status', methods=['GET'])
def get_status():
    """
    Liefert CPU- und RAM-Auslastung des Servers.
    """
    try:
        # CPU-Auslastung (Durchschnitt über alle Kerne)
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # RAM-Informationen
        memory = psutil.virtual_memory()
        
        return jsonify({
            'cpu': cpu_percent,
            'memory': {
                'total': memory.total / (1024 * 1024),  # Konvertierung zu MB
                'used': memory.used / (1024 * 1024),
                'free': memory.available / (1024 * 1024)
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_blueprint.route('/add_viewer', methods=['POST', 'OPTIONS'])
def add_viewer():
    """
    Leitet die Anfrage an main_gui.py weiter, um einen Viewer hinzuzufügen.
    """
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response

    data = request.json
    user_id = data.get('user_id')
    twitch_url = data.get('twitch_url')
    viewer_count = data.get('viewer_count', 1)

    if not user_id or not twitch_url or viewer_count < 1:
        return jsonify({'status': 'error', 'message': 'Ungültige Eingabe.'}), 400

    try:
        response = requests.post(
            "http://127.0.0.1:5001/add_viewer",
            json={
                "user_id": user_id,
                "twitch_url": twitch_url,
                "viewer_count": viewer_count
            },
        )
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_blueprint.route('/set_url', methods=['POST', 'OPTIONS'])
def set_url():
    """
    Leitet die Anfrage an main_gui.py weiter, um die Twitch-URL zu setzen.
    """
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response

    data = request.json
    user_id = data.get('user_id')
    twitch_url = data.get('twitch_url')

    if not user_id or not twitch_url:
        return jsonify({'status': 'error', 'message': 'Ungültige Eingabe.'}), 400

    try:
        response = requests.post(
            "http://127.0.0.1:5001/set_url",
            json={
                "user_id": user_id,
                "twitch_url": twitch_url
            },
        )
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_blueprint.route('/remove_viewer', methods=['POST', 'OPTIONS'])
def remove_viewer():
    """
    Entfernt Viewer.
    """
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response

    data = request.json
    user_id = data.get("user_id")
    twitch_url = data.get("twitch_url")
    viewer_count = data.get("viewer_count", 1)

    if not user_id or not twitch_url or viewer_count < 1:
        return jsonify({
            "status": "error",
            "message": "Ungültige Eingabe. Bitte user_id, twitch_url und viewer_count angeben."
        }), 400

    try:
        response = requests.post(
            "http://127.0.0.1:5001/remove_viewer",
            json={
                "user_id": user_id,
                "twitch_url": twitch_url,
                "viewer_count": viewer_count
            }
        )
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 500

