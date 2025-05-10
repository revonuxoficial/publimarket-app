import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('debe renderizar el texto "Cargando..."', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();
  });

  test('debe contener un div con la clase "animate-spin" para el spinner', () => {
    const { container } = render(<LoadingSpinner />);
    // Buscamos el div que tiene la clase 'animate-spin'
    // Este es un enfoque un poco más frágil si la estructura interna cambia mucho,
    // pero para un spinner simple es aceptable.
    const spinnerDiv = container.querySelector('.animate-spin');
    expect(spinnerDiv).toBeInTheDocument();
    expect(spinnerDiv).toHaveClass('rounded-full');
    expect(spinnerDiv).toHaveClass('h-8');
    expect(spinnerDiv).toHaveClass('w-8');
    expect(spinnerDiv).toHaveClass('border-b-2');
    expect(spinnerDiv).toHaveClass('border-blue-500');
  });

  test('debe aplicar las clases de TailwindCSS correctas al contenedor principal', () => {
    const { container } = render(<LoadingSpinner />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('justify-center');
    expect(mainDiv).toHaveClass('items-center');
  });
});
