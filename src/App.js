import React from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';

import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { isCompositeComponent } from 'react-dom/test-utils';

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
const database = firebase.database();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Skrt</h1>
        <SignOut />
      </header>

      <section>
        {user ? <WorkoutList /> : <SignIn />}
      </section>
      <MuscleGroup />

    </div>
  );
}

{/* authentication begins */}
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  }
  
  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
    )
}  
function SignOut() {
    return auth.currentUser && (
      <button onClick={() => auth.signOut()}>Sign Out</button>
      )
}
{/* authentication ends */} 




function GetUpper(){
  var exercise;

  var ref = database.ref('Paired');
  ref.on('value', gotData, errData);
}

function gotData(data) {
  var exercises = data.val();
  var keys = Object.keys(exercises);
  console.log(keys);
}

function errData(err){
  console.log("error");
}

function CreateCheckBoxs(props){
  return(
    <div>
      <label  >
        <input name={props.value} type="checkbox" onClick={props.onClick}/>
      {props.value}
      </label>
      <br />  
    </div>
  );
}

class WorkoutList extends React.Component {
   render(){
     GetUpper();
    return(<div>Blah</div>)
  }
}

class MuscleGroup extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      checked : []
    }
  }
  
  renderCheckBoxs(prop){
    const muscles = prop
    const checkBoxItems = muscles.map((muscles) =>
      <CreateCheckBoxs 
        key={muscles} 
        value={muscles}
        onClick={() => this.handleCheckClick(muscles)}
        />    
    );
    return (
      <ul>
        {checkBoxItems}
      </ul>
    );
  }
  
  
  handleCheckClick(muscles){
    const index = this.state.checked.indexOf(muscles);
  
    if(index === -1)
    {
      this.setState({
        checked : this.state.checked.concat(muscles)
      });
    } else {
      const newChecked = this.state.checked.slice(0,index).concat(this.state.checked.slice(index+1, this.state.checked.length)) //remove the selected item
      this.setState({
        checked : newChecked
      });
    }
    
  }
  
    render(){
      const muscles = ['Chest','Back','Legs','Arms','Shoulders']
  
      return(
        <div>
          <Card>
            <Card.Body>
              <Card.Title>Muscle Focus</Card.Title>
              <form>
                {this.renderCheckBoxs(muscles)}
              </form>
            </Card.Body>
          </Card>
        </div>
      )
    }
}
  
function Exercise() {}

export default App;
