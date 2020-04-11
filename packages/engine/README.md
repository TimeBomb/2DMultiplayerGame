This is the game engine shared between the client and the server

Engine will have 3 parts:

1. Server-specific engine code
2. Client-specific engine code
3. Shared engine code

Ideally server/client-specific engine code will extend off of shared engine code, ensuring server/client code is very similar in implementation and API

Notes:

-   All events sent from server to client and vice-versa will be sent in a bundle every single tick rate - ie every X milliseconds. This includes game events like the user moving or attacking an enemy, and REST/RPC calls like the user buying an item

Flow of logic:

1. Client passes input event to client engine

2. Client engine will handle them accordingly, e.g. to move the character, deal damage to enemy, send event to client to render the change to a degree that's possible prior to receiving server info. This client will need to predict what the server will send back.

3. The client will simultaneously send those user input events to the server via a websocket the server has opened.

4. The server will, upon getting information from the client, pass that through to the server engine

5. The server engine will handle the user input event similarly to the client engine, by passing it to the client engine

6. Upon the server engine getting to the same point the client engine got - needing info for the server, the server engine will call a function in the server (server will be listening on server engine websocket)

7. The server will handle that request for update/info from the server engine appropriately, e.g. killing an enemy, getting its loot, and then send an event to the client voer websocket. The server will also be sending necessary events via websocket to all players in the vicinity of the location the event originated (i.e. other players can see nearby enemy dying)

8. The client engine will be listening to that event from the server coming through the websocket, and then handle that info appropriately, e.g. by telling client to render the loot. The client may also do something like rubberband the user if they're too far out of sync from the server
   and handle them then send them to the client

9. All of these websocket events can likely be bundled into a single client/server "tick" event, i.e. the client/server send one websocket message containing a bundle of events every X milliseconds, i.e. every tick. Any information that the user needs to see that may be unrelated to the user's input, e.g. a server-wide announcement, new enemy spawns, can also be sent through this tick
