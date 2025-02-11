const chatBox = document.getElementById("chat-box");
const inputBox = document.getElementById("input-box");

async function sendMessage() {
    const userInput = inputBox.value.trim();
    if (!userInput) return;

    // Add User Message
    addMessage("You", userInput, "bg-blue-400 text-white self-end");

    inputBox.value = "";

    // Show "Thinking..." while waiting for response
    const messageElement = addMessage("DeepSeek", "Thinking...", "bg-gray-700 text-white self-start");

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "deepseek-r1:8b", prompt: userInput })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botResponse = "";

        messageElement.innerHTML = `<strong>DeepSeek:</strong> `;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // ✅ Extract only the response part
            try {
                const jsonParts = chunk.trim().split("\n");
                jsonParts.forEach((jsonStr) => {
                    const json = JSON.parse(jsonStr);
                    if (json.response) {
                        botResponse += json.response;
                        messageElement.innerHTML = `<strong>DeepSeek:</strong> ${botResponse}`;
                    }
                });
            } catch (e) {
                console.error("Error parsing JSON:", e);
            }
        }

        messageElement.classList.remove("bg-gray-700");
        messageElement.classList.add("bg-green-400", "text-white");
    } catch (error) {
        console.error("Error fetching response:", error);
        messageElement.innerHTML = `<strong>DeepSeek:</strong> Error fetching response.`;
        messageElement.classList.add("bg-red-500", "text-white");
    }
}

function addMessage(sender, message, extraClasses = "") {
    const msgElement = document.createElement("div");
    msgElement.className = `p-3 rounded-lg max-w-xs w-fit mt-2 ${extraClasses}`;
    msgElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgElement;
}

function handleKeyPress(event) {
    if (event.key === "Enter") sendMessage();
}
