import React, { useState, useEffect, useReducer, useRef } from "react";
import img from "../assets/drivers/1.png";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import Checkbox from "@mui/material/Checkbox";
import { useNavigate } from "react-router-dom";

const socket = io("https://backend-ddi2.onrender.com", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
function Chats() {
  const userId = JSON.parse(sessionStorage.getItem("user"))._id;
  const [active, setActive] = useState("customers");
  const [messageInput, setMessageInput] = useState("");
  const [selected, setSelected] = useState("");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [visible, setIsVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const lastMessageRef = useRef(null);
  const navigate = useNavigate();
  const deleteSelected = () => {
    socket.emit("deleteMessages", { room, messages: selectedMessages });
    console.log("Selected messages deleted");
    setSelectedMessages([]);
    setIsVisible(false);
  };
  const label = {
    inputProps: { "aria-label": "Checkbox demo" },
  };
  const isMessageSelected = (cur) => {
    return selectedMessages.includes(cur._id);
  };
  const updateMessageStatus = (cur) => {
    if (!selectedMessages.includes(cur._id)) {
      setSelectedMessages((prev) => [...prev, cur._id]);
    } else {
      setSelectedMessages((prev) => prev.filter((id) => id !== cur._id));
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const sender = JSON.parse(sessionStorage.getItem("user"))?._id;

    socket.emit("sendMessage", {
      room, // Current room ID
      sender, // Current user's ID
      message: messageInput.trim(),
    });

    setMessageInput("");
  };
  useEffect(() => {
    // Filter users based on search term
    if (search.length > 1) {
      const filteredUsers = allUsers.filter((user) => {
        // Convert all values to lowercase for case-insensitive search
        const searchableValues = Object.values(user).join(" ").toLowerCase();
        return searchableValues.includes(search.toLowerCase());
      });
      console.log(filteredUsers);
      setUsers(filteredUsers);
    }
  }, [search, allUsers]);
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);
  useEffect(() => {
    if (!visible) {
      setSelectedMessages([]);
    }
  }, [visible]);
  useEffect(() => {
    const getData = async () => {
      const response = await fetch(
        `https://backend-ddi2.onrender.com/api/user/getusers`,
        {
          method: "POST",
          body: JSON.stringify({
            user: JSON.parse(sessionStorage.getItem("user"))?._id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const responseUsersWithChat = await fetch(
        `https://backend-ddi2.onrender.com/api/user/getUsersWithRoom`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: JSON.parse(sessionStorage.getItem("user"))?._id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data2 = await responseUsersWithChat.json();
      // console.log(data.data);
      setUsers(data2.users);
      setAllUsers(data.data);
    };
    getData();
  }, []);
  useEffect(() => {
    socket.on("previousMessages", (messages) => {
      setMessages((prevMessages) => {
        const newMessages = messages.map((msg) => ({
          sender: msg.sender._id, // Access the sender's username
          content: msg.content, // Message content
          time: msg.timestamp, // Format the timestamp to time
          _id: msg._id,
        }));

        return [...newMessages]; // Append the previous messages
      });
    });

    socket.on("receiveMessage", ({ message }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: message.sender._id,
          content: message.content,
          time: message.timestamp,
          _id: message._id,
        },
      ]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("previousMessages");
    };
  }, []);
  const createRoom = async (cur) => {
    console.log(cur, room);
    try {
      const response = await fetch(
        `https://backend-ddi2.onrender.com/api/room/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user1: cur._id,
            user2: JSON.parse(sessionStorage.getItem("user"))?._id,
          }),
        }
      );

      const data = await response.json();

      if (room) {
        socket.emit("leaveRoom", {
          room,
          user: JSON.parse(sessionStorage.getItem("user")),
        });
        console.log(`Left previous room: ${room}`);
      }

      setRoom(data._id);
      setSelected(cur);
      setMessages([]);

      socket.emit("joinRoom", {
        room: data._id,
        user: JSON.parse(sessionStorage.getItem("user")),
      });
      console.log(`Joined room: ${data._id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
  return (
    <>
      <div className=" chats-container">
        <div className=" chats-logo-div">
          <div className=" chats-logo-btns">
            <button
              className={`${active === "customers" ? "chat-btns-active" : ""}`}
              onClick={() => {}}
            >
              Chats
            </button>
            <button
              className={`${active === "drivers" ? "chat-btns-active" : ""}`}
            >
              Groups{" "}
            </button>
          </div>
          <div className=" chats-logo-search-bar">
            <label htmlFor="">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.2533 16.7467 2 11.5 2C6.2533 2 2 6.2533 2 11.5C2 16.7467 6.2533 21 11.5 21Z"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 22L20 20"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </label>
          </div>
          <div className=" chats-logo-chats">
            {users?.map((cur) => {
              return (
                <div
                  key={cur?._id}
                  className={`chat-div ${
                    selected?.name === cur?.name ? "active-chat" : ""
                  }`}
                  onClick={(e) => {
                    createRoom(cur);
                  }}
                >
                  <img src={cur?.logo || img} alt="" />
                  <div>
                    <label>
                      <h1>{cur?.username}</h1>
                      <p></p>
                    </label>
                    <span></span>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => handleLogout()}
            className=" mt-auto    text-red-600   transition-all  hover:scale-110 duration-500 "
          >
            Log out
          </button>
        </div>
        {selected ? (
          <>
            <div className=" chats-message-wrapper">
              <div className="chats-message-div">
                <div className=" chats-message-content">
                  <div className="chat-top-bar">
                    <div className=" image-div">
                      <img src={selected?.logo || img} alt="" />
                      <div className=" name-div">
                        <h1>{selected?.username}</h1>
                        <div className=" active-div">
                          <div> </div> <p>Active</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="25"
                        height="25"
                        viewBox="0 0 48 48"
                        onClick={deleteSelected}
                        className=" cursor-pointer hover:scale-110 transition-all duration-200 "
                      >
                        <path d="M 20.5 4 A 1.50015 1.50015 0 0 0 19.066406 6 L 14.640625 6 C 12.796625 6 11.086453 6.9162188 10.064453 8.4492188 L 7.6972656 12 L 7.5 12 A 1.50015 1.50015 0 1 0 7.5 15 L 40.5 15 A 1.50015 1.50015 0 1 0 40.5 12 L 40.302734 12 L 37.935547 8.4492188 C 36.913547 6.9162187 35.202375 6 33.359375 6 L 28.933594 6 A 1.50015 1.50015 0 0 0 27.5 4 L 20.5 4 z M 8.9726562 18 L 11.125 38.085938 C 11.425 40.887937 13.77575 43 16.59375 43 L 31.40625 43 C 34.22325 43 36.574 40.887938 36.875 38.085938 L 39.027344 18 L 8.9726562 18 z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {messages
                      ?.sort((a, b) => {
                        const dateA = new Date(a.time);
                        const dateB = new Date(b.time);

                        return dateA - dateB; // Sort in ascending order
                      })
                      ?.map((cur, index) => {
                        let x = false;

                        if (
                          new Date(
                            new Date(cur.time).getFullYear(),
                            new Date(cur.time).getMonth(),
                            new Date(cur.time).getDate()
                          ) >
                            new Date(
                              new Date(messages[index - 1]?.time).getFullYear(),
                              new Date(messages[index - 1]?.time).getMonth(),
                              new Date(messages[index - 1]?.time).getDate()
                            ) ||
                          index == 0
                        ) {
                          x = true;
                        }
                        const isReceived = cur.sender !== userId;
                        const prevIsReceieved =
                          index > 0
                            ? messages[index - 1]?.sender !== userId
                            : false;
                        // const uniqueKey = uuidv4(); // Generate a unique key

                        if (isReceived && prevIsReceieved) {
                          return (
                            <React.Fragment key={uuidv4()}>
                              {x ? (
                                <div className=" chat-time-div">
                                  {" "}
                                  <hr />
                                  <p>
                                    {" "}
                                    {new Date(cur.time).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>{" "}
                                  <hr />
                                </div>
                              ) : (
                                ""
                              )}
                              <div
                                key={`receive-${index}`}
                                className="message-container"
                                ref={
                                  index === messages.length - 1
                                    ? lastMessageRef
                                    : null
                                }
                              >
                                <div className="receive-message">
                                  <img
                                    src={img}
                                    alt="Profile"
                                    className=" invisible"
                                  />
                                  <div className=" group-message">
                                    <div className="receive-message-text">
                                      <h1 className="receive-text-message">
                                        {cur.content}
                                      </h1>
                                      <div className="receive-message-time">
                                        {new Intl.DateTimeFormat("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        }).format(new Date(cur.time))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }
                        if (isReceived) {
                          return (
                            <React.Fragment key={uuidv4()}>
                              {x ? (
                                <div className=" chat-time-div">
                                  <hr />
                                  <p>
                                    {" "}
                                    {new Date(cur.time).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>{" "}
                                  <hr />
                                </div>
                              ) : (
                                ""
                              )}
                              <div
                                key={`receive-${index}`}
                                className="message-container"
                                ref={
                                  index === messages.length - 1
                                    ? lastMessageRef
                                    : null
                                }
                              >
                                <div className="receive-message">
                                  <img src={img} alt="Profile" />
                                  <div className=" group-message">
                                    {" "}
                                    <div className="receive-message-text">
                                      <h1 className="receive-text-message">
                                        {cur.content}
                                      </h1>
                                      <div className="receive-message-time">
                                        {new Intl.DateTimeFormat("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        }).format(new Date(cur.time))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }
                        if (!isReceived) {
                          return (
                            <React.Fragment key={uuidv4()}>
                              {x ? (
                                <div className=" chat-time-div">
                                  {" "}
                                  <hr />
                                  <p>
                                    {" "}
                                    {new Date(cur.time).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>{" "}
                                  <hr />
                                </div>
                              ) : (
                                ""
                              )}
                              <div
                                key={`send-${index}`}
                                className="message-container"
                                ref={
                                  index === messages.length - 1
                                    ? lastMessageRef
                                    : null
                                }
                              >
                                <div
                                  className={`${
                                    isMessageSelected(cur)
                                      ? " send-message-selected"
                                      : "send-message"
                                  } `}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    setIsVisible(!visible);
                                  }}
                                  onClick={() => {
                                    if (visible) updateMessageStatus(cur);
                                  }}
                                >
                                  <div className="send-message-text ">
                                    <h1 className="send-text-message">
                                      {cur.content}
                                    </h1>
                                    <div className="send-message-time">
                                      {new Intl.DateTimeFormat("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }).format(new Date(cur.time))}
                                    </div>
                                  </div>
                                  <Checkbox
                                    {...label}
                                    style={{ display: visible ? "" : "none" }}
                                    className={`   mx-4 mb-[10px]`}
                                    color="default"
                                    checked={isMessageSelected(cur)}
                                  />
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }
                      })}
                  </div>
                  <form
                    action=""
                    onSubmit={(e) => {
                      handleSendMessage(e);
                    }}
                  >
                    <div className=" chat-options">
                      <button className=" add-files-btn">
                        <svg
                          width="22"
                          height="21"
                          viewBox="0 0 25 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22.2994 10.5698L12.9847 19.8833C11.9563 20.9482 10.557 21.5755 9.0778 21.6349C7.59862 21.6942 6.15352 21.1809 5.04319 20.2018C4.501 19.6913 4.06688 19.0771 3.76659 18.3956C3.4663 17.7142 3.30596 16.9793 3.29508 16.2347C3.2842 15.4901 3.423 14.7509 3.70325 14.061C3.9835 13.371 4.39948 12.7444 4.92652 12.2183L12.8599 4.28496C13.4853 3.67765 14.3247 3.34082 15.1965 3.34725C16.0683 3.35368 16.9025 3.70285 17.519 4.31932C18.1355 4.93579 18.4846 5.77005 18.4911 6.64185C18.4975 7.51364 18.1607 8.35297 17.5534 8.97846L9.62002 16.9118C9.41536 17.1061 9.14391 17.2145 8.86169 17.2145C8.57946 17.2145 8.30801 17.1061 8.10335 16.9118C7.90386 16.7098 7.79199 16.4373 7.79199 16.1535C7.79199 15.8696 7.90386 15.5971 8.10335 15.3951L14.4465 9.05196C14.6656 8.83165 14.7882 8.53334 14.7873 8.22266C14.7864 7.91197 14.6622 7.61436 14.4419 7.39529C14.2215 7.17622 13.9232 7.05364 13.6126 7.05452C13.3019 7.05539 13.0043 7.17965 12.7852 7.39996L6.44202 13.7408C5.80389 14.3809 5.44557 15.2479 5.44557 16.1517C5.44557 17.0555 5.80389 17.9225 6.44202 18.5626C7.09138 19.1825 7.95461 19.5284 8.85235 19.5284C9.7501 19.5284 10.6133 19.1825 11.2627 18.5626L19.196 10.6293C19.7295 10.1061 20.154 9.48241 20.4449 8.79417C20.7358 8.10593 20.8874 7.36684 20.8909 6.61965C20.8943 5.87246 20.7496 5.132 20.4651 4.44109C20.1806 3.75018 19.7619 3.12253 19.2333 2.59446C18.7047 2.06638 18.0766 1.64834 17.3854 1.36454C16.6942 1.08073 15.9536 0.936777 15.2064 0.941009C14.4592 0.94524 13.7203 1.09757 13.0324 1.38919C12.3444 1.68081 11.7211 2.10593 11.1985 2.63996L3.26518 10.5733C2.51757 11.3205 1.92767 12.2103 1.5305 13.1899C1.13332 14.1695 0.93696 15.2189 0.953065 16.2758C0.969169 17.3327 1.19741 18.3756 1.62425 19.3426C2.05108 20.3096 2.66782 21.181 3.43785 21.9051C4.88282 23.248 6.78765 23.9858 8.76018 23.9666C10.9636 23.966 13.0766 23.0902 14.6344 21.5318L23.949 12.2171C24.0604 12.1095 24.1493 11.9808 24.2105 11.8384C24.2716 11.6961 24.3038 11.543 24.3051 11.3881C24.3065 11.2332 24.277 11.0796 24.2183 10.9362C24.1597 10.7928 24.073 10.6625 23.9635 10.553C23.8539 10.4435 23.7237 10.3568 23.5803 10.2982C23.4369 10.2395 23.2833 10.21 23.1284 10.2113C22.9735 10.2127 22.8204 10.2449 22.678 10.306C22.5357 10.3672 22.407 10.456 22.2994 10.5675V10.5698Z"
                            fill="black"
                          />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="Type here..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                      />
                      <button className=" send-message-btn">
                        Send Message{" "}
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.0912 10.1423L4.18404 8.71556L0.929986 2.20681C0.703064 1.75227 0.793193 1.20303 1.1543 0.845845C1.51544 0.488683 2.06534 0.403146 2.51722 0.635355L19.0164 9.09641C19.4084 9.29769 19.6557 9.70156 19.6557 10.1423C19.6557 10.583 19.4084 10.9869 19.0163 11.1882L2.51723 19.6492C2.06534 19.8814 1.51544 19.7959 1.1543 19.4387C0.793194 19.0815 0.703066 18.5323 0.929987 18.0777L4.1998 11.5374L12.0912 10.1423Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default Chats;
