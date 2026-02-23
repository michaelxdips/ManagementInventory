import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './theme';
import './styles.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found');
}

createRoot(rootElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ThemeProvider>
					<ToastProvider>
						<App />
					</ToastProvider>
				</ThemeProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
