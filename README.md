# FinanzasSaaS - Plataforma de Gestión Financiera impulsada por IA

## Descripción general
FinanzasSaaS es una plataforma de gestión financiera tipo SaaS diseñada específicamente para emprendedores y microempresas (con un enfoque especial en vendedoras de Instagram y pequeños comercios). 
El problema principal que resuelve es la complejidad del seguimiento manual de ingresos, egresos y márgenes de ganancia. Para ello, ofrece un panel de control intuitivo que centraliza productos, ventas y gastos, e incorpora Inteligencia Artificial (Google Gemini) para automatizar la categorización de gastos y brindar recomendaciones financieras personalizadas.

El objetivo principal del sistema es dar claridad absoluta sobre la salud financiera del negocio: desde calcular el punto de equilibrio hasta indicar si es seguro realizar retiros de capital o si hay productos con inventario crítico.

## Características principales
- **Dashboard Financiero Inteligente:** Visualización de ventas totales, costo de ventas (COGS), gastos operativos y utilidad neta mensual.
- **Categorización Rápida con IA:** Formulario que permite escribir un gasto de forma natural (ej: "50 bolsitas con logo") y utiliza Gemini 2.0 Flash para sugerir la categoría contable correcta.
- **Asesoría Financiera Automatizada (Insights):** Generación de recomendaciones estratégicas personalizadas basadas en el rendimiento actual (márgenes, ventas, gastos) usando IA.
- **Gestión de Perfiles y Negocios:** Soporte para múltiples perfiles y negocios bajo políticas estrictas de seguridad de datos.
- **Control de Inventario y Alertas:** Seguimiento de stock con alertas visuales para productos que bajan de los umbrales configurados (ej. 5 unidades).
- **Análisis de Punto de Equilibrio:** Calculadora en tiempo real que indica cuántas unidades deben venderse para cubrir los costos fijos.

## Tecnologías utilizadas
- **Framework Principal:** Next.js 16.2 (App Router) y React 19
- **Lenguaje:** TypeScript
- **Estilos e UI:** Tailwind CSS v4, `clsx`, `tailwind-merge`, Lucide React (iconos), Recharts (gráficos)
- **Base de Datos y Autenticación:** Supabase (PostgreSQL con Row Level Security) y SSR middleware (`@supabase/ssr`)
- **Inteligencia Artificial:** Google Gemini API (modelo `gemini-2.5-flash`) consumida directamente vía Fetch REST en Server Actions.
- **Herramientas de Build/Linting:** ESLint 9

## Arquitectura / diseño técnico
El proyecto sigue una arquitectura **Full-Stack Serverless** aprovechando al máximo el App Router de Next.js:
- **Frontend / React Server Components (RSC):** La mayor parte de la obtención de datos (Dashboard, lectura de BD) ocurre en el servidor usando RSC, minimizando el JavaScript enviado al cliente.
- **Server Actions (`src/app/actions`):** Las mutaciones (crear gastos, llamadas a Gemini) están abstraídas en Server Actions, lo que elimina la necesidad de endpoints de API convencionales en `/api`.
- **Backend-as-a-Service (Supabase):**
  - **Auth Trigger:** Un trigger de PostgreSQL (`handle_new_user`) crea automáticamente un registro en la tabla `profiles` cada vez que se registra un usuario en `auth.users`.
  - **Row Level Security (RLS):** Toda la lógica de tenencia (multi-tenant) descansa directamente en la base de datos. Los usuarios solo pueden ver y editar los perfiles, negocios, ventas y gastos asociados a su `auth.uid()`.
- **Integración de IA con Caché:** Las consultas analíticas a Gemini en `actions/gemini.ts` utilizan una capa de caché en memoria (`Map`) con un TTL de 10 minutos para optimizar consumo y mitigar límites de cuota (Rate Limiting).

