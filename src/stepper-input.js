// @flow
(function (window: Window) {
  const numberInputs: NodeList<HTMLElement> = document.querySelectorAll('input[type="number"]')

  const keyboardKeys = Object.freeze({
    ArrowDown: 'ArrowDown',
    ArrowUp: 'ArrowUp',
  })

  const keyCodes: $Exact<{ [key: $Values<typeof keyboardKeys>]: number }> = {
    ArrowDown: 40,
    ArrowUp: 38,
  }

  const uiEventTypes = Object.freeze({
    keydown: 'keydown',
    keypress: 'keypress',
    keyup: 'keyup',
  })

  function createKeyEvent (key: $Keys<typeof keyCodes>, type: $Values<typeof uiEventTypes>) {
    const keyboardEvent = new KeyboardEvent(uiEventTypes[type], {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      code: key,
      composed: true,
      key,
      keyCode: keyCodes[key],
      view: window,
      which: keyCodes[key],
    })

    return keyboardEvent
  }

  function getDecimalPlaces (number: number) {
    if (number === parseInt(number)) {
      return 0
    }

    const string = (number + '').trim()

    return string.substr(string.indexOf('.') + 1).length
  }

  function clamp (value: number, min: ?number, max: ?number): number {
    value = typeof min === 'number' ? Math.max(min, value) : value
    value = typeof max === 'number' ? Math.min(max, value) : value

    return value
  }

  const trimEndRegex = /[.,]0+$/

  function updateNumberInputValue (numberInput: HTMLInputElement, key: $Keys<typeof keyCodes>, type: $Values<typeof uiEventTypes>) {
    const sign = { ArrowDown: -1, ArrowUp: 1 }[key]

    const step = parseFloat(numberInput.step) || 1

    const decimalPlaces = getDecimalPlaces(step)

    const min = numberInput.min ? parseFloat(numberInput.min) : undefined
    const max = numberInput.max ? parseFloat(numberInput.max) : undefined
    const value = clamp((parseFloat(numberInput.value) || 0) + sign * step, min, max)

    numberInput.value = value.toFixed(decimalPlaces).replace(trimEndRegex, '')

    numberInput.dispatchEvent(createKeyEvent(key, type))
    numberInput.dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true,
    }))
    numberInput.dispatchEvent(new Event('change', {
      bubbles: true,
      cancelable: true,
      composed: false,
    }))
  }

  let intervalID
  let timeoutID
  const repeatInterval = 50
  const waitTimeout = 300

  function repeatUpdateNumberInputValue (numberInput: HTMLInputElement, key: $Keys<typeof keyCodes>, type: $Values<typeof uiEventTypes>) {
    if (!intervalID) {
      intervalID = setInterval(updateNumberInputValue.bind(null, numberInput, key, type), repeatInterval)
    }
  }

  function enhance (numberInput: HTMLInputElement, increment: HTMLSpanElement, decrement: HTMLSpanElement) {
    function onArrowDownStart (event: Event) {
      event.preventDefault()

      if (!timeoutID) {
        numberInput.dispatchEvent(createKeyEvent(keyboardKeys.ArrowDown, uiEventTypes.keydown))
        timeoutID = setTimeout(repeatUpdateNumberInputValue.bind(null, numberInput, keyboardKeys.ArrowDown, uiEventTypes.keydown), waitTimeout)
      }
    }

    function onArrowDownEnd (event: Event) {
      event.preventDefault()

      intervalID = clearInterval(intervalID)
      timeoutID = clearTimeout(timeoutID)
      updateNumberInputValue(numberInput, keyboardKeys.ArrowDown, uiEventTypes.keyup)
      numberInput.focus()
    }

    function onArrowUpStart (event: Event) {
      event.preventDefault()

      if (!timeoutID) {
        numberInput.dispatchEvent(createKeyEvent(keyboardKeys.ArrowUp, uiEventTypes.keydown))
        timeoutID = setTimeout(repeatUpdateNumberInputValue.bind(null, numberInput, keyboardKeys.ArrowUp, uiEventTypes.keydown), waitTimeout)
      }
    }

    function onArrowUpEnd (event: Event) {
      event.preventDefault()

      intervalID = clearInterval(intervalID)
      timeoutID = clearTimeout(timeoutID)
      updateNumberInputValue(numberInput, keyboardKeys.ArrowUp, uiEventTypes.keyup)
      numberInput.focus()
    }

    decrement.onmousedown = onArrowDownStart
    decrement.onmouseup = onArrowDownEnd
    // $FlowIgnore
    decrement.ontouchend = onArrowDownEnd
    // $FlowIgnore
    decrement.ontouchstart = onArrowDownStart

    increment.onmousedown = onArrowUpStart
    increment.onmouseup = onArrowUpEnd
    // $FlowIgnore
    increment.ontouchend = onArrowUpEnd
    // $FlowIgnore
    increment.ontouchstart = onArrowUpStart
  }

  function wrapInputElements (numberInput: HTMLElement) {
    if (numberInput instanceof HTMLInputElement) {
      const wrapper = document.createElement('span')
      const parentElement = numberInput.parentElement

      if (parentElement) {
        parentElement.replaceChild(wrapper, numberInput)

        numberInput.classList.add('stepper-input::input')
        wrapper.classList.add('stepper-input::wrapper')

        const increment = document.createElement('span')
        const decrement = document.createElement('span')

        increment.classList.add('stepper-input::increment')
        decrement.classList.add('stepper-input::decrement')

        wrapper.appendChild(numberInput)
        wrapper.appendChild(increment)
        wrapper.appendChild(decrement)

        enhance(numberInput, increment, decrement)
      }
    }
  }

  numberInputs.forEach(wrapInputElements)
}(window))
