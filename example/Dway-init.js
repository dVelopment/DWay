//add event listener to dom:loaded
document.observe("dom:loaded", function() {
  var myDway = new DWay('wrapper', {autoStart: true});
});
