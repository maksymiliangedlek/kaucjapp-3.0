package pl.isigmas.kaucjapp.notification.service;

/** Expo Push API was unreachable or answered with a transient error (429, 5xx); the send can be retried. */
public class PushDeliveryException extends RuntimeException {

    public PushDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
