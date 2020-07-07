import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import configureStore from './store/configureStore'
import 'bootstrap/dist/css/bootstrap.css';
import * as serviceWorker from './serviceWorker';


ReactDOM.render(
	<Provider store={configureStore()}>
	 <App />
	</Provider>,
    document.getElementById('root')
);

serviceWorker.unregister();
 