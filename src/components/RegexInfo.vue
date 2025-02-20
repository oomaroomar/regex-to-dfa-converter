<template>
  <div class="flex flex-col items-center justify-center border-2 border-black p-2">
    <h1 class="text-2xl font-bold">Special characters for the regex</h1>
    <ul>
      <li>
        <code class="pr-4">+</code>
        <span>Union</span>
      </li>
      <li>
        <code class="pr-4">*</code>
        <span>Kleene Star</span>
      </li>
      <li>
        <code class="pr-4">(</code>
        <span>Left Parenthesis</span>
      </li>
      <li>
        <code class="pr-4">)</code>
        <span>Right Parenthesis</span>
      </li>
      <li>
        <code class="pr-4">$</code>
        <span
          >Is reserved for signaling the beginning of the input and is automatically added to the
          regex. Do not use it in your input.</span
        >
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
