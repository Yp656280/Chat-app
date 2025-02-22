import React from "react";
// import { io } from "socket.io-client";
import Register from "./components/Register";
import Login from "./components/Login";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./App.css";
// import Chat from "./components/Chat";
import Chats from "./components/Chats";
import PrivateRoute from "./components/PrivateRoute";
import Temp from "./components/FileUpload";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/login"
          element={
            <PrivateRoute>
              <Login />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Login />
            </PrivateRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <PrivateRoute>
              <Chats />
            </PrivateRoute>
          }
        />
        {/* <Route path="/temp" element={<Temp />} /> */}
        <Route
          path="/signup"
          element={
            <PrivateRoute>
              <Register />
            </PrivateRoute>
          }
        />
      </>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
