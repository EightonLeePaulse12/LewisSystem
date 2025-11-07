# Stage 1: Build the app using the SDK image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY . .
RUN dotnet restore "LewisAPI.csproj"  # Replace with your actual .csproj name if different
RUN dotnet publish "LewisAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 2: Create the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080 
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LewisAPI.dll"]  # Replace with your actual DLL name if different