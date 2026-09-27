import { useState } from 'react';
import { login, register } from '../api/auth.js';

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authenticate = isRegistering ? register : login;
      const user = await authenticate({ email, password });
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode() {
    setMode(isRegistering ? 'login' : 'register');
    setError('');
  }

  return (
    <section className="auth-panel todo-panel" aria-labelledby="auth-title">
      <p className="section-label">YOUR PERSONAL SPACE</p>
      <h2 id="auth-title">{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
      <p className="auth-description">
        {isRegistering ? 'Sign up to start organizing your day.' : 'Log in to see your tasks.'}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="auth-field">
          Password
          <input
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            minLength={isRegistering ? 8 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="request-error" role="alert">{error}</p>}
        <button className="add-button auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="auth-switch">
        {isRegistering ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" onClick={switchMode}>
          {isRegistering ? 'Log in' : 'Create an account'}
        </button>
      </p>
    </section>
  );
}

export default AuthForm;
