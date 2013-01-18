var dom = new Object();
dom.event = new Object();

dom.event.addEventListener = function(elm, type, func, useCapture) {
  if(! elm) { return false; }
  if(! useCapture) {
    useCapture = false;
  }
  if(elm.addEventListener) {
    elm.addEventListener(type, func, false);
  } else if(elm.attachEvent) {
    elm.attachEvent('on'+type, func);
  } else {
    return false;
  }
  return true;
};

dom.event.removeEventListener = function(elm, type, func, useCapture) {
  if(! elm) { return false; }
  if(! useCapture) {
    useCapture = false;
  }
  if(elm.removeEventListener) {
    box.removeEventListener(type, func, false);
  } else if(elm.detachEvent) {
    elm.detachEvent('on'+type, func);
  } else {
    return false;
  }
  return true;
};

dom.event.target = function(evt) {
  if(evt && evt.target) {
    if(evt.target.nodeType == 3) {
      return evt.target.parentNode;
    } else {
      return evt.target;
    }
  } else if(window.event && window.event.srcElement) {
    return window.event.srcElement;
  } else {
    return null;
  }
};

dom.event.preventDefault = function(evt) {
  if(evt && evt.preventDefault) {
    evt.preventDefault();
    evt.currentTarget['on'+evt.type] = function() {return false;};
  } else if(window.event) {
    window.event.returnValue = false;
  }
};

dom.event.stopPropagation = function(evt) {
  if(evt && evt.stopPropagation) {
    evt.stopPropagation();
  } else if(window.event) {
    window.event.cancelBubble = true;
  }
};

dom.event.dispatchEvent = function(elm, evttype) {
  if(elm.dispatchEvent) {
    var evt = document.createEvent('MouseEvents');
    evt.initEvent(evttype, true, true);
    elm.dispatchEvent(evt);
  } else if(window.event) {
    var evt = document.createEventObject();
    evt.button = 1;
    elm.fireEvent('on'+evttype, evt);
  }
}
