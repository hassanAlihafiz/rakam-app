/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * Billing webhook receiver
     * Receives signed subscription events from our billing provider. Handles plan changes, renewals, and cancellations. On a new subscription, automatically provisions phone number(s) according to the chosen plan.
     *
     * **Authentication:** signed payload (verified by a shared secret). Never call this endpoint directly — it is invoked server-to-server only.
     * @returns any Event processed
     * @throws ApiError
     */
    public static postApiRakamWebhook(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rakam/webhook',
            errors: {
                401: `Invalid signature`,
                500: `Processing error`,
            },
        });
    }
    /**
     * Inbound SMS receiver
     * Receives incoming SMS for any Rakam number. Saves the message to the database which triggers a real-time push to the recipient's app.
     *
     * **Authentication:** signed payload (ed25519). Never call this endpoint directly — it is invoked server-to-server only.
     * @returns any Message saved (or no-op if not an inbound event)
     * @throws ApiError
     */
    public static postApiRakamSms(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rakam/sms',
            errors: {
                401: `Invalid signature`,
            },
        });
    }
}
