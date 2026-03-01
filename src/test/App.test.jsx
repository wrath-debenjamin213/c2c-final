import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - C2C Platform', () => {

    it('renders the login view by default because the app is gated', () => {
        render(<App />);
        expect(screen.getByText('Welcome to C2C')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('builder@example.com')).toBeInTheDocument();
    });

    it('logs in and displays the dashboard with global UI', () => {
        render(<App />);

        // Simulate Login (we mock authentication for the prototype)
        const emailInput = screen.getByPlaceholderText('builder@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const signInButton = screen.getByText('Sign In');

        fireEvent.change(emailInput, { target: { value: 'user@c2c.app' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(signInButton);

        // Should now be on Dashboard
        expect(screen.getByText('Welcome to C2C. Select an option from the sidebar to get started.')).toBeInTheDocument();
        expect(screen.getByText('Good evening, Builder')).toBeInTheDocument();

        // Search bar should be present
        expect(screen.getByPlaceholderText('Search ideas...')).toBeInTheDocument();
    });
});
