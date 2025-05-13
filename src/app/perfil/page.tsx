'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// @ts-ignore: Cannot find module 'next-auth/react'
import { useSession, signOut } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Supongamos que desde alguna API interna obtenemos datos extendidos del usuario.
    async function fetchUserData() {
      if (session && session.user) {
        // Simulemos una llamada a una API interna que retorna datos del perfil
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setUserData({
            email: session.user.email,
            name: session.user.name || 'Usuario',
            image: session.user.image || '/placeholder-avatar.png'
          });
        }
      }
    }
    fetchUserData();
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-xl">Debes iniciar sesión para ver tu perfil.</p>
        <Link href="/auth" className="text-sky-600 hover:underline">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 md:p-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative w-24 h-24">
            <Image
              src={userData?.image || '/placeholder-avatar.png'}
              alt={userData?.name || 'Avatar'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{userData?.name || 'Usuario'}</h1>
            <p className="text-slate-600">{userData?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Información Personal</h2>
            <p className="text-slate-700">Aquí puedes actualizar tus datos personales.</p>
            <Link href="/perfil/editar" className="mt-3 inline-block bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Editar Perfil
            </Link>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Mis Favoritos</h2>
            <p className="text-slate-700">Revisa y administra tus productos favoritos.</p>
            <Link href="/favoritos" className="mt-3 inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors">
              Ver Favoritos
            </Link>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
