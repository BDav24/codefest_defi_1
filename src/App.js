/* global $, hljs */
import React, { Component } from 'react';
import Request from 'superagent';
import config from './.config.js';
import jsonApiMock from './components/test.json';
import * as Spinner from './Spinner';

import './App.css';

const mock = true;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSelected: false,
      json: {},
      finalJson: null
    }
  }

  formatJsonFromApi(json) {
    var splittedText = json.fullTextAnnotation.text.split('\n');
    var mergedText = [];
    var current = '';
    for (var i in splittedText) {
      var textChunk = splittedText[i];
      if (textChunk.match(/^[a-z\u00C0-\u017F]/g)) {
        current += ' ' + textChunk;
      } else {
        if (current.length > 0) mergedText.push(current);
        current = textChunk;
      }
    }
    return mergedText.map(function(chunk) {
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
    Spinner.start();
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
          Spinner.done();
          this.setState({ json: this.formatJsonFromApi(res.body.responses[0]) });
        })
      ;
    });
  };

  onValidate = (event) => {
    var json_formated = [];

    $('.sortable li').each(function(){
      var elem = {};
      elem.type = $(this).children('select').val();
      elem.text = $(this)[0].innerText;
      json_formated.push(elem);
    });
    this.setState({ finalJson: json_formated });
  };

  componentDidMount() {
    if (mock) {
      this.setState({ json: this.formatJsonFromApi(jsonApiMock) });
    }
  }

  componentDidUpdate() {
    $('.sortable').sortable();
    $('.sortable').disableSelection();
  }

  renderFinalJson() {
    const json: string = JSON.stringify(this.state.finalJson, null, 1);
    const html: string = hljs.highlight('json', json).value;
    return (
      <div className="final-json">
        <pre><code dangerouslySetInnerHTML={{__html: html}} /></pre>
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <div className="left">
          {mock && !this.state.imageSelected
            ? <img src="/img/Example_01_deux_colonnes.png" alt="Preview" className="preview-img" />
            : null
          }
          {this.state.imageSelected
            ? <img src={this.base64} alt="Preview" className="preview-img" />
            : null
          }
          {mock ? null : (
            <div>
              <label htmlFor="inputfile" className="file-upload">Upload your image</label>
              <input type="file" id="inputfile" onChange={this.onImageChanged} />
            </div>
          )}
        </div>
        <div className="right">
          {this.state.finalJson ? this.renderFinalJson() : (
            <div>
              <ul className="sortable">
                {Object.keys(this.state.json).map((key,i) =>
                  <li key={i} className="ui-state-default">
                    <span className="ui-icon ui-icon-arrowthick-2-n-s"></span>
                    {this.state.json[key].text}
                    <select onChange={this.onElementTypeChanged} defaultValue="p" data-element={i}>
                      <optgroup label="Titres">
                        <option value="h1">Titre de niveau 1</option>
                        <option value="h2">Titre de niveau 2</option>
                        <option value="h3">Titre de niveau 3</option>
                        <option value="h4">Titre de niveau 4</option>
                        <option value="h5">Titre de niveau 5</option>
                        <option value="h6">Titre de niveau 6</option>
                      </optgroup>
                      <option value="p">Paragraphe</option>
                    </select>
                  </li>
                )}
              </ul>
              <a className="validate" onClick={this.onValidate}>Valider</a>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
