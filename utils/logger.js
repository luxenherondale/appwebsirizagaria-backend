/**
 * Utilidad para el registro de logs en la aplicación
 */

const fs = require('fs');
const path = require('path');

// Niveles de log
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Directorio de logs
const logsDir = path.join(__dirname, '..', 'logs');

// Asegurar que el directorio de logs exista
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Archivos de log
const errorLogPath = path.join(logsDir, 'errorlog');
const requestLogPath = path.join(logsDir, 'request.log');

/**
 * Registra un mensaje en el archivo de logs
 * @param {string} message - Mensaje a registrar
 * @param {string} level - Nivel de log (ERROR, WARN, INFO, DEBUG)
 * @param {Error} [error] - Error opcional para incluir stack trace
 */
const log = (message, level = LOG_LEVELS.INFO, error = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `${timestamp} - ${level}: ${message}`;
  
  // Añadir stack trace si hay un error
  if (error && error.stack) {
    logMessage += `\n${error.stack}`;
  }
  
  logMessage += '\n';
  
  // Registrar en consola
  console.log(logMessage);
  
  // Registrar en archivo según el nivel
  try {
    if (level === LOG_LEVELS.ERROR) {
      fs.appendFileSync(errorLogPath, logMessage);
    } else {
      fs.appendFileSync(requestLogPath, logMessage);
    }
  } catch (err) {
    console.error('Error al escribir en el archivo de log:', err);
  }
};

/**
 * Registra un mensaje de error
 * @param {string} message - Mensaje de error
 * @param {Error} [error] - Error opcional
 */
const error = (message, error = null) => {
  log(message, LOG_LEVELS.ERROR, error);
};

/**
 * Registra un mensaje de advertencia
 * @param {string} message - Mensaje de advertencia
 */
const warn = (message) => {
  log(message, LOG_LEVELS.WARN);
};

/**
 * Registra un mensaje informativo
 * @param {string} message - Mensaje informativo
 */
const info = (message) => {
  log(message, LOG_LEVELS.INFO);
};

/**
 * Registra un mensaje de depuración
 * @param {string} message - Mensaje de depuración
 */
const debug = (message) => {
  log(message, LOG_LEVELS.DEBUG);
};

module.exports = {
  LOG_LEVELS,
  log,
  error,
  warn,
  info,
  debug
};
