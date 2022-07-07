import winston from 'winston';                              // Winston logger
import DailyRotateFile from 'winston-daily-rotate-file';    // Daily rotation for file logs

// Initialize array to hold log transport methods
const transporters = [];

// Include console logs in non-production environments
if (process.env.NODE_ENV !== 'prod') {
    transporters.push(new winston.transports.Console({}));
}

/**
 * Logger class providing structured, timestamped logging with file rotation.
 */
class Logger {
    constructor() {
        this.logDir = 'logs';           // Directory to store log files
        this.fileSize = '30m';          // Max file size before rotating
        this.formatType = 'tab';        // Default format style: tab-separated
        this.transporters = transporters;
    }

    /**
     * Returns a Winston log formatter.
     * Supports `tab` format or default structured format.
     *
     * @param {string} fileName - Label or filename tag for the logger
     * @returns {Function} - Custom printf format
     */
    getFormat(fileName) {
        if (this.formatType === 'tab') {
            return winston.format.printf(({ level, message, timestamp, ...meta }) => {
                if (typeof message === 'object') message = JSON.stringify(message);

                const tags = meta[Symbol.for('splat')];
                if (tags && tags.length) {
                    tags.forEach(tag => {
                        message += ` ${typeof tag === 'string' ? tag : JSON.stringify(tag)}`;
                    });
                }

                if (meta?.stack) {
                    message += ` ${meta.stack}`;
                } else {
                    tags?.forEach(tag => {
                        if (tag instanceof Error) {
                            message += ` ${tag.stack}`;
                        }
                    });
                }

                return `${timestamp}\t${fileName}\t${level}\t${message}`;
            });
        } else {
            // Default format with colon-separated segments
            return winston.format.printf(({ level, message, timestamp, ...meta }) => {
                if (typeof message === 'object') message = JSON.stringify(message);

                const tags = meta[Symbol.for('splat')];
                if (tags && tags.length) {
                    tags.forEach(tag => {
                        message += ` ${typeof tag === 'string' ? tag : JSON.stringify(tag)}`;
                    });
                }

                if (meta?.stack) {
                    message += ` ${meta.stack}`;
                }

                return `${timestamp} : ${level} : ${message}`;
            });
        }
    }

    /**
     * Generates an RFC3339Nano UTC timestamp.
     * Includes nanoseconds, suitable for high-precision logs.
     *
     * @returns {string} - Timestamp in RFC3339Nano format
     */
    formatRFC3339Nano() {
        const date = new Date();
        const pad = (num, size) => String(num).padStart(size, '0');
        const ms = date.getMilliseconds();
        const hrTime = process.hrtime();
        const totalNanoseconds = ms * 1e6 + hrTime[1];
        const nanoStr = pad(totalNanoseconds, 9).slice(0, 9);

        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}T` +
               `${pad(date.getUTCHours(), 2)}:${pad(date.getUTCMinutes(), 2)}:${pad(date.getUTCSeconds(), 2)}.` +
               `${nanoStr}Z`;
    }

    /**
     * Combines all formatters into a complete log format.
     *
     * @param {string} fileName - Logger label
     * @returns {Format} - Winston combined formatter
     */
    format(fileName) {
        return winston.format.combine(
            winston.format.timestamp({ format: () => this.formatRFC3339Nano() }),
            winston.format.errors({ stack: true }),
            this.getFormat(fileName)
        );
    }

    /**
     * Creates a rotating file transport for the given label.
     *
     * @param {string} label - Logger label used in filename
     * @returns {Transport} - DailyRotateFile transport instance
     */
    fileTransport(label) {
        return new DailyRotateFile({
            filename: `${this.logDir}/${label}_%DATE%.log`,
            datePattern: 'YYYY_MM_DD',
            maxSize: this.fileSize,
            utc: true
        });
    }

    /**
     * Creates a new Winston logger instance with the given label.
     *
     * @param {string} fileName - Label (used for file name + tagging)
     * @returns {Logger} - Winston logger instance
     */
    logs(fileName) {
        const allTransports = [...this.transporters, this.fileTransport(fileName)];

        return winston.createLogger({
            format: this.format(fileName),
            transports: allTransports
        });
    }
}

// Export a singleton Logger instance
export const logger = new Logger();
