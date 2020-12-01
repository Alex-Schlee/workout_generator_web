import React from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBDHv9zvw_4nBmdzvkiq8fqK1cDZ7-qn1A",
  authDomain: "workoutgenerator-c3c8e.firebaseapp.com",
  databaseURL: "https://workoutgenerator-c3c8e.firebaseio.com",
  projectId: "workoutgenerator-c3c8e",
  storageBucket: "workoutgenerator-c3c8e.appspot.com",
  messagingSenderId: "131719223079",
  appId: "1:131719223079:web:556aed79c8b05641197b02",
  measurementId: "G-63X20TZEVP"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Skrt</h1>
        {/* <BuildWorkout/> */}
      </header>

      <section>
        {user ? <WorkoutList /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithGoogle(provider);
  }

  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.curentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function WorkoutList() {}

function Exercise() {}

export default App;