# Coach AI Backend

Backend Spring Boot avec PostgreSQL pour la plateforme Coach AI.

## Technologies

- Spring Boot 3.2.0
- PostgreSQL
- Spring Security + JWT
- Spring Data JPA
- Lombok

## Configuration

1. Créer une base de données PostgreSQL :
```sql
CREATE DATABASE coach_ai_db;
```

2. Configurer `application.properties` avec vos credentials PostgreSQL

3. Lancer l'application :
```bash
mvn spring-boot:run
```

## Structure du projet

```
backend/
├── src/main/java/com/coachai/
│   ├── model/          # Entités JPA
│   ├── repository/     # Repositories JPA
│   ├── service/        # Services métier
│   ├── controller/     # Controllers REST
│   ├── dto/            # Data Transfer Objects
│   ├── security/       # Configuration sécurité JWT
│   └── config/         # Configurations
└── src/main/resources/
    └── application.properties
```

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription

### Cours
- `GET /api/courses` - Liste des cours
- `GET /api/courses/{id}` - Détails d'un cours

### Chat IA
- `GET /api/chat/conversations` - Liste des conversations
- `GET /api/chat/conversations/{id}/messages` - Messages d'une conversation
- `POST /api/chat/conversations` - Créer une conversation
- `POST /api/chat/conversations/{id}/messages` - Envoyer un message

## Base de données

Les tables sont créées automatiquement au démarrage grâce à `spring.jpa.hibernate.ddl-auto=update`.

## Sécurité

L'authentification utilise JWT. Inclure le token dans le header :
```
Authorization: Bearer <token>
```


