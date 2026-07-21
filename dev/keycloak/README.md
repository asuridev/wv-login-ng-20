# Keycloak 18 local (validación)

Entorno de identidad local para probar el webview sin depender del SSO de
staging. Levanta Keycloak 18.0.2 en `http://localhost:8080/auth` con el realm
`sales-advisors.co` ya importado.

## Levantar

```bash
podman compose -f dev/keycloak/podman-compose.yml up -d
```

Consola de admin: <http://localhost:8080/auth/admin> (`admin` / `admin`).
Comprobación: <http://localhost:8080/auth/realms/sales-advisors.co/.well-known/openid-configuration>

## Servir la app contra este Keycloak

```bash
npm run start:local
```

Usa la configuración `local` de `angular.json`, que reemplaza
`src/environments/environment.ts` por `environment.local.ts` (solo cambia el
`issuer`).

## Usuarios de prueba

Contraseña de todos: `test1234`.

| usuario           | `partner_id` | roles de cliente (`webviewlogin`)                          | escenario                                     |
| ----------------- | ------------ | ---------------------------------------------------------- | --------------------------------------------- |
| `full.occidente`  | `11`         | `card:protection`, `card:modular`, `card:progress`, `card:medical` | `/occidente` con las 4 cards           |
| `parcial.tuya`    | `19`         | `card:protection`, `card:progress`                         | `/tuya` con 2 cards; `/occidente` → not-found |
| `sinroles.bogota` | `10`         | —                                                          | `/bogota` sin cards                           |
| `multi.partner`   | `11`, `19`   | las 4                                                      | `/occidente` y `/tuya` accesibles             |

El mapeo `:partnerId` → `partner_id` vive en
`src/app/core/config/partner-id-map.ts` (occidente `11`, tuya `19`, bogota `10`).

El claim `partner_id` se emite como **multivalued** en el **access token**:
`partnerAccessGuard` lo lee vía `keycloak.tokenParsed` y espera un `string[]`.

## Notas de la importación

Los clientes del realm declaran `defaultClientScopes` de forma explícita. Al
importar un realm, Keycloak **no** asigna los client scopes por defecto a los
clientes definidos en el JSON: sin esa lista el access token sale con
`scope: ""`, sin `resource_access` (se pierde el filtro de cards por rol) y sin
`preferred_username` (se pierde el `advisorId`).

## Bajar

```bash
podman compose -f dev/keycloak/podman-compose.yml down
```
