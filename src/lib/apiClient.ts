/**
 * App-facing API surface — re-exports from the generated OpenAPI client.
 * Import from here instead of `@/src/api` directly.
 */

import type { Message, PhoneNumber, Profile, Session, User } from '@/src/api';

// — Core —

export { ApiError, CancelablePromise, CancelError, OpenAPI } from '@/src/api';
export type { OpenAPIConfig } from '@/src/api';

// — Domain models —

export type { User, Session, Profile, Message } from '@/src/api';
export { PhoneNumber } from '@/src/api';
export type { Error as ApiErrorBody } from '@/src/api';

// — Services —

export { AuthService, NumbersService, MessagesService } from '@/src/api';

// — Request bodies —

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RefreshCredentials = {
  refresh_token: string;
};

export type MagicLinkRequest = {
  email: string;
  redirect_to?: string;
};

// — Response shapes (inline in generated services) —

export type SignupResponse = {
  ok?: boolean;
  needsOtpVerification?: boolean;
  email?: string;
};

export type SigninResponse = {
  ok?: boolean;
  user?: User;
  session?: Session;
};

export type Subscription = {
  plan_name?: string;
  renewal_date?: string;
  management_url?: string;
};

export type MeResponse = {
  user?: User;
  profile?: Profile;
  subscription?: Subscription;
};

export type NumbersListResponse = {
  numbers?: Array<PhoneNumber>;
};

export type MessagesListResponse = {
  messages?: Array<Message>;
};
