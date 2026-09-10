# Guía de integración — recibir la sesión desde `webview-login`

Documento para el **equipo de la aplicación destino**: la SPA a la que
`webview-login` redirige cuando el asesor pulsa una de las cards del home.

Aquí está todo lo necesario para implementar el lado receptor: qué llega, cómo se
obtiene el token, qué trae, qué puede fallar y qué hay que pedir en Keycloak.

> Esta guía describe el **contrato de integración** —protocolo, parámetros y
> comportamiento esperado—, no la implementación. No incluye código: cada equipo
> lo resuelve con el framework y la librería que ya usa.
>
> A lo largo del documento, **`{clientIdDestino}`** es el `client_id` del cliente
> de Keycloak de tu aplicación. Ese valor te lo entrega el equipo de
> `webview-login` junto con el realm y la URL del proveedor de identidad (§8):
> tiene que estar dado de alta antes de empezar, porque es el cliente a cuyo
> nombre la app emisora pide la autorización.

---

## 1. Lo primero: no vas a recibir un token

Es la confusión habitual y conviene despejarla antes de nada.

**La app emisora no te entrega ningún token.** No hay un `access_token` en la URL,
ni en el fragmento, ni por `postMessage`, ni en un almacenamiento compartido. Lo
que se comparte es la **sesión SSO del usuario en Keycloak** — la cookie
`KEYCLOAK_IDENTITY`, que vive en el dominio del proveedor de identidad y no en el
de ninguna de las dos aplicaciones.

Lo que la app emisora hace es mandarle al navegador: *"ve a pedirle tokens a
Keycloak en nombre del cliente `{clientIdDestino}`"* — el tuyo, no el suyo. Como
el navegador ya lleva esa cookie, Keycloak los emite **sin mostrar pantalla de
login**, y devuelve un `authorization code` en tu `redirect_uri`. A partir de ahí
es un Authorization Code Flow de OIDC normal y corriente: **tu aplicación canjea
ese code por sus propios tokens**, emitidos para tu propio cliente.

El mecanismo se llama **SSO silencioso** (*silent authentication*): un
Authorization Code Flow con los parámetros `prompt=none` e `id_token_hint`.

Consecuencia práctica: **tu app es un cliente OIDC de pleno derecho**. Tiene sus
propios tokens, su propio ciclo de vida y su propio refresh. No depende de la app
emisora para nada más allá del disparo inicial.

## 2. El flujo completo

```
Asesor            App A (webviewlogin)        Keycloak            Tu app (cliente destino)
  │                        │                      │                        │
  │ pulsa una card         │                      │                        │
  ├───────────────────────►│                      │                        │
  │                        │ registra la venta    │                        │
  │                        │                      │                        │
  │                        │ GET /auth            │                        │
  │                        │  client_id={clientIdDestino}                  │
  │                        │  prompt=none         │                        │
  │                        │  id_token_hint=<idToken de A>                 │
  │                        │  state=<JSON de negocio>                      │
  │                        ├─────────────────────►│                        │
  │                        │        (el navegador lleva la cookie          │
  │                        │         KEYCLOAK_IDENTITY del realm)          │
  │                        │                      │                        │
  │                        │                      │ 302 …/auth/callback    │
  │                        │                      │     ?code=…&state=…    │
  │                        │                      ├───────────────────────►│
  │                        │                      │                        │
  │                        │                      │ POST /token            │
  │                        │                      │  grant_type=authorization_code
  │                        │                      │◄───────────────────────┤
  │                        │                      │                        │
  │                        │                      │ access / id / refresh  │
  │                        │                      ├───────────────────────►│
  │                        │                      │                        │
  │                        │                      │      lee state.path y navega
  │◄──────────────────────────────────────────────────────────────────────┤
```

Ningún paso de este diagrama pasa por un backend intermedio: es todo navegador
contra Keycloak.

## 3. Qué recibe tu aplicación

Keycloak redirige el navegador a tu ruta de callback, con estos parámetros en la
**query string** (no en el fragmento):

| Parámetro | Descripción |
| --- | --- |
| `code` | Authorization code de un solo uso, vida aproximada de 60 s. Es lo que canjeas |
| `state` | Contexto de negocio que envió la app emisora. Ver §4 |
| `session_state` / `iss` | Los añade Keycloak. Informativos para ti |
| `error` | **Solo si algo falló.** En ese caso no hay `code`. Ver §7 |


## 4. El contrato del `state`

El parámetro `state` transporta un objeto JSON que la app emisora codifica y que
Keycloak devuelve intacto. Es tu único canal para saber a qué ruta ir y con qué
contexto de negocio.

