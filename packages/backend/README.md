This backend server is reponsible for:

1. Keeping track of all active players
2. Updating database as necessary, e.g. with new player info
3. Exposing a websocket server for the game client to interact with
4. Receiving websocket events containing user inputs from the game client and passing those to the game engine to verify, e.g. to rubber band user if they're not in the right position
5. Getting calls from the game engine and executing logic based off them. Passing results of that logic back to the client, likely for client's game engine to listen for those events and pass information the server has sent over through the game engine, which the client will listen to and then use to render/etc. This type of flow may be expected for something like showing specific loot to the player
