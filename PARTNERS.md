# Partners: cómo funciona y cómo agregar uno nuevo

Esta aplicación sirve a varios partners desde un mismo despliegue. El partner se
decide por el primer segmento de la URL (`/occidente`, `/tuya`, `/bogota`) y
determina tres cosas: el **tema visual**, el **acceso** y las **cards** que se
renderizan en el home.

---

## 1. Cómo determina la app qué mostrar

Las cards de cada partner se declaran en
`src/app/core/config/partners/cards/<slug>.json` y **viajan dentro del bundle**.
Cambiarlas exige reconstruir la imagen y volver a desplegar: es una decisión
deliberada del equipo de arquitectura, que prefiere ese costo —las cards cambian
poco— antes que sostener configuración fuera del repositorio.

### El navegador entra a `/occidente`

1. nginx responde con `index.html` (el `try_files ... /index.html` del SPA
   fallback en `nginx.conf`).

2. El router hace match de `/occidente` con la ruta `:partnerId`
   (`src/app/app.routes.ts`) y `withComponentInputBinding()` lo inyecta como
   input del shell:

   ```ts
   readonly partnerId = input.required<string>();                  // partner-layout.ts:20
   effect(() => this.partnerStore.setPartner(this.partnerId()));   // partner-layout.ts:28
   ```

3. `setPartner('occidente')` (`core/store/partner.store.ts:51`) valida el id
   contra `BANKS_CONFIG` y llama a `resolvePartnerCards('occidente')`.

4. `resolvePartnerCards` (`core/config/partner-cards-source.ts`) busca el slug en
   el registro `PARTNER_CARDS`, que importa estáticamente un JSON por partner:

   ```ts
   const PARTNER_CARDS: Record<string, PartnerCardConfig[]> = { occidente, tuya, bogota };
   ```

   Un partner sin entrada en ese registro no muestra ninguna card.

5. Cada card se mapea a `PartnerCardText`, resolviendo su URL contra el entorno
   activo: gana el override que coincida con `environment.environmentName` y, si
   no hay, `default`.

6. El resultado entra al store; el computed `cards()` se actualiza; `home.ts`
   aplica los dos filtros (URL presente + rol de Keycloak) y el `@for` pinta lo
   que sobrevive.

### Los tres filtros, en orden

| Filtro | Dónde | Qué controla |
|---|---|---|
| `partnerGuard` | `core/guards/partner-guard.ts` | Que el `:partnerId` exista en `BANKS_CONFIG`; si no, `/not-found` |
| `partnerAccessGuard` | `core/guards/partner-access-guard.ts` | Que el claim `partner_id` del token incluya el id numérico del partner |
| Rol de card | `features/home/pages/home/home.ts` | Que el token traiga el rol `card:<producto>` del cliente `webviewlogin` |

El JSON define **qué está desplegado** para el partner; el rol define **qué ve
ese asesor**. Una card se muestra solo si pasa ambos.

### Qué sigue viniendo del contenedor

La cadena `env.template.js` → `envsubst` → `/tmp/env.js` → `window.env` →
`CustomWindow.getWindowAttribute` sigue en pie, pero **ya no para las cards**.
La usan los valores que sí cambian por despliegue sin recompilar: la URL y el
realm de Keycloak, sus client ids y la URL de la API de persistencia. Ver
`src/environments/customwindow.ts` y `public/assets/env/env.template.js`.

Detalle relevante de ese mecanismo: `envsubst` sustituye una variable no
definida por cadena vacía, dejando la clave presente en `window.env`. Por eso
`getWindowAttribute` trata el vacío como ausente y aplica el valor por defecto.

---

## 2. Formato de las cards

`src/app/core/config/partners/cards/<slug>.json` contiene el array de cards del
partner:

```json
[
  {
    "key": "protection",
    "title": "Seguro Tradicional",
    "badge": "A tu medida",
    "button": "Ver ahora",
    "productType": 1,
    "permission": "card:protection",
    "url": {
      "default": "https://webview-uat.cardif.com.co",
      "production": "https://webview.cardif.com.co"
    }
  }
]
```

- El **orden del array es el orden de render**.
- `key` identifica la card; se usa como `track` del `@for`. Debe ser único
  dentro del partner.
- `permission` es opcional. Si se declara, la card además exige ese rol.
- `url.default` es obligatoria; las demás claves son overrides opcionales por
  `environmentName` (`development`, `local`, `qa`, `test`, `production`). La URL
  es la base: el front le concatena `/wv_<partnerId>` antes de redirigir.
- La URL puede diferir por partner: por eso vive aquí y no en el environment.

**Validación:** la hace TypeScript al compilar, porque el JSON se importa como
módulo tipado. Un campo faltante o con el tipo equivocado rompe el build. Lo que
el compilador **no** detecta es un campo de más mal escrito: un JSON importado
no es un object literal fresco, así que no aplica el excess property check.

---

## 3. Agregar un partner nuevo

Ejemplo: partner `santander`, id numérico `25`. Todos los pasos de código
requieren reconstruir la imagen.

