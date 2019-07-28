/*Function.prototype.bind = function (bind) {
    var self = this;
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return self.apply(bind || null, args);
    };
};*/

var isInt = function(n) {
    return (n % 1) === 0;
};

var TRANSITIONEND = 'transitionend webkitTransitionEnd oTransitionEnd';

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 16);
          };
})();

var getUrlVars = function() {
	//from http://snipplr.com/view/19838/get-url-parameters/
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var distanceTo = function(x, y, x2, y2) {
    var distX = Math.abs(x - x2);
    var distY = Math.abs(y - y2);

    return (distX > distY) ? distX : distY;
};

var random = function(range) {
    return Math.floor(Math.random() * range);
};
var randomRange = function(min, max) {
    return min + (Math.random() * (max - min));
};
var randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

var SendNative = function(data) {
	if (typeof Native !== 'undefined') {
		var newData = JSON.stringify(data)
	        newData = newData.replace("null", "0");
		//log.info("newData="+newData);
	        Native("dataCallback",newData);
	}
}

var fixed = function(value, length) {
    var buffer = '00000000' + value;
    return buffer.substring(buffer.length - length);
}

String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

var wait = function(ms) {
	var start = new Date().getTime();
	var end = start;
	while(end < start + ms) {
		end = new Date().getTime();
	}
}

var _base64ToArrayBuffer = function(base64) {
	var bin_string = window.atob(base64);
	var l = bin_string.length;
	var bytes = new Uint8Array(l);
	for (var i=0; i < l; ++i)
	{
		bytes[i] = bin_string.charCodeAt(i);	
	}
	return bytes.buffer;
}

var _arrayBufferToBase64 = function(buffer) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

var removeDoubleQuotes = function (val) {
	return val.toString().replace(/^"(.+(?="$))"$/,'$1');	
}

var isChest= function (id) {
	var exp = /^20[0-9].*$/;
	return exp.test(id);	
}
var isItem = function (id) {
	var exp = /^3[0-9].*$/;
	return exp.test(id);	
}
var isGather = function (id) {
	var exp = /^4[0-9].*$/;
	return exp.test(id);	
}
var isPlayer = function (id) {
	var exp = /^5[0-9].*$/;
	return exp.test(id);	
}
var isNpcPlayer = function (id) {
	var exp = /^6[0-9].*$/;
	return exp.test(id);	
}
var isMob = function (id) {
	var exp = /^7[0-9].*$/;
	return exp.test(id);	
}
var isNpc = function (id) {
	var exp = /^8[0-9].*$/;
	return exp.test(id);	
}
var isPet = function (id) {
	var exp = /^9[0-9].*$/;
	return exp.test(id);	
}

var rgb2hex = function (rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ?
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
var shuffle = function (a) {
    return;
}

var manhattenDistance = function (pos1, pos2) {
	return Math.abs(pos1.x-pos2.x) + Math.abs(pos1.y-pos2.y);
}

    var pointerEventToXY = function(e){
      var out = {x:0, y:0};
      if (e.originalEvent.hasOwnProperty('touches'))
      {
      	var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]; 
        out.x = touch.pageX;
        out.y = touch.pageY;
      } else {
        out.x = e.pageX;
        out.y = e.pageY;
      }
      return out;
    }

Number.prototype.clamp = function (min, max) {
	return Math.min(Math.max(this, min), max);
};

var remainder = function (a, b)
{
    return a - (a / b) * b;
}



