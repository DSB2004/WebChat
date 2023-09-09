
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyA1TuhgFF55jRQMpYDJLopIta_cGq0ZMzY",
  authDomain: "webchat-3e682.firebaseapp.com",
  projectId: "webchat-3e682",
  storageBucket: "webchat-3e682.appspot.com",
  messagingSenderId: "1076940642615",
  appId: "1:1076940642615:web:5912c1235d579aa14ae2b2",
  measurementId: "G-JH9YCKZD9Z"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export { auth, provider };