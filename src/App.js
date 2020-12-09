import React from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';
import config from './config';

import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';

import {useAuthState} from 'react-firebase-hooks/auth';

firebase.initializeApp(config);

const auth = firebase.auth();
const database = firebase.database();

const _ = require('lodash');

function App() {

  const [user] = useAuthState(auth);

  return (
      <div className="App">
        <header>
          <h1>Skrt</h1>
          <SignOut />
        </header>

        <section>
          {user ? <Main /> : <SignIn />}
        </section>

      </div>
  );
}

class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      exercises: [], //what type of exercise, paired, single, etc

      templateMain : [],
      builtMain: []
    }
  }

  getStoredExerciseData = () => {
    let ref = database.ref('/Exercises/');
    return ref.on('value', (snapshot) =>{
      this.setState({exercises : snapshot.toJSON()}); //splice to get all of the exercises -- LODASH HINT HINT
    });
  }


  getStoredTemplateData = () => {
    let ref = database.ref('/Templates/Power/'); //Add variables for selected template
    return ref.on('value', (snapshot) =>{
      var json = snapshot.toJSON();

      this.setState({templateMain : json["Main"]});
      this.buildWorkout();
    });
  }

  componentDidMount() {
    this.getStoredExerciseData();
    this.getStoredTemplateData();
  }

  buildWorkout() {
    var workoutArray = [];
    for(let entry in this.state.templateMain) {
      //get all possible execises based on the templates depth level
      var exerciseArray = this.getAllSubExercises(_.get(this.state.exercises, this.setDepth(this.state.templateMain[entry])));
      //filter out exercises already used
      exerciseArray = this.filterUsedExercises(exerciseArray, workoutArray);

      workoutArray = workoutArray.concat(this.getObjectExercises(exerciseArray[Math.floor(Math.random() * exerciseArray.length)]));
    }
    this.setState({builtMain : workoutArray})
    console.log(workoutArray);
  }

  getAllSubExercises(jsonTree){
    var allExercises = [];
    for(var key in jsonTree){
        if(!jsonTree.hasOwnProperty("ExerciseName"))
        {
          allExercises = allExercises.concat(this.getAllSubExercises(jsonTree[key]));
        } else {
          return jsonTree;
        }
      }
    return allExercises;
  }

  setDepth(entry) {
    switch(Object.keys(entry).length) {
      case 1: 
        return entry.type;
      case 2: 
        return entry.type + "." + entry.focus;
      case 3: 
        return entry.type + "." + entry.focus + "." + entry.group;
      case 4: 
        return entry.type + "." + entry.focus + "." + entry.group + "." + entry.exercise;
      default:
        return "type";
    }
  }

  filterUsedExercises(exerciseArray, workoutArray){
    var filteredExercises = [];
    for(var key in exerciseArray){
      var dupe = false;
      //As much as I hate nested loops this must stay, unless I can find a method to search objects with properties equaling specific values
      for(var val in _.values(exerciseArray[key])){
        if(workoutArray.indexOf(_.values(exerciseArray[key])[val]) !== -1)
          dupe = true;
      }

      if(dupe === false)
        filteredExercises.push(exerciseArray[key]);
    }
    return filteredExercises
  }

  getObjectExercises(object){
    var exercises = [];
    for(var key in object)
    {
      if(object[key] !== "")
        exercises.push(object[key]);
    }
    return exercises;
  }

  render(){
    return ( 
      <div className="Main">
        <WorkoutList workout={this.state.builtMain} />
      </div>
  );
}
}

function WorkoutList(props){
  const workout = props.workout;
  const listItems = workout.map((exercise) =>
    <li key={exercise}>
      <Accordion defaultActiveKey="0">
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
            {exercise}
            </Accordion.Toggle>
          </Card.Header>
        </Card>
      </Accordion>
    </li>
  );
  return(
    <ul>{listItems}</ul>
  );
}


/* authentication begins */
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
/* authentication ends */

export default App;
