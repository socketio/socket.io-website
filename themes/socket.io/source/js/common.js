$(document).ready(function() {
  var pathname = window.location.pathname;
  var $selector = $("select#version-selector");

  if (pathname.indexOf("/docs/v2/") !== -1) {
    $selector.val("v2");
  } else if (pathname.indexOf("/docs/v3/") !== -1) {
    $selector.val("v3");
  } else {
    $selector.val("v4");
  }

  $selector.change(function() {
    var version = $("select#version-selector option:selected").val();
    window.location = "/docs/" + version + "/";
  });
});
