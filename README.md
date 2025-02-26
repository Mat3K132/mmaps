Players must see other players cursors and flags,
going to achieve that through WebSocket.
Cloudflare for storage of data obtained by the web-app!

Discord Bot ↔ Discord API:
The bot responds to user commands (e.g., start game) and sends messages.

Web App ↔ Discord Bot:
The web app receives commands from the bot and updates the UI based on game state.

Web App ↔ WebSocket Server:
The web app communicates with the WebSocket server for real-time updates (flag placement, cursor visibility).

WebSocket Server ↔ Cloudflare Workers:
The WebSocket server may interact with Cloudflare Workers to handle user authentication or game state requests.

Web App ↔ Cloudflare Workers:
The web app sends API requests to Cloudflare Workers for tasks like starting games or updating leaderboards.
