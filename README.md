# PubliMarket - Marketplace Local con Conversión Directa

PubliMarket es un marketplace digital enfocado en conectar negocios locales y microempresas con consumidores en sus ciudades. La plataforma facilita la conversión directa a través de WhatsApp, optimizando la operación para pequeños negocios sin intermediar en pagos ni envíos.

## Tecnologías Utilizadas

*   **Framework Full-Stack:** Next.js 14 (App Router, Server Actions)
*   **Librería de UI:** React (TypeScript)
*   **Estilizado:** Tailwind CSS
*   **Backend como Servicio (BaaS):** Supabase
    *   Base de Datos: PostgreSQL
    *   Autenticación
    *   Almacenamiento (Storage)
*   **Pruebas:** Jest y React Testing Library
*   **Despliegue:** Vercel

## Configuración del Entorno de Desarrollo

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

Primero, clona el repositorio del proyecto desde GitHub:

```bash
git clone https://github.com/tu-usuario/tu-repositorio-publimarket.git
cd tu-repositorio-publimarket/my-publimarket-app
```
*(Reemplaza `https://github.com/tu-usuario/tu-repositorio-publimarket.git` con la URL real de tu repositorio)*

### 2. Instalar Dependencias

Una vez dentro del directorio `my-publimarket-app`, instala todas las dependencias necesarias del proyecto:

```bash
npm install
```

### 3. Configurar Variables de Entorno

Este proyecto utiliza Supabase como backend. Necesitarás configurar tus propias claves de API de Supabase para que la aplicación funcione correctamente.

1.  Crea un archivo llamado `.env.local` en la raíz del directorio `my-publimarket-app`.
2.  Añade las siguientes variables de entorno a este archivo:

    ```plaintext
    NEXT_PUBLIC_SUPABASE_URL=TU_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
    ```

3.  **¿Cómo obtener estos valores?**
    *   Ve a tu proyecto en el [Dashboard de Supabase](https://supabase.com/dashboard).
    *   Selecciona tu proyecto PubliMarket.
    *   En el menú lateral, ve a **Settings** (Configuración) > **API**.
    *   Allí encontrarás:
        *   **Project URL** (esta es tu `TU_SUPABASE_URL`).
        *   **Project API Keys** > **anon** > **public** (esta es tu `TU_SUPABASE_ANON_KEY`).
    *   Copia y pega estos valores en tu archivo `.env.local`.

### 4. Ejecutar el Proyecto Localmente

Con las dependencias instaladas y las variables de entorno configuradas, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación debería estar disponible en `http://localhost:3000` (o el puerto que indique la consola).

## Configuración de Supabase

Si estás configurando una nueva instancia de Supabase para este proyecto, aquí tienes los pasos generales:

### 1. Crear un Nuevo Proyecto en Supabase

*   Ve a [Supabase](https://supabase.com/) y crea una cuenta si aún no tienes una.
*   Crea un nuevo proyecto. Elige un nombre, una contraseña para la base de datos y la región del servidor.

### 2. Configurar el Esquema de la Base de Datos

Una vez creado el proyecto, necesitarás configurar el esquema de la base de datos. Esto implica crear las tablas necesarias. Las tablas principales para PubliMarket son:

*   `users` (manejada parcialmente por Supabase Auth, pero puedes necesitar añadir campos como `role` y `vendor_id`)
*   `vendors` (para la información de los vendedores)
*   `products` (para los productos)
*   `announcements` (para los anuncios de los vendedores)
*   `favorites` (para los productos/tiendas favoritas de los usuarios)
*   `analytics` (opcional en MVP, para métricas básicas)

Puedes usar el Editor SQL en el dashboard de Supabase para crear estas tablas y sus columnas según la estructura definida en el brief del proyecto.

### 3. Configurar Row Level Security (RLS)

Es crucial habilitar y configurar las políticas de Row Level Security (RLS) para tus tablas, especialmente para `vendors`, `products`, `announcements`, y `favorites`. Esto asegura que los usuarios solo puedan acceder y modificar los datos a los que tienen permiso.

*   **Ejemplos de políticas:**
    *   Permitir lectura pública (SELECT) de productos y tiendas para todos.
    *   Permitir a los vendedores autenticados (rol `pro_vendor`) crear (INSERT), actualizar (UPDATE) y eliminar (DELETE) sus *propios* productos y anuncios.
    *   Permitir a los usuarios registrados marcar/desmarcar favoritos.

Configura estas políticas en la sección "Authentication" > "Policies" de tu dashboard de Supabase.

### 4. Configurar Supabase Storage

PubliMarket utiliza Supabase Storage para almacenar imágenes de productos y logos de vendedores.

*   En tu dashboard de Supabase, ve a "Storage".
*   Crea los buckets necesarios (por ejemplo, uno para "product-images" y otro para "vendor-logos").
*   Configura las políticas de acceso para estos buckets. Generalmente, querrás que las imágenes sean públicamente legibles, pero la subida esté restringida a usuarios autenticados (vendedores).

## Despliegue en Vercel

Vercel es la plataforma recomendada para desplegar este proyecto Next.js.

### 1. Conectar Repositorio de GitHub a Vercel

*   Crea una cuenta en [Vercel](https://vercel.com/) si aún no la tienes.
*   Importa tu proyecto PubliMarket desde tu repositorio de GitHub. Vercel detectará automáticamente que es un proyecto Next.js.

### 2. Configurar Variables de Entorno en Vercel

Al igual que en desarrollo, tu aplicación desplegada necesita acceder a las claves de Supabase. **No subas tu archivo `.env.local` a GitHub.** En su lugar, configura estas variables directamente en Vercel:

1.  En tu dashboard de Vercel, selecciona tu proyecto PubliMarket.
2.  Ve a la pestaña **Settings** (Configuración).
3.  En el menú lateral, selecciona **Environment Variables** (Variables de Entorno).
4.  Añade las siguientes variables:
    *   **Clave:** `NEXT_PUBLIC_SUPABASE_URL`
        **Valor:** (Pega aquí tu URL de proyecto Supabase, la misma que usaste en `.env.local`)
    *   **Clave:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        **Valor:** (Pega aquí tu clave anónima pública de Supabase, la misma que usaste en `.env.local`)
5.  Asegúrate de que estas variables estén disponibles para los entornos deseados (Producción, Vista Previa, Desarrollo).
6.  Guarda los cambios.

Vercel usará estas variables durante el proceso de construcción y en tiempo de ejecución.

### 3. Despliegue Automático

Una vez configurado, Vercel construirá y desplegará automáticamente tu aplicación cada vez que hagas `push` a la rama principal de tu repositorio de GitHub.

## Pruebas

El proyecto incluye pruebas unitarias y de componentes básicos utilizando Jest y React Testing Library.

Para ejecutar las pruebas localmente:

```bash
npm test
```

Esto ejecutará todos los archivos de prueba (`.test.tsx` o `.test.ts`) en el proyecto.

## (Opcional) Notas sobre el MVP

*   Este proyecto se encuentra en su fase de Producto Mínimo Viable (MVP).
*   Actualmente, la adición de nuevos vendedores y la publicación inicial de productos por parte de estos vendedores podría requerir la inserción directa de datos en la base de datos Supabase o la creación de scripts para ello, hasta que los formularios correspondientes en el panel de administración del vendedor estén completamente implementados y funcionales.
