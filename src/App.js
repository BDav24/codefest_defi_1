/* global $, Cropper, hljs */
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
      if (textChunk.match(/^[a-z\u00C0-\u017F]/g)) { // a-z + accents
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

  initCropper = () => {
    var image = $('.preview-img')[0];
    new Cropper(image, {
      movable: false,
      zoomable: false,
      autoCrop: false,
      background: false,
      crop: function(e) {
        console.log(e.detail.x);
        console.log(e.detail.y);
        console.log(e.detail.width);
        console.log(e.detail.height);
        console.log(e.detail.rotate);
        console.log(e.detail.scaleX);
        console.log(e.detail.scaleY);
      }
    });
  };

  onImageChanged = (data) => {
    Spinner.start();
    this.encodeImageFileAsURL((base64) => {
      this.base64 = base64;
      this.setState({ imageSelected: true });
      this.initCropper();
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
      this.initCropper();
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
        {mock || this.state.imageSelected ? null : (
          <div className="welcome">
            <div>
              <div className="left">
                <h1>Welcome on UpScribers!</h1>
                This project is aiming to help disable people around the world to access texbooks
                content.
                <br /><br />
                This tool will help in three steps:
                <ol>
                  <li>Extract text and graphics from an image</li>
                  <li>Edit the document</li>
                  <li>Share it</li>
                </ol>
                <br /><br />
                <h2>First step:</h2>
                {mock ? null : (
                  <div>
                    <label htmlFor="inputfile" className="file-upload">Upload your image</label>
                    <input type="file" id="inputfile" onChange={this.onImageChanged} />
                  </div>
                )}
              </div>
              <div className="right">
                <h2>Text analysis preview:</h2>
                <img src="/img/example.png" alt="Example" className="example" />
              </div>
            </div>
          </div>
        )}
        <div className="left">
          {mock && !this.state.imageSelected
            ? <img src="/img/Example_01_deux_colonnes.png" alt="Preview" className="preview-img" />
            : null
          }
          {this.state.imageSelected
            ? <div><img src={this.base64} alt="Preview" className="preview-img" /></div>
            : null
          }
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
              {Object.keys(this.state.json).length > 0
                ? <a className="validate" onClick={this.onValidate}>Valider</a>
                : null
              }
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