## Estructura del proyecto
La organización de directorios obedece a las convenciones de Next.js App Router:
```text
├── src/
│   ├── app/                    # Rutas de Next.js App Router
│   │   ├── actions/            # Server Actions (gemini.ts, expenses.ts, etc.)
│   │   ├── auth/               # Rutas para el flujo de autenticación
│   │   ├── dashboard/          # Panel principal e indicadores financieros
│   │   ├── login/              # Pantalla de inicio de sesión
│   │   ├── onboarding/         # Flujo de creación de perfil/negocio inicial
│   │   ├── register/           # Pantalla de registro
│   │   ├── layout.tsx          # Layout global asíncrono
│   │   └── page.tsx            # Landing page
│   ├── components/             # Componentes transversales
│   │   ├── ui/                 # Componentes base (Botones, Inputs, Cards - tipo shadcn/ui)
│   │   ├── ExpenseAIFastForm.tsx # Componente cliente para ingreso IA de gastos
│   │   └── SmartDashboardAnalysis.tsx # Componente para mostrar insights de IA
│   ├── lib/                    # Lógica compartida e interfaces (ej. ai-service.ts fallback)
│   └── utils/                  # Utilidades como instancias de cliente Supabase
├── supabase/
│   └── schema.sql              # Definición de tablas, relaciones, triggers y RLS
├── .env.local                  # Variables de entorno ignoradas en repo
├── *config*                    # TypeScript, Tailwind, Next.js configs
└── package.json                # Dependencias y scripts
```

## Requisitos previos
- Node.js versión >= 20.x
- Gestor de paquetes `npm` u opcionalmente `pnpm`/`yarn`.
- Cuenta en Supabase (o instancia local de Supabase) para la base de datos y autenticación.
- Llave de API de Google Gemini (Google AI Studio).

## Instalación
Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd "innovacion e ia"
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Base de Datos:**
   - Ve a la consola de Supabase y crea un nuevo proyecto.
   - Ejecuta el contenido del archivo `supabase/schema.sql` en el SQL Editor de Supabase para crear las tablas (`profiles`, `businesses`, `products`, `sales`, `expenses`), los Triggers de Auth y habilitar las políticas RLS.

4. **Configurar variables de entorno:**
   - Renombra el archivo `.env.example` (si existe) a `.env.local` o créalo desde cero según la sección de Configuración de entorno.

5. **Levantar el entorno local:**
   ```bash
   npm run dev
   ```
   El proyecto estará disponible en `http://localhost:3000`.

## Configuración de entorno
Crea un archivo `.env.local` en la raíz del proyecto. Las variables mínimas inferidas son:

```env
# URL de la instancia de Supabase de tu proyecto
NEXT_PUBLIC_SUPABASE_URL=https://<TU_PROYECTO>.supabase.co

# Clave pública 'anon' de Supabase (necesaria en cliente)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<TU_SUPABASE_ANON_KEY>
# (Alternativa encontrada: NEXT_PUBLIC_SUPABASE_ANON_KEY puede usarse dependiendo de utilidades cliente)

# API Key de Google Gemini para la funcionalidad de IA
GEMINI_API_KEY=<TU_GEMINI_API_KEY>
```
*Nota: Nunca subas el archivo `.env.local` al repositorio.*

## Uso del sistema / guía de usuario
1. **Registro (Register):** El usuario ingresa su email y contraseña. Se crea una cuenta y, de forma automática en la base de datos, un "Perfil" asociado (rol: emprendedor).
2. **Onboarding:** Tras registrarse, se guía al usuario para nombrar a su negocio e indicar su categoría.
3. **Panel de Control (Dashboard):** El usuario llega al panel principal donde ve el resumen financiero del momento. Puede revisar:
   - **Métricas:** Ventas, Costo de Ventas (COGS), Gastos y la Utilidad Neta real.
   - **Recomendaciones:** Tarjetas que evalúan si es "seguro" retirar ganancias o si se debe esperar.
   - **Punto de Equilibrio:** Barra de progreso basada en los costos fijos.
   - **Asistente de IA (Insights):** Sugerencias inteligentes con respecto a sus márgenes o gastos excesivos en áreas como empaques.
4. **Registro de Gastos con IA:** Desde el módulo de Gastos, el usuario puede usar la funcionalidad "Registro Rápido con IA". Un prompt evalúa frases como "pagué luz" o "compré tela" y asigna la categoría de Gasto Fijo o Materia Prima de forma automática.
5. **Inventario (Products):** Sistema para añadir productos con costo base y precio de venta de cara a calcular márgenes pormenorizados.

