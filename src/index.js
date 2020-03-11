import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import parseResponse from "./ServerResponseParser";

fetch("http://127.0.0.1:5000/find_route")
    .then(response => response.json())
    .then(data => parseResponse(data))
    .then(data => 
ReactDOM.render(<App repo={data} chains={data.chains} />, document.getElementById('root'))
)

