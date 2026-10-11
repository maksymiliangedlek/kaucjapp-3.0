package pl.isigmas.kaucjapp.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AvailabilityLimiter {

    private static final int MAX_CHECKS = 30;
    private static final int WINDOW_MINUTES = 15;
    private static final String KEY_PREFIX = "availability_checks:";

    private final StringRedisTemplate redisTemplate;

    public void increment(String clientIp) {
        var key = key(clientIp);
        var current = redisTemplate.opsForValue().increment(key);
        if (current != null && current == 1L) {
            redisTemplate.expire(key, WINDOW_MINUTES, TimeUnit.MINUTES);
        }
    }

    public boolean isBlocked(String clientIp) {
        var current = redisTemplate.opsForValue().get(key(clientIp));
        if (current == null) {
            return false;
        }
        return Integer.parseInt(current) >= MAX_CHECKS;
    }

    public long getRemainingMinutes(String clientIp) {
        Long expireTime = redisTemplate.getExpire(key(clientIp), TimeUnit.MINUTES);
        return (expireTime == null || expireTime < 0) ? 0L : expireTime;
    }

    private static String key(String clientIp) {
        return KEY_PREFIX + clientIp;
    }
}
