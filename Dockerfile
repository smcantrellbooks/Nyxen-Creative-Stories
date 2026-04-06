FROM python:3.11-slim

WORKDIR /app

# Point to the file inside the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else
COPY . .

EXPOSE 8000

# Run the server from the backend folder
CMD ["python", "backend/server.py"]
