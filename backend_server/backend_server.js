class BackendServer extends HTMLElement {
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.pollInterval); // stop polling when component removed
  }
}
