# Modelagem do Banco de Dados — Gview

**Banco:** PostgreSQL  
**ORM:** Prisma  
**Arquivo de referência:** `backend/prisma/schema.prisma`

---

## Entidades

### User
| Campo | Tipo | Restrições |
|---|---|---|
| id | UUID | PK, gerado automaticamente |
| name | String | obrigatório |
| email | String | único, obrigatório |
| passwordHash | String | obrigatório |
| role | Enum (PLAYER, DEVELOPER, ADMIN) | default PLAYER |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | atualizado automaticamente |

### Game
| Campo | Tipo | Restrições |
|---|---|---|
| id | UUID | PK |
| title | String | obrigatório |
| slug | String | único, obrigatório |
| shortDescription | String | obrigatório |
| fullDescription | String | opcional |
| coverUrl | String | opcional |
| trailerUrl | String | opcional |
| demoUrl | String | opcional |
| status | Enum (FEATURED, AVAILABLE, COMING_SOON) | default AVAILABLE |
| genre | String | opcional |
| studioName | String | opcional |
| launchWindow | String | opcional |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | atualizado automaticamente |

### Submission
| Campo | Tipo | Restrições |
|---|---|---|
| id | UUID | PK |
| gameTitle | String | obrigatório |
| projectUrl | String | opcional |
| description | String | obrigatório |
| launchPlans | String | opcional |
| targetPlatforms | String | opcional |
| launchDateRange | String | opcional |
| demoLink | String | opcional |
| nextFestParticipation | Boolean | default false |
| heardAbout | String | opcional |
| additionalInfo | String | opcional |
| contactRole | String | opcional |
| contactEmail | String | obrigatório |
| studioName | String | opcional |
| attachmentUrl | String | opcional |
| reviewStatus | Enum (PENDING, APPROVED, REJECTED) | default PENDING |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | atualizado automaticamente |

### Wishlist
| Campo | Tipo | Restrições |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| gameId | UUID | FK → Game |
| createdAt | DateTime | default now() |

**Constraint:** `@@unique([userId, gameId])` — um usuário não pode adicionar o mesmo jogo duas vezes.

### Review
| Campo | Tipo | Restrições |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| gameId | UUID | FK → Game |
| rating | Int | obrigatório |
| comment | String | opcional |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | atualizado automaticamente |

**Constraint:** `@@unique([userId, gameId])` — um usuário só pode avaliar cada jogo uma vez.

---

## Relacionamentos

```
User 1 ──< Wishlist >── 1 Game
User 1 ──< Review   >── 1 Game
```

- `Wishlist` e `Review` são entidades de junção com `onDelete: Cascade` em ambas as FKs.
- `Submission` não possui FK para `User` nesta sprint (submissão anônima); a vinculação com conta será adicionada na Sprint 2.

---

## Enums

| Enum | Valores |
|---|---|
| Role | PLAYER, DEVELOPER, ADMIN |
| GameStatus | FEATURED, AVAILABLE, COMING_SOON |
| SubmissionStatus | PENDING, APPROVED, REJECTED |
