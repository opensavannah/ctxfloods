import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';

import { logError } from 'services/logger';
import 'scss/auth.css';

class LoginPage extends Component {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
  };

  state = {
    redirectToReferrer: false,
    email: '',
    password: '',
    errorHappened: false
  };

  handleEmailChange = e => {
    this.setState({ email: e.target.value });
  };

  handlePasswordChange = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    var email = this.state.email.trim().toLowerCase();
    var password = this.state.password.trim();

    this.props
      .mutate({
        variables: { email: email, password: password },
      })
      .then(({ data }) => {
        this.setState({errorHappened: false});
        localStorage.setItem('jwt_user_token', data.authenticate.jwtToken);
        this.props.onLogin();
      })
      .catch(error => {
        logError(error);
        this.setState({errorHappened: true});
      });
  };

  render() {
    return (
      <div className="AuthPage">
        <div className="Auth__form-controls">
          <h1> Log in to the CTXfloods Dashboard </h1>
          {this.state.errorHappened && (
            <div className="Auth__error-text">
            Authentication Failed
            </div>
          )}
          <form onSubmit={this.handleSubmit}>
            <input
              type="email"
              value={this.state.email}
              placeholder="Email"
              onChange={this.handleEmailChange}
            />
            <input
              type="password"
              value={this.state.password}
              placeholder="Password"
              onChange={this.handlePasswordChange}
            />
            <input type="submit" className="Auth__submit" />
          </form>
        </div>
        <Link to="/dashboard/forgot_password">Forgot Password?</Link>
      </div>
    );
  }
}

const logInUser = gql`
  mutation($email: String!, $password: String!) {
    authenticate(input: { email: $email, password: $password }) {
      jwtToken
    }
  }
`;

export default graphql(logInUser)(LoginPage);
