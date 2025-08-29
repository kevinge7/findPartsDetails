# -------- Build stage: 用 Maven 打包 WAR --------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
# 让 mvnw 有执行权限（如果仓库里有 mvnw）
RUN chmod +x mvnw || true
# 用 mvnw（或 Maven）打包，跳过测试
RUN ./mvnw -B -DskipTests clean package || mvn -B -DskipTests clean package

# -------- Run stage: 仅带 JRE 运行 WAR --------
FROM eclipse-temurin:21-jre
WORKDIR /app

# 拷贝打包产物（匹配 target 目录下唯一的 .war）
COPY --from=build /app/target/*.war app.war

# Render 会注入 PORT 环境变量，这里给个默认 8080 兼容本地
ENV PORT=8080
# 免费套餐内存紧，限制下 JVM
ENV JAVA_OPTS="-Xms128m -Xmx256m"

EXPOSE 8080
# 用 --server.port 读取 Render 的 PORT
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.war --server.port=${PORT}"]
