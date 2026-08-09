import { type GraphQLResponse } from "../../types"

/**
 * The shapes of the sign-in half of the auth graph, spelled exactly as the running back end
 * spells them - every name below was read out of the live schema by introspection, never
 * guessed from the shape of the screen.
 *
 * THE FLOW THESE TYPES DESCRIBE. Signing in is two round trips, not one. `signInInit` takes
 * the credentials and answers with a CHALLENGE - an id and how long it lives - while the code
 * itself goes to the reader's inbox; `signInVerifyOtp` trades that challenge and the code for
 * an access token. `signInResendOtp` sends a fresh code for a challenge already open and
 * answers with a challenge again, which is why it shares the init response type on the wire.
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

/** The response of `signInInit`, envelope included. */
export interface MutationSignInInitResponse {
    /** The top-level field, wrapping the standard envelope. */
    signInInit: GraphQLResponse<SignInChallengeData>
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
