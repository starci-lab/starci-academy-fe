import { type GraphQLResponse } from "../../types"

/**
 * The shapes of the sign-in half of the auth graph, spelled exactly as the running back end
 * spells them - every name below was read out of the live schema by introspection, never
 * guessed from the shape of the screen.
 *
 * THE FLOW THESE TYPES DESCRIBE. Ordinary signing in is two round trips. `signInInit` takes
 * the credentials and answers with a CHALLENGE, then `signInVerifyOtp` trades that challenge
 * and code for an access token. One explicitly enabled local test identity may instead receive
 * the access token from init; the union below makes the client handle that exception directly.
 * `signInResendOtp` still answers only with a challenge.
 *
 * WHAT IS NOT HERE. The verify response carries an `accessToken` and NOTHING else: no refresh
 * token, no user, no expiry. Anything more that a session needs has to be asked for
 * separately, and a type here that promised it would be a promise this schema cannot keep.
 */

/** The credentials `signInInit` opens a challenge with. */
export interface SignInInitRequest {
    /** The address the account was registered with. */
    email: string
    /** The account password, sent once, at the start of the flow. */
    password: string
}

/**
 * A challenge that has been opened and whose code is now in flight.
 *
 * `expiresInSeconds` is a DURATION, not a deadline, so it is only meaningful next to the
 * moment the response arrived - a component that stores it without that moment is storing a
 * number that silently stops being true.
 */
export interface SignInChallengeData {
    /** Opaque id of the open challenge; every later step of the flow quotes it. */
    challengeId: string
    /** How long the code stays valid, counted from when this response was produced. */
    expiresInSeconds: number
}

/** The two valid outcomes of sign-in init; mixed challenge/session data is not representable. */
export type SignInInitData = SignInChallengeData | SignInSessionData

/** Narrow a sign-in init result to the direct local test session branch. */
export const isSignInSessionData = (data: SignInInitData): data is SignInSessionData => {
    return "accessToken" in data
}

/** The response of `signInInit`, envelope included. */
export interface MutationSignInInitResponse {
    /** The top-level field, wrapping the standard envelope. */
    signInInit: GraphQLResponse<SignInInitData>
}

/** The challenge and the code the reader typed back. */
export interface SignInVerifyOtpRequest {
    /** The challenge the code belongs to. */
    challengeId: string
    /** The one-time code as the reader typed it. */
    otp: string
}

/**
 * What a verified challenge is worth: an access token, and only that.
 *
 * The back end returns no refresh token in this payload, so nothing downstream may assume
 * one exists - a silent renewal has to come from `refreshToken`, which is its own operation.
 */
export interface SignInSessionData {
    /** Bearer token for the signed-in viewer. */
    accessToken: string
}

/** The response of `signInVerifyOtp`, envelope included. */
export interface MutationSignInVerifyOtpResponse {
    /** The top-level field, wrapping the standard envelope. */
    signInVerifyOtp: GraphQLResponse<SignInSessionData>
}

/** The challenge a fresh code is wanted for. */
export interface SignInResendOtpRequest {
    /** The challenge already open; resending never reopens one. */
    challengeId: string
}

/**
 * The response of `signInResendOtp`, envelope included.
 *
 * It carries a challenge payload rather than an empty envelope because the server answers a
 * resend with a NEW expiry, and a reader who is told the code was resent but not how long the
 * new one lives has been told half of what changed.
 */
export interface MutationSignInResendOtpResponse {
    /** The top-level field, wrapping the standard envelope. */
    signInResendOtp: GraphQLResponse<SignInChallengeData>
}

/*
 * ─── The rest of the auth graph ────────────────────────────────────────────────────────────
 *
 * Everything below was read out of the RUNNING schema by introspection, the same way the
 * sign-in half above was, and it is spelled exactly as the server spells it - including the one
 * place where the server is inconsistent with itself. Nothing here was inferred from the shape
 * of a screen.
 *
 * THE THREE FLOWS ARE ONE JOURNEY WITH THREE ENDINGS. Sign in, sign up and forgot password each
 * open a challenge, put a code in the reader's inbox, and trade that code for something: a
 * session, a session, or a changed password AND a session. Their request types differ only in
 * what the first step needs to know, which is why the shapes below repeat rather than being
 * folded into one: a folded type would have to make `newPassword` optional, and an optional
 * field is a field the compiler stops asking about.
 */

/**
 * What `signUpInit` needs to open an account.
 *
 * ONLY THE CREDENTIALS ARE REQUIRED, and that was read back off the running schema rather than
 * assumed: `SignUpInitRequest` declares `email: String!` and `password: String!` but `username`,
 * `firstName` and `lastName` as plain `String`. Spelling the three optional ones as required here
 * made the compiler demand a profile the server never asks for, which is how a registration form
 * grows three boxes a reader has to fill in before they are allowed to start.
 */
