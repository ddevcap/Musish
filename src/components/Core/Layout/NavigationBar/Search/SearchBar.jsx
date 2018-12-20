import React from 'react';
import classes from "./SearchBar.scss";
import cx from 'classnames';
import withMK from "../../../../../hoc/withMK";
import Loader from "../../../../common/Loader";
import SongResultItem from "./SongResultItem";
import AlbumResultItem from "./AlbumResultItem";
import ArtistResultItem from "./ArtistResultItem";

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showResults: false,
      query: '',
      catalogData: null,
      libraryData: null,
    };

    this.handleShowResults = this.handleShowResults.bind(this);
    this.handleHideResults = this.handleHideResults.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleShowResults() {
    this.setState({
      showResults: true,
    })
  }

  handleHideResults() {
    this.setState({
      showResults: false,
    })
  }

  async handleSearch({target: {value: query}}) {
    this.setState({
      query
    });

    query = query.replace(' ', '+');

    await this.search(query)
  }

  async search(query) {
    if(query.length === 0) {
      this.setState({
        catalogData: null,
        libraryData: null,
      });
      return;
    }

    this.setState({
      loading: true,
    });

    await Promise.all([
      this.searchCatalog(query),
      this.searchLibrary(query)
    ]);

    this.setState({
      loading: false,
    });
  }

  async searchCatalog(query) {
    this.setState({
      catalogData: null,
    });

    const catalogData = await this.props.mk.instance.api.search(query, {
      types: ['albums', 'songs', 'playlists', 'artists'],
      limit: 3,
    });

    this.setState({
      catalogData
    });
  }

  async searchLibrary(query) {
    this.setState({
      libraryData: null,
    });

    const libraryData = await this.props.mk.instance.api.library.search(query, {
      types: ['library-albums', 'library-songs', 'library-playlists', 'library-artists'],
      limit: 3,
    });

    this.setState({
      libraryData
    });
  }

  getItems(type) {
    let songs = [];

    const {catalogData, libraryData} = this.state;

    if (libraryData && libraryData[`library-${type}`]) {
      songs = [...songs, ...libraryData[`library-${type}`].data];
    }

    if (catalogData && catalogData[type]) {
      songs = [...songs, ...catalogData[type].data];
    }

    return songs;
  }

  renderResults(label, type, rowRenderer) {
    const songs = this.getItems(type);

    if (!songs || songs.length === 0) {
      return null;
    }

    return (
      <div className={classes.section}>
        <div className={classes.title}>
          {label}
        </div>

        {songs.map(rowRenderer)}

        {this.state.loading && <Loader/>}
      </div>
    )
  }

  render() {
    const {query, showResults} = this.state;

    return (
      <div className={cx(classes.navSearch, {[classes.active]: showResults})}>
        <div className={classes.navSearchWrapper}>
          <input type="text"
                 placeholder="Search music"
                 value={query}
                 onChange={this.handleSearch}
                 onFocus={this.handleShowResults}
                 onBlur={this.handleHideResults}/>

          <div className={classes.results}>
            {this.renderResults('Songs', 'songs', (song) => (
              <SongResultItem key={song.id} song={song} />
            ))}
            {this.renderResults('Albums', 'albums', (album) => (
              <AlbumResultItem key={album.id} album={album} size={30} />
            ))}
            {this.renderResults('Artists', 'artists', (artist) => (
              <ArtistResultItem key={artist.id} artist={artist}/>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

export default withMK(SearchBar);