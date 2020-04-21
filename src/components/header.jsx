import React, { Component } from 'react';

class Header extends Component {
  constructor(props) {
    super(props);

    const messages = [
      'Fun with APIs',
      'Building the better mouse trap',
      'Josh\'s anglophilia is out of control',
      'Don\'t tell Limeade we made this',
      'What\'s in your Limeade?',
      'Limeade, from the comfort of your own home',
      'Dengue II: Dengue Harder',
      'Take a penny, leave a penny',
      'Because you\'re special',
      'Live great, die better',
      'Formed from many, now another one',
      'Scratching an itch you don\'t have',
      'That\'s swimming against the tides',
      'Leading a lion with a steak',
      'Cracking eggs with a hammer',
      'Pure delight',
      'More than just a taste',
      'See more, do more',
      'Take it to the limit',
      'Feel the magic',
      'New and improved',
      'Evolution. Revolution. Love.',
      'When life gives you Limeade, make Sting',
      'Don\'t call me Scorpion, call me Sting',
      'Double the pleasure, double the Sting',
      'If you like a lot of sting on your biscuit, join our club',
      'Prepare to want sting',
      'I\'ve got a need, a need for Sting',
      'Stingtastic!',
      'Silly Limeade, Sting is for me!',
      'Not just nearly Sting, but really Sting'
    ];

    this.state = {
      message: messages[Math.floor(Math.random() * messages.length)]
    };
  }

  render() {
    return (
      <header id="header">
        <img src="images/logo.svg" />
        <h1 className="title">Sting</h1>
        <h3>{this.state.message}</h3>
      </header>
    );
  }
}

export default Header;
