/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PhoneNumber = {
    id?: string;
    user_id?: string;
    subscription_id?: string | null;
    telnyx_phone_number_id?: string | null;
    phone_number?: string;
    country?: PhoneNumber.country;
    status?: PhoneNumber.status;
    provisioned_at?: string;
    released_at?: string | null;
    created_at?: string;
};
export namespace PhoneNumber {
    export enum country {
        US = 'US',
        UK = 'UK',
    }
    export enum status {
        ACTIVE = 'active',
        RELEASED = 'released',
        SUSPENDED = 'suspended',
    }
}