## Guía técnica para desarrolladores
- **Autenticación Estricta:** Las rutas dependientes del usuario confían en que `@auth.getUser()` valide el JWT. Los permisos finales (qué negocio ve un perfil) siempre se filtran en base de datos gracias al *Row Level Security* (RLS). No debes hacer checks de autorización complejos en la vista mas allá de saber si un `user_id` está presente, ya que la base de datos no retornará filas que no le pertenezcan.
- **Añadir nuevas funcionalidades AI:** Cualquier nueva llamada a modelos del LLM debe abstraerse en `src/app/actions/gemini.ts`. Toma en cuenta mantener la estructura de la caché (`insightsCache`) si llamas a Gemini múltiples veces seguidas o en cada reanudación de página.
- **UI Components:** El proyecto sigue el patrón de componentes sin cabeza (como shadcn/ui) localizados en `/src/components/ui/`. Reutiliza estos componentes antes de inyectar clases de CSS nativo complejas en los módulos.

## Scripts disponibles
Ejecutables a través de `npm run <comando>`.
- `dev`: Inicia el servidor de desarrollo de Next.js.
- `build`: Construye la aplicación optimizada para producción.
- `start`: Inicia el servidor de producción luego de ejecutar el build.
- `lint`: Ejecuta ESLint (`eslint`) para identificar y reportar problemas en el código fuente.

## Base de datos
- **Tecnología:** PostgreSQL provista por Supabase.
- **Modelos clave:** 
  - `profiles`: Extensión de usuarios (roles, nombre). Creado por trigger autoejecutable post-registro.
  - `businesses`: Representación de la empresa principal del usuario.
  - `products`: Define el catálogo (precio neto y PVP).
  - `sales`: Registro transaccional engranado con productos (multiplicadores y cálculo COGS).
  - `expenses`: Registro de deuda o desembolsos, categorizados (Fijos, variables, extraordinarios).
- **Seguridad:** Todas las tablas de dominio (salvo las default de Supabase) tienen `ENABLE ROW LEVEL SECURITY;`.

## Integraciones externas
- **Supabase:** Base de datos relacional, Auth (Gestión segura de identidades).
- **Google Gemini API:** Se conecta al modelo `gemini-2.5-flash` mediante llamadas REST POST nativas al `generativelanguage.googleapis.com` para evitar las dependencias SDK pesadas y proveer "JSON Structure outputs" controlados con promts y schemas predefinidos.

## Evidencia de madurez técnica
El proyecto demuestra aspectos valiosos en su construcción:
- **Seguridad "Defense in Depth":** La implementación de RLS a nivel de tablas de negocio e instancias de autenticación garantiza aislamiento absoluto de tenants incluso si existiera una falla en la capa Next.js.
- **Caché Proactiva de Terceros:** En la interacción con la API de IA (Gemini), se implementa un objeto `Map` a nivel de server action con TTL para caché, además de manejo explícito del error por *Rate Limiting (HTTP 429)* previniendo caídas totales de experiencia del usuario.
- **Componentes modulares de interfaz:** La segmentación en `src/components/ui` revela preparación para escalabilidad de diseño estandarizado usando `clsx` y `tailwind-merge`.
- **Estructuración React Server Components:** Manejo consciente de lo que corre en el cliente (`"use client"`) para interactuar con estado del formulario IA, versus asincronía puramente corrida en backend (Dashboard central).

## Problemas conocidos o consideraciones
- **Dependencia de caché en memoria volatil:** El archivo `actions/gemini.ts` utiliza un `Map` simple para caché. Si la app escala horizontalmente (múltiples Serverless Functions instanciadas), esta caché no se compartirá y la cuota de la API de Gemini se consumirá más rápidamente. Sería prudente utilizar Redis en el futuro.
- **Variables Sensibles:** Archivos como `.env.local` deben tratarse con absoluto cuidado de no subirse en commits.

## Posibles mejoras futuras
- **Manejo global de Estado Asíncrono:** Agregar integraciones tipo SWR o React Query para refrescar partes del dashboard en base a eventos de base de datos sin necesitar `router.refresh()` constantemente.
- **Webhooks/Supabase Realtime:** Integrar sockets para que las ventas se reflejen instantáneamente en pantallas en caso de un usuario usando su cuenta desde múltiples dispositivos (un teléfono y una PC de escritorio).
- **Manejo de Caché Robusto para SSR:** Mudar el `Map` en RAM hacia una integración en Vercel KV o Redis.

## Autor / contexto
Este proyecto refleja características de un ambiente profesional o un portafolio de grado productivo superior enfocado al nicho SaaS B2B Micro (Software as a Service Business to Business). Su combinación de validación en Bases de Datos as a Service y flujos impulsados por IA contemporáneos evidencian prácticas modernas en la ingeniería de interfaces de React.
