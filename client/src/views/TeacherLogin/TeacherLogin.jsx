import { message } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import { postUser, setUserSession } from '../../Utils/AuthRequests';
import './TeacherLogin.less';
import axios from 'axios';


// Additions
import { jwtDecode } from 'jwt-decode';

const useFormInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };
  return {
    value,
    onChange: handleChange,
  };
};

export default function TeacherLogin() {
  const [email, setEmail] = useState(''); // Changed to useState to have both normal and
  const [password, setPassword] = useState(''); // Google sign in options
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Define a client ID for Google Identity services
  const CLIENT_ID = "843146054096-pcjn6j6i1h9inpm58bre3c6rssb870fl.apps.googleusercontent.com";

  // Normal login
  const handleLogin = () => {
    setLoading(true);
    let body = { identifier: email, password: password }; // Removed ".value"

    // Signs in user using provided email and password (Non-Google Sign In)
    postUser(body)
      .then((response) => { // If user exists then redirect to corresponding role dashboard
        setUserSession(response.data.jwt, JSON.stringify(response.data.user));
        setLoading(false);
        if (response.data.user.role.name === 'Content Creator') {
          navigate('/ccdashboard');
        } else if (response.data.user.role.name === 'Researcher') {
          navigate('/report');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((error) => { // If user does not exist or information was incorrect
        setLoading(false);
        message.error('Login failed. Please input a valid email and password.');

        // Clear input fields
        setEmail('');
        setPassword('');
      });
  };

  const handleGoogleLogin = (res) => {
    const userObject = jwtDecode(res.credential); // Get user info for login
  
    // Set GoogleID with returned token val
    // NOTE: Google specifies that the Google userID should be the ONLY identifer
    let body = { GoogleID: userObject.sub };
    
    // Signs in user using Google Sign In services
    postUser(body)
      .then((response) => { // If user exists then redirect to corresponding role dashboard
        setUserSession(response.data.jwt, JSON.stringify(response.data.user)); 
        setLoading(false);

        // Navigate based on the user's role
        if (userObject.role.name === 'Content Creator') {
          navigate('/ccdashboard');
        } else if (userObject.role.name === 'Researcher') {
          navigate('/report');
        } else {
          navigate('/dashboard');
        }
      }
    )
    .catch(error => {
      console.error('Token verification failed:', error);
      setLoading(false);
      message.error('Google login failed.');
    });
};



  // Init google client and render button on page load
  useEffect(() => {
    /* global google */ // Linter declaration
    google.accounts.id.initialize({
      client_id: "843146054096-pcjn6j6i1h9inpm58bre3c6rssb870fl.apps.googleusercontent.com",
      callback: handleGoogleLogin // Callback for users using Google sign in
    });

    // Renders button to direct user to Google
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "filled_blue",
        size: "large",
        text: "Sign In With Google"
      });

  }, []);

  // Sign in text and Google Button
  const CenterGoogleBtn = {
    display: 'flex',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    height: '5vh', // Adjust to your preferred height
  };

  const SignInWGoogleText = {
    color: 'white'
  }

  return (
    <div className='container nav-padding'>
      <NavBar />
      <div id='content-wrapper'>
        <form
          id='box'
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
        >
          <div id='box-title'>User Login</div>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
            autoComplete='username'
          />
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            autoComplete='current-password'
          />
          <p id='forgot-password' onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </p>
          <input
            type='button'
            value={loading ? 'Loading...' : 'Login'}
            onClick={handleLogin}
            disabled={loading}
          />
        </form>
      </div>

      {/* Shows Sign In W Google Button */}
      <h2 style={SignInWGoogleText}>Sign in with Google:</h2>
      <div id="signInDiv" style={CenterGoogleBtn}></div>
    </div>
  );
}
