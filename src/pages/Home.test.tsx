import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from './Home';

describe('Home Component', () => {
  it('renders the application title', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if the title CareManager is rendered
    expect(screen.getByText('CareManager')).toBeInTheDocument();
  });
  
  it('renders the Sign In / Register button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const signInButton = screen.getByText('Sign In / Register');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton.getAttribute('href')).toBe('/login');
  });
});
