import { Component } from 'react'
export class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="min-h-screen grid place-items-center p-6"><div className="glass-card p-8 rounded-2xl max-w-md"><h1 className="text-xl font-bold">Your workspace needs a refresh</h1><p className="mt-3 text-muted-foreground">We could not display this page. Your saved cloud data is still available.</p><button className="mt-5 underline" onClick={() => window.location.reload()}>Reload StudySync</button></div></main>
    return this.props.children
  }
}
