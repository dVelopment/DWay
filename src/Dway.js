/**
* @author Daniel Holzmann http://d.velopment.at
* @copyright 2011
* @package DWay
* @license GPL
* @dependencies prototype.js 1.5.1+, effects.js, effect.smoothscroll.js
*/

/* This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
usage: var myDway = new DWay('idOfWrapperElement'[, {options}]);
*/

var DWay = Class.create ({
	initialize: function(wrapper) {
		this.wrapper = $(wrapper);
		this.options = arguments[1] || {};
		this.scrolling = false;
		
		//set up default values
		this.options.duration = this.options.duration || 0.5;		//animtion duration
		this.options.frequency = this.options.frequency || 5;	//after x seconds change to next image
		this.options.startIndex = this.options.startIndex || 0; //image to be displayed on setup
		
		this.listItems = this.wrapper.down('ul').childElements();
	
		//remove as many elements as needed to make number of
		//li-elements divisable by 3
		while(this.listItems.length % 3 != 0) {
			this.listItems[this.listItems.length-1].remove();
			this.listItems.pop();
		}
		
		this.events = {
			click: this.click.bind(this)
		};
		
		this.setup();
	},
	
	setup: function() {
		//setup slideshow container
		this.container = new Element('div', {'class': 'dway-slideshow'});
		this.mainSlider = new Element('div', {'class': 'dway-main-slider'});
		this.secondSlider = new Element('div', {'class': 'dway-second-slider'});
		this.thirdSlider = new Element('div', {'class': 'dway-third-slider'});
		
		//setup sliders
		this.wrapper.insert({bottom: this.container});
		this.container.appendChild(this.mainSlider);
		this.container.appendChild(this.secondSlider);
		this.container.appendChild(this.thirdSlider);
		
		//setup slider-contents
		this.mainSliderContent = new Element('div', {'class': 'dway-main-slider-content'});
		this.mainSlider.appendChild(this.mainSliderContent);
		this.secondSliderContent = new Element('div', {'class': 'dway-second-slider-content'});
		this.secondSlider.appendChild(this.secondSliderContent);
		this.thirdSliderContent = new Element('div', {'class': 'dway-third-slider-content'});
		this.thirdSlider.appendChild(this.thirdSliderContent);
		
		//setup controls
		this.controls = [];
		this.controlsPanel = new Element('div', {'class': 'dway-controls'});
		this.controlsPanel.wrap(this.container);
		this.controlsList = new Element('ul');
		this.controlsList.wrap(this.controlsPanel);
		
		//seperatly add class names for IE
		if (Prototype.Browser.IE) {
			this.container.addClassName('dway-slideshow');
			this.mainSlider.addClassName('dway-main-slider');
			this.secondSlider.addClassName('dway-second-slider');
			this.thirdSlider.addClassName('dway-third-slider');
			
			this.mainSliderContent.addClassName('dway-main-slider-content');
			this.secondSliderContent.addClassName('dway-second-slider-content');
			this.thirdSliderContent.addClassName('dway-third-slider-content');
			
			this.controlsPanel.addClassName('dway-controls');
		}
		
		//transfer contents from li-items to sliders
		this.mainImages = [];
		this.secondImages = [];
		this.thirdImages = [];
		
		for (var i = 0; i < this.listItems.length; i += 3) {
			var mainImage = this.listItems[i].down();
			this.mainSliderContent.insert({bottom: mainImage});
			this.mainImages.push(mainImage);
			this.listItems[i].remove();
			
			var secondImage = this.listItems[i+1].down();
			this.secondSliderContent.insert({top: secondImage});
			this.secondImages.push(secondImage);
			this.listItems[i+1].remove();
			
			var thirdImage = this.listItems[i+2].down();
			this.thirdSliderContent.appendChild(thirdImage);
			this.thirdImages.push(thirdImage);
			this.listItems[i+2].remove();
			
			var control = new Element('li');
			var controlLink = new Element('a', {'href': '#' + (i / 3)}).observe('click', this.events.click);
			control.appendChild(controlLink);
			this.controlsList.appendChild(control);
			this.controls.push(control);
		}
		
		//set width of thirdSliderContent
		var thirdImagesWidth = this.thirdSlider.down().getWidth();
		this.thirdSliderContent.setStyle({width: (thirdImagesWidth*this.thirdImages.length) + 'px'});
		
		this.moveTo(this.options.startIndex, {duration: 0});
		
		this.wrapper.down('ul').remove();

		//start
		if (this.options.autoStart)
			this.start();
	},
	
	click: function(event) {
		this.stop();

		//cancel current effect
		if (this.scrolling) {
			if (!Prototype.Browser.IE)
				this.scrolling.cancel();
			else {
				this.scrolling.invoke('cancel');
			}
		}
		
		var element = Event.findElement(event, 'a');
		var next = element.href.split('#')[1];
		this.moveTo(next);
		Event.stop(event);
	},
	
	moveTo: function(index) {
		var options = arguments[1] || {};
		var duration = options.duration
		
		if (typeof duration == 'undefined')
			duration = this.options.duration;
			
		this.currentIndex = index;
		
		this.updateControls();
		
		var mainImage = this.mainImages[index];
		var secondImage = this.secondImages[index];
		var thirdImage = this.thirdImages[index];
		
		//calculate offsets
		var mainContainerOffset = Element.cumulativeOffset(this.mainSlider);
		var mainImageOffset = Element.cumulativeOffset(mainImage);
		var mainX = (mainImageOffset[0]-mainContainerOffset[0]);
		var mainY = (mainImageOffset[1]-mainContainerOffset[1]);
		
		var secondContainerOffset = Element.cumulativeOffset(this.secondSlider);
		var secondImageOffset = Element.cumulativeOffset(secondImage);
		var secondX = (secondImageOffset[0]-secondContainerOffset[0]);
		var secondY = (secondImageOffset[1]-secondContainerOffset[1]);
		
		var thirdContainerOffset = Element.cumulativeOffset(this.thirdSlider);
		var thirdImageOffset = Element.cumulativeOffset(thirdImage);
		var thirdX = (thirdImageOffset[0]-thirdContainerOffset[0]);
		var thirdY = (thirdImageOffset[1]-thirdContainerOffset[1]);
		
		if (!Prototype.Browser.IE) {
			this.scrolling = new Effect.Parallel([
				new Effect.SmoothScroll(this.mainSlider, {x: mainX, y: mainY}),
				new Effect.SmoothScroll(this.secondSlider, {x: secondX, y: secondY}),
				new Effect.SmoothScroll(this.thirdSlider, {x: thirdX, y: thirdY})
			], {duration: duration});
		} else {
			this.scrolling = [
				new Effect.SmoothScroll(this.mainSlider, {x: mainX, y: mainY, duration: duration}),
				new Effect.SmoothScroll(this.secondSlider, {x: secondX, y: secondY, duration: duration}),
				new Effect.SmoothScroll(this.thirdSlider, {x: thirdX, y: thirdY, duration: duration})
			];
		}
		
		return false;
	},
	
	updateControls: function() {
		for (var i = 0; i < this.controls.length; i++) {
			if (this.controls[i].down('a').href.split('#')[1] == this.currentIndex) {
				this.controls[i].down('a').addClassName('active');
			} else {
				if (this.controls[i].down('a').hasClassName('active'))
					this.controls[i].down('a').removeClassName('active');
			}
		}
	},
	
	start: function() {
		this.currentIndex = 0;
		this.periodicallyUpdate();
	},
	
	stop: function() {
		clearTimeout(this.timer);
	},
	
	periodicallyUpdate: function() {
		if (this.timer != null) {
			clearTimeout(this.timer);
			this.next();
		}
		this.timer = setTimeout(this.periodicallyUpdate.bind(this), this.options.frequency*1000);
	},
	
	next: function() {
		if (this.currentIndex) {
			var nextIndex = (this.mainImages.length -1 == this.currentIndex) ? 0 : this.currentIndex +1;
		} else
			var nextIndex = 1;
			
			this.moveTo(nextIndex);
	}
});