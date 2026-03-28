# Resumen de Correcciones: Auth, RLS & Next.js 16

He completado las modificaciones en el código para estabilizar tu proyecto y resolver los errores de autenticación, RLS y compatibilidad con Next.js 16.

## 1. Archivos Modificados y Causa Raíz

### `src/app/login/page.tsx` y `src/app/register/page.tsx`
- **Causa raíz:** En Next.js 15+ (App Router, Turbopack), `searchParams` pasó a ser una Promesa asíncrona. Leer el objeto de forma sincrónica causaba la pantalla de error `searchParams is a Promise and must be unwrapped`.
- **Cambio aplicado:** Convertimos las páginas a componentes asíncronos (`async function`) y añadimos `await props.searchParams`.

### `src/app/login/actions.ts` y `src/app/register/actions.ts`
- **Causa raíz:** Supabase bloqueaba el signup (`new row violates row-level security policy for table "profiles"`) porque el Server Action intentaba insertar la fila `profiles` justo después de registrar al usuario, pero la cadena de autenticación local no tenía aún los permisos del `auth.uid()` frescos para la política RLS.
  Además, en el login se estaba enmascarando cualquier error de Supabase bajo un texto genérico "Could not authenticate user".
- **Cambio aplicado:** 
  1. Se eliminó por completo el insert manual de perfiles (Next.js ya no hace esa inserción).
  2. Los errores reales de Supabase (`error.message`) ahora son los que se propagan al URL para mostrártelos y que sepas qué falla exactamente.

### `src/middleware.ts` -> `src/proxy.ts`
- **Causa raíz:** Next.js 16 deprecó firmemente el archivo `middleware.ts` por `proxy.ts`. No actualizarlo limitaba la confiabilidad de las variables `.env.local` en Edge Runtime, provocando el crasheo `Your project's URL and Key are required to create a Supabase client!`.
- **Cambio aplicado:** Renombrado a `src/proxy.ts`, y se agregó validación de nulos en `src/utils/supabase/middleware.ts` para que un retraso en la inyección de entorno se maneje elegantemente sin colapsar tu compilación.

### `supabase/schema.sql`
- **Cambio aplicado:** Modificado localmente para añadir debajo la lógica de Disparador (Trigger) que crea el perfil seguro de forma nativa.

---

## 2. Bloque SQL Completo para Supabase (¡ACCION REQUERIDA!)

Dado que acabamos de eliminar la lógica frágil del backend para el signup (paso #1), DEBES delegar la creación del perfil a Postgres, la cual es la práctica oficial y más segura dictaminada por Supabase (ya que hace un bypass nativo de RLS para el usuario mismo).

Ve al "SQL Editor" de tu proyecto remotamente en el dashboard de Supabase y corre esto:

```sql
-- Función para insertar automáticamente el perfil usando la metadata del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'emprendedor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enlazar el Trigger a los nuevos registros en la tabla auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 3. Instrucciones Exactas para Probar `/login` y `/register`

1. **Reinicia tu Consola Node (`npm run dev`)**: Tu terminal estaba corriendo antes de la refactorización profunda de `proxy.ts` y TS Promises. Cancélala con `Ctrl+C` y ejecuta nuevamente `npm run dev`.
2. **Bug Visual en Visual Studio Code**: Si todavía ves líneas rojas indicando `Cannot find module './actions'` presiona `Cmd + Shift + P` en VS Code (Mac), busca "Restart TS Server" y presiona enter. Eso sincronizará finalmente VS Code.
3. **Prueba el Flujo de Registro (`/register`)**:
   - Ingresa nombre, email inexplorado y clave.
   - **Resultado esperado:** Supabase creará tu `auth.users`, el Trigger mágico que pusiste en el paso anterior creará tu `profiles` automáticamente y Next.js te redireccionará hacia `/onboarding`.
4. **Prueba el Flujo de Login (`/login`)**:
   - Con la cuenta que acabas de hacer cierra sesión e inicia sesión de nuevo.
   - **Resultado esperado 1:** Si no habías creado un negocio, el sistema te identificará y enviará forzosamente al `/onboarding`.
   - **Resultado esperado 2:** Si escribes mal la clave, el texto ya no dirá "Could not authenticate user" sino un valioso "Invalid login credentials".
