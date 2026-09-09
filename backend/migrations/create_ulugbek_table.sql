CREATE TABLE IF NOT EXISTS ulugbek_table (
    id INT NOT NULL AUTO_INCREMENT,
    message_id INT NOT NULL,
    course VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE
);