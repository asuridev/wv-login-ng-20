# Partners: cómo funciona y cómo agregar uno nuevo

Esta aplicación sirve a varios partners desde un mismo despliegue. El partner
se decide por el primer segmento de la URL (`/occidente`, `/tuya`, `/bogota`) y
determina tres cosas: el **tema visual**, el **acceso** y las **cards** que se
renderizan en el home.

---

## 1. Cómo determina la app qué mostrar

### Arranque del contenedor (una sola vez, antes de la primera petición)

1. El configmap de Code Engine inyecta las variables como variables de entorno
   del proceso:

   ```
   SETTING_CARDS_OCCIDENTE=W3sia2V5IjoicHJvdGVjdGlvbiIs...
   SETTING_CARDS_TUYA=W3sia2V5...
   ```

2. El `ENTRYPOINT` del `Dockerfile` corre `envsubst` sobre la plantilla:

   ```
   envsubst < /opt/app-root/src/assets/env/env.template.js > /tmp/env.js
   ```

   Sustituye cada `${VAR}` por su valor; las no definidas quedan como `""`.

3. El resultado es JavaScript plano con **todos** los partners a la vez:

   ```js
   window["env"]["SETTING_CARDS_OCCIDENTE"] = "W3sia2V5...";
   window["env"]["SETTING_CARDS_TUYA"] = "W3sia2V5...";
   window["env"]["SETTING_CARDS_BOGOTA"] = "";
   ```

   El contenedor no sabe nada de `/occidente`: vuelca todas las variables sin
   discriminar y termina su trabajo aquí.

### El navegador entra a `/occidente`

4. nginx responde con `index.html` (el `try_files ... /index.html` del SPA
   fallback en `nginx.conf`).

5. El `<head>` carga `<script src="assets/env/env.js">`. El
   `location /assets/env/env.js` de `nginx.conf` tiene `root /tmp`, así que
   sirve el archivo del paso 2. Es síncrono: `window.env` queda poblado antes
   de que corra una línea de Angular.

6. El router hace match de `/occidente` con la ruta `:partnerId`
   (`src/app/app.routes.ts`) y `withComponentInputBinding()` lo inyecta como
   input del shell:

   ```ts
   readonly partnerId = input.required<string>();                  // partner-layout.ts:20
   effect(() => this.partnerStore.setPartner(this.partnerId()));   // partner-layout.ts:28
   ```

7. `setPartner('occidente')` (`core/store/partner.store.ts:51`) valida el id
   contra `BANKS_CONFIG` y llama a `resolvePartnerCards('occidente')`.

8. **Aquí se decide qué variable leer.** El nombre se deriva del segmento de la
   URL por convención, sin tabla de mapeo ni `switch`
   (`core/config/partner-cards-source.ts:8`):

   ```ts
   `${ENV_PREFIX}${partnerId.replace(/-/g, '_').toUpperCase()}`
   //  'occidente' → 'SETTING_CARDS_OCCIDENTE'
   ```

9. `CustomWindow.getWindowAttribute` lee ese nombre del objeto que ya estaba en
   memoria desde el paso 5.

10. El valor se decodifica (base64 → UTF-8 → `JSON.parse`), se valida card por
    card y se mapea a `PartnerCardText`.

11. El resultado entra al store; el computed `cards()` se actualiza; `home.ts`
    aplica los dos filtros (URL presente + rol de Keycloak) y el `@for` pinta
    lo que sobrevive.

### Dos consecuencias que conviene tener presentes

**Cambiar el configmap no se ve hasta reiniciar.** Los pasos 1–3 ocurrieron al
arrancar la instancia. Por eso hace falta `ibmcloud ce app update`, que crea una
revisión nueva: las instancias vivas siguen sirviendo el `/tmp/env.js` que
generaron al nacer.

**Navegar entre partners no vuelve a pedir nada al servidor.** De `/occidente` a
`/tuya` sin recargar, el paso 8 recalcula el nombre y el 9 lee otra clave del
mismo objeto en memoria. El navegador tiene las cards de *todos* los partners
cargadas; la separación real la hace `partnerAccessGuard` con el claim
`partner_id` del token, no el desconocimiento de los datos.

### Los tres filtros, en orden

| Filtro | Dónde | Qué controla |
|---|---|---|
| `partnerGuard` | `core/guards/partner-guard.ts` | Que el `:partnerId` exista en `BANKS_CONFIG`; si no, `/not-found` |
| `partnerAccessGuard` | `core/guards/partner-access-guard.ts` | Que el claim `partner_id` del token incluya el id numérico del partner |
| Rol de card | `features/home/pages/home/home.ts` | Que el token traiga el rol `card:<producto>` del cliente `webviewlogin` |

El configmap define **qué está desplegado** para el partner; el rol define **qué
ve ese asesor**. Una card se muestra solo si pasa ambos.

---

## 2. Formato de las cards

Una variable por partner: `SETTING_CARDS_<PARTNER>` en mayúsculas, con los
guiones del slug convertidos en guiones bajos.

El valor es el JSON del array de cards **codificado en base64**. El base64 no es
decorativo: `env.template.js` asigna `window["env"]["X"] = "${X}";`, así que un
JSON en claro rompería el literal de JavaScript y dejaría sin configuración
runtime a toda la aplicación, no solo a las cards.

```json
[
  {
    "key": "protection",
    "title": "Seguro Tradicional",
    "badge": "A tu medida",
    "button": "Ver ahora",
    "productType": 1,
    "permission": "card:protection",
    "url": "https://webview.cardif.com.co"
  }
]
```