| Campo | Tipo | Qué es |
| --- | --- | --- |
| `path` | texto | Ruta destino dentro de tu app. Hoy siempre `/home` |
| `productType` | número | Producto de la card pulsada. Ver la tabla siguiente |
| `correlationId` | texto | Identificador único de este flujo de venta. **Propágalo en tus logs y llamadas**: es el hilo que une tu sesión con el registro de venta que hizo la app emisora justo antes de redirigir |
| `partnerId` | texto | Partner (`occidente`, `tuya`, `bogota`). El mismo del segmento `wv_*` de la ruta |

| `productType` | Card |
| --- | --- |
| `1` | Seguro Tradicional |
| `4` | Seguro Modular |
| `0` | ¿Cómo voy? |


### Cuidado con la doble codificación

La app emisora codifica el JSON **antes** de meterlo como parámetro, y la
serialización de la URL lo vuelve a codificar. Es decir: el valor viaja con **dos
capas** de codificación de URL.

El navegador deshace una capa al leer la query, así que **queda otra por
deshacer**. Si intentas interpretar directamente como JSON lo que te entrega el
navegador, obtendrás un error de sintaxis: hay que aplicarle primero una
decodificación de URL adicional y solo después interpretarlo como JSON.

Es el primer tropiezo de toda integración con este flujo. Si al depurar ves un
valor que empieza por `%7B` en vez de por `{`, es exactamente esto.

### Aquí el `state` NO es un nonce anti-CSRF

En un flujo OIDC estándar el `state` es un valor aleatorio que el cliente genera y
verifica al volver, para protegerse de CSRF. **En esta integración no lo es**: lo
genera la app emisora y transporta datos de negocio. De ahí se derivan dos cosas
importantes:

1. **No puedes usar el manejo automático de callback de una librería OIDC.**
   Tanto `keycloak-js` como `oidc-client-ts` (y equivalentes) rechazan este
   callback, porque el `state` no lo generaron ellas y no lo encuentran en su
   almacenamiento. Tienes que atender el callback por tu cuenta: leer `code` y
   `state`, hacer el canje contra el endpoint de token, y después —si quieres—
   entregarle los tokens a la librería para que gestione el refresh y el resto del
   ciclo de vida.
2. **El flujo no lleva la protección CSRF que normalmente aporta el `state`.** Si
   tu equipo la necesita, hay que acordarla con el equipo de la app emisora
   (añadir un campo firmado o un nonce dentro del propio objeto). Queda escrito
   aquí para que sea una decisión consciente y no un descuido.

Trata el contenido del `state` como **dato de entrada no confiable**: valida
`path` contra una lista cerrada de rutas permitidas antes de navegar, y
`partnerId` contra los partners que soportas. Y no lo uses nunca para decidir
permisos — para eso están los claims del token.

## 5. Canjear el `code` por tus tokens

El canje es una petición `POST` al endpoint de token del realm
(`/realms/{realm}/protocol/openid-connect/token`), con el cuerpo codificado como
formulario (`application/x-www-form-urlencoded`) y estos parámetros:

| Parámetro | Valor |
| --- | --- |
| `grant_type` | `authorization_code` |
| `client_id` | `{clientIdDestino}` — el mismo con el que llegó la autorización |
| `code` | El `code` recibido en el callback |
| `redirect_uri` | La misma URL de callback, **idéntica carácter a carácter** |

Dos condiciones que hay que respetar:

- **Cliente público: no hay `client_secret`.** Es una SPA; no se envía secreto.
- **El `redirect_uri` debe coincidir exactamente** con el de la petición de
  autorización, incluido el prefijo `wv_*`. Cualquier diferencia —una barra final
  de más, otro esquema, otro puerto— devuelve `invalid_grant`.

### Lo que tu manejador de callback tiene que hacer, en orden

1. **Comprobar primero si vino un `error`.** Si lo hay, no habrá `code`, y el
   tratamiento depende de cuál sea (§7). En particular `login_required` no es un
   fallo: significa que hay que hacer un login interactivo.
2. **Leer `code` y `state`.** Si no hay `code` ni `error`, alguien llegó a esa URL
   por su cuenta: redirige a tu login.
3. **Decodificar el `state`** con la capa extra de decodificación de URL antes de
   interpretarlo como JSON (§4), y validar sus campos.
4. **Reconstruir el `redirect_uri`** a partir de la URL actual sin la query, para
   garantizar que es idéntico al que se usó en la autorización.
5. **Hacer el canje** contra el endpoint de token y guardar los tokens donde tu
   app gestione la sesión.
6. **Limpiar la URL** (reemplazando la entrada del historial) para que el `code`
   no quede en el historial de navegación ni en los logs de referrer.
7. **Navegar** a `state.path`, previa validación contra tu lista de rutas
   permitidas.

**El `code` se canjea una sola vez.** Si tu framework monta el componente de
callback dos veces —el modo estricto de React, una re-navegación, un refresco de
la página— el segundo intento falla con `invalid_grant`. Protege el canje con una
bandera de "ya en curso" o ejecútalo fuera del ciclo de vida del componente.

