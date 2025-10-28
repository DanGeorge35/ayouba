/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import * as moment from 'moment-timezone';
import configuration from 'src/libs/configuration';
import { Logger } from '@nestjs/common';
import { Environment } from '../middlewares/power.enum';
import { AxiosError } from 'axios';
import { Request } from 'express';

const config = configuration();

export class Helpers {
  static readonly logger = new Logger(Helpers.name);
  static generateRequestId() {
    const watDate = new Date();
    const year = watDate.getFullYear().toString();
    const month = (watDate.getMonth() + 1).toString().padStart(2, '0');
    const day = watDate.getDate().toString().padStart(2, '0');
    const hours = watDate.getHours().toString().padStart(2, '0');
    const minutes = watDate.getMinutes().toString().padStart(2, '0');

    const randomValue = Math.floor(Math.random() * 9999999999);
    return `${year}${month}${day}${hours}${minutes}${randomValue}`;
  }

  public static generateTransactionId(incrementId: number): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');

    const paddedId = incrementId.toString().padStart(6, '0'); // Adjust padding if needed
    return `${year}${month}${day}${hour}${minute}${paddedId}`;
  }

  public static generate16TransactionId(incrementId: number): string {
    const paddedId = incrementId.toString().padStart(16, '0'); // Pad to 9 digits

    return paddedId.toString(); // Total = 4 + 9 = 13 digits
  }

  public static generate13TransactionId(incrementId: number): string {
    const paddedId = incrementId.toString().padStart(13, '0'); // Pad to 9 digits

    return paddedId.toString(); // Total = 4 + 9 = 13 digits
  }

  public static generate13RandomDigits(): string {
    const prefix = '3035'; // Fixed 4-digit prefix
    const timestamp = Date.now().toString(); // 13-digit millisecond timestamp

    // Take the last 9 digits of timestamp to ensure total is 13 digits
    const trimmedTimestamp = timestamp.slice(-9); // e.g., '845637281'

    return prefix + trimmedTimestamp; // Final result: '3035845637281'
  }

  public static generate16RandomDigits(): string {
    const watDate = Date.now().toString(); // 13-digit timestamp as string
    const randomValue = Math.floor(Math.random() * 1_000_000_000).toString(); // up to 9 digits

    // Combine and ensure final result is exactly 16 digits
    const combined = (watDate + randomValue).slice(0, 16);

    return combined.padEnd(16, '0'); // just in case combined is shorter than 16
  }

  static generatPaymentReference() {
    const paymentRef = `${randomUUID().replace(/-/g, '').toUpperCase()}`;
    return paymentRef;
  }

  private static padStart(number: number): string {
    return String(number).padStart(2, '0');
  }

  static getWATDateTime() {
    return new Date().toLocaleString('en-GB', {
      timeZone: 'Africa/Lagos',
    });
  }

  static getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    let ip: string | undefined;

    if (typeof forwarded === 'string') {
      // take the first IP in the list
      ip = forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded)) {
      // handle rare case where multiple headers are present
      ip = forwarded[0].trim();
    } else {
      // fallback to direct connection IP
      ip = req.socket?.remoteAddress || req.ip || '';
    }

    // clean IPv6 localhost (::ffff:127.0.0.1 → 127.0.0.1)
    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    return ip;
  }

  static dateFormat(date: Date | string): string {
    const newDate: Date = new Date(date);

    return `${newDate.getFullYear()}-${Helpers.padStart(
      newDate.getMonth() + 1,
    )}-${Helpers.padStart(newDate.getDate())}`;
  }

  static getWATDateTimestamp(): string {
    const currentTime = moment.tz.setDefault(config.app.timezone);
    return currentTime.format('YYYY-MM-DD HH:mm:ss');
  }

  static getWATDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      timeZone: 'Africa/Lagos',
    });
  }

  static dateFormatToDateformatWAT(dateString: string): string {
    const dateStringToks: string[] = dateString.split('-');

    return `${dateStringToks[2]}/${dateStringToks[1]}/${dateStringToks[0]}`;
  }

  static async fetchMockfile(filePath: string, fileName: string) {
    const originalFile = path.join(process.cwd(), filePath, fileName);

    const response = await fs.readFile(originalFile, 'utf-8');

    return JSON.parse(response);
  }

  static getCurrentEnvironment(): string {
    return config.app.debug === 'false'
      ? Environment.LIVE
      : Environment.SANDBOX;
  }

  static formatErrorResponse(error) {
    const axiosError = error as AxiosError;

    const response = axiosError.response;
    const requestConfig = axiosError.config;

    const cleanConfig = requestConfig
      ? {
          url: requestConfig.url,
          method: requestConfig.method,
          data: requestConfig.data,
          params: requestConfig.params,
          timeout: requestConfig.timeout,
          // exclude headers
        }
      : null;

    return {
      code: axiosError.code ?? null,
      message: axiosError.message ?? 'An unknown error occurred',
      status: response?.status ?? null,
      errorType: axiosError.name ?? 'AxiosError',
      responseData: response?.data ?? null,
      request: cleanConfig,
    };
  }

  static sanitizeAllSecrets(input: string): string {
    const keyNames = [
      'secret',
      'key',
      'secret-key',
      'api-key',
      'access_token',
      'access-token',
      'authorization',
      'auth-token',
      'bearer',
    ];

    const jsonPattern = new RegExp(
      `"(?:${keyNames.join('|')})"\\s*:\\s*"[^"]*"`,
      'gi',
    );

    const kvPattern = new RegExp(
      `(?:${keyNames.join('|')})\\s*[:=]\\s*[^\\s",]+`,
      'gi',
    );

    return input
      .replace(jsonPattern, (match) => {
        const key = match.split(':')[0];
        return `${key}: "[REDACTED]"`;
      })
      .replace(kvPattern, (match) => {
        const [key] = match.split(/[:=]/);
        return `${key}=[REDACTED]`;
      });
  }
}
