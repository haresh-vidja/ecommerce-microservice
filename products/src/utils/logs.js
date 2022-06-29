import winston from 'winston';  // Import winston for logging
import DailyRotateFile from 'winston-daily-rotate-file';  // Import DailyRotateFile for log rotation

const transporters = [];  // Initialize an array for log transporters

// Add console transporter if not in production environment
if (process.env.NODE_ENV != 'prod') {
    transporters.push(new winston.transports.Console({}));
}

// Logger class definition
class Logger {
    constructor() {
        this.logDir = 'logs';  // Directory for log files
        this.fileSize = '30m';  // Maximum size for log files before rotation
        this.formatType = 'tab';  // Default format type
        this.transporters = transporters;  // Transporters for logging
    }

    // Method to get the log format based on the format type
    getFormat(fileName) {
        if (this.formatType === 'tab') {
            // Tab-separated format
            return winston.format.printf(({ level, message, timestamp, ...meta }) => {
                if (typeof message === 'object') {
                    message = JSON.stringify(message);
                }
                let tags = meta[Symbol.for('splat')];
                if (tags && !!tags.length) {
                    tags.forEach((tag) => {
                        if (typeof tag !== 'string') {
                            tag = JSON.stringify(tag);
                        }
                        message += ` ${tag}`;
                    });
                }
                if (meta?.stack) {
                    message += ` ${meta?.stack}`;
                }

                if (!meta?.stack) {
                    tags?.map((obj) => {
                        if (obj instanceof Error) {
                            message += ` ${obj.stack}`;
                        }
                    });
                }

                return `${timestamp}\t${fileName}\t${level}\t${message}`;
            });
        } else {
            // Default format
            return winston.format.printf(({ level, message, timestamp, ...meta }) => {
                if (typeof message === 'object') {
                    message = JSON.stringify(message);
                }
                let tags = meta[Symbol.for('splat')];
                if (tags && !!tags.length) {
                    tags.forEach((tag) => {
                        if (typeof tag !== 'string') {
                            tag = JSON.stringify(tag);
                        }
                        message += ` ${tag}`;
                    });
                }

                if (meta?.stack) {
                    message += ` ${meta?.stack}`;
                }

                return `${timestamp} : ${level} : ${message}`;
            });
        }
    }

    // Method to format timestamp in RFC 3339 format with nanoseconds
    formatRFC3339Nano() {
        const date = new Date();
        const pad = (num, size) => String(num).padStart(size, '0');
      
        // Get milliseconds
        const ms = date.getMilliseconds();
      
        // Get high-resolution time using performance.now()
        const hrTime = process.hrtime();
      
        // Calculate the total nanoseconds (milliseconds + microseconds + additional nanoseconds)
        const millisecondsAsNs = ms * 1_000_000; // Convert milliseconds to nanoseconds
        const additionalNanoseconds = hrTime[1];
        const totalNanoseconds = millisecondsAsNs + additionalNanoseconds;
        const nanosecondsStr = pad(totalNanoseconds, 9).slice(0, 9);
      
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1, 2);
        const day = pad(date.getUTCDate(), 2);
        const hours = pad(date.getUTCHours(), 2);
        const minutes = pad(date.getUTCMinutes(), 2);
        const seconds = pad(date.getUTCSeconds(), 2);
      
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${nanosecondsStr}Z`;
    }

    // Method to get the complete log format
    format(fileName) {
        return winston.format.combine(
            winston.format.timestamp({
                format: () => {
                    return this.formatRFC3339Nano();
                }
            }),
            winston.format.errors({ stack: true }),
            this.getFormat(fileName)
        );
    }

    // Method to create a file transporter with daily rotation
    fileTransport(label) {
        return new DailyRotateFile({
            filename: `${this.logDir}/${label}_%DATE%.log`,
            datePattern: 'YYYY_MM_DD',
            maxSize: this.fileSize,
            utc: true
        });
    }

    // Method to create a logger instance
    logs(fileName) {
        let logTransporter = [...this.transporters, this.fileTransport(fileName)];
        return winston.createLogger({
            format: this.format(fileName),
            transports: logTransporter,
        });
    }
}

// Export an instance of the Logger class
export const logger = new Logger();
