package com.microhustle.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigration.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute(
                "DO $$ BEGIN " +
                "  IF EXISTS (SELECT 1 FROM information_schema.columns " +
                "              WHERE table_name='task' AND column_name='description' " +
                "              AND data_type='character varying') THEN " +
                "    ALTER TABLE task ALTER COLUMN description TYPE TEXT; " +
                "  END IF; " +
                "END $$;"
            );
            log.info("Database migration check complete: task.description column ensured as TEXT.");
        } catch (Exception e) {
            log.warn("Database migration warning (non-fatal): {}", e.getMessage());
        }
    }
}
