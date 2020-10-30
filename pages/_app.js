import React from 'react';
import 'antd/dist/antd.css';
import '../styles/global.css';
import firebase from "firebase/app";
import "firebase/auth";

function MyApp({Component, pageProps}) {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCtRYj9pIvBH4WYxaUX3oEE_zE3mG3VLx4",
        authDomain: "archeun-notes.firebaseapp.com",
        databaseURL: "https://archeun-notes.firebaseio.com",
        projectId: "archeun-notes",
        storageBucket: "archeun-notes.appspot.com",
        messagingSenderId: "914280926964",
        appId: "1:914280926964:web:de9b22d7f8cc53c3db58a1"
    };
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    var provider = new firebase.auth.GoogleAuthProvider();

    return <Component {...pageProps} />
}

export default MyApp