## 6. Qué traen los tokens

La respuesta del canje incluye `access_token`, `id_token`, `refresh_token`,
`expires_in` (1800 segundos en el realm de desarrollo), `refresh_expires_in` y
`session_state`.

Claims que sí puedes esperar en el `access_token`:

| Claim | Valor |
| --- | --- |
| `sub` | Identificador del asesor. **El mismo que tiene en la app emisora** |
| `preferred_username` | Usuario del asesor (lo que la app emisora usa como identificador de asesor) |
| `azp` | `{clientIdDestino}` — el cliente para el que se emitió el token |
| `session_state` / `sid` | **La misma sesión SSO que la app emisora.** Es la prueba de que no hubo un login nuevo |
| `name`, `given_name`, `family_name`, `email` | Del scope `profile` / `email` |

### Tres avisos que ahorran horas de depuración

**`partner_id` no llega.** El *protocol mapper* que emite ese claim está definido
únicamente en el cliente de la app emisora. Tu token no lo trae. Toma el partner
del campo `partnerId` del `state`, o pide que se añada el mapper a tu cliente
(§8).

**`resource_access` puede traer roles de *otro* cliente.** Con la configuración
actual el token incluye los roles de cards del asesor (`card:protection`,
`card:modular`, …) bajo el cliente de la app emisora, porque el usuario los tiene
asignados ahí. **No los tomes como tus permisos**: son de la otra aplicación, y
que aparezcan depende de que tu cliente tenga *full scope* activo, algo que puede
cambiar sin avisarte. Define tus propios roles en tu propio cliente.

**`aud` no es necesariamente tu `client_id`.** En el realm de desarrollo el
`access_token` sale con `aud` apuntando al cliente de la app emisora —es la
resolución de audiencia de Keycloak, derivada de los roles del usuario—, mientras
que el `id_token` sí lleva `aud` con tu cliente. Si validas la audiencia en un
backend, compruébalo primero en tu entorno; `azp` es el campo fiable para saber
qué cliente pidió el token.

## 7. Errores

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| `error=login_required` | Se pidió `prompt=none` y no había sesión SSO: cookie expirada, borrada, o bloqueada por el navegador | **No es un fallo.** Lanza un login interactivo normal desde tu app |
| `error=interaction_required` | Hay sesión, pero Keycloak necesitaba mostrar algo (consentimiento, actualización de credenciales) | Igual que el anterior: login interactivo |
| `error=invalid_scope`, `unauthorized_client` | El cliente no admite ese scope, o el flujo está deshabilitado | Configuración del cliente (§8) |
| `400 invalid_grant` en el canje | El `code` ya se canjeó, caducó (~60 s), o el `redirect_uri` no es idéntico | Revisa el doble canje y la coincidencia exacta del `redirect_uri` |
| Página de error de Keycloak, **sin redirección** | El `redirect_uri` no está registrado en el cliente | Registrarlo (§8). Mientras tanto **a tu app no le llega nada**: no es que falle tu callback, es que el navegador nunca llega a él |
| Llegas al callback sin `code` ni `error` | Alguien abrió la URL a mano, o un proxy se comió la query | Redirige a tu login |

Sobre `login_required`: es el caso más frecuente en producción y el más fácil de
confundir con un bug. Distínguelo explícitamente y no muestres una pantalla de
error genérica — muestra el login.

## 8. Checklist de configuración en Keycloak

Lo que tu equipo tiene que pedir (o verificar) sobre el cliente
`{clientIdDestino}` en el realm correspondiente. Si el cliente todavía no existe,
este es el momento de darlo de alta: sin él la app emisora no puede pedir la
autorización a tu nombre.

- [ ] **Redirect URIs**: cada URL de callback con su prefijo `wv_{partnerId}` que
      vayas a recibir, por entorno. Un patrón con comodín sobre el prefijo
      (`…/wv_*/auth/callback`) cubre todos los partners de una vez.
- [ ] **Web Origins**: tu origen, para que la petición de canje desde el navegador
      pase el control de CORS.
- [ ] **Standard Flow** habilitado. **Implicit Flow** deshabilitado.
- [ ] **Cliente público** (sin secreto), coherente con una SPA.
- [ ] **PKCE sin obligar**: el método de *code challenge* debe quedar vacío. Si se
      marca `S256` como obligatorio, Keycloak rechazará la autorización que envía
      la app emisora, que no manda `code_challenge`. Si tu equipo quiere PKCE, hay
      que implementarlo primero en la app emisora — no es un cambio que puedas
      hacer solo en tu cliente.
- [ ] **Mapper `partner_id`** en tu cliente, si prefieres leerlo del token en vez
      del `state`: tipo *User Attribute*, atributo `partner_id`, multivaluado,
      presente en access token e id token.
- [ ] **Roles de cliente propios**, si vas a autorizar por rol. No reutilices los
      roles del cliente de la app emisora.

