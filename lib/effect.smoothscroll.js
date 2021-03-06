/**
 * @author Bruno Bornsztein <bruno@missingmethod.com>
 * @copyright 2007 Curbly LLC
 * @package Glider
 * @license MIT
 * @url http://www.missingmethod.com/projects/glider/
 * @version 0.0.3
 * @dependencies prototype.js 1.5.1+, effects.js
 */
Effect.SmoothScroll = Class.create();
Object.extend(Object.extend(Effect.SmoothScroll.prototype, Effect.Base.prototype), {
  initialize: function(element) {
    this.element = $(element);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'absolute'
    } , arguments[1] || {}  );
    this.start(options);
  },
  setup: function() {
    if (this.options.continuous && !this.element._ext ) {
      this.element.cleanWhitespace();
      this.element._ext=true;
      this.element.appendChild(this.element.firstChild);
    }
   
    this.originalLeft=this.element.scrollLeft;
    this.originalTop=this.element.scrollTop;
   
    if(this.options.mode == 'absolute') {
      this.options.x -= this.originalLeft;
      this.options.y -= this.originalTop;
    } 
  },
  update: function(position) {   
    this.element.scrollLeft = this.options.x * position + this.originalLeft;
    this.element.scrollTop  = this.options.y * position + this.originalTop;
  }
});