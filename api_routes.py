
from flask import Blueprint, request, jsonify
from twitch.gui_controller import api_gui  # Holt api_gui jetzt korrekt von gui_controller.py

api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/set_url', methods=['POST'])
def set_url():
    """Setzt die Twitch-URL in der GUI."""
    data = request.json
    twitch_url = data.get("twitch_url", "")
    if not twitch_url:
        return jsonify({"status": "error", "message": "Keine Twitch-URL angegeben."}), 400

    api_gui.set_twitch_url(twitch_url)
    return jsonify({"status": "success", "message": f"Twitch-URL wurde auf {twitch_url} gesetzt."})

@api_blueprint.route('/add_viewer', methods=['POST'])
def add_viewer():
    """Fügt Viewer hinzu."""
    data = request.json
    twitch_url = data.get("twitch_url", "")
    viewer_count = data.get("viewer_count", 1)

    if not twitch_url or viewer_count < 1:
        return jsonify({"status": "error", "message": "Ungültige Eingabe."}), 400

    try:
        result = api_gui.spawn_viewers(viewer_count, twitch_url)
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@api_blueprint.route('/remove_viewer', methods=['POST'])
def remove_viewer():
    """Entfernt Viewer."""
    data = request.json
    twitch_url = data.get("twitch_url", "")
    viewer_count = data.get("viewer_count", 1)

    if not twitch_url or viewer_count < 1:
        return jsonify({"status": "error", "message": "Ungültige Eingabe."}), 400

    try:
        result = api_gui.remove_viewers(viewer_count, twitch_url)
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

