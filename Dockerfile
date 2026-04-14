FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create necessary directories
RUN mkdir -p media

# Expose port
EXPOSE 8080

# Start the server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
