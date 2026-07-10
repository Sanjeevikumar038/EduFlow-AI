# 1. Use JDK 17 as base
FROM openjdk:17-jdk-slim

# 2. Install GCC, G++, Python 3, and Maven
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3 \
    maven \
    && rm -rf /var/lib/apt/lists/*

# 3. Create app directory
WORKDIR /app

# 4. Copy source code and build
COPY . .
RUN mvn clean package -DskipTests

# 5. Expose port 8080
EXPOSE 8080

# 6. Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "target/eduflow-backend-0.0.1-SNAPSHOT.jar"]
