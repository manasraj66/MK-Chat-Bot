from flask import Flask, render_template, request, jsonify
import os
import requests
import mimetypes

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB total request limit
API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/"
    f"models/{MODEL}:generateContent"
)

def ask_gemini(message, attachment=None):
    if not API_KEY:
        return "API key is not configured. Set GEMINI_API_KEY in your terminal, then restart MK Chat Bot."

    parts = [{
        "text": (
            "You are MK Chat Bot, a friendly, helpful AI assistant. "
            "You can help with machine learning, programming, study questions, and general tasks. "
            "If a file is attached, analyze it and answer the user's request about it.\n\n"
            f"User message: {message or 'Please describe or analyze the attached file.'}"
        )
    }]

    if attachment:
        mime = attachment.mimetype or mimetypes.guess_type(attachment.filename or "")[0]
        if not mime:
            return "I couldn't identify this file type. Please upload a supported image, video, PDF, or text document."
        allowed_prefixes = ("image/", "video/", "text/")
        allowed_types = {"application/pdf"}
        if not mime.startswith(allowed_prefixes) and mime not in allowed_types:
            return "This file type isn't supported yet. Upload an image, video, PDF, or text file."
        raw = attachment.read()
        if len(raw) > 18 * 1024 * 1024:
            return "That file is too large. Please keep each upload under 18 MB."
        if mime.startswith("text/"):
            try:
                content = raw.decode("utf-8")
            except UnicodeDecodeError:
                return "I couldn't read this text file as UTF-8. Please save it as UTF-8 and try again."
            parts.append({"text": f"\nAttached text file: {attachment.filename}\n\n{content[:50000]}"})
        else:
            import base64
            parts.append({
                "inline_data": {
                    "mime_type": mime,
                    "data": base64.b64encode(raw).decode("ascii")
                }
            })
            parts.append({"text": f"Attached file name: {attachment.filename}. Please inspect this file."})

    try:
        response = requests.post(
            GEMINI_URL,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"},
            json={"contents": [{"role": "user", "parts": parts}]},
            timeout=120
        )
        try:
            data = response.json()
        except ValueError:
            return "The AI service returned an unreadable response. Please try again."
        if response.status_code != 200:
            print("Gemini API error:", response.status_code, data)
            detail = data.get("error", {}).get("message", "")
            return f"Gemini API error: {detail or 'Request failed. Check your API key, model access, and quota.'}"
        candidates = data.get("candidates", [])
        if candidates:
            return "".join(
                part.get("text", "")
                for part in candidates[0].get("content", {}).get("parts", [])
                if part.get("text")
            ) or "I couldn't produce a text answer for that file."
        return "No response received from Gemini. Try a different file or prompt."
    except requests.RequestException as exc:
        print("Gemini connection error:", exc)
        return "Couldn't connect to the AI service. Check your internet connection and try again."


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat_api():
    message = request.form.get("message", "").strip()
    attachment = request.files.get("file")
    if not message and (not attachment or not attachment.filename):
        return jsonify({"reply": "Type a message or attach a file first."}), 400
    if attachment and not attachment.filename:
        attachment = None
    return jsonify({"reply": ask_gemini(message, attachment)})


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"reply": "Upload too large. Please keep the total request under 20 MB."}), 413


if __name__ == "__main__":
    app.run(debug=True)
