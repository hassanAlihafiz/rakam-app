/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WaitlistService {
    /**
     * Join the pre-launch waitlist
     * Public endpoint. Saves email + (optional) country page intent + Vercel geo to Supabase. Duplicate emails are silently accepted.
     * @param requestBody
     * @returns any Joined
     * @throws ApiError
     */
    public static postApiWaitlist(
        requestBody: {
            email: string;
            countryPage?: string | null;
        },
    ): CancelablePromise<{
        ok?: boolean;
        duplicate?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/waitlist',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid email`,
            },
        });
    }
}
