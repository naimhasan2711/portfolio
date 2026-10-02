import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  failed: boolean
}

/** Renders `fallback` if anything inside throws (e.g. a WebGL context failure). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('Rendering fell back:', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
