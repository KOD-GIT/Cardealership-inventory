import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; onError: () => void }

/** Keeps a failed WebGL scene from taking the whole card (or page) down; the parked image stays. */
export class SceneErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
