from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Get user message from the request
        data = request.get_json()
        user_message = data.get("message", "")
        print(f"User message: {user_message}")

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a highly knowledgeable and professional dental assistant. "
                        "You provide clear, accurate, and empathetic answers to questions related to oral health, dental procedures, and orthodontics."
                        "best practices for dental hygiene, treatment options, and dental terminology. "
                        "If you are unsure about something, respond by saying that and advising the user to consult a licensed dentist."
                    )
                },
                {"role": "user", "content": user_message},
            ],
        )

        # Extract the chatbot's reply
        bot_message = response.choices[0].message.content
        print(f"Bot message: {bot_message}")
        return jsonify({"message": bot_message})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
