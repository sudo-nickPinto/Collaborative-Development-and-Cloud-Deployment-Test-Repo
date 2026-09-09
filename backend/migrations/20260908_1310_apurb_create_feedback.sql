CREATE TABLE apurb_feedback (
    id INT NOT NULL AUTO_INCREMENT,
    message_id INT NOT NULL,
    note VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_apurb_feedback_message
        FOREIGN KEY (message_id) REFERENCES messages(id)
) ENGINE=InnoDB;