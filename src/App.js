import React from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';
import config from './config';

import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';

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
          {user ? <WorkoutList /> : <SignIn />}
        </section>
        <MuscleGroup />
        <Main />

      </div>
  );
}

class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      byType: [], //what type of exercise, paired, single, etc
      byFocus: [], //focus on upper or lower body
      byGroup : [], //muscle group

      templateMain : [],
      builtMain: []
    }
  }

  getStoredExerciseData = () => {
    let ref = database.ref('/Exercises/');
    return ref.on('value', (snapshot) =>{
      var json = snapshot.toJSON();
      var upper = "Paired.Upper"

      this.setState({byType : json["Paired"]}); //splice to get all of the exercises -- LODASH HINT HINT
      this.setState({byFocus : json["Paired"]["Upper"]});
      this.setState({byGroup : Object.keys(json["Paired"]["Upper"]["Chest"])});
      console.log(Object.keys(json["Paired"]["Upper"]["Chest"]["Bench"]));
      console.log(Object.keys(_.get(json, upper)));
    });
  }

  setExerciseData(json) {
    var types = Object.keys(json);
    var focuses = Object.keys(json["Paired"]["Upper"]["Chest"]);
    var groups = Object.keys(json["Paired"]["Upper"]["Chest"]);

  }


  getStoredTemplateData = () => {
    let ref = database.ref('/Templates/Power/'); //Add variables for selected template
    return ref.on('value', (snapshot) =>{
      var json = snapshot.toJSON();

      this.setState({templateMain : json["Main"]});
      this.buildWorkout();
    });
  }

  buildWorkout() {
    var temp = this.state.templateMain;
    var depth
    for(let entry in temp) {
      depth = this.setDepth(Object.keys(temp[entry]).length)
      console.log(depth);
    }
  }

  setDepth(size) {
    switch(size) {
      case 1: 
        return "type";
      case 2: 
        return "focus";
      case 3: 
        return "group";
      case 4: 
        return "exercise";
      default:
        return "type";
    }
  }

  componentDidMount() {
    this.getStoredExerciseData();
    this.getStoredTemplateData();
  }

  render(){
    return ( 
      <div className="Main">
      {this.state.byGroup}
      </div>
  );
}
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




function GetUpper(){
  var ref = database.ref('/Exercises');
  ref.once('value', gotData, errData);

  return ref.once('value').then((snapshot) =>{
  });
}

function gotData(data) {
  var exercises = data.val();
  var keys = Object.keys(exercises);
  //console.log(keys);
  //console.log(keys[0]);
  return exercises;
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
    return(
    <div>Blah
      <li name = "list"></li>
    </div>
    )
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
  
export default App;
