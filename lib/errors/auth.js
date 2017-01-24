class InvalidCredentialsError extends Error {
    constructor() { super("invalid credentials"); }
}
class MissingCredentialsError extends Error {
    constructor() { super("missing credentials"); }
}

class TooManyRequestsError extends Error {
    constructor() { super("too many requests"); }
}
class UnknownAuthError extends Error {
    constructor(msg) { super(msg || "unknown auth error"); }
}
module.exports = {
    InvalidCredentialsError,
    MissingCredentialsError,
    TooManyRequestsError,
    UnknownAuthError
}