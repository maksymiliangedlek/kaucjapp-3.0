package pl.isigmas.kaucjapp.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.notification.entity.PushToken;

import java.util.List;

public interface PushTokenRepository extends JpaRepository<PushToken, String> {

    List<PushToken> findByUserId(Long userId);

    @Transactional
    @Modifying
    @Query("delete from PushToken t where t.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("delete from PushToken t where t.token = :token and t.userId = :userId")
    int deleteByTokenAndUserId(@Param("token") String token, @Param("userId") Long userId);
}
