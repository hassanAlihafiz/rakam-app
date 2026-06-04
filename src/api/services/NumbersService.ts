/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PhoneNumber } from '../models/PhoneNumber';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NumbersService {
    /**
     * List my active numbers
     * @returns any Array of active numbers
     * @throws ApiError
     */
    public static getApiNumbers(): CancelablePromise<{
        numbers?: Array<PhoneNumber>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/numbers',
            errors: {
                401: `Not authenticated`,
            },
        });
    }
    /**
     * Release (cancel) a number
     * Marks the number as released in our DB and frees it on Telnyx. Only the owner can call.
     * @param id
     * @returns any Released
     * @throws ApiError
     */
    public static postApiNumbersRelease(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/numbers/{id}/release',
            path: {
                'id': id,
            },
            errors: {
                401: `Not authenticated`,
                404: `Number not found or not yours`,
            },
        });
    }
}
