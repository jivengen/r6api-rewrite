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
class NoTokenError extends Error {
    constructor(msg) { super(msg  || "no token"); }
}

class MissingHeaderError extends Error {
    constructor(msg) { super(msg || "missing header"); }
}


module.exports = {
    InvalidCredentialsError,
    MissingHeaderError,
    MissingCredentialsError,
    TooManyRequestsError,
    UnknownAuthError,
    NoTokenError
}