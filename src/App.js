import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TripPlanner from './pages/TripPlanner';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthWrapper from './components/AuthWrapper';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <div className="App">
            <AuthWrapper>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/trip-planner" element={<TripPlanner />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </Layout>
            </AuthWrapper>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}