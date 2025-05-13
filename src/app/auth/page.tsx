import AuthForm from '@/components/AuthForm';
import React from 'react';

// Componente de la página de autenticación
export default function AuthPage() {
  return (
    // Utiliza flex para centrar AuthForm en la página, hereda el fondo de layout.tsx
    // El padding asegura que el AuthForm no toque los bordes en pantallas pequeñas.
    <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] py-12 px-4 sm:px-6 lg:px-8">
      {/* Asumimos que el Header y Footer tienen alturas variables o fijas que podríamos restar si fuera necesario
          para un centrado vertical perfecto. Por ahora, min-h-screen suele ser suficiente con el flex layout.
          Si el AuthForm no se centra verticalmente como se espera, podríamos necesitar ajustar las alturas
          del header/footer o usar una estrategia de layout diferente aquí.
          Para este MVP, el centrado con items-center y min-h-screen (o un cálculo de altura) es adecuado.
          La clase bg-slate-50 ya está en el body, por lo que no es necesario repetirla aquí.
      */}
      <AuthForm />
    </div>
  );
}
