# OrbitaAlerta — App Mobile (React Native + Expo)

Documentação do aplicativo mobile desenvolvido para a **Global Solution**, como dashboard central offline-first da plataforma OrbitaAlerta.

---

## 1. O que é este app?

O **OrbitaAlerta Mobile** é o painel operacional para brigadistas e coordenadores em campo. Ele consome (ou simula, no MVP) dados de:

| Frente do MVP | O que o app mostra |
|---------------|-------------------|
| Ingestão INPE / NASA FIRMS | Alertas com fonte e horário de detecção |
| Validação CV (Sentinel-2 / Sentinel-1) | Confiança do modelo e passagem satelital |
| ML + SHAP | Score de prioridade e fatores explicáveis |
| Operação offline | Cache local, fila de sync e evidência fotográfica |

Enquanto o grupo não entrega as APIs, o app roda com **dados mock realistas** — a troca para produção é feita por variáveis de ambiente.

---

## 2. Como executar

### Pré-requisitos

- Node.js 18+
- npm
- Expo Go no celular **ou** emulador Android

### Passos

```bash
cd Mobile_GS
npm install
cp .env.example .env   # opcional — mock já é o padrão
npm start
```

Escaneie o QR Code com o **Expo Go** (Android/iOS) ou pressione `a` para abrir no emulador Android.

---

## 3. Estrutura do projeto

```
Mobile_GS/
├── app/                      # Telas (Expo Router — file-based routing)
│   ├── (tabs)/
│   │   ├── index.tsx         # Dashboard
│   │   ├── alerts.tsx        # Lista de alertas + filtros
│   │   ├── map.tsx           # Mapa com marcadores
│   │   └── sync.tsx          # Fila offline e sincronização
│   ├── alert/[id].tsx        # Detalhe do alerta (SHAP, clima, CV, IoT)
│   └── field/[id].tsx        # Operação de campo (foto + notas)
├── src/
│   ├── api/                  # Cliente HTTP + endpoints
│   ├── config/               # API_CONFIG (mock vs real)
│   ├── mocks/                # Dados de demonstração
│   ├── services/             # Camada que o app consome
│   ├── storage/              # Cache e fila offline (AsyncStorage)
│   ├── store/                # Estado global (Zustand)
│   ├── types/                # Contratos TypeScript
│   └── hooks/                # Rede, etc.
├── components/               # UI reutilizável
└── docs/
    └── ORBITALERTA_MOBILE.md # Este arquivo
```

---

## 4. Telas e fluxos

### Dashboard (`app/(tabs)/index.tsx`)

- KPIs: alertas ativos, críticos, validados hoje, área monitorada
- Lista das prioridades recentes
- Pull-to-refresh
- Banner quando está offline ou usando cache

### Alertas (`app/(tabs)/alerts.tsx`)

- Lista completa com filtro por prioridade (crítico → baixo)
- Card clicável → detalhe

### Detalhe do alerta (`app/alert/[id].tsx`)

- Score ML e badge de prioridade
- Risco meteorológico (FWI, vento, umidade)
- Validação CV Sentinel
- Telemetria IoT (estação microclimática)
- **Explicabilidade SHAP** (barras por fator)
- Botão → operação de campo

### Mapa (`app/(tabs)/map.tsx`)

- Marcadores coloridos por prioridade
- Localização do usuário (com permissão)
- Pronto para integrar rota offline (backend ou Mapbox Directions)

### Operação de campo (`app/field/[id].tsx`)

- Tirar foto com a câmera
- Notas opcionais
- GPS no momento do registro
- **Offline:** enfileira em `AsyncStorage`
- **Online:** chama `evidenceService.submit`

### Sincronização (`app/(tabs)/sync.tsx`)

- Contagem da fila pendente
- Botão “Sincronizar agora”
- Lista dos itens na fila

---

## 5. Integração com as APIs do grupo

### Passo 1 — Variáveis de ambiente

Crie um arquivo `.env` na raiz (copie de `.env.example`):

```env
EXPO_PUBLIC_API_URL=https://api-do-grupo.com.br
EXPO_PUBLIC_USE_MOCK=false
```

Reinicie o Metro (`npm start`) após alterar o `.env`.

### Passo 2 — Alinhar endpoints

Edite `src/api/endpoints.ts` para bater com as rotas do backend:

