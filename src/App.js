import React from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';
import config from './config';

import 'bootstrap/dist/css/bootstrap.min.css';

import {useAuthState} from 'react-firebase-hooks/auth';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';

firebase.initializeApp(config);

const auth = firebase.auth();
const database = firebase.database();

const _ = require('lodash');

function App() {

  const [user] = useAuthState(auth);

  return (
      <div className="App">
        <header>
          <Container>
            <Row>
              <Col></Col>

              <Col xs={6}>
                <h1>Rando WOG V1</h1>
              </Col>

              <Col>
                <SignOut />
              </Col>
            </Row>
          </Container>
        </header>

        <Container>
          <Row>
            <Col></Col>

            <Col xs={6}>
              <Card>
                <Card.Body>
                  <section>
                    {user ? <Main /> : <SignIn />}
                  </section> 
                </Card.Body>
              </Card>
            </Col>

            <Col></Col>
          </Row>

        </Container>
      </div>
  );
}

class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      exercises: [], //what type of exercise, paired, single, etc
      listTemplates: [],
      selectedTemplate: "Select Template",
      templateMain : [],
      builtMain: []
    }
  }

  handleTemplateSelectionClick(template){
    this.setState({selectedTemplate: template});
    this.getStoredTemplateData(template);
    //this.buildWorkout();
  }

  //Database Start
  getStoredExerciseData = () => {
    let ref = database.ref('/Exercises/');
    return ref.on('value', (snapshot) =>{
      this.setState({exercises : snapshot.toJSON()}); //splice to get all of the exercises -- LODASH HINT HINT
    });
  }

  getStoredTemplateData = (template) => {
    let ref = database.ref('/Templates/' + template); //Add variables for selected template
    return ref.once('value').then((snapshot) =>{
      var json = snapshot.toJSON();

      this.setState({templateMain : json["Main"]});
    });
  }

  getStoredListTemplatesData = () => {
    let ref = database.ref('/ListTemplates');
    return ref.on('value', (snapshot) =>{
      this.setState({listTemplates: Object.keys(snapshot.toJSON())});
    })
  }

  componentDidMount() {
    this.getStoredExerciseData();
    this.getStoredListTemplatesData();
  }
  //Database Ends

  //Workout Business Logic Start
  buildWorkout() {
    var workoutArray = [];
    for(let entry in this.state.templateMain) {
      //console.log(this.state.templateMain[entry]);
      //get all possible exercises based on the templates depth level
      var exerciseArray = this.getAllSubExercises(_.get(this.state.exercises, this.setDepth(this.state.templateMain[entry])));
      //filter out exercises already used
      exerciseArray = this.filterUsedExercises(exerciseArray, workoutArray);
      workoutArray.push(exerciseArray[Math.floor(Math.random() * exerciseArray.length)]);
    }
    this.setState({builtMain : this.convertToArray(this.orderByWeight(workoutArray))})
    console.log(this.orderByWeight(workoutArray));
  }

  convertToArray(workoutArray){
    var convertedArray = [];
    for(var key in workoutArray)
    {
      convertedArray.push(workoutArray[key].ExerciseName);
    }
    return convertedArray
  }

  orderByWeight(ExerciseList){
    var i = 1;    


    while(i < ExerciseList.length)
    {
      var val = ExerciseList[i];
      var j = i-1;
      while(j >= 0 && ExerciseList[j].Weight > val.Weight)
      {

        ExerciseList[j+1] = ExerciseList[j];
        j = j-1;
      }
      ExerciseList[j+1] = val;
      i = i+1;
    }
    return(ExerciseList);
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
    if(entry.group === "")
      return entry.focus;
    else if(entry.exercise === "")
      return entry.focus + "." + entry.group;
    else
      return entry.focus + "." + entry.group + "." + entry.exercise;
  }

  filterUsedExercises(exerciseArray, workoutArray){
    var filteredExercises = [];
    for(var i in exerciseArray){
      var dupe = false;
      //As much as I hate nested loops this must stay, unless I can find a method to search objects with properties equaling specific values
      for(var j in workoutArray)
      {  
        if(workoutArray[j] !== undefined && workoutArray[j].ExerciseName.indexOf(exerciseArray[i].ExerciseName) !== -1)
        dupe = true;
      }
      
      if(dupe === false)
        filteredExercises.push(exerciseArray[i]);
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
  //Workout Business Logic Ends

  render(){
    return ( 
      <div className="Main">
        <Configurations 
          exercises={this.state.exercises} 
          selectedTemplate={this.state.selectedTemplate} 
          listTemplates={this.state.listTemplates} 
          onClick={template => this.handleTemplateSelectionClick(template)}
          onBuildWorkoutClick={ () => this.buildWorkout()}
          />
        <WorkoutList workout={this.state.builtMain} />
      </div>
  );
}
}

function WorkoutList(props){
  const workout = props.workout;
  const listItems = workout.map((exercise) =>
    <ListGroup.Item key={exercise}>
      <Card.Title>{exercise}</Card.Title>
    </ListGroup.Item>
  );
  return(
    <ListGroup>{listItems}</ListGroup>
  );
}

class Configurations extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    } 
  }

  renderDropdownList(list){
    const templates = list;
    const dropdownItems = templates.map((item) =>
      <Dropdown.Item key={item} onClick={() => this.props.onClick(item)}>
        {item}
      </Dropdown.Item>
    );
    return(

              <Dropdown.Menu>
                {dropdownItems}
              </Dropdown.Menu>

    )
  }

  render(){
    return(
    <Card.Text>
      <Row>
        <Col>
          <Dropdown>
            <Dropdown.Toggle id="dropdown-template-button">{this.props.selectedTemplate}</Dropdown.Toggle>
            {this.renderDropdownList(this.props.listTemplates)}
          </Dropdown>
        </Col>

        <Col>
        </Col>

        <Col>
          <Button onClick={() => this.props.onBuildWorkoutClick()}>Build Workout</Button>
        </Col>
      </Row>
    </Card.Text>
    )
  }
}







/* authentication begins */
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  }
  return(
    <Button onClick={signInWithGoogle}>Sign in with Google</Button>
    )
}  

function SignOut() {
    return auth.currentUser && (
      <Button onClick={() => auth.signOut()}>Sign Out</Button>
      )
}
/* authentication ends */

export default App;
