module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bug Hunt - Alexa TTRPG Voice Assistant</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #ffd700;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .status {
            background: rgba(0, 255, 0, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #00ff00;
        }
        .endpoint {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
        }
        .test-section {
            margin: 30px 0;
        }
        .voice-chars {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .voice-char {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .voice-name {
            font-weight: bold;
            color: #ffd700;
        }
        .btn {
            background: #ffd700;
            color: #1e3c72;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            margin: 5px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: #ffed4e;
            transform: translateY(-2px);
        }
        .test-form {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .test-form input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: none;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
        }
        .response {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Bug Hunt</h1>
        <h2>Alexa + LLM TTRPG Voice Assistant</h2>
        
        <div class="status">
            ✅ <strong>API Status:</strong> Online and Ready
        </div>
        
        <div class="test-section">
            <h3>🔧 API Endpoints</h3>
            <div class="endpoint">
                <strong>POST /api/ask</strong><br>
                Main endpoint for Alexa skill integration
            </div>
        </div>
        
        <div class="test-section">
            <h3>🎭 Voice Characters</h3>
            <div class="voice-chars">
                <div class="voice-char">
                    <div class="voice-name">Joanna</div>
                    <div>Main narration</div>
                </div>
                <div class="voice-char">
                    <div class="voice-name">Matthew</div>
                    <div>Military NPCs</div>
                </div>
                <div class="voice-char">
                    <div class="voice-name">Ivy</div>
                    <div>Creepy/alien voices</div>
                </div>
                <div class="voice-char">
                    <div class="voice-name">Justin</div>
                    <div>Computer/AI systems</div>
                </div>
            </div>
        </div>
        
        <div class="test-section">
            <h3>🧪 Test API</h3>
            <div class="test-form">
                <input type="text" id="userInput" placeholder="Enter a command (e.g., 'open the door')" value="check the medbay">
                <button class="btn" onclick="testAPI()">Test API</button>
                <div id="response" class="response" style="display: none;"></div>
            </div>
        </div>
        
        <div class="test-section">
            <h3>🎮 Sample Commands</h3>
            <button class="btn" onclick="testCommand('open the door')">Open the door</button>
            <button class="btn" onclick="testCommand('check the medbay')">Check the medbay</button>
            <button class="btn" onclick="testCommand('search for survivors')">Search for survivors</button>
            <button class="btn" onclick="testCommand('look around')">Look around</button>
        </div>
        
        <div class="test-section">
            <h3>📊 Project Info</h3>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Status:</strong> Ready for Production</p>
            <p><strong>LLM Support:</strong> Gemini & OpenAI</p>
            <p><strong>Database:</strong> Supabase</p>
            <p><strong>Deployment:</strong> Vercel</p>
        </div>
    </div>

    <script>
        async function testAPI() {
            const userInput = document.getElementById('userInput').value;
            const responseDiv = document.getElementById('response');
            
            if (!userInput) {
                alert('Please enter a command');
                return;
            }
            
            responseDiv.style.display = 'block';
            responseDiv.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userInput: userInput,
                        sessionId: 'test-session-' + Date.now()
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    responseDiv.innerHTML = \`
<strong>✅ Success!</strong>
<strong>Response:</strong> \${data.response}
<strong>Session ID:</strong> \${data.sessionId}
                    \`;
                } else {
                    responseDiv.innerHTML = \`
<strong>❌ Error:</strong> \${response.status}
<strong>Message:</strong> \${data.error || 'Unknown error'}
                    \`;
                }
            } catch (error) {
                responseDiv.innerHTML = \`
<strong>❌ Network Error:</strong>
\${error.message}
                \`;
            }
        }
        
        function testCommand(command) {
            document.getElementById('userInput').value = command;
            testAPI();
        }
    </script>
</body>
</html>
  `;
  
  res.status(200).send(html);
} 