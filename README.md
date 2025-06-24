# Biosignal in FHIR

API em formato RESTful para atender requisições de dados biomédicos no formato FHIR de forma segura, sendo capaz de receber ECGs de longa duração por meio de métodos de streaming.

## Requisitos

- NodeJS [https://nodejs.org/en/](https://nodejs.org/en/)
- MongoDB [https://www.mongodb.com/](https://www.mongodb.com/)
- Python 3.x [https://www.python.org/downloads/](https://www.python.org/downloads/)
- yarn [https://yarnpkg.com/package/download](https://yarnpkg.com/package/download)
- Biblioteca Python biosppy [https://biosppy.readthedocs.io/en/stable/](https://biosppy.readthedocs.io/en/stable/)

## Instalação

1. Faça download deste repositório
2. Instale o pacote yarn do NodeJS

```sh
npm install yarn
yarn install
```

3. Gere as chaves pública e privada dentro de Node_src/utils

```sh
openssl genrsa -out private.key
openssl rsa -in private.key -pubout -out public.key
```

4. Inicialize o servidor

```sh
yarn start
```

5. Visualize o servidor rodando no navegador

```sh
http://localhost:${SERVER_PORT}/
```

## Variáveis de ambiente

| Variável     | Descrição                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| SERVER_PORT   | Porta do servidor.                                                                                         |
| DB_URI        | Endereço de conexão do Mongo.                                                                            |
| DB_NAME       | Nome da database no Mongo.                                                                                 |
| OAUTH_PUB     | Chave pública para verificar tokens, pode ser o caminho relativo ou local.                                |
| OAUTH_PRIVATE | Chave privada para assinar tokens, pode ser o caminho relativo ou local.                                   |
| OAUTH_SECRET  | Segredo de assinatura utilizado para assinar e verificar tokens.                           |
| DEFAULT_URL   | Referência da URL atual do servidor. |

## Rotas

| Rota                              | Método | Descrição                                                                   |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `/well-known/smart-configuration` | GET     | Mostra as configurações para autenticação.                                 |
| `/dashboard`                  | GET     | Exibe a tela inicial da aplicação.                                           |
| `/auth/register`                  | ALL     | Inicia o processo de autenticação.                                           |
| `/auth/login`                     | GET     | Exibe a tela de login.                                                         |
| `/auth/login`                     | POST    | Efetua o login do usuário, sendo paciente ou médico.                         |
| `/auth/authorize`                 | GET     | Exibe a tela das permissões solicitadas pela aplicação.                     |
| `/auth/authorize`                 | POST    | Confirma a autorização da aplicação pelo usuário.                         |
| `/auth/token`                     | POST    | Gera um token com os grant_types: 'authorization_code' e 'client_credentials' |

### Parâmetros de cada rota

#### `/auth/register`

A rota é definida como `POST` e espera os seguintes parâmetros:

| Parâmetro       | O que se espera nele            | Sugestão/Exemplo |
| ------------------ | --------------------------------- | ------------------- |
| `redirect_uri`   | URL de redirecionamento.             | /api-docs         |
| `scope`          | Escopo(s) do usuário.             | patient/*.rs      |
| `token_endpoint` | Rota para obtenção do token.  | /auth/token       |
| `client_id`      | ID do Client fazendo o request. | biosignalinfhir          |
| `aud`            | Não implementado.                           | placeholder       |
| `state`          | Não implementado.                           | placeholder       |

#### `/auth/token`

A rota é definida como `POST` e espera um JSON contendo as informações necessárias, veja exemplos a seguir:

- Usuário

```json
{
  "grant_type": "authorization_code",
  "code": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRpZW50IjoiNjRiMTg0MzJhYzc2MjI4NTUxMWQwNTZjIiwic2NvcGUiOiJwYXRpZW50LyoucnMiLCJpYXQiOjE2OTIxMjUzMTUsImV4cCI6MTY5MjEyNTM3NX0.dk9wGD59nSLmDHUC-tVpiWKUqgcsr4S4OR6442__9NldSx0vLxVnRTQji8rML_Nf_XiLt7UuDmpA9K_2d3dy1KJVAec_SbrZxVhKJ3UgQlp22i7XHaYVt35Mk8LIl1zL_pZy-GJxPXkOS-wme9jKnUnwXkNFeZ1PpBbE14Egj5eUgr4_pjYLnWsuqBvJgFftggcl7OhWd0biLGMCCzsuiIKSsqpCBYssXxbvamV0T7XfgbRAgG_NqXy8IMC8u7Qyjhg7W5BAC2yOzjI0fpGYcEtHQXxzQKVbBLyKYURcooV4hH8stLd7du65h8pvObdUAd73reu4O5Sn7UN9R1HlQQ",
  "redirect_uri": "/api-docs",
  "client_id": "biosignalinfhir"
}
```

- Dispositivo

```json
{
"grant_type": "client_credentials",
"client_id": "id-do-dispositivo",
"client_secret": "secret-do-dispositivo"
}
```

