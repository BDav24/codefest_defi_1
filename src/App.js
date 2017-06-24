import React, { Component } from 'react';
import Request from 'superagent';
import config from './.config.js';
import jsonApiMock from './components/test.json';

import './App.css';

const mock = true;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      imageSelected: false,
      json: {}
    }
  }

  formatJsonFromApi(json) {
    return json.fullTextAnnotation.text.split('\n').map(function(chunk) {
      return {
        type: 'p',
        text: chunk
      }
    });
  }

  encodeImageFileAsURL(callback) {
    var element = document.getElementById('inputfile');
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  }

  onImageChanged = (data) => {
    this.encodeImageFileAsURL((base64) => {
      this.base64 = base64;
      this.setState({ imageSelected: true });
      Request
        .post(`https://vision.googleapis.com/v1/images:annotate?key=${config.gkey}`)
        .send({
          requests: [{
            image: { content: base64.replace('data:image/png;base64,', '') },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
          }]
        })
        .end((error, res) => {
          this.setState({ loading: false, json: this.formatJsonFromApi(res.body.responses[0]) });
        })
      ;
    });
  };

  componentDidMount() {
    if (mock) {
      this.setState({ loading: false, json: this.formatJsonFromApi(jsonApiMock) });
    } else {
      this.setState({ loading: false });
    }
  }

  componentDidUpdate() {
    window.$('.sortable').sortable();
    window.$('.sortable').disableSelection();
  }

  render() {
    return (
      <div className="App">
        {mock
          ? <img src="/img/Example_01_deux_colonnes.png" alt="Preview" className="preview-img" />
          : this.state.imageSelected
            ? <img src={this.base64} alt="Preview" className="preview-img" />
            : <input type="file" id="inputfile" onChange={this.onImageChanged} />
        }
        <ul className="sortable">
          {Object.keys(this.state.json).map((key,i) =>
            <li key={i} className="ui-state-default">
              <span className="ui-icon ui-icon-arrowthick-2-n-s"></span> {this.state.json[key].text}
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default App;