- El **orden del array es el orden de render**.
- `permission` es opcional. Si se declara, la card además exige ese rol.
- `url` es la base: el front le concatena `/wv_<partnerId>` antes de redirigir.
- No hay catálogo de respaldo en el código: **un partner sin su variable poblada
  muestra el home sin ninguna card.**

| Situación | Resultado |
|---|---|
| Variable ausente o vacía | Ninguna card |
| Base64 o JSON ilegible | Ninguna card + `console.error` |
| Una entrada inválida | Se descarta esa; las demás se renderizan |

Detalle completo del formato y del flujo de despliegue en
[`dev/cards/README.md`](dev/cards/README.md).

---

## 3. Agregar un partner nuevo

Ejemplo: partner `santander`, id numérico `25`.

### Paso 1 — Configuración del banco (código)

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

La clave del objeto (`santander`) es el slug de la URL y lo que determina el
nombre de la variable de entorno. `ThemeApplier` proyecta `theme.colors` a CSS
vars (`--color-<grupo>-<clave>`), aplica el favicon y pone `document.title` con
`name`.

### Paso 2 — Mapeo al id numérico (código)

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

### Paso 3 — Assets (código)

Colocar en `public/assets/logos/` el logo referenciado en el paso 1. Si el
partner lleva favicon propio, agregarlo y sobrescribir `favicon` en su entrada
(`SHARED_ASSETS` apunta hoy a `/assets/favicons/banco-occidente.ico`, que **no
existe** en el repo — de ahí el 404 de favicon en consola).

### Paso 4 — Declarar la variable en la plantilla (código, **exige rebuild**)

En `public/assets/env/env.template.js`:

```js
window["env"]["SETTING_CARDS_SANTANDER"] = "${SETTING_CARDS_SANTANDER}";
```

**Este es el paso que obliga a reconstruir la imagen.** `envsubst` solo sustituye
las variables escritas literalmente en la plantilla: sin esta línea, la variable
del configmap se ignora por completo. Cambiar los *valores* de partners ya
declarados no requiere rebuild; agregar un partner sí.

### Paso 5 — Definir sus cards

Crear `dev/cards/santander.json` con el array de cards (ver formato arriba) y
generar los valores:

```bash
npm run cards:encode              # imprime SETTING_CARDS_<PARTNER>=<base64>
npm run cards:encode -- --env-js  # además regenera public/assets/env/env.js para local
```

El script valida la estructura antes de codificar. No generes el base64 a mano.

### Paso 6 — Keycloak

1. **Claim `partner_id`**: los usuarios del partner deben traer `25` en el claim
   multivalued `partner_id` del access token.
2. **Roles de card**: si el partner estrena un producto, crear el rol de cliente
   `card:<producto>` en `webviewlogin` y asignarlo.
3. **Valid Redirect URIs**: `RedirectService` usa la `url` de cada card como
   `redirect_uri` (`<url>/wv_santander/auth/callback`). Toda URL nueva debe
   registrarse en el cliente `webtransversal`, o el flujo falla con
   `invalid_redirect_uri` **después** del click, no antes.

Esta es la dependencia que más suele morder en el primer despliegue: el código y
el configmap pueden estar perfectos y el redirect igual falla.

### Paso 7 — Realm local (para poder probarlo)

En `dev/keycloak/realm/sales-advisors-co-realm.json`, agregar un usuario de
prueba con `"attributes": { "partner_id": ["25"] }` y los roles de card que
correspondan. Actualizar la tabla de usuarios de
[`dev/keycloak/README.md`](dev/keycloak/README.md).

### Paso 8 — Desplegar

```bash
# 1. Nueva imagen (por el paso 4)
podman build -t <registro>/<imagen>:<tag> .
podman push <registro>/<imagen>:<tag>

# 2. Valor en el configmap
ibmcloud ce configmap update --name cards-config \
  --from-literal SETTING_CARDS_SANTANDER=<base64>

# 3. Nueva revisión de la app
ibmcloud ce app update --name <app> \
  --image <registro>/<imagen>:<tag> \
  --env-from-configmap cards-config
```

### Paso 9 — Verificar

```bash
podman compose -f dev/keycloak/podman-compose.yml up -d
npm run cards:encode -- --env-js
npm run start:local
```

Entrar a `/santander` con el usuario de prueba y confirmar:

- El tema y el logo del partner se aplican, y la pestaña muestra su `name`.
- Se renderizan exactamente las cards de su JSON, recortadas por los roles del
  usuario.
- La consola no reporta `[cards] SETTING_CARDS_SANTANDER ...`.
- `/santander` con un usuario de otro partner cae en `/not-found`.

Y en el entorno desplegado:

```bash
curl https://<host>/assets/env/env.js   # debe traer la variable sustituida
```

---

## Checklist

| # | Paso | Dónde | ¿Rebuild? |
|---|---|---|---|
| 1 | Entrada en `BANKS_CONFIG` | `core/config/partners/configurations/banks-config.ts` | Sí |
| 2 | Entrada en `PARTNER_ID_MAP` | `core/config/partner-id-map.ts` | Sí |
| 3 | Logo y favicon | `public/assets/logos/`, `public/assets/favicons/` | Sí |
| 4 | Línea en la plantilla de env | `public/assets/env/env.template.js` | **Sí** |
| 5 | JSON de cards + `cards:encode` | `dev/cards/<partner>.json` | No |
| 6 | Claim, roles y redirect URIs | Keycloak | No |
| 7 | Usuario de prueba | `dev/keycloak/realm/…` | No |
| 8 | Configmap + `app update` | Code Engine | — |

Los pasos 1–4 son un cambio de código con su PR y su imagen nueva. Solo los
pasos 5, 6 y 8 se pueden repetir después sin tocar el repo: **una vez declarado
el partner, cambiar sus cards o sus URLs es solo configmap + `app update`.**
