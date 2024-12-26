const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Function to format the bot's message
const formatBotMessage = (message) => {
    // Replace newline characters with <br> for line breaks
    const formattedMessage = message
        .replace(/\n/g, "<br>") // Convert \n to HTML line breaks
        .replace(/- (.+)/g, "<li>$1</li>"); // Convert list items to <li>
    return formattedMessage;
};

// Function to adjust chat box height dynamically
const adjustChatBoxHeight = () => {
    chatBox.style.height = "auto"; // Reset height
    chatBox.style.height = `${chatBox.scrollHeight}px`; // Adjust height to content
};

// Function to send the user's message
const sendMessage = async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Do nothing if input is empty

    // Display user's message
    chatBox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
    userInput.value = ""; // Clear the input field

    // Display a loading message
    const loadingMessageId = `loading-${Date.now()}`; // Unique ID for the loading message
    chatBox.innerHTML += `<p id="${loadingMessageId}"><strong>Assistant:</strong> Thinking...</p>`;

    // Adjust chat box height after user input
    adjustChatBoxHeight();

    // Send the message to the backend
    try {
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json(); // Parse the JSON response
        const botMessage = formatBotMessage(data.message); // Format the bot message

        // Replace the loading message with the bot's response
        document.getElementById(loadingMessageId).outerHTML = `<p><strong>Assistant:</strong> ${botMessage}</p>`;
    } catch (error) {
        // Replace the loading message with an error message
        document.getElementById(loadingMessageId).outerHTML = `<p><strong>Assistant:</strong> Error: ${error.message}</p>`;
    }

    // Adjust chat box height after receiving the response
    adjustChatBoxHeight();
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
