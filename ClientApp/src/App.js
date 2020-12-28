import React, { Component } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import { Test } from './components/Test';
import { Game } from './components/Game';
import { Switch, BrowserRouter, Route } from 'react-router-dom';

export default class App extends Component {
  displayName = App.name

  render() {
      return (
          <div>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous" />
              <Route path='/' exact component={Test}>
            </Route>
              <Route path='/game/:id' exact component={Game} >
         
            </Route>
        </div>
    );
  }
}
