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

  /*onElementTypeChanged = (event) => {
  	console.log(event.target.value, window.$(event.target).data('element'));


  };*/

  onValidate = (event) => {
  	var json_formated = [];

  	window.$('.sortable li').each(function(){
		var elem = {};
		elem.type = window.$(this).children('select').val();
		elem.text = window.$(this)[0].innerText;
		console.log(elem);
		json_formated.push(elem);
	});
  	console.log(json_formated);
  };

  componentDidMount() {
  	if (mock) {
      this.setState({ json: this.formatJsonFromApi(jsonApiMock) });
    }
  }

  componentDidUpdate() {
    window.$('.sortable').sortable();
    window.$('.sortable').disableSelection();
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
		  <button onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    );
  }
}

export default App;
