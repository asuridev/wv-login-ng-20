(function (window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["someAttribute"] = "${SOME_ATTRIBUTE}";
})(this);
