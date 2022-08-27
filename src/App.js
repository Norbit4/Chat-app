import './App.css';
import React, { Component } from 'react'
import Stompjs from 'stompjs'
import SockJS from 'sockjs-client';
import Login from './components/login';

var stompClient = null;
var adress = 'http://localhost:8080'

class App extends Component {

  state = {
    messages: [],
    message: '',
    username: '',
    roomUUID: '',
    logged: false,
    connected: false,
    status: 'waitting for connection...'
  }

  connectChecker(){
    setInterval(() =>{
      if(!stompClient.connected){
        this.onLogout()
         stompClient.connect({}, this.onConnected, this.onError)
      }
    }, 500)
  }

  //on page start
  componentDidMount(){
    var socket = new SockJS(`${adress}/ws`)
    //colorValue = this.getRandomColor()

    stompClient = Stompjs.over(socket)
    stompClient.connect({}, this.onConnected, this.onError)

    //this.connectChecker()
  }

  onConnected = () =>{
    console.log('connected!')
  }

  onError = (error) => {
    console.log(error)
  }

  subscribe(usernameValue){
    stompClient.subscribe(`/user/${usernameValue}/private`, this.onMessageListener)
  }

  onMessageListener = (payload) => {

    var response = JSON.parse(payload.body)

    switch(response.messageType){
      case 'READY':
        console.log("ready")  
        this.setState({
          roomUUID: response.roomUUID,
          connected: true
        });
        break
      case 'CHAT_MESSAGE':
        this.onMessage(response)
        break
      case 'DISCONNECT':
        console.log("disconnect") 
        break  
      default:
        this.onLogout()
        break 
    }
  }

  onMessage = (response) => {
    var userMessage = `${response.username}: ${response.message}`

    this.setState({
      messages: this.state.messages.concat(userMessage)
    })
    
  }

  // message
  onClick = () =>{

    var messageValue = this.state.message
    var usernameValue = this.state.username

    if(messageValue !== '' && usernameValue !== ''){
      var chatMessage = {
        username: usernameValue,
        message: messageValue,
        roomUUID: this.state.roomUUID
      };

      stompClient.send('/app/message', {}, JSON.stringify(chatMessage))

      this.setState({message: ''});
      const field = document.getElementById('messageInput');
      field.value = ''
    }
  }

  handleChange = (event) => {
    var messageValue = event.target.value

    this.setState({message: messageValue});
  }

  handleNickChange = (event) => {
    var usernameValue = event.target.value

    this.setState({username: usernameValue});
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getMessages(){
      return this.state.messages.map((message, index) => <li key={index} > {message} </li>).reverse()
  }

  //on click logout button
  onLogout = () => {
    
    this.setState({
      messages: [],
      logged: false,
      connected: false,
      username: ''
    })
  }

  //on click login button
  onLogin(usernameValue) {

    if(stompClient.connected){
      this.setState({
        logged: true,
        username: usernameValue
      })
      this.subscribe(usernameValue)

      var chatMessage = {
        username: usernameValue,
      }

      stompClient.send('/app/join', {}, JSON.stringify(chatMessage))
    }
  }

  render(){
    return (
      <div>

        {!this.state.logged && 
         <div className='loginContainer'>
          <Login login = {this.onLogin.bind(this)} logged = {this.state.logged}/>
        </div>
        }

        {this.state.logged && 
        <div>
          <div className='messagesContainer'>
            <ul>
              { 
              this.getMessages()
              }       
            </ul>
          </div>

          {!this.state.connected &&  this.state.logged  && <div className='infoBox'> {this.state.status}</div>}  

          <div className='chatboxContainer'>
            <form className='footer'>
              <input type='text' onChange= {this.handleChange} id='messageInput' className='input' placeholder='message' disabled={!this.state.connected}></input>
              <button type='button' onClick={this.onClick} id='messageButton' className='messageButton' disabled={!this.state.connected} > send </button>
            </form>

            <button type='button' onClick={this.onLogout} className='logoutButton'> log out </button>

            <button type='button' onClick={this.onLogout} className='nextButton'> next </button>
          </div>
        </div>
        }

      </div>
    );
  }
}
export default App;
