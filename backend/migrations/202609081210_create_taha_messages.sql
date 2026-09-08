CREATE TABLE taha_messages (
    id INT NOT NULL AUTO_INCREMENT,
    message_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    message VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_taha_messages_message
        FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE
);
