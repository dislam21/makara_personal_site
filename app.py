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
CORS(app, resources={r"/*": {"origins": "https://makarasorel.com"}})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Get user message from the request
        data = request.get_json()
        user_message = data.get("message", "")
        print(f"User message: {user_message}")

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a highly knowledgeable and professional dental assistant. "
                        "You provide clear, accurate, and empathetic answers to questions specifically related to oral health, dental procedures, best practices for dental hygiene, treatment options, orthodontics, and dental terminology. "
                        "If a user asks a question outside of these topics, politely respond with: "
                        "'I'm sorry, I can only assist with dental-related questions. Please consult an appropriate expert for other inquiries.'"
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
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
