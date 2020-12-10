Stepper Input
=============

A thin drop-in wrapper around the number type input.

**Features:**

- No dependencies
- Minimum styles to override
- Style increment/decrement with CSS
- Works with step, min, max attributes
- Touch devices supported
- Long press for fast value change
- Same as keyboard behaviour
- Triggers input & change events (open console)
- Triggers keyup & keydown events (open console)
- Fallback to browser defaults without Javascript

Demo: https://attitude.github.io/stepper-input.js/

Usage
-----

1. Add styles to `<head>` tag:

```html
<link href="https://attitude.github.io/stepper-input.js/dist/stepper-input.css" rel="stylesheet">
```

2. Add script at the end of `<body>` tag:

```html
<script async src="https://attitude.github.io/stepper-input.js/dist/stepper-input.min.js"></script>
```

Styling
-------

```css
.stepper-input\:\:wrapper {
  /* styles for the input wrapper */
}
.stepper-input\:\:input {
  /* styles for the wrapepd input */
}
.stepper-input\:\:decrement {
  /* styles for the - button */
}
.stepper-input\:\:increment {
  /* styles for the + button */
}
.stepper-input\:\:decrement::before {
  content: "-"; /* change sign */
}
.stepper-input\:\:increment::before {
  content: "+"; /* change sign */
}

```


Event constructor Polyfill: https://www.npmjs.com/package/event-constructor-polyfill
