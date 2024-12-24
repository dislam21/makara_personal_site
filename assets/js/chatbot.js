const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Function to send the user's message
const sendMessage = async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Do nothing if input is empty

    // Display user's message
    chatBox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
    userInput.value = ""; // Clear the input field

    // Send the message to the backend
    try {
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch response from chatbot");
        }

        const botMessage = await response.json(); // Assuming backend returns JSON
        chatBox.innerHTML += `<p><strong>Bot:</strong> ${botMessage}</p>`;
    } catch (error) {
        chatBox.innerHTML += `<p><strong>Bot:</strong> Error: ${error.message}</p>`;
    }

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
};

// Add event listener for the "Send" button
sendBtn.addEventListener("click", sendMessage);

// Add event listener for the "Enter" key
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { // Check if the "Enter" key was pressed
        event.preventDefault(); // Prevent default form submission
        sendMessage(); // Call the sendMessage function
    }
});
