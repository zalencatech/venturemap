import { Component } from "react";
import { supportsWebGL } from "../scroll.js";

// If WebGL is missing or a 3D scene crashes, show the fallback and keep the rest of the site working.
export default class WebGLBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed || !supportsWebGL()) return this.props.fallback ?? null;
    return this.props.children;
  }
}
