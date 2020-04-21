import React, { Component } from 'react';

/* globals $ */
class Tile extends Component {
  openTile(tile) {
    $('#tileModal').modal();
    $('#tileModalBody').html(`
      <img class="tile-image" src=${tile.MediumImageSrc} />
      <h3 class="my-3">${tile.Title}</h3>
      <div>${tile.ShortDescription}</div>
      <div>${tile.HtmlDescription}</div>
    `);
  }

  render() {
    const tile = this.props.tile;
    return (
      <div className="tile" onClick={() => this.openTile(tile)}>
        <img className="tile-image" src={tile.SmallImageSrc} />
        <div className="tile-title">{tile.Title}</div>
        <div className="tile-details">
          <span className="reward-points-num">{tile.Reward.Value}</span>
          <small><abbr> pts</abbr></small>
        </div>
      </div>
    );
  }
}

export default Tile;
