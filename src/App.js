import "./App.css";
import React from "react";
import { useState, useRef } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
firebase.initializeApp({
  //  configuration setting
  apiKey: "AIzaSyCMfvD7MbftSeSntrxz8fY7b6_5la1KHQk",
  authDomain: "my-chat-app-88c52.firebaseapp.com",
  projectId: "my-chat-app-88c52",
  databaseURL: "https:/my-chat-app-88c52.firebaseio.com",
  storageBucket: "my-chat-app-88c52.appspot.com",
  messagingSenderId: "618526373323",
  appId: "1:618526373323:web:1548cc57dc991d6fa4324e",
  measurementId: "G-9XVEBWYTZJ",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Discusion Bot</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}
function SignIn() {
  const signInwithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <>
      <button className="sign-in" onClick={signInwithGoogle}>
        Sign In with Google
      </button>
      <p>
        Lets connect to talk and discuss the course related material. #
        ClearDoubts
      </p>
    </>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(1000);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formvalue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messageRef.add({
      text: formvalue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      console.error("dummy.current is undefined or null.");
    }
  };
  return (
    <>
      {messages &&
        messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      <form onSubmit={sendMessage}>
        <input
          value={formvalue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="type your message"
        />
        <button type="submit" disabled={!formvalue}>
          Go
        </button>
      </form>
    </>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  // sent and received message separation
  const messageClass = uid === auth.currentUser.uid ? "sent" : "receive";
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
