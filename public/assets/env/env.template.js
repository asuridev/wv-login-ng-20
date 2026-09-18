(function (window) {
  window["env"] = window["env"] || {};

  // Cards desplegadas por partner: JSON en base64 (ver dev/cards/README.md).
  // envsubst solo sustituye las variables escritas literalmente aqui, asi que
  // un partner nuevo exige agregar su linea y reconstruir la imagen.
  window["env"]["SETTING_CARDS_OCCIDENTE"] = "${SETTING_CARDS_OCCIDENTE}";
  window["env"]["SETTING_CARDS_TUYA"] = "${SETTING_CARDS_TUYA}";
  window["env"]["SETTING_CARDS_BOGOTA"] = "${SETTING_CARDS_BOGOTA}";
})(this);
