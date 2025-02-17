
from flask import Blueprint, request, jsonify
from twitch.gui_controller import api_gui

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
        print(f"Adding {viewer_count} viewers for URL: {twitch_url}")
        result = api_gui.spawn_viewers(viewer_count, twitch_url)
        print(f"Result from spawn_viewers: {result}")
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        print(f"Error in add_viewer: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@api_blueprint.route('/remove_viewer', methods=['POST'])
def remove_viewer():
    """Entfernt einen Viewer."""
    data = request.json
    twitch_url = data.get("twitch_url", "")
    viewer_count = data.get("viewer_count", 1)

    if not twitch_url or viewer_count < 1:
        return jsonify({"status": "error", "message": "Ungültige Eingabe."}), 400

    try:
        print(f"Removing {viewer_count} viewers for URL: {twitch_url}")
        result = api_gui.remove_viewers(viewer_count, twitch_url)
        print(f"Result from remove_viewers: {result}")
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        print(f"Error in remove_viewer: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@api_blueprint.route('/remove_viewers', methods=['POST'])
def remove_viewers():
    """Entfernt mehrere Viewer auf einmal."""
    data = request.json
    twitch_url = data.get("twitch_url", "")
    viewer_count = data.get("viewer_count", 5)  # Standard ist 5 Viewer

    if not twitch_url or viewer_count < 1:
        return jsonify({"status": "error", "message": "Ungültige Eingabe."}), 400

    try:
        print(f"Removing {viewer_count} viewers for URL: {twitch_url}")
        result = api_gui.remove_viewers(viewer_count, twitch_url)
        print(f"Result from remove_viewers: {result}")
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        print(f"Error in remove_viewers: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@api_blueprint.route('/remove_all', methods=['POST'])
def remove_all():
    """Entfernt alle Viewer."""
    data = request.json
    twitch_url = data.get("twitch_url", "")

    if not twitch_url:
        return jsonify({"status": "error", "message": "Keine Twitch-URL angegeben."}), 400

    try:
        print(f"Removing all viewers for URL: {twitch_url}")
        # Wir verwenden hier eine große Zahl, um sicherzustellen, dass alle Viewer entfernt werden
        result = api_gui.remove_viewers(999999, twitch_url)
        print(f"Result from remove_all: {result}")
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        print(f"Error in remove_all: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

