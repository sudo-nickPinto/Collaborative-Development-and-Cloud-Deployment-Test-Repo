CREATE TABLE pronob_entries (
  id INT NOT NULL AUTO_INCREMENT,
  message_id INT NOT NULL,
  note VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (message_id) REFERENCES messages(id)
);