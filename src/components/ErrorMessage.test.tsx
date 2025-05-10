import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Component', () => {
  test('debe renderizar el mensaje de error correctamente', () => {
    const testMessage = 'Este es un mensaje de error de prueba.';
    render(<ErrorMessage message={testMessage} />);

    // Verifica que el texto "Error:" esté presente
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    
    // Verifica que el mensaje de prueba esté presente
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  test('debe tener el rol ARIA "alert"', () => {
    render(<ErrorMessage message="Test" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('debe aplicar las clases de TailwindCSS correctas para el estilo de error', () => {
    const { container } = render(<ErrorMessage message="Test" />);
    const divElement = container.firstChild;

    expect(divElement).toHaveClass('bg-red-100');
    expect(divElement).toHaveClass('border');
    expect(divElement).toHaveClass('border-red-400');
    expect(divElement).toHaveClass('text-red-700');
    expect(divElement).toHaveClass('px-4');
    expect(divElement).toHaveClass('py-3');
    expect(divElement).toHaveClass('rounded');
    expect(divElement).toHaveClass('relative');
  });
});
