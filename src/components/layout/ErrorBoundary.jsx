import { Component } from 'react';

/** Shows `fallback` instead of crashing the whole site when a page fails to render or load. */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

export default ErrorBoundary;
