import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import io from "socket.io-client";


const CONNECTION_PORT = "https://muradschat.herokuapp.com/";
let socket;

function App() {
  //scroll the list of messages

  const messageEl = useRef(null);

  //states
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [logged, setLogged] = useState(false);

  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([{}]);
  
  useEffect(() => {
    socket = io(CONNECTION_PORT);
  }, [CONNECTION_PORT]);
  useEffect(() => {    
    socket.on("receive_message", (data) => {
      setMessageList([...messageList, data]);
    });
  });

  const connectToRoom = () => {
    socket.emit("join_room", room);
    setLogged(true);
  };

  const sendMessage = async (e) => {
    if (message.length > 0) {
      if (messageEl) {
        messageEl.current.addEventListener("DOMNodeInserted", (event) => {
          const { currentTarget: target } = event;
          target.scroll({ top: target.scrollHeight, behavior: "smooth" });
        });
      }
      const content = {
        author: username,
        message: message,
        room: room,
      };
      e.preventDefault();
      setMessage("");
      setMessageList([...messageList, content]);

      await socket.emit("send_message", content);
    } else {
      e.preventDefault();
    }
  };

  return (
    <div className="App">
      {!logged ? (
        <form className="logIn">
          <h1>Chat application</h1>
          <div className="inputs">
            <input placeholder='Username..' type="text" onChange={(e) => setUsername(e.target.value)} />
            <input placeholder='Room' type="number" onChange={(e) => setRoom(e.target.value)} />
          </div>

          <button onClick={connectToRoom}>Join Room</button>
        </form>
      ) : (
        <div className="chat">
          <h1>You are in Room: {room}</h1>

          <div className="messages" ref={messageEl}>
            {messageList.map((val, key) => {
              return (
                <div
                  className={val.author === username ? "my" : "your"}
                  key={key}
                >
                  <h5>{val.author}</h5>
                  <div className="message-text">
                    {" "}
                    <h2>{val.message}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bottom-bar">
            <form className="message-inputs">
              <input
                type="text"
                placeholder="Message.."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
