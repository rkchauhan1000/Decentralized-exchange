import rootReducer from './reducers'
import {createStore, applyMiddleware, compose} from 'redux'
import { createLogger} from 'redux-logger'

const loggerMiddleware = createLogger()
const middleware = []

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(preloadedState) {
	return createStore(
	rootReducer ,
	preloadedState , 
	composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
	)
}


//window._REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose