"use strict";

(function (window) {
  var numberInputs = document.querySelectorAll('input[type="number"]');
  var keyboardKeys = Object.freeze({
    ArrowDown: 'ArrowDown',
    ArrowUp: 'ArrowUp'
  });
  var keyCodes = {
    ArrowDown: 40,
    ArrowUp: 38
  };
  var uiEventTypes = Object.freeze({
    keydown: 'keydown',
    keypress: 'keypress',
    keyup: 'keyup'
  });

  function createKeyEvent(key, type) {
    var keyboardEvent = new KeyboardEvent(uiEventTypes[type], {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      code: key,
      composed: true,
      key: key,
      keyCode: keyCodes[key],
      view: window,
      which: keyCodes[key]
    });
    return keyboardEvent;
  }

  function getDecimalPlaces(number) {
    if (number === parseInt(number)) {
      return 0;
    }

    var string = (number + '').trim();
    return string.substr(string.indexOf('.') + 1).length;
  }

  function clamp(value, min, max) {
    value = typeof min === 'number' ? Math.max(min, value) : value;
    value = typeof max === 'number' ? Math.min(max, value) : value;
    return value;
  }

  var trimEndRegex = /[.,]0+$/;

  function updateNumberInputValue(numberInput, key, type) {
    var sign = {
      ArrowDown: -1,
      ArrowUp: 1
    }[key];
    var step = parseFloat(numberInput.step) || 1;
    var decimalPlaces = getDecimalPlaces(step);
    var min = numberInput.min ? parseFloat(numberInput.min) : undefined;
    var max = numberInput.max ? parseFloat(numberInput.max) : undefined;
    var value = clamp((parseFloat(numberInput.value) || 0) + sign * step, min, max);
    numberInput.value = value.toFixed(decimalPlaces).replace(trimEndRegex, '');
    numberInput.dispatchEvent(createKeyEvent(key, type));
    numberInput.dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    numberInput.dispatchEvent(new Event('change', {
      bubbles: true,
      cancelable: true,
      composed: false
    }));
  }

  var intervalID;
  var timeoutID;
  var repeatInterval = 50;
  var waitTimeout = 300;

  function repeatUpdateNumberInputValue(numberInput, key, type) {
    if (!intervalID) {
      intervalID = setInterval(updateNumberInputValue.bind(null, numberInput, key, type), repeatInterval);
    }
  }

  function enhance(numberInput, increment, decrement) {
    function onArrowDownStart(event) {
      event.preventDefault();

      if (!timeoutID) {
        numberInput.dispatchEvent(createKeyEvent(keyboardKeys.ArrowDown, uiEventTypes.keydown));
        timeoutID = setTimeout(repeatUpdateNumberInputValue.bind(null, numberInput, keyboardKeys.ArrowDown, uiEventTypes.keydown), waitTimeout);
      }
    }

    function onArrowDownEnd(event) {
      event.preventDefault();
      intervalID = clearInterval(intervalID);
      timeoutID = clearTimeout(timeoutID);
      updateNumberInputValue(numberInput, keyboardKeys.ArrowDown, uiEventTypes.keyup);
      numberInput.focus();
    }

    function onArrowUpStart(event) {
      event.preventDefault();

      if (!timeoutID) {
        numberInput.dispatchEvent(createKeyEvent(keyboardKeys.ArrowUp, uiEventTypes.keydown));
        timeoutID = setTimeout(repeatUpdateNumberInputValue.bind(null, numberInput, keyboardKeys.ArrowUp, uiEventTypes.keydown), waitTimeout);
      }
    }

    function onArrowUpEnd(event) {
      event.preventDefault();
      intervalID = clearInterval(intervalID);
      timeoutID = clearTimeout(timeoutID);
      updateNumberInputValue(numberInput, keyboardKeys.ArrowUp, uiEventTypes.keyup);
      numberInput.focus();
    }

    decrement.onmousedown = onArrowDownStart;
    decrement.onmouseup = onArrowDownEnd; // $FlowIgnore

    decrement.ontouchend = onArrowDownEnd; // $FlowIgnore

    decrement.ontouchstart = onArrowDownStart;
    increment.onmousedown = onArrowUpStart;
    increment.onmouseup = onArrowUpEnd; // $FlowIgnore

    increment.ontouchend = onArrowUpEnd; // $FlowIgnore

    increment.ontouchstart = onArrowUpStart;
  }

  function wrapInputElements(numberInput) {
    if (numberInput instanceof HTMLInputElement) {
      var wrapper = document.createElement('span');
      var parentElement = numberInput.parentElement;

      if (parentElement) {
        parentElement.replaceChild(wrapper, numberInput);
        numberInput.classList.add('stepper-input::input');
        wrapper.classList.add('stepper-input::wrapper');
        var increment = document.createElement('span');
        var decrement = document.createElement('span');
        increment.classList.add('stepper-input::increment');
        decrement.classList.add('stepper-input::decrement');
        wrapper.appendChild(numberInput);
        wrapper.appendChild(increment);
        wrapper.appendChild(decrement);
        enhance(numberInput, increment, decrement);
      }
    }
  }

  numberInputs.forEach(wrapInputElements);
})(window);
