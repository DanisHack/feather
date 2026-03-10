import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (clerkKey) {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkKey}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  // Dev mode — no Clerk, skip auth entirely
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
