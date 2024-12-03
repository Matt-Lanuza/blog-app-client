import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { Notyf } from 'notyf';

export default function Login() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(false);
  const notyf = new Notyf();

  const navigate = useNavigate();

  useEffect(() => {
    if (email.includes('@') && email !== '' && password !== '' && password.length >= 8) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [email, password]);

  function authenticate(e) {
    e.preventDefault();

    fetch('https://blog-post-server.onrender.com/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Login data', data);
        console.log('Login data', data.access);

        if (data.access !== undefined) {
          localStorage.setItem('token', data.access);

          fetch('https://blog-post-server.onrender.com/users/details', {
            headers: {
              Authorization: `Bearer ${data.access}`,
            },
          })
            .then((res) => res.json())
            .then((userDetails) => {
              console.log('User details:', userDetails);
              console.log('User details:', userDetails.user.isAdmin);

              if (userDetails) {
                setUser({
                  id: userDetails.user._id,
                  username: userDetails.user.username,
                  isAdmin: userDetails.user.isAdmin
                });
              }

              notyf.success("You're now logged in!");
              setEmail('');
              setPassword('');

              navigate('/');
            });
        } else {
          notyf.error('Please double-check your credentials.');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        notyf.error('Something went wrong. Please try again.');
      });
  }


  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <div className="text-center mb-4">
            <h2>Login</h2>
          </div>
          <Form onSubmit={authenticate}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {isActive ? (
              <Button variant="primary" type="submit" id="loginBtn">
                Login
              </Button>
            ) : (
              <Button variant="danger" type="submit" id="loginBtn" disabled>
                Login
              </Button>
            )}
          </Form>
          <div className="text-center mt-3">
            <p>
              Don't have an account? <a href="/register">Register here</a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