| Serviço | Endpoint padrão no app |
|---------|------------------------|
| Dashboard | `GET /api/v1/dashboard/summary` |
| Listar alertas | `GET /api/v1/alerts` |
| Detalhe | `GET /api/v1/alerts/:id` |
| Atualizar status | `PATCH /api/v1/alerts/:id/status` |
| Evidência | `POST /api/v1/field-evidence` |
| Sync em lote | `POST /api/v1/sync/batch` |

### Passo 3 — Contrato de dados (JSON)

O backend deve retornar JSON compatível com os tipos em `src/types/index.ts`. Exemplo resumido de um alerta:

```json
{
  "id": "alert-001",
  "title": "Foco INPE — Zona rural norte",
  "municipality": "Ribeirão Preto",
  "state": "SP",
  "coordinates": { "latitude": -21.1775, "longitude": -47.8103 },
  "detectedAt": "2026-06-01T14:00:00.000Z",
  "updatedAt": "2026-06-01T14:30:00.000Z",
  "source": "INPE",
  "status": "validated",
  "priorityScore": 92,
  "priorityLevel": "critical",
  "shapFactors": [
    { "feature": "fwi", "contribution": 0.34, "description": "FWI elevado" }
  ],
  "weather": {
    "temperatureC": 34,
    "humidityPercent": 22,
    "windSpeedKmh": 18,
    "fireWeatherIndex": 42,
    "riskLabel": "extremo"
  }
}
```

Se o backend usar nomes diferentes, ajuste **apenas** os `services/*.ts` (mapeamento) — não precisa mudar as telas.

### Passo 4 — Autenticação (quando existir)

Em `src/api/client.ts`, passe o token JWT:

```typescript
apiClient.get(path, userToken);
```

Sugestão: criar `src/store/authStore.ts` e um interceptor no `client.ts`.

### Passo 5 — Upload de foto

Em `src/services/evidenceService.ts`, o trecho com `FormData` está preparado. O backend deve aceitar `multipart/form-data` com campos `alertId`, `photo`, `latitude`, `longitude`, `notes`.

---

## 6. Modo offline-first

| Recurso | Implementação |
|---------|----------------|
| Cache de alertas/dashboard | `src/storage/cache.ts` + AsyncStorage |
| Fila de envio | `src/storage/offlineQueue.ts` |
| Detecção de rede | `@react-native-community/netinfo` |
| Sync manual | `src/services/syncService.ts` |

Fluxo:

1. App carrega dados → salva cache.
2. Sem rede → lê cache e exibe banner.
3. Brigadista registra evidência offline → item entra na fila.
4. Com rede → tela Sync envia lote para `POST /api/v1/sync/batch`.

---

## 7. Dados mock (apresentação em sala)

Arquivos em `src/mocks/`:

- `alerts.ts` — 4 alertas (crítico, alto, médio, falso positivo)
- `dashboard.ts` — estatísticas agregadas

Com `EXPO_PUBLIC_USE_MOCK=true` (padrão), nenhuma API externa é necessária para demonstrar o fluxo completo.

---

## 8. Dependências principais

| Pacote | Uso |
|--------|-----|
| expo-router | Navegação por arquivos |
| zustand | Estado global leve |
| async-storage | Persistência offline |
| netinfo | Status da conexão |
| react-native-maps | Mapa operacional |
| expo-location | GPS do brigadista |
| expo-image-picker | Câmera / evidência |

---

## 9. Próximos passos sugeridos (pós-MVP)

1. **Auth** — login para cooperativas / prefeituras.
2. **Push notifications** — alerta crítico em tempo real (Expo Notifications).
3. **Rota offline** — tiles Mapbox ou GeoJSON baixado com o alerta.
4. **Deep link** — `orbitaalerta://alert/alert-001` a partir do painel web.
5. **Testes E2E** — Detox ou Maestro nos fluxos de campo e sync.

---

## 10. Divisão sugerida com o grupo

| Disciplina / frente | Integração no mobile |
|--------------------|----------------------|
| Backend / API | `endpoints.ts` + `services/*` |
| ML + SHAP | Campo `shapFactors` no JSON do alerta |
| Visão computacional | Objeto `cvValidation` |
| IoT | Objeto `iot` |
| Meteorologia | Objeto `weather` |
| Painel web | Mesmos endpoints; mobile é cliente |

---

## 11. Contato e manutenção

Responsável mobile: **Pedro** (Global Solution).

Para dúvidas de integração, compartilhe com o time de backend o arquivo `src/types/index.ts` — ele é o contrato oficial entre front mobile e API.
