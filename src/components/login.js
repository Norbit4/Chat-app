import './login.css'

var username = ''

//on login click
var loginButtonClick = (props) =>{
    if(username !==''){
        props.login(username)
        username = ''
        
    }
}

//on imput change
var handleNickChange = (event) =>{

    username = event.target.value
    
}

function Login(props){
    return(
            <form className='loginForm'>
                <input type='text' className='input'  onChange= {handleNickChange} placeholder='username'></input>
                <button type='button' className='loginButton' onClick={() => loginButtonClick(props)}> join </button>   
            </form>

    )
}

export default Login;