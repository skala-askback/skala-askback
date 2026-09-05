  FROM eclipse-temurin:21-jdk AS build
  WORKDIR /app
  COPY gradlew settings.gradle build.gradle ./
  COPY gradle ./gradle
  RUN ./gradlew dependencies --no-daemon || true
  COPY src ./src
  RUN ./gradlew bootJar --no-daemon

  FROM eclipse-temurin:21-jre
  WORKDIR /app
  # docker-compose healthcheck에서 /actuator/health를 호출하기 위한 curl 설치
  RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
  COPY --from=build /app/build/libs/*.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "app.jar"]