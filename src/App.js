import React,{Component} from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import app from 'firebase/app';
import Layout from './components/layout'

class App extends Component {

  constructor(){
    super();

  }
  render(){
  return (
      <Layout title="Chat APp baby"></Layout>
  );
  }
}

export default App;
