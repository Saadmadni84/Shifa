ALTER TABLE visits 
ADD COLUMN audio_data BYTEA,
ADD COLUMN audio_filename VARCHAR(255),
ADD COLUMN audio_content_type VARCHAR(100);
