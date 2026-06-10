/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from '../models/Profile';
import type { Session } from '../models/Session';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Create a new account
     * Registers a new user with email + password. Sends a 6-digit OTP to the email.
     * @param requestBody
     * @returns any OTP sent
     * @throws ApiError
     */
    public static postApiAuthSignup(
        requestBody: {
            email: string;
            password: string;
            name?: string;
        },
    ): CancelablePromise<{
        ok?: boolean;
        needsOtpVerification?: boolean;
        email?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid email or password too short`,
            },
        });
    }

    /**
     * Verify email with OTP
     * @param requestBody
     * @returns any Account confirmed
     * @throws ApiError
     */
    public static postApiAuthVerifyOtp(
        requestBody: {
            email: string;
            otp: string;
        },
    ): CancelablePromise<{
        ok?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/verify-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid or expired OTP`,
            },
        });
    }

    /**
     * Resend OTP
     * @param requestBody
     * @returns any OTP resent
     * @throws ApiError
     */
    public static postApiAuthResendOtp(
        requestBody: {
            email: string;
        },
    ): CancelablePromise<{
        ok?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/resend-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `No pending signup found`,
            },
        });
    }
    /**
     * Sign in with email + password
     * @param requestBody
     * @returns any Signed in
     * @throws ApiError
     */
    public static postApiAuthSignin(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        ok?: boolean;
        user?: User;
        session?: Session;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/signin',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Exchange a refresh_token for a new session
     * Call this when access_token expires (typically every hour).
     * @param requestBody
     * @returns any Fresh session
     * @throws ApiError
     */
    public static postApiAuthRefresh(
        requestBody: {
            refresh_token: string;
        },
    ): CancelablePromise<{
        ok?: boolean;
        user?: User;
        session?: Session;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid or expired refresh_token`,
            },
        });
    }
    /**
     * Send a passwordless login link
     * Emails a one-tap login link. For mobile apps, set `redirect_to` to your deep-link URL (e.g. `rakam://auth/callback`) configured in Supabase Auth → URL Configuration.
     * @param requestBody
     * @returns any Email sent
     * @throws ApiError
     */
    public static postApiAuthMagicLink(
        requestBody: {
            email: string;
            redirect_to?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/magic-link',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid email`,
            },
        });
    }
    /**
     * Get current user + profile
     * @returns any Authenticated user
     * @throws ApiError
     */
    public static getApiAuthMe(): CancelablePromise<{
        user?: User;
        profile?: Profile;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
            errors: {
                401: `Not authenticated`,
            },
        });
    }
}
