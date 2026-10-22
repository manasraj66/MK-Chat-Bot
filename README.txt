MK CHAT BOT — WEB VERSION

FEATURES
- Cute animated panda mascot with waving arm, blinking eyes, floating motion, and a hide button.
- New MK Chat Bot branding and modern responsive interface.
- Chat with Gemini AI.
- Attach and preview images, videos, PDFs, and text files.
- Ask questions about an attachment; images and supported video files are sent to Gemini for analysis.
- Image/video preview before sending.
- Typing indicator, message timestamps, clear-chat button, and quick prompt suggestions.
- File size checks and server-side file type checks.

REQUIREMENTS
- Python 3.10+
- A Gemini API key with access to the configured model.
- Internet connection.

RUN ON WINDOWS POWERSHELL
1. Extract the ZIP and open the extracted folder in VS Code.
2. In the terminal, install packages:
   python -m pip install -r requirements.txt
3. Set your Gemini API key (replace the example with your own key):
   $env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
4. Start the app:
   python app.py
5. Open http://127.0.0.1:5000

If you close the terminal, set GEMINI_API_KEY again in the new terminal.
Optional model override:
   $env:GEMINI_MODEL="gemini-2.5-flash"

SECURITY / LIMITATIONS
- Never put your API key in app.py or upload it to GitHub.
- Uploads are processed in memory and are not saved to disk by this app.
- Keep uploads below 18 MB; total request limit is 20 MB.
- Gemini model availability and supported video formats can vary by account/region. If video analysis fails, try a shorter/smaller supported video or check the Gemini API documentation.
- This starter app is for local development. Before public deployment, add authentication, rate limiting, and production server configuration.
