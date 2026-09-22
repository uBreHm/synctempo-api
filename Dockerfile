FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 synctempo
COPY --from=build /workspace/target/synctempo-api-0.0.1-SNAPSHOT.jar app.jar
USER synctempo
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
