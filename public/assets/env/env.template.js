(function (window) {
  window["env"] = window["env"] || {};

  // Configuracion de runtime inyectada por el contenedor: envsubst sustituye
  // cada ${VAR} al arrancar y nginx sirve el resultado en /assets/env/env.js.
  // Una variable no definida queda como cadena vacia, que CustomWindow trata
  // como ausente para que aplique el valor por defecto del environment.
  window["env"]["URL_KEYCLOAK"] = "${URL_KEYCLOAK}";
  window["env"]["KEYCLOAK_REALM"] = "${KEYCLOAK_REALM}";
  window["env"]["KEYCLOAK_CLIENT_ID"] = "${KEYCLOAK_CLIENT_ID}";
  window["env"]["KEYCLOAK_REDIRECT_CLIENT_ID"] = "${KEYCLOAK_REDIRECT_CLIENT_ID}";
  window["env"]["URL_PERSISTENCE_API"] = "${URL_PERSISTENCE_API}";
})(this);
