/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Message } from '../models/Message';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessagesService {
    /**
     * Get my SMS history
     * @param numberId Filter to a specific number
     * @param limit
     * @returns any Array of messages
     * @throws ApiError
     */
    public static getApiMessages(
        numberId?: string,
        limit: number = 50,
    ): CancelablePromise<{
        messages?: Array<Message>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/messages',
            query: {
                'number_id': numberId,
                'limit': limit,
            },
            errors: {
                401: `Not authenticated`,
            },
        });
    }
}
