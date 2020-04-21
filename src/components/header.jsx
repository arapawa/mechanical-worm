import React, { Component } from 'react';

class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header id="header">
        <img src="images/logo.svg" />
        <h1 className="title">Mechanical Worm</h1>
        <h3>We are all naught but worms before the Destroyer.</h3>
      </header>
    );
  }
}

export default Header;
