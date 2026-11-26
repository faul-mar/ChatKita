import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { AppProvider, useApp } from './context/AppContext';
import AuthScreen from './pages/AuthScreen';
import ChatApp from './pages/ChatApp';

function App() { const { token } = useApp(); return token ? <ChatApp/> : <AuthScreen/>; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AppProvider><App /></AppProvider></React.StrictMode>);
