# Transferencia de sesión entre aplicaciones (Keycloak)

## Cómo se llama el mecanismo

**SSO silencioso (_silent authentication_) sobre el Authorization Code Flow de OIDC**,
usando los parámetros `prompt=none` e `id_token_hint`.

Lo importante: **el token no se pasa de una app a otra**. Lo que se comparte es la
**sesión SSO del usuario en Keycloak** — la cookie `KEYCLOAK_IDENTITY` del realm, que
vive en el dominio del IdP, no en el de las apps. La app destino pide sus *propios*
tokens a Keycloak; como el navegador ya lleva esa cookie, Keycloak los emite sin mostrar
pantalla de login.

Actores:

| Actor | Quién es |
|---|---|
| App A (emisor) | Este repo. Cliente Keycloak `webviewlogin` (`environment.ts:48`) |
| App B (receptor) | La SPA destino. Cliente Keycloak `webtransversal` (`environment.ts:49`) |
| IdP | Realm `sales-advisors-co` en `sso-lam-assurance.staging.echonet` |
| Navegador | Portador de la cookie de sesión SSO — es el que "transfiere" la sesión |

## Los pasos

Todo el flujo está en `RedirectService.redirectTo()`, `src/app/core/services/redirect.ts:17`.

### 1. Asegurar que la sesión está viva — `redirect.ts:20`

```ts
await this.keycloak.updateToken(30); // refresca si expira en menos de 30s
```

Si falla, se llama a `keycloak.login()` y se aborta el redirect. Sin sesión válida en la
app A, el SSO silencioso en la app B fallaría igualmente.

### 2. Obtener el `id_token` de la app A — `redirect.ts:26`

Es la prueba de *quién* es el usuario. No se usa como credencial de acceso contra la app
B, solo como pista de identidad para Keycloak.

### 3. Empaquetar el contexto de negocio en `state` — `redirect.ts:33-38`

```ts
const state = {
  path: targetPath,
  productType: this.partnerStore.productType(),
  correlationId: this.partnerStore.correlationId() ?? '',
  partnerId: this.partnerStore.partnerId(),
};
```

Keycloak devuelve este `state` intacto a la app B, así que sirve de canal para restaurar
la ruta destino y mantener la trazabilidad del flujo de venta.

### 4. Construir la URL de autorización apuntando al cliente B — `redirect.ts:40-50`

```
GET {issuer}/realms/sales-advisors-co/protocol/openid-connect/auth
```

| Parámetro | Valor | Por qué |
|---|---|---|
| `client_id` | `webtransversal` | El cliente **destino**, no el propio |
| `redirect_uri` | `{appBaseUrl}/auth/callback` | Dónde rebota Keycloak con el código |
| `response_type` | `code` | Authorization Code Flow |
| `scope` | `openid profile` | `openid` es obligatorio para OIDC |
| `prompt` | `none` | Prohíbe cualquier UI: o hay sesión, o devuelve error |
| `id_token_hint` | `<idToken de la app A>` | "El usuario es este" |
| `state` | JSON codificado (paso 3) | Vuelve intacto a la app B |

### 5. Navegar — `redirect.ts:52`

```ts
window.location.href = authUrl.toString();
```

Redirección real del navegador, no un iframe ni un `fetch`: es precisamente lo que hace
que la cookie de sesión de Keycloak viaje en la petición.

### 6. Keycloak valida y rebota

Encuentra la cookie de sesión, comprueba que coincide con el `id_token_hint`, y redirige
a `{appBaseUrl}/auth/callback?code=...&state=...` sin pedir credenciales.

### 7. La app B canjea el `code` por sus propios tokens

Y decodifica el `state` (`decodeURIComponent` + `JSON.parse`) para saber a qué ruta ir y
con qué `correlationId` continuar.

> **Este repo no implementa ese lado.** No existe ruta `/auth/callback` en
> `src/app/app.routes.ts`; corresponde a la app `webtransversal`.

## En corto

Aquí solo se dispara el flujo — `HomeCard.onClick()`, `src/app/features/home/components/home-card.ts:70`,
después de registrar la venta. La transferencia real la hace Keycloak: la app A no
entrega nada a la app B; A solo le dice al navegador "ve a pedirle tokens a Keycloak en
nombre de B", y Keycloak los concede porque el usuario ya está autenticado ahí.

## Glosario

- **`prompt=none`** — pide a Keycloak que no muestre ninguna interfaz. Si no hay sesión,
  responde con error (`login_required`) en vez de mostrar el formulario de login.
- **`id_token_hint`** — ID token previo que indica al IdP qué usuario se espera.
- **`state`** — valor opaco que el cliente envía y el IdP devuelve sin modificar.
- **Sesión SSO** — sesión del usuario en el IdP, independiente de la de cada aplicación.
