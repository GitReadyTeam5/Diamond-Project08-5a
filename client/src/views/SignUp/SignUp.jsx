import { message } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import { postUser, setUserSession } from '../../Utils/AuthRequests';
import { jwtDecode } from 'jwt-decode';
import { getPublicRequestModule } from '../../../../test/integration/request';
import axios from 'axios';

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

const createUser = (firstName, lastName) => {
  const UserData = {
    first_name: firstName,
    last_name: lastName,
}};

//   fetch('/auth/local/register', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(mentorData),
//   })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       } else {
//         throw new Error('Failed to create a new User');
//       }
//     })
//     .then((data) => {
//       console.log('User created successfully:', data);
//     })
//     .catch((error) => {
//       console.error('Error creating a new User', error);
//     });
// };


//console.log(response);

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    let body = { identifier: email, password: password };

    postUser(body)
      .then((response) => {
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
      .catch((error) => {
        setLoading(false);
        message.error('Login failed. Please input a valid email and password.');
      });
  };

  const handleGoogleLogin = (res) => {
    console.log("Encoded JWT Token: " + res.credential)
    const userObject = jwtDecode(res.credential);
    console.log(userObject);
    
    const firstName = userObject.given_name;
    const lastName = userObject.family_name;
    
    createUser(firstName, lastName);
    
    setEmail(userObject.email);

    let body = { identifier: email };
    
    postUser(body)
      .then((response) => {
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
      .catch((error) => {
        setLoading(false);
        message.error('Login failed. Please input a valid email and password.');
      });
  };

// const publicRequest= getPublicRequestModule();
// axios.post('http://localhost:1337/auth/local/register', {
//   // headers: {
//   //        Authorization:res.credential
//   //      },
//   username: 'Shreya',
//   email: 'tu@mail.com',
//   password: '123456',
// });
  
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "843146054096-pcjn6j6i1h9inpm58bre3c6rssb870fl.apps.googleusercontent.com",
      callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "filled_blue",
        size: "large",
        text: "Continue With Google"
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
    <>
      <div className='container nav-padding'>
        <NavBar />
        <div id='content-wrapper'>
          <form
            id='box'
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleLogin();
            }}
          >
            <div id='box-title'>Sign Up</div>
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
              value={loading ? 'Loading...' : 'Create Account'} 
              onClick={handleLogin}
              disabled={loading}
            />
          </form>
        </div>

      {/* Show Sign In W Google Button */}
      <h2 style={SignInWGoogleText}>Continue with Google:</h2>
      <div id="signInDiv" style={CenterGoogleBtn}></div>
      </div>
    </>
  );
}
