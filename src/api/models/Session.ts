/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Session = {
    /**
     * JWT — short-lived (~1 hour)
     */
    access_token?: string;
    /**
     * Used to obtain a new access_token
     */
    refresh_token?: string;
    /**
     * Unix timestamp
     */
    expires_at?: number;
    token_type?: string;
};

