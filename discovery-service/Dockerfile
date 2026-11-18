FROM eclipse-temurin:17-jre
# curl est utilisé par le healthcheck de docker-compose.yml
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]