import { useState, useEffect, useRef } from 'react'



interface Message {

    id: string,
    roomId: string,
    text: string,
    senderId: string
    name: string


}

interface Room {
    id: string
}
export default function Chat() {

    let [count, setCount] = useState(0);
    const [message, setMessage] = useState("");
    const [roomId, setRoomId] = useState("");
    const [name, setName] = useState("");

    const [roomsId, setRoomsId] = useState<Room[]>([]); // array of room objects
    const [messages, setMessages] = useState<Message[]>([]); // array of message objects

    const [showroom, setShowroom] = useState<boolean>(false);
    const [myId, setMyId] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);




    function joinRoom() {
        if (!roomId) {
            console.log("NO ROOM ID – cannot join");
            return;
        }

        if (socketRef.current) return;
        // const exists = roomsId.some(Room => Room.id === roomId);
        // if (!exists) return;
        setShowroom(!showroom);

        const ws = new WebSocket("ws://localhost:8080");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("SOCKET OPEN");
            ws.send(JSON.stringify({
                type: "join",
                payload: {
                    roomId: roomId,
                    name: name

                }
            }));
        }
        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            const textobj = msg.payload;

            if (msg.type === "joined") {
                setMyId(msg.payload.senderId);

            }

            if (msg.type === "history") {

                setMessages(msg.payload.messages)
                
            }

            if (msg.type === "room-info") {
                setCount(msg.payload.noofClients);
            }

            if (msg.type === "message") {

                console.log("Chat message:", textobj.text);



                setMessages(prev => [...prev, textobj])
            }
        };

    }
    function sendMessage() {
        if (!socketRef.current) return;
        console.log("SEND CLICKED", message);

        socketRef.current.send(JSON.stringify({
            type: "message",
            payload: {

                id: crypto.randomUUID(),
                roomId,
                text: message,

            }
        }));

        setMessage("");

    }

    function generateRoomId() {
        const roomcode = Math.random().toString(36).slice(2, 8).toUpperCase();
        console.log(roomcode);
        const roommId = roomcode;
        setRoomId(roomcode);
        if (roommId) {

            setRoomsId(prev => [...prev, { id: roomcode }]);
        }
        return roomcode;
    }

    return (
        <div className=" min-h-screen flex flex-col items-center justify-center gap-4 ">
            {!showroom && (
                <div>
                    <div className="flex flex-col border border-[#2F2F2F] p-6 w-full rounded-xl gap-4">
                        <div className="flex flex-col"> <div className="text-amber-50 text-3xl font-semibold font-['nocturn'] tracking-wider">Real Time Chat</div>
                            <div className="text-[#b6b5b5] font-['doto'] text-xl">Temporary Room expires when all users exit</div>
                        </div>

                        <button className="w-full bg-amber-100 p-3.5 rounded-sm font-semibold cursor-pointer text-xl font-['nocturn'] text-black" onClick={generateRoomId}>Create New Room</button>
                        <div className="flex justify-between gap-2 h-xs">
                            <input className="w-full p-2 border border-[#2F2F2F] rounded-sm placeholder-[#8d8c8c] font-['nocturn']" placeholder="Enter Room Code" value={roomId} onChange={(e) => { setRoomId(e.target.value) }} ></input>
                            <button className="px-3 py-1 bg-amber-100 rounded-sm items-center w-3xs cursor-pointer font-['nocturn'] text-3xs font-semibold text-black" onClick={() => { joinRoom() }} >Join Room</button>
                        </div>

                        <div className="flex justify-between gap-2 h-xs">
                            <input className="w-full p-2 border border-[#2F2F2F] rounded-sm placeholder-[#8d8c8c] font-['nocturn']" placeholder="Enter Room Code" value={name} onChange={(e) => { setName(e.target.value) }} ></input>
                            <button className="px-3 py-1 bg-amber-100 rounded-sm items-center w-3xs cursor-pointer font-['nocturn'] text-3xs font-semibold text-black" onClick={() => { alert("Name is Saved"); }} >Set Name</button>
                        </div>

                    </div>

                    {roomsId.length > 0 && (
                        <div className='w-full flex-col flex justify-center gap-3'>
                            {roomsId.map((Room, index) => (
                                <div key={Room.id} className="flex flex-col border border-[#2F2F2F] p-2 w-full rounded-xl gap-4 justify-center items-center">
                                    <div className="  text-amber-50 text-2xl font-['doto'] tracking-tighter">Room {index + 1} : {Room.id} </div>
                                </div>
                            ))
                            }
                        </div>
                    )}
                </div>
            )}


            {showroom && (
                <div className=" flex flex-col text-white text-3xl gap-2 w-full font-['nocturn'] tracking-tight ">
                    <div>
                        <span className='font-["mulish"]'>Room :</span>  <span className="font-['doto'] pt-2">  {roomId}</span>
                    </div>
                    <p className='text-xl text-[#c7c6c6]' >Clients : {count}</p>
                    <div className='flex flex-col justify-between text-2xl gap-2 border border-[#2F2F2F] rounded-xl p-4'>

                        {messages.map((Message) => {
                            const isMine = Message.senderId === myId;
                            return (

                                <div key={Message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>

                                    <div className={` flex flex-col px-3 py-2 rounded-lg text-[#858484] font-['doto']  `}>
                                        <p className='text-xl'>{Message.name}</p>
                                        <div className={` flex max-w-full px-3 justify-center py-2 rounded-lg font-['nocturn'] text-white ${isMine ? "bg-blue-500" : "bg-gray-700"}`}>
                                            <p>{Message.text}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className=' flex justify-between gap-2 border-t-2 border-[#2F2F2F] pt-2.5'>
                            <input className=" p-1 border border-[#2F2F2F] rounded-sm placeholder-[#8d8c8c] font-['nocturn'] text-xl w-full" placeholder="Enter Message" value={message} onChange={(e) => { setMessage(e.target.value) }} ></input>
                            <button className=" p-2 bg-amber-100 rounded-xl items-center  cursor-pointer font-['nocturn'] text-xl font-semibold text-black" onClick={() => { sendMessage() }} >Send</button>
                        </div>
                    </div>

                </div>
            )}

        </div>
    )
}

