import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section">
          <div className="container">
            <h2>Algo deu errado</h2>
            <p>Ocorreu um erro inesperado. Recarregue a pagina para tentar novamente.</p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => window.location.reload()}
            >
              Recarregar pagina
            </button>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
