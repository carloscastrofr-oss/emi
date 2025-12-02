/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Cambios en documentación
        'style',    // Formato, espacios (sin cambios de lógica)
        'refactor', // Refactorización sin cambiar funcionalidad
        'perf',     // Mejoras de rendimiento
        'test',     // Agregar o corregir tests
        'build',    // Cambios en build o dependencias
        'ci',       // Configuración de CI/CD
        'chore',    // Mantenimiento general
        'revert',   // Revertir commit anterior
      ],
    ],
    // Descripción no puede estar vacía
    'subject-empty': [2, 'never'],
    // Tipo no puede estar vacío
    'type-empty': [2, 'never'],
    // Tipo siempre en minúsculas
    'type-case': [2, 'always', 'lower-case'],
    // Descripción en minúsculas
    'subject-case': [2, 'always', 'lower-case'],
    // Sin punto al final
    'subject-full-stop': [2, 'never', '.'],
    // Máximo 100 caracteres en header
    'header-max-length': [2, 'always', 100],
    // Scope es opcional (deshabilitado por ahora)
    'scope-empty': [0, 'never'],
  },
};

