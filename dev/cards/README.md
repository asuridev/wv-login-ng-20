# Cards por partner

Las cards que ve cada partner en el home se configuran en runtime, desde el
configmap del contenedor. No requieren recompilar el bundle Angular, y **son la
única fuente**: un partner sin su variable declarada no muestra ninguna card.

## Cadena completa

```
configmap de Code Engine
  -> variable de entorno del contenedor
  -> envsubst sobre public/assets/env/env.template.js   (ENTRYPOINT del Dockerfile)
  -> /tmp/env.js
  -> nginx lo sirve en /assets/env/env.js               (location con root /tmp)
  -> <script> en src/index.html
  -> window.env
  -> CustomWindow.getWindowAttribute
  -> resolvePartnerCards()                              (core/config/partner-cards-source.ts)
  -> PartnerStore.setPartner()
```

## Formato

Una variable por partner: `SETTING_CARDS_<PARTNER>` en mayúsculas, con los
guiones del slug convertidos en guiones bajos (`cardif-banco-default` ->
`SETTING_CARDS_CARDIF_BANCO_DEFAULT`).

El valor es el JSON del array de cards **codificado en base64**. El base64 no
es decorativo: `env.template.js` asigna `window["env"]["X"] = "${X}";`, así que
un JSON en claro rompería el literal de JavaScript y dejaría sin configuración
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
- `permission` es opcional. Si se declara, la card además exige ese rol de
  cliente en el token de Keycloak (`resource_access.webviewlogin.roles`).
- `url` es la base: el front le concatena `/wv_<partnerId>` antes de redirigir.
- Tamaño típico: ~1 KB por partner. El límite práctico es ~128 KB por variable
  de entorno (`MAX_ARG_STRLEN` del kernel) y ~1 MB por configmap.

## Generar los valores

Los JSON legibles viven en este directorio, versionados, como fuente de verdad
documental. Para obtener los valores del configmap:

```bash
npm run cards:encode                 # imprime SETTING_CARDS_<PARTNER>=<base64>
npm run cards:encode -- --env-js     # además regenera public/assets/env/env.js
```

`--env-js` es para desarrollo local (`ng serve`): escribe el archivo que en el
contenedor genera `envsubst`. En producción es inofensivo, porque nginx sirve
`/tmp/env.js` desde el `location /assets/env/env.js`, nunca el archivo del
build.

El script valida la estructura antes de codificar. **No generes el base64 a
mano:** un valor corrupto deja al partner sin cards y el error solo aparece en
la consola del navegador.

## Desplegar

```bash
ibmcloud ce configmap update --name cards-config \
  --from-literal SETTING_CARDS_OCCIDENTE=<base64>

ibmcloud ce app update --name <app> --env-from-configmap cards-config
```

Cambiar el configmap no basta: `app update` crea una revisión nueva y reinicia
las instancias. Hasta entonces las instancias vivas siguen sirviendo el
`env.js` que generaron al arrancar.

## Dos cosas que hay que hacer aparte del configmap

1. **Partner nuevo = nueva imagen.** `envsubst` solo sustituye las variables
   escritas literalmente en `env.template.js`. Agregar un partner exige añadir
   su línea ahí y reconstruir. Cambiar los valores de partners ya declarados sí
   funciona solo con el configmap.

2. **URL nueva = registrarla en Keycloak.** `RedirectService` usa la `url` de la
   card como `redirect_uri` (`<url>/wv_<partnerId>/auth/callback`), y Keycloak
   la valida contra los *Valid Redirect URIs* del cliente `webtransversal`. Una
   URL no registrada falla con `invalid_redirect_uri` después del click, no
   antes.

## Comportamiento ante errores

| Situación | Resultado |
|---|---|
| Variable ausente o vacía | Ninguna card |
| Base64 o JSON ilegible | Ninguna card + `console.error` |
| Una entrada inválida | Se descarta esa; las demás se renderizan |

No hay catálogo de respaldo en el código: ante un valor corrupto es preferible
no mostrar cards a mostrarle a un partner productos que no le corresponden. El
corolario operativo es que **el configmap tiene que estar poblado antes de
exponer un partner**, o su home sale vacío.

Lo que sí sigue en el código es el resto de los textos del partner (el título
`¿Qué quieres hacer hoy?`, encabezado y pie), en
`src/app/core/config/partners-register.ts`.
