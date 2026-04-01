# JavaScript Programming Best Practices

This instructions file establishes the coding standards and best practices for all JavaScript code in this project. These rules are based on the official [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types), the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript), and the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html).

## 1. Code Layout
- Use 2 spaces per indentation level. Do not use tabs.
- Limit all lines to a maximum of 100 characters.
- Always use semicolons to terminate statements.
- Place all import statements at the top of the file.
- Use one statement per line.

## 2. Naming Conventions
- Use `camelCase` for variable names, function names, and object properties.
- Use `PascalCase` for class and constructor names.
- Use `UPPER_CASE` for constants that are exported and never reassigned.
- Do not use leading or trailing underscores for property or method names.
- Be descriptive and avoid single-letter names except for counters or iterators.

## 3. Variables and Constants
- Prefer `const` for all variables that are not reassigned; use `let` otherwise. Avoid `var`.
- Declare variables as close as possible to their first use.
- Do not chain variable declarations; use one `const` or `let` per variable.

## 4. Functions
- Use arrow functions for anonymous functions and callbacks.
- Use named function expressions for clarity.
- Never use the `Function` constructor or `eval()`.
- Use default parameter syntax and rest parameters (`...args`).
- Never mutate or reassign function parameters.

## 5. Objects and Arrays
- Use object and array literal syntax (`{}` and `[]`).
- Use trailing commas in multi-line object and array literals.
- Use object and array destructuring when accessing multiple properties or elements.
- Use computed property names when needed.

## 6. Strings
- Use single quotes (`'`) for strings. Use template literals (`` ` ``) for interpolation or multi-line strings.
- Do not use string concatenation for building complex strings; prefer template literals.

## 7. Classes
- Use ES6 `class` syntax for object-oriented code.
- Define all fields in the constructor.
- Use `extends` for inheritance.
- Avoid manipulating prototypes directly.

## 8. Comments and Documentation
- Use `//` for single-line comments and `/** ... */` for multi-line or JSDoc comments.
- Place comments above the code they reference.
- Start all comments with a space.
- Use JSDoc for documenting functions, classes, and exported constants.

## 9. Control Structures
- Always use braces `{}` for all control blocks (if, else, for, while, etc.).
- Place a space before the opening parenthesis in control statements.
- Use `===` and `!==` for equality checks.

## 10. Miscellaneous
- Avoid using `with`, `eval`, and modifying built-in objects.
- Prefer higher-order array methods (`map`, `filter`, `reduce`) over loops when possible.
- End files with a single newline character.
- Avoid multiple blank lines.

## 11. Tooling
- Use linters like `eslint` with the Airbnb or Google config to enforce style.
- Use formatters like `prettier` for consistent formatting.

---

**Scope:** These rules apply to all JavaScript files in this project. For exceptions or project-specific conventions, document them clearly in this file.

**References:**
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

---

**Example prompts:**
- "Format this file according to the project's JavaScript best practices."
- "Does this function follow our JavaScript naming conventions?"
- "Add JSDoc comments to all public functions as per our standards."

**Next steps:**
- Consider adding instructions for testing, dependency management, or project structure.
- Review and update this file as the project evolves.