export interface SignUpInitRequest {
    /** The address the account will be registered with, and where the code is sent. */
    email: string
    /** The password the account will have. */
    password: string
    /** The handle the account is known by; the server names the account itself when absent. */
    username?: string
    /** Given name, when the reader offered one. */
    firstName?: string
    /** Family name, when the reader offered one. */
    lastName?: string
}

/** The response of `signUpInit`, envelope included. */
export interface MutationSignUpInitResponse {
    /** The top-level field, wrapping the standard envelope. */
    signUpInit: GraphQLResponse<SignInChallengeData>
}

/**
 * The challenge and the code a registration is confirmed with.
 *
 * Its GraphQL argument type is `SignUpVerifyOtpInput`, not `...Request` - the one place the
 * schema breaks its own naming. The shape is identical to the sign-in step's, and it is
 * declared separately anyway: two operations that happen to agree today are still two
 * operations, and folding them would hide the day one of them changes.
 */
export interface SignUpVerifyOtpRequest {
    /** The challenge the code belongs to. */
    challengeId: string
    /** The one-time code as the reader typed it. */
    otp: string
}

/** The response of `signUpVerifyOtp`, envelope included. A verified registration IS a session. */
export interface MutationSignUpVerifyOtpResponse {
    /** The top-level field, wrapping the standard envelope. */
    signUpVerifyOtp: GraphQLResponse<SignInSessionData>
}

/** The registration challenge a fresh code is wanted for. */
export interface SignUpResendOtpRequest {
    /** The challenge already open; resending never reopens one. */
    challengeId: string
}

/** The response of `signUpResendOtp`, envelope included. */
export interface MutationSignUpResendOtpResponse {
    /** The top-level field, wrapping the standard envelope. */
    signUpResendOtp: GraphQLResponse<SignInChallengeData>
}

/**
 * What `forgotPasswordInit` needs to start a reset.
 *
 * The NEW PASSWORD IS SENT FIRST, before the code exists. That is the server's design and it
 * decides the order of the form: the code authorises a change that has already been described,
 * rather than preceding it.
 */
export interface ForgotPasswordInitRequest {
    /** The address of the account being recovered. */
    email: string
    /** The password that replaces the old one once the code is accepted. */
    newPassword: string
}

/** The response of `forgotPasswordInit`, envelope included. */
export interface MutationForgotPasswordInitResponse {
    /** The top-level field, wrapping the standard envelope. */
    forgotPasswordInit: GraphQLResponse<SignInChallengeData>
}

/** The challenge and the code that authorise a reset. */
export interface ForgotPasswordVerifyOtpRequest {
    /** The challenge the code belongs to. */
    challengeId: string
    /** The one-time code as the reader typed it. */
    otp: string
}

/** The response of `forgotPasswordVerifyOtp`. A completed reset ends SIGNED IN. */
export interface MutationForgotPasswordVerifyOtpResponse {
    /** The top-level field, wrapping the standard envelope. */
    forgotPasswordVerifyOtp: GraphQLResponse<SignInSessionData>
}

/** The reset challenge a fresh code is wanted for. */
export interface ForgotPasswordResendOtpRequest {
    /** The challenge already open. */
    challengeId: string
}

/** The response of `forgotPasswordResendOtp`, envelope included. */
export interface MutationForgotPasswordResendOtpResponse {
    /** The top-level field, wrapping the standard envelope. */
    forgotPasswordResendOtp: GraphQLResponse<SignInChallengeData>
}

/**
 * The identity providers this back end will exchange a code for.
 *
 * A string enum whose members are the schema's own lowercase spellings, because the value
 * travels to the server: a mismatch here is not a type error, it is a rejected sign-in.
 */
export enum KeycloakIdentityProvider {
    /** Google. */
    Google = "google",
    /** GitHub. */
    Github = "github",
}

/** What the last leg of an OAuth sign-in hands the server. */
export interface ExchangeCodeForTokenRequest {
    /** The authorisation code the provider put on the callback address. */
    code: string
    /** Which provider issued it. */
    provider: KeycloakIdentityProvider
    /** The value this app generated before the redirect, echoed back by the provider. */
    state: string
}

/** The response of `exchangeCodeForToken`, envelope included. */
export interface MutationExchangeCodeForTokenResponse {
    /** The top-level field, wrapping the standard envelope. */
    exchangeCodeForToken: GraphQLResponse<SignInSessionData>
}
