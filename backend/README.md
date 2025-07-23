# Pre-K Backend

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your MySQL credentials.

3. **Create the MySQL database and table:**
   - Create a database named `pre_k_content` (or your choice).
   - Run the following SQL to create the table:

```sql
CREATE TABLE content_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL,
  downloads INT DEFAULT 0,
  file_url TEXT,
  thumbnail_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

4. **Run the backend:**
   ```bash
   npm run dev
   ```

## API Endpoints
- `GET    /api/content`         — List all content
- `POST   /api/content`         — Create new content (use multipart/form-data for file upload)
- `PUT    /api/content/:id`     — Update content
- `DELETE /api/content/:id`     — Delete content

Uploaded files are served from `/uploads/`. 

## Running the Server

### Development (localhost:3000)
```
npm run dev
```
- Access at: http://localhost:3000

### Local Production (port 80, pre-k-legato.local)
```
sudo npm start
```
- Access at: http://pre-k-legato.local

### Hosts File Setup
To use http://pre-k-legato.local, add this line to your hosts file:
```
127.0.0.1 pre-k-legato.local
```
- On Windows: Edit C:\Windows\System32\drivers\etc\hosts as Administrator
- On Mac/Linux: Edit /etc/hosts with sudo 