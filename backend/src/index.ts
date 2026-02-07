import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.PORT) || 10000;

const wss = new WebSocketServer({ port: PORT });
const rooms = new Map(); //<string, WebSocket>
const messages = new Map<string, Message[]>(); // key is room id and value is message object
const clients = new Map<WebSocket, string>();// key is socket and vsalue is senderId
const clientNames = new Map<WebSocket, string>();// key is socket and value is name
const sockettoroomId = new Map < WebSocket, string>();// key is socket and value is roomId



let clientCounter = 0;

interface Message {

  id: string,
  roomId: string,
  text: string,
  senderId: string
  name: string

}

wss.on("connection", (socket) => {
  clientCounter += 1;
  const senderId = `client-${clientCounter}`; // or any unique string
  //@ts-ignore
  clients.set(socket, senderId); // to know who send this message


  socket.send(JSON.stringify({
    type: "joined",
    payload: {

      senderId: senderId
    }
  }));


  console.log("CLIENT CONNECTED", senderId);

  socket.on("message", (e: Buffer) => {

    console.log("BACKEND RECEIVED:", e.toString());

    const parsedMessage = JSON.parse(e.toString());
    let roomId = parsedMessage.payload.roomId;
    let msg = parsedMessage.payload.text;
    let name = parsedMessage.payload.name;
    let noofClients = 0;

    if (!parsedMessage || !parsedMessage.type || !parsedMessage.payload) {
      return;
    }

    console.log("JOIN ROOM ID:", roomId);

    if (parsedMessage.type === "join") {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      if (!messages.has(roomId)) {
        messages.set(roomId, []);
      }

      //@ts-ignore
      if (!clientNames.has(socket)) {
        //@ts-ignore
        clientNames.set(socket, name);
      }

      //@ts-ignore
      sockettoroomId.set(socket,roomId);
      rooms.get(roomId).add(socket);
      noofClients = rooms.get(roomId).size;

      const history = messages.get(roomId);
      socket.send(JSON.stringify({
        type: "history",
        payload: {
          roomId,
          messages: history
        }
      }));
      const roomSockets = rooms.get(roomId);

      //@ts-ignore
      roomSockets.forEach((client) => { // broadcast to every client about noofclients
       if (client.readyState === WebSocket.OPEN)
        {
              client.send(JSON.stringify({
              type: "room-info",
              payload: { noofClients } }));
        }
      });

      console.log(history);
    }

    if (parsedMessage.type === "message" && msg) {

      const { roomId, text, id } = parsedMessage.payload;
      const roomSockets = rooms.get(roomId); // getting the sockets in the room id
      const roomMessages = messages.get(roomId); // gettinf the messages in the roomid
      //@ts-ignore
      const name = clientNames.get(socket) ?? "Anonymous";
      //@ts-ignore
      const senderId = clients.get(socket);
      if (!senderId) return;

      if (!roomSockets || !roomMessages) return;

      const message: Message = {
        id: id,
        roomId: roomId,
        text: text,
        senderId: senderId,
        name: name
      }
      console.log(message);
      roomMessages.push(message);
      //@ts-ignore
      roomSockets.forEach((client) => {
        if (client.readyState === socket.OPEN) {
          client.send(JSON.stringify
            ({
              type: "message",
              payload: message
            }));
        }
      });
    }


  })



  socket.on("close", () => {
     //@ts-ignore
  const roomId = sockettoroomId.get(socket);
  if (!roomId) return;

  const roomSockets = rooms.get(roomId);
  if (!roomSockets) return;

  // remove socket from room
  roomSockets.delete(socket);
   //@ts-ignore
  sockettoroomId.delete(socket);

  //recalc count
  const noofClients = roomSockets.size;

  
  //@ts-ignore
  roomSockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "room-info",
        payload: { noofClients }
      }));
    }
  });

  
  if (roomSockets.size === 0) {
    rooms.delete(roomId);
     messages.delete(roomId);

  }

})

})
