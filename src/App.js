import React, { Component } from 'react';
import CodeFest from "./components/CodeFest/CodeFest"

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    this.setState({ loading: false })
  }

  render() {
    return (
      <div className="App" style={{ width: '100%', textAlign: 'center' }}>
        <img src="/img/Example_01_deux_colonnes.png" alt="" style={{ width: '60%' }} />
      </div>
    );
  }
}

export default App;