### Paso 1 — Configuración del banco

En `src/app/core/config/partners/configurations/banks-config.ts`, agregar la
entrada al `BANKS_CONFIG`. Copiar una existente como base y ajustar:

```ts
santander: {
  id: 'cardif-banco-santander',
  name: 'Cardif Banco Santander',          // se usa como document.title
  themeName: 'theme-santander',
  theme: { colors: { ... }, typography: { ...SHARED_TYPOGRAPHY_SCALE }, ... },
  loader: { ... },
  assets: {
    ...SHARED_ASSETS,
    logo: '/assets/logos/banco-santander-logo.svg',
    logoFooter: '/assets/logos/banco-santander-logo.svg',
  },
  api: { baseUrl: ..., webview: '/wv_santander', internalBase: INTERNAL_BASE, ssoBase: SSO_BASE },
  interceptor: { xSourceName: 'wv_cardif_banco_santander', endpointConfig: SHARED_ENDPOINT_CONFIG },
},
```

La clave del objeto (`santander`) es el slug de la URL. `ThemeApplier` proyecta
`theme.colors` a CSS vars (`--color-<grupo>-<clave>`), aplica el favicon y pone
`document.title` con `name`.

### Paso 2 — Mapeo al id numérico

En `src/app/core/config/partner-id-map.ts`:

```ts
export const PARTNER_ID_MAP: Record<string, string> = {
  occidente: '11',
  tuya: '19',
  bogota: '10',
  santander: '25',   // debe coincidir con el claim partner_id de Keycloak
};
```

Sin esta entrada, `partnerAccessGuard` manda a `/not-found` a todo el mundo.

### Paso 3 — Assets

Colocar en `public/assets/logos/` el logo referenciado en el paso 1. Si el
partner lleva favicon propio, agregarlo y sobrescribir `favicon` en su entrada
(`SHARED_ASSETS` apunta hoy a `/assets/favicons/banco-occidente.ico`, que **no
existe** en el repo — de ahí el 404 de favicon en consola).

### Paso 4 — Cards

Crear `src/app/core/config/partners/cards/santander.json` (ver formato arriba) y
registrarlo en `src/app/core/config/partner-cards-source.ts`:

```ts
import santander from './partners/cards/santander.json';

const PARTNER_CARDS: Record<string, PartnerCardConfig[]> = {
  occidente, tuya, bogota, santander,
};
```

Sin el import el JSON no entra al bundle y el partner sale sin cards.

### Paso 5 — Keycloak

1. **Claim `partner_id`**: los usuarios del partner deben traer `25` en el claim
   multivalued `partner_id` del access token.
2. **Roles de card**: si el partner estrena un producto, crear el rol de cliente
   `card:<producto>` en `webviewlogin` y asignarlo.
3. **Valid Redirect URIs**: `RedirectService` usa la `url` de cada card como
   `redirect_uri` (`<url>/wv_santander/auth/callback`). Toda URL nueva debe
   registrarse en el cliente `webtransversal`, o el flujo falla con
   `invalid_redirect_uri` **después** del click, no antes.

Esta es la dependencia que más suele morder en el primer despliegue: el código
puede estar perfecto y el redirect igual falla.

### Paso 6 — Realm local (para poder probarlo)

En `dev/keycloak/realm/sales-advisors-co-realm.json`, agregar un usuario de
prueba con `"attributes": { "partner_id": ["25"] }` y los roles de card que
correspondan. Actualizar la tabla de usuarios de
[`dev/keycloak/README.md`](dev/keycloak/README.md).

### Paso 7 — Verificar en local

```bash
podman compose -f dev/keycloak/podman-compose.yml up -d
npm run start:local
```

Entrar a `/santander` con el usuario de prueba y confirmar:

- El tema y el logo del partner se aplican, y la pestaña muestra su `name`.
- Se renderizan exactamente las cards de su JSON, recortadas por los roles del
  usuario.
- `/santander` con un usuario de otro partner cae en `/not-found`.

### Paso 8 — Desplegar

```bash
podman build -t <registro>/<imagen>:<tag> .
podman push <registro>/<imagen>:<tag>
ibmcloud ce app update --name <app> --image <registro>/<imagen>:<tag>
```

---

## Checklist

| # | Paso | Dónde |
|---|---|---|
| 1 | Entrada en `BANKS_CONFIG` | `core/config/partners/configurations/banks-config.ts` |
| 2 | Entrada en `PARTNER_ID_MAP` | `core/config/partner-id-map.ts` |
| 3 | Logo y favicon | `public/assets/logos/`, `public/assets/favicons/` |
| 4 | JSON de cards + import en el registro | `core/config/partners/cards/`, `core/config/partner-cards-source.ts` |
| 5 | Claim, roles y redirect URIs | Keycloak |
| 6 | Usuario de prueba | `dev/keycloak/realm/…` |
| 7 | Imagen nueva y `app update` | Code Engine |

Los pasos 1 a 4 son un cambio de código: PR, imagen nueva y despliegue. Solo los
pasos 5 y 6 se resuelven fuera del repositorio.
