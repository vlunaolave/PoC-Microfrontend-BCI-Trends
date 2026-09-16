# Despliegue — NeuroMFE Lab

Cada app es un sitio estático independiente. Preferencia: Vercel (un proyecto por app) u otro hosting de archivos estáticos.

## Builds

```bash
pnpm install
pnpm build
```

Artefactos:

- `apps/shell/dist`
- `apps/body-mfe/dist`
- `apps/brain-mfe/dist`
- `apps/signal-mfe/dist`
- `apps/decoder-mfe/dist`

## Variables de entorno

Definir en el Shell:

```text
VITE_BODY_REMOTE_URL=https://body.example.com/remoteEntry.js
VITE_BRAIN_REMOTE_URL=https://brain.example.com/remoteEntry.js
VITE_SIGNAL_REMOTE_URL=https://signal.example.com/remoteEntry.js
VITE_DECODER_REMOTE_URL=https://decoder.example.com/remoteEntry.js
```

Los remotes no necesitan esas URLs para construirse, pero sí CORS abierto en los assets federados.

## CORS

Los `remoteEntry.js` y chunks se cargan cross-origin. Los servidores de desarrollo y `vite preview` envían:

```text
Access-Control-Allow-Origin: *
```

En producción, permitir GET de esos bundles desde el origen del Shell. Esta PoC no tiene autenticación; no exponer APIs privadas.

## Actualización independiente

Reconstruir y publicar un solo remote. El Shell resolverá el nuevo `remoteEntry.js` en la siguiente carga, sin reconstruir los demás, siempre que el contrato de eventos se mantenga.

## Vercel

Crear cinco proyectos con root directory `apps/<nombre>` y comando `pnpm --filter @neuromfe/<nombre> build`. Output: `dist`. Configurar las env vars del Shell **antes** de su build.

No se ejecuta un deploy real desde este repositorio si no hay sesión de hosting disponible.
